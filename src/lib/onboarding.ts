// Shared between the parent-home server component and the /api/onboarding/*
// route handlers. Keeping it in a plain lib file so server components don't
// pull a Route Handler file into their build graph.

export const ONBOARDING_COOKIE = 'family-acc-onboarded';
