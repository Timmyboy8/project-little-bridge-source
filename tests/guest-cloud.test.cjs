const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync('app/guest-cloud.ts','utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
function setup(legacy) {
 const storage = new Map(); const profiles = new Map(); const events = new Map(); let fail = false; let uid = 'guest-A';
 if (legacy) storage.set('emotion-sync-guest-progress-v1', JSON.stringify(legacy));
 const localStorage = {getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const api = {
 ensureGuestIdentity:async()=>uid,
 loadChildProfiles:async()=>[...profiles.values()],
 saveGuestProfile:async(u,p)=>{assert.equal(u,uid);profiles.set(p.id,p)},
 saveGuestEventBatch:async(u,p,rows)=>{let map=events.get(p)||new Map(); events.set(p,map); for(const row of rows){map.set(row.id,row);if(fail)throw Error('Interrupted after first event')}},
 loadFirebaseHistory:async(u,p)=>[...(events.get(p)?.values()||[])],
 deleteFirebaseChild:async(u,p)=>{profiles.delete(p);events.delete(p)}
 };
 const exports = {};vm.runInNewContext(compiled,{exports,require:()=>api,localStorage,navigator:{onLine:true},crypto:require('node:crypto').webcrypto,setTimeout,clearTimeout});
 return {exports,storage,events,profiles,setFail:v=>fail=v,setUid:v=>uid=v};
}
const event=(id,kind='guided')=>({id,kind,completedAt:'2026-09-24T10:00:00Z',records:[],durationMs:500});
test('imports legacy profile and all activity kinds once; retry is idempotent',async()=>{
 const s=setup({profile:{nickname:'Nok'},history:['guided','check','everyday','learn','device'].map((k)=>event(k,k))});
 let result=await s.exports.startGuestCloud();assert.equal(result.profiles[0].nickname,'Nok');assert.equal(s.events.get('legacy-browser-profile').size,5);
 assert.equal(s.storage.has('emotion-sync-guest-progress-v1'),false);
 await s.exports.startGuestCloud();assert.equal(s.events.get('legacy-browser-profile').size,5);
});
test('partial import keeps old source and pending data; retry does not duplicate',async()=>{
 const s=setup({history:[event('one'),event('two')]});s.setFail(true);
 await assert.rejects(s.exports.startGuestCloud());assert.ok(s.storage.has('emotion-sync-guest-progress-v1'));assert.equal(s.exports.readGuestCache().pending['legacy-browser-profile'].length,2);
 s.setFail(false);await s.exports.startGuestCloud();assert.equal(s.events.get('legacy-browser-profile').size,2);
});
test('two profiles have independent results, local queue survives failure, deletion is not reimported',async()=>{
 const s=setup();let cache=await s.exports.startGuestCloud();let other=await s.exports.addGuestProfile('Mali');const id=other.profiles[1].id;
 await s.exports.queueGuestEvent('guest-default',event('a'));await s.exports.queueGuestEvent(id,event('b'));
 s.setFail(true);await assert.rejects(s.exports.syncGuestCloud());assert.equal(s.exports.readGuestCache().history[id][0].id,'b');
 s.setFail(false);await s.exports.syncGuestCloud();assert.equal(s.events.get(id).size,1);assert.equal(s.events.get('guest-default').size,1);
 await s.exports.removeGuestProfiles([id]);await s.exports.startGuestCloud();assert.equal(s.profiles.has(id),false);assert.equal(s.events.has(id),false);
});
test('identity mismatch never uploads cached data into a different guest UID',async()=>{
 const s=setup();await s.exports.startGuestCloud();s.setUid('guest-B');await assert.rejects(s.exports.startGuestCloud(),/identity changed/);assert.equal(s.exports.readGuestCache().uid,'guest-A');
});
test('unreadable legacy data is retained and not marked migrated',async()=>{
 const s=setup();s.storage.set('emotion-sync-guest-progress-v1','broken-json');await assert.rejects(s.exports.startGuestCloud());assert.equal(s.storage.get('emotion-sync-guest-progress-v1'),'broken-json');assert.equal(s.exports.readGuestCache(),null);
});
