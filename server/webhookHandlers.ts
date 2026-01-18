import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { voitexService } from './voitexService';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    // Validate payload is a Buffer
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    
    // Process the webhook with stripe-replit-sync
    // This validates the signature and syncs data to stripe schema
    await sync.processWebhook(payload, signature);
    
    // After successful validation by stripe-replit-sync, handle custom business logic
    // Parse the event - this is safe since sync.processWebhook validated the signature
    let event: any;
    try {
      event = JSON.parse(payload.toString());
    } catch (err) {
      console.error('Failed to parse webhook payload:', err);
      return;
    }
    
    try {
      await WebhookHandlers.handleEvent(event);
    } catch (err) {
      // Log but don't fail - stripe-replit-sync already synced the data
      console.error('Custom webhook handler error:', err);
    }
  }
  
  private static async handleEvent(event: any): Promise<void> {
    const stripe = await getUncachableStripeClient();
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        
        if (userId && customerId && subscriptionId) {
          // Get subscription details to check trial status
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const isTrialing = subscription.status === 'trialing';
          const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
          
          await storage.updateUser(userId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: isTrialing ? 'trial' : 'active',
            trialEndsAt: trialEnd,
            hasUsedTrial: isTrialing ? true : undefined, // Mark trial as used if starting one
          });
          
          // If starting a trial, record the phone numbers as used in trial
          if (isTrialing) {
            const userPhones = await storage.getPhoneNumbersByUser(userId);
            for (const phone of userPhones) {
              await storage.recordTrialPhoneNumber(phone.phoneNumber, userId);
            }
            console.log(`User ${userId} trial started, recorded ${userPhones.length} phone number(s)`);
          }
          
          // Sync user's phone numbers to Voitex
          await WebhookHandlers.syncUserToVoitex(userId);
          
          console.log(`User ${userId} subscription: ${isTrialing ? 'trial' : 'active'}`);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const user = await storage.getUserByStripeCustomerId(customerId);
        if (user) {
          // If subscription is being cancelled (cancel_at_period_end = true) and user is in trial, cancel immediately
          if (subscription.cancel_at_period_end && subscription.status === 'trialing') {
            try {
              await stripe.subscriptions.cancel(subscription.id);
              console.log(`User ${user.id} trial cancelled immediately`);
              // The cancel will trigger customer.subscription.deleted which updates the user status
              return;
            } catch (err) {
              console.error('Failed to cancel trial immediately:', err);
            }
          }
          
          const statusMap: Record<string, string> = {
            active: 'active',
            trialing: 'trial',
            past_due: 'past_due',
            canceled: 'cancelled',
            unpaid: 'cancelled',
          };
          const status = statusMap[subscription.status] || 'none';
          const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
          
          await storage.updateUser(user.id, {
            subscriptionStatus: status,
            trialEndsAt: trialEnd,
          });
          console.log(`User ${user.id} subscription updated: ${status}`);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const user = await storage.getUserByStripeCustomerId(customerId);
        if (user) {
          // Remove user's phone numbers from Voitex immediately
          await WebhookHandlers.removeUserFromVoitex(user.id);
          
          // Clear all subscription data so user loses access and can re-subscribe
          // Also mark hasUsedTrial = true so they don't get another trial
          await storage.updateUser(user.id, {
            subscriptionStatus: 'none',
            stripeSubscriptionId: null,
            trialEndsAt: null,
            hasUsedTrial: true,
          });
          console.log(`User ${user.id} subscription deleted - access revoked, trial used`);
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        
        const user = await storage.getUserByStripeCustomerId(customerId);
        if (user) {
          await storage.updateUser(user.id, {
            subscriptionStatus: 'past_due',
          });
          console.log(`User ${user.id} payment failed`);
        }
        break;
      }
    }
  }
  
  static async syncUserToVoitex(userId: string): Promise<{ success: boolean; synced: number; failed: number; errors: string[] }> {
    if (!voitexService.isConfigured()) {
      console.log('[Voitex] Service not configured, skipping sync');
      return { success: true, synced: 0, failed: 0, errors: ['Service not configured'] };
    }
    
    const result = { success: true, synced: 0, failed: 0, errors: [] as string[] };
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`[Voitex] User ${userId} not found, skipping sync`);
        return { success: false, synced: 0, failed: 0, errors: ['User not found'] };
      }
      
      const phoneNumbers = await storage.getPhoneNumbersByUser(userId);
      if (phoneNumbers.length === 0) {
        console.log(`[Voitex] User ${userId} has no phone numbers, skipping sync`);
        return { success: true, synced: 0, failed: 0, errors: [] };
      }
      
      // Parse name from familyName field if available
      const nameParts = user.familyName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create/update a contact for each phone number
      for (const phone of phoneNumbers) {
        const apiResult = await voitexService.createOrUpdateContact({
          phone: phone.phoneNumber, // Service will clean and validate
          firstName,
          lastName,
          email: user.email,
          phoneType: 'M', // Assume mobile for app users
        });
        
        if (apiResult.status === 'success') {
          result.synced++;
        } else {
          result.failed++;
          result.errors.push(`${phone.phoneNumber}: ${apiResult.errors?.join(', ') || 'Unknown error'}`);
        }
      }
      
      result.success = result.failed === 0;
      console.log(`[Voitex] Synced ${result.synced}/${phoneNumbers.length} phone(s) for user ${userId}`);
      return result;
    } catch (error: any) {
      console.error(`[Voitex] Failed to sync user ${userId}:`, error);
      return { success: false, synced: 0, failed: 1, errors: [error.message || 'Unknown error'] };
    }
  }
  
  static async removeUserFromVoitex(userId: string): Promise<{ success: boolean; removed: number; failed: number }> {
    if (!voitexService.isConfigured()) {
      console.log('[Voitex] Service not configured, skipping removal');
      return { success: true, removed: 0, failed: 0 };
    }
    
    const result = { success: true, removed: 0, failed: 0 };
    
    try {
      const phoneNumbers = await storage.getPhoneNumbersByUser(userId);
      if (phoneNumbers.length === 0) {
        console.log(`[Voitex] User ${userId} has no phone numbers, nothing to remove`);
        return result;
      }
      
      // Delete contact for each phone number
      for (const phone of phoneNumbers) {
        const apiResult = await voitexService.deleteContact(phone.phoneNumber);
        if (apiResult.status === 'success') {
          result.removed++;
        } else {
          result.failed++;
        }
      }
      
      result.success = result.failed === 0;
      console.log(`[Voitex] Removed ${result.removed}/${phoneNumbers.length} contact(s) for user ${userId}`);
      return result;
    } catch (error: any) {
      console.error(`[Voitex] Failed to remove user ${userId} from Voitex:`, error);
      return { success: false, removed: 0, failed: 1 };
    }
  }
}
