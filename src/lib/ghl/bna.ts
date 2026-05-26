/**
 * BNA-specific GHL operations
 * Handles parent and student contact creation, tagging, and billing fields
 */

import {
  upsertContact,
  addTagsToContact,
  updateContactCustomFields,
  getContactsByTag,
  searchContact,
  type GhlContact,
} from './client';

// BNA Custom Field Keys (these should be created in GHL)
export const BNA_CUSTOM_FIELDS = {
  // Contact type
  CONTACT_TYPE: 'contact_type', // 'Parent' or 'Student'
  
  // Billing fields
  PAYMENT_METHOD: 'bna_payment_method', // 'Cash', 'Green Invoice'
  PAYMENT_STATUS: 'bna_payment_status', // 'Pending Payment', 'Pending Cash Payment', 'Paid', 'Payment Failed', 'Payment Unknown'
  SIGNUP_STATUS: 'bna_signup_status', // 'Registered', 'Payment Pending', 'Active', 'Inactive'
  PAID_DATE: 'bna_paid_date', // Date
  NEXT_BILLING_DATE: 'bna_next_billing_date', // Date
  AMOUNT_PAID: 'bna_amount_paid', // Number
  TUITION_AMOUNT: 'bna_tuition_amount', // Number - default 1000
  
  // Student info (on parent contact)
  CHILD_NAME: 'bna_child_name',
  CHILD_AGE: 'bna_child_age',
  CHILD_SCHOOL: 'bna_child_school',
  CHILD_HOBBIES: 'bna_child_hobbies',
  
  // Parent info (on student contact, if separate)
  PARENT_NAME: 'bna_parent_name',
  PARENT_PHONE: 'bna_parent_phone',
  PARENT_EMAIL: 'bna_parent_email',
  
  // Metadata
  REGISTRATION_DATE: 'bna_registration_date',
  REGISTRATION_ID: 'bna_registration_id',
  GREEN_INVOICE_ID: 'bna_green_invoice_id',
  SOURCE: 'bna_source', // 'BNA Registration Form'
} as const;

// BNA Tags
export const BNA_TAGS = {
  PARENT: 'BNA Parent',
  STUDENT: 'BNA Student',
  PAYMENT_PENDING: 'BNA Payment Pending',
  PAYMENT_PAID: 'BNA Paid',
  CASH_PAYMENT: 'BNA Cash Payment',
  GREEN_INVOICE_PAYMENT: 'BNA Green Invoice Payment',
} as const;

// Payment methods
export type PaymentMethod = 'Cash' | 'Green Invoice';

// Payment statuses
export type PaymentStatus = 
  | 'Pending Payment' 
  | 'Pending Cash Payment' 
  | 'Paid' 
  | 'Payment Failed' 
  | 'Payment Unknown';

// Signup statuses
export type SignupStatus = 'Registered' | 'Payment Pending' | 'Active' | 'Inactive';

export interface BnaRegistrationData {
  parent1Name: string;
  parent1Email: string;
  parent1Phone: string;
  parent2Name?: string;
  parent2Email?: string;
  parent2Phone?: string;
  address: string;
  childName: string;
  childAge: number;
  currentSchool?: string;
  hobbies: string;
  paymentMethod: PaymentMethod;
  registrationId?: number;
}

/**
 * Split full name into first and last name
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * Create or update parent contact in GHL
 */
export async function createOrUpdateParent(data: BnaRegistrationData): Promise<{ contact: GhlContact; created: boolean }> {
  const { firstName, lastName } = splitName(data.parent1Name);
  
  const parentContact: GhlContact = {
    firstName,
    lastName,
    email: data.parent1Email,
    phone: data.parent1Phone,
    address1: data.address,
    tags: [BNA_TAGS.PARENT],
  };
  
  // Upsert the contact
  const result = await upsertContact(parentContact);
  
  if (!result.contact.id) {
    throw new Error('Failed to create/update parent contact - no ID returned');
  }
  
  // Add BNA Parent tag
  await addTagsToContact(result.contact.id, [BNA_TAGS.PARENT]);
  
  // Set custom fields
  const customFields: Record<string, any> = {
    [BNA_CUSTOM_FIELDS.CONTACT_TYPE]: 'Parent',
    [BNA_CUSTOM_FIELDS.PAYMENT_METHOD]: data.paymentMethod,
    [BNA_CUSTOM_FIELDS.PAYMENT_STATUS]: data.paymentMethod === 'Cash' ? 'Pending Cash Payment' : 'Pending Payment',
    [BNA_CUSTOM_FIELDS.SIGNUP_STATUS]: 'Payment Pending',
    [BNA_CUSTOM_FIELDS.TUITION_AMOUNT]: 1000,
    [BNA_CUSTOM_FIELDS.CHILD_NAME]: data.childName,
    [BNA_CUSTOM_FIELDS.CHILD_AGE]: data.childAge,
    [BNA_CUSTOM_FIELDS.CHILD_SCHOOL]: data.currentSchool || '',
    [BNA_CUSTOM_FIELDS.CHILD_HOBBIES]: data.hobbies,
    [BNA_CUSTOM_FIELDS.REGISTRATION_DATE]: new Date().toISOString().split('T')[0],
    [BNA_CUSTOM_FIELDS.SOURCE]: 'BNA Registration Form',
  };
  
  if (data.registrationId) {
    customFields[BNA_CUSTOM_FIELDS.REGISTRATION_ID] = String(data.registrationId);
  }
  
  await updateContactCustomFields(result.contact.id, customFields);
  
  return result;
}

/**
 * Create or update student contact in GHL
 * Note: GHL doesn't have native "child of" relationships, so we create a separate contact
 * with parent info and tag it as BNA Student
 */
export async function createOrUpdateStudent(
  data: BnaRegistrationData,
  parentContactId?: string
): Promise<{ contact: GhlContact; created: boolean }> {
  const { firstName, lastName } = splitName(data.childName);
  
  // Use parent's email/phone for the student contact (since students don't have their own)
  const studentContact: GhlContact = {
    firstName,
    lastName,
    email: data.parent1Email, // Use parent's email
    phone: data.parent1Phone, // Use parent's phone
    tags: [BNA_TAGS.STUDENT],
  };
  
  // Upsert the contact
  const result = await upsertContact(studentContact);
  
  if (!result.contact.id) {
    throw new Error('Failed to create/update student contact - no ID returned');
  }
  
  // Add BNA Student tag
  await addTagsToContact(result.contact.id, [BNA_TAGS.STUDENT]);
  
  // Set custom fields
  const customFields: Record<string, any> = {
    [BNA_CUSTOM_FIELDS.CONTACT_TYPE]: 'Student',
    [BNA_CUSTOM_FIELDS.CHILD_NAME]: data.childName,
    [BNA_CUSTOM_FIELDS.CHILD_AGE]: data.childAge,
    [BNA_CUSTOM_FIELDS.CHILD_SCHOOL]: data.currentSchool || '',
    [BNA_CUSTOM_FIELDS.CHILD_HOBBIES]: data.hobbies,
    [BNA_CUSTOM_FIELDS.PARENT_NAME]: data.parent1Name,
    [BNA_CUSTOM_FIELDS.PARENT_PHONE]: data.parent1Phone,
    [BNA_CUSTOM_FIELDS.PARENT_EMAIL]: data.parent1Email,
    [BNA_CUSTOM_FIELDS.REGISTRATION_DATE]: new Date().toISOString().split('T')[0],
    [BNA_CUSTOM_FIELDS.SOURCE]: 'BNA Registration Form',
  };
  
  if (data.registrationId) {
    customFields[BNA_CUSTOM_FIELDS.REGISTRATION_ID] = String(data.registrationId);
  }
  
  await updateContactCustomFields(result.contact.id, customFields);
  
  return result;
}

/**
 * Process a complete BNA registration - creates both parent and student
 */
export async function processBnaRegistration(data: BnaRegistrationData): Promise<{
  parent: { contact: GhlContact; created: boolean };
  student: { contact: GhlContact; created: boolean };
}> {
  // Create/update parent first
  const parentResult = await createOrUpdateParent(data);
  
  // Create/update student
  const studentResult = await createOrUpdateStudent(data, parentResult.contact.id);
  
  return {
    parent: parentResult,
    student: studentResult,
  };
}

/**
 * Mark a contact as paid
 */
export async function markContactAsPaid(
  contactId: string,
  options: {
    amount?: number;
    paymentMethod?: PaymentMethod;
    paidDate?: string;
    greenInvoiceId?: string;
  } = {}
): Promise<void> {
  const amount = options.amount || 1000;
  const paymentMethod = options.paymentMethod || 'Cash';
  const paidDate = options.paidDate || new Date().toISOString().split('T')[0];
  
  // Calculate next billing date (30 days from paid date)
  const nextBillingDate = new Date(paidDate);
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);
  
  const customFields: Record<string, any> = {
    [BNA_CUSTOM_FIELDS.PAYMENT_STATUS]: 'Paid',
    [BNA_CUSTOM_FIELDS.SIGNUP_STATUS]: 'Active',
    [BNA_CUSTOM_FIELDS.PAID_DATE]: paidDate,
    [BNA_CUSTOM_FIELDS.NEXT_BILLING_DATE]: nextBillingDate.toISOString().split('T')[0],
    [BNA_CUSTOM_FIELDS.AMOUNT_PAID]: amount,
    [BNA_CUSTOM_FIELDS.PAYMENT_METHOD]: paymentMethod,
  };
  
  if (options.greenInvoiceId) {
    customFields[BNA_CUSTOM_FIELDS.GREEN_INVOICE_ID] = options.greenInvoiceId;
  }
  
  await updateContactCustomFields(contactId, customFields);
  
  // Update tags
  const tagsToAdd = [BNA_TAGS.PAYMENT_PAID];
  const tagsToRemove = [BNA_TAGS.PAYMENT_PENDING];
  
  if (paymentMethod === 'Cash') {
    tagsToAdd.push(BNA_TAGS.CASH_PAYMENT);
  } else {
    tagsToAdd.push(BNA_TAGS.GREEN_INVOICE_PAYMENT);
  }
  
  await addTagsToContact(contactId, tagsToAdd);
}

/**
 * Find a BNA contact by name, email, or phone
 */
export async function findBnaContact(query: string): Promise<GhlContact | null> {
  // Try email first
  if (query.includes('@')) {
    return searchContact(query, undefined);
  }
  
  // Try phone (if mostly digits)
  if (/^[\d\s\-+()]+$/.test(query)) {
    return searchContact(undefined, query);
  }
  
  // Otherwise search by name in BNA contacts
  const parents = await getContactsByTag(BNA_TAGS.PARENT);
  const students = await getContactsByTag(BNA_TAGS.STUDENT);
  const allBna = [...parents, ...students];
  
  const lowerQuery = query.toLowerCase();
  return allBna.find(c => 
    (c.firstName?.toLowerCase() + ' ' + c.lastName?.toLowerCase()).includes(lowerQuery) ||
    c.firstName?.toLowerCase().includes(lowerQuery) ||
    c.lastName?.toLowerCase().includes(lowerQuery)
  ) || null;
}

/**
 * Get all BNA parents
 */
export async function getBnaParents(): Promise<GhlContact[]> {
  return getContactsByTag(BNA_TAGS.PARENT);
}

/**
 * Get all BNA students
 */
export async function getBnaStudents(): Promise<GhlContact[]> {
  return getContactsByTag(BNA_TAGS.STUDENT);
}

/**
 * Get BNA contacts by payment status
 */
export async function getBnaContactsByPaymentStatus(status: PaymentStatus): Promise<GhlContact[]> {
  const parents = await getContactsByTag(BNA_TAGS.PARENT);
  // Filter by custom field would require fetching each contact individually
  // For now, return all and filter in memory if needed
  return parents;
}
