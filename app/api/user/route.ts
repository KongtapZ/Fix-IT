import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";

import {
  getSessionFromRequest,
} from "@/lib/auth";

export const runtime = "nodejs";

type UserRow = RowDataPacket & {
  user_id: string | number;
  username: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  department: string | null;
  status: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

function toIso(
  value: Date | string | null
): string | null {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export async function GET(
  request: Request
) {
  try {
    const session =
      getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    const [rows] =
      await pool.query<UserRow[]>(
        `
        SELECT
          user_id,
          username,
          full_name,
          email,
          phone,
          role,
          department,
          status,
          created_at,
          updated_at
        FROM users
        ORDER BY created_at DESC
        `
      );

    const users = rows.map(
      (row: UserRow) => ({
        userId: String(
          row.user_id
        ),
        user_id: String(
          row.user_id
        ),
        username:
          row.username,
        fullName:
          row.full_name ?? "",
        full_name:
          row.full_name ?? "",
        email:
          row.email ?? "",
        phone:
          row.phone ?? "",
        role:
          row.role ?? "",
        department:
          row.department ?? "",
        status:
          row.status ?? "",
        createdAt:
          toIso(row.created_at),
        updatedAt:
          toIso(row.updated_at),
      })
    );

    return NextResponse.json({
      success: true,
      data: users,
      users,
      currentUser: session,
    });
  } catch (error) {
    console.error(
      "GET /api/users ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "ไม่สามารถดึงข้อมูลผู้ใช้งานได้",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}