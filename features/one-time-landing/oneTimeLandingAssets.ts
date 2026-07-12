export const oneTimeLandingAssets = {
  brandLogo: {
    src: '/assets/one-time/brand/one-time-logo-white.webp',
    alt: 'One Time',
    width: 400,
    height: 400,
    status: 'used',
  },
  rabbiPortrait: {
    src: '/assets/one-time/rabbi/rabbi-eli-holding-book.jpg',
    alt: 'Rabbi Eli Scheller holding the One Time book',
    width: 1600,
    height: 1067,
    status: 'used',
  },
  pressLogos: [
    { src: '/assets/one-time/press/torah-anytime.png', alt: 'TorahAnytime', width: 133, height: 100 },
    { src: '/assets/one-time/press/24six.png', alt: '24Six', width: 131, height: 100 },
    { src: '/assets/one-time/press/the-loop.png', alt: 'The Loop', width: 202, height: 100 },
    { src: '/assets/one-time/press/naki.webp', alt: 'NakiRadio', width: 244, height: 100 },
    { src: '/assets/one-time/press/mishpacha.webp', alt: 'Mishpacha', width: 338, height: 100 },
  ],
  teachingSlides: [
    { slug: 'baltimore', title: 'Baltimore teaching photograph.', status: 'missing_verified_asset' },
    { slug: 'flatbush-new-york', title: 'Flatbush or New York teaching photograph.', status: 'missing_verified_asset' },
    { slug: 'florida', title: 'Hollywood or Orlando teaching photograph.', status: 'missing_verified_asset' },
  ],
  outcomeImages: [],
  decorativeMedia: [],
  robot: {
    src: '/assets/one-time/robot/robot-scheller-whatsapp.png',
    alt: 'Robot Scheller WhatsApp assistant',
    status: 'missing_required_asset',
  },
  manifest: '/assets/one-time/one-time-asset-manifest.json',
} as const;
