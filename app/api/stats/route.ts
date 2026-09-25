import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

// =====================================================
// GET /api/stats
// สรุปตัวเลขภาพรวมของงานแจ้งซ่อม ใช้กับหน้า dashboard/statistics
// (ฟีเจอร์ใหม่: ก่อนหน้านี้ทุกหน้าต้องดึงรายการทั้งหมดมานับเองฝั่ง client)
//
// ต้อง login ก่อนเสมอ (บังคับผ่าน middleware.ts)
// =====================================================

interface StatusCountRow {
  status: string;
  total: number;
}

interface PriorityCountRow {
  priority: string;
  total: number;
}

export async function GET() {
  try {
    const [statusRows] = await pool.execute(
      `SELECT COALESCE(status, 'pending') AS status, COUNT(*) AS total
       FROM repair_requests
       GROUP BY status`
    );

    const [priorityRows] = await pool.execute(
      `SELECT priority, COUNT(*) AS total
       FROM repair_requests
       GROUP BY priority`
    );

    const [totalRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM repair_requests`
    );

    const [avgResolutionRows] = await pool.execute(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, completed_at)) AS avg_hours
       FROM repair_requests
       WHERE completed_at IS NOT NULL`
    );

    const byStatus = Object.fromEntries(
      (statusRows as StatusCountRow[]).map((r) => [r.status, r.total])
    );

    const byPriority = Object.fromEntries(
      (priorityRows as PriorityCountRow[]).map((r) => [r.priority, r.total])
    );

    const total = (totalRows as { total: number }[])[0]?.total ?? 0;
    const avgResolutionHours =
      (avgResolutionRows as { avg_hours: number | null }[])[0]?.avg_hours ?? null;

    return NextResponse.json({
      success: true,
      total,
      byStatus: {
        pending: byStatus["pending"] ?? 0,
        progress: byStatus["progress"] ?? 0,
        done: byStatus["done"] ?? 0,
      },
      byPriority: {
        low: byPriority["low"] ?? 0,
        normal: byPriority["normal"] ?? 0,
        high: byPriority["high"] ?? 0,
      },
      avgResolutionHours:
        avgResolutionHours !== null ? Math.round(avgResolutionHours * 10) / 10 : null,
    });
  } catch (error) {
    console.error("STATS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถดึงข้อมูลสถิติได้",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
