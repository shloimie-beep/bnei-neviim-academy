const fs = require('node:fs');
const path = require('node:path');

const CONFIG_DIR = path.join(__dirname, '..', '..', '..', 'config', 'service-provider-sites');

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function serviceProviderSiteConfig(siteKey) {
  const normalized = String(siteKey || '').trim().toLowerCase().replace(/_/g, '-');
  if (!normalized) {
    throw new Error('Service provider site key is required.');
  }
  const filePath = path.join(CONFIG_DIR, `${normalized}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Unknown service provider site: ${siteKey}`);
  }
  const config = readJsonFile(filePath);
  return Object.freeze({
    ...config,
    config_path: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
  });
}

function oneTimeServiceProviderSiteConfig() {
  return serviceProviderSiteConfig('one-time');
}

module.exports = {
  serviceProviderSiteConfig,
  oneTimeServiceProviderSiteConfig,
};
