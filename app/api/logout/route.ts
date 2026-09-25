import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response =
    NextResponse.json({
      success: true,
      message:
        "ออกจากระบบสำเร็จ",
    });

  response.cookies.set(
    SESSION_COOKIE,
    "",
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      expires: new Date(0),
      maxAge: 0,
      path: "/",
    }
  );

  return response;
}