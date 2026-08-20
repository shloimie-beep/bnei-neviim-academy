const http = require('node:http');
const { loadConfig } = require('./config');
const { MemoryControlPlaneStorage } = require('./storage/memory');
const { handleEventRequest } = require('./events/ingest');

function createApp({ config = loadConfig(), storage = new MemoryControlPlaneStorage() } = {}) {
  return async function handle(req, res) {
    if (req.method === 'GET' && req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'bna-control-plane' }));
      return;
    }
    if (req.method === 'GET' && req.url === '/readyz') {
      res.writeHead(config.node_env === 'test' || config.database_url_configured ? 200 : 503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ready: config.node_env === 'test' || Boolean(config.database_url_configured) }));
      return;
    }
    if (req.method === 'POST' && req.url === '/internal/v1/events') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const result = handleEventRequest({
        method: req.method,
        path: req.url,
        protocol: 'https:',
        headers: req.headers,
        body: Buffer.concat(chunks),
        storage,
        requireHttps: config.node_env !== 'test',
      });
      res.writeHead(result.statusCode, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result.body));
      return;
    }
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ code: 'not_found' }));
  };
}

function start() {
  const config = loadConfig();
  const app = createApp({ config });
  const port = Number(process.env.BNA_CP_PORT || 8080);
  http.createServer(app).listen(port);
}

if (require.main === module) start();

module.exports = {
  createApp,
};
