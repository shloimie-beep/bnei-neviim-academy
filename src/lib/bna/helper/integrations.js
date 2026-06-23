function configuredStatus(value, unauthorized = false) {
  if (unauthorized) return 'unauthorized';
  return value ? 'configured' : 'not_configured';
}

function anyValue(...values) {
  return values.some((value) => String(value || '').trim());
}

function getIntegrationReadiness(options = {}) {
  const env = options.env || process.env;
  const configured = options.configured || {};
  return {
    openai: configuredStatus(configured.openai ?? anyValue(env.OPENAI_API_KEY)),
    kimi: configuredStatus(configured.kimi ?? anyValue(env.KIMI_API_KEY, env.MOONSHOT_API_KEY)),
    google_drive: configuredStatus(configured.google_drive ?? configured.google ?? anyValue(env.GOOGLE_REFRESH_TOKEN)),
    gmail: configuredStatus(configured.gmail ?? configured.google ?? anyValue(env.GOOGLE_REFRESH_TOKEN)),
    telegram: configuredStatus(configured.telegram ?? anyValue(env.TELEGRAM_BOT_TOKEN_BNA, env.TELEGRAM_BOT_TOKEN)),
    buffer: configuredStatus(configured.buffer ?? anyValue(env.BUFFER_API_KEY)),
    resend: configuredStatus(configured.resend ?? anyValue(env.RESEND_API_KEY)),
    stripe: configuredStatus(configured.stripe ?? anyValue(env.STRIPE_SECRET_KEY, env.RABBI_STRIPE_SECRET_KEY)),
    zoom: configuredStatus(configured.zoom ?? anyValue(env.ZOOM_ACCOUNT_ID, env.ZOOM_CLIENT_ID, env.ZOOM_API_KEY)),
    vimeo: configuredStatus(configured.vimeo ?? anyValue(env.VIMEO_ACCESS_TOKEN, env.VIMEO_CLIENT_ID)),
    ghl: 'not_configured',
  };
}

module.exports = {
  getIntegrationReadiness,
};
