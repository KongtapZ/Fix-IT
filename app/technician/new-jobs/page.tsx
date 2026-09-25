"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";

type JobStatus = "pending" | "progress" | "done";
type JobPriority = "low" | "normal" | "high";

type RepairApiItem = {
  requestId?: number | string | null;
  request_id?: number | string | null;

  repairNo?: string | null;
  repair_no?: string | null;

  prefix?: string | null;
  fname?: string | null;
  lname?: string | null;
  email?: string | null;

  reporterName?: string | null;

  category?: string | null;
  equipment?: string | null;
  location?: string | null;

  subject?: string | null;
  title?: string | null;

  detail?: string | null;
  description?: string | null;

  priority?: string | null;
  status?: string | null;

  imageName?: string | null;
  image_name?: string | null;

  imagePath?: string | null;
  image_path?: string | null;

  technicianId?: number | string | null;
  technician_id?: number | string | null;

  resolutionText?: string | null;
  resolution_text?: string | null;

  repairCost?: number | string | null;
  repair_cost?: number | string | null;

  createdAt?: string | null;
  created_at?: string | null;

  acceptedAt?: string | null;
  accepted_at?: string | null;

  startedAt?: string | null;
  started_at?: string | null;

  completedAt?: string | null;
  completed_at?: string | null;

  closedAt?: string | null;
  closed_at?: string | null;
};

type RepairApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: RepairApiItem[];
  repairs?: RepairApiItem[];
};

type Job = {
  requestId: number;
  repairNo: string;
  title: string;
  category: string;
  equipment: string;
  location: string;

  priority: JobPriority;
  status: JobStatus;

  reporterName: string;
  email: string;

  description: string;

  imagePath: string | null;

  technicianId: number | null;

  repairCost: number | null;

  createdAt: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
};

type FilterStatus = "all" | JobStatus;

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = Number(value);

  return Number.isFinite(num) ? num : null;
}

function toText(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();

  return text || fallback;
}

function normalizeStatus(value: unknown): JobStatus {
  const status = toText(value).toLowerCase();

  if (
    status === "progress" ||
    status === "in_progress" ||
    status === "in-progress" ||
    status === "accepted" ||
    status === "assigned" ||
    status === "working" ||
    status === "กำลังดำเนินการ"
  ) {
    return "progress";
  }

  if (
    status === "done" ||
    status === "completed" ||
    status === "closed" ||
    status === "finish" ||
    status === "finished" ||
    status === "เสร็จแล้ว"
  ) {
    return "done";
  }

  return "pending";
}

function normalizePriority(value: unknown): JobPriority {
  const priority = toText(value).toLowerCase();

  if (
    priority === "high" ||
    priority === "urgent" ||
    priority === "critical" ||
    priority === "เร่งด่วน"
  ) {
    return "high";
  }

  if (
    priority === "low" ||
    priority === "ไม่เร่งด่วน"
  ) {
    return "low";
  }

  return "normal";
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatShortDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getReporterName(item: RepairApiItem): string {
  const directName = toText(item.reporterName);

  if (directName) {
    return directName;
  }

  const name = [
    toText(item.prefix),
    toText(item.fname),
    toText(item.lname),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "-";
}

function getImagePath(item: RepairApiItem): string | null {
  const raw = toText(
    item.imagePath ??
      item.image_path ??
      item.imageName ??
      item.image_name
  );

  if (!raw) {
    return null;
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  return `/${raw}`;
}

function mapRepairToJob(item: RepairApiItem): Job | null {
  const requestId = toNumber(
    item.requestId ?? item.request_id
  );

  if (requestId === null) {
    return null;
  }

  const repairNo =
    toText(item.repairNo ?? item.repair_no) ||
    `HD-${requestId}`;

  return {
    requestId,

    repairNo,

    title:
      toText(item.title ?? item.subject) ||
      "แจ้งซ่อมระบบ",

    category:
      toText(item.category) ||
      "ทั่วไป",

    equipment:
      toText(item.equipment) ||
      "-",

    location:
      toText(item.location) ||
      "-",

    priority:
      normalizePriority(item.priority),

    status:
      normalizeStatus(item.status),

    reporterName:
      getReporterName(item),

    email:
      toText(item.email) ||
      "-",

    description:
      toText(item.description ?? item.detail) ||
      "-",

    imagePath:
      getImagePath(item),

    technicianId:
      toNumber(
        item.technicianId ?? item.technician_id
      ),

    repairCost:
      toNumber(
        item.repairCost ?? item.repair_cost
      ),

    createdAt:
      toText(item.createdAt ?? item.created_at) ||
      null,

    acceptedAt:
      toText(item.acceptedAt ?? item.accepted_at) ||
      null,

    startedAt:
      toText(item.startedAt ?? item.started_at) ||
      null,

    completedAt:
      toText(
        item.completedAt ?? item.completed_at
      ) || null,

    closedAt:
      toText(item.closedAt ?? item.closed_at) ||
      null,
  };
}

async function readApiResponse(
  response: Response
): Promise<RepairApiResponse> {
  const rawText = await response.text();

  if (!rawText) {
    return {
      success: response.ok,
      message: response.ok
        ? ""
        : `HTTP ${response.status} ${response.statusText}`,
    };
  }

  try {
    return JSON.parse(rawText) as RepairApiResponse;
  } catch {
    return {
      success: false,
      message: rawText.slice(0, 500),
      error: `API ส่งข้อมูลที่ไม่ใช่ JSON (HTTP ${response.status})`,
    };
  }
}

const navItems = [
  {
    label: "ภาพรวม",
    path: "/technician",
    icon: "▦",
  },
  {
    label: "งานใหม่",
    path: "/new-jobs",
    icon: "✉",
  },
  {
    label: "กำลังดำเนินการ",
    path: "/progress-jobs",
    icon: "↻",
  },
  {
    label: "งานเสร็จแล้ว",
    path: "/completed-jobs",
    icon: "✓",
  },
  {
    label: "งานทั้งหมด",
    path: "/all-jobs",
    icon: "☷",
  },
  {
    label: "ตั้งค่า",
    path: "/settings",
    icon: "⚙",
  },
];

export default function TechnicianPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("all");

  const [selectedJob, setSelectedJob] =
    useState<Job | null>(null);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadRepairs = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch("/api/repair", {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await readApiResponse(response);

        if (!response.ok || data.success !== true) {
          throw new Error(
            data.error ||
              data.message ||
              `HTTP ${response.status} ${response.statusText}`
          );
        }

        const source =
          Array.isArray(data.repairs)
            ? data.repairs
            : Array.isArray(data.data)
            ? data.data
            : [];

        const mappedJobs = source
          .map((item: RepairApiItem) =>
            mapRepairToJob(item)
          )
          .filter(
            (item: Job | null): item is Job =>
              item !== null
          );

        setJobs(mappedJobs);
      } catch (errorValue) {
        console.error(
          "❌ Technician loadRepairs error:",
          errorValue
        );

        const message =
          errorValue instanceof Error
            ? errorValue.message
            : "ไม่สามารถดึงข้อมูลแจ้งซ่อมได้";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadRepairs();
  }, [loadRepairs]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage]);

  const statistics = useMemo(() => {
    const total = jobs.length;

    const pending = jobs.filter(
      (job: Job) => job.status === "pending"
    ).length;

    const progress = jobs.filter(
      (job: Job) => job.status === "progress"
    ).length;

    const done = jobs.filter(
      (job: Job) => job.status === "done"
    ).length;

    const urgent = jobs.filter(
      (job: Job) => job.priority === "high"
    ).length;

    return {
      total,
      pending,
      progress,
      done,
      urgent,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return jobs.filter((job: Job) => {
      const matchesStatus =
        statusFilter === "all" ||
        job.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchableText = [
        job.repairNo,
        job.title,
        job.category,
        job.equipment,
        job.location,
        job.reporterName,
        job.email,
        job.description,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [jobs, search, statusFilter]);

  const recentJobs = useMemo(() => {
    return [...filteredJobs]
      .sort((a: Job, b: Job) => {
        const aTime = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const bTime = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return bTime - aTime;
      })
      .slice(0, 8);
  }, [filteredJobs]);

  const acceptJob = async (job: Job) => {
    try {
      setProcessingId(job.requestId);
      setError("");

      const response = await fetch(
        `/api/repair?id=${encodeURIComponent(
          String(job.requestId)
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: "progress",
          }),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.error ||
            data.message ||
            `ไม่สามารถรับงานได้ (HTTP ${response.status})`
        );
      }

      setJobs((current: Job[]) =>
        current.map((item: Job) =>
          item.requestId === job.requestId
            ? {
                ...item,
                status: "progress",
                startedAt:
                  new Date().toISOString(),
              }
            : item
        )
      );

      setSelectedJob(null);

      setSuccessMessage(
        `รับงาน ${job.repairNo} เรียบร้อยแล้ว`
      );

      setTimeout(() => {
        router.push("/progress-jobs");
      }, 500);
    } catch (errorValue) {
      console.error(
        "❌ Technician acceptJob error:",
        errorValue
      );

      const message =
        errorValue instanceof Error
          ? errorValue.message
          : "ไม่สามารถรับงานได้";

      setError(message);
    } finally {
      setProcessingId(null);
    }
  };

  const goTo = (path: string) => {
    router.push(path);
  };

  const statusLabel = (status: JobStatus) => {
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

  const priorityLabel = (priority: JobPriority) => {
    switch (priority) {
      case "high":
        return "เร่งด่วน";

      case "low":
        return "ไม่เร่งด่วน";

      default:
        return "ปกติ";
    }
  };

  const priorityClass = (priority: JobPriority) => {
    switch (priority) {
      case "high":
        return "priority priorityHigh";

      case "low":
        return "priority priorityLow";

      default:
        return "priority priorityNormal";
    }
  };

  const statusClass = (status: JobStatus) => {
    switch (status) {
      case "pending":
        return "status statusPending";

      case "progress":
        return "status statusProgress";

      case "done":
        return "status statusDone";

      default:
        return "status";
    }
  };

  const cardStyle = (
    extra: CSSProperties = {}
  ): CSSProperties => ({
    ...extra,
  });

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #f5f7fb;
          color: #172033;
          font-family:
            Inter,
            "Noto Sans Thai",
            "Segoe UI",
            Arial,
            sans-serif;
        }

        body {
          min-height: 100vh;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .technicianPage {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
        }

        .sidebar {
          width: 255px;
          min-height: 100vh;
          background: linear-gradient(
            180deg,
            #111827 0%,
            #0f172a 100%
          );
          color: #fff;
          padding: 24px 16px;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          overflow-y: auto;
        }

        .brand {
          padding: 8px 12px 28px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 18px;
        }

        .brandTitle {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .brandSub {
          margin-top: 6px;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.5;
        }

        .navSection {
          display: grid;
          gap: 6px;
        }

        .navButton {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 0;
          border-radius: 12px;
          padding: 12px 13px;
          background: transparent;
          color: #cbd5e1;
          text-align: left;
          transition: 0.2s ease;
        }

        .navButton:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .navButton.active {
          background: #2563eb;
          color: #fff;
        }

        .navIcon {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.08);
          font-size: 13px;
        }

        .content {
          flex: 1;
          min-width: 0;
          padding: 28px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 26px;
        }

        .pageTitle {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
        }

        .pageSubtitle {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .topActions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .refreshButton {
          border: 1px solid #dbe2ea;
          background: #fff;
          color: #1e293b;
          border-radius: 10px;
          padding: 10px 14px;
          display: inline-flex;
          gap: 8px;
          align-items: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .refreshButton:hover {
          background: #f8fafc;
        }

        .refreshButton:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .profileBox {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 7px 12px 7px 8px;
          border-radius: 12px;
        }

        .avatar {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 10px;
          font-weight: 800;
        }

        .profileName {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .profileRole {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .alert {
          border-radius: 12px;
          padding: 13px 15px;
          margin-bottom: 18px;
          font-size: 14px;
          line-height: 1.5;
        }

        .alertError {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .alertSuccess {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .statCard {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.035);
        }

        .statTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .statLabel {
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
        }

        .statIcon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          background: #f8fafc;
          border-radius: 10px;
          font-size: 16px;
        }

        .statValue {
          margin-top: 10px;
          font-size: 30px;
          font-weight: 800;
          color: #0f172a;
        }

        .mainCard {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.035);
          overflow: hidden;
        }

        .cardHeader {
          padding: 20px;
          border-bottom: 1px solid #eef2f7;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cardTitle {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
        }

        .cardDescription {
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .searchBox {
          position: relative;
        }

        .searchInput {
          width: 270px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #dbe2ea;
          background: #fff;
          padding: 0 13px;
          outline: none;
          color: #0f172a;
        }

        .searchInput:focus {
          border-color: #60a5fa;
          box-shadow:
            0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .filterButtons {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .filterButton {
          height: 40px;
          border-radius: 10px;
          border: 1px solid #dbe2ea;
          background: #fff;
          color: #475569;
          padding: 0 12px;
          font-size: 13px;
        }

        .filterButton.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 700;
        }

        .jobList {
          padding: 16px;
          display: grid;
          gap: 12px;
        }

        .jobCard {
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          padding: 17px;
          transition: 0.18s ease;
          background: #fff;
        }

        .jobCard:hover {
          border-color: #bfdbfe;
          box-shadow: 0 8px 20px rgba(30, 64, 175, 0.07);
        }

        .jobTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .jobLeft {
          min-width: 0;
          flex: 1;
        }

        .jobNo {
          font-size: 12px;
          font-weight: 800;
          color: #2563eb;
        }

        .jobTitle {
          margin: 4px 0 0;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          word-break: break-word;
        }

        .badges {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .status,
        .priority {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .statusPending {
          background: #fff7ed;
          color: #c2410c;
        }

        .statusProgress {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .statusDone {
          background: #f0fdf4;
          color: #15803d;
        }

        .priorityHigh {
          background: #fef2f2;
          color: #b91c1c;
        }

        .priorityNormal {
          background: #f8fafc;
          color: #475569;
        }

        .priorityLow {
          background: #f0fdf4;
          color: #15803d;
        }

        .jobMeta {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 16px;
        }

        .metaItem {
          padding: 10px 11px;
          background: #f8fafc;
          border-radius: 11px;
        }

        .metaLabel {
          font-size: 10px;
          color: #94a3b8;
          margin-bottom: 4px;
        }

        .metaValue {
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .jobBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 15px;
          padding-top: 13px;
          border-top: 1px solid #eef2f7;
        }

        .createdText {
          color: #64748b;
          font-size: 11px;
        }

        .jobActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .button {
          border: 0;
          border-radius: 9px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 800;
        }

        .buttonSecondary {
          background: #f1f5f9;
          color: #334155;
        }

        .buttonPrimary {
          background: #2563eb;
          color: #fff;
        }

        .buttonPrimary:hover {
          background: #1d4ed8;
        }

        .buttonSecondary:hover {
          background: #e2e8f0;
        }

        .button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .empty {
          text-align: center;
          padding: 50px 20px;
          color: #64748b;
        }

        .emptyIcon {
          width: 58px;
          height: 58px;
          margin: 0 auto 12px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #f8fafc;
          font-size: 24px;
        }

        .emptyTitle {
          font-weight: 800;
          color: #334155;
        }

        .emptyText {
          margin-top: 5px;
          font-size: 13px;
        }

        .errorDetails {
          margin-top: 10px;
          padding: 10px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.65);
          font-size: 12px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .modalOverlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.52);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          width: min(760px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.23);
        }

        .modalHeader {
          padding: 19px 20px;
          border-bottom: 1px solid #eef2f7;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .modalTitle {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
        }

        .closeButton {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 10px;
          background: #f1f5f9;
          color: #475569;
          font-size: 20px;
        }

        .closeButton:hover {
          background: #e2e8f0;
        }

        .modalBody {
          padding: 20px;
        }

        .detailGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .detailItem {
          background: #f8fafc;
          border-radius: 12px;
          padding: 12px;
        }

        .detailLabel {
          color: #94a3b8;
          font-size: 10px;
          margin-bottom: 5px;
        }

        .detailValue {
          color: #1e293b;
          font-size: 13px;
          font-weight: 700;
          word-break: break-word;
        }

        .detailFull {
          grid-column: 1 / -1;
        }

        .descriptionBox {
          margin-top: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          padding: 14px;
        }

        .descriptionTitle {
          font-size: 12px;
          font-weight: 800;
          color: #334155;
          margin-bottom: 8px;
        }

        .descriptionText {
          white-space: pre-wrap;
          line-height: 1.7;
          font-size: 13px;
          color: #475569;
        }

        .imageBox {
          margin-top: 14px;
        }

        .imageBox img {
          width: 100%;
          max-height: 330px;
          object-fit: contain;
          border-radius: 13px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .modalFooter {
          padding: 16px 20px;
          border-top: 1px solid #eef2f7;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .loadingGrid {
          padding: 16px;
          display: grid;
          gap: 12px;
        }

        .skeleton {
          height: 150px;
          border-radius: 15px;
          background:
            linear-gradient(
              90deg,
              #f1f5f9 25%,
              #e2e8f0 37%,
              #f1f5f9 63%
            );
          background-size: 400% 100%;
          animation: skeletonMove 1.4s ease infinite;
        }

        @keyframes skeletonMove {
          0% {
            background-position: 100% 0;
          }

          100% {
            background-position: -100% 0;
          }
        }

        @media (max-width: 1180px) {
          .statsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .jobMeta {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 76px;
            padding: 18px 9px;
          }

          .brandTitle,
          .brandSub,
          .navButton span:last-child {
            display: none;
          }

          .brand {
            padding-left: 7px;
            padding-right: 7px;
          }

          .navButton {
            justify-content: center;
            padding-left: 8px;
            padding-right: 8px;
          }

          .content {
            padding: 20px;
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .statsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .searchInput {
            width: min(100%, 320px);
          }
        }

        @media (max-width: 640px) {
          .sidebar {
            display: none;
          }

          .content {
            padding: 14px;
          }

          .pageTitle {
            font-size: 22px;
          }

          .statsGrid {
            grid-template-columns: 1fr 1fr;
          }

          .cardHeader {
            align-items: flex-start;
          }

          .toolbar {
            width: 100%;
          }

          .searchBox {
            width: 100%;
          }

          .searchInput {
            width: 100%;
          }

          .jobTop {
            flex-direction: column;
          }

          .jobMeta {
            grid-template-columns: 1fr;
          }

          .jobBottom {
            flex-direction: column;
            align-items: flex-start;
          }

          .detailGrid {
            grid-template-columns: 1fr;
          }

          .detailFull {
            grid-column: auto;
          }

          .profileBox {
            display: none;
          }
        }
      `}</style>

      <div className="technicianPage">
        <aside className="sidebar">
          <div className="brand">
            <div className="brandTitle">
              CMU IT SERVICE CENTER
            </div>
            <div className="brandSub">
              ระบบจัดการงานแจ้งซ่อม
              <br />
              คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่
            </div>
          </div>

          <nav className="navSection">
            {navItems.map(
              (
                item: {
                  label: string;
                  path: string;
                  icon: string;
                }
              ) => {
                const active =
                  item.path === "/technician";

                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`navButton ${
                      active ? "active" : ""
                    }`}
                    onClick={() => goTo(item.path)}
                  >
                    <span className="navIcon">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </button>
                );
              }
            )}
          </nav>
        </aside>

        <main className="content">
          <header className="topbar">
            <div>
              <h1 className="pageTitle">
                Technician Center
              </h1>

              <p className="pageSubtitle">
                ภาพรวมและรายการงานแจ้งซ่อมสำหรับเจ้าหน้าที่ช่าง
              </p>
            </div>

            <div className="topActions">
              <button
                type="button"
                className="refreshButton"
                onClick={() => void loadRepairs(true)}
                disabled={refreshing}
              >
                {refreshing ? "กำลังโหลด..." : "↻ รีเฟรช"}
              </button>

              <div className="profileBox">
                <div className="avatar">
                  ช
                </div>

                <div>
                  <div className="profileName">
                    ช่าง IT
                  </div>

                  <div className="profileRole">
                    Technician
                  </div>
                </div>
              </div>
            </div>
          </header>

          {successMessage && (
            <div className="alert alertSuccess">
              ✓ {successMessage}
            </div>
          )}

          {error && (
            <div className="alert alertError">
              <strong>
                ไม่สามารถดึงข้อมูลแจ้งซ่อมได้
              </strong>

              <div className="errorDetails">
                {error}
              </div>
            </div>
          )}

          <section className="statsGrid">
            <div className="statCard">
              <div className="statTop">
                <div className="statLabel">
                  งานทั้งหมด
                </div>
                <div className="statIcon">
                  ☷
                </div>
              </div>

              <div className="statValue">
                {statistics.total}
              </div>
            </div>

            <div className="statCard">
              <div className="statTop">
                <div className="statLabel">
                  งานใหม่
                </div>
                <div className="statIcon">
                  ✉
                </div>
              </div>

              <div className="statValue">
                {statistics.pending}
              </div>
            </div>

            <div className="statCard">
              <div className="statTop">
                <div className="statLabel">
                  กำลังดำเนินการ
                </div>
                <div className="statIcon">
                  ↻
                </div>
              </div>

              <div className="statValue">
                {statistics.progress}
              </div>
            </div>

            <div className="statCard">
              <div className="statTop">
                <div className="statLabel">
                  เสร็จแล้ว
                </div>
                <div className="statIcon">
                  ✓
                </div>
              </div>

              <div className="statValue">
                {statistics.done}
              </div>
            </div>

            <div className="statCard">
              <div className="statTop">
                <div className="statLabel">
                  งานเร่งด่วน
                </div>
                <div className="statIcon">
                  !
                </div>
              </div>

              <div className="statValue">
                {statistics.urgent}
              </div>
            </div>
          </section>

          <section className="mainCard">
            <div className="cardHeader">
              <div>
                <h2 className="cardTitle">
                  รายการแจ้งซ่อม
                </h2>

                <p className="cardDescription">
                  แสดงรายการงานทั้งหมดจากระบบแจ้งซ่อม
                </p>
              </div>

              <div className="toolbar">
                <div className="searchBox">
                  <input
                    type="text"
                    className="searchInput"
                    placeholder="ค้นหาเลขงาน / อุปกรณ์ / สถานที่..."
                    value={search}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>
                    ) =>
                      setSearch(event.target.value)
                    }
                  />
                </div>

                <div className="filterButtons">
                  <button
                    type="button"
                    className={`filterButton ${
                      statusFilter === "all"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setStatusFilter("all")
                    }
                  >
                    ทั้งหมด
                  </button>

                  <button
                    type="button"
                    className={`filterButton ${
                      statusFilter === "pending"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setStatusFilter("pending")
                    }
                  >
                    งานใหม่
                  </button>

                  <button
                    type="button"
                    className={`filterButton ${
                      statusFilter === "progress"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setStatusFilter("progress")
                    }
                  >
                    กำลังทำ
                  </button>

                  <button
                    type="button"
                    className={`filterButton ${
                      statusFilter === "done"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setStatusFilter("done")
                    }
                  >
                    เสร็จแล้ว
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loadingGrid">
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="empty">
                <div className="emptyIcon">
                  {error ? "!" : "✓"}
                </div>

                <div className="emptyTitle">
                  {error
                    ? "โหลดข้อมูลไม่สำเร็จ"
                    : "ไม่พบรายการแจ้งซ่อม"}
                </div>

                <div className="emptyText">
                  {error
                    ? "ตรวจสอบ API / ฐานข้อมูล แล้วกดรีเฟรชอีกครั้ง"
                    : "ยังไม่มีรายการที่ตรงกับเงื่อนไขค้นหา"}
                </div>
              </div>
            ) : (
              <div className="jobList">
                {recentJobs.map((job: Job) => (
                  <article
                    key={job.requestId}
                    className="jobCard"
                  >
                    <div className="jobTop">
                      <div className="jobLeft">
                        <div className="jobNo">
                          {job.repairNo}
                        </div>

                        <h3 className="jobTitle">
                          {job.title}
                        </h3>
                      </div>

                      <div className="badges">
                        <span
                          className={statusClass(
                            job.status
                          )}
                        >
                          {statusLabel(job.status)}
                        </span>

                        <span
                          className={priorityClass(
                            job.priority
                          )}
                        >
                          {priorityLabel(
                            job.priority
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="jobMeta">
                      <div className="metaItem">
                        <div className="metaLabel">
                          อุปกรณ์
                        </div>

                        <div className="metaValue">
                          {job.equipment}
                        </div>
                      </div>

                      <div className="metaItem">
                        <div className="metaLabel">
                          สถานที่
                        </div>

                        <div className="metaValue">
                          {job.location}
                        </div>
                      </div>

                      <div className="metaItem">
                        <div className="metaLabel">
                          ผู้แจ้ง
                        </div>

                        <div className="metaValue">
                          {job.reporterName}
                        </div>
                      </div>

                      <div className="metaItem">
                        <div className="metaLabel">
                          วันที่แจ้ง
                        </div>

                        <div className="metaValue">
                          {formatShortDate(
                            job.createdAt
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="jobBottom">
                      <div className="createdText">
                        แจ้งเมื่อ{" "}
                        {formatDate(job.createdAt)}
                      </div>

                      <div className="jobActions">
                        <button
                          type="button"
                          className="button buttonSecondary"
                          onClick={() =>
                            setSelectedJob(job)
                          }
                        >
                          ดูรายละเอียด
                        </button>

                        {job.status === "pending" && (
                          <button
                            type="button"
                            className="button buttonPrimary"
                            disabled={
                              processingId ===
                              job.requestId
                            }
                            onClick={() =>
                              void acceptJob(job)
                            }
                          >
                            {processingId ===
                            job.requestId
                              ? "กำลังรับงาน..."
                              : "รับงาน"}
                          </button>
                        )}

                        {job.status === "progress" && (
                          <button
                            type="button"
                            className="button buttonPrimary"
                            onClick={() =>
                              goTo("/progress-jobs")
                            }
                          >
                            ไปหน้างานกำลังทำ
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedJob && (
        <div
          className="modalOverlay"
          onMouseDown={(
            event: React.MouseEvent<HTMLDivElement>
          ) => {
            if (event.target === event.currentTarget) {
              setSelectedJob(null);
            }
          }}
        >
          <div className="modal">
            <div className="modalHeader">
              <div>
                <h2 className="modalTitle">
                  รายละเอียดการแจ้งซ่อม
                </h2>

                <div
                  style={{
                    marginTop: 4,
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  {selectedJob.repairNo}
                </div>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={() =>
                  setSelectedJob(null)
                }
              >
                ×
              </button>
            </div>

            <div className="modalBody">
              <div className="detailGrid">
                <div className="detailItem">
                  <div className="detailLabel">
                    หัวข้อ
                  </div>

                  <div className="detailValue">
                    {selectedJob.title}
                  </div>
                </div>

                <div className="detailItem">
                  <div className="detailLabel">
                    สถานะ
                  </div>

                  <div className="detailValue">
                    {statusLabel(
                      selectedJob.status
                    )}
                  </div>
                </div>

                <div className="detailItem">
                  <div className="detailLabel">
                    ประเภท
                  </div>

                  <div className="detailValue">
                    {selectedJob.category}
                  </div>
                </div>

                <div className="detailItem">
                  <div className="detailLabel">
                    อุปกรณ์
                  </div>

                  <div className="detailValue">
                    {selectedJob.equipment}
                  </div>
                </div>

                <div className="detailItem">
                  <div className="detailLabel">
                    สถานที่
                  </div>

                  <div className="detailValue">
                    {selectedJob.location}
                  </div>
                </div>

                <div className="detailItem">
                  <div className="detailLabel">
                    ระดับความเร่งด่วน
                  </div>

                  <div className="detailValue">
                    {priorityLabel(
                      selectedJob.priority
                    )}
                  </div>
                </div>

                <div className="detailItem">
                  <div className="detailLabel">
                    ผู้แจ้ง
                  </div>

                  <div className="detailValue">
                    {selectedJob.reporterName}
                  </div>
                </div>

                <div className="detailItem">
                  <div className="detailLabel">
                    อีเมล
                  </div>

                  <div className="detailValue">
                    {selectedJob.email}
                  </div>
                </div>

                <div className="detailItem detailFull">
                  <div className="detailLabel">
                    วันที่แจ้ง
                  </div>

                  <div className="detailValue">
                    {formatDate(
                      selectedJob.createdAt
                    )}
                  </div>
                </div>
              </div>

              <div className="descriptionBox">
                <div className="descriptionTitle">
                  รายละเอียดปัญหา
                </div>

                <div className="descriptionText">
                  {selectedJob.description}
                </div>
              </div>

              {selectedJob.imagePath && (
                <div className="imageBox">
                  <div
                    className="descriptionTitle"
                    style={{
                      marginBottom: 8,
                    }}
                  >
                    รูปภาพประกอบ
                  </div>

                  <img
                    src={selectedJob.imagePath}
                    alt="รูปภาพประกอบการแจ้งซ่อม"
                    onError={(
                      event: React.SyntheticEvent<HTMLImageElement>
                    ) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="modalFooter">
              <button
                type="button"
                className="button buttonSecondary"
                onClick={() =>
                  setSelectedJob(null)
                }
              >
                ปิด
              </button>

              {selectedJob.status === "pending" && (
                <button
                  type="button"
                  className="button buttonPrimary"
                  disabled={
                    processingId ===
                    selectedJob.requestId
                  }
                  onClick={() =>
                    void acceptJob(selectedJob)
                  }
                >
                  {processingId ===
                  selectedJob.requestId
                    ? "กำลังรับงาน..."
                    : "รับงานนี้"}
                </button>
              )}

              {selectedJob.status === "progress" && (
                <button
                  type="button"
                  className="button buttonPrimary"
                  onClick={() =>
                    goTo("/progress-jobs")
                  }
                >
                  ดูงานที่กำลังดำเนินการ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}