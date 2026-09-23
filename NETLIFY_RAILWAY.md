# GitHub → Railway backend + Netlify frontend

## GitHub

`bilim-test` papkasini GitHub repository'ga yuklang. Ildizda `backend`, `frontend` va `netlify.toml` ko‘rinishi kerak. `.env`, `node_modules`, `.git` va eski SQLite baza yuklanmaydi.

## Railway backend

1. Railway loyihasida `+ Add` → `GitHub Repository` orqali repository'ni tanlang.
2. App servisi `Settings` → `Root Directory`: `/backend`.
3. `Variables`ga quyidagilarni kiriting:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `ADMIN_LOGIN` = `ulugbek`
   - `ADMIN_PASSWORD` = kamida 10 belgili maxfiy parol
   - `JWT_SECRET` = kamida 32 belgili tasodifiy matn
   - `FRONTEND_ORIGIN` = Netlify domeni chiqqach `https://saytingiz.netlify.app`
4. `DB_PATH`, Volume va `PORT` kerak emas. Jadvallar avtomatik yaratiladi.
5. `Deploy`, so‘ng `Settings` → `Networking` → `Generate Domain`.
6. `https://RAILWAY-DOMEN/api/health` manzilida `{"ok":true,"database":"postgresql"}` chiqishi kerak.

JWT_SECRET yaratish: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Netlify frontend

1. `Add new project` → `Import an existing project` → GitHub repository.
2. Base `frontend`, Build `npm run build`, Publish `dist` (`netlify.toml` buni avtomatik beradi).
3. Environment variable: `VITE_API_URL=https://RAILWAY-DOMEN/api`.
4. Deploy qiling. Netlify domeni chiqqach Railway'dagi `FRONTEND_ORIGIN`ni shu domen bilan yangilab, Railway'ni qayta deploy qiling.

Admin login `ulugbek`; parol Railway'dagi `ADMIN_PASSWORD`. O‘quvchi faqat 6 xonali kod bilan kiradi.
