const assert=require('node:assert/strict');
const {test,before,after}=require('node:test');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {X509Certificate,createHash}=require('node:crypto');
const {RECEIVER_DATABASE,pinnedDatabaseTls,outboxPoolOptions}=require('../src/lib/bna/life-skills-inbound-database');
let fixture,ca,leaf,wrong,attestation;
const sha=raw=>createHash('sha256').update(raw).digest('hex');
before(()=>{
 fixture=fs.mkdtempSync(path.join(os.tmpdir(),'ls-inbound-tls-unit-'));
 const openssl=process.platform==='win32'&&fs.existsSync('C:/Program Files/Git/mingw64/bin/openssl.exe')?'C:/Program Files/Git/mingw64/bin/openssl.exe':'openssl';
 const run=args=>{const r=spawnSync(openssl,args,{cwd:fixture,windowsHide:true,encoding:'utf8',timeout:30000});assert.equal(r.status,0,'Existing openssl dependency must generate isolated certificates');};
 run(['req','-x509','-newkey','rsa:2048','-nodes','-keyout','root.key','-out','root.crt','-days','2','-subj','/CN=DEMO temporary CA','-addext','basicConstraints=critical,CA:TRUE']);
 for(const [name,hostname] of [['leaf','localhost'],['wrong','not-localhost.invalid']]){
  run(['req','-new','-newkey','rsa:2048','-nodes','-keyout',name+'.key','-out',name+'.csr','-subj','/CN='+hostname]);
  fs.writeFileSync(path.join(fixture,name+'.ext'),'subjectAltName=DNS:'+hostname+'\nextendedKeyUsage=serverAuth\nbasicConstraints=CA:FALSE\n',{flag:'wx'});
  run(['x509','-req','-in',name+'.csr','-CA','root.crt','-CAkey','root.key','-CAcreateserial','-out',name+'.crt','-days','2','-extfile',name+'.ext']);
 }
 ca=fs.readFileSync(path.join(fixture,'root.crt'),'utf8');
 leaf=new X509Certificate(fs.readFileSync(path.join(fixture,'leaf.crt')));wrong=new X509Certificate(fs.readFileSync(path.join(fixture,'wrong.crt')));
 attestation={rootSha256:sha(new X509Certificate(ca).raw),leafSha256:sha(leaf.raw),certificateHostname:'localhost'};
});
after(()=>{
 if(!fixture)return;const actual=fs.realpathSync(fixture),parent=fs.realpathSync(os.tmpdir());
 assert.equal(path.dirname(actual),parent);assert.match(path.basename(actual),/^ls-inbound-tls-unit-/);
 fs.rmSync(actual,{recursive:true});
});
test('attested logical hostname and unique leaf are checked with chain validation still enabled',()=>{
 const options=pinnedDatabaseTls(ca,attestation,'127.0.0.1');
 assert.equal(options.rejectUnauthorized,true);assert.equal(options.minVersion,'TLSv1.2');assert.equal(options.ca,ca);
 assert.equal(options.checkServerIdentity('127.0.0.1',leaf.toLegacyObject()),undefined);
 assert.match(options.checkServerIdentity('other.invalid',leaf.toLegacyObject()).code,/IDENTITY_MISMATCH/);
 assert.match(options.checkServerIdentity('127.0.0.1',wrong.toLegacyObject()).code,/IDENTITY_MISMATCH/);
 const wrongName=pinnedDatabaseTls(ca,{...attestation,leafSha256:sha(wrong.raw)},'127.0.0.1');
 assert.match(wrongName.checkServerIdentity('127.0.0.1',wrong.toLegacyObject()).code,/IDENTITY_MISMATCH/);
});
test('missing, changed, bundled, private-key and expired CA or invalid pins fail closed',()=>{
 for(const [root,proof] of [[undefined,attestation],[ca+ca,attestation],[ca+'PRIVATE KEY',attestation],
  [ca,{...attestation,rootSha256:'0'.repeat(64)}],[ca,{...attestation,leafSha256:'bad'}],
  [ca,{...attestation,certificateHostname:'proxy.invalid'}]])assert.throws(()=>pinnedDatabaseTls(root,proof,'127.0.0.1'),/TLS_UNAVAILABLE/);
 const old=Date.now;try{Date.now=()=>Date.parse(new X509Certificate(ca).validTo)+1000;assert.throws(()=>pinnedDatabaseTls(ca,attestation,'127.0.0.1'),/TLS_UNAVAILABLE/);}finally{Date.now=old;}
});
test('production factory has fixed registered receiver identity and cannot trust fixture CA or an URL TLS override',()=>{
 assert.match(RECEIVER_DATABASE.rootSha256,/^[a-f0-9]{64}$/);assert.match(RECEIVER_DATABASE.leafSha256,/^[a-f0-9]{64}$/);
 const env={RAILWAY_PROJECT_ID:RECEIVER_DATABASE.project,RAILWAY_ENVIRONMENT_ID:RECEIVER_DATABASE.environment,
  RAILWAY_SERVICE_ID:RECEIVER_DATABASE.app,DATABASE_URL:'postgresql://synthetic:synthetic@127.0.0.1:5432/synthetic',LIFE_SKILLS_APP_INBOUND_DB_CA:ca};
 for(const changes of [{},{RAILWAY_PROJECT_ID:'wrong'},{RAILWAY_SERVICE_ID:'wrong'},
  {NODE_TLS_REJECT_UNAUTHORIZED:'0'},{DATABASE_URL:env.DATABASE_URL+'?sslmode=disable'},
  {DATABASE_URL:env.DATABASE_URL+'?sslrootcert=/unexpected/path'},
  {DATABASE_URL:env.DATABASE_URL+'?sslmode=require&sslmode=require'},
  {LIFE_SKILLS_APP_INBOUND_DB_CA:''}])assert.throws(()=>outboxPoolOptions({...env,...changes}),/TLS_UNAVAILABLE/);
 assert.equal(RECEIVER_DATABASE.database,'360b8764-8f6b-4a8c-b651-4e64c7d83e59');
 assert.notEqual(RECEIVER_DATABASE.database,'354b5343-9e83-45a7-b764-09396f14ae29');
});
test('both actual receiver paths use only the new pool; default OFF never initializes this feature or alters shared pool',()=>{
 const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
 assert.match(server,/if \(lifeSkillsAppInboundConfig\(process.env\).ready\) \{\s*try \{ await lifeSkillsAppInboundDatabase\(\); \}\s*catch \{ console.error\('Life Skills future inbox: optional startup unavailable; inbound remains fail-closed'\); \}\s*\}/);
 assert.equal((server.match(/new LifeSkillsAppInboundOutbox\(await lifeSkillsAppInboundDatabase\(\), config, fetch,/g)||[]).length,2);
 assert.doesNotMatch(server,/new LifeSkillsAppInboundOutbox\(pool, config\)/);
 assert.match(server,/lifeSkillsAppInboundPool = createLifeSkillsAppInboundPool\(process.env\)/);
 // This narrowly scoped repair must not change shared One Time/BNA connectivity.
 assert.match(server,/const pool = DATABASE_URL[\s\S]{0,140}ssl: \{ rejectUnauthorized: false \}/);
});
