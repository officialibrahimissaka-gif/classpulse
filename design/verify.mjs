// Design-contract validation only. No external database is contacted.
// Install pinned validators into an isolated directory; see MIGRATION_AND_SEED_STRATEGY.md.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tools=process.env.DESIGN_TOOLS_DIR || '/tmp/classpulse-phase3-tools';
const require=createRequire(path.join(tools,'package.json'));
const YAML=require('yaml');
const SwaggerParser=require('@apidevtools/swagger-parser');
const {PGlite}=require('@electric-sql/pglite');
const {btree_gist}=require('@electric-sql/pglite/contrib/btree_gist');
const checks=[];
const assert=(ok,name)=>{if(!ok)throw new Error(name);checks.push(name);};
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'classpulse-design-'));
const schema=path.join(root,'prisma/schema.prisma');
const config=path.join(tools,'classpulse-prisma-validation.config.ts');
fs.writeFileSync(config,`import {defineConfig} from 'prisma/config';\nexport default defineConfig({schema:${JSON.stringify(schema)},datasource:{url:'postgresql://design:design@127.0.0.1:5432/design'}});\n`);
function cli(args){
 const r=spawnSync(path.join(tools,'node_modules/.bin/prisma'),[...args,'--config',config],{encoding:'utf8'});
 if(r.status!==0)throw new Error((r.stderr+r.stdout).slice(0,2500));
 return r;
}
cli(['validate']);assert(true,'Prisma schema validates with the pinned design CLI');
const base=path.join(temp,'base.sql');
cli(['migrate','diff','--from-empty','--to-schema',schema,'--script','--output',base]);
assert(fs.existsSync(base)&&fs.statSync(base).size>1000,'Offline Prisma diff produced nonempty PostgreSQL DDL');
const spec=YAML.parse(fs.readFileSync(path.join(root,'openapi.yaml'),'utf8'));
await SwaggerParser.validate(structuredClone(spec));assert(true,'OpenAPI 3.0.3 schema and references validate');
const operations=Object.values(spec.paths).flatMap(p=>Object.entries(p).filter(([m])=>['get','post','put','patch','delete'].includes(m)).map(([,v])=>v));
assert(new Set(operations.map(x=>x.operationId)).size===operations.length,'All API operation IDs are unique');
assert(operations.every(x=>x['x-release']&&x['x-module']),'Every API operation declares module and release eligibility');
const db=await PGlite.create({extensions:{btree_gist}});
try {
 await db.exec(fs.readFileSync(base,'utf8'));assert(true,'Prisma-generated DDL executes in isolated PostgreSQL-compatible engine');
 await db.exec(fs.readFileSync(path.join(root,'prisma/constraints.sql'),'utf8'));assert(true,'All companion SQL constraints/indexes/triggers/RLS execute');
 const models=[...fs.readFileSync(schema,'utf8').matchAll(/^model (\w+) \{/gm)].map(m=>m[1]);
 const rls=await db.query("SELECT count(*)::int n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity AND c.relforcerowsecurity");
 assert(rls.rows[0].n===models.length,'Every modeled table has ENABLE and FORCE RLS');
 const roles=await db.query("SELECT rolname,rolsuper,rolbypassrls FROM pg_roles WHERE rolname IN ('app_runtime','app_retention')");
 assert(roles.rows.length===2&&roles.rows.every(r=>!r.rolsuper&&!r.rolbypassrls),'Runtime and retention roles have no superuser/RLS bypass');
 const owner=await db.query("SELECT count(*)::int n FROM pg_class c JOIN pg_roles r ON r.oid=c.relowner JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND r.rolname='app_runtime'");
 assert(owner.rows[0].n===0,'Runtime role owns no application table');
 const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002';
 const uuid=n=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
 async function insert(table,obj){
  const entries=Object.entries({...obj,updated_at:'2026-11-01T00:00:00Z'});
  return db.query(`INSERT INTO "${table}" (${entries.map(([k])=>`"${k}"`).join(',')}) VALUES (${entries.map((_,i)=>'$'+(i+1)).join(',')})`,entries.map(([,v])=>v));
 }
 await insert('tenant',{id:A,slug:'synthetic-a',name:'Synthetic A',residency_cell:'test',status:'active'});
 await insert('tenant',{id:B,slug:'synthetic-b',name:'Synthetic B',residency_cell:'test',status:'active'});
 for(const [tenant,id,code] of [[A,uuid(1),'A'],[B,uuid(2),'B']])await insert('legal_entity',{id,tenant_id:tenant,code,name:'Synthetic '+code,country_code:'AE',authority_code:'TEST_ONLY',time_zone:'Asia/Dubai',default_currency:'AED'});
 await db.exec('SET ROLE app_runtime');
 let q=await db.query('SELECT count(*)::int n FROM legal_entity');assert(q.rows[0].n===0,'Missing tenant context reads zero business rows');
 await db.query("SELECT set_config('app.tenant_id',$1,false)",[A]);
 q=await db.query('SELECT id FROM tenant');assert(q.rows.length===1&&q.rows[0].id===A,'Tenant root policy isolates the routing record');
 q=await db.query('SELECT id FROM legal_entity');assert(q.rows.length===1&&q.rows[0].id===uuid(1),'Runtime reads only own-tenant entity');
 q=await db.query('UPDATE legal_entity SET name=$1,version=version+1 WHERE id=$2 RETURNING id',['unauthorized',uuid(2)]);assert(q.rows.length===0,'Cross-tenant update affects no row');
 async function denied(name,fn,codes){
  let error;try{await fn();}catch(e){error=e;}
  assert(error&&codes.includes(error.code),name);
 }
 await denied('Cross-tenant insert is rejected by RLS',()=>insert('legal_entity',{id:uuid(3),tenant_id:B,code:'BAD',name:'bad',country_code:'AE',authority_code:'TEST',time_zone:'UTC',default_currency:'AED'}),['42501']);
 await denied('Cross-tenant parent reference is rejected by composite FK',()=>insert('team',{id:uuid(4),tenant_id:A,code:'BAD',name:'bad',entity_id:uuid(2)}),['23503']);
 await denied('Currency shape check rejects lowercase code',()=>insert('legal_entity',{id:uuid(5),tenant_id:A,code:'BAD',name:'bad',country_code:'AE',authority_code:'TEST',time_zone:'UTC',default_currency:'aed'}),['23514']);
 await denied('Physical runtime deletion is denied',()=>db.query('DELETE FROM legal_entity WHERE id=$1',[uuid(1)]),['42501']);
 await denied('Mutable updates must increment version',()=>db.query('UPDATE legal_entity SET name=$1 WHERE id=$2',['bad',uuid(1)]),['23514']);
 await insert('work_calendar',{id:uuid(6),tenant_id:A,name:'Synthetic calendar',time_zone:'Asia/Dubai',entity_id:uuid(1)});
 const calendar={tenant_id:A,calendar_id:uuid(6),valid_from:'2026-01-01',week_mask:31,source_reference:'synthetic-no-legal-effect',approval_state:'approved'};
 await insert('calendar_version',{...calendar,id:uuid(7)});
 await denied('Overlapping current effective intervals are rejected',()=>insert('calendar_version',{...calendar,id:uuid(8),valid_from:'2026-06-01'}),['23P01']);
 await denied('Reversed effective interval is rejected',()=>insert('calendar_version',{...calendar,id:uuid(9),valid_to:'2025-01-01'}),['23514']);
 await denied('Published effective payload cannot be rewritten',()=>db.query('UPDATE calendar_version SET week_mask=1,version=version+1 WHERE id=$1',[uuid(7)]),['23514']);
 await db.query('UPDATE calendar_version SET superseded_at=clock_timestamp(),version=version+1 WHERE id=$1',[uuid(7)]);
 await insert('calendar_version',{...calendar,id:uuid(10),week_mask:63});
 q=await db.query('SELECT week_mask,superseded_at FROM calendar_version ORDER BY created_at,id');
 assert(q.rows.length===2&&q.rows.some(x=>x.week_mask===31&&x.superseded_at!==null)&&q.rows.some(x=>x.week_mask===63&&x.superseded_at===null),'Supersession retains old as-known content and permits replacement');
 await insert('usage_counter',{id:uuid(11),tenant_id:A,resource_key:'active_placements',period_key:'gauge',used:3,reserved:0,hard_limit:10});
 await db.query('UPDATE usage_counter SET hard_limit=2,version=version+1 WHERE id=$1',[uuid(11)]);
 q=await db.query('UPDATE usage_counter SET reserved=reserved+1,version=version+1 WHERE id=$1 AND used+reserved+1<=hard_limit RETURNING id',[uuid(11)]);
 assert(q.rows.length===0,'Downgrade preserves over-capacity records and guarded allocation denies more');
 await denied('Negative usage is rejected',()=>db.query('UPDATE usage_counter SET used=-1,version=version+1 WHERE id=$1',[uuid(11)]),['23514']);
 q=await db.query("SELECT (0.1::numeric+0.2::numeric)::text exact");assert(q.rows[0].exact==='0.3','Exact monetary arithmetic avoids binary floating-point error');
 await denied('Out-of-range numeric precision is rejected',()=>db.query('SELECT 10000000000000000::numeric(20,4)'),['22003']);
 await insert('audit_event',{id:uuid(12),tenant_id:A,action:'synthetic.test',resource_type:'LegalEntity',occurred_at:'2026-11-01T00:00:00Z',correlation_id:uuid(13),membership_revision:1,entitlement_revision:1,redacted_changes:'{}'});
 await denied('Append-only audit content cannot be updated',()=>db.query('UPDATE audit_event SET action=$1,version=version+1 WHERE id=$2',['bad',uuid(12)]),['23514']);
 await insert('principal',{id:uuid(20),tenant_id:A,issuer:'https://identity.invalid/test',subject:'synthetic-only',state:'active'});
 await insert('membership',{id:uuid(21),tenant_id:A,principal_id:uuid(20),status:'active',display_name:'Synthetic actor',work_email:'actor@example.invalid'});
 await insert('person',{id:uuid(22),tenant_id:A,display_name:'Synthetic employee',preferred_locale:'en'});
 await insert('employee',{id:uuid(23),tenant_id:A,person_id:uuid(22),employee_code:'TEST-1'});
 await insert('employment',{id:uuid(24),tenant_id:A,employee_id:uuid(23),entity_id:uuid(1),start_date:'2026-01-01',status:'active',employment_type:'synthetic'});
 const claim={tenant_id:A,employment_id:uuid(24),claimant_id:uuid(21),claim_number:'TEST-CLAIM',currency:'AED',state:'draft'};
 await denied('Expense self-approval is rejected',()=>insert('expense_claim',{...claim,id:uuid(25),approver_id:uuid(21)}),['23514']);
 await insert('expense_claim',{...claim,id:uuid(26)});
 await denied('Expense line currency must match its parent claim',()=>insert('expense_line',{id:uuid(27),tenant_id:A,claim_id:uuid(26),line_number:1,incurred_on:'2026-01-02',category_code:'synthetic',amount:'12.0000',currency:'USD'}),['23514']);
 await insert('pay_period',{id:uuid(28),tenant_id:A,entity_id:uuid(1),period_key:'SYNTHETIC',starts_on:'2026-01-01',ends_on:'2026-02-01',due_on:'2026-02-01',currency:'AED'});
 await denied('Payroll batch preparer cannot approve the same batch',()=>insert('payroll_input_batch',{id:uuid(29),tenant_id:A,period_id:uuid(28),revision:1,state:'draft',requirement_version:'synthetic',source_hash:'0'.repeat(64),preparer_id:uuid(21),approver_id:uuid(21)}),['23514']);
 await denied('An approval must have exactly one typed target',()=>insert('approval_request',{id:uuid(30),tenant_id:A,operation_key:'synthetic-no-target',state:'pending',source_version:1,requester_id:uuid(21)}),['23514']);
 // Transaction-local context must not survive a completed pooled transaction.
 await db.query("SELECT set_config('app.tenant_id','',false)");
 await db.exec('BEGIN');await db.query("SELECT set_config('app.tenant_id',$1,true)",[B]);
 q=await db.query('SELECT id FROM legal_entity');assert(q.rows.length===1&&q.rows[0].id===uuid(2),'Transaction-local context can select another explicitly authorized fixture tenant');
 await db.exec('COMMIT');q=await db.query('SELECT count(*)::int n FROM legal_entity');assert(q.rows[0].n===0,'Transaction-local tenant context does not leak after commit');
 const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
 const result={kind:'design-contract-validation',executedAt:new Date().toISOString(),node:process.version,prisma:require('prisma/package.json').version,pglite:JSON.parse(fs.readFileSync(path.join(tools,'node_modules/@electric-sql/pglite/package.json'),'utf8')).version,modelCount:models.length,apiOperationCount:operations.length,assertions:checks.length,checks,hashes:{schema:hash('prisma/schema.prisma'),sql:hash('prisma/constraints.sql'),openapi:hash('openapi.yaml')},limits:['No application handlers or policy engine implemented','PGlite validation is not native RDS/PostgreSQL pooling, concurrency or performance validation','No legal rules or provider acceptance certified']};
 fs.writeFileSync(path.join(root,'design/validation-results.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({status:'passed',models:models.length,operations:operations.length,assertions:checks.length}));
} finally {await db.close();}
