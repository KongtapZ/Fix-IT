"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./assign.css";

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

type Technician = {
  id: number;
  name: string;
  username: string;
  jobs: number;
  status: "พร้อมปฏิบัติงาน" | "กำลังปฏิบัติงาน" | "ไม่ว่าง";
};

const initialRepairs: Repair[] = [
  {
    id: "HD-00128",
    title: "คอมพิวเตอร์เปิดไม่ติด",
    category: "คอมพิวเตอร์",
    location: "ห้อง 301 อาคารสังคมศาสตร์",
    priority: "high",
    status: "pending",
    date: "18/09/2569",
    reporter: "นายสมชาย ใจดี",
    phone: "081-234-5678",
    description: "กดปุ่ม Power แล้วเครื่องไม่ทำงาน",
    technician: "-",
  },
  {
    id: "HD-00127",
    title: "เครื่องพิมพ์ไม่สามารถพิมพ์ได้",
    category: "เครื่องพิมพ์",
    location: "สำนักงานชั้น 2",
    priority: "normal",
    status: "pending",
    date: "18/09/2569",
    reporter: "นางสาวสุภาวดี แสงทอง",
    phone: "082-345-6789",
    description: "เครื่องพิมพ์ไม่ตอบสนองเมื่อสั่งพิมพ์",
    technician: "-",
  },
  {
    id: "HD-00126",
    title: "โปรเจกเตอร์ภาพไม่ชัด",
    category: "โปรเจกเตอร์",
    location: "ห้องเรียน 204",
    priority: "normal",
    status: "progress",
    date: "17/09/2569",
    reporter: "นายกิตติ",
    phone: "083-456-7890",
    description: "ภาพจากโปรเจกเตอร์เบลอและมีเส้น",
    technician: "คุณสมชาย",
  },
  {
    id: "HD-00125",
    title: "อินเทอร์เน็ตใช้งานไม่ได้",
    category: "Network",
    location: "ห้องพักอาจารย์",
    priority: "high",
    status: "pending",
    date: "17/09/2569",
    reporter: "นายวิชัย",
    phone: "084-567-8901",
    description: "ไม่สามารถเชื่อมต่อ Internet ได้",
    technician: "-",
  },
  {
    id: "HD-00124",
    title: "คีย์บอร์ดใช้งานไม่ได้",
    category: "อุปกรณ์คอมพิวเตอร์",
    location: "ห้องปฏิบัติการคอมพิวเตอร์",
    priority: "low",
    status: "pending",
    date: "16/09/2569",
    reporter: "นางสาวอรทัย",
    phone: "085-678-9012",
    description: "ปุ่มคีย์บอร์ดบางปุ่มไม่ทำงาน",
    technician: "-",
  },
];

const initialTechnicians: Technician[] = [
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

export default function AssignPage() {
  const router = useRouter();

  const [repairs, setRepairs] = useState<Repair[]>(initialRepairs);
  const [technicians] = useState<Technician[]>(initialTechnicians);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // -----------------------------
  // Filter งาน
  // -----------------------------

  const filteredRepairs = useMemo(() => {
    return repairs.filter((repair) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        repair.id.toLowerCase().includes(keyword) ||
        repair.title.toLowerCase().includes(keyword) ||
        repair.category.toLowerCase().includes(keyword) ||
        repair.location.toLowerCase().includes(keyword) ||
        repair.reporter.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" || repair.status === statusFilter;

      const matchPriority =
        priorityFilter === "all" || repair.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [repairs, search, statusFilter, priorityFilter]);

  // -----------------------------
  // เปิดหน้ามอบหมายงาน
  // -----------------------------

  const openAssignModal = (repair: Repair) => {
    setSelectedRepair(repair);
    setSelectedTechnician(
      repair.technician === "-" ? "" : repair.technician
    );
    setShowAssignModal(true);
  };

  // -----------------------------
  // มอบหมายงาน
  // -----------------------------

  const assignJob = () => {
    if (!selectedRepair) return;

    if (!selectedTechnician) {
      alert("กรุณาเลือกช่าง");
      return;
    }

    setRepairs((prev) =>
      prev.map((repair) =>
        repair.id === selectedRepair.id
          ? {
              ...repair,
              technician: selectedTechnician,
              status: "progress",
            }
          : repair
      )
    );

    setShowAssignModal(false);
    setSelectedRepair(null);
    setSelectedTechnician("");

    alert("มอบหมายงานให้ช่างเรียบร้อยแล้ว");
  };

  // -----------------------------
  // ยกเลิกการมอบหมาย
  // -----------------------------

  const unassignJob = (repair: Repair) => {
    const confirmUnassign = confirm(
      `ต้องการยกเลิกการมอบหมายงาน ${repair.id} หรือไม่?`
    );

    if (!confirmUnassign) return;

    setRepairs((prev) =>
      prev.map((item) =>
        item.id === repair.id
          ? {
              ...item,
              technician: "-",
              status: "pending",
            }
          : item
      )
    );
  };

  // -----------------------------
  // Detail
  // -----------------------------

  const openDetailModal = (repair: Repair) => {
    setSelectedRepair(repair);
    setShowDetailModal(true);
  };

  // -----------------------------
  // Text
  // -----------------------------

  const getStatusText = (status: RepairStatus) => {
    switch (status) {
      case "pending":
        return "รอดำเนินการ";
      case "progress":
        return "กำลังดำเนินการ";
      case "done":
        return "เสร็จแล้ว";
      default:
        return status;
    }
  };

  const getPriorityText = (priority: Repair["priority"]) => {
    switch (priority) {
      case "high":
        return "เร่งด่วน";
      case "normal":
        return "ปกติ";
      case "low":
        return "ไม่เร่งด่วน";
      default:
        return priority;
    }
  };

  // -----------------------------
  // Statistics
  // -----------------------------

  const totalJobs = repairs.length;

  const waitingJobs = repairs.filter(
    (item) => item.technician === "-"
  ).length;

  const assignedJobs = repairs.filter(
    (item) => item.technician !== "-"
  ).length;

  const urgentJobs = repairs.filter(
    (item) => item.priority === "high"
  ).length;

  return (
    <div className="assign-page">

      {/* SIDEBAR */}
      <aside className="assign-sidebar">

        <div className="assign-logo">
          <div className="assign-logo-icon">IT</div>

          <div>
            <h2>ADMIN CENTER</h2>
            <span>Fix it</span>
          </div>
        </div>

        <div className="assign-menu-title">
          เมนูหลัก
        </div>

        <button
          className="assign-menu-item"
          onClick={() => router.push("/admin")}
        >
          <span>▣</span>
          Dashboard
        </button>

        <button
          className="assign-menu-item"
          onClick={() => router.push("/admin")}
        >
          <span>▤</span>
          รายการแจ้งซ่อม
        </button>

      

        <button
          className="assign-menu-item"
          onClick={() => router.push("/progress-jobs")}
        >
          <span>⚙</span>
          งานกำลังซ่อม
        </button>

        <button
          className="assign-menu-item"
          onClick={() => router.push("/progress-jobs")}
        >
          <span>✓</span>
          งานเสร็จแล้ว
        </button>

        <div className="assign-menu-title">
          จัดการระบบ
        </div>

        <button
          className="assign-menu-item"
          onClick={() => router.push("/admin")}
        >
          <span>👥</span>
          จัดการผู้ใช้งาน
        </button>

        <button
          className="assign-menu-item"
          onClick={() => router.push("/admin")}
        >
          <span>🧰</span>
          จัดการช่าง
        </button>

        <button
          className="assign-menu-item"
          onClick={() => router.push("/statistics")}
        >
          <span>📊</span>
          รายงาน / สถิติ
        </button>

        <button
          className="assign-menu-item"
          onClick={() => router.push("/settings")}
        >
          <span>⚙</span>
          ตั้งค่าระบบ
        </button>

      </aside>

      {/* MAIN */}
      <main className="assign-main">

        {/* TOPBAR */}
        <header className="assign-topbar">

          <div>
            <h1>ระบบมอบหมายงานให้ช่าง</h1>
            <p>
              จัดการและมอบหมายรายการแจ้งซ่อมให้เจ้าหน้าที่
            </p>
          </div>

          <div className="assign-admin">
            <div className="assign-avatar">
              A
            </div>

            <div>
              <strong>Administrator</strong>
              <span>ผู้ดูแลระบบ</span>
            </div>
          </div>

        </header>

        {/* STATS */}
        <section className="assign-stats">

          <div className="assign-stat-card">
            <div className="assign-stat-icon purple">
              📋
            </div>

            <div>
              <span>งานทั้งหมด</span>
              <strong>{totalJobs}</strong>
            </div>
          </div>

          <div className="assign-stat-card">
            <div className="assign-stat-icon orange">
              ⏳
            </div>

            <div>
              <span>รอมอบหมาย</span>
              <strong>{waitingJobs}</strong>
            </div>
          </div>

          <div className="assign-stat-card">
            <div className="assign-stat-icon blue">
              👨‍🔧
            </div>

            <div>
              <span>มอบหมายแล้ว</span>
              <strong>{assignedJobs}</strong>
            </div>
          </div>

          <div className="assign-stat-card">
            <div className="assign-stat-icon red">
              🚨
            </div>

            <div>
              <span>งานเร่งด่วน</span>
              <strong>{urgentJobs}</strong>
            </div>
          </div>

        </section>

        {/* TECHNICIAN SUMMARY */}
        <section className="technician-summary">

          <div className="section-heading">
            <div>
              <h2>สถานะช่าง</h2>
              <p>จำนวนงานที่รับผิดชอบของแต่ละคน</p>
            </div>
          </div>

          <div className="technician-grid">

            {technicians.map((technician) => (

              <div
                className="technician-card"
                key={technician.id}
              >

                <div className="technician-avatar">
                  {technician.name.charAt(0)}
                </div>

                <div className="technician-info">

                  <strong>
                    {technician.name}
                  </strong>

                  <span>
                    @{technician.username}
                  </span>

                  <div className="technician-bottom">

                    <span
                      className={
                        technician.status ===
                        "พร้อมปฏิบัติงาน"
                          ? "tech-status ready"
                          : technician.status ===
                            "กำลังปฏิบัติงาน"
                          ? "tech-status working"
                          : "tech-status busy"
                      }
                    >
                      ● {technician.status}
                    </span>

                    <strong>
                      {technician.jobs} งาน
                    </strong>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* JOB TABLE */}
        <section className="assign-panel">

          <div className="assign-panel-header">

            <div>
              <h2>รายการงานสำหรับมอบหมาย</h2>
              <p>
                เลือกช่างเพื่อมอบหมายงานให้แต่ละรายการ
              </p>
            </div>

          </div>

          {/* FILTER */}
          <div className="assign-filters">

            <div className="assign-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="ค้นหาเลขที่งาน / ปัญหา / ผู้แจ้ง..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
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

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
            >
              <option value="all">
                ทุกความเร่งด่วน
              </option>

              <option value="high">
                เร่งด่วน
              </option>

              <option value="normal">
                ปกติ
              </option>

              <option value="low">
                ไม่เร่งด่วน
              </option>
            </select>

          </div>

          {/* TABLE */}
          <div className="assign-table-wrapper">

            <table className="assign-table">

              <thead>
                <tr>
                  <th>เลขที่งาน</th>
                  <th>รายละเอียดปัญหา</th>
                  <th>ผู้แจ้ง</th>
                  <th>วันที่แจ้ง</th>
                  <th>ความเร่งด่วน</th>
                  <th>สถานะ</th>
                  <th>ช่างผู้รับผิดชอบ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>

              <tbody>

                {filteredRepairs.map((repair) => (

                  <tr key={repair.id}>

                    <td>
                      <strong className="job-id">
                        {repair.id}
                      </strong>
                    </td>

                    <td>
                      <div className="job-title">
                        <strong>
                          {repair.title}
                        </strong>

                        <span>
                          {repair.category}
                        </span>
                      </div>
                    </td>

                    <td>
                      {repair.reporter}
                    </td>

                    <td>
                      {repair.date}
                    </td>

                    <td>

                      <span
                        className={`priority ${repair.priority}`}
                      >
                        {getPriorityText(
                          repair.priority
                        )}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`status ${repair.status}`}
                      >
                        {getStatusText(
                          repair.status
                        )}
                      </span>

                    </td>

                    <td>

                      {repair.technician === "-" ? (

                        <span className="unassigned">
                          ยังไม่ได้มอบหมาย
                        </span>

                      ) : (

                        <span className="assigned-tech">
                          👨‍🔧 {repair.technician}
                        </span>

                      )}

                    </td>

                    <td>

                      <div className="job-actions">

                        <button
                          className="view-btn"
                          onClick={() =>
                            openDetailModal(repair)
                          }
                          title="ดูรายละเอียด"
                        >
                          👁
                        </button>

                        <button
                          className="assign-btn"
                          onClick={() =>
                            openAssignModal(repair)
                          }
                        >
                          {repair.technician === "-"
                            ? "มอบหมาย"
                            : "เปลี่ยนช่าง"}
                        </button>

                        {repair.technician !== "-" && (
                          <button
                            className="unassign-btn"
                            onClick={() =>
                              unassignJob(repair)
                            }
                            title="ยกเลิกการมอบหมาย"
                          >
                            ×
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {filteredRepairs.length === 0 && (

              <div className="empty-state">
                <div>📭</div>
                <h3>ไม่พบรายการงาน</h3>
                <p>
                  ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                </p>
              </div>

            )}

          </div>

        </section>

      </main>

      {/* ASSIGN MODAL */}
      {showAssignModal && selectedRepair && (

        <div
          className="assign-modal-overlay"
          onClick={() =>
            setShowAssignModal(false)
          }
        >

          <div
            className="assign-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  {selectedRepair.technician === "-"
                    ? "มอบหมายงาน"
                    : "เปลี่ยนช่างผู้รับผิดชอบ"}
                </h2>

                <p>
                  งาน {selectedRepair.id}
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowAssignModal(false)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-job-info">

              <div>
                <span>ปัญหา</span>
                <strong>
                  {selectedRepair.title}
                </strong>
              </div>

              <div>
                <span>สถานที่</span>
                <strong>
                  {selectedRepair.location}
                </strong>
              </div>

              <div>
                <span>ความเร่งด่วน</span>
                <strong
                  className={`priority ${selectedRepair.priority}`}
                >
                  {getPriorityText(
                    selectedRepair.priority
                  )}
                </strong>
              </div>

            </div>

            <div className="assign-form">

              <label>
                เลือกช่างผู้รับผิดชอบ
              </label>

              <select
                value={selectedTechnician}
                onChange={(e) =>
                  setSelectedTechnician(
                    e.target.value
                  )
                }
              >

                <option value="">
                  -- เลือกช่าง --
                </option>

                {technicians.map((technician) => (

                  <option
                    key={technician.id}
                    value={technician.name}
                  >
                    {technician.name} —{" "}
                    {technician.status} (
                    {technician.jobs} งาน)
                  </option>

                ))}

              </select>

              <div className="assign-note">
                💡 เมื่อมอบหมายงานแล้ว
                สถานะงานจะเปลี่ยนเป็น
                <strong> กำลังดำเนินการ</strong>
              </div>

            </div>

            <div className="modal-footer">

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowAssignModal(false)
                }
              >
                ยกเลิก
              </button>

              <button
                className="confirm-assign-btn"
                onClick={assignJob}
              >
                ✓ ยืนยันการมอบหมาย
              </button>

            </div>

          </div>

        </div>

      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedRepair && (

        <div
          className="assign-modal-overlay"
          onClick={() =>
            setShowDetailModal(false)
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
                <h2>
                  รายละเอียดงาน
                </h2>

                <p>
                  {selectedRepair.id}
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowDetailModal(false)
                }
              >
                ×
              </button>

            </div>

            <div className="detail-grid">

              <div>
                <span>เลขที่งาน</span>
                <strong>
                  {selectedRepair.id}
                </strong>
              </div>

              <div>
                <span>หัวข้อปัญหา</span>
                <strong>
                  {selectedRepair.title}
                </strong>
              </div>

              <div>
                <span>ประเภท</span>
                <strong>
                  {selectedRepair.category}
                </strong>
              </div>

              <div>
                <span>สถานที่</span>
                <strong>
                  {selectedRepair.location}
                </strong>
              </div>

              <div>
                <span>ผู้แจ้ง</span>
                <strong>
                  {selectedRepair.reporter}
                </strong>
              </div>

              <div>
                <span>เบอร์โทร</span>
                <strong>
                  {selectedRepair.phone}
                </strong>
              </div>

              <div>
                <span>ความเร่งด่วน</span>
                <strong>
                  {getPriorityText(
                    selectedRepair.priority
                  )}
                </strong>
              </div>

              <div>
                <span>ช่างผู้รับผิดชอบ</span>
                <strong>
                  {selectedRepair.technician}
                </strong>
              </div>

            </div>

            <div className="description">

              <span>
                รายละเอียดปัญหา
              </span>

              <p>
                {selectedRepair.description}
              </p>

            </div>

            <div className="detail-footer">

              <button
                className="assign-btn large"
                onClick={() => {
                  setShowDetailModal(false);
                  openAssignModal(selectedRepair);
                }}
              >
                👨‍🔧{" "}
                {selectedRepair.technician === "-"
                  ? "มอบหมายงาน"
                  : "เปลี่ยนช่าง"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}