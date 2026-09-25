#!/usr/bin/env node
// =====================================================
// สคริปต์สร้าง/รีเซ็ตผู้ใช้ พร้อมแฮชรหัสผ่านให้ถูกต้อง
// (ใช้ scrypt แบบเดียวกับ lib/password.ts เพื่อให้ /api/login ตรวจผ่าน)
//
// วิธีใช้ (หลัง npm install และตั้งค่า .env.local แล้ว):
//   node scripts/create-user.mjs <username> <password> <role> ["ชื่อเต็ม"]
//
// ตัวอย่าง:
//   node scripts/create-user.mjs admin "รหัสผ่านที่ปลอดภัย" admin "ผู้ดูแลระบบ"
//   node scripts/create-user.mjs somchai "P@ssw0rd!" technician "สมชาย ช่างซ่อม"
// =====================================================

import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";
import { readFileSync } from "fs";
import mysql from "mysql2/promise";

// โหลดค่าจาก .env.local เอง (ไม่พึ่งไลบรารี dotenv เพิ่ม)
function loadEnvLocal() {
  try {
    const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const eqIndex = line.indexOf("=");
      if (eqIndex === -1) continue;

      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim();

      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // ไม่มีไฟล์ .env.local ก็ไม่เป็นไร ใช้ค่า default แทน
  }
}

loadEnvLocal();

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

async function hashPassword(plainPassword) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(plainPassword, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const [username, password, role = "user", fullName = null] = process.argv.slice(2);

  if (!username || !password) {
    console.error(
      "การใช้งาน: node scripts/create-user.mjs <username> <password> <role: admin|technician|user> [\"ชื่อเต็ม\"]"
    );
    process.exit(1);
  }

  if (!["admin", "technician", "user"].includes(role)) {
    console.error("role ต้องเป็น admin, technician หรือ user เท่านั้น");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "helpdeskv1",
    ssl: /tidbcloud\.com$/i.test(process.env.DB_HOST || "")
      ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
      : undefined,
  });

  try {
    await pool.execute(
      `INSERT INTO users (username, password_hash, role, full_name)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         role = VALUES(role),
         full_name = VALUES(full_name),
         is_active = 1`,
      [username, passwordHash, role, fullName]
    );

    console.log(`✅ สร้าง/อัปเดตผู้ใช้ "${username}" (role: ${role}) สำเร็จ`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("❌ เกิดข้อผิดพลาด:", error);
  process.exit(1);
});
