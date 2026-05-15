# FaceFortune AI · 面相

Web app ดูโหงวเฮ้งจีนโบราณด้วย Gemini Vision — วิเคราะห์ 5 ธาตุ · 3 ภาค · 12 พระราชวัง

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env.local
# แก้ .env.local แล้วใส่ VITE_GEMINI_API_KEY ของคุณ
# (รับฟรีจาก https://aistudio.google.com/apikey)
npm run dev
```

เปิดที่ http://localhost:5173

## ⚠️ ความปลอดภัย

API key อยู่บน **client-side** — เหมาะกับ dev / personal use เท่านั้น

ก่อน deploy production ต้อง:
1. สร้าง backend proxy (Cloudflare Worker / Vercel Edge Function) เพื่อปกปิด key
2. ย้ายการเรียก Gemini ไปทำที่ proxy แทน
3. เปลี่ยน `src/lib/gemini.ts` ให้ยิง endpoint proxy

## Stack

- Vite + React 18 + TypeScript
- TailwindCSS + custom Chinese theme
- Zustand (state)
- @google/generative-ai (Gemini 2.5 Flash, JSON mode)
- react-webcam (กล้อง + อัพโหลดไฟล์ fallback)
- framer-motion (animation)
- html2pdf.js (export ผลเป็น PDF)

## Privacy

ภาพถ่ายส่งตรงจากเบราว์เซอร์ไปยัง Google Gemini API ผ่าน HTTPS เท่านั้น
**ไม่มี backend ใด ๆ จัดเก็บภาพ**
