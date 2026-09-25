import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");

    return NextResponse.json({
      success: true,
      message: "TiDB connection successful",
      data: rows,
    });
  } catch (error: any) {
    console.error("DB TEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Database connection failed",
      },
      { status: 500 }
    );
  }
}