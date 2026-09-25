import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

import pool from "@/lib/db";

import {
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth";

export const runtime = "nodejs";

type UserRow = RowDataPacket & {
  user_id: string | number;

  username: string;

  password_hash: string;

  full_name: string | null;

  email: string | null;

  phone: string | null;

  role: string | null;

  department: string | null;

  status: string | null;
};


/* =========================================================
   GET
   ========================================================= */

export async function GET() {
  try {
    const [dbRows] =
      await pool.query<RowDataPacket[]>(
        "SELECT DATABASE() AS db"
      );

    return NextResponse.json({
      success: true,

      message:
        "Login API is working",

      database:
        dbRows[0]?.db ?? null,
    });

  } catch (error) {

    console.error(
      "LOGIN API GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "ไม่สามารถเชื่อมต่อฐานข้อมูลได้",

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


/* =========================================================
   POST LOGIN
   ========================================================= */

export async function POST(
  request: Request
) {

  try {

    /* =====================================================
       รับข้อมูลจากหน้า Login
       ===================================================== */

    const body =
      await request.json();

    const username =
      String(
        body?.username ?? ""
      ).trim();

    const password =
      String(
        body?.password ?? ""
      );


    console.log(
      "================================="
    );

    console.log(
      "LOGIN REQUEST"
    );

    console.log(
      "USERNAME:",
      username
    );

    console.log(
      "================================="
    );


    /* =====================================================
       ตรวจสอบข้อมูล
       ===================================================== */

    if (
      !username ||
      !password
    ) {

      return NextResponse.json(
        {
          success: false,

          message:
            "กรุณากรอก Username และ Password",
        },
        {
          status: 400,
        }
      );
    }


    /* =====================================================
       ค้นหา User
       ===================================================== */

    const [
      rows,
    ] =
      await pool.query<UserRow[]>(
        `
        SELECT
          user_id,
          username,
          password_hash,
          full_name,
          email,
          phone,
          role,
          department,
          status
        FROM users
        WHERE TRIM(username) = TRIM(?)
        LIMIT 1
        `,
        [username]
      );


    console.log(
      "USER FOUND:",
      rows.length
    );


    /* =====================================================
       ไม่พบ User
       ===================================================== */

    if (
      rows.length === 0
    ) {

      return NextResponse.json(
        {
          success: false,

          message:
            "ไม่พบผู้ใช้งานนี้ในระบบ",
        },
        {
          status: 401,
        }
      );
    }


    const user =
      rows[0];


    /* =====================================================
       ตรวจสอบ Password แบบปกติ
       
       password ใน Database ต้องเป็น Plain Text
       
       ตัวอย่าง:
       password_hash = "123456"
       
       และผู้ใช้กรอก:
       123456
       
       จะผ่านการตรวจสอบ
       ===================================================== */

    const storedPassword =
      String(
        user.password_hash ?? ""
      );


    const passwordValid =
      password === storedPassword;


    /* =====================================================
       Password ไม่ถูกต้อง
       ===================================================== */

    if (!passwordValid) {

      console.log(
        "LOGIN FAILED: PASSWORD"
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "รหัสผ่านไม่ถูกต้อง",
        },
        {
          status: 401,
        }
      );
    }


    /* =====================================================
       ตรวจสอบสถานะ Account
       ===================================================== */

    const status =
      String(
        user.status ?? ""
      )
        .trim()
        .toLowerCase();


    if (
      status &&
      status !== "active"
    ) {

      return NextResponse.json(
        {
          success: false,

          message:
            "บัญชีผู้ใช้งานถูกปิดการใช้งาน",
        },
        {
          status: 403,
        }
      );
    }


    /* =====================================================
       USER ID
       ===================================================== */

    const userId =
      String(
        user.user_id
      ).trim();


    if (
      !userId ||
      userId === "0"
    ) {

      console.error(
        "INVALID USER ID:",
        user.user_id
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "ไม่พบ user_id ของผู้ใช้",
        },
        {
          status: 500,
        }
      );
    }


    /* =====================================================
       NAME
       ===================================================== */

    const fullName =
      String(
        user.full_name ?? ""
      ).trim();


    const fname = "";

    const lname = "";


    /* =====================================================
       ROLE
       ===================================================== */

    const role =
      String(
        user.role ??
          "user"
      )
        .trim()
        .toLowerCase();


    /* =====================================================
       USER OBJECT
       ===================================================== */

    const safeUser = {

      /* ID */

      user_id:
        userId,

      userId:
        userId,

      id:
        userId,


      /* Account */

      username:
        String(
          user.username ?? ""
        ),


      /* Name */

      full_name:
        fullName,

      fullName:
        fullName,

      fname:
        fname,

      lname:
        lname,


      /* Contact */

      email:
        String(
          user.email ?? ""
        ),

      phone:
        String(
          user.phone ?? ""
        ),


      /* Role */

      role:
        role,

      user_type:
        role,


      /* Other */

      department:
        String(
          user.department ?? ""
        ),

      status:
        String(
          user.status ??
            "active"
        ),
    };


    console.log(
      "LOGIN SAFE USER:",
      safeUser
    );


    /* =====================================================
       CREATE SESSION TOKEN
       ===================================================== */

    const token =
      createSessionToken({

        userId:
          userId,

        username:
          safeUser.username,

        fullName:
          fullName,

        role:
          role,

        email:
          safeUser.email,

        department:
          safeUser.department,
      });


    /* =====================================================
       RESPONSE
       ===================================================== */

    const response =
      NextResponse.json(
        {
          success: true,

          message:
            "เข้าสู่ระบบสำเร็จ",

          user:
            safeUser,
        },
        {
          status: 200,
        }
      );


    /* =====================================================
       SESSION COOKIE
       ===================================================== */

    response.cookies.set(
      SESSION_COOKIE,

      token,

      {
        httpOnly: true,

        sameSite: "lax",

        secure:
          process.env.NODE_ENV ===
          "production",

        maxAge:
          60 * 60 * 8,

        path: "/",
      }
    );


    console.log(
      "LOGIN SUCCESS:",
      username
    );

    console.log(
      "SESSION COOKIE:",
      SESSION_COOKIE
    );

    console.log(
      "USER ID:",
      userId
    );

    console.log(
      "ROLE:",
      role
    );


    return response;


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",

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