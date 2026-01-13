import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

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
          });
          
          // If starting a trial, record the phone numbers as used in trial
          if (isTrialing) {
            const userPhones = await storage.getPhoneNumbersByUser(userId);
            for (const phone of userPhones) {
              await storage.recordTrialPhoneNumber(phone.phoneNumber, userId);
            }
            console.log(`User ${userId} trial started, recorded ${userPhones.length} phone number(s)`);
          }
          
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
          // Clear all subscription data so user loses access and can re-subscribe
          await storage.updateUser(user.id, {
            subscriptionStatus: 'none',
            stripeSubscriptionId: null,
            trialEndsAt: null,
          });
          console.log(`User ${user.id} subscription deleted - access revoked`);
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
}
