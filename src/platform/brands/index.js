const BRAND_PRESETS = Object.freeze({
  bna: Object.freeze({
    key: 'bna',
    name: "Bnei Nevi'im Academy",
    short_name: 'BNA',
    audience: 'school_operations',
    workspace_profile: 'bna',
    primary_color: '#19535f',
    accent_color: '#e0a458',
  }),
  one_time: Object.freeze({
    key: 'one_time',
    name: 'One Time Mishnah Class',
    public_name: 'OneTimeOneTime Mishnah',
    short_name: 'OneTimeOneTime',
    audience: 'partner_mishnah_program',
    workspace_profile: 'service_provider',
    primary_color: '#080910',
    accent_color: '#ede518',
    palette: Object.freeze({
      black: '#080910',
      charcoal: '#10131a',
      navy: '#081323',
      navy_2: '#102634',
      teal: '#08779c',
      cyan: '#0b9fc9',
      yellow: '#ede518',
      cream: '#faf9f4',
      white: '#ffffff',
      muted: '#aeb9c6',
    }),
    assets: Object.freeze({
      logo: '/images/one-time/brand/onetimelogo.webp',
      hero_portrait: '/images/one-time/brand/onetime-hero-vertical.webp',
    }),
  }),
});

function buildBrandConfig(key, overrides = {}) {
  const presetKey = String(key || '').trim().toLowerCase();
  const preset = BRAND_PRESETS[presetKey];
  if (!preset) {
    throw new Error(`Unknown platform brand: ${key}`);
  }
  return {
    ...preset,
    ...overrides,
    key: preset.key,
  };
}

function oneTimeBrandConfig(overrides = {}) {
  return buildBrandConfig('one_time', overrides);
}

module.exports = {
  BRAND_PRESETS,
  buildBrandConfig,
  oneTimeBrandConfig,
};
