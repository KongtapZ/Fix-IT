"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./progress-jobs.css";

type RepairStatus = "pending" | "progress" | "done";

type Repair = {
  id: string;
  title: string;
  category: string;
  location: string;
  priority: "low" | "normal" | "high";
  status: RepairStatus;
  date: string;
  reporter: string;
  phone: string;
  description: string;
  technician: string;
};

const repairData: Repair[] = [
  {
    id: "HD-00128",
    title: "คอมพิวเตอร์เปิดไม่ติด",
    category: "คอมพิวเตอร์",
    location: "สำนักงานคณะ",
    priority: "high",
    status: "progress",
    date: "07 ก.ย. 2569",
    reporter: "นายสมชาย ใจดี",
    phone: "08x-xxx-xxxx",
    description:
      "เครื่องคอมพิวเตอร์เปิดไม่ติด เมื่อกดปุ่ม Power ไม่มีการแสดงผลบนหน้าจอ",
    technician: "ช่าง IT",
  },
  {
    id: "HD-00123",
    title: "ระบบ Wi-Fi ขัดข้อง",
    category: "ระบบเครือข่าย",
    location: "อาคารเรียน 2",
    priority: "high",
    status: "progress",
    date: "02 ก.ย. 2569",
    reporter: "นางสาวพิมพ์ชนก ใจดี",
    phone: "08x-xxx-xxxx",
    description:
      "ผู้ใช้งานหลายเครื่องไม่สามารถเชื่อมต่อ Wi-Fi ได้",
    technician: "ช่าง IT",
  },
];

export default function ProgressJobsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [repairs, setRepairs] = useState<Repair[]>(repairData);
  const [search, setSearch] = useState("");

  const [selectedRepair, setSelectedRepair] =
    useState<Repair | null>(null);

  const [showResultBox, setShowResultBox] =
    useState(false);

  const [repairResult, setRepairResult] =
    useState("");

  // =========================================================
  // ตรวจสอบว่าเมนูไหนเป็นหน้าปัจจุบัน
  // =========================================================
  const isActive = (path: string) => {
    return pathname === path;
  };

  // =========================================================
  // งานที่กำลังดำเนินการ
  // =========================================================
  const progressJobs = repairs.filter(
    (repair) => repair.status === "progress"
  );

  // =========================================================
  // Search
  // =========================================================
  const filteredRepairs = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return progressJobs;
    }

    return progressJobs.filter((repair) => {
      return (
        repair.id.toLowerCase().includes(keyword) ||
        repair.title.toLowerCase().includes(keyword) ||
        repair.location.toLowerCase().includes(keyword) ||
        repair.reporter.toLowerCase().includes(keyword)
      );
    });
  }, [repairs, search]);

  // =========================================================
  // Priority Text
  // =========================================================
  const getPriorityText = (
    priority: Repair["priority"]
  ) => {
    switch (priority) {
      case "high":
        return "เร่งด่วน";

      case "normal":
        return "ปกติ";

      case "low":
        return "ไม่เร่งด่วน";

      default:
        return "";
    }
  };

  // =========================================================
  // ปิดงานซ่อม
  // =========================================================
  const completeRepair = (id: string) => {
    if (!repairResult.trim()) {
      alert("กรุณากรอกผลการซ่อม");
      return;
    }

    setRepairs((prev) =>
      prev.map((repair) =>
        repair.id === id
          ? {
              ...repair,
              status: "done",
            }
          : repair
      )
    );

    alert("บันทึกผลการซ่อมเรียบร้อยแล้ว");

    setShowResultBox(false);
    setRepairResult("");
    setSelectedRepair(null);
  };

  // =========================================================
  // Logout
  // =========================================================
  const logout = () => {
    fetch("/api/logout", { method: "POST" }).finally(() => {
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      router.push("/login");
    });
  };

  return (
    <div className="progress-page">

      {/* =======================================================
          SIDEBAR
      ======================================================= */}
      <aside className="progress-sidebar">

        {/* BRAND */}
        <div className="progress-brand">

          <div className="progress-logo">
            CMU
          </div>

          <div>
            <h2>Fix it</h2>

            <span>
              Technician Center
            </span>
          </div>

        </div>

        {/* MENU TITLE */}
        <div className="progress-menu-title">
          TECHNICIAN MENU
        </div>

        {/* =====================================================
            MAIN MENU
        ===================================================== */}
        <nav className="progress-menu">

          {/* Dashboard */}
          <button
            type="button"
            className={`progress-menu-item ${
              isActive("./admin/assign") ? "active" : ""
            }`}
            onClick={() =>
              router.push("./admin/assign")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          {/* งานใหม่ */}
          <button
            type="button"
            className={`progress-menu-item ${
              isActive("./technician/new-jobs") ? "active" : ""
            }`}
            onClick={() =>
              router.push("./technician/new-jobs")
            }
          >
            <span>◷</span>
            งานใหม่
          </button>

          {/* งานที่กำลังซ่อม */}
          <button
            type="button"
            className={`progress-menu-item ${
              isActive("/progress-jobs") ? "active" : ""
            }`}
            onClick={() =>
              router.push("/progress-jobs")
            }
          >
            <span>⚒</span>
            งานที่กำลังซ่อม

            <b>
              {progressJobs.length}
            </b>
          </button>

          {/* งานที่เสร็จแล้ว */}
          

          {/* งานทั้งหมด */}
          <button
            type="button"
            className={`progress-menu-item ${
              isActive("/all-jobs") ? "active" : ""
            }`}
            onClick={() =>
              router.push("/all-jobs")
            }
          >
            <span>▤</span>
            งานทั้งหมด
          </button>

        </nav>

        {/* SYSTEM */}
        <div className="progress-menu-title system">
          SYSTEM
        </div>

        <nav className="progress-menu">

          {/* ตั้งค่า */}
          <button
            type="button"
            className={`progress-menu-item ${
              isActive("/settings") ? "active" : ""
            }`}
            onClick={() =>
              router.push("/settings")
            }
          >
            <span>⚙</span>
            ตั้งค่า
          </button>

          {/* กลับหน้าผู้ใช้งาน */}
          <button
            type="button"
            className={`progress-menu-item ${
              isActive("/dashboard") ? "active" : ""
            }`}
            onClick={() =>
              router.push("/dashboard")
            }
          >
            <span>←</span>
            กลับหน้าผู้ใช้งาน
          </button>

        </nav>

        {/* =====================================================
            SIDEBAR BOTTOM
        ===================================================== */}
        <div className="progress-sidebar-bottom">

          <div className="progress-profile">

            <div className="progress-avatar">
              ช
            </div>

            <div>

              <strong>
                ช่าง IT Support
              </strong>

              <span>
                Technician
              </span>

            </div>

          </div>

          <button
            type="button"
            className="progress-logout"
            onClick={logout}
          >
            ↪
            ออกจากระบบ
          </button>

        </div>

      </aside>

      {/* =======================================================
          MAIN
      ======================================================= */}
      <main className="progress-main">

        {/* TOPBAR */}
        <header className="progress-topbar">

          <div className="progress-breadcrumb">

            <span>
              Fix it
            </span>

            <b>/</b>

            <span>
              Technician Center
            </span>

            <b>/</b>

            <strong>
              งานที่กำลังซ่อม
            </strong>

          </div>

          <div className="progress-top-user">

            <button
              type="button"
              className="progress-notification"
            >
              🔔
              <span></span>
            </button>

            <div className="progress-user">

              <div className="progress-avatar">
                ช
              </div>

              <div>

                <strong>
                  ช่าง IT Support
                </strong>

                <span>
                  เจ้าหน้าที่ซ่อมบำรุง
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <section className="progress-content">

          {/* PAGE HEADER */}
          <div className="progress-page-header">

            <div>

              <span>
                TECHNICIAN CENTER
              </span>

              <h1>
                งานที่กำลังซ่อม
              </h1>

              <p>
                รายการงานแจ้งซ่อมที่กำลังดำเนินการอยู่
              </p>

            </div>

            <div className="progress-date">
              📅 07 กันยายน 2569
            </div>

          </div>

          {/* ===================================================
              SUMMARY
          =================================================== */}
          <div className="progress-summary">

            {/* งานที่กำลังซ่อม */}
            <div className="summary-card">

              <div className="summary-icon">
                ⚒
              </div>

              <div>

                <span>
                  งานที่กำลังซ่อม
                </span>

                <strong>
                  {progressJobs.length}
                </strong>

                <small>
                  รายการ
                </small>

              </div>

            </div>

            {/* งานเร่งด่วน */}
            <div className="summary-card">

              <div className="summary-icon urgent">
                !
              </div>

              <div>

                <span>
                  งานเร่งด่วน
                </span>

                <strong>
                  {
                    progressJobs.filter(
                      (item) =>
                        item.priority === "high"
                    ).length
                  }
                </strong>

                <small>
                  รายการ
                </small>

              </div>

            </div>

            {/* กำลังดำเนินการ */}
            <div className="summary-card">

              <div className="summary-icon time">
                ◷
              </div>

              <div>

                <span>
                  กำลังดำเนินการ
                </span>

                <strong>
                  {progressJobs.length}
                </strong>

                <small>
                  งาน
                </small>

              </div>

            </div>

          </div>

          {/* ===================================================
              PANEL
          =================================================== */}
          <div className="progress-panel">

            {/* PANEL HEADER */}
            <div className="progress-panel-header">

              <div>

                <h2>
                  รายการงานที่กำลังซ่อม
                </h2>

                <p>
                  ตรวจสอบและดำเนินการงานซ่อมที่รับผิดชอบ
                </p>

              </div>

              <div className="progress-count">
                {filteredRepairs.length} งาน
              </div>

            </div>

            {/* SEARCH */}
            <div className="progress-filter">

              <div className="progress-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="ค้นหาเลขงาน ชื่องาน สถานที่ หรือผู้แจ้ง..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}
            <div className="progress-table-wrapper">

              <table className="progress-table">

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

                  {filteredRepairs.length === 0 ? (

                    <tr>

                      <td
                        colSpan={8}
                        className="progress-empty"
                      >

                        <div>

                          <span>
                            ✓
                          </span>

                          <strong>
                            ไม่มีงานที่กำลังซ่อม
                          </strong>

                          <p>
                            ขณะนี้ไม่มีรายการงานซ่อมที่กำลังดำเนินการ
                          </p>

                        </div>

                      </td>

                    </tr>

                  ) : (

                    filteredRepairs.map(
                      (repair) => (

                        <tr key={repair.id}>

                          {/* ID */}
                          <td>

                            <strong className="progress-id">
                              {repair.id}
                            </strong>

                          </td>

                          {/* DETAIL */}
                          <td>

                            <div className="progress-repair-name">

                              <strong>
                                {repair.title}
                              </strong>

                              <span>
                                {repair.category}
                              </span>

                            </div>

                          </td>

                          {/* LOCATION */}
                          <td>
                            {repair.location}
                          </td>

                          {/* REPORTER */}
                          <td>
                            {repair.reporter}
                          </td>

                          {/* PRIORITY */}
                          <td>

                            <span
                              className={`progress-priority ${repair.priority}`}
                            >
                              {getPriorityText(
                                repair.priority
                              )}
                            </span>

                          </td>

                          {/* STATUS */}
                          <td>

                            <span className="progress-status">
                              ⚒ กำลังดำเนินการ
                            </span>

                          </td>

                          {/* DATE */}
                          <td>
                            {repair.date}
                          </td>

                          {/* ACTION */}
                          <td>

                            <button
                              type="button"
                              className="progress-detail-button"
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

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* FOOTER */}
          <footer className="progress-footer">

            <span>
              © 2026 Fix it
            </span>

            <span>
              Technician Center
            </span>

          </footer>

        </section>

      </main>

      {/* =======================================================
          MODAL
      ======================================================= */}
      {selectedRepair && (

        <div
          className="progress-modal-overlay"
          onClick={() =>
            setSelectedRepair(null)
          }
        >

          <div
            className="progress-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="progress-modal-header">

              <div>

                <span>
                  {selectedRepair.id}
                </span>

                <h2>
                  {selectedRepair.title}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRepair(null)
                }
              >
                ×
              </button>

            </div>

            {/* DETAILS */}
            <div className="progress-detail-grid">

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
                  ความเร่งด่วน
                </label>

                <strong>
                  {getPriorityText(
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

            </div>

            {/* DESCRIPTION */}
            <div className="progress-description">

              <label>
                รายละเอียดปัญหา
              </label>

              <p>
                {selectedRepair.description}
              </p>

            </div>

            {/* TECHNICIAN */}
            <div className="progress-technician-box">

              <div>

                <label>
                  ผู้รับผิดชอบ
                </label>

                <strong>
                  ⚒ {selectedRepair.technician}
                </strong>

              </div>

              <div>

                <label>
                  สถานะ
                </label>

                <span className="progress-status">
                  กำลังดำเนินการ
                </span>

              </div>

            </div>

            {/* =================================================
                COMPLETE
            ================================================= */}
            {!showResultBox ? (

              <button
                type="button"
                className="progress-complete-button"
                onClick={() =>
                  setShowResultBox(true)
                }
              >
                ✓ ปิดงานซ่อม
              </button>

            ) : (

              <div className="progress-result-box">

                <label>
                  ผลการซ่อม / วิธีแก้ไข
                </label>

                <textarea
                  value={repairResult}
                  onChange={(e) =>
                    setRepairResult(
                      e.target.value
                    )
                  }
                  placeholder="กรอกผลการซ่อม เช่น เปลี่ยน Power Supply และทดสอบการใช้งานเรียบร้อยแล้ว..."
                />

                <div className="progress-result-actions">

                  {/* ยกเลิก */}
                  <button
                    type="button"
                    className="progress-cancel-button"
                    onClick={() => {
                      setShowResultBox(false);
                      setRepairResult("");
                    }}
                  >
                    ยกเลิก
                  </button>

                  {/* บันทึก */}
                  <button
                    type="button"
                    className="progress-save-button"
                    onClick={() =>
                      completeRepair(
                        selectedRepair.id
                      )
                    }
                  >
                    ✓ บันทึกผลการซ่อม
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}