const {createHash,timingSafeEqual,X509Certificate} = require('node:crypto');
const tls = require('node:tls');

// Attested through authenticated SSH to THIS registered existing database,
// never a display name or a certificate fetched from the unauthenticated proxy.
// This database's current leaf names localhost, not its transport/proxy host.
// The logical certificate name AND unique CA/leaf identities are all checked.
// Rotation therefore fails closed and needs a new attestation/review.
const RECEIVER_DATABASE = Object.freeze({
  project:'bd5b6d78-5e83-4e83-89b2-cd5f52ed7889',
  environment:'3ce30933-49c7-4b90-8c36-a5afd67df329',
  app:'4079db35-5f4a-44ef-a767-3406c74f6005',
  database:'360b8764-8f6b-4a8c-b651-4e64c7d83e59',
  rootSha256:'f8a86319cf4cb662edd0ddd786bb28bbf0f09ac54bbb769f8f82f23905b694b9',
  leafSha256:'5f7b1aae321e0827922d26dd8aeb6bca96749f52978cbd865788ccf332c49d5b',
  certificateHostname:'localhost',
});
function unavailable(code='OUTBOX_DATABASE_TLS_UNAVAILABLE') {
  const error=new Error(code);error.code=code;return error;
}
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function equalDigest(actual,expected) {
  return /^[a-f0-9]{64}$/.test(actual)&&/^[a-f0-9]{64}$/.test(expected)&&
    timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(expected,'hex'));
}
/** Ordinary chain/expiry validation stays enabled. This is an attested logical
 * database identity, not an accept-all hostname override. No global TLS setting
 * changes, client private key, alternate database or insecure fallback exists.
 * Pure helper also permits independent synthetic native TLS tests.
 */
function pinnedDatabaseTls(ca,attestation,routingHost) {
  try {
    if(typeof ca!=='string'||ca.length>32768||
      (ca.match(/-----BEGIN CERTIFICATE-----/g)||[]).length!==1||/PRIVATE KEY/.test(ca)||
      !attestation||!equalDigest(attestation.rootSha256,attestation.rootSha256)||
      !equalDigest(attestation.leafSha256,attestation.leafSha256)||
      attestation.certificateHostname!=='localhost'||typeof routingHost!=='string'||!routingHost)throw unavailable();
    const root=new X509Certificate(ca),now=Date.now();
    if(!root.ca||!root.verify(root.publicKey)||root.subject!==root.issuer||
      !Number.isFinite(Date.parse(root.validFrom))||!Number.isFinite(Date.parse(root.validTo))||
      Date.parse(root.validFrom)>now||Date.parse(root.validTo)<=now||
      !equalDigest(digest(root.raw),attestation.rootSha256))throw unavailable();
    return {ca,rejectUnauthorized:true,minVersion:'TLSv1.2',
      checkServerIdentity(host,cert) {
        try {
          if(host!==routingHost||!Buffer.isBuffer(cert?.raw)||cert.raw.length>32768||
            !equalDigest(digest(cert.raw),attestation.leafSha256)||
            tls.checkServerIdentity(attestation.certificateHostname,cert))return unavailable('OUTBOX_DATABASE_TLS_IDENTITY_MISMATCH');
          return undefined;
        } catch {return unavailable('OUTBOX_DATABASE_TLS_IDENTITY_MISMATCH');}
      }};
  } catch {throw unavailable();}
}
function outboxPoolOptions(env={}) {
  try {
    if(env.RAILWAY_PROJECT_ID!==RECEIVER_DATABASE.project||env.RAILWAY_ENVIRONMENT_ID!==RECEIVER_DATABASE.environment||
      env.RAILWAY_SERVICE_ID!==RECEIVER_DATABASE.app||env.NODE_TLS_REJECT_UNAUTHORIZED==='0')throw unavailable();
    const url=new URL(env.DATABASE_URL||'');
    if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||!url.username||!url.password||
      !/^\/[^/]+$/.test(url.pathname)||url.hash)throw unavailable();
    // Parse explicit fields so URL sslmode/sslrootcert cannot replace the strict
    // TLS object in pg. Unexpected options are rejected, not silently applied.
    for(const [key,value] of url.searchParams)if(key!=='sslmode'||!['require','verify-ca','verify-full'].includes(value))throw unavailable();
    if(url.searchParams.getAll('sslmode').length>1)throw unavailable();
    const port=Number(url.port||5432);if(!Number.isInteger(port)||port<1||port>65535)throw unavailable();
    return {host:url.hostname,port,user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),
      database:decodeURIComponent(url.pathname.slice(1)),
      ssl:pinnedDatabaseTls(env.LIFE_SKILLS_APP_INBOUND_DB_CA,RECEIVER_DATABASE,url.hostname),
      max:2,connectionTimeoutMillis:5000,idleTimeoutMillis:30000,statement_timeout:10000,
      application_name:'life-skills-future-inbound'};
  } catch {throw unavailable();}
}
function createOutboxPool(env) {
  const {Pool}=require('pg');
  const pool=new Pool(outboxPoolOptions(env));
  // Idle TLS errors do not expose connection credentials or inquiry content.
  pool.on('error',()=>console.error('Life Skills future inbox: database connection unavailable'));
  return pool;
}
module.exports={RECEIVER_DATABASE,pinnedDatabaseTls,outboxPoolOptions,createOutboxPool};
