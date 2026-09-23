import pg from 'pg';
import bcrypt from 'bcryptjs';
import {randomInt} from 'node:crypto';
import seeds from './seeds.json' with {type:'json'};
import {studentCourse} from './matching.js';

const {Pool,types}=pg; types.setTypeParser(20,Number);
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL topilmadi. Railway Variables ichida Postgres DATABASE_URL ni ulang.');
export const pool=new Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.DB_POOL_SIZE||10),connectionTimeoutMillis:10000,idleTimeoutMillis:30000,ssl:process.env.PGSSLMODE==='require'?{rejectUnauthorized:false}:undefined});
export const query=(sql,p=[],c=pool)=>c.query(sql,p);
export async function one(sql,p=[],c=pool){return(await query(sql,p,c)).rows[0]}
export async function many(sql,p=[],c=pool){return(await query(sql,p,c)).rows}
export async function transaction(fn){const c=await pool.connect();try{await c.query('BEGIN');const v=await fn(c);await c.query('COMMIT');return v}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}

export async function initializeDatabase(){await query(`
CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,role TEXT NOT NULL CHECK(role IN ('admin','student')),code TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,name TEXT NOT NULL,group_name TEXT DEFAULT '',subject TEXT DEFAULT '',level TEXT DEFAULT '',created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS tests(id SERIAL PRIMARY KEY,title TEXT NOT NULL,subject TEXT DEFAULT '',level TEXT DEFAULT '',duration_minutes INTEGER NOT NULL DEFAULT 30,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS questions(id SERIAL PRIMARY KEY,test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,question TEXT NOT NULL,options JSONB NOT NULL,correct INTEGER NOT NULL CHECK(correct BETWEEN 0 AND 3),position INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS assignments(id SERIAL PRIMARY KEY,student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','completed')),started_at TIMESTAMPTZ,submitted_at TIMESTAMPTZ,answers JSONB NOT NULL DEFAULT '{}'::jsonb,score INTEGER,total INTEGER,UNIQUE(student_id,test_id));
CREATE TABLE IF NOT EXISTS seed_registry(key TEXT PRIMARY KEY,test_id INTEGER REFERENCES tests(id) ON DELETE SET NULL,created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);`)}
export async function initializeAdmin(){const login=process.env.ADMIN_LOGIN||'ulugbek',password=process.env.ADMIN_PASSWORD;if(!password||password.length<10)throw Error('ADMIN_PASSWORD kamida 10 ta belgi bo‘lsin');if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw Error('JWT_SECRET kamida 32 ta belgi bo‘lsin');const u=await one("SELECT * FROM users WHERE role='admin' LIMIT 1"),hash=bcrypt.hashSync(password,12);if(!u)await query('INSERT INTO users(role,code,password_hash,name) VALUES($1,$2,$3,$4)',['admin',login,hash,'Administrator']);else if(u.code!==login||!bcrypt.compareSync(password,u.password_hash))await query('UPDATE users SET code=$1,password_hash=$2 WHERE id=$3',[login,hash,u.id])}
export async function uniqueCode(c=pool){for(;;){const code=String(randomInt(100000,1000000));if(!await one('SELECT 1 FROM users WHERE code=$1',[code],c))return code}}
export async function statusOf(a,c=pool){if(a.status==='active'&&Date.now()>=new Date(a.started_at).getTime()+a.duration_minutes*60000){const qs=await many('SELECT id,correct FROM questions WHERE test_id=$1',[a.test_id],c),ans=a.answers||{},score=qs.filter(q=>Object.hasOwn(ans,q.id)&&Number(ans[q.id])===q.correct).length;await query("UPDATE assignments SET status='completed',submitted_at=started_at+($1*interval '1 minute'),score=$2,total=$3 WHERE id=$4 AND status='active'",[a.duration_minutes,score,qs.length,a.id],c);return'completed'}return a.status}
export async function syncExpired(){for(const a of await many("SELECT a.*,t.duration_minutes FROM assignments a JOIN tests t ON t.id=a.test_id WHERE a.status='active'"))await statusOf(a)}
export async function initializeTests(){for(const s of seeds){if(await one('SELECT 1 FROM seed_registry WHERE key=$1',[s.key]))continue;await transaction(async c=>{const t=await one('INSERT INTO tests(title,subject,level,duration_minutes) VALUES($1,$2,$3,30) RETURNING id',[s.title,s.subject,''],c);for(let i=0;i<s.questions.length;i++){const q=s.questions[i];await query('INSERT INTO questions(test_id,question,options,correct,position) VALUES($1,$2,$3,$4,$5)',[t.id,q.question,q.options,q.correct,i],c)}await query('INSERT INTO seed_registry(key,test_id) VALUES($1,$2)',[s.key,t.id],c)})}}
export async function assignDefaultTests(id,c=pool){const s=await one("SELECT id,subject,level FROM users WHERE id=$1 AND role='student'",[id],c);if(!s)return;const course=studentCourse(s);for(const x of await many('SELECT sr.key,t.id test_id FROM seed_registry sr JOIN tests t ON t.id=sr.test_id',[],c)){if(x.key===course)await query('INSERT INTO assignments(student_id,test_id) VALUES($1,$2) ON CONFLICT(student_id,test_id) DO NOTHING',[id,x.test_id],c);else await query("DELETE FROM assignments WHERE student_id=$1 AND test_id=$2 AND status='pending'",[id,x.test_id],c)}}
export async function initializeDefaultAssignments(){await transaction(async c=>{for(const s of await many("SELECT id FROM users WHERE role='student'",[],c))await assignDefaultTests(s.id,c)})}
