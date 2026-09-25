import { NextResponse } from "next/server";
import { checkDbConnection } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/health -> ใช้ตรวจว่าเซิร์ฟเวอร์เชื่อมต่อ TiDB ได้หรือไม่
// เรียกดูได้ตรง ๆ ที่ /api/health หลัง deploy เพื่อ debug การเชื่อมต่อ
export async function GET() {
  const db = await checkDbConnection();

  return NextResponse.json(
    {
      success: db.ok,
      database: db.ok ? "connected" : "disconnected",
      message: db.message,
      timestamp: new Date().toISOString(),
    },
    { status: db.ok ? 200 : 503 }
  );
}
