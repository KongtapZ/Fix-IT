"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./all-jobs.css";

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
    id: "HD-00127",
    title: "เครื่องพิมพ์ไม่สามารถพิมพ์ได้",
    category: "เครื่องพิมพ์",
    location: "ห้องธุรการ",
    priority: "normal",
    status: "pending",
    date: "06 ก.ย. 2569",
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
    date: "05 ก.ย. 2569",
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
    date: "04 ก.ย. 2569",
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
    date: "03 ก.ย. 2569",
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
    date: "02 ก.ย. 2569",
    reporter: "นางสาวพิมพ์ชนก ใจดี",
    phone: "08x-xxx-xxxx",
    description:
      "ผู้ใช้งานหลายเครื่องไม่สามารถเชื่อมต่อ Wi-Fi ได้",
    technician: "ช่าง IT",
  },
];

export default function AllJobsPage() {
  const router = useRouter();

  const [repairs] = useState<Repair[]>(repairData);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | RepairStatus>("all");

  const [selectedRepair, setSelectedRepair] =
    useState<Repair | null>(null);

  const filteredRepairs = useMemo(() => {
    const keyword = search.toLowerCase();

    return repairs.filter((repair) => {
      const matchesSearch =
        repair.id.toLowerCase().includes(keyword) ||
        repair.title.toLowerCase().includes(keyword) ||
        repair.location.toLowerCase().includes(keyword) ||
        repair.reporter.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        repair.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [repairs, search, statusFilter]);

  const total = repairs.length;

  const pending = repairs.filter(
    (item) => item.status === "pending"
  ).length;

  const progress = repairs.filter(
    (item) => item.status === "progress"
  ).length;

  const done = repairs.filter(
    (item) => item.status === "done"
  ).length;

  const getStatusText = (status: RepairStatus) => {
    switch (status) {
      case "pending":
        return "รอดำเนินการ";
      case "progress":
        return "กำลังดำเนินการ";
      case "done":
        return "เสร็จแล้ว";
      default:
        return "";
    }
  };

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

  const logout = () => {
    fetch("/api/logout", { method: "POST" }).finally(() => {
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      router.push("/login");
    });
  };

  return (
    <div className="all-jobs-page">

      {/* SIDEBAR */}
      <aside className="all-jobs-sidebar">

        <div className="all-jobs-brand">

          <div className="all-jobs-logo">
            CMU
          </div>

          <div>
            <h2>Fix it</h2>
            <span>Technician Center</span>
          </div>

        </div>

        <div className="all-jobs-menu-title">
          TECHNICIAN MENU
        </div>

        <nav className="all-jobs-menu">

          <button
            type="button"
            className="all-jobs-menu-item"
            onClick={() =>
              router.push("./admin/assign")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className="all-jobs-menu-item"
            onClick={() =>
              router.push("./technician/new-jobs")
            }
          >
            <span>◷</span>
            งานใหม่
            <b>{pending}</b>
          </button>

          <button
            type="button"
            className="all-jobs-menu-item"
            onClick={() =>
              router.push("/progress-jobs")
            }
          >
            <span>⚒</span>
            งานที่กำลังซ่อม
            <b>{progress}</b>
          </button>

          

          <button
            type="button"
            className="all-jobs-menu-item active"
            onClick={() =>
              router.push("/all-jobs")
            }
          >
            <span>▤</span>
            งานทั้งหมด
            <b>{total}</b>
          </button>

        </nav>

        <div className="all-jobs-menu-title system">
          SYSTEM
        </div>

        <nav className="all-jobs-menu">

          <button
            type="button"
            className="all-jobs-menu-item"
            onClick={() =>
              router.push("/settings")
            }
          >
            <span>⚙</span>
            ตั้งค่า
          </button>

          <button
            type="button"
            className="all-jobs-menu-item"
            onClick={() =>
              router.push("/dashboard")
            }
          >
            <span>←</span>
            กลับหน้าผู้ใช้งาน
          </button>

        </nav>

        <div className="all-jobs-sidebar-bottom">

          <div className="all-jobs-profile">

            <div className="all-jobs-avatar">
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
            className="all-jobs-logout"
            onClick={logout}
          >
            ↪
            ออกจากระบบ
          </button>

        </div>

      </aside>


      {/* MAIN */}
      <main className="all-jobs-main">

        {/* TOPBAR */}
        <header className="all-jobs-topbar">

          <div className="all-jobs-breadcrumb">

            <span>
              Fix it
            </span>

            <b>/</b>

            <span>
              Technician Center
            </span>

            <b>/</b>

            <strong>
              งานทั้งหมด
            </strong>

          </div>

          <div className="all-jobs-top-user">

            <button
              type="button"
              className="all-jobs-notification"
            >
              🔔
              <span></span>
            </button>

            <div className="all-jobs-user">

              <div className="all-jobs-avatar">
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


        {/* CONTENT */}
        <section className="all-jobs-content">

          <div className="all-jobs-page-header">

            <div>

              <span>
                TECHNICIAN CENTER
              </span>

              <h1>
                งานทั้งหมด
              </h1>

              <p>
                รายการงานแจ้งซ่อมทั้งหมดภายในระบบ
              </p>

            </div>

            <div className="all-jobs-date">
              📅 07 กันยายน 2569
            </div>

          </div>


          {/* STAT */}
          <div className="all-jobs-stats">

            <div className="all-jobs-stat-card">

              <div className="stat-icon purple">
                ▣
              </div>

              <div>
                <span>งานทั้งหมด</span>
                <strong>{total}</strong>
                <small>รายการ</small>
              </div>

            </div>

            <div className="all-jobs-stat-card">

              <div className="stat-icon orange">
                ◷
              </div>

              <div>
                <span>งานใหม่</span>
                <strong>{pending}</strong>
                <small>รอรับงาน</small>
              </div>

            </div>

            <div className="all-jobs-stat-card">

              <div className="stat-icon blue">
                ⚒
              </div>

              <div>
                <span>กำลังซ่อม</span>
                <strong>{progress}</strong>
                <small>กำลังดำเนินการ</small>
              </div>

            </div>

            <div className="all-jobs-stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>
                <span>เสร็จแล้ว</span>
                <strong>{done}</strong>
                <small>ปิดงานแล้ว</small>
              </div>

            </div>

          </div>


          {/* PANEL */}
          <div className="all-jobs-panel">

            <div className="all-jobs-panel-header">

              <div>

                <h2>
                  รายการงานทั้งหมด
                </h2>

                <p>
                  ตรวจสอบและติดตามสถานะงานแจ้งซ่อมทั้งหมด
                </p>

              </div>

              <div className="all-jobs-count">
                {filteredRepairs.length} งาน
              </div>

            </div>


            {/* FILTER */}
            <div className="all-jobs-filters">

              <div className="all-jobs-search">

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

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | RepairStatus
                  )
                }
              >

                <option value="all">
                  ทุกสถานะ
                </option>

                <option value="pending">
                  รอดำเนินการ
                </option>

                <option value="progress">
                  กำลังดำเนินการ
                </option>

                <option value="done">
                  เสร็จแล้ว
                </option>

              </select>

            </div>


            {/* TABLE */}
            <div className="all-jobs-table-wrapper">

              <table className="all-jobs-table">

                <thead>

                  <tr>
                    <th>เลขที่งาน</th>
                    <th>รายละเอียด</th>
                    <th>สถานที่</th>
                    <th>ผู้แจ้ง</th>
                    <th>ความเร่งด่วน</th>
                    <th>สถานะ</th>
                    <th>ผู้รับผิดชอบ</th>
                    <th>วันที่</th>
                    <th>จัดการ</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredRepairs.length === 0 ? (

                    <tr>

                      <td
                        colSpan={9}
                        className="all-jobs-empty"
                      >
                        ไม่พบรายการงานซ่อม
                      </td>

                    </tr>

                  ) : (

                    filteredRepairs.map(
                      (repair) => (

                        <tr key={repair.id}>

                          <td>

                            <strong className="all-jobs-id">
                              {repair.id}
                            </strong>

                          </td>

                          <td>

                            <div className="all-jobs-repair-name">

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

                            <span
                              className={`all-jobs-priority ${repair.priority}`}
                            >
                              {getPriorityText(
                                repair.priority
                              )}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`all-jobs-status ${repair.status}`}
                            >
                              {getStatusText(
                                repair.status
                              )}
                            </span>

                          </td>

                          <td>
                            {repair.technician}
                          </td>

                          <td>
                            {repair.date}
                          </td>

                          <td>

                            <button
                              type="button"
                              className="all-jobs-detail-button"
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


          <footer className="all-jobs-footer">

            <span>
              © 2026 Fix it
            </span>

            <span>
              Technician Center
            </span>

          </footer>

        </section>

      </main>


      {/* MODAL */}
      {selectedRepair && (

        <div
          className="all-jobs-modal-overlay"
          onClick={() =>
            setSelectedRepair(null)
          }
        >

          <div
            className="all-jobs-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="all-jobs-modal-header">

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


            <div className="all-jobs-detail-grid">

              <div>
                <label>ประเภท</label>
                <strong>
                  {selectedRepair.category}
                </strong>
              </div>

              <div>
                <label>สถานที่</label>
                <strong>
                  {selectedRepair.location}
                </strong>
              </div>

              <div>
                <label>ผู้แจ้ง</label>
                <strong>
                  {selectedRepair.reporter}
                </strong>
              </div>

              <div>
                <label>เบอร์โทรศัพท์</label>
                <strong>
                  {selectedRepair.phone}
                </strong>
              </div>

              <div>
                <label>ความเร่งด่วน</label>
                <strong>
                  {getPriorityText(
                    selectedRepair.priority
                  )}
                </strong>
              </div>

              <div>
                <label>วันที่แจ้ง</label>
                <strong>
                  {selectedRepair.date}
                </strong>
              </div>

              <div>
                <label>ผู้รับผิดชอบ</label>
                <strong>
                  {selectedRepair.technician}
                </strong>
              </div>

              <div>
                <label>สถานะ</label>
                <span
                  className={`all-jobs-status ${selectedRepair.status}`}
                >
                  {getStatusText(
                    selectedRepair.status
                  )}
                </span>
              </div>

            </div>


            <div className="all-jobs-description">

              <label>
                รายละเอียดปัญหา
              </label>

              <p>
                {selectedRepair.description}
              </p>

            </div>


            <button
              type="button"
              className="all-jobs-close-button"
              onClick={() =>
                setSelectedRepair(null)
              }
            >
              ปิดหน้าต่าง
            </button>

          </div>

        </div>

      )}

    </div>
  );
}