/**
 * GoHighLevel (GHL) API Client for BNA
 * Uses Private Integration Token (PIT) for authentication
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const LOCATION_ID = process.env.GHL_LOCATION_ID || 'IIofSrquLHvNxc8zrpka';

function parseEnvBlock(rawValue?: string): Record<string, string> {
  if (!rawValue) return {};

  return rawValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex <= 0) return acc;
      acc[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1).trim();
      return acc;
    }, {});
}

// Get token from environment
function getGhlToken(): string {
  const rawToken = process.env.GHL_PIT_TOKEN;
  const parsed = parseEnvBlock(rawToken);
  const token =
    rawToken && !rawToken.includes('\n') && !rawToken.startsWith('GHL_PIT_TOKEN=')
      ? rawToken.trim()
      : parsed.GHL_PIT_TOKEN;

  if (token) return token;

  throw new Error('GHL_PIT_TOKEN not configured');
}

interface GhlContact {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Array<{ id: string; value: any }>;
  [key: string]: any;
}

interface GhlCustomField {
  id: string;
  name: string;
  fieldKey: string;
}

// Cache for custom field IDs
let customFieldsCache: Map<string, string> | null = null;

async function ghlRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${GHL_API_BASE}${endpoint}`;
  const token = getGhlToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
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
  
  // Some endpoints return 204 No Content
  if (response.status === 204) return null;
  
  return response.json();
}

/**
 * Get or cache custom field IDs by field key
 */
export async function getCustomFieldId(fieldKey: string): Promise<string | null> {
  if (!customFieldsCache) {
    customFieldsCache = new Map();
    try {
      const fields = await ghlRequest(`/locations/${LOCATION_ID}/customFields`) as { customFields: GhlCustomField[] };
      for (const field of fields.customFields || []) {
        customFieldsCache.set(field.fieldKey, field.id);
        customFieldsCache.set(field.name.toLowerCase(), field.id);
      }
    } catch (err) {
      console.error('Failed to fetch GHL custom fields:', err);
    }
  }
  return customFieldsCache.get(fieldKey) || null;
}

/**
 * Search for a contact by email or phone
 */
export async function searchContact(email?: string, phone?: string): Promise<GhlContact | null> {
  if (!email && !phone) return null;
  
  // Try email first
  if (email) {
    try {
      const result = await ghlRequest(`/contacts/?locationId=${encodeURIComponent(LOCATION_ID)}&query=${encodeURIComponent(email)}&limit=20`);
      const exactEmail = (result?.contacts || []).find(
        (contact: GhlContact) => (contact.email || '').toLowerCase() === email.toLowerCase()
      );
      if (exactEmail) return exactEmail;
      if (result?.contacts?.length > 0) return result.contacts[0];
    } catch (err) {
      console.log('GHL email lookup failed:', err);
    }
  }
  
  // Try phone
  if (phone) {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const result = await ghlRequest(`/contacts/?locationId=${encodeURIComponent(LOCATION_ID)}&query=${encodeURIComponent(cleanPhone)}&limit=20`);
      const exactPhone = (result?.contacts || []).find((contact: GhlContact) => {
        const digits = (contact.phone || '').replace(/\D/g, '');
        return digits && digits === cleanPhone;
      });
      if (exactPhone) return exactPhone;
      if (result?.contacts?.length > 0) return result.contacts[0];
    } catch (err) {
      console.log('GHL phone lookup failed:', err);
    }
  }
  
  return null;
}

/**
 * Create a new contact in GHL
 */
export async function createContact(contact: GhlContact): Promise<GhlContact> {
  const result = await ghlRequest('/contacts/', {
    method: 'POST',
    body: JSON.stringify({
      ...contact,
      locationId: LOCATION_ID,
    }),
  });
  return result.contact;
}

/**
 * Update an existing contact
 */
export async function updateContact(contactId: string, contact: Partial<GhlContact>): Promise<GhlContact> {
  const result = await ghlRequest(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(contact),
  });
  return result.contact;
}

/**
 * Create or update a contact (upsert)
 */
export async function upsertContact(contact: GhlContact): Promise<{ contact: GhlContact; created: boolean }> {
  const existing = await searchContact(contact.email, contact.phone);
  
  if (existing?.id) {
    const updated = await updateContact(existing.id, contact);
    return { contact: updated, created: false };
  }
  
  const created = await createContact(contact);
  return { contact: created, created: true };
}

/**
 * Add tags to a contact
 */
export async function addTagsToContact(contactId: string, tags: string[]): Promise<void> {
  await ghlRequest(`/contacts/${contactId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags }),
  });
}

/**
 * Remove tags from a contact
 */
export async function removeTagsFromContact(contactId: string, tags: string[]): Promise<void> {
  await ghlRequest(`/contacts/${contactId}/tags`, {
    method: 'DELETE',
    body: JSON.stringify({ tags }),
  });
}

/**
 * Update custom fields for a contact
 */
export async function updateContactCustomFields(contactId: string, fields: Record<string, any>): Promise<void> {
  const customFields: Array<{ id: string; value: any }> = [];
  
  for (const [key, value] of Object.entries(fields)) {
    const fieldId = await getCustomFieldId(key);
    if (fieldId) {
      customFields.push({ id: fieldId, value });
    } else {
      console.warn(`GHL custom field not found: ${key}`);
    }
  }
  
  if (customFields.length > 0) {
    await ghlRequest(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify({ customFields }),
    });
  }
}

/**
 * Get contacts by tag
 */
export async function getContactsByTag(tag: string): Promise<GhlContact[]> {
  try {
    const result = await ghlRequest(`/contacts/?tags=${encodeURIComponent(tag)}&limit=100`);
    return result.contacts || [];
  } catch (err) {
    console.error(`Failed to get contacts by tag ${tag}:`, err);
    return [];
  }
}

/**
 * Get a single contact by ID
 */
export async function getContact(contactId: string): Promise<GhlContact | null> {
  try {
    const result = await ghlRequest(`/contacts/${contactId}`);
    return result.contact;
  } catch (err) {
    console.error(`Failed to get contact ${contactId}:`, err);
    return null;
  }
}

// Export types
export type { GhlContact };
