/* Public settings only. Never place credentials or client information here.
 * Empty / false values are deliberate publication blockers, not production defaults.
 * LS-105 may fill these only from verified, explicitly approved practice details.
 */
window.LIFE_SKILLS_CONFIG = Object.freeze({
  defaultLanguage: "he",
  whatsappNumber: "972534932631",
  whatsappVerified: true,
  founderImage: "assets/images/founder-boy-hero-en-desktop.png",
  founderImageApproved: true,
  reviewPreview: false,
  // The existing LB quote and portrait may be published only under this owner-confirmed scope.
  privateTestimonialPreview: true,
  testimonialConsentOwnerConfirmed: true,
  testimonialConsentReference: "LS-LB-CONSENT-20260909-001",
  locationVerified: true,
  // Owner/operator approval of the published wording; not a claim of legal certification.
  legalReviewApproved: true,
  publicationApproved: true
});
