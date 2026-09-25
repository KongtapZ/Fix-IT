"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

type RepairStatus = "pending" | "progress" | "done";
type Priority = "low" | "normal" | "high";

type Repair = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: Priority;
  status: RepairStatus;
  date: string;
  reporter: string;
  phone: string;
  description: string;
  technician: string;
};

const initialRepairData: Repair[] = [
  {
    id: "HD-00128",
    title: "คอมพิวเตอร์เปิดไม่ติด",
    category: "คอมพิวเตอร์",
    location: "สำนักงานคณะ",
    priority: "high",
    status: "progress",
    date: "19 ก.ย. 2569",
    reporter: "นายสมชาย ใจดี",
    phone: "08x-xxx-xxxx",
    description:
      "เครื่องคอมพิวเตอร์เปิดไม่ติด เมื่อกดปุ่ม Power ไม่มีการแสดงผลบนหน้าจอ",
    technician: "ช่าง IT",
  },
  {
    id: "HD-00127",
    title: "เครื่องพิมพ์ไม่สามารถพิมพ์ได้",
    category: "เครื่องพิมพ์",
    location: "ห้องธุรการ",
    priority: "normal",
    status: "pending",
    date: "18 ก.ย. 2569",
    reporter: "นางสาวสุภาวดี แสงทอง",
    phone: "08x-xxx-xxxx",
    description:
      "เครื่องพิมพ์เชื่อมต่อกับคอมพิวเตอร์แล้ว แต่ไม่สามารถสั่งพิมพ์เอกสารได้",
    technician: "-",
  },
  {
    id: "HD-00126",
    title: "โปรเจกเตอร์ภาพไม่ชัด",
    category: "โสตทัศนูปกรณ์",
    location: "ห้องประชุม 1",
    priority: "normal",
    status: "done",
    date: "18 ก.ย. 2569",
    reporter: "นายกิตติพงษ์ บุญมี",
    phone: "08x-xxx-xxxx",
    description:
      "ภาพจากโปรเจกเตอร์มีความเบลอและไม่สามารถปรับโฟกัสได้",
    technician: "คุณสมชาย",
  },
  {
    id: "HD-00125",
    title: "อินเทอร์เน็ตใช้งานไม่ได้",
    category: "ระบบเครือข่าย",
    location: "ห้องปฏิบัติการคอมพิวเตอร์",
    priority: "high",
    status: "done",
    date: "17 ก.ย. 2569",
    reporter: "นายวิชัย คงดี",
    phone: "08x-xxx-xxxx",
    description:
      "ไม่สามารถเชื่อมต่อเครือข่ายอินเทอร์เน็ตภายในห้องปฏิบัติการได้",
    technician: "คุณวิชัย",
  },
  {
    id: "HD-00124",
    title: "คีย์บอร์ดใช้งานไม่ได้",
    category: "คอมพิวเตอร์",
    location: "ห้องสำนักงาน",
    priority: "low",
    status: "pending",
    date: "17 ก.ย. 2569",
    reporter: "นายธนกร มีสุข",
    phone: "08x-xxx-xxxx",
    description:
      "ปุ่มคีย์บอร์ดบางปุ่มไม่สามารถใช้งานได้",
    technician: "-",
  },
  {
    id: "HD-00123",
    title: "ระบบ Wi-Fi ขัดข้อง",
    category: "ระบบเครือข่าย",
    location: "อาคารเรียน 2",
    priority: "high",
    status: "progress",
    date: "16 ก.ย. 2569",
    reporter: "นางสาวพิมพ์ชนก ใจดี",
    phone: "08x-xxx-xxxx",
    description:
      "ผู้ใช้งานหลายเครื่องไม่สามารถเชื่อมต่อ Wi-Fi ได้",
    technician: "ช่าง IT",
  },
];

const technicians = [
  {
    id: 1,
    name: "ช่าง IT",
    username: "technician01",
    jobs: 12,
    status: "พร้อมปฏิบัติงาน",
  },
  {
    id: 2,
    name: "คุณสมชาย",
    username: "somchai",
    jobs: 8,
    status: "กำลังปฏิบัติงาน",
  },
  {
    id: 3,
    name: "คุณวิชัย",
    username: "wichai",
    jobs: 5,
    status: "พร้อมปฏิบัติงาน",
  },
];

const users = [
  {
    id: 1,
    name: "นายสมชาย ใจดี",
    username: "somchai01",
    role: "ผู้แจ้ง",
    status: "ใช้งาน",
  },
  {
    id: 2,
    name: "นางสาวสุภาวดี แสงทอง",
    username: "supawadee",
    role: "ผู้แจ้ง",
    status: "ใช้งาน",
  },
  {
    id: 3,
    name: "ช่าง IT",
    username: "technician01",
    role: "ช่างซ่อม",
    status: "ใช้งาน",
  },
];

const emptyForm: Omit<Repair, "id" | "date"> = {
  title: "",
  category: "คอมพิวเตอร์",
  location: "",
  priority: "normal",
  status: "pending",
  reporter: "",
  phone: "",
  description: "",
  technician: "-",
};

export default function AdminPage() {
  const router = useRouter();

  /* =========================
     STATE
  ========================= */

  const [repairs, setRepairs] =
    useState<Repair[]>(initialRepairData);

  const [activeMenu, setActiveMenu] =
    useState("dashboard");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  // CRUD Modal
  const [showFormModal, setShowFormModal] =
    useState(false);

  const [formMode, setFormMode] =
    useState<"create" | "edit">("create");

  const [formData, setFormData] =
    useState<Omit<Repair, "id" | "date">>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  // Detail Modal
  const [showDetail, setShowDetail] =
    useState(false);

  const [selectedRepair, setSelectedRepair] =
    useState<Repair | null>(null);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Repair | null>(null);

  /* =========================
     STATISTICS
  ========================= */

  const stats = useMemo(() => {
    return {
      total: repairs.length,

      pending: repairs.filter(
        (r) => r.status === "pending"
      ).length,

      progress: repairs.filter(
        (r) => r.status === "progress"
      ).length,

      done: repairs.filter(
        (r) => r.status === "done"
      ).length,

      high: repairs.filter(
        (r) => r.priority === "high"
      ).length,
    };
  }, [repairs]);

  /* =========================
     FILTER
  ========================= */

  const filteredRepairs = useMemo(() => {
    return repairs.filter((repair) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        repair.id.toLowerCase().includes(keyword) ||
        repair.title.toLowerCase().includes(keyword) ||
        repair.reporter.toLowerCase().includes(keyword) ||
        repair.location.toLowerCase().includes(keyword) ||
        repair.technician.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" ||
        repair.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [repairs, search, statusFilter]);

  /* =========================
     CRUD - CREATE
  ========================= */

  const openCreateModal = () => {
    setFormMode("create");
    setEditingId(null);
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  /* =========================
     CRUD - READ
  ========================= */

  const openDetail = (repair: Repair) => {
    setSelectedRepair(repair);
    setShowDetail(true);
  };

  /* =========================
     CRUD - UPDATE
  ========================= */

  const openEditModal = (repair: Repair) => {
    setFormMode("edit");
    setEditingId(repair.id);

    setFormData({
      title: repair.title,
      category: repair.category,
      location: repair.location,
      priority: repair.priority,
      status: repair.status,
      reporter: repair.reporter,
      phone: repair.phone,
      description: repair.description,
      technician: repair.technician,
    });

    setShowFormModal(true);
  };

  /* =========================
     CRUD - DELETE
  ========================= */

  const openDeleteModal = (repair: Repair) => {
    setDeleteTarget(repair);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setRepairs((current) =>
      current.filter(
        (repair) => repair.id !== deleteTarget.id
      )
    );

    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  /* =========================
     SAVE CREATE / UPDATE
  ========================= */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("กรุณากรอกหัวข้อปัญหา");
      return;
    }

    if (!formData.location.trim()) {
      alert("กรุณากรอกสถานที่");
      return;
    }

    if (!formData.reporter.trim()) {
      alert("กรุณากรอกชื่อผู้แจ้ง");
      return;
    }

    if (formMode === "create") {
      const newId = generateJobId();

      const newRepair: Repair = {
        id: newId,
        date: getCurrentThaiDate(),
        ...formData,
      };

      setRepairs((current) => [
        newRepair,
        ...current,
      ]);

      setShowFormModal(false);
      setFormData(emptyForm);

      alert(`เพิ่มรายการ ${newId} สำเร็จ`);
      return;
    }

    if (formMode === "edit" && editingId) {
      setRepairs((current) =>
        current.map((repair) =>
          repair.id === editingId
            ? {
                ...repair,
                ...formData,
              }
            : repair
        )
      );

      setShowFormModal(false);
      setEditingId(null);

      alert(`แก้ไขรายการ ${editingId} สำเร็จ`);
    }
  };

  /* =========================
     GENERATE JOB ID
  ========================= */

  const generateJobId = () => {
    const numbers = repairs
      .map((repair) =>
        Number(
          repair.id.replace("HD-", "")
        )
      )
      .filter((number) => !Number.isNaN(number));

    const maxNumber =
      numbers.length > 0
        ? Math.max(...numbers)
        : 0;

    return `HD-${String(
      maxNumber + 1
    ).padStart(5, "0")}`;
  };

  /* =========================
     DATE
  ========================= */

  const getCurrentThaiDate = () => {
    const now = new Date();

    const day = now.getDate();

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

    const month =
      monthNames[now.getMonth()];

    const year =
      now.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  };

  /* =========================
     MENU
  ========================= */

  const handleMenu = (menu: string) => {
    setActiveMenu(menu);

    if (menu === "dashboard") {
      setStatusFilter("all");
      return;
    }

    if (menu === "repairs") {
      router.push("/all-jobs");
      return;
    }

    if (menu === "technician") {
      router.push("/technician");
      return;
    }

    if (menu === "settings") {
      router.push("/settings");
      return;
    }

    if (menu === "pending") {
      setStatusFilter("pending");
      return;
    }

    if (menu === "progress") {
      setStatusFilter("progress");
      return;
    }

    if (menu === "done") {
      setStatusFilter("done");
      return;
    }
  };

  /* =========================
     TEXT
  ========================= */

  const statusText = (
    status: RepairStatus
  ) => {
    switch (status) {
      case "pending":
        return "รอดำเนินการ";

      case "progress":
        return "กำลังซ่อม";

      case "done":
        return "เสร็จแล้ว";

      default:
        return status;
    }
  };

  const priorityText = (
    priority: Priority
  ) => {
    switch (priority) {
      case "low":
        return "ไม่เร่งด่วน";

      case "normal":
        return "ปกติ";

      case "high":
        return "เร่งด่วน";

      default:
        return priority;
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="admin-page">

      {/* ==================================
          SIDEBAR
      ================================== */}

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="admin-logo">
            IT
          </div>

          <div>
            <h2>Fix it</h2>
            <span>ADMIN CENTER</span>
          </div>

        </div>

        <div className="admin-menu-title">
          เมนูหลัก
        </div>

        <nav className="admin-menu">

          <button
            className={`admin-menu-item ${
              activeMenu === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleMenu("dashboard")
            }
          >
            <span>▣</span>
            Dashboard
          </button>

        

          <button
            className={`admin-menu-item ${
              activeMenu === "pending"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleMenu("pending")
            }
          >
            <span>⏳</span>
            งานรอดำเนินการ
            <b>{stats.pending}</b>
          </button>

          <button
            className={`admin-menu-item ${
              activeMenu === "progress"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleMenu("progress")
            }
          >
            <span>🛠</span>
            งานกำลังซ่อม
            <b>{stats.progress}</b>
          </button>

          <button
            className={`admin-menu-item ${
              activeMenu === "done"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleMenu("done")
            }
          >
            <span>✓</span>
            งานเสร็จแล้ว
          </button>

        </nav>

        <div className="admin-menu-title">
          จัดการระบบ
        </div>

        <nav className="admin-menu">

          <button
            className={`admin-menu-item ${
              activeMenu === "users"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveMenu("users")
            }
          >
            <span>👥</span>
            จัดการผู้ใช้งาน
          </button>

          <button
            className={`admin-menu-item ${
              activeMenu === "technician"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleMenu("technician")
            }
          >
            <span>👨‍🔧</span>
            จัดการช่าง
          </button>

          <button
            className={`admin-menu-item ${
              activeMenu === "report"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveMenu("report")
            }
          >
            <span>📊</span>
            รายงาน / สถิติ
          </button>

          <button
            className={`admin-menu-item ${
              activeMenu === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleMenu("settings")
            }
          >
            <span>⚙</span>
            ตั้งค่าระบบ
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <div className="admin-profile">

            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>Administrator</strong>
              <span>ผู้ดูแลระบบ</span>
            </div>

          </div>

          <button
            className="admin-logout"
            onClick={() =>
              fetch("/api/logout", { method: "POST" }).finally(() =>
                router.push("/login")
              )
            }
          >
            ออกจากระบบ
          </button>

        </div>

      </aside>

      {/* ==================================
          MAIN
      ================================== */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div>

            <div className="admin-breadcrumb">
              Fix it / Admin
            </div>

            <h1>
              Admin Dashboard
            </h1>

          </div>

          <div className="admin-topbar-right">

            <button className="admin-notification">
              🔔
              <span>3</span>
            </button>

            <div className="admin-user">

              <div className="admin-avatar">
                A
              </div>

              <div>
                <strong>
                  Administrator
                </strong>

                <small>
                  ผู้ดูแลระบบ
                </small>
              </div>

            </div>

          </div>

        </header>

        <div className="admin-content">

          {/* ==================================
              WELCOME
          ================================== */}

          <section className="admin-welcome">

            <div>

              <h2>
                ระบบจัดการแจ้งซ่อมบำรุง
              </h2>

              <p>
                คณะสังคมศาสตร์
                มหาวิทยาลัยเชียงใหม่
              </p>

            </div>

            <div className="admin-date">
              📅 {getCurrentThaiDate()}
            </div>

          </section>

          {/* ==================================
              STATISTICS
          ================================== */}

          <section className="admin-stats">

            <div className="admin-stat-card">

              <div className="admin-stat-icon blue">
                📋
              </div>

              <div>
                <span>
                  รายการแจ้งซ่อมทั้งหมด
                </span>

                <strong>
                  {stats.total}
                </strong>

                <small>
                  รายการ
                </small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon orange">
                ⏳
              </div>

              <div>
                <span>
                  รอดำเนินการ
                </span>

                <strong>
                  {stats.pending}
                </strong>

                <small>
                  รายการ
                </small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon purple">
                🔧
              </div>

              <div>
                <span>
                  กำลังซ่อม
                </span>

                <strong>
                  {stats.progress}
                </strong>

                <small>
                  รายการ
                </small>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon green">
                ✓
              </div>

              <div>
                <span>
                  ซ่อมเสร็จแล้ว
                </span>

                <strong>
                  {stats.done}
                </strong>

                <small>
                  รายการ
                </small>
              </div>

            </div>

          </section>

          {/* ==================================
              QUICK ACTION
          ================================== */}

          <section className="admin-quick-actions">

            <div className="admin-section-title">

              <h2>
                การจัดการด่วน
              </h2>

              <span>
                Quick Actions
              </span>

            </div>

            <div className="admin-action-grid">

              {/* CREATE */}

              <button
                onClick={openCreateModal}
              >
                <div>➕</div>

                <strong>
                  เพิ่มรายการแจ้งซ่อม
                </strong>

                <span>
                  สร้างรายการใหม่
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveMenu("pending");
                  setStatusFilter("pending");
                }}
              >
                <div>⏳</div>

                <strong>
                  ตรวจสอบงานใหม่
                </strong>

                <span>
                  {stats.pending} รายการ
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveMenu("progress");
                  setStatusFilter("progress");
                }}
              >
                <div>🔧</div>

                <strong>
                  ติดตามงานซ่อม
                </strong>

                <span>
                  {stats.progress} รายการ
                </span>
              </button>

              <button
                onClick={() =>
                  setActiveMenu("users")
                }
              >
                <div>👥</div>

                <strong>
                  จัดการผู้ใช้งาน
                </strong>

                <span>
                  {users.length} บัญชี
                </span>
              </button>

            </div>

          </section>

          {/* ==================================
              REPAIR TABLE
          ================================== */}

          <section className="admin-panel">

            <div className="admin-panel-header">

              <div>

                <h2>
                  รายการแจ้งซ่อม
                </h2>

                <span>
                  เพิ่ม แก้ไข ลบ และติดตามงานแจ้งซ่อม
                </span>

              </div>

              {/* CREATE */}

              <button
                className="admin-primary-button"
                onClick={openCreateModal}
              >
                + เพิ่มรายการ
              </button>

            </div>

            {/* FILTER */}

            <div className="admin-filters">

              <div className="admin-search">

                🔍

                <input
                  type="text"
                  placeholder="ค้นหาเลขที่งาน / หัวข้อ / ผู้แจ้ง..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );

                  setActiveMenu(
                    e.target.value === "all"
                      ? "dashboard"
                      : e.target.value
                  );
                }}
              >

                <option value="all">
                  ทุกสถานะ
                </option>

                <option value="pending">
                  รอดำเนินการ
                </option>

                <option value="progress">
                  กำลังซ่อม
                </option>

                <option value="done">
                  เสร็จแล้ว
                </option>

              </select>

            </div>

            {/* TABLE */}

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>
                      เลขที่งาน
                    </th>

                    <th>
                      รายละเอียด
                    </th>

                    <th>
                      สถานที่
                    </th>

                    <th>
                      ผู้แจ้ง
                    </th>

                    <th>
                      ช่าง
                    </th>

                    <th>
                      ความเร่งด่วน
                    </th>

                    <th>
                      สถานะ
                    </th>

                    <th>
                      วันที่
                    </th>

                    <th>
                      จัดการ
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredRepairs.map(
                    (repair) => (

                      <tr key={repair.id}>

                        <td>

                          <strong className="admin-job-id">
                            {repair.id}
                          </strong>

                        </td>

                        <td>

                          <div className="admin-job-title">

                            <strong>
                              {repair.title}
                            </strong>

                            <span>
                              {repair.category}
                            </span>

                          </div>

                        </td>

                        <td>
                          {repair.location}
                        </td>

                        <td>
                          {repair.reporter}
                        </td>

                        <td>
                          {repair.technician}
                        </td>

                        <td>

                          <span
                            className={`admin-priority ${repair.priority}`}
                          >
                            {priorityText(
                              repair.priority
                            )}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`admin-status ${repair.status}`}
                          >
                            {statusText(
                              repair.status
                            )}
                          </span>

                        </td>

                        <td>
                          {repair.date}
                        </td>

                        {/* CRUD BUTTONS */}

                        <td>

                          <div className="admin-crud-actions">

                            {/* READ */}

                            <button
                              className="admin-crud-view"
                              title="ดูรายละเอียด"
                              onClick={() =>
                                openDetail(
                                  repair
                                )
                              }
                            >
                              👁
                            </button>

                            {/* UPDATE */}

                            <button
                              className="admin-crud-edit"
                              title="แก้ไข"
                              onClick={() =>
                                openEditModal(
                                  repair
                                )
                              }
                            >
                              ✏
                            </button>

                            {/* DELETE */}

                            <button
                              className="admin-crud-delete"
                              title="ลบ"
                              onClick={() =>
                                openDeleteModal(
                                  repair
                                )
                              }
                            >
                              🗑
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

              {filteredRepairs.length === 0 && (

                <div className="admin-empty">
                  ไม่พบรายการแจ้งซ่อม
                </div>

              )}

            </div>

          </section>

          {/* ==================================
              BOTTOM GRID
          ================================== */}

          <div className="admin-bottom-grid">

            {/* TECHNICIANS */}

            <section className="admin-panel">

              <div className="admin-panel-header">

                <div>

                  <h2>
                    สถานะช่าง
                  </h2>

                  <span>
                    Technician Status
                  </span>

                </div>

                <button
                  className="admin-text-button"
                  onClick={() =>
                    handleMenu(
                      "technician"
                    )
                  }
                >
                  จัดการ
                </button>

              </div>

              <div className="admin-technician-list">

                {technicians.map(
                  (technician) => (

                    <div
                      className="admin-technician"
                      key={technician.id}
                    >

                      <div className="technician-avatar">
                        👨‍🔧
                      </div>

                      <div className="technician-info">

                        <strong>
                          {technician.name}
                        </strong>

                        <span>
                          {technician.jobs} งาน
                        </span>

                      </div>

                      <span
                        className={`technician-status ${
                          technician.status ===
                          "พร้อมปฏิบัติงาน"
                            ? "available"
                            : "busy"
                        }`}
                      >
                        {technician.status}
                      </span>

                    </div>

                  )
                )}

              </div>

            </section>

            {/* USERS */}

            <section className="admin-panel">

              <div className="admin-panel-header">

                <div>

                  <h2>
                    ผู้ใช้งานระบบ
                  </h2>

                  <span>
                    Users
                  </span>

                </div>

                <button
                  className="admin-text-button"
                  onClick={() =>
                    setActiveMenu("users")
                  }
                >
                  จัดการ
                </button>

              </div>

              <div className="admin-user-list">

                {users.map((user) => (

                  <div
                    className="admin-system-user"
                    key={user.id}
                  >

                    <div className="system-user-avatar">
                      {user.name.charAt(0)}
                    </div>

                    <div>

                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        @{user.username}
                      </span>

                    </div>

                    <div className="system-user-role">
                      {user.role}
                    </div>

                  </div>

                ))}

              </div>

            </section>

          </div>

        </div>

      </main>

      {/* ==================================
          CREATE / UPDATE MODAL
      ================================== */}

      {showFormModal && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            setShowFormModal(false)
          }
        >

          <div
            className="admin-modal admin-form-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>

                <span>
                  {formMode === "create"
                    ? "CREATE"
                    : "UPDATE"}
                </span>

                <h2>
                  {formMode === "create"
                    ? "เพิ่มรายการแจ้งซ่อม"
                    : "แก้ไขรายการแจ้งซ่อม"}
                </h2>

              </div>

              <button
                className="admin-close"
                onClick={() =>
                  setShowFormModal(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
            >

              <div className="admin-form-content">

                {/* TITLE */}

                <div className="admin-form-group">

                  <label>
                    หัวข้อปัญหา
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    placeholder="เช่น คอมพิวเตอร์เปิดไม่ติด"
                  />

                </div>

                {/* CATEGORY */}

                <div className="admin-form-row">

                  <div className="admin-form-group">

                    <label>
                      ประเภทอุปกรณ์
                    </label>

                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category:
                            e.target.value,
                        })
                      }
                    >

                      <option>
                        คอมพิวเตอร์
                      </option>

                      <option>
                        เครื่องพิมพ์
                      </option>

                      <option>
                        ระบบเครือข่าย
                      </option>

                      <option>
                        โสตทัศนูปกรณ์
                      </option>

                      <option>
                        ซอฟต์แวร์
                      </option>

                      <option>
                        อื่น ๆ
                      </option>

                    </select>

                  </div>

                  {/* LOCATION */}

                  <div className="admin-form-group">

                    <label>
                      สถานที่
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location:
                            e.target.value,
                        })
                      }
                      placeholder="เช่น ห้องสำนักงาน"
                    />

                  </div>

                </div>

                {/* REPORTER */}

                <div className="admin-form-row">

                  <div className="admin-form-group">

                    <label>
                      ผู้แจ้ง
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.reporter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reporter:
                            e.target.value,
                        })
                      }
                      placeholder="ชื่อผู้แจ้ง"
                    />

                  </div>

                  <div className="admin-form-group">

                    <label>
                      เบอร์โทรศัพท์
                    </label>

                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone:
                            e.target.value,
                        })
                      }
                      placeholder="08x-xxx-xxxx"
                    />

                  </div>

                </div>

                {/* PRIORITY + STATUS */}

                <div className="admin-form-row">

                  <div className="admin-form-group">

                    <label>
                      ความเร่งด่วน
                    </label>

                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority:
                            e.target
                              .value as Priority,
                        })
                      }
                    >

                      <option value="low">
                        ไม่เร่งด่วน
                      </option>

                      <option value="normal">
                        ปกติ
                      </option>

                      <option value="high">
                        เร่งด่วน
                      </option>

                    </select>

                  </div>

                  <div className="admin-form-group">

                    <label>
                      สถานะ
                    </label>

                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status:
                            e.target
                              .value as RepairStatus,
                        })
                      }
                    >

                      <option value="pending">
                        รอดำเนินการ
                      </option>

                      <option value="progress">
                        กำลังซ่อม
                      </option>

                      <option value="done">
                        เสร็จแล้ว
                      </option>

                    </select>

                  </div>

                </div>

                {/* TECHNICIAN */}

                <div className="admin-form-group">

                  <label>
                    ช่างผู้รับผิดชอบ
                  </label>

                  <select
                    value={formData.technician}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        technician:
                          e.target.value,
                      })
                    }
                  >

                    <option value="-">
                      ยังไม่มอบหมาย
                    </option>

                    <option value="ช่าง IT">
                      ช่าง IT
                    </option>

                    <option value="คุณสมชาย">
                      คุณสมชาย
                    </option>

                    <option value="คุณวิชัย">
                      คุณวิชัย
                    </option>

                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="admin-form-group">

                  <label>
                    รายละเอียดปัญหา
                  </label>

                  <textarea
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description:
                          e.target.value,
                      })
                    }
                    placeholder="รายละเอียดปัญหา..."
                    rows={4}
                  />

                </div>

              </div>

              {/* FOOTER */}

              <div className="admin-modal-footer">

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() =>
                    setShowFormModal(false)
                  }
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  {formMode === "create"
                    ? "เพิ่มรายการ"
                    : "บันทึกการแก้ไข"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ==================================
          READ / DETAIL MODAL
      ================================== */}

      {showDetail &&
        selectedRepair && (

          <div
            className="admin-modal-overlay"
            onClick={() =>
              setShowDetail(false)
            }
          >

            <div
              className="admin-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="admin-modal-header">

                <div>

                  <span>
                    รายละเอียดงาน
                  </span>

                  <h2>
                    {selectedRepair.id}
                  </h2>

                </div>

                <button
                  className="admin-close"
                  onClick={() =>
                    setShowDetail(false)
                  }
                >
                  ×
                </button>

              </div>

              <div className="admin-detail-content">

                <div className="admin-detail-title">

                  <h3>
                    {selectedRepair.title}
                  </h3>

                  <span
                    className={`admin-status ${selectedRepair.status}`}
                  >
                    {statusText(
                      selectedRepair.status
                    )}
                  </span>

                </div>

                <div className="admin-detail-grid">

                  <div>

                    <label>
                      ประเภท
                    </label>

                    <strong>
                      {selectedRepair.category}
                    </strong>

                  </div>

                  <div>

                    <label>
                      สถานที่
                    </label>

                    <strong>
                      {selectedRepair.location}
                    </strong>

                  </div>

                  <div>

                    <label>
                      ผู้แจ้ง
                    </label>

                    <strong>
                      {selectedRepair.reporter}
                    </strong>

                  </div>

                  <div>

                    <label>
                      เบอร์โทรศัพท์
                    </label>

                    <strong>
                      {selectedRepair.phone}
                    </strong>

                  </div>

                  <div>

                    <label>
                      ช่างผู้รับผิดชอบ
                    </label>

                    <strong>
                      {selectedRepair.technician}
                    </strong>

                  </div>

                  <div>

                    <label>
                      ความเร่งด่วน
                    </label>

                    <strong>
                      {priorityText(
                        selectedRepair.priority
                      )}
                    </strong>

                  </div>

                  <div>

                    <label>
                      วันที่แจ้ง
                    </label>

                    <strong>
                      {selectedRepair.date}
                    </strong>

                  </div>

                  <div>

                    <label>
                      สถานะ
                    </label>

                    <strong>
                      {statusText(
                        selectedRepair.status
                      )}
                    </strong>

                  </div>

                </div>

                <div className="admin-description-box">

                  <label>
                    รายละเอียดปัญหา
                  </label>

                  <p>
                    {selectedRepair.description ||
                      "ไม่มีรายละเอียด"}
                  </p>

                </div>

              </div>

              <div className="admin-modal-footer">

                <button
                  className="admin-cancel-button"
                  onClick={() =>
                    setShowDetail(false)
                  }
                >
                  ปิด
                </button>

                <button
                  className="admin-primary-button"
                  onClick={() => {
                    setShowDetail(false);

                    openEditModal(
                      selectedRepair
                    );
                  }}
                >
                  ✏ แก้ไข
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ==================================
          DELETE CONFIRM MODAL
      ================================== */}

      {showDeleteModal &&
        deleteTarget && (

          <div
            className="admin-modal-overlay"
            onClick={() =>
              setShowDeleteModal(false)
            }
          >

            <div
              className="admin-delete-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="admin-delete-icon">
                🗑
              </div>

              <h2>
                ยืนยันการลบรายการ?
              </h2>

              <p>
                คุณกำลังจะลบรายการ
                <strong>
                  {" "}
                  {deleteTarget.id}
                </strong>
              </p>

              <p className="admin-delete-warning">
                การลบข้อมูลนี้ไม่สามารถย้อนกลับได้
              </p>

              <div className="admin-delete-actions">

                <button
                  className="admin-cancel-button"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                >
                  ยกเลิก
                </button>

                <button
                  className="admin-delete-confirm"
                  onClick={
                    confirmDelete
                  }
                >
                  ลบรายการ
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}