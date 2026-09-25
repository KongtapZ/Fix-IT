import { NextRequest, NextResponse } from "next/server";

/*
 * ต้องตรงกับ lib/auth.ts
 */
const SESSION_COOKIE_NAME = "cmu_session";

/*
 * หน้า/API ที่ไม่ต้อง Login
 */
const PUBLIC_PATHS = [
  "/login",
  "/api/login",
  "/api/test-db",
  "/api/health",
];

/*
 * Decode Base64URL
 */
function base64urlDecode(value: string): string {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    base64 +
    "=".repeat((4 - (base64.length % 4)) % 4);

  return atob(padded);
}

/*
 * แปลง Uint8Array เป็น Base64URL
 */
function arrayBufferToBase64Url(
  buffer: ArrayBuffer
): string {
  const bytes = new Uint8Array(buffer);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/*
 * ตรวจสอบ Session Token
 *
 * รูปแบบ Token จาก lib/auth.ts:
 *
 * encodedPayload.signature
 *
 * และ payload จะมี:
 *
 * {
 *   userId,
 *   username,
 *   fullName,
 *   role,
 *   email,
 *   department,
 *   exp
 * }
 */
async function verifySession(
  token: string
): Promise<boolean> {
  try {
    const parts = token.split(".");

    if (parts.length !== 2) {
      console.error(
        "❌ Invalid session token format"
      );

      return false;
    }

    const [
      encodedPayload,
      encodedSignature,
    ] = parts;

    /*
     * ต้องใช้ SESSION_SECRET เดียวกับ lib/auth.ts
     */
    const secret =
      process.env.SESSION_SECRET ||
      "cmu-helpdesk-development-secret";

    /*
     * Decode payload
     */
    const payloadText =
      base64urlDecode(encodedPayload);

    const payload =
      JSON.parse(payloadText);

    /*
     * ตรวจวันหมดอายุ
     *
     * lib/auth.ts ใช้:
     *
     * exp = Unix timestamp เป็นวินาที
     */
    if (
      !payload.exp ||
      typeof payload.exp !== "number"
    ) {
      console.error(
        "❌ Session payload has no exp"
      );

      return false;
    }

    const currentTime =
      Math.floor(Date.now() / 1000);

    if (
      payload.exp < currentTime
    ) {
      console.error(
        "❌ Session expired"
      );

      return false;
    }

    /*
     * สร้าง HMAC key
     */
    const encoder =
      new TextEncoder();

    const key =
      await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["sign"]
      );

    /*
     * สร้าง Signature ใหม่
     *
     * ต้องเซ็นเฉพาะ encodedPayload
     * เหมือนกับ lib/auth.ts
     */
    const signatureBuffer =
      await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(
          encodedPayload
        )
      );

    /*
     * แปลง Signature เป็น Base64URL
     */
    const expectedSignature =
      arrayBufferToBase64Url(
        signatureBuffer
      );

    /*
     * เปรียบเทียบ Signature
     */
    if (
      expectedSignature !==
      encodedSignature
    ) {
      console.error(
        "❌ Session signature mismatch"
      );

      return false;
    }

    /*
     * ตรวจข้อมูลพื้นฐานของ User
     */
    if (
      !payload.userId ||
      !payload.username
    ) {
      console.error(
        "❌ Session user information is missing"
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Middleware session verification error:",
      error
    );

    return false;
  }
}

/*
 * Middleware
 */
export async function middleware(
  request: NextRequest
) {
  const { pathname } =
    request.nextUrl;

  /*
   * ==============================
   * Allow Next.js / Static files
   * ==============================
   */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  /*
   * ==============================
   * Allow Public Paths
   * ==============================
   */
  if (
    PUBLIC_PATHS.some(
      (path) =>
        pathname === path ||
        pathname.startsWith(
          `${path}/`
        )
    )
  ) {
    return NextResponse.next();
  }

  /*
   * ==============================
   * Get Session Cookie
   * ==============================
   */
  const token =
    request.cookies.get(
      SESSION_COOKIE_NAME
    )?.value;

  /*
   * ไม่มี Session
   */
  if (!token) {
    console.log(
      "❌ No session cookie:",
      pathname
    );

    /*
     * ถ้าเป็น API
     */
    if (
      pathname.startsWith("/api/")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "กรุณาเข้าสู่ระบบก่อนใช้งาน",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ถ้าเป็นหน้าเว็บ
     */
    const loginUrl =
      new URL(
        "/login",
        request.url
      );

    loginUrl.searchParams.set(
      "next",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  /*
   * ==============================
   * Verify Session
   * ==============================
   */
  const valid =
    await verifySession(token);

  /*
   * Session ไม่ถูกต้อง
   */
  if (!valid) {
    console.log(
      "❌ Invalid session:",
      pathname
    );

    /*
     * API
     */
    if (
      pathname.startsWith("/api/")
    ) {
      const response =
        NextResponse.json(
          {
            success: false,
            message:
              "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
          },
          {
            status: 401,
          }
        );

      response.cookies.delete(
        SESSION_COOKIE_NAME
      );

      return response;
    }

    /*
     * หน้าเว็บ
     */
    const loginUrl =
      new URL(
        "/login",
        request.url
      );

    loginUrl.searchParams.set(
      "next",
      pathname
    );

    const response =
      NextResponse.redirect(
        loginUrl
      );

    /*
     * ลบ Cookie ที่เสีย
     */
    response.cookies.delete(
      SESSION_COOKIE_NAME
    );

    return response;
  }

  /*
   * ==============================
   * Session ถูกต้อง
   * ==============================
   */
  console.log(
    "✅ Session valid:",
    pathname
  );

  return NextResponse.next();
}

/*
 * ==============================
 * Middleware Matcher
 * ==============================
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};