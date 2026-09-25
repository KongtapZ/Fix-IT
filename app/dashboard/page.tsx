"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";

type User = {
  userId?: string;
  user_id?: string;

  username?: string;
  fullName?: string;

  prefix?: string;
  fname?: string;
  lname?: string;

  email?: string;
  phone?: string;

  role?: string;
  department?: string;
  status?: string;
};

type RepairStatus =
  | "pending"
  | "progress"
  | "done";

type RepairPriority =
  | "low"
  | "normal"
  | "high";

type Repair = {
  id: string;
  requestId: string;

  repairNo: string;

  prefix?: string;
  fname?: string;
  lname?: string;
  email?: string;

  category: string;
  equipment?: string;
  location: string;

  subject: string;
  detail: string;

  priority: RepairPriority;
  status: RepairStatus;

  createdAt: string | null;
};

type ApiUser = {
  userId?: string | number | null;
  user_id?: string | number | null;

  username?: string | null;
  fullName?: string | null;

  prefix?: string | null;
  fname?: string | null;
  lname?: string | null;

  email?: string | null;
  phone?: string | null;

  role?: string | null;
  department?: string | null;
  status?: string | null;
};

type ApiRepair = {
  requestId?: string | number | null;
  request_id?: string | number | null;

  repairNo?: string | null;
  repair_no?: string | null;

  prefix?: string | null;
  fname?: string | null;
  lname?: string | null;

  email?: string | null;

  category?: string | null;
  equipment?: string | null;
  location?: string | null;

  subject?: string | null;
  title?: string | null;

  detail?: string | null;
  description?: string | null;

  priority?: string | null;
  status?: string | null;

  createdAt?: string | null;
  created_at?: string | null;
};

type UsersApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  users?: ApiUser[];
  data?: ApiUser[];

  currentUser?: ApiUser;
};

type MeApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  user?: ApiUser;
};

type RepairApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  repairs?: ApiRepair[];
  data?: ApiRepair[];
};

function textValue(
  value: unknown,
  fallback = ""
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const text = String(value).trim();

  return text || fallback;
}

function getCategoryText(
  category?: string
): string {
  switch (
    String(category || "")
      .trim()
      .toLowerCase()
  ) {
    case "computer":
      return "คอมพิวเตอร์";

    case "printer":
      return "เครื่องพิมพ์";

    case "network":
      return "ระบบเครือข่าย";

    case "av":
      return "โสตทัศนูปกรณ์";

    case "office":
      return "อุปกรณ์สำนักงาน";

    case "other":
      return "อื่น ๆ";

    default:
      return category || "-";
  }
}

function getStatusValue(
  status?: string
): RepairStatus {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (
    value === "done" ||
    value === "completed" ||
    value === "closed" ||
    value === "finish" ||
    value === "finished" ||
    value === "เสร็จแล้ว" ||
    value === "ดำเนินการเสร็จแล้ว"
  ) {
    return "done";
  }

  if (
    value === "progress" ||
    value === "in_progress" ||
    value === "in-progress" ||
    value === "accepted" ||
    value === "assigned" ||
    value === "working" ||
    value === "กำลังดำเนินการ"
  ) {
    return "progress";
  }

  return "pending";
}

function getPriorityValue(
  priority?: string
): RepairPriority {
  const value = String(priority || "")
    .trim()
    .toLowerCase();

  if (
    value === "high" ||
    value === "urgent" ||
    value === "critical" ||
    value === "เร่งด่วน"
  ) {
    return "high";
  }

  if (
    value === "low" ||
    value === "ไม่เร่งด่วน"
  ) {
    return "low";
  }

  return "normal";
}

function mapApiUser(
  user: ApiUser
): User {
  return {
    userId:
      user.userId !== null &&
      user.userId !== undefined
        ? String(user.userId)
        : user.user_id !== null &&
          user.user_id !== undefined
        ? String(user.user_id)
        : undefined,

    user_id:
      user.user_id !== null &&
      user.user_id !== undefined
        ? String(user.user_id)
        : user.userId !== null &&
          user.userId !== undefined
        ? String(user.userId)
        : undefined,

    username:
      textValue(user.username),

    fullName:
      textValue(user.fullName),

    prefix:
      textValue(user.prefix),

    fname:
      textValue(user.fname),

    lname:
      textValue(user.lname),

    email:
      textValue(user.email),

    phone:
      textValue(user.phone),

    role:
      textValue(user.role),

    department:
      textValue(user.department),

    status:
      textValue(user.status),
  };
}

function mapApiRepair(
  item: ApiRepair
): Repair | null {
  const requestIdValue =
    item.requestId ??
    item.request_id;

  if (
    requestIdValue === null ||
    requestIdValue === undefined ||
    String(requestIdValue).trim() === ""
  ) {
    return null;
  }

  const requestId =
    String(requestIdValue);

  return {
    id: requestId,

    requestId,

    repairNo:
      textValue(
        item.repairNo ??
          item.repair_no
      ) || `HD-${requestId}`,

    prefix:
      textValue(item.prefix),

    fname:
      textValue(item.fname),

    lname:
      textValue(item.lname),

    email:
      textValue(item.email),

    category:
      getCategoryText(
        textValue(item.category)
      ),

    equipment:
      textValue(item.equipment),

    location:
      textValue(item.location),

    subject:
      textValue(
        item.subject ??
          item.title
      ) || "แจ้งซ่อม",

    detail:
      textValue(
        item.detail ??
          item.description
      ),

    priority:
      getPriorityValue(
        item.priority ?? undefined
      ),

    status:
      getStatusValue(
        item.status ?? undefined
      ),

    createdAt:
      textValue(
        item.createdAt ??
          item.created_at
      ) || null,
  };
}

async function readJson<T>(
  response: Response
): Promise<T> {
  const text =
    await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Server ไม่ได้ส่ง JSON กลับมา (HTTP ${response.status})`
    );
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [repairs, setRepairs] =
    useState<Repair[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================
  // ดึงข้อมูล User + Repair
  // =========================================

  useEffect(() => {
    let cancelled = false;

    const loadDashboard =
      async () => {
        try {
          setLoading(true);
          setError("");

          // =====================================
          // 1. ดึงข้อมูลผู้ใช้งาน
          //
          // ใช้ /api/me ให้ตรงกับหน้า /repair
          // และ fallback ไป localStorage ถ้า API มีปัญหา
          // =====================================

          let currentApiUser: ApiUser | undefined;

          try {
            const userResponse = await fetch(
              "/api/me",
              {
                method: "GET",
                cache: "no-store",
                credentials: "include",
                headers: {
                  Accept: "application/json",
                },
              }
            );

            const userData =
              await readJson<MeApiResponse>(
                userResponse
              );

            if (
              userResponse.ok &&
              userData.success === true &&
              userData.user
            ) {
              currentApiUser =
                userData.user;
            } else {
              console.warn(
                "GET /api/me ไม่สำเร็จ:",
                {
                  status: userResponse.status,
                  error:
                    userData.error ||
                    userData.message,
                }
              );
            }
          } catch (apiError) {
            console.warn(
              "ไม่สามารถเรียก /api/me ได้ จะใช้ข้อมูลจาก localStorage:",
              apiError
            );
          }

          // =====================================
          // FALLBACK LOCALSTORAGE
          // =====================================

          if (!currentApiUser) {
            try {
              const storedUser =
                localStorage.getItem("user");

              if (storedUser) {
                const parsed = JSON.parse(
                  storedUser
                ) as
                  | ApiUser
                  | { user?: ApiUser };

                if (
                  parsed &&
                  typeof parsed === "object" &&
                  "user" in parsed &&
                  parsed.user
                ) {
                  currentApiUser =
                    parsed.user;
                } else {
                  currentApiUser =
                    parsed as ApiUser;
                }
              }
            } catch (storageError) {
              console.warn(
                "อ่าน localStorage user ไม่สำเร็จ:",
                storageError
              );
            }
          }

          if (!currentApiUser) {
            throw new Error(
              "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
            );
          }

          const currentUser =
            mapApiUser(
              currentApiUser
            );

          if (
            !currentUser.userId &&
            !currentUser.user_id
          ) {
            throw new Error(
              "ไม่พบ user_id ของผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
            );
          }

          if (cancelled) {
            return;
          }

          setUser(currentUser);

          // =====================================
          // 2. ดึงรายการแจ้งซ่อม
          // =====================================

          const email =
            textValue(
              currentUser.email
            );

          const repairUrl = email
            ? `/api/repair?email=${encodeURIComponent(
                email
              )}`
            : "/api/repair";

          const repairResponse =
            await fetch(
              repairUrl,
              {
                method: "GET",
                cache: "no-store",
                credentials:
                  "include",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const repairData =
            await readJson<RepairApiResponse>(
              repairResponse
            );

          if (
            !repairResponse.ok ||
            repairData.success !==
              true
          ) {
            throw new Error(
              repairData.error ||
                repairData.message ||
                `ไม่สามารถดึงรายการแจ้งซ่อมได้ (HTTP ${repairResponse.status})`
            );
          }

          const source =
            Array.isArray(
              repairData.repairs
            )
              ? repairData.repairs
              : Array.isArray(
                  repairData.data
                )
              ? repairData.data
              : [];

          const mappedRepairs =
            source
              .map(
                (
                  item: ApiRepair
                ) =>
                  mapApiRepair(item)
              )
              .filter(
                (
                  item: Repair | null
                ): item is Repair =>
                  item !== null
              );

          /*
           * ถ้า API ส่งข้อมูลทั้งหมดกลับมา
           * ให้กรองเฉพาะ Email ของผู้ใช้ปัจจุบัน
           *
           * แต่ถ้า email ผู้ใช้ไม่มี
           * จะแสดงรายการทั้งหมดที่ API ส่งกลับมา
           */
          let finalRepairs =
            mappedRepairs;

          if (email) {
            const emailLower =
              email.toLowerCase();

            const ownRepairs =
              mappedRepairs.filter(
                (
                  repair: Repair
                ) =>
                  textValue(
                    repair.email
                  ).toLowerCase() ===
                  emailLower
              );

            /*
             * ถ้ามีรายการของ User นี้
             * ใช้เฉพาะรายการของเขา
             *
             * ถ้าไม่มีเลย แต่ API น่าจะกรองมาให้แล้ว
             * ให้ใช้ข้อมูลที่ API ส่งกลับมา
             */
            if (
              ownRepairs.length > 0
            ) {
              finalRepairs =
                ownRepairs;
            }
          }

          /*
           * เรียงรายการใหม่สุดก่อน
           */
          finalRepairs.sort(
            (
              a: Repair,
              b: Repair
            ) => {
              const aTime =
                a.createdAt
                  ? new Date(
                      a.createdAt
                    ).getTime()
                  : 0;

              const bTime =
                b.createdAt
                  ? new Date(
                      b.createdAt
                    ).getTime()
                  : 0;

              return bTime - aTime;
            }
          );

          if (!cancelled) {
            setRepairs(
              finalRepairs
            );
          }
        } catch (errorValue) {
          console.error(
            "LOAD DASHBOARD ERROR:",
            errorValue
          );

          if (
            cancelled
          ) {
            return;
          }

          const message =
            errorValue instanceof
            Error
              ? errorValue.message
              : "ไม่สามารถโหลดข้อมูล Dashboard ได้";

          setError(
            message
          );

          setRepairs(
            []
          );

          /*
           * ถ้า session หมดอายุ
           * ให้กลับหน้า Login
           */
          if (
            message
              .toLowerCase()
              .includes(
                "unauthorized"
              )
          ) {
            window.setTimeout(
              () => {
                router.push(
                  "/login"
                );
              },
              800
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(
              false
            );
          }
        }
      };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // =========================================
  // Logout
  // =========================================

  const logout = async () => {
    try {
      await fetch(
        "/api/logout",
        {
          method: "POST",
          credentials:
            "include",
        }
      );
    } catch (
      errorValue
    ) {
      console.error(
        "LOGOUT ERROR:",
        errorValue
      );
    } finally {
      /*
       * ลบ local storage เก่าที่อาจเหลือจาก Login เวอร์ชันเดิม
       */
      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "userId"
      );

      localStorage.removeItem(
        "username"
      );

      localStorage.removeItem(
        "role"
      );

      localStorage.removeItem(
        "fullName"
      );

      /*
       * ไม่ต้องลบ cmu_session ด้วย document.cookie
       * เพราะเป็น HttpOnly
       */
      router.push(
        "/login"
      );
    }
  };

  // =========================================
  // Status Text
  // =========================================

  const getStatusText = (
    status: RepairStatus
  ) => {
    switch (status) {
      case "pending":
        return "รอดำเนินการ";

      case "progress":
        return "กำลังดำเนินการ";

      case "done":
        return "ดำเนินการเสร็จแล้ว";

      default:
        return "";
    }
  };

  // =========================================
  // Status Class
  // =========================================

  const getStatusClass = (
    status: RepairStatus
  ) => {
    switch (status) {
      case "pending":
        return "status-pending";

      case "progress":
        return "status-progress";

      case "done":
        return "status-done";

      default:
        return "";
    }
  };

  // =========================================
  // Format Date
  // =========================================

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "th-TH",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================
  // Statistics
  // =========================================

  const total =
    repairs.length;

  const pending =
    repairs.filter(
      (
        repair: Repair
      ) =>
        repair.status ===
        "pending"
    ).length;

  const progress =
    repairs.filter(
      (
        repair: Repair
      ) =>
        repair.status ===
        "progress"
    ).length;

  const done =
    repairs.filter(
      (
        repair: Repair
      ) =>
        repair.status ===
        "done"
    ).length;

  // =========================================
  // Display Name
  // =========================================

  const fullName =
    textValue(
      user?.fullName
    );

  const composedName =
    [
      textValue(
        user?.prefix
      ),
      textValue(
        user?.fname
      ),
      textValue(
        user?.lname
      ),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  const displayName =
    fullName ||
    composedName ||
    textValue(
      user?.username,
      "ผู้ใช้งาน"
    );

  const welcomeName =
    textValue(
      user?.fname
    ) ||
    fullName ||
    textValue(
      user?.username,
      "ผู้ใช้งาน"
    );

  // =========================================
  // Render
  // =========================================

  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="cmu-logo">
            CMU
          </div>

          <div>
            <h2>
              Fix it
            </h2>

            <span>
              ระบบแจ้งซ่อมครุภัณฑ์
            </span>
          </div>

        </div>

        <div className="menu-title">
          MAIN MENU
        </div>

        <nav className="menu">

          <button
            type="button"
            className="menu-item active"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
          >
            <span className="menu-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              router.push(
                "/repair"
              )
            }
          >
            <span className="menu-icon">
              ＋
            </span>

            <span>
              แจ้งซ่อมใหม่
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              router.push(
                "/repair-list"
              )
            }
          >
            <span className="menu-icon">
              ▤
            </span>

            <span>
              รายการแจ้งซ่อม
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              router.push(
                "/statistics"
              )
            }
          >
            <span className="menu-icon">
              ◔
            </span>

            <span>
              สถิติการแจ้งซ่อม
            </span>
          </button>

        </nav>

        <div className="menu-title menu-title-bottom">
          SYSTEM
        </div>

        <nav className="menu">

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              router.push(
                "/settings"
              )
            }
          >
            <span className="menu-icon">
              ⚙
            </span>

            <span>
              ตั้งค่า
            </span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="support-box">

            <div className="support-icon">
              ?
            </div>

            <div>
              <strong>
                ต้องการความช่วยเหลือ?
              </strong>

              <span>
                ติดต่อเจ้าหน้าที่ IT Support
              </span>
            </div>

          </div>

          <button
            type="button"
            className="logout"
            onClick={() =>
              void logout()
            }
          >
            <span>
              ↪
            </span>

            ออกจากระบบ
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* ================= TOPBAR ================= */}

        <header className="topbar">

          <div className="breadcrumb">

            <span>
              Fix it
            </span>

            <b>
              /
            </b>

            <strong>
              Dashboard
            </strong>

          </div>

          <div className="top-actions">

            <button
              type="button"
              className="notification"
            >
              🔔
              <span></span>
            </button>

            <div className="user-profile">

              <div className="avatar">
                {displayName.charAt(
                  0
                )}
              </div>

              <div className="user-info">

                <strong>
                  {displayName}
                </strong>

                <span>
                  {user?.username ||
                    "User"}
                </span>

              </div>

              <span className="arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <section className="content">

          {/* ================= ERROR ================= */}

          {error && (
            <div
              style={{
                marginBottom:
                  "20px",
                padding:
                  "14px 16px",
                borderRadius:
                  "12px",
                background:
                  "#fef2f2",
                border:
                  "1px solid #fecaca",
                color:
                  "#991b1b",
                fontSize:
                  "14px",
                lineHeight:
                  "1.6",
              }}
            >
              <strong>
                ไม่สามารถโหลดข้อมูลได้
              </strong>

              <div
                style={{
                  marginTop:
                    "4px",
                }}
              >
                {error}
              </div>
            </div>
          )}

          {/* ================= HERO ================= */}

          <div className="welcome">

            <div>

              <span className="welcome-small">
                CMU IT SERVICE CENTER
              </span>

              <h1>
                สวัสดี,{" "}
                {welcomeName}{" "}
                👋
              </h1>

              <p>
                ยินดีต้อนรับเข้าสู่ระบบแจ้งซ่อมครุภัณฑ์
                มหาวิทยาลัยเชียงใหม่
              </p>

            </div>

            <button
              type="button"
              className="repair-button"
              onClick={() =>
                router.push(
                  "/repair"
                )
              }
            >
              <span>
                ＋
              </span>

              แจ้งซ่อมใหม่
            </button>

          </div>

          {/* ================= STATS ================= */}

          <div className="stats">

            <div className="stat-card">

              <div className="stat-icon purple">
                ▣
              </div>

              <div className="stat-info">

                <span>
                  แจ้งซ่อมทั้งหมด
                </span>

                <strong>
                  {loading
                    ? "..."
                    : total}
                </strong>

                <small>
                  รายการทั้งหมด
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon orange">
                ◷
              </div>

              <div className="stat-info">

                <span>
                  รอดำเนินการ
                </span>

                <strong>
                  {loading
                    ? "..."
                    : pending}
                </strong>

                <small>
                  รายการที่รอเจ้าหน้าที่
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon blue">
                ⚒
              </div>

              <div className="stat-info">

                <span>
                  กำลังดำเนินการ
                </span>

                <strong>
                  {loading
                    ? "..."
                    : progress}
                </strong>

                <small>
                  รายการที่กำลังซ่อม
                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div className="stat-info">

                <span>
                  ดำเนินการเสร็จแล้ว
                </span>

                <strong>
                  {loading
                    ? "..."
                    : done}
                </strong>

                <small>
                  รายการที่ปิดงานแล้ว
                </small>

              </div>

            </div>

          </div>

          {/* ================= GRID ================= */}

          <div className="dashboard-grid">

            {/* ================= RECENT ================= */}

            <div className="panel repair-panel">

              <div className="panel-header">

                <div>

                  <h2>
                    รายการแจ้งซ่อมล่าสุด
                  </h2>

                  <p>
                    รายการแจ้งซ่อมของคุณ
                  </p>

                </div>

                <button
                  type="button"
                  className="view-all"
                  onClick={() =>
                    router.push(
                      "/repair-list"
                    )
                  }
                >
                  ดูทั้งหมด →
                </button>

              </div>

              <div className="repair-list">

                {loading ? (

                  <div
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "40px",
                    }}
                  >
                    กำลังโหลดข้อมูล...
                  </div>

                ) : error ? (

                  <div
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "40px",
                      color:
                        "#dc2626",
                    }}
                  >
                    {error}
                  </div>

                ) : repairs.length === 0 ? (

                  <div
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "40px",
                      color:
                        "#777",
                    }}
                  >
                    ยังไม่มีรายการแจ้งซ่อม
                  </div>

                ) : (

                  repairs
                    .slice(0, 5)
                    .map(
                      (
                        repair: Repair
                      ) => (

                        <div
                          className="repair-row"
                          key={
                            repair.requestId
                          }
                        >

                          <div className="repair-number">
                            {
                              repair.repairNo
                            }
                          </div>

                          <div className="repair-detail">

                            <strong>
                              {
                                repair.subject
                              }
                            </strong>

                            <div className="repair-meta">

                              <span>
                                {
                                  repair.category
                                }
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                {
                                  repair.location
                                }
                              </span>

                            </div>

                          </div>

                          <div className="repair-status">

                            <span
                              className={`status ${getStatusClass(
                                repair.status
                              )}`}
                            >
                              {getStatusText(
                                repair.status
                              )}
                            </span>

                            <small>
                              {formatDate(
                                repair.createdAt
                              )}
                            </small>

                          </div>

                        </div>

                      )
                    )

                )}

              </div>

            </div>

            {/* ================= RIGHT COLUMN ================= */}

            <div className="right-column">

              <div className="panel quick-panel">

                <div className="panel-header">

                  <div>

                    <h2>
                      เมนูด่วน
                    </h2>

                    <p>
                      บริการที่ใช้งานบ่อย
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  className="quick-item"
                  onClick={() =>
                    router.push(
                      "/repair"
                    )
                  }
                >

                  <div className="quick-icon purple-bg">
                    ＋
                  </div>

                  <div>
                    <strong>
                      แจ้งซ่อมใหม่
                    </strong>

                    <span>
                      สร้างรายการแจ้งซ่อม
                    </span>
                  </div>

                  <b>
                    ›
                  </b>

                </button>

                <button
                  type="button"
                  className="quick-item"
                  onClick={() =>
                    router.push(
                      "/repair-list"
                    )
                  }
                >

                  <div className="quick-icon blue-bg">
                    ▤
                  </div>

                  <div>
                    <strong>
                      ติดตามงานซ่อม
                    </strong>

                    <span>
                      ตรวจสอบสถานะการซ่อม
                    </span>
                  </div>

                  <b>
                    ›
                  </b>

                </button>

                <button
                  type="button"
                  className="quick-item"
                  onClick={() =>
                    router.push(
                      "/repair-list"
                    )
                  }
                >

                  <div className="quick-icon green-bg">
                    ◔
                  </div>

                  <div>
                    <strong>
                      ประวัติการแจ้งซ่อม
                    </strong>

                    <span>
                      ดูรายการที่ผ่านมา
                    </span>
                  </div>

                  <b>
                    ›
                  </b>

                </button>

              </div>

              <div className="service-card">

                <div className="service-symbol">
                  CMU
                </div>

                <div>

                  <span>
                    CMU IT SUPPORT
                  </span>

                  <h3>
                    ศูนย์บริการเทคโนโลยีสารสนเทศ
                  </h3>

                  <p>
                    ระบบแจ้งซ่อมและติดตามงาน
                    สำหรับบุคลากรมหาวิทยาลัยเชียงใหม่
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ================= FOOTER ================= */}

          <footer>

            <span>
              © 2026 Fix it
            </span>

            <span>
              มหาวิทยาลัยเชียงใหม่
            </span>

          </footer>

        </section>

      </main>

    </div>
  );
}