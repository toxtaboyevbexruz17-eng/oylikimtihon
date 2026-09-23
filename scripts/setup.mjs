import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';

const file=path.resolve('backend/.env');
if(!fs.existsSync(file)){
  const secret=randomBytes(32).toString('hex');
  fs.writeFileSync(file,`PORT=4000\nDATABASE_URL=postgresql://postgres:password@localhost:5432/bilim_test\nADMIN_LOGIN=ulugbek\nADMIN_PASSWORD=codingwithulugbek123\nJWT_SECRET=${secret}\nFRONTEND_ORIGIN=http://localhost:5173\n`);
  console.log('backend/.env yaratildi. DATABASE_URL ichidagi login, parol va baza nomini o‘zingizning PostgreSQL sozlamangizga moslang.');
}else console.log('backend/.env mavjud, o‘zgartirilmadi.');
