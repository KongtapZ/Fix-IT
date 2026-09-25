import { createHmac, timingSafeEqual } from "crypto";

// =====================================================
// Session Configuration
// =====================================================

export const SESSION_COOKIE_NAME = "hd_session";

// 7 วัน
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// =====================================================
// Session Role
// =====================================================

export type SessionRole =
  | "admin"
  | "technician"
  | "user";

// =====================================================
// Session Payload
// =====================================================

export type SessionPayload = {
  userId: number;
  username: string;
  role: SessionRole;
  issuedAt: number;
};

// =====================================================
// Secret Key
// =====================================================

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET is not configured"
      );
    }

    // ใช้เฉพาะตอน development
    return "dev-secret-change-this-in-production";
  }

  return secret;
}

// =====================================================
// Base64URL Encode
// =====================================================

function base64urlEncode(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// =====================================================
// Base64URL Decode
// =====================================================

function base64urlDecode(input: string): string {
  const base64 = input
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    base64 +
    "=".repeat((4 - (base64.length % 4)) % 4);

  return Buffer.from(padded, "base64").toString(
    "utf8"
  );
}

// =====================================================
// Create HMAC Signature
// =====================================================

function createSignature(payload: string): string {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

// =====================================================
// Create Session Token
// =====================================================

export function createSessionToken(
  payload: SessionPayload
): string {
  const encodedPayload = base64urlEncode(
    JSON.stringify(payload)
  );

  const signature =
    createSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

// =====================================================
// Verify Session Token
// =====================================================

export function verifySessionToken(
  token: string
): SessionPayload | null {
  try {
    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [
      encodedPayload,
      receivedSignature,
    ] = parts;

    // สร้าง Signature ใหม่
    const expectedSignature =
      createSignature(encodedPayload);

    // ตรวจความยาวก่อน timingSafeEqual
    const receivedBuffer = Buffer.from(
      receivedSignature,
      "utf8"
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      return null;
    }

    // ป้องกัน Timing Attack
    if (
      !timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      return null;
    }

    // Decode Payload
    const payloadText =
      base64urlDecode(encodedPayload);

    const payload = JSON.parse(
      payloadText
    ) as SessionPayload;

    // ตรวจข้อมูลพื้นฐาน
    if (
      typeof payload.userId !== "number" ||
      typeof payload.username !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.issuedAt !== "number"
    ) {
      return null;
    }

    // ตรวจ Role
    const validRoles: SessionRole[] = [
      "admin",
      "technician",
      "user",
    ];

    if (
      !validRoles.includes(
        payload.role as SessionRole
      )
    ) {
      return null;
    }

    // =================================================
    // ตรวจ Session หมดอายุ
    // =================================================

    const now = Date.now();

    const maxAgeMs =
      SESSION_MAX_AGE_SECONDS * 1000;

    if (
      now - payload.issuedAt >
      maxAgeMs
    ) {
      return null;
    }

    // ป้องกัน issuedAt เป็นเวลาล่วงหน้าผิดปกติ
    if (payload.issuedAt > now + 60_000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error(
      "❌ VERIFY SESSION ERROR:",
      error
    );

    return null;
  }
}