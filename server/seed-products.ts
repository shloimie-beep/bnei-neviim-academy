// Seed script to create the Kids' Hotline subscription product in Stripe
// Run with: npx tsx server/seed-products.ts

import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  console.log('Creating Kids\' Hotline subscription product in Stripe...');
  
  const stripe = await getUncachableStripeClient();

  // Check if product already exists
  const existingProducts = await stripe.products.search({
    query: "name:'Kids\\' Hotline Monthly'",
  });

  if (existingProducts.data.length > 0) {
    console.log('Product already exists:', existingProducts.data[0].id);
    
    // Check for existing price
    const existingPrices = await stripe.prices.list({
      product: existingProducts.data[0].id,
      active: true,
    });
    
    if (existingPrices.data.length > 0) {
      console.log('Price already exists:', existingPrices.data[0].id);
      console.log('\nProduct setup complete!');
      console.log('Price ID for checkout:', existingPrices.data[0].id);
      return;
    }
  }

  // Create the product
  const product = await stripe.products.create({
    name: "Kids' Hotline Monthly",
    description: "Unlimited access to stories and moderated group calls for children. Includes 2-week free trial.",
    metadata: {
      type: 'subscription',
      trial_days: '14',
    },
  });

  console.log('Created product:', product.id);

  // Create the monthly price with trial
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999, // $9.99
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      display_name: 'Monthly Subscription',
    },
  });

  console.log('Created price:', price.id);
  console.log('\nProduct setup complete!');
  console.log('Use this price ID for checkout:', price.id);
}

seedProducts().catch(console.error);
