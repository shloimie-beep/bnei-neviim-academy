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
    short_name: 'One Time',
    audience: 'partner_mishnah_program',
    workspace_profile: 'service_provider',
    primary_color: '#214f4b',
    accent_color: '#c8902e',
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
