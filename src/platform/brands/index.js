const BRAND_PRESETS = Object.freeze({
  bna: Object.freeze({
    key: 'bna',
    name: "Bnei Nevi'im Academy",
    short_name: 'BNA',
    audience: 'school_operations',
    workspace_profile: 'bna',
    brand_family: 'bna_academy',
    authoritative_palette: 'bna_cream_navy_teal_cyan',
    primary_color: '#101827',
    accent_color: '#147d7a',
    highlight_color: '#19b7c5',
    surface_color: '#f7f2de',
    palette: Object.freeze({
      cream: '#f7f2de',
      navy: '#101827',
      navy_2: '#172238',
      teal: '#147d7a',
      cyan: '#19b7c5',
      white: '#ffffff',
      muted: '#5d6778',
    }),
  }),
  one_time: Object.freeze({
    key: 'one_time',
    name: 'One Time Mishnayos',
    short_name: 'One Time',
    audience: 'partner_mishnah_program',
    workspace_profile: 'service_provider',
    workspace_key: 'rabbi_sheller_provider',
    project_key: 'one_time_mishnah_class',
    brand_family: 'rabbi_onetime',
    authoritative_palette: 'rabbi_onetime_black_yellow',
    primary_color: '#080910',
    accent_color: '#ede518',
    palette: Object.freeze({
      black: '#080910',
      charcoal: '#15171d',
      yellow: '#ede518',
      white: '#ffffff',
      muted: '#8f97a8',
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
