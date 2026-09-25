# สรุปการปรับปรุงระบบ Helpdesk + การเชื่อมต่อ TiDB Cloud Serverless

## 1) สิ่งที่แก้ไข/เพิ่มเข้ามา

### 🔌 เชื่อมต่อ TiDB Cloud Serverless
- `lib/db.ts` — ปรับ connection pool ให้เปิด TLS อัตโนมัติเมื่อ host เป็น `*.tidbcloud.com`,
  รองรับ `DB_SSL_CA_BASE64` ถ้าต้องการ pin certificate, กัน pool ซ้ำซ้อนตอน dev hot-reload
- `db/schema.sql` — สคริปต์สร้างตาราง `users` และ `repair_requests` (ตรงกับ query ที่ระบบใช้อยู่)
- `app/api/health/route.ts` — endpoint `/api/health` เช็คว่าเชื่อม TiDB ได้จริงไหม
- `.env.local.example` — ตัวอย่างค่าที่ต้องกรอกจากหน้า "Connect" ใน TiDB Cloud Console

### 🔐 ความปลอดภัย (จุดที่แก้เพราะเดิมมีช่องโหว่ค่อนข้างมาก)
เดิมระบบมีปัญหาสำคัญ 3 อย่าง:
1. Username/Password เป็นค่า **hardcode ในโค้ด** (`admin/123456`, `user/123456`) เทียบรหัสผ่านแบบ **plain text**
2. **ไม่มีการตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์เลย** — ทุกหน้า (`/admin`, `/dashboard`, `/technician`, ...) เข้าถึงได้โดยตรงผ่าน URL แม้ไม่ login
3. Cookie ที่เก็บ role/username เป็นแบบอ่านได้จาก JavaScript (ไม่ httpOnly) และไม่ได้เซ็นหรือเข้ารหัสใด ๆ ปลอมได้ง่าย

สิ่งที่แก้:
- `lib/password.ts` — แฮชรหัสผ่านด้วย `scrypt` (มากับ Node.js อยู่แล้ว ไม่ต้องลงไลบรารีเพิ่ม)
- `lib/session.ts` + `middleware.ts` — ออก session token แบบเซ็นลายเซ็น (HMAC-SHA256) เก็บใน cookie
  `httpOnly` และตรวจสอบสิทธิ์ **ทุกหน้า/ทุก API ที่ไม่ใช่หน้าแจ้งซ่อมสาธารณะ** ก่อนเข้าใช้งานเสมอ
  - โซน `/admin/**` ล็อกไว้เฉพาะ role `admin`
  - หน้าอื่นที่ต้อง login (dashboard, technician, statistics, settings ฯลฯ) ต้องมี session ที่ถูกต้อง
  - หน้าแจ้งซ่อม (`/repair`) และการ GET/POST `/api/repair` ยังเปิดสาธารณะไว้ตามของเดิม (ผู้แจ้งซ่อมทั่วไปไม่ต้อง login)
  - PATCH/PUT/DELETE ของ `/api/repair` (แก้ไข/ลบ/เปลี่ยนสถานะงาน) ต้อง login แล้วเท่านั้น
- `app/api/login/route.ts` — เขียนใหม่ทั้งหมด ดึงผู้ใช้จากตาราง `users` จริง เทียบรหัสผ่านแบบแฮช และไม่บอกว่า "ไม่พบ username" หรือ "รหัสผ่านผิด" แยกกัน (กัน user enumeration)
- `app/api/logout/route.ts` — endpoint ใหม่สำหรับล้าง session cookie ฝั่งเซิร์ฟเวอร์ (ปุ่ม logout ทุกหน้าถูกแก้ให้เรียก endpoint นี้แล้ว)
- เพิ่ม role `technician` ในหน้า login (เดิมมีแค่ admin/user แต่หน้า `/technician` มีอยู่โดยไม่เคย login ได้)

### 🧩 คุณภาพโค้ด
- Route login/logout/health/stats เขียนใหม่ให้กระชับ อ่านง่าย ไม่ใช้การจัดบรรทัดแบบยืดยาวเหมือนโค้ดเดิม
- แยก logic รหัสผ่าน/เซสชันออกเป็นไฟล์ `lib/password.ts`, `lib/session.ts` ใช้ซ้ำได้
- Route เดิมของ `/api/repair` (`app/api/repair/route.ts`) มีการ parameterize query อยู่แล้ว (ป้องกัน SQL injection ได้ดี) จึงไม่ต้องแก้ logic ส่วนนั้น แค่ทำให้อยู่หลัง middleware ป้องกันสิทธิ์แล้ว

### ✨ ฟีเจอร์ใหม่
- `app/api/stats/route.ts` — API สรุปตัวเลข (จำนวนงานแยกตามสถานะ/ความเร่งด่วน, เวลาซ่อมเฉลี่ย)
  ใช้ต่อยอดกับหน้า dashboard/statistics แทนการดึงข้อมูลทั้งหมดมานับเองฝั่ง client
- `app/api/health/route.ts` — endpoint เช็คสถานะการเชื่อมต่อฐานข้อมูล

### 🎨 UI/UX
หน้า login เดิมออกแบบมาค่อนข้างดีอยู่แล้ว (มี gradient, focus state, responsive) จึงไม่ได้แตะโครงสร้าง
เพื่อไม่ให้เกิดผลข้างเคียงกับหน้าอื่นที่ยังไม่ได้ทดสอบด้วยเบราว์เซอร์จริง — ขอบคุณที่เข้าใจว่าโค้ดเดิมมีเกือบ
20,000 บรรทัดกระจายในหลายหน้า การรีดีไซน์ทั้งหมดควรทำทีละหน้าและมีการรีวิวหน้าจอจริงประกอบ
**แจ้งมาได้เลยว่าอยากปรับหน้าไหนก่อน** (เช่น dashboard, all-jobs, statistics) จะจัดให้เป็นหน้า ๆ ไป

---

## 2) ขั้นตอนติดตั้งและเชื่อม TiDB

1. สร้าง Cluster แบบ **Serverless** ที่ https://tidbcloud.com (มี free tier)
2. กดปุ่ม **Connect** แล้วคัดลอกค่า Host / Port / User / Password มาใส่ใน `.env.local`
   (ดูตัวอย่างที่ `.env.local.example`)
3. รัน schema:
   ```bash
   mysql --comments -h <DB_HOST> -P 4000 -u <DB_USER> -p \
         --ssl-mode=VERIFY_IDENTITY -D <DB_NAME> < db/schema.sql
   ```
   หรือคัดลอกเนื้อหาไฟล์ `db/schema.sql` ไปวางใน "SQL Editor" บนเว็บ TiDB Cloud ก็ได้
4. ติดตั้ง dependencies แล้วสร้างผู้ใช้เริ่มต้น:
   ```bash
   npm install
   node scripts/create-user.mjs admin "รหัสผ่านที่ปลอดภัย" admin "ผู้ดูแลระบบ"
   node scripts/create-user.mjs tech1 "รหัสผ่านที่ปลอดภัย" technician "ช่างซ่อม 1"
   ```
5. รันเว็บ:
   ```bash
   npm run dev
   ```
6. ตรวจว่าเชื่อม TiDB ได้จริง: เปิด `http://localhost:3000/api/health` ควรได้ `"success": true`

> ⚠️ หมายเหตุ: ไฟล์ `.env.local` ที่แนบมามีแค่ค่าตัวอย่าง (placeholder) ต้องแก้เป็นค่าจริงของคุณเองก่อนใช้งาน
> และต้องสร้าง `SESSION_SECRET` ใหม่สำหรับ production เสมอ (ห้ามใช้ค่าตัวอย่างที่แนบมา)

> ⚠️ อีกจุดสำคัญ: ไฟล์ zip นี้**ไม่ได้แนบ `node_modules`** เพราะไฟล์ที่อัปโหลดมามี native binary
> (เช่น lightningcss) ที่ build ไว้คนละแพลตฟอร์ม ทำให้ `next build` รันในเครื่องอื่นไม่ได้ —
> ให้รัน `npm install` ใหม่ในเครื่อง/เซิร์ฟเวอร์ที่จะ deploy จริงเสมอ
