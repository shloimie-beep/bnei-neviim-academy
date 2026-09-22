const { contextScopeFields } = require('../core/context');
const { cleanString, normalizeEmail, normalizeKey, normalizePhone, stableId } = require('../core/ids');
const { fail, ok } = require('../core/result');
const { requirePermission } = require('../rbac');

function personTypeFromInput(input = {}) {
  const key = normalizeKey(input.person_type || input.personType || input.role || input.relationship || 'member');
  if (['student', 'child', 'talmid'].includes(key)) return 'student';
  if (['guardian', 'parent', 'mother', 'father', 'caregiver'].includes(key)) return 'guardian';
  if (['teacher', 'rabbi', 'service_provider', 'provider'].includes(key)) return 'service_provider';
  if (['staff', 'admin', 'operator'].includes(key)) return 'staff';
  return 'member';
}

function personIdentityKeys(input = {}, context = {}) {
  const scope = contextScopeFields(context);
  const keys = [];
  const email = normalizeEmail(input.email || input.primary_email || input.parent_email);
  const phone = normalizePhone(input.phone || input.primary_phone || input.parent_phone);
  const name = normalizeKey(input.display_name || input.preferred_name || input.full_name || input.name);
  if (email) keys.push({ type: 'email', value: email, dedupe_key: `email:${email}`, confidence: 0.98 });
  if (phone) keys.push({ type: 'phone', value: phone, dedupe_key: `phone:${phone}`, confidence: 0.92 });
  if (name) keys.push({ type: 'name_workspace', value: name, dedupe_key: `workspace:${scope.workspace_id || 'global'}:name:${name}`, confidence: 0.72 });
  return keys;
}

function normalizePersonInput(input = {}, context = {}) {
  const type = personTypeFromInput(input);
  const displayName = cleanString(input.display_name || input.preferred_name || input.full_name || input.name || input.email || input.phone);
  const scope = contextScopeFields(context);
  return {
    id: cleanString(input.id || stableId('PERSON', [scope.workspace_id, displayName, input.email, input.phone])),
    ...scope,
    display_name: displayName,
    preferred_name: cleanString(input.preferred_name || input.name || displayName),
    full_name: cleanString(input.full_name || displayName),
    email: normalizeEmail(input.email || input.primary_email || input.parent_email),
    phone: normalizePhone(input.phone || input.primary_phone || input.parent_phone),
    person_type: type,
    status: normalizeKey(input.status || 'active') || 'active',
    identity_keys: personIdentityKeys(input, context),
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {},
  };
}

function buildPersonUpsertPlan(context = {}, input = {}, existingPeople = []) {
  const permission = requirePermission(context, 'member:invite', { workspace_id: context.workspace?.id, instance_id: context.instance?.id });
  if (!permission.ok) return permission;
  const person = normalizePersonInput(input, context);
  if (!person.display_name) return fail('missing_person_name', 'display_name, name, email, or phone is required', {}, 400);
  const identityKeys = new Set(person.identity_keys.map((key) => key.dedupe_key));
  const match = existingPeople.find((existing) => {
    const existingKeys = personIdentityKeys(existing, context).map((key) => key.dedupe_key);
    return existingKeys.some((key) => identityKeys.has(key));
  }) || null;
  return ok({
    action: match ? 'update_existing_person' : 'create_person',
    person: match ? { ...match, ...person, id: match.id } : person,
    matched_person_id: match?.id || null,
    identity_keys: person.identity_keys,
    duplicate_prevention: 'email_phone_workspace_name',
  });
}

function buildStudentProfile(context = {}, input = {}) {
  const permission = requirePermission(context, 'member:invite', { workspace_id: context.workspace?.id, instance_id: context.instance?.id });
  if (!permission.ok) return permission;
  const person = normalizePersonInput({ ...input, person_type: 'student' }, context);
  return ok({
    id: cleanString(input.student_profile_id || stableId('STUDENTPROFILE', [person.id, context.workspace?.id])),
    person_id: person.id,
    legacy_student_id: input.legacy_student_id || input.student_id || null,
    workspace_id: context.workspace?.id,
    grade: cleanString(input.grade),
    school: cleanString(input.school || input.current_school),
    invitation_state: normalizeKey(input.invitation_state || 'not_invited') || 'not_invited',
    archive_state: normalizeKey(input.archive_state || input.status || 'active') || 'active',
    person,
  });
}

function buildGuardianRelationship(context = {}, input = {}) {
  const permission = requirePermission(context, 'member:invite', { workspace_id: context.workspace?.id, instance_id: context.instance?.id });
  if (!permission.ok) return permission;
  const guardianPersonId = cleanString(input.guardian_person_id || input.parent_person_id);
  const studentPersonId = cleanString(input.student_person_id || input.child_person_id);
  if (!guardianPersonId || !studentPersonId) {
    return fail('missing_relationship_people', 'guardian_person_id and student_person_id are required', {}, 400);
  }
  return ok({
    id: cleanString(input.id || stableId('GUARDIANREL', [context.workspace?.id, guardianPersonId, studentPersonId])),
    workspace_id: context.workspace?.id,
    guardian_person_id: guardianPersonId,
    student_person_id: studentPersonId,
    relationship: normalizeKey(input.relationship || 'guardian') || 'guardian',
    status: normalizeKey(input.status || 'active') || 'active',
    metadata: input.metadata || {},
  });
}

function buildServiceProviderProfile(context = {}, input = {}) {
  const permission = requirePermission(context, 'member:invite', { workspace_id: context.workspace?.id, instance_id: context.instance?.id });
  if (!permission.ok) return permission;
  const person = normalizePersonInput({ ...input, person_type: 'service_provider' }, context);
  return ok({
    id: cleanString(input.provider_profile_id || stableId('PROVIDERPROFILE', [person.id, context.workspace?.id, input.slug])),
    person_id: person.id,
    workspace_id: context.workspace?.id,
    slug: normalizeKey(input.slug || input.display_name || person.display_name),
    display_name: cleanString(input.display_name || person.display_name),
    assignment_state: normalizeKey(input.assignment_state || 'active') || 'active',
    services: Array.isArray(input.services) ? input.services : [],
    person,
  });
}

module.exports = {
  buildGuardianRelationship,
  buildPersonUpsertPlan,
  buildServiceProviderProfile,
  buildStudentProfile,
  normalizePersonInput,
  personIdentityKeys,
  personTypeFromInput,
};
