// Explicit native gate, never skipped or pointed at a real database.
const assert=require('node:assert/strict');
const {test,after}=require('node:test');
const fs=require('node:fs'),path=require('node:path');
const {X509Certificate,createHash}=require('node:crypto');
const {Pool}=require('pg');
// Match native pg's actual DNS/SNI identity, with fixture server still bound
// only to127.0.0.1. No global machine resolver or hosts file is changed.
require('node:dns').setDefaultResultOrder('ipv4first');
const {pinnedDatabaseTls}=require('../src/lib/bna/life-skills-inbound-database');
const url=new URL(process.env.TEST_DATABASE_URL||'invalid:');
assert.equal(url.protocol,'postgresql:');assert.equal(url.hostname,'127.0.0.1');assert.equal(url.username,'synthetic');
assert.match(url.pathname,/^\/ls_calendar_test_voice_[a-f0-9]{8}_test$/);assert.equal(process.env.LS_CALENDAR_TEST_ALLOW,'true');
const caPath=process.env.LS_INBOUND_TEST_CA,leafPath=process.env.LS_INBOUND_TEST_LEAF;
for(const file of [caPath,leafPath]){assert.ok(file);assert.match(path.basename(path.dirname(path.dirname(file))),/^ls-voice-pg17-/);}
const ca=fs.readFileSync(caPath,'utf8'),leaf=new X509Certificate(fs.readFileSync(leafPath));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const attestation={rootSha256:digest(new X509Certificate(ca).raw),leafSha256:digest(leaf.raw),certificateHostname:'localhost'};
const routingHost='localhost';
const options=proof=>({host:routingHost,port:Number(url.port),user:url.username,password:url.password,database:url.pathname.slice(1),
 ssl:pinnedDatabaseTls(ca,proof,routingHost),max:1,connectionTimeoutMillis:5000});
const pool=new Pool(options(attestation));
after(async()=>pool.end());
test('real PostgreSQL17 TLS handshake, certificate identity and authenticated query succeed',async()=>{
 const client=await pool.connect();try{
  assert.equal(client.connection.stream.encrypted,true);assert.equal(client.connection.stream.authorized,true);
  const row=(await client.query('SELECT version(),ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()')).rows[0];
  assert.match(row.version,/PostgreSQL 17\./);assert.equal(row.ssl,true);
  assert.equal(digest(client.connection.stream.getPeerCertificate().raw),attestation.leafSha256);
 }finally{client.release();}
});
test('changed leaf pin and different routing identity deny before any SQL; no plain fallback',async()=>{
 for(const ssl of [pinnedDatabaseTls(ca,{...attestation,leafSha256:'0'.repeat(64)},routingHost),
  pinnedDatabaseTls(ca,attestation,'not-this-route.invalid')]){
  const denied=new Pool({...options(attestation),ssl});try{await assert.rejects(()=>denied.query('SELECT 1'),/TLS_IDENTITY_MISMATCH/);}finally{await denied.end();}
 }
 // An untrusted chain must fail independently of our matching pin/name.
 const denied=new Pool({...options(attestation),ssl:{...pinnedDatabaseTls(ca,attestation,routingHost),ca:[]}});
 try{await assert.rejects(()=>denied.query('SELECT 1'),error=>['UNABLE_TO_VERIFY_LEAF_SIGNATURE','UNABLE_TO_GET_ISSUER_CERT_LOCALLY','SELF_SIGNED_CERT_IN_CHAIN'].includes(error.code));}finally{await denied.end();}
});
test('native permission denial remains enforced over the verified TLS connection',async()=>{
 const client=await pool.connect();try{
  await client.query('CREATE ROLE ls_tls_synthetic_denied NOSUPERUSER');
  await client.query('CREATE TABLE ls_tls_synthetic_private(value int)');await client.query('REVOKE ALL ON ls_tls_synthetic_private FROM PUBLIC');
  await client.query('SET ROLE ls_tls_synthetic_denied');
  await assert.rejects(()=>client.query('SELECT * FROM ls_tls_synthetic_private'),{code:'42501'});
 }finally{await client.query('RESET ROLE');client.release();}
});
