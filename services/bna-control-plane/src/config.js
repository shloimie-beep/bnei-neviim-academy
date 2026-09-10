const FORBIDDEN_PROVIDER_ENV = Object.freeze([
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
  'ZOOM_CLIENT_SECRET',
  'VIMEO_ACCESS_TOKEN',
  'BUFFER_ACCESS_TOKEN',
  'WAPI_TOKEN',
  'TELEGRAM_BOT_TOKEN',
  'GITHUB_TOKEN',
  'RAILWAY_TOKEN',
]);

const REQUIRED_PRODUCTION_ENV = Object.freeze([
  'BNA_CP_DATABASE_URL',
  'BNA_CP_OIDC_ISSUER',
  'BNA_CP_SESSION_SECRET',
  'BNA_CP_COMMAND_KEY_ID',
]);

function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const forbidden = FORBIDDEN_PROVIDER_ENV.filter((name) => String(env[name] || '').trim());
  if (forbidden.length) {
    throw Object.assign(new Error(`forbidden product/provider credential(s) present: ${forbidden.join(', ')}`), { code: 'forbidden_provider_credentials' });
  }
  if (nodeEnv === 'test') {
    return {
      node_env: 'test',
      auth_mode: 'synthetic_test_only',
      telegram_delivery_enabled: false,
      product_origins: {
        one_time: 'https://join.onetimeonetime.com',
        bna_school: 'https://school.bneineviimacademy.org',
      },
    };
  }
  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => !String(env[name] || '').trim());
  if (missing.length) {
    throw Object.assign(new Error(`missing independent control-plane config: ${missing.join(', ')}`), { code: 'control_plane_config_missing' });
  }
  return {
    node_env: nodeEnv,
    auth_mode: 'production_configured',
    database_url_configured: true,
    oidc_issuer: env.BNA_CP_OIDC_ISSUER,
    telegram_delivery_enabled: env.CONTROL_PLANE_TELEGRAM_DELIVERY_ENABLED === 'true'
      && env.CONTROL_PLANE_TELEGRAM_BOT_OWNERSHIP_VERIFIED === 'true',
  };
}

module.exports = {
  FORBIDDEN_PROVIDER_ENV,
  REQUIRED_PRODUCTION_ENV,
  loadConfig,
};
