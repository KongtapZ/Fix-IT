import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

import pool from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

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
};

function splitFullName(fullName: string) {
  const text = fullName.trim();

  if (!text) {
    return {
      prefix: "",
      fname: "",
      lname: "",
    };
  }

  const prefixes = [
    "นาย",
    "นาง",
    "นางสาว",
    "ดร.",
    "ผศ.",
    "รศ.",
    "ศ.",
    "อาจารย์",
  ];

  let prefix = "";
  let remaining = text;

  for (const item of prefixes) {
    if (
      remaining === item ||
      remaining.startsWith(`${item} `)
    ) {
      prefix = item;
      remaining = remaining
        .slice(item.length)
        .trim();
      break;
    }
  }

  const parts = remaining
    .split(/\s+/)
    .filter(Boolean);

  return {
    prefix,
    fname: parts[0] ?? "",
    lname:
      parts.length > 1
        ? parts.slice(1).join(" ")
        : "",
  };
}

export async function GET(
  request: Request
) {
  try {
    // =========================================
    // ตรวจ Session
    // =========================================

    const session =
      getSessionFromRequest(request);

    console.log(
      "========== /api/me =========="
    );

    console.log(
      "SESSION:",
      session
    );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized: ไม่พบ Session",
        },
        {
          status: 401,
        }
      );
    }

    const sessionUserId =
      String(
        session.userId ?? ""
      ).trim();

    console.log(
      "SESSION USER ID:",
      sessionUserId
    );

    if (!sessionUserId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่พบ userId ใน Session",
        },
        {
          status: 401,
        }
      );
    }

    // =========================================
    // หา User ใน Database
    // =========================================

    const [
      rows,
    ] = await pool.query<
      UserRow[]
    >(
      `
      SELECT
        user_id,
        username,
        full_name,
        email,
        phone,
        role,
        department,
        status
      FROM users
      WHERE user_id = ?
      LIMIT 1
      `,
      [sessionUserId]
    );

    console.log(
      "DB USER ROW COUNT:",
      rows.length
    );

    // =========================================
    // ไม่พบ User
    // =========================================

    if (rows.length === 0) {
      console.error(
        "❌ SESSION USER NOT FOUND IN DB:",
        sessionUserId
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "ไม่พบผู้ใช้งานในฐานข้อมูล",
          sessionUserId,
        },
        {
          status: 404,
        }
      );
    }

    const dbUser =
      rows[0];

    const userId =
      String(
        dbUser.user_id
      );

    const fullName =
      String(
        dbUser.full_name ??
          ""
      ).trim();

    const splitName =
      splitFullName(
        fullName
      );

    const user = {
      user_id: userId,
      userId,
      id: userId,

      username:
        String(
          dbUser.username ??
            ""
        ),

      prefix:
        splitName.prefix,

      fname:
        splitName.fname,

      lname:
        splitName.lname,

      full_name:
        fullName,

      fullName,

      email:
        String(
          dbUser.email ??
            ""
        ),

      phone:
        String(
          dbUser.phone ??
            ""
        ),

      role:
        String(
          dbUser.role ??
            "user"
        ),

      user_type:
        String(
          dbUser.role ??
            "user"
        ),

      department:
        String(
          dbUser.department ??
            ""
        ),

      status:
        String(
          dbUser.status ??
            "active"
        ),
    };

    console.log(
      "✅ /api/me USER:",
      user
    );

    return NextResponse.json({
      success: true,
      user,
      currentUser: user,
    });
  } catch (error) {
    console.error(
      "❌ /api/me ERROR:",
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
      {
        status: 500,
      }
    );
  }
}