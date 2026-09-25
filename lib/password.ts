import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;

// =====================================================
// เข้ารหัสผ่านด้วย scrypt (มีอยู่ใน Node.js core ไม่ต้องติดตั้ง
// ไลบรารีเพิ่ม) ผลลัพธ์เก็บเป็น "salt:hash" (hex) ในคอลัมน์เดียว
// =====================================================

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(plainPassword, salt, KEY_LENGTH)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hashHex] = storedHash.split(":");

  if (!salt || !hashHex) {
    // รองรับกรณี fallback (ไม่ควรเกิดขึ้นหลังทำ migration แล้ว)
    return false;
  }

  const derivedKey = (await scrypt(plainPassword, salt, KEY_LENGTH)) as Buffer;
  const storedKey = Buffer.from(hashHex, "hex");

  if (storedKey.length !== derivedKey.length) return false;

  return timingSafeEqual(storedKey, derivedKey);
}
