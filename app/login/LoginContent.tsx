"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginContent() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      /* =====================================================
         INPUT
      ===================================================== */

      const cleanUsername = username.trim();

      if (!cleanUsername) {
        setError("กรุณากรอก Username");
        return;
      }

      if (!password) {
        setError("กรุณากรอก Password");
        return;
      }

      console.log("=================================");
      console.log("LOGIN START");
      console.log("USERNAME:", cleanUsername);
      console.log("=================================");

      /* =====================================================
         LOGIN API
      ===================================================== */

      const response = await fetch("/api/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify({
          username: cleanUsername,
          password,
        }),
      });

      console.log(
        "LOGIN HTTP STATUS:",
        response.status
      );

      /* =====================================================
         CHECK RESPONSE TYPE
      ===================================================== */

      const contentType =
        response.headers.get("content-type") || "";

      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "LOGIN NON-JSON RESPONSE:",
          text
        );

        throw new Error(
          "เซิร์ฟเวอร์ไม่ได้ส่งข้อมูล JSON กลับมา"
        );
      }

      console.log(
        "LOGIN API RESPONSE:",
        data
      );

      /* =====================================================
         LOGIN FAILED
      ===================================================== */

      if (!response.ok) {
        setError(
          data?.message ||
            data?.error ||
            "Username หรือ Password ไม่ถูกต้อง"
        );

        return;
      }

      /* =====================================================
         CHECK SUCCESS
      ===================================================== */

      if (data?.success !== true) {
        setError(
          data?.message ||
            data?.error ||
            "เข้าสู่ระบบไม่สำเร็จ"
        );

        return;
      }

      /* =====================================================
         GET USER
      ===================================================== */

      const apiUser =
        data?.user ??
        data?.data?.user ??
        data?.data ??
        null;

      console.log(
        "LOGIN USER:",
        apiUser
      );

      if (!apiUser) {
        console.error(
          "LOGIN SUCCESS แต่ไม่มี USER:",
          data
        );

        setError(
          "เข้าสู่ระบบสำเร็จ แต่ไม่พบข้อมูลผู้ใช้"
        );

        return;
      }

      /* =====================================================
         USER ID
      ===================================================== */

      const rawUserId =
        apiUser?.user_id ??
        apiUser?.userId ??
        apiUser?.id;

      const userId =
        String(
          rawUserId ?? ""
        ).trim();

      console.log(
        "RAW USER ID:",
        rawUserId
      );

      console.log(
        "USER ID:",
        userId
      );

      /* =====================================================
         CHECK USER ID
      ===================================================== */

      if (
        !userId ||
        userId === "0" ||
        !/^\d+$/.test(userId)
      ) {
        console.error(
          "INVALID USER ID:",
          apiUser
        );

        setError(
          "เข้าสู่ระบบสำเร็จ แต่ไม่พบ user_id ของผู้ใช้"
        );

        return;
      }

      /* =====================================================
         ROLE
      ===================================================== */

      const role =
        String(
          apiUser?.role ??
            apiUser?.user_type ??
            apiUser?.type ??
            apiUser?.role_name ??
            ""
        )
          .trim()
          .toLowerCase();

      console.log(
        "================================="
      );

      console.log(
        "USER ROLE:",
        role
      );

      console.log(
        "================================="
      );

      /* =====================================================
         NAME
      ===================================================== */

      const fname =
        String(
          apiUser?.fname ??
            apiUser?.first_name ??
            apiUser?.firstname ??
            ""
        ).trim();

      const lname =
        String(
          apiUser?.lname ??
            apiUser?.last_name ??
            apiUser?.lastname ??
            ""
        ).trim();

      const fullName =
        String(
          apiUser?.fullName ??
            apiUser?.full_name ??
            `${fname} ${lname}`
        ).trim();

      /* =====================================================
         STANDARD USER OBJECT
      ===================================================== */

      const user = {
        ...apiUser,

        id: userId,

        user_id: userId,

        userId: userId,

        username:
          String(
            apiUser?.username ??
              cleanUsername
          ).trim(),

        fname,

        lname,

        fullName,

        email:
          String(
            apiUser?.email ?? ""
          ).trim(),

        phone:
          String(
            apiUser?.phone ??
              apiUser?.tel ??
              ""
          ).trim(),

        prefix:
          String(
            apiUser?.prefix ??
              ""
          ).trim(),

        role,
      };

      console.log(
        "FINAL USER:",
        user
      );

      /* =====================================================
         CLEAR OLD LOGIN DATA
      ===================================================== */

      localStorage.removeItem("user");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userId");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");

      /* =====================================================
         SAVE LOGIN DATA
      ===================================================== */

      localStorage.setItem(
        "userId",
        userId
      );

      localStorage.setItem(
        "user_id",
        userId
      );

      localStorage.setItem(
        "username",
        user.username
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      console.log(
        "LOGIN DATA SAVED"
      );

      /* =====================================================
         ROLE-BASED REDIRECT
         
         สำคัญ:
         ตรวจสอบ ROLE โดยตรง
         
         admin
           ↓
         /admin
         
         technician
           ↓
         /technician
           ↓
         app/technician/page.tsx
         
         user
           ↓
         /dashboard
      ===================================================== */

      /* =====================================================
         ADMIN
      ===================================================== */

      if (
        role === "admin" ||
        role === "administrator" ||
        role === "ผู้ดูแลระบบ"
      ) {
        console.log(
          "================================="
        );

        console.log(
          "REDIRECT ADMIN → /admin"
        );

        console.log(
          "================================="
        );

        router.replace("/admin");

        return;
      }

      /* =====================================================
         TECHNICIAN
      ===================================================== */

      if (
        role === "technician" ||
        role === "ช่าง" ||
        role === "ช่างเทคนิค"
      ) {
        console.log(
          "================================="
        );

        console.log(
          "REDIRECT TECHNICIAN → /technician"
        );

        console.log(
          "TARGET → app/technician/page.tsx"
        );

        console.log(
          "================================="
        );

        router.replace("/technician");

        return;
      }

      /* =====================================================
         USER
      ===================================================== */

      if (
        role === "user" ||
        role === "informant" ||
        role === "ผู้แจ้งซ่อม"
      ) {
        console.log(
          "================================="
        );

        console.log(
          "REDIRECT USER → /dashboard"
        );

        console.log(
          "================================="
        );

        router.replace("/dashboard");

        return;
      }

      /* =====================================================
         UNKNOWN ROLE
      ===================================================== */

      console.error(
        "================================="
      );

      console.error(
        "UNKNOWN USER ROLE:",
        role
      );

      console.error(
        "USER DATA:",
        user
      );

      console.error(
        "================================="
      );

      setError(
        `เข้าสู่ระบบสำเร็จ แต่ไม่พบสิทธิ์ของผู้ใช้ (role: ${
          role || "ไม่มีข้อมูล"
        })`
      );

    } catch (err) {
      /* =====================================================
         LOGIN ERROR
      ===================================================== */

      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-wrapper">

        {/* =================================================
            LEFT
        ================================================= */}

        <section className="login-brand">

          <div className="brand-icon-wrap">

            <span className="brand-icon">
              🛠️
            </span>

          </div>

          <h1 className="brand-title">
            ระบบแจ้งซ่อมและติดตามงาน
          </h1>

          <p className="brand-subtitle">
            Fix it Management System
            <br />
            ระบบจัดการงานแจ้งซ่อมออนไลน์
          </p>

          <div className="brand-badge">
            IT SUPPORT
          </div>

        </section>

        {/* =================================================
            RIGHT
        ================================================= */}

        <section className="login-form-panel">

          <div className="form-header">

            <h2>
              เข้าสู่ระบบ
            </h2>

            <p>
              กรุณากรอก Username และ Password
            </p>

            <div className="form-divider"></div>

          </div>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            {/* =================================================
                USERNAME
            ================================================= */}

            <div className="field-group">

              <span className="field-icon">
                👤
              </span>

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                autoComplete="username"
                disabled={loading}
                required
              />

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="field-group">

              <span className="field-icon">
                🔒
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                disabled={loading}
                required
              />

              <button
                type="button"
                className="eye-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "ซ่อนรหัสผ่าน"
                    : "แสดงรหัสผ่าน"
                }
                disabled={loading}
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                style={{
                  color: "#dc2626",
                  background: "#fef2f2",
                  border:
                    "1px solid #fecaca",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  marginBottom: "15px",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading
                ? "กำลังเข้าสู่ระบบ..."
                : "เข้าสู่ระบบ"}
            </button>

          </form>

          <div className="form-footer">
            หากมีปัญหาในการเข้าสู่ระบบ
            <br />
            กรุณาติดต่อผู้ดูแลระบบ
          </div>

          <div className="copyright">
            © 2026 Fix it Management System
          </div>

        </section>

      </div>

    </main>
  );
}