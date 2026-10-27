# TILSHUNOS — Frontend

Zamonaviy, moslashuvchan til o‘rganish platformasi frontend prototipi. React + TypeScript + Vite + CSS va Lucide ikonkalari ishlatilgan.

## Ishga tushirish

1. Node.js 20+ o‘rnating.
2. Terminalda loyiha papkasiga kiring.
3. `npm install`
4. `npm run dev`
5. Brauzerda Vite ko‘rsatgan manzilni oching.

Production build: `npm run build`, so‘ng `npm run preview`.

## Hozir ishlaydigan frontend imkoniyatlari

- Moslashuvchan dashboard, mobil yon menyu va yorug‘/qorong‘i mavzu.
- So‘z daftari: qidirish, yangi so‘z qo‘shish, holatni almashtirish; ma’lumotlar brauzer `localStorage` ida saqlanadi.
- So‘z mashqi: javobni tekshirish, keyingi savolga o‘tish.
- Materiallar, vazifalar, o‘qituvchilar, AI yordamchi va sozlamalar sahifalari uchun navigatsiya.
- Yangi “So‘z o‘yinlari” bo‘limi: mavzu bo‘yicha typing, so‘z zanjiri va rasmga qarab topish (variantli yoki qo‘lda yozish) demo interfeyslari.
- O‘rnatish banneri va brauzer PWA install prompt qo‘llab-quvvatlashi; o‘rnatish imkoniyati brauzer/qurilma shartlariga bog‘liq.
- Kengaytirilgan animatsiyalar, mobilga mos o‘yin kartalari va reduced-motion accessibility qo‘llovi.
- AI chat uchun demo javoblar; haqiqiy AI API ulanmagan.
- PWA manifest va service worker asoslari.

## Muhim eslatma

Bu **faqat frontend**. Backend, autentifikatsiya, server ma’lumotlar bazasi, email/Resend, Google OAuth, haqiqiy AI xizmati, o‘qituvchi/vazifa workflow va server tarafidagi xavfsizlik hali ulanmagan. O‘rnatish banneri UI darajasida; install prompt faqat brauzer PWA mezonlari bajarilganda chiqadi. O‘yin ballari hozircha demo va serverda saqlanmaydi. Productionda admin paroli yoki maxfiy kalitlarni frontendga joylamang; autentifikatsiya va rollar serverda tekshirilishi shart. Ayrim sahifalar demo holatida; real foydalanuvchilar bilan productionda ishlatishdan oldin API va server-side ruxsatlar kerak.

## Texnologiyalar

- React
- TypeScript (strict)
- Vite
- Lucide React
- Responsive CSS

Google Fonts internet mavjud bo‘lsa yuklanadi; bo‘lmasa tizim shriftlari ishlatiladi.

## Welcome / authentication UI update

The app now opens on a public welcome page when there is no local demo session. From there, users can open Login or Register, pass the simulated email verification screen, and new users select a language and level before entering the dashboard.

### UI demo flow
- Register: enter a name, email and any password, then use demo verification code `123456`; choose language and level.
- Login as super-admin UI: use the configured super-admin email, any non-empty password and demo code `123456`.
- Login as teacher UI demo: use `teacher@tilshunos.uz`, any non-empty password and demo code `123456`.
- From the dashboard, the dark demo-role strip lets you preview User, Teacher and Admin panels.

**Security note:** these are frontend-only demo flows. No email is actually sent, Google OAuth is not connected, passwords are not authenticated by a server, and role switching is only for previewing UI. Do not use this demo flow for a public production deployment. Implement real server-side authentication, email OTP, and role-based authorization before launch.

Run locally with `npm install` and `npm run dev`.
