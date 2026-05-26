/**
 * Script to retroactively sync existing signups to GHL
 * Usage: node scripts/sync-signups-to-ghl.mjs
 */

import { Pool } from 'pg';
import fs from 'fs';

function parseEnvBlock(rawValue) {
  if (!rawValue) return {};

  return rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex <= 0) return acc;
      acc[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1).trim();
      return acc;
    }, {});
}

function loadEnvBlockFile(filePath) {
  try {
    return parseEnvBlock(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

const localGhlSecrets = loadEnvBlockFile(new URL('../.secrets/ghl-pit-token.txt', import.meta.url));
const inlineGhlSecrets = parseEnvBlock(process.env.GHL_PIT_TOKEN || '');

function pickRawValue(envValue, inlineValue, fileValue) {
  if (envValue && !envValue.includes('\n') && !envValue.startsWith('GHL_PIT_TOKEN=')) {
    return envValue.trim();
  }
  return inlineValue || fileValue || '';
}

const GHL_PIT_TOKEN = pickRawValue(
  process.env.GHL_PIT_TOKEN,
  inlineGhlSecrets.GHL_PIT_TOKEN,
  localGhlSecrets.GHL_PIT_TOKEN
);
const GHL_LOCATION_ID =
  process.env.GHL_LOCATION_ID ||
  inlineGhlSecrets.GHL_LOCATION_ID ||
  localGhlSecrets.GHL_LOCATION_ID ||
  'IIofSrquLHvNxc8zrpka';
const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function ghlRequest(endpoint, options = {}) {
  const url = `${GHL_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GHL_PIT_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Version': GHL_API_VERSION,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GHL API error ${response.status}: ${errorText}`);
  }
  
  if (response.status === 204) return null;
  return response.json();
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

async function searchGhlContact(email, phone) {
  const searches = [];
  if (email) searches.push({ query: email, type: 'email' });
  if (phone) {
    searches.push({ query: phone, type: 'phone' });
    searches.push({ query: phone.replace(/\D/g, ''), type: 'phone' });
  }

  for (const search of searches) {
    if (!search.query) continue;

    try {
      const result = await ghlRequest(
        `/contacts/?locationId=${encodeURIComponent(GHL_LOCATION_ID)}&query=${encodeURIComponent(search.query)}&limit=20`
      );
      const contacts = result?.contacts || [];

      if (search.type === 'email') {
        const exactEmail = contacts.find(
          (contact) => (contact.email || '').toLowerCase() === email.toLowerCase()
        );
        if (exactEmail) return exactEmail;
      }

      if (search.type === 'phone') {
        const exactPhone = contacts.find((contact) => {
          const digits = (contact.phone || '').replace(/\D/g, '');
          return digits && digits === phone.replace(/\D/g, '');
        });
        if (exactPhone) return exactPhone;
      }

      if (contacts.length > 0) return contacts[0];
    } catch (err) {
      console.log(`${search.type} lookup failed:`, err.message);
    }
  }

  return null;
}

async function createGhlContact(contactData) {
  const result = await ghlRequest('/contacts/', {
    method: 'POST',
    body: JSON.stringify({
      ...contactData,
      locationId: GHL_LOCATION_ID,
    }),
  });
  return result?.contact;
}

async function updateGhlContact(contactId, contactData) {
  const result = await ghlRequest(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(contactData),
  });
  return result?.contact;
}

async function addGhlTags(contactId, tags) {
  await ghlRequest(`/contacts/${contactId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags }),
  });
}

async function getCustomFields() {
  try {
    const result = await ghlRequest(`/locations/${GHL_LOCATION_ID}/customFields`);
    const fieldMap = {};
    for (const field of result.customFields || []) {
      fieldMap[field.fieldKey] = field.id;
      fieldMap[field.name.toLowerCase()] = field.id;
    }
    return fieldMap;
  } catch (err) {
    console.error('Failed to fetch custom fields:', err.message);
    return {};
  }
}

async function syncSignupToGHL(signup, fieldMap) {
  console.log(`\n--- Processing signup #${signup.id}: ${signup.child_name} ---`);
  
  // Determine payment status text
  let paymentStatusText = 'Pending Payment';
  let signupStatusText = 'Payment Pending';
  
  if (signup.payment_status === 'paid') {
    paymentStatusText = 'Paid';
    signupStatusText = 'Active';
  } else if (signup.payment_method === 'Cash') {
    paymentStatusText = 'Pending Cash Payment';
  }
  
  // Create/Update Parent Contact
  const { firstName, lastName } = splitName(signup.parent1_name);
  
  const parentContactData = {
    firstName,
    lastName,
    email: signup.parent1_email,
    phone: signup.parent1_phone,
    address1: signup.address,
  };
  
  console.log('Searching for existing parent contact...');
  let parentContact = await searchGhlContact(signup.parent1_email, signup.parent1_phone);
  
  if (parentContact?.id) {
    console.log(`Found existing parent: ${parentContact.id}`);
    await updateGhlContact(parentContact.id, parentContactData);
  } else {
    console.log('Creating new parent contact...');
    parentContact = await createGhlContact(parentContactData);
  }
  
  if (!parentContact?.id) {
    console.error('Failed to create/update parent contact');
    return null;
  }
  
  console.log(`Parent contact ID: ${parentContact.id}`);
  
  // Add tags
  await addGhlTags(parentContact.id, ['BNA Parent']);
  if (signup.payment_status === 'paid') {
    await addGhlTags(parentContact.id, ['BNA Paid']);
  }
  
  // Build custom fields
  const customFields = [
    { id: fieldMap['contact_type'], value: 'Parent' },
    { id: fieldMap['bna_payment_method'], value: signup.payment_method || 'Green Invoice' },
    { id: fieldMap['bna_payment_status'], value: paymentStatusText },
    { id: fieldMap['bna_signup_status'], value: signupStatusText },
    { id: fieldMap['bna_tuition_amount'], value: 1000 },
    { id: fieldMap['bna_child_name'], value: signup.child_name },
    { id: fieldMap['bna_child_age'], value: signup.child_age },
    { id: fieldMap['bna_child_school'], value: signup.current_school || '' },
    { id: fieldMap['bna_child_hobbies'], value: signup.hobbies },
    { id: fieldMap['bna_registration_date'], value: new Date(signup.submitted_at).toISOString().split('T')[0] },
    { id: fieldMap['bna_registration_id'], value: String(signup.id) },
    { id: fieldMap['bna_source'], value: 'BNA Registration Form' },
  ];
  
  // Add paid fields if applicable
  if (signup.payment_status === 'paid' && signup.paid_at) {
    const paidDate = new Date(signup.paid_at).toISOString().split('T')[0];
    const nextBillingDate = new Date(signup.paid_at);
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);
    
    customFields.push({ id: fieldMap['bna_paid_date'], value: paidDate });
    customFields.push({ id: fieldMap['bna_next_billing_date'], value: nextBillingDate.toISOString().split('T')[0] });
    customFields.push({ id: fieldMap['bna_amount_paid'], value: 1000 });
  }
  
  // Filter out undefined field IDs
  const validFields = customFields.filter(f => f.id);
  
  if (validFields.length > 0) {
    console.log(`Updating ${validFields.length} custom fields...`);
    await ghlRequest(`/contacts/${parentContact.id}`, {
      method: 'PUT',
      body: JSON.stringify({ customFields: validFields }),
    });
  }
  
  // Create/Update Student Contact
  const { firstName: childFirst, lastName: childLast } = splitName(signup.child_name);
  
  const studentContactData = {
    firstName: childFirst,
    lastName: childLast,
    email: signup.parent1_email,
    phone: signup.parent1_phone,
  };
  
  console.log('Searching for existing student contact...');
  let studentContact = await searchGhlContact(signup.parent1_email, null);
  
  // Check if found contact has same name
  if (studentContact && (studentContact.firstName !== childFirst || studentContact.lastName !== childLast)) {
    // Different person, create new
    studentContact = null;
  }
  
  if (studentContact?.id) {
    console.log(`Found existing student: ${studentContact.id}`);
    await updateGhlContact(studentContact.id, studentContactData);
  } else {
    console.log('Creating new student contact...');
    studentContact = await createGhlContact(studentContactData);
  }
  
  if (studentContact?.id) {
    console.log(`Student contact ID: ${studentContact.id}`);
    await addGhlTags(studentContact.id, ['BNA Student']);
    
    const studentFields = [
      { id: fieldMap['contact_type'], value: 'Student' },
      { id: fieldMap['bna_child_name'], value: signup.child_name },
      { id: fieldMap['bna_child_age'], value: signup.child_age },
      { id: fieldMap['bna_child_school'], value: signup.current_school || '' },
      { id: fieldMap['bna_child_hobbies'], value: signup.hobbies },
      { id: fieldMap['bna_parent_name'], value: signup.parent1_name },
      { id: fieldMap['bna_parent_phone'], value: signup.parent1_phone },
      { id: fieldMap['bna_parent_email'], value: signup.parent1_email },
      { id: fieldMap['bna_registration_date'], value: new Date(signup.submitted_at).toISOString().split('T')[0] },
      { id: fieldMap['bna_registration_id'], value: String(signup.id) },
      { id: fieldMap['bna_source'], value: 'BNA Registration Form' },
    ].filter(f => f.id);
    
    if (studentFields.length > 0) {
      await ghlRequest(`/contacts/${studentContact.id}`, {
        method: 'PUT',
        body: JSON.stringify({ customFields: studentFields }),
      });
    }
  }
  
  // Update database with GHL IDs
  await pool.query(
    'UPDATE signups SET ghl_parent_contact_id = $1, ghl_student_contact_id = $2 WHERE id = $3',
    [parentContact.id, studentContact?.id || null, signup.id]
  );
  
  console.log(`✅ Synced signup #${signup.id} to GHL`);
  
  return {
    parentId: parentContact.id,
    studentId: studentContact?.id,
  };
}

async function main() {
  console.log('=== BNA Signups to GHL Sync ===\n');
  
  try {
    // Get custom fields
    console.log('Fetching GHL custom fields...');
    const fieldMap = await getCustomFields();
    console.log(`Found ${Object.keys(fieldMap).length} custom fields\n`);
    
    // Get all signups
    const result = await pool.query('SELECT * FROM signups ORDER BY id');
    const signups = result.rows;
    
    console.log(`Found ${signups.length} signups to sync\n`);
    
    for (const signup of signups) {
      try {
        await syncSignupToGHL(signup, fieldMap);
      } catch (err) {
        console.error(`❌ Failed to sync signup #${signup.id}:`, err.message);
      }
    }
    
    console.log('\n=== Sync Complete ===');
  } catch (err) {
    console.error('Sync failed:', err);
  } finally {
    await pool.end();
  }
}

main();
