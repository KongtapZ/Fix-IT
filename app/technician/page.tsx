"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import "./technician.css";

type RepairStatus =
  | "pending"
  | "assigned"
  | "progress"
  | "waiting"
  | "done"
  | "cancelled";

type Priority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

type Repair = {
  id: number;
  requestId: number;

  repairNo: string;
  requestCode: string;

  userId: number;

  categoryId: number | null;
  equipmentId: number | null;
  locationId: number | null;

  category: string;
  equipment: string;
  location: string;

  subject: string;
  detail: string;

  priority: Priority;
  status: RepairStatus;

  createdAt: string;
  assignedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;

  technicianId?: number | null;
  technician?: string;

  repairResult?: string;
};

type ApiRepair = {
  id?: unknown;
  requestId?: unknown;
  request_id?: unknown;

  repairNo?: unknown;
  requestCode?: unknown;
  request_code?: unknown;

  userId?: unknown;
  user_id?: unknown;

  categoryId?: unknown;
  category_id?: unknown;
  category?: unknown;

  equipmentId?: unknown;
  equipment_id?: unknown;
  equipment?: unknown;

  locationId?: unknown;
  location_id?: unknown;
  location?: unknown;

  title?: unknown;
  subject?: unknown;

  problemDescription?: unknown;
  problem_description?: unknown;
  detail?: unknown;

  priority?: unknown;
  status?: unknown;

  createdAt?: unknown;
  created_at?: unknown;

  assignedAt?: unknown;
  assigned_at?: unknown;

  startedAt?: unknown;
  started_at?: unknown;

  completedAt?: unknown;
  completed_at?: unknown;

  technicianId?: unknown;
  technician_id?: unknown;

  technician?: unknown;
  repairResult?: unknown;
  repair_result?: unknown;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  repairs?: ApiRepair[];
  data?: ApiRepair[];
};

export default function TechnicianPage() {
  const router = useRouter();

  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | RepairStatus
  >("all");

  /*
   * =====================================================
   * CURRENT SIDEBAR PAGE
   *
   * ใช้สำหรับเปลี่ยนชื่อหัวข้อด้านบน
   * และกำหนด active menu
   * =====================================================
   */

  const [currentPageTitle, setCurrentPageTitle] =
    useState("Dashboard");

  const [selectedRepair, setSelectedRepair] =
    useState<Repair | null>(null);

  const [showEditBox, setShowEditBox] = useState(false);

  const [editSubject, setEditSubject] = useState("");
  const [editCategoryId, setEditCategoryId] =
    useState<number | null>(null);
  const [editEquipmentId, setEditEquipmentId] =
    useState<number | null>(null);
  const [editLocationId, setEditLocationId] =
    useState<number | null>(null);

  const [editEquipment, setEditEquipment] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDetail, setEditDetail] = useState("");

  const [editPriority, setEditPriority] =
    useState<Priority>("normal");

  const [saving, setSaving] = useState(false);

  const [showResultBox, setShowResultBox] = useState(false);
  const [repairResult, setRepairResult] = useState("");

  // =========================================
  // SAFE NUMBER
  // =========================================

  function toNumber(
    value: unknown,
    fallback = 0
  ): number {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return fallback;
    }

    return number;
  }

  function toNullableNumber(
    value: unknown
  ): number | null {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return null;
    }

    return number;
  }

  // =========================================
  // CATEGORY
  // =========================================

  function getCategoryText(
    category?: unknown
  ): string {
    if (
      category === null ||
      category === undefined ||
      category === ""
    ) {
      return "-";
    }

    const value = String(category).trim();

    switch (value.toLowerCase()) {
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
        return value;
    }
  }

  // =========================================
  // STATUS
  // =========================================

  function getStatusValue(
    status?: unknown
  ): RepairStatus {
    const value = String(status ?? "")
      .trim()
      .toLowerCase();

    switch (value) {
      case "assigned":
        return "assigned";

      case "progress":
      case "in_progress":
      case "in-progress":
      case "in progress":
      case "working":
      case "processing":
      case "กำลังดำเนินการ":
      case "กำลังซ่อม":
        return "progress";

      case "waiting":
      case "wait":
        return "waiting";

      case "completed":
      case "complete":
      case "done":
      case "finished":
      case "closed":
      case "เสร็จแล้ว":
      case "ดำเนินการเสร็จแล้ว":
        return "done";

      case "cancelled":
      case "canceled":
      case "cancel":
        return "cancelled";

      case "pending":
      default:
        return "pending";
    }
  }

  function getStatusText(
    status: RepairStatus
  ): string {
    switch (status) {
      case "pending":
        return "รอดำเนินการ";

      case "assigned":
        return "มอบหมายแล้ว";

      case "progress":
        return "กำลังดำเนินการ";

      case "waiting":
        return "รอดำเนินการต่อ";

      case "done":
        return "เสร็จแล้ว";

      case "cancelled":
        return "ยกเลิก";

      default:
        return "-";
    }
  }

  // =========================================
  // PRIORITY
  // =========================================

  function getPriorityValue(
    priority?: unknown
  ): Priority {
    const value = String(priority ?? "")
      .trim()
      .toLowerCase();

    if (
      value === "urgent" ||
      value === "ด่วนมาก"
    ) {
      return "urgent";
    }

    if (
      value === "high" ||
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

  function getPriorityText(
    priority: Priority
  ): string {
    switch (priority) {
      case "urgent":
        return "ด่วนมาก";

      case "high":
        return "เร่งด่วน";

      case "normal":
        return "ปกติ";

      case "low":
        return "ไม่เร่งด่วน";

      default:
        return "-";
    }
  }

  // =========================================
  // REPORTER
  // =========================================

  function getReporterName(
    repair: Repair
  ): string {
    if (repair.userId > 0) {
      return `ผู้แจ้ง #${repair.userId}`;
    }

    return "ไม่ระบุ";
  }

  // =========================================
  // DATE
  // =========================================

  function formatDate(
    value?: string | null
  ): string {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // =========================================
  // MAP API DATA
  // =========================================

  function mapRepair(
    item: ApiRepair
  ): Repair {
    const requestId = toNumber(
      item.requestId ??
        item.request_id ??
        item.id,
      0
    );

    const requestCode = String(
      item.requestCode ??
        item.request_code ??
        item.repairNo ??
        (requestId > 0
          ? `HD-${requestId}`
          : "ไม่ระบุ")
    );

    const userId = toNumber(
      item.userId ?? item.user_id,
      0
    );

    const categoryId = toNullableNumber(
      item.categoryId ?? item.category_id
    );

    const equipmentId = toNullableNumber(
      item.equipmentId ?? item.equipment_id
    );

    const locationId = toNullableNumber(
      item.locationId ?? item.location_id
    );

    const title = String(
      item.title ??
        item.subject ??
        "ไม่มีหัวข้อ"
    );

    const detail = String(
      item.problemDescription ??
        item.problem_description ??
        item.detail ??
        ""
    );

    return {
      id: requestId,
      requestId,

      repairNo: requestCode,
      requestCode,

      userId,

      categoryId,
      equipmentId,
      locationId,

      category: getCategoryText(
        item.category
      ),

      equipment: String(
        item.equipment ?? ""
      ),

      location: String(
        item.location ?? ""
      ),

      subject: title,
      detail,

      priority: getPriorityValue(
        item.priority
      ),

      status: getStatusValue(
        item.status
      ),

      createdAt: String(
        item.createdAt ??
          item.created_at ??
          ""
      ),

      assignedAt:
        item.assignedAt !== undefined
          ? String(item.assignedAt)
          : item.assigned_at !== undefined
          ? String(item.assigned_at)
          : null,

      startedAt:
        item.startedAt !== undefined
          ? String(item.startedAt)
          : item.started_at !== undefined
          ? String(item.started_at)
          : null,

      completedAt:
        item.completedAt !== undefined
          ? String(item.completedAt)
          : item.completed_at !== undefined
          ? String(item.completed_at)
          : null,

      technicianId:
        toNullableNumber(
          item.technicianId ??
            item.technician_id
        ),

      technician: String(
        item.technician ?? ""
      ),

      repairResult: String(
        item.repairResult ??
          item.repair_result ??
          ""
      ),
    };
  }

  // =========================================
  // LOAD DATA
  // =========================================

  const loadRepairs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/repair",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const text = await response.text();

      console.log(
        "TECHNICIAN API STATUS:",
        response.status
      );

      console.log(
        "TECHNICIAN API RESPONSE:",
        text
      );

      let data: ApiResponse;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server ไม่ได้ส่ง JSON กลับมา"
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "ไม่สามารถดึงข้อมูลแจ้งซ่อมได้"
        );
      }

      const rawRepairs =
        Array.isArray(data.repairs)
          ? data.repairs
          : Array.isArray(data.data)
          ? data.data
          : [];

      const mappedRepairs: Repair[] =
        rawRepairs
          .map(mapRepair)
          .filter(
            (repair) =>
              Number.isFinite(repair.id) &&
              repair.id > 0
          );

      setRepairs(mappedRepairs);
    } catch (error) {
      console.error(
        "LOAD TECHNICIAN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลได้"
      );

      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  // =========================================
  // STATISTICS
  // =========================================

  const total = repairs.length;

  const pending = repairs.filter(
    (item) =>
      item.status === "pending"
  ).length;

  const progress = repairs.filter(
    (item) =>
      item.status === "progress" ||
      item.status === "assigned"
  ).length;

  const done = repairs.filter(
    (item) =>
      item.status === "done"
  ).length;

  // =========================================
  // FILTER
  // =========================================

  const filteredRepairs = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return repairs.filter((repair) => {
      const reporter =
        getReporterName(repair)
          .toLowerCase();

      const matchesSearch =
        !keyword ||
        repair.repairNo
          .toLowerCase()
          .includes(keyword) ||
        repair.subject
          .toLowerCase()
          .includes(keyword) ||
        repair.location
          .toLowerCase()
          .includes(keyword) ||
        repair.category
          .toLowerCase()
          .includes(keyword) ||
        reporter.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        repair.status === statusFilter ||
        (statusFilter === "progress" &&
          repair.status === "assigned");

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    repairs,
    search,
    statusFilter,
  ]);

  // =========================================
  // ACCEPT REPAIR
  // =========================================

  const acceptRepair = async (
    repair: Repair
  ) => {
    if (!repair.id || repair.id <= 0) {
      alert(
        "ไม่พบ request_id ของงานนี้"
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/repair?id=${repair.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: "progress",
          }),
        }
      );

      const text =
        await response.text();

      let data: ApiResponse = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server ส่งข้อมูลกลับมาไม่ถูกต้อง"
          );
        }
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "ไม่สามารถรับงานได้"
        );
      }

      await loadRepairs();

      setSelectedRepair(null);

      alert(
        "รับงานซ่อมเรียบร้อยแล้ว"
      );
    } catch (error) {
      console.error(
        "ACCEPT ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถรับงานได้"
      );
    }
  };

  // =========================================
  // OPEN EDIT
  // =========================================

  const openEdit = (
    repair: Repair
  ) => {
    setSelectedRepair(repair);

    setEditSubject(
      repair.subject
    );

    setEditCategoryId(
      repair.categoryId
    );

    setEditEquipmentId(
      repair.equipmentId
    );

    setEditLocationId(
      repair.locationId
    );

    setEditEquipment(
      repair.equipment || ""
    );

    setEditLocation(
      repair.location || ""
    );

    setEditDetail(
      repair.detail
    );

    setEditPriority(
      repair.priority
    );

    setShowEditBox(true);
    setShowResultBox(false);
  };

  // =========================================
  // SAVE EDIT
  // =========================================

  const saveEdit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!selectedRepair) {
      return;
    }

    if (
      !editSubject.trim() ||
      !editDetail.trim()
    ) {
      alert(
        "กรุณากรอกหัวข้อและรายละเอียดปัญหา"
      );
      return;
    }

    try {
      setSaving(true);

      const body: Record<
        string,
        unknown
      > = {
        title:
          editSubject.trim(),

        problemDescription:
          editDetail.trim(),

        priority:
          editPriority,
      };

      if (editCategoryId !== null) {
        body.categoryId =
          editCategoryId;
      }

      if (
        editEquipmentId !== null
      ) {
        body.equipmentId =
          editEquipmentId;
      }

      if (
        editLocationId !== null
      ) {
        body.locationId =
          editLocationId;
      }

      const response = await fetch(
        `/api/repair?id=${selectedRepair.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const text =
        await response.text();

      let data: ApiResponse = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server ส่งข้อมูลกลับมาไม่ถูกต้อง"
          );
        }
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "ไม่สามารถแก้ไขข้อมูลได้"
        );
      }

      await loadRepairs();

      setShowEditBox(false);
      setSelectedRepair(null);

      alert(
        "แก้ไขข้อมูลเรียบร้อยแล้ว"
      );
    } catch (error) {
      console.error(
        "UPDATE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถแก้ไขข้อมูลได้"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const deleteRepair = async (
    repair: Repair
  ) => {
    const confirmed =
      window.confirm(
        `ต้องการลบงาน ${repair.repairNo} ใช่หรือไม่?\n\n${repair.subject}\n\nข้อมูลนี้จะถูกลบออกจากระบบ`
      );

    if (!confirmed) {
      return;
    }

    if (!repair.id || repair.id <= 0) {
      alert(
        "ไม่พบ request_id ของรายการนี้"
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/repair?id=${repair.id}`,
        {
          method: "DELETE",
        }
      );

      const text =
        await response.text();

      console.log(
        "DELETE STATUS:",
        response.status
      );

      console.log(
        "DELETE RESPONSE:",
        text
      );

      let data: ApiResponse | null =
        null;

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server ส่งข้อมูลกลับมาไม่ถูกต้อง"
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `ลบข้อมูลไม่สำเร็จ (${response.status})`
        );
      }

      if (
        data &&
        data.success === false
      ) {
        throw new Error(
          data.message ||
            "ไม่สามารถลบรายการได้"
        );
      }

      setRepairs((prev) =>
        prev.filter(
          (item) =>
            item.id !== repair.id
        )
      );

      setSelectedRepair(null);
      setShowEditBox(false);
      setShowResultBox(false);
      setRepairResult("");

      alert(
        "ลบรายการแจ้งซ่อมเรียบร้อยแล้ว"
      );

      await loadRepairs();
    } catch (error) {
      console.error(
        "DELETE REPAIR ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถลบรายการได้"
      );
    }
  };

  // =========================================
  // COMPLETE
  // =========================================

  const completeRepair = async () => {
    if (!selectedRepair) {
      return;
    }

    if (!repairResult.trim()) {
      alert(
        "กรุณากรอกผลการซ่อม"
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/repair?id=${selectedRepair.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: "completed",
            resolutionText: repairResult.trim(),
          }),
        }
      );

      const text =
        await response.text();

      let data: ApiResponse = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server ส่งข้อมูลกลับมาไม่ถูกต้อง"
          );
        }
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "ไม่สามารถปิดงานได้"
        );
      }

      await loadRepairs();

      setShowResultBox(false);
      setRepairResult("");
      setSelectedRepair(null);

      alert(
        "บันทึกผลการซ่อมเรียบร้อยแล้ว"
      );
    } catch (error) {
      console.error(
        "COMPLETE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถปิดงานได้"
      );
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    fetch(
      "/api/logout",
      {
        method: "POST",
      }
    ).finally(() => {
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      router.push("/login");
    });
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="technician-page">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="tech-sidebar">

        <div className="tech-brand">

          <div className="tech-logo">
            CMU
          </div>

          <div>
            <h2>
              Fix it
            </h2>

            <span>
              Technician Center
            </span>
          </div>

        </div>

        <div className="tech-menu-title">
          TECHNICIAN MENU
        </div>

        <nav className="tech-menu">

          {/* DASHBOARD */}

          <button
            type="button"
            className={`tech-menu-item ${
              currentPageTitle === "Dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setStatusFilter("all");
              setSearch("");
              setCurrentPageTitle("Dashboard");
            }}
          >
            <span>⌂</span>
            Dashboard
          </button>

          {/* งานใหม่ */}

          <button
            type="button"
            className={`tech-menu-item ${
              currentPageTitle === "งานใหม่"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setStatusFilter("pending");
              setSearch("");
              setCurrentPageTitle("งานใหม่");
            }}
          >
            <span>◷</span>

            งานใหม่

            <b>
              {pending}
            </b>
          </button>

          {/* งานที่กำลังซ่อม */}

          <button
            type="button"
            className={`tech-menu-item ${
              currentPageTitle === "งานที่กำลังซ่อม"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setStatusFilter("progress");
              setSearch("");
              setCurrentPageTitle(
                "งานที่กำลังซ่อม"
              );
            }}
          >
            <span>⚒</span>

            งานที่กำลังซ่อม

            <b>
              {progress}
            </b>
          </button>

          {/* งานที่เสร็จแล้ว */}

          <button
            type="button"
            className={`tech-menu-item ${
              currentPageTitle === "งานที่เสร็จแล้ว"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setStatusFilter("done");
              setSearch("");
              setCurrentPageTitle(
                "งานที่เสร็จแล้ว"
              );
            }}
          >
            <span>✓</span>

            งานที่เสร็จแล้ว

            <b>
              {done}
            </b>
          </button>

          {/* งานทั้งหมด */}

          <button
            type="button"
            className={`tech-menu-item ${
              currentPageTitle === "งานทั้งหมด"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setStatusFilter("all");
              setSearch("");
              setCurrentPageTitle(
                "งานทั้งหมด"
              );
            }}
          >
            <span>▤</span>

            งานทั้งหมด
          </button>

        </nav>

        <div className="tech-menu-title system">
          SYSTEM
        </div>

        <nav className="tech-menu">

          <button
            type="button"
            className="tech-menu-item"
            onClick={() =>
              router.push(
                "/settings"
              )
            }
          >
            <span>⚙</span>
            ตั้งค่า
          </button>

          <button
            type="button"
            className="tech-menu-item"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
          >
            <span>←</span>
            กลับหน้าผู้ใช้งาน
          </button>

        </nav>

        <div className="tech-sidebar-bottom">

          <div className="technician-profile">

            <div className="tech-avatar">
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
            className="tech-logout"
            onClick={logout}
          >
            ↪ ออกจากระบบ
          </button>

        </div>

      </aside>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="tech-main">

        <header className="tech-topbar">

          <div className="tech-breadcrumb">

            <span>
              Fix it
            </span>

            <b>/</b>

            <strong>
              Technician Center
            </strong>

          </div>

          <div className="tech-top-user">

            <button
              type="button"
              className="tech-notification"
            >
              🔔
              <span></span>
            </button>

            <div className="tech-user">

              <div className="tech-avatar">
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

        <section className="tech-content">

          {/* =========================================
              PAGE HEADER
          ========================================= */}

          <div className="tech-page-header">

            <div>

              <span>
                IT SUPPORT CENTER
              </span>

              <h1>
                {currentPageTitle}
              </h1>

              <p>
                {currentPageTitle === "Dashboard" &&
                  "ภาพรวมและรายการงานแจ้งซ่อมทั้งหมด"}

                {currentPageTitle === "งานใหม่" &&
                  "รายการงานแจ้งซ่อมที่รอรับงาน"}

                {currentPageTitle === "งานที่กำลังซ่อม" &&
                  "รายการงานที่กำลังดำเนินการซ่อม"}

                {currentPageTitle === "งานที่เสร็จแล้ว" &&
                  "รายการงานที่ดำเนินการซ่อมเสร็จเรียบร้อยแล้ว"}

                {currentPageTitle === "งานทั้งหมด" &&
                  "รายการแจ้งซ่อมทั้งหมดในระบบ"}
              </p>

            </div>

            <div className="tech-date">

              📅{" "}

              {new Date().toLocaleDateString(
                "th-TH",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}

            </div>

          </div>

          {/* =========================================
              STATISTICS
          ========================================= */}

          <div className="tech-stats">

            <div className="tech-stat-card">

              <div className="tech-stat-icon purple">
                ▣
              </div>

              <div>

                <span>
                  งานทั้งหมด
                </span>

                <strong>
                  {loading
                    ? "..."
                    : total}
                </strong>

                <small>
                  รายการ
                </small>

              </div>

            </div>

            <div className="tech-stat-card">

              <div className="tech-stat-icon orange">
                ◷
              </div>

              <div>

                <span>
                  งานใหม่
                </span>

                <strong>
                  {loading
                    ? "..."
                    : pending}
                </strong>

                <small>
                  รอรับงาน
                </small>

              </div>

            </div>

            <div className="tech-stat-card">

              <div className="tech-stat-icon blue">
                ⚒
              </div>

              <div>

                <span>
                  กำลังซ่อม
                </span>

                <strong>
                  {loading
                    ? "..."
                    : progress}
                </strong>

                <small>
                  กำลังดำเนินการ
                </small>

              </div>

            </div>

            <div className="tech-stat-card">

              <div className="tech-stat-icon green">
                ✓
              </div>

              <div>

                <span>
                  เสร็จแล้ว
                </span>

                <strong>
                  {loading
                    ? "..."
                    : done}
                </strong>

                <small>
                  ปิดงานแล้ว
                </small>

              </div>

            </div>

          </div>

          {/* =========================================
              PANEL
          ========================================= */}

          <div className="tech-panel">

            <div className="tech-panel-header">

              <div>

                <h2>
                  รายการงานซ่อม
                </h2>

                <p>
                  รายการแจ้งซ่อมจากผู้ใช้งานทั้งหมด
                </p>

              </div>

              <button
                type="button"
                onClick={
                  loadRepairs
                }
                style={{
                  padding:
                    "8px 14px",
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

            {/* =========================================
                FILTER
            ========================================= */}

            <div className="tech-filters">

              <div className="tech-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="ค้นหาเลขงาน ชื่องาน สถานที่ หรือผู้แจ้ง..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              <select
                value={
                  statusFilter
                }
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

            {/* =========================================
                LOADING / ERROR / TABLE
            ========================================= */}

            {loading ? (

              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "60px",
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
                    "60px",
                  color:
                    "#dc2626",
                }}
              >

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    loadRepairs
                  }
                  style={{
                    marginTop:
                      "15px",
                    padding:
                      "10px 20px",
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

            ) : (

              <div className="tech-table-wrapper">

                <table className="tech-table">

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

                    {filteredRepairs.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan={8}
                          className="tech-empty"
                        >
                          ไม่พบรายการงานซ่อม
                        </td>

                      </tr>

                    ) : (

                      filteredRepairs.map(
                        (repair) => (

                          <tr
                            key={
                              repair.requestId
                            }
                          >

                            <td>

                              <strong className="repair-id">
                                {
                                  repair.repairNo
                                }
                              </strong>

                            </td>

                            <td>

                              <div className="tech-repair-name">

                                <strong>
                                  {
                                    repair.subject
                                  }
                                </strong>

                                <span>
                                  {
                                    repair.category
                                  }
                                </span>

                              </div>

                            </td>

                            <td>
                              {
                                repair.location ||
                                "-"
                              }
                            </td>

                            <td>
                              {
                                getReporterName(
                                  repair
                                )
                              }
                            </td>

                            <td>

                              <span
                                className={`priority ${repair.priority}`}
                              >
                                {
                                  getPriorityText(
                                    repair.priority
                                  )
                                }
                              </span>

                            </td>

                            <td>

                              <span
                                className={`tech-status ${repair.status}`}
                              >
                                {
                                  getStatusText(
                                    repair.status
                                  )
                                }
                              </span>

                            </td>

                            <td>
                              {
                                formatDate(
                                  repair.createdAt
                                )
                              }
                            </td>

                            <td>

                              <button
                                type="button"
                                className="detail-button"
                                onClick={() => {

                                  setSelectedRepair(
                                    repair
                                  );

                                  setShowEditBox(
                                    false
                                  );

                                  setShowResultBox(
                                    false
                                  );

                                  setRepairResult(
                                    ""
                                  );

                                }}
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

            )}

          </div>

          <footer className="tech-footer">

            <span>
              © 2026 Fix it
            </span>

            <span>
              Technician Center
            </span>

          </footer>

        </section>

      </main>

      {/* =========================================
          MODAL
      ========================================= */}

      {selectedRepair && (

        <div
          className="tech-modal-overlay"
          onClick={() => {

            setSelectedRepair(
              null
            );

            setShowEditBox(
              false
            );

            setShowResultBox(
              false
            );

            setRepairResult(
              ""
            );

          }}
        >

          <div
            className="tech-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="tech-modal-header">

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
                type="button"
                onClick={() =>
                  setSelectedRepair(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            {/* =====================================
                EDIT
            ===================================== */}

            {showEditBox ? (

              <form
                onSubmit={
                  saveEdit
                }
              >

                <div className="tech-detail-grid">

                  <div>

                    <label>
                      หัวข้อ
                    </label>

                    <input
                      value={
                        editSubject
                      }
                      onChange={(e) =>
                        setEditSubject(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div>

                    <label>
                      ประเภท
                    </label>

                    <input
                      value={
                        selectedRepair.category
                      }
                      disabled
                    />

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#777",
                      }}
                    >
                      รหัสประเภท:{" "}
                      {editCategoryId ??
                        "-"}
                    </small>

                  </div>

                  <div>

                    <label>
                      อุปกรณ์
                    </label>

                    <input
                      value={
                        editEquipment
                      }
                      onChange={(e) =>
                        setEditEquipment(
                          e.target.value
                        )
                      }
                      placeholder="ชื่ออุปกรณ์"
                    />

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#777",
                      }}
                    >
                      รหัสอุปกรณ์:{" "}
                      {editEquipmentId ??
                        "-"}
                    </small>

                  </div>

                  <div>

                    <label>
                      สถานที่
                    </label>

                    <input
                      value={
                        editLocation
                      }
                      onChange={(e) =>
                        setEditLocation(
                          e.target.value
                        )
                      }
                      placeholder="สถานที่"
                    />

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#777",
                      }}
                    >
                      รหัสสถานที่:{" "}
                      {editLocationId ??
                        "-"}
                    </small>

                  </div>

                  <div>

                    <label>
                      ความเร่งด่วน
                    </label>

                    <select
                      value={
                        editPriority
                      }
                      onChange={(e) =>
                        setEditPriority(
                          e.target.value as Priority
                        )
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

                      <option value="urgent">
                        ด่วนมาก
                      </option>

                    </select>

                  </div>

                </div>

                <div className="tech-description">

                  <label>
                    รายละเอียดปัญหา
                  </label>

                  <textarea
                    value={
                      editDetail
                    }
                    onChange={(e) =>
                      setEditDetail(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap:
                      "10px",
                    marginTop:
                      "20px",
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      setShowEditBox(
                        false
                      )
                    }
                    style={{
                      flex: 1,
                      padding:
                        "12px",
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
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    style={{
                      flex: 1,
                      padding:
                        "12px",
                      border:
                        "none",
                      borderRadius:
                        "8px",
                      background:
                        "#2563eb",
                      color:
                        "#fff",
                      cursor:
                        "pointer",
                    }}
                  >
                    {saving
                      ? "กำลังบันทึก..."
                      : "บันทึกการแก้ไข"}
                  </button>

                </div>

              </form>

            ) : (

              /* =====================================
                 DETAIL
              ===================================== */

              <>

                <div className="tech-detail-grid">

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
                        selectedRepair.location ||
                        "-"
                      }
                    </strong>

                  </div>

                  <div>

                    <label>
                      ผู้แจ้ง
                    </label>

                    <strong>
                      {
                        getReporterName(
                          selectedRepair
                        )
                      }
                    </strong>

                  </div>

                  <div>

                    <label>
                      User ID
                    </label>

                    <strong>
                      {
                        selectedRepair.userId ||
                        "-"
                      }
                    </strong>

                  </div>

                  <div>

                    <label>
                      ความเร่งด่วน
                    </label>

                    <strong>
                      {
                        getPriorityText(
                          selectedRepair.priority
                        )
                      }
                    </strong>

                  </div>

                  <div>

                    <label>
                      วันที่แจ้ง
                    </label>

                    <strong>
                      {
                        formatDate(
                          selectedRepair.createdAt
                        )
                      }
                    </strong>

                  </div>

                  <div>

                    <label>
                      ช่างผู้รับผิดชอบ
                    </label>

                    <strong>
                      {
                        selectedRepair.technician ||
                        (
                          selectedRepair
                            .technicianId
                            ? `ช่าง #${selectedRepair.technicianId}`
                            : "-"
                        )
                      }
                    </strong>

                  </div>

                </div>

                <div className="tech-description">

                  <label>
                    รายละเอียดปัญหา
                  </label>

                  <p>
                    {
                      selectedRepair.detail ||
                      "-"
                    }
                  </p>

                </div>

                <div className="tech-current-status">

                  <span>
                    สถานะปัจจุบัน
                  </span>

                  <strong
                    className={`tech-status ${selectedRepair.status}`}
                  >
                    {
                      getStatusText(
                        selectedRepair.status
                      )
                    }
                  </strong>

                </div>

                {/* ACTION BUTTONS */}

                <div
                  style={{
                    display:
                      "flex",
                    gap:
                      "10px",
                    marginTop:
                      "20px",
                    flexWrap:
                      "wrap",
                  }}
                >

                  {/* ACCEPT */}

                  {(selectedRepair.status ===
                    "pending" ||
                    selectedRepair.status ===
                      "assigned") && (

                    <button
                      type="button"
                      className="accept-button"
                      onClick={() =>
                        acceptRepair(
                          selectedRepair
                        )
                      }
                    >
                      ⚒ รับงานซ่อม
                    </button>

                  )}

                  {/* COMPLETE */}

                  {selectedRepair.status ===
                    "progress" && (

                    <button
                      type="button"
                      className="complete-button"
                      onClick={() =>
                        setShowResultBox(
                          true
                        )
                      }
                    >
                      ✓ ปิดงานซ่อม
                    </button>

                  )}

                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      openEdit(
                        selectedRepair
                      )
                    }
                    style={{
                      padding:
                        "11px 18px",
                      border:
                        "none",
                      borderRadius:
                        "8px",
                      background:
                        "#2563eb",
                      color:
                        "#fff",
                      cursor:
                        "pointer",
                    }}
                  >
                    ✎ แก้ไข
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() =>
                      deleteRepair(
                        selectedRepair
                      )
                    }
                    style={{
                      padding:
                        "11px 18px",
                      border:
                        "none",
                      borderRadius:
                        "8px",
                      background:
                        "#dc2626",
                      color:
                        "#fff",
                      cursor:
                        "pointer",
                    }}
                  >
                    🗑 ลบ
                  </button>

                </div>

                {/* =================================
                    RESULT BOX
                ================================= */}

                {showResultBox && (

                  <div
                    className="result-box"
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >

                    <label>
                      ผลการซ่อม / วิธีแก้ไข
                    </label>

                    <textarea
                      value={
                        repairResult
                      }
                      onChange={(e) =>
                        setRepairResult(
                          e.target.value
                        )
                      }
                      placeholder="กรอกผลการซ่อม..."
                    />

                    <div className="result-actions">

                      <button
                        type="button"
                        className="cancel-result"
                        onClick={() => {

                          setShowResultBox(
                            false
                          );

                          setRepairResult(
                            ""
                          );

                        }}
                      >
                        ยกเลิก
                      </button>

                      <button
                        type="button"
                        className="save-result"
                        onClick={
                          completeRepair
                        }
                      >
                        บันทึกผลการซ่อม
                      </button>

                    </div>

                  </div>

                )}

                {/* =================================
                    COMPLETED
                ================================= */}

                {selectedRepair.status ===
                  "done" && (

                  <div className="completed-message">

                    ✓ งานนี้ดำเนินการเสร็จแล้ว

                    {selectedRepair.repairResult && (

                      <p
                        style={{
                          marginTop:
                            "10px",
                        }}
                      >

                        <strong>
                          ผลการซ่อม:
                        </strong>{" "}

                        {
                          selectedRepair.repairResult
                        }

                      </p>

                    )}

                  </div>

                )}

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}