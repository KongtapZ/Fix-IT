import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import pool from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";

type RepairImageRow =
  RowDataPacket & {
    request_id: number;
    user_id: number;
    technician_id: number | null;
    image_path: string | null;
  };

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(
      (error as { message?: unknown }).message ??
        error
    );
  }

  return String(error);
}

function getBlobPathFromUrl(
  blobUrl: string
): string | null {
  try {
    const url =
      new URL(blobUrl);

    return decodeURIComponent(
      url.pathname.replace(
        /^\/+/,
        ""
      )
    );
  } catch {
    return null;
  }
}

function isVercelBlobUrl(
  value: string
): boolean {
  try {
    const url =
      new URL(value);

    return url.hostname.endsWith(
      ".blob.vercel-storage.com"
    );
  } catch {
    return false;
  }
}

export async function GET(
  req: Request
) {
  try {
    /* =====================================================
       SESSION
    ===================================================== */

    const session =
      getSessionFromRequest(req);

    if (!session) {
      return new NextResponse(
        "กรุณาเข้าสู่ระบบก่อนดูรูปภาพ",
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       REQUEST ID
    ===================================================== */

    const url =
      new URL(req.url);

    const requestId =
      url.searchParams
        .get("requestId")
        ?.trim() ?? "";

    if (!requestId) {
      return new NextResponse(
        "ไม่พบรหัสรายการแจ้งซ่อม",
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       FIND REPAIR
    ===================================================== */

    const [rows] =
      await pool.query<
        RepairImageRow[]
      >(
        `
        SELECT
          request_id,
          user_id,
          technician_id,
          image_path
        FROM repair_requests
        WHERE request_id = ?
        LIMIT 1
        `,
        [requestId]
      );

    const repair =
      rows[0];

    if (!repair) {
      return new NextResponse(
        "ไม่พบรายการแจ้งซ่อม",
        {
          status: 404,
        }
      );
    }

    if (!repair.image_path) {
      return new NextResponse(
        "รายการนี้ไม่มีรูปภาพ",
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       CHECK BLOB URL
    ===================================================== */

    if (
      !isVercelBlobUrl(
        repair.image_path
      )
    ) {
      return new NextResponse(
        "รูปภาพไม่ได้อยู่ใน Vercel Blob",
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       AUTHORIZATION
    ===================================================== */

    const sessionUserId =
      session.userId !==
        undefined &&
      session.userId !== null
        ? String(
            session.userId
          )
        : null;

    const ownerUserId =
      String(
        repair.user_id
      );

    const sessionRole =
      String(
        session.role ?? ""
      )
        .trim()
        .toLowerCase();

    const isOwner =
      sessionUserId ===
      ownerUserId;

    const isTechnician =
      sessionRole ===
      "technician";

    const isAdmin =
      sessionRole ===
        "admin" ||
      sessionRole ===
        "administrator";

    /*
     * เจ้าของ Ticket
     * หรือช่าง
     * หรือ Admin
     */
    if (
      !isOwner &&
      !isTechnician &&
      !isAdmin
    ) {
      return new NextResponse(
        "ไม่มีสิทธิ์เข้าถึงรูปภาพนี้",
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       GET PRIVATE BLOB
    ===================================================== */

    const pathname =
      getBlobPathFromUrl(
        repair.image_path
      );

    if (!pathname) {
      return new NextResponse(
        "ไม่สามารถอ่านตำแหน่งไฟล์ได้",
        {
          status: 500,
        }
      );
    }

    const result =
      await get(
        pathname,
        {
          access: "private",
        }
      );

    if (!result) {
      return new NextResponse(
        "ไม่พบไฟล์รูปภาพใน Blob",
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       RETURN IMAGE
    ===================================================== */

    return new Response(
      result.stream,
      {
        status: 200,

        headers: {
          "Content-Type":
            result.blob.contentType ||
            "application/octet-stream",

          "Cache-Control":
            "private, max-age=300",

          "Content-Disposition":
            "inline",
        },
      }
    );
  } catch (error) {
    console.error(
      "PRIVATE BLOB IMAGE ERROR:",
      error
    );

    return new NextResponse(
      getErrorMessage(error),
      {
        status: 500,
      }
    );
  }
}