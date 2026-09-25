"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./repair-list.css";

// =====================================================
// Types
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
  location: string;

  subject: string;
  detail: string;

  priority: "low" | "normal" | "high";

  status: RepairStatus;

  technicianId?: number | null;
  technician?: string;

  resolutionText?: string | null;
  repairCost?: number | null;

  createdAt: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  closedAt?: string | null;

  imageName?: string | null;
  imagePath?: string | null;
}

// =====================================================
// Status
// =====================================================

const statusInfo: Record<
  RepairStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "รอดำเนินการ",
    className: "status-pending",
  },

  progress: {
    label: "กำลังดำเนินการ",
    className: "status-progress",
  },

  done: {
    label: "ดำเนินการเสร็จแล้ว",
    className: "status-done",
  },

  cancel: {
    label: "ยกเลิก",
    className: "status-cancel",
  },
};

// =====================================================
// Priority
// =====================================================

const priorityInfo = {
  low: {
    label: "ต่ำ",
    className: "priority-low",
  },

  normal: {
    label: "ปกติ",
    className: "priority-normal",
  },

  high: {
    label: "เร่งด่วน",
    className: "priority-high",
  },
};

// =====================================================
// Category
// =====================================================

const categoryMap: Record<string, string> = {
  computer: "คอมพิวเตอร์",
  printer: "เครื่องพิมพ์",
  network: "ระบบเครือข่าย",
  av: "โสตทัศนูปกรณ์",
  office: "อุปกรณ์สำนักงาน",
  other: "อื่น ๆ",

  คอมพิวเตอร์: "คอมพิวเตอร์",
  เครื่องพิมพ์: "เครื่องพิมพ์",
  ระบบเครือข่าย: "ระบบเครือข่าย",
  โสตทัศนูปกรณ์: "โสตทัศนูปกรณ์",
  "อุปกรณ์สำนักงาน": "อุปกรณ์สำนักงาน",
  "อื่น ๆ": "อื่น ๆ",
};

// =====================================================
// Status Normalize
// =====================================================

function normalizeStatus(value: any): RepairStatus {
  const status = String(value || "")
    .trim()
    .toLowerCase();

  if (
    status === "done" ||
    status === "completed" ||
    status === "closed" ||
    status === "เสร็จแล้ว" ||
    status === "ดำเนินการเสร็จแล้ว"
  ) {
    return "done";
  }

  if (
    status === "progress" ||
    status === "in_progress" ||
    status === "กำลังดำเนินการ"
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
// Format Date
// =====================================================

function formatDate(value: any) {
  if (!value) {
    return "-";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

// =====================================================
// Main
// =====================================================

export default function RepairListPage() {
  const router = useRouter();

  // ===================================================
  // State
  // ===================================================

  const [repairs, setRepairs] = useState<Repair[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [selectedRepair, setSelectedRepair] =
    useState<Repair | null>(null);

  // ===================================================
  // Load Data
  // ===================================================

  const loadRepairs = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch("/api/repair", {
          method: "GET",
          cache: "no-store",
        });

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
            "ไม่สามารถโหลดรายการแจ้งซ่อมได้"
        );
      }

      const mappedRepairs: Repair[] =
        (data.repairs || []).map(
          (row: any) => ({
            id: Number(row.id),

            repairNo:
              row.repairNo ||
              `HD-${row.id}`,

            prefix: row.prefix,
            fname: row.fname,
            lname: row.lname,
            email: row.email,

            category:
              categoryMap[
                row.category
              ] ||
              row.category ||
              "อื่น ๆ",

            equipment:
              row.equipment,

            location:
              row.location ||
              "-",

            subject:
              row.subject ||
              "ไม่มีหัวข้อ",

            detail:
              row.detail ||
              "-",

            priority:
              row.priority === "high"
                ? "high"
                : row.priority === "low"
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

            technician:
              row.technician ||
              row.technicianName ||
              "-",

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

            imageName:
              row.imageName ??
              row.image_name ??
              null,

            imagePath:
              row.imagePath ??
              row.image_path ??
              null,
          })
        );

      setRepairs(mappedRepairs);
    } catch (err) {
      console.error(
        "LOAD REPAIR LIST ERROR:",
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
  // Load เมื่อเปิดหน้า
  // ===================================================

  useEffect(() => {
    loadRepairs();
  }, []);

  // ===================================================
  // Filter
  // ===================================================

  const filteredRepairs =
    useMemo(() => {
      return repairs.filter(
        (repair) => {
          const keyword =
            search
              .toLowerCase()
              .trim();

          const matchSearch =
            !keyword ||
            repair.repairNo
              .toLowerCase()
              .includes(keyword) ||
            repair.subject
              .toLowerCase()
              .includes(keyword) ||
            repair.category
              .toLowerCase()
              .includes(keyword) ||
            repair.location
              .toLowerCase()
              .includes(keyword) ||
            `${repair.fname || ""} ${
              repair.lname || ""
            }`
              .toLowerCase()
              .includes(keyword);

          const matchStatus =
            statusFilter === "all" ||
            repair.status ===
              statusFilter;

          const matchCategory =
            categoryFilter === "all" ||
            repair.category ===
              categoryFilter;

          return (
            matchSearch &&
            matchStatus &&
            matchCategory
          );
        }
      );
    }, [
      repairs,
      search,
      statusFilter,
      categoryFilter,
    ]);

  // ===================================================
  // Summary
  // ===================================================

  const total =
    repairs.length;

  const pending =
    repairs.filter(
      (r) =>
        r.status === "pending"
    ).length;

  const progress =
    repairs.filter(
      (r) =>
        r.status === "progress"
    ).length;

  const done =
    repairs.filter(
      (r) =>
        r.status === "done"
    ).length;

  // ===================================================
  // Render
  // ===================================================

  return (
    <main className="repair-list-page">

      {/* =================================================
          Sidebar
      ================================================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            CMU
          </div>

          <div>
            <h2>
              Fix it
            </h2>

            <span>
              IT SERVICE CENTER
            </span>
          </div>

        </div>

        <nav className="sidebar-menu">

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
          >
            <span>▦</span>
            <span>
              Dashboard
            </span>
          </button>

          <button
            className="active"
            onClick={() =>
              router.push(
                "/repair-list"
              )
            }
          >
            <span>☷</span>
            <span>
              รายการแจ้งซ่อม
            </span>
          </button>

          <button
            onClick={() =>
              router.push(
                "/repair"
              )
            }
          >
            <span>＋</span>
            <span>
              แจ้งซ่อมใหม่
            </span>
          </button>

          {/* แก้ตรงนี้ */}
          <button
            onClick={() =>
              router.push(
                "/statistics"
              )
            }
          >
            <span>◔</span>
            <span>
              สถิติการแจ้งซ่อม
            </span>
          </button>

          <button
            onClick={() =>
              router.push(
                "/settings"
              )
            }
          >
            <span>⚙</span>
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

              <p>
                ติดต่อ IT Support
              </p>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={() =>
              router.push("/")
            }
          >
            <span>↪</span>
            ออกจากระบบ
          </button>

        </div>

      </aside>

      {/* =================================================
          Main
      ================================================= */}

      <section className="main-content">

        {/* Topbar */}

        <header className="topbar">

          <div>

            <div className="breadcrumb">
              หน้าหลัก
              <span>/</span>
              รายการแจ้งซ่อม
            </div>

            <h1>
              รายการแจ้งซ่อม
            </h1>

            <p>
              จัดการและติดตามรายการแจ้งซ่อมทั้งหมด
            </p>

          </div>

          <div className="top-actions">

            <button className="notification-btn">
              🔔
              <span></span>
            </button>

            <div className="profile">

              <div className="profile-avatar">
                G
              </div>

              <div>
                <strong>
                  ผู้ใช้งาน
                </strong>

                <small>
                  Guest
                </small>
              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            Summary
        ================================================= */}

        <div className="summary-grid">

          <div className="summary-card">

            <div className="summary-icon purple">
              ▣
            </div>

            <div>
              <span>
                รายการทั้งหมด
              </span>

              <strong>
                {total}
              </strong>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon orange">
              ◷
            </div>

            <div>
              <span>
                รอดำเนินการ
              </span>

              <strong>
                {pending}
              </strong>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon blue">
              ⚙
            </div>

            <div>
              <span>
                กำลังดำเนินการ
              </span>

              <strong>
                {progress}
              </strong>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon green">
              ✓
            </div>

            <div>
              <span>
                เสร็จแล้ว
              </span>

              <strong>
                {done}
              </strong>
            </div>

          </div>

        </div>

        {/* =================================================
            List
        ================================================= */}

        <section className="list-card">

          <div className="list-header">

            <div>

              <h2>
                รายการแจ้งซ่อมทั้งหมด
              </h2>

              <p>
                พบ{" "}
                <strong>
                  {filteredRepairs.length}
                </strong>{" "}
                รายการ
              </p>

            </div>

            <button
              className="new-repair-btn"
              onClick={() =>
                router.push(
                  "/repair"
                )
              }
            >
              ＋ แจ้งซ่อมใหม่
            </button>

          </div>

          {/* =================================================
              Filters
          ================================================= */}

          <div className="filters">

            <div className="search-box">

              <span>⌕</span>

              <input
                type="text"
                placeholder="ค้นหาเลขที่แจ้งซ่อม, หัวข้อ, สถานที่..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                สถานะทั้งหมด
              </option>

              <option value="pending">
                รอดำเนินการ
              </option>

              <option value="progress">
                กำลังดำเนินการ
              </option>

              <option value="done">
                ดำเนินการเสร็จแล้ว
              </option>

              <option value="cancel">
                ยกเลิก
              </option>

            </select>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >

              <option value="all">
                ประเภททั้งหมด
              </option>

              <option value="คอมพิวเตอร์">
                คอมพิวเตอร์
              </option>

              <option value="เครื่องพิมพ์">
                เครื่องพิมพ์
              </option>

              <option value="ระบบเครือข่าย">
                ระบบเครือข่าย
              </option>

              <option value="โสตทัศนูปกรณ์">
                โสตทัศนูปกรณ์
              </option>

              <option value="อุปกรณ์สำนักงาน">
                อุปกรณ์สำนักงาน
              </option>

              <option value="อื่น ๆ">
                อื่น ๆ
              </option>

            </select>

            <button
              type="button"
              onClick={loadRepairs}
              style={{
                padding:
                  "10px 14px",
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
              ↻ รีเฟรช
            </button>

          </div>

          {/* =================================================
              Loading
          ================================================= */}

          {loading && (
            <div
              style={{
                padding: "50px",
                textAlign:
                  "center",
              }}
            >
              กำลังโหลดข้อมูล...
            </div>
          )}

          {/* =================================================
              Error
          ================================================= */}

          {!loading && error && (
            <div
              style={{
                padding: "30px",
                textAlign:
                  "center",
                color: "#dc2626",
              }}
            >

              <h3>
                ไม่สามารถโหลดข้อมูลได้
              </h3>

              <p>
                {error}
              </p>

              <button
                onClick={loadRepairs}
                style={{
                  marginTop:
                    "15px",
                  padding:
                    "10px 18px",
                  border: "none",
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

          {/* =================================================
              Table
          ================================================= */}

          {!loading &&
            !error && (
              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        เลขที่
                      </th>

                      <th>
                        รายการแจ้งซ่อม
                      </th>

                      <th>
                        ประเภท
                      </th>

                      <th>
                        สถานที่
                      </th>

                      <th>
                        ความเร่งด่วน
                      </th>

                      <th>
                        วันที่แจ้ง
                      </th>

                      <th>
                        สถานะ
                      </th>

                      <th>
                        จัดการ
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredRepairs.length >
                    0 ? (
                      filteredRepairs.map(
                        (repair) => (

                          <tr
                            key={
                              repair.id
                            }
                          >

                            <td>

                              <strong className="repair-id">
                                {repair.repairNo}
                              </strong>

                            </td>

                            <td>

                              <div className="repair-title">

                                <strong>
                                  {
                                    repair.subject
                                  }
                                </strong>

                                <span>
                                  {repair.technician &&
                                  repair.technician !==
                                    "-"
                                    ? repair.technician
                                    : "ยังไม่มีผู้รับผิดชอบ"}
                                </span>

                              </div>

                            </td>

                            <td>
                              {
                                repair.category
                              }
                            </td>

                            <td>
                              {
                                repair.location
                              }
                            </td>

                            <td>

                              <span
                                className={`priority ${
                                  priorityInfo[
                                    repair.priority
                                  ]
                                    .className
                                }`}
                              >
                                {
                                  priorityInfo[
                                    repair.priority
                                  ].label
                                }
                              </span>

                            </td>

                            <td>
                              {formatDate(
                                repair.createdAt
                              )}
                            </td>

                            <td>

                              <span
                                className={`status ${
                                  statusInfo[
                                    repair.status
                                  ]
                                    .className
                                }`}
                              >

                                <i></i>

                                {
                                  statusInfo[
                                    repair.status
                                  ].label
                                }

                              </span>

                            </td>

                            <td>

                              <button
                                className="view-btn"
                                onClick={() =>
                                  setSelectedRepair(
                                    repair
                                  )
                                }
                              >
                                ดูรายละเอียด
                              </button>

                            </td>

                          </tr>

                        )
                      )
                    ) : (

                      <tr>

                        <td colSpan={8}>

                          <div className="empty-state">

                            <div>
                              ⌕
                            </div>

                            <h3>
                              ไม่พบรายการแจ้งซ่อม
                            </h3>

                            <p>
                              ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                            </p>

                          </div>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>
            )}

        </section>

      </section>

      {/* =================================================
          Detail Modal
      ================================================= */}

      {selectedRepair && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedRepair(
              null
            )
          }
        >

          <div
            className="detail-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span>
                  {
                    selectedRepair.repairNo
                  }
                </span>

                <h2>
                  {
                    selectedRepair.subject
                  }
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedRepair(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="modal-status">

              <span
                className={`status ${
                  statusInfo[
                    selectedRepair.status
                  ].className
                }`}
              >

                <i></i>

                {
                  statusInfo[
                    selectedRepair.status
                  ].label
                }

              </span>

            </div>

            <div className="detail-grid">

              <div>

                <label>
                  ผู้แจ้ง
                </label>

                <strong>
                  {selectedRepair.prefix}{" "}
                  {selectedRepair.fname}{" "}
                  {selectedRepair.lname}
                </strong>

              </div>

              <div>

                <label>
                  ประเภท
                </label>

                <strong>
                  {
                    selectedRepair.category
                  }
                </strong>

              </div>

              <div>

                <label>
                  อุปกรณ์
                </label>

                <strong>
                  {
                    selectedRepair.equipment ||
                    "-"
                  }
                </strong>

              </div>

              <div>

                <label>
                  สถานที่
                </label>

                <strong>
                  {
                    selectedRepair.location
                  }
                </strong>

              </div>

              <div>

                <label>
                  วันที่แจ้ง
                </label>

                <strong>
                  {formatDate(
                    selectedRepair.createdAt
                  )}
                </strong>

              </div>

              <div>

                <label>
                  ผู้รับผิดชอบ
                </label>

                <strong>
                  {
                    selectedRepair.technician ||
                    "ยังไม่มีผู้รับผิดชอบ"
                  }
                </strong>

              </div>

            </div>

            <div className="description-box">

              <label>
                รายละเอียดปัญหา
              </label>

              <p>
                {
                  selectedRepair.detail
                }
              </p>

            </div>

            {selectedRepair.resolutionText && (

              <div className="description-box">

                <label>
                  ผลการซ่อม
                </label>

                <p>
                  {
                    selectedRepair.resolutionText
                  }
                </p>

              </div>

            )}

            <button
              className="close-modal-btn"
              onClick={() =>
                setSelectedRepair(
                  null
                )
              }
            >
              ปิดหน้าต่าง
            </button>

          </div>

        </div>

      )}

    </main>
  );
}