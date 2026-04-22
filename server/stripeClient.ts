import Stripe from 'stripe';

let connectionSettings: any;

async function getCredentials() {
  // Try Replit connector service first
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
      ? 'repl ' + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
        ? 'depl ' + process.env.WEB_REPL_RENEWAL
        : null;

    if (hostname && xReplitToken) {
      const connectorName = 'stripe';
      const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
      const targetEnvironment = isProduction ? 'production' : 'development';

      const url = new URL(`https://${hostname}/api/v2/connection`);
      url.searchParams.set('include_secrets', 'true');
      url.searchParams.set('connector_names', connectorName);
      url.searchParams.set('environment', targetEnvironment);

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      });

      const data = await response.json();
      connectionSettings = data.items?.[0];

      if (connectionSettings?.settings?.publishable && connectionSettings?.settings?.secret) {
        return {
          publishableKey: connectionSettings.settings.publishable,
          secretKey: connectionSettings.settings.secret,
        };
      }
    }
  } catch (_) {
    // Fall through to env var fallback
  }

  // Fallback: use STRIPE_SECRET_KEY environment variable directly
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (secretKey) {
    return {
      publishableKey: '',
      secretKey,
    };
  }

  throw new Error('Stripe credentials not found — configure STRIPE_SECRET_KEY or the Replit Stripe connector');
}

// Get uncached Stripe client for API operations
export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();

  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

// Get publishable key for frontend
export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

// Get secret key for backend operations
export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

// StripeSync singleton for webhook processing and data sync
let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
