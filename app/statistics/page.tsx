"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import "./statistics.css";

// =====================================================
// TYPE
// =====================================================

type RepairStatus =
  | "pending"
  | "progress"
  | "done"
  | "cancel";

interface Repair {
  id: number;
  repairNo: string;

  prefix?: string;
  fname?: string;
  lname?: string;
  email?: string;

  category: string;
  equipment?: string;
  location?: string;

  subject: string;
  detail?: string;

  priority:
    | "low"
    | "normal"
    | "high";

  status: RepairStatus;

  technicianId?: number | null;

  resolutionText?: string | null;

  repairCost?: number | null;

  createdAt: string;

  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  closedAt?: string | null;
}

// =====================================================
// CATEGORY
// =====================================================

const categoryInfo: Record<
  string,
  {
    name: string;
    icon: string;
    className: string;
  }
> = {
  computer: {
    name: "คอมพิวเตอร์",
    icon: "▣",
    className: "purple",
  },

  "คอมพิวเตอร์": {
    name: "คอมพิวเตอร์",
    icon: "▣",
    className: "purple",
  },

  network: {
    name: "ระบบเครือข่าย",
    icon: "⌁",
    className: "blue",
  },

  "ระบบเครือข่าย": {
    name: "ระบบเครือข่าย",
    icon: "⌁",
    className: "blue",
  },

  printer: {
    name: "เครื่องพิมพ์",
    icon: "▤",
    className: "orange",
  },

  "เครื่องพิมพ์": {
    name: "เครื่องพิมพ์",
    icon: "▤",
    className: "orange",
  },

  av: {
    name: "โสตทัศนูปกรณ์",
    icon: "▰",
    className: "green",
  },

  "โสตทัศนูปกรณ์": {
    name: "โสตทัศนูปกรณ์",
    icon: "▰",
    className: "green",
  },

  office: {
    name: "อุปกรณ์สำนักงาน",
    icon: "▤",
    className: "pink",
  },

  "อุปกรณ์สำนักงาน": {
    name: "อุปกรณ์สำนักงาน",
    icon: "▤",
    className: "pink",
  },

  other: {
    name: "อื่น ๆ",
    icon: "•••",
    className: "gray",
  },

  "อื่น ๆ": {
    name: "อื่น ๆ",
    icon: "•••",
    className: "gray",
  },
};

// =====================================================
// NORMALIZE STATUS
// =====================================================

function normalizeStatus(
  value: any
): RepairStatus {
  const status =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    status === "done" ||
    status === "completed" ||
    status === "closed" ||
    status === "เสร็จแล้ว" ||
    status ===
      "ดำเนินการเสร็จแล้ว"
  ) {
    return "done";
  }

  if (
    status === "progress" ||
    status === "in_progress" ||
    status ===
      "กำลังดำเนินการ"
  ) {
    return "progress";
  }

  if (
    status === "cancel" ||
    status === "cancelled" ||
    status === "canceled" ||
    status === "ยกเลิก"
  ) {
    return "cancel";
  }

  return "pending";
}

// =====================================================
// NORMALIZE CATEGORY
// =====================================================

function getCategoryName(
  value: any
) {
  const key =
    String(value || "").trim();

  return (
    categoryInfo[key]?.name ||
    key ||
    "อื่น ๆ"
  );
}

// =====================================================
// MONTH
// =====================================================

const monthNames = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
  value: any
) {
  if (!value) {
    return "-";
  }

  try {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      "th-TH",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return String(value);
  }
}

// =====================================================
// MAIN
// =====================================================

export default function StatisticsPage() {
  const router =
    useRouter();

  // ===================================================
  // STATE
  // ===================================================

  const [repairs, setRepairs] =
    useState<Repair[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState(
      new Date().getFullYear()
    );

  // ===================================================
  // LOAD DATA
  // ===================================================

  const loadRepairs =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/repair",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "ไม่สามารถโหลดข้อมูลได้"
          );
        }

        if (!data.success) {
          throw new Error(
            data?.message ||
              "ไม่สามารถโหลดข้อมูลแจ้งซ่อมได้"
          );
        }

        const mapped: Repair[] =
          (
            data.repairs ||
            []
          ).map(
            (row: any) => ({
              id: Number(
                row.id
              ),

              repairNo:
                row.repairNo ||
                `HD-${row.id}`,

              prefix:
                row.prefix,

              fname:
                row.fname,

              lname:
                row.lname,

              email:
                row.email,

              category:
                row.category ||
                "อื่น ๆ",

              equipment:
                row.equipment,

              location:
                row.location,

              subject:
                row.subject ||
                "ไม่มีหัวข้อ",

              detail:
                row.detail,

              priority:
                row.priority ===
                "high"
                  ? "high"
                  : row.priority ===
                    "low"
                  ? "low"
                  : "normal",

              status:
                normalizeStatus(
                  row.status
                ),

              technicianId:
                row.technicianId ??
                row.technician_id ??
                null,

              resolutionText:
                row.resolutionText ??
                row.resolution_text ??
                null,

              repairCost:
                row.repairCost ??
                row.repair_cost ??
                null,

              createdAt:
                row.createdAt ||
                row.created_at,

              acceptedAt:
                row.acceptedAt ??
                row.accepted_at ??
                null,

              startedAt:
                row.startedAt ??
                row.started_at ??
                null,

              completedAt:
                row.completedAt ??
                row.completed_at ??
                null,

              closedAt:
                row.closedAt ??
                row.closed_at ??
                null,
            })
          );

        setRepairs(mapped);
      } catch (err) {
        console.error(
          "STATISTICS LOAD ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
        );
      } finally {
        setLoading(false);
      }
    };

  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {
    loadRepairs();
  }, []);

  // ===================================================
  // SUMMARY
  // ===================================================

  const total =
    repairs.length;

  const pending =
    repairs.filter(
      (repair) =>
        repair.status ===
        "pending"
    ).length;

  const progress =
    repairs.filter(
      (repair) =>
        repair.status ===
        "progress"
    ).length;

  const done =
    repairs.filter(
      (repair) =>
        repair.status ===
        "done"
    ).length;

  const cancel =
    repairs.filter(
      (repair) =>
        repair.status ===
        "cancel"
    ).length;

  // ===================================================
  // MONTHLY DATA
  // ===================================================

  const monthlyData =
    useMemo(() => {
      const result =
        monthNames.map(
          (month, index) => ({
            month,
            value: 0,
            monthIndex: index,
          })
        );

      repairs.forEach(
        (repair) => {
          if (
            !repair.createdAt
          ) {
            return;
          }

          const date =
            new Date(
              repair.createdAt
            );

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return;
          }

          const year =
            date.getFullYear();

          if (
            year !==
            selectedYear
          ) {
            return;
          }

          const month =
            date.getMonth();

          result[month].value++;
        }
      );

      return result;
    }, [
      repairs,
      selectedYear,
    ]);

  const maxMonthly =
    Math.max(
      ...monthlyData.map(
        (item) =>
          item.value
      ),
      1
    );

  // ===================================================
  // CATEGORY DATA
  // ===================================================

  const categoryData =
    useMemo(() => {
      const categoryMap =
        new Map<
          string,
          number
        >();

      repairs.forEach(
        (repair) => {
          const name =
            getCategoryName(
              repair.category
            );

          categoryMap.set(
            name,
            (categoryMap.get(
              name
            ) || 0) + 1
          );
        }
      );

      const order = [
        "คอมพิวเตอร์",
        "ระบบเครือข่าย",
        "เครื่องพิมพ์",
        "โสตทัศนูปกรณ์",
        "อุปกรณ์สำนักงาน",
        "อื่น ๆ",
      ];

      return order
        .map(
          (name) => {
            const value =
              categoryMap.get(
                name
              ) || 0;

            const percent =
              total > 0
                ? Math.round(
                    (value /
                      total) *
                      100
                  )
                : 0;

            const info =
              Object.values(
                categoryInfo
              ).find(
                (item) =>
                  item.name ===
                  name
              );

            return {
              name,
              value,
              percent,
              icon:
                info?.icon ||
                "•••",
              className:
                info?.className ||
                "gray",
            };
          }
        )
        .filter(
          (item) =>
            item.value > 0
        );
    }, [
      repairs,
      total,
    ]);

  // ===================================================
  // TOP CATEGORY
  // ===================================================

  const topCategory =
    categoryData.length >
    0
      ? categoryData.reduce(
          (max, item) =>
            item.value >
            max.value
              ? item
              : max
        )
      : null;

  // ===================================================
  // COMPLETION RATE
  // ===================================================

  const completionRate =
    total > 0
      ? Math.round(
          (done / total) *
            100
        )
      : 0;

  // ===================================================
  // CURRENT MONTH
  // ===================================================

  const currentMonth =
    new Date().getMonth();

  const currentYear =
    new Date().getFullYear();

  const currentMonthCount =
    repairs.filter(
      (repair) => {
        if (
          !repair.createdAt
        ) {
          return false;
        }

        const date =
          new Date(
            repair.createdAt
          );

        return (
          date.getFullYear() ===
            currentYear &&
          date.getMonth() ===
            currentMonth
        );
      }
    ).length;

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    fetch("/api/logout", { method: "POST" }).finally(() => {
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      router.push("/login");
    });
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="statistics-page">

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
            className="menu-item"
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
            className="menu-item active"
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
            className="logout"
            onClick={
              logout
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

        {/* TOPBAR */}

        <header className="topbar">

          <div className="breadcrumb">

            <span>
              Fix it
            </span>

            <b>
              /
            </b>

            <strong>
              สถิติการแจ้งซ่อม
            </strong>

          </div>

          <div className="top-actions">

            <button className="notification">
              🔔
              <span></span>
            </button>

            <div className="user-profile">

              <div className="avatar">
                U
              </div>

              <div className="user-info">

                <strong>
                  ผู้ใช้งาน
                </strong>

                <span>
                  User
                </span>

              </div>

              <span className="arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <section className="content">

          {/* PAGE HEADER */}

          <div className="page-header">

            <div>

              <span className="page-small">
                CMU IT SERVICE CENTER
              </span>

              <h1>
                สถิติการแจ้งซ่อม
              </h1>

              <p>
                ภาพรวมและข้อมูลสถิติการแจ้งซ่อมครุภัณฑ์
              </p>

            </div>

            <button
              className="new-repair"
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

          {/* LOADING */}

          {loading && (

            <div
              style={{
                padding:
                  "50px",
                textAlign:
                  "center",
              }}
            >
              กำลังโหลดข้อมูลสถิติ...
            </div>

          )}

          {/* ERROR */}

          {!loading &&
            error && (

              <div
                style={{
                  padding:
                    "30px",
                  textAlign:
                    "center",
                  color:
                    "#dc2626",
                }}
              >

                <h3>
                  ไม่สามารถโหลดข้อมูลได้
                </h3>

                <p>
                  {error}
                </p>

                <button
                  onClick={
                    loadRepairs
                  }
                  style={{
                    marginTop:
                      "15px",
                    padding:
                      "10px 18px",
                    border:
                      "none",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer",
                  }}
                >
                  ลองใหม่
                </button>

              </div>

            )}

          {!loading &&
            !error && (
              <>

                {/* ================= SUMMARY ================= */}

                <div className="stats">

                  <div className="stat-card">

                    <div className="stat-icon purple">
                      ▣
                    </div>

                    <div>

                      <span>
                        แจ้งซ่อมทั้งหมด
                      </span>

                      <strong>
                        {total}
                      </strong>

                      <small>
                        รายการ
                      </small>

                    </div>

                  </div>

                  <div className="stat-card">

                    <div className="stat-icon orange">
                      ◷
                    </div>

                    <div>

                      <span>
                        รอดำเนินการ
                      </span>

                      <strong>
                        {pending}
                      </strong>

                      <small>
                        รายการ
                      </small>

                    </div>

                  </div>

                  <div className="stat-card">

                    <div className="stat-icon blue">
                      ⚒
                    </div>

                    <div>

                      <span>
                        กำลังดำเนินการ
                      </span>

                      <strong>
                        {progress}
                      </strong>

                      <small>
                        รายการ
                      </small>

                    </div>

                  </div>

                  <div className="stat-card">

                    <div className="stat-icon green">
                      ✓
                    </div>

                    <div>

                      <span>
                        ดำเนินการเสร็จแล้ว
                      </span>

                      <strong>
                        {done}
                      </strong>

                      <small>
                        รายการ
                      </small>

                    </div>

                  </div>

                </div>

                {/* ================= CHART GRID ================= */}

                <div className="chart-grid">

                  {/* MONTHLY */}

                  <div className="panel monthly-panel">

                    <div className="panel-header">

                      <div>

                        <h2>
                          จำนวนการแจ้งซ่อมรายเดือน
                        </h2>

                        <p>
                          สถิติจากข้อมูลจริงในระบบ
                        </p>

                      </div>

                      <select
                        className="period-select"
                        value={
                          selectedYear
                        }
                        onChange={(
                          e
                        ) =>
                          setSelectedYear(
                            Number(
                              e.target.value
                            )
                          )
                        }
                      >

                        <option
                          value={
                            currentYear
                          }
                        >
                          ปี{" "}
                          {currentYear +
                            543}
                        </option>

                        <option
                          value={
                            currentYear -
                            1
                          }
                        >
                          ปี{" "}
                          {currentYear +
                            542}
                        </option>

                      </select>

                    </div>

                    <div className="chart">

                      <div className="y-axis">

                        <span>
                          {maxMonthly}
                        </span>

                        <span>
                          {Math.round(
                            maxMonthly *
                              0.75
                          )}
                        </span>

                        <span>
                          {Math.round(
                            maxMonthly *
                              0.5
                          )}
                        </span>

                        <span>
                          {Math.round(
                            maxMonthly *
                              0.25
                          )}
                        </span>

                        <span>
                          0
                        </span>

                      </div>

                      <div className="bars">

                        {monthlyData.map(
                          (
                            item
                          ) => {

                            const height =
                              maxMonthly >
                              0
                                ? (item.value /
                                    maxMonthly) *
                                  100
                                : 0;

                            return (

                              <div
                                className="bar-column"
                                key={
                                  item.month
                                }
                              >

                                <div className="bar-value">
                                  {
                                    item.value
                                  }
                                </div>

                                <div className="bar-area">

                                  <div
                                    className="bar"
                                    style={{
                                      height: `${height}%`,
                                    }}
                                  />

                                </div>

                                <span className="bar-label">
                                  {
                                    item.month
                                  }
                                </span>

                              </div>

                            );
                          }
                        )}

                      </div>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="panel status-panel">

                    <div className="panel-header">

                      <div>

                        <h2>
                          สถานะการแจ้งซ่อม
                        </h2>

                        <p>
                          ภาพรวมรายการทั้งหมด
                        </p>

                      </div>

                    </div>

                    <div className="donut-wrapper">

                      <div
                        className="donut"
                        style={{
                          background:
                            `conic-gradient(
                              #f59e0b 0% ${
                                total
                                  ? (pending /
                                      total) *
                                    100
                                  : 0
                              }%,
                              #3b82f6 ${
                                total
                                  ? (pending /
                                      total) *
                                    100
                                  : 0
                              }% ${
                                total
                                  ? ((pending +
                                      progress) /
                                      total) *
                                    100
                                  : 0
                              }%,
                              #22c55e ${
                                total
                                  ? ((pending +
                                      progress) /
                                      total) *
                                    100
                                  : 0
                              }% ${
                                total
                                  ? ((pending +
                                      progress +
                                      done) /
                                      total) *
                                    100
                                  : 0
                              }%,
                              #d1d5db ${
                                total
                                  ? ((pending +
                                      progress +
                                      done) /
                                      total) *
                                    100
                                  : 0
                              }% 100%
                            )`,
                        }}
                      >

                        <div className="donut-center">

                          <strong>
                            {total}
                          </strong>

                          <span>
                            รายการ
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="status-list">

                      <div className="status-item">

                        <span>
                          <i className="dot orange-dot" />
                          รอดำเนินการ
                        </span>

                        <strong>
                          {pending}
                        </strong>

                      </div>

                      <div className="status-item">

                        <span>
                          <i className="dot blue-dot" />
                          กำลังดำเนินการ
                        </span>

                        <strong>
                          {progress}
                        </strong>

                      </div>

                      <div className="status-item">

                        <span>
                          <i className="dot green-dot" />
                          ดำเนินการเสร็จแล้ว
                        </span>

                        <strong>
                          {done}
                        </strong>

                      </div>

                      <div className="status-item">

                        <span>
                          <i className="dot gray-dot" />
                          ยกเลิก
                        </span>

                        <strong>
                          {cancel}
                        </strong>

                      </div>

                    </div>

                  </div>

                </div>

                {/* ================= CATEGORY ================= */}

                <div className="panel category-panel">

                  <div className="panel-header">

                    <div>

                      <h2>
                        สถิติการแจ้งซ่อมตามประเภท
                      </h2>

                      <p>
                        จำนวนรายการแยกตามประเภทอุปกรณ์
                      </p>

                    </div>

                    <button
                      className="view-all"
                      onClick={() =>
                        router.push(
                          "/repair-list"
                        )
                      }
                    >
                      ดูรายการทั้งหมด →
                    </button>

                  </div>

                  <div className="category-list">

                    {categoryData.length >
                    0 ? (

                      categoryData.map(
                        (
                          category
                        ) => (

                          <div
                            className="category-row"
                            key={
                              category.name
                            }
                          >

                            <div className="category-info">

                              <div
                                className={`category-icon ${category.className}`}
                              >
                                {
                                  category.icon
                                }
                              </div>

                              <div>

                                <strong>
                                  {
                                    category.name
                                  }
                                </strong>

                                <span>
                                  {
                                    category.value
                                  }{" "}
                                  รายการ
                                </span>

                              </div>

                            </div>

                            <div className="category-progress">

                              <div className="progress-track">

                                <div
                                  className={`progress-fill ${category.className}`}
                                  style={{
                                    width: `${category.percent}%`,
                                  }}
                                />

                              </div>

                              <strong>
                                {
                                  category.percent
                                }
                                %
                              </strong>

                            </div>

                          </div>

                        )
                      )

                    ) : (

                      <div
                        style={{
                          padding:
                            "30px",
                          textAlign:
                            "center",
                        }}
                      >
                        ยังไม่มีข้อมูลประเภทการแจ้งซ่อม
                      </div>

                    )}

                  </div>

                </div>

                {/* ================= INSIGHT ================= */}

                <div className="insight-grid">

                  <div className="insight-card purple-insight">

                    <div className="insight-icon">
                      ↗
                    </div>

                    <div>

                      <span>
                        ประเภทที่แจ้งซ่อมมากที่สุด
                      </span>

                      <strong>
                        {topCategory
                          ?.name ||
                          "-"}
                      </strong>

                      <small>
                        {topCategory
                          ? `คิดเป็น ${topCategory.percent}% ของการแจ้งซ่อมทั้งหมด`
                          : "ยังไม่มีข้อมูล"}
                      </small>

                    </div>

                  </div>

                  <div className="insight-card blue-insight">

                    <div className="insight-icon">
                      ✓
                    </div>

                    <div>

                      <span>
                        อัตราการซ่อมเสร็จ
                      </span>

                      <strong>
                        {
                          completionRate
                        }
                        %
                      </strong>

                      <small>
                        {done} จาก{" "}
                        {total}{" "}
                        รายการดำเนินการเสร็จแล้ว
                      </small>

                    </div>

                  </div>

                  <div className="insight-card green-insight">

                    <div className="insight-icon">
                      ⚡
                    </div>

                    <div>

                      <span>
                        จำนวนแจ้งซ่อมเดือนนี้
                      </span>

                      <strong>
                        {
                          currentMonthCount
                        }{" "}
                        รายการ
                      </strong>

                      <small>
                        ข้อมูลจากฐานข้อมูลจริง
                      </small>

                    </div>

                  </div>

                </div>

                {/* ================= REFRESH ================= */}

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    marginTop:
                      "20px",
                  }}
                >

                  <button
                    onClick={
                      loadRepairs
                    }
                    style={{
                      padding:
                        "10px 18px",
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "8px",
                      background:
                        "#fff",
                      cursor:
                        "pointer",
                    }}
                  >
                    ↻ รีเฟรชข้อมูล
                  </button>

                </div>

                {/* FOOTER */}

                <footer>

                  <span>
                    © 2026 Fix it
                  </span>

                  <span>
                    มหาวิทยาลัยเชียงใหม่
                  </span>

                </footer>

              </>
            )}

        </section>

      </main>

    </div>
  );
}