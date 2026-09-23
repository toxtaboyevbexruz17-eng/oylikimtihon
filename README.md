# Bilim Test — React + Node.js + PostgreSQL

Frontend: React/Vite (Netlify). Backend: Node.js/Express (Railway). Baza: PostgreSQL (Railway).

Internetga joylash uchun [NETLIFY_RAILWAY.md](NETLIFY_RAILWAY.md) faylidagi bosqichlarni bajaring.

## Imkoniyatlar

- Admin login va parol bilan kiradi; o‘quvchi faqat takrorlanmaydigan 6 xonali kod bilan kiradi.
- O‘quvchilarni bittalab yoki Excel/CSV orqali qo‘shish mumkin.
- HTML/CSS, JavaScript, Vue va Word testlari avtomatik yaratiladi va fan/darajaga mos ko‘rsatiladi.
- Test 30 daqiqa davom etadi; vaqt tugaganda avtomatik yakunlanadi.
- Admin monitoring, natijalar va o‘quvchi javoblarini ko‘radi; o‘quvchiga natija ko‘rsatilmaydi.
- Barcha ma’lumot PostgreSQL bazasida saqlanadi.

## Lokal ishga tushirish

Kompyuterda PostgreSQL o‘rnatilgan bo‘lishi va `backend/.env` ichida `DATABASE_URL` yozilishi kerak. Namuna: `backend/.env.example`.

```powershell
npm install
npm run setup
npm run dev
```

Frontend: `http://localhost:5173`; backend: `http://localhost:4000`.
