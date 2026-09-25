"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import "./repair.css";

type Priority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

type ApiPriority =
  | "low"
  | "normal"
  | "high";

interface User {
  userId: string | null;
  username: string;

  prefix: string;
  fname: string;
  lname: string;

  fullName: string;

  email: string;
  phone: string;

  role: string;
  department: string;
  status: string;
}

interface RepairForm {
  categoryId: number | null;
  equipmentId: number | null;
  locationId: number | null;

  category: string;
  equipment: string;
  location: string;

  subject: string;
  detail: string;

  priority: Priority;
}

interface ApiUser {
  userId?: string | number | null;
  user_id?: string | number | null;

  username?: string | null;

  prefix?: string | null;
  fname?: string | null;
  lname?: string | null;

  fullName?: string | null;
  full_name?: string | null;

  email?: string | null;
  phone?: string | null;

  role?: string | null;
  department?: string | null;
  status?: string | null;
}

interface MeApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  user?: ApiUser;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;

  requestId?: string | number;
  requestCode?: string;
  repairNo?: string;

  data?: {
    requestId?: string | number;
    requestCode?: string;
    repairNo?: string;
  };
}

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

function numberValue(
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

  return Number.isFinite(number)
    ? number
    : null;
}

function splitFullName(
  fullName: string
): {
  prefix: string;
  fname: string;
  lname: string;
} {
  const text = fullName.trim();

  if (!text) {
    return {
      prefix: "",
      fname: "",
      lname: "",
    };
  }

  const prefixes = [
    "นาย",
    "นาง",
    "นางสาว",
    "ดร.",
    "ผศ.",
    "รศ.",
    "ศ.",
    "อาจารย์",
  ];

  let prefix = "";
  let remaining = text;

  for (const item of prefixes) {
    if (
      remaining === item ||
      remaining.startsWith(`${item} `)
    ) {
      prefix = item;

      remaining = remaining
        .slice(item.length)
        .trim();

      break;
    }
  }

  const parts = remaining
    .split(/\s+/)
    .filter(Boolean);

  const fname = parts[0] ?? "";

  const lname =
    parts.length > 1
      ? parts.slice(1).join(" ")
      : "";

  return {
    prefix,
    fname,
    lname,
  };
}

function normalizeUser(
  apiUser: ApiUser
): User {
  const userIdRaw =
    apiUser.userId ??
    apiUser.user_id;

  const fullNameFromApi =
    textValue(
      apiUser.fullName ??
        apiUser.full_name
    );

  const parsedName =
    splitFullName(
      fullNameFromApi
    );

  const prefix =
    textValue(apiUser.prefix) ||
    parsedName.prefix;

  const fname =
    textValue(apiUser.fname) ||
    parsedName.fname;

  const lname =
    textValue(apiUser.lname) ||
    parsedName.lname;

  const fullName =
    fullNameFromApi ||
    [prefix, fname, lname]
      .filter(Boolean)
      .join(" ")
      .trim();

  return {
    userId:
      userIdRaw !== null &&
      userIdRaw !== undefined
        ? String(userIdRaw)
        : null,

    username:
      textValue(
        apiUser.username
      ),

    prefix,
    fname,
    lname,

    fullName,

    email:
      textValue(apiUser.email),

    phone:
      textValue(apiUser.phone),

    role:
      textValue(apiUser.role),

    department:
      textValue(
        apiUser.department
      ),

    status:
      textValue(apiUser.status),
  };
}

async function readJson<T>(
  response: Response
): Promise<T> {
  const responseText =
    await response.text();

  if (!responseText) {
    return {} as T;
  }

  try {
    return JSON.parse(
      responseText
    ) as T;
  } catch {
    throw new Error(
      `Server ส่งข้อมูลที่ไม่ใช่ JSON (HTTP ${response.status})`
    );
  }
}

export default function RepairPage() {
  const router = useRouter();

  // =========================================
  // USER
  // =========================================

  const [user, setUser] =
    useState<User>({
      userId: null,

      username: "",

      prefix: "",
      fname: "",
      lname: "",

      fullName: "",

      email: "",
      phone: "",

      role: "",
      department: "",
      status: "",
    });

  // =========================================
  // FORM
  // =========================================

  const [form, setForm] =
    useState<RepairForm>({
      categoryId: null,
      equipmentId: null,
      locationId: null,

      category: "",
      equipment: "",
      location: "",

      subject: "",
      detail: "",

      priority: "normal",
    });

  // =========================================
  // IMAGE
  // =========================================

  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  // =========================================
  // STATE
  // =========================================

  const [submitting, setSubmitting] =
    useState(false);

  const [loadingUser, setLoadingUser] =
    useState(true);

  // =========================================
  // LOAD CURRENT USER
  //
  // ใช้ /api/me เป็นแหล่งหลัก
  // ถ้า API ตอบ 404 / ไม่พบผู้ใช้ / ไม่ใช่ JSON
  // จะ fallback ไป localStorage ก่อนพากลับหน้า Login
  // =========================================

  useEffect(() => {
    let cancelled = false;

    const saveUserToStorage = (
      normalizedUser: User
    ) => {
      if (!normalizedUser.userId) {
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(normalizedUser)
      );

      localStorage.setItem(
        "userId",
        normalizedUser.userId
      );

      localStorage.setItem(
        "user_id",
        normalizedUser.userId
      );

      localStorage.setItem(
        "username",
        normalizedUser.username
      );

      localStorage.setItem(
        "role",
        normalizedUser.role
      );

      localStorage.setItem(
        "fullName",
        normalizedUser.fullName
      );
    };

    const readStoredUser =
      (): ApiUser | null => {
        try {
          const storedUser =
            localStorage.getItem("user");

          if (!storedUser) {
            return null;
          }

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
            return parsed.user;
          }

          return parsed as ApiUser;
        } catch (storageError) {
          console.warn(
            "อ่าน localStorage user ไม่สำเร็จ:",
            storageError
          );

          return null;
        }
      };

    const loadCurrentUser =
      async () => {
        try {
          setLoadingUser(true);

          let apiUser: ApiUser | null =
            null;

          // ===================================
          // 1. พยายามอ่านจาก /api/me
          // ===================================

          try {
            const response =
              await fetch(
                "/api/me",
                {
                  method: "GET",
                  cache: "no-store",
                  credentials: "include",
                  headers: {
                    Accept:
                      "application/json",
                  },
                }
              );

            const data =
              await readJson<MeApiResponse>(
                response
              );

            if (
              response.ok &&
              data.success === true &&
              data.user
            ) {
              apiUser =
                data.user;
            } else {
              console.warn(
                "GET /api/me ไม่สำเร็จ:",
                {
                  status:
                    response.status,
                  error:
                    data.error ||
                    data.message,
                }
              );
            }
          } catch (apiError) {
            console.warn(
              "เรียก /api/me ไม่สำเร็จ:",
              apiError
            );
          }

          // ===================================
          // 2. FALLBACK LOCALSTORAGE
          // ===================================

          if (!apiUser) {
            apiUser =
              readStoredUser();
          }

          if (!apiUser) {
            throw new Error(
              "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่"
            );
          }

          const normalizedUser =
            normalizeUser(
              apiUser
            );

          if (
            !normalizedUser.userId
          ) {
            throw new Error(
              "ไม่พบ user_id ของผู้แจ้งซ่อม กรุณาเข้าสู่ระบบใหม่"
            );
          }

          if (cancelled) {
            return;
          }

          setUser(
            normalizedUser
          );

          saveUserToStorage(
            normalizedUser
          );

          console.log(
            "✅ REPAIR CURRENT USER:",
            {
              userId:
                normalizedUser.userId,
              username:
                normalizedUser.username,
              fullName:
                normalizedUser.fullName,
              email:
                normalizedUser.email,
              role:
                normalizedUser.role,
            }
          );
        } catch (errorValue) {
          console.error(
            "LOAD USER ERROR:",
            errorValue
          );

          if (cancelled) {
            return;
          }

          const message =
            errorValue instanceof
            Error
              ? errorValue.message
              : "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้";

          alert(message);

          router.push(
            "/login"
          );
        } finally {
          if (!cancelled) {
            setLoadingUser(false);
          }
        }
      };

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // =========================================
  // CLEANUP IMAGE PREVIEW
  // =========================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  // =========================================
  // USER CHANGE
  // =========================================

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
    } = e.target;

    setUser(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        }) as User
    );
  };

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm(
      (prev) => {
        if (
          name === "priority"
        ) {
          return {
            ...prev,
            priority:
              value as Priority,
          };
        }

        return {
          ...prev,
          [name]: value,
        };
      }
    );
  };

  // =========================================
  // CATEGORY
  // =========================================

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value =
      e.target.value;

    setForm(
      (prev) => ({
        ...prev,

        category:
          value,

        categoryId:
          null,
      })
    );
  };

  // =========================================
  // IMAGE
  // =========================================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      setImage(null);
      setImagePreview("");
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5 MB"
      );

      e.target.value = "";

      setImage(null);
      setImagePreview("");

      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "กรุณาเลือกไฟล์ PNG, JPG, JPEG หรือ WEBP เท่านั้น"
      );

      e.target.value = "";

      setImage(null);
      setImagePreview("");

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setImage(file);
    setImagePreview(
      previewUrl
    );
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    let currentUserId =
      user.userId;

    // fallback localStorage
    if (!currentUserId) {
      const storedUserId =
        localStorage.getItem(
          "userId"
        ) ||
        localStorage.getItem(
          "user_id"
        );

      const normalized =
        textValue(
          storedUserId
        );

      if (
        /^\d+$/.test(
          normalized
        ) &&
        normalized !== "0"
      ) {
        currentUserId =
          normalized;
      }
    }

    if (
      !currentUserId ||
      !/^\d+$/.test(
        currentUserId
      ) ||
      currentUserId === "0"
    ) {
      alert(
        "ไม่พบ user_id ของผู้แจ้งซ่อม\n\nกรุณาเข้าสู่ระบบใหม่ก่อนแจ้งซ่อม"
      );

      localStorage.removeItem(
        "userId"
      );

      localStorage.removeItem(
        "user_id"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "currentUser"
      );

      router.push(
        "/login"
      );

      return;
    }

    // =======================================
    // VALIDATE USER
    // =======================================

    if (!user.prefix.trim()) {
      alert(
        "กรุณากรอกคำนำหน้า"
      );
      return;
    }

    if (!user.fname.trim()) {
      alert(
        "กรุณากรอกชื่อ"
      );
      return;
    }

    if (!user.lname.trim()) {
      alert(
        "กรุณากรอกนามสกุล"
      );
      return;
    }

    if (!user.email.trim()) {
      alert(
        "กรุณากรอก Email"
      );
      return;
    }

    // =======================================
    // VALIDATE REPAIR
    // =======================================

    if (!form.category) {
      alert(
        "กรุณาเลือกประเภทอุปกรณ์"
      );
      return;
    }

    if (!form.location.trim()) {
      alert(
        "กรุณากรอกสถานที่ตั้งอุปกรณ์"
      );
      return;
    }

    if (!form.subject.trim()) {
      alert(
        "กรุณากรอกหัวข้อปัญหา"
      );
      return;
    }

    if (!form.detail.trim()) {
      alert(
        "กรุณากรอกรายละเอียดปัญหา"
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData =
        new FormData();

      // =====================================
      // USER
      // =====================================

      formData.append(
        "userId",
        currentUserId
      );

      formData.append(
        "user_id",
        currentUserId
      );

      formData.append(
        "prefix",
        user.prefix.trim()
      );

      formData.append(
        "fname",
        user.fname.trim()
      );

      formData.append(
        "lname",
        user.lname.trim()
      );

      formData.append(
        "email",
        user.email.trim()
      );

      // =====================================
      // REPAIR
      // =====================================

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "equipment",
        form.equipment.trim()
      );

      formData.append(
        "location",
        form.location.trim()
      );

      formData.append(
        "subject",
        form.subject.trim()
      );

      formData.append(
        "title",
        form.subject.trim()
      );

      formData.append(
        "detail",
        form.detail.trim()
      );

      formData.append(
        "problemDescription",
        form.detail.trim()
      );

      const apiPriority: ApiPriority =
        form.priority ===
        "urgent"
          ? "high"
          : form.priority;

      formData.append(
        "priority",
        apiPriority
      );

      // =====================================
      // IDs
      // =====================================

      if (
        form.categoryId !==
        null
      ) {
        formData.append(
          "categoryId",
          String(
            form.categoryId
          )
        );
      }

      if (
        form.equipmentId !==
        null
      ) {
        formData.append(
          "equipmentId",
          String(
            form.equipmentId
          )
        );
      }

      if (
        form.locationId !==
        null
      ) {
        formData.append(
          "locationId",
          String(
            form.locationId
          )
        );
      }

      // =====================================
      // IMAGE
      // =====================================

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      console.log(
        "========== REPAIR SUBMIT =========="
      );

      console.log(
        "userId:",
        currentUserId
      );

      console.log(
        "username:",
        user.username
      );

      console.log(
        "email:",
        user.email
      );

      console.log(
        "category:",
        form.category
      );

      console.log(
        "equipment:",
        form.equipment
      );

      console.log(
        "location:",
        form.location
      );

      console.log(
        "subject:",
        form.subject
      );

      console.log(
        "priority:",
        apiPriority
      );

      // =====================================
      // SEND API
      // =====================================

      const response =
        await fetch(
          "/api/repair",
          {
            method: "POST",
            body: formData,
            cache: "no-store",
            credentials: "include",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const responseText =
        await response.text();

      console.log(
        "REPAIR API STATUS:",
        response.status
      );

      console.log(
        "REPAIR API RESPONSE:",
        responseText
      );

      let data:
        | ApiResponse
        | null = null;

      try {
        data =
          responseText
            ? (JSON.parse(
                responseText
              ) as ApiResponse)
            : null;
      } catch {
        alert(
          `เซิร์ฟเวอร์ส่งข้อมูลกลับมาไม่ถูกต้อง\n\nHTTP ${response.status}\n\n${responseText.substring(
            0,
            500
          )}`
        );

        return;
      }

      // =====================================
      // ERROR
      // =====================================

      if (
        !response.ok ||
        data?.success !== true
      ) {
        console.error(
          "REPAIR API ERROR:",
          {
            status:
              response.status,
            statusText:
              response.statusText,
            data,
            rawResponse:
              responseText,
          }
        );

        const message =
          data?.error ||
          data?.message ||
          `HTTP ${response.status} ${response.statusText}`;

        alert(
          `ไม่สามารถบันทึกข้อมูลแจ้งซ่อมได้\n\n${message}`
        );

        return;
      }

      // =====================================
      // SUCCESS
      // =====================================

      const requestCode =
        data.requestCode ??
        data.repairNo ??
        data.data
          ?.requestCode ??
        data.data
          ?.repairNo ??
        "-";

      alert(
        `แจ้งซ่อมสำเร็จ\nเลขที่งานซ่อม: ${requestCode}`
      );

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setImage(null);
      setImagePreview("");

      setForm({
        categoryId: null,
        equipmentId: null,
        locationId: null,

        category: "",
        equipment: "",
        location: "",

        subject: "",
        detail: "",

        priority:
          "normal",
      });

      router.push(
        "/dashboard"
      );

      router.refresh();
    } catch (errorValue) {
      console.error(
        "REPAIR SUBMIT ERROR:",
        errorValue
      );

      const message =
        errorValue instanceof
        Error
          ? errorValue.message
          : "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";

      alert(
        `ไม่สามารถส่งข้อมูลแจ้งซ่อมได้\n\n${message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <main className="repair-page">
      <header className="repair-header">
        <div className="repair-header-left">
          <button
            className="back-btn"
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            disabled={
              submitting
            }
          >
            ←
          </button>

          <div>
            <div className="header-title">
              แจ้งซ่อมใหม่
            </div>

            <div className="header-subtitle">
              Fix it
            </div>
          </div>
        </div>

        <div className="header-user">
          <div className="header-avatar">
            {(
              user.fname ||
              user.fullName ||
              user.username ||
              "U"
            ).charAt(0)}
          </div>

          <div className="header-user-info">
            <strong>
              ผู้แจ้ง
            </strong>

            <span>
              {loadingUser
                ? "กำลังโหลด..."
                : user.fname
                ? `${user.prefix} ${user.fname} ${user.lname}`.trim()
                : user.fullName ||
                  user.username ||
                  `User #${
                    user.userId ??
                    "-"
                  }`}
            </span>
          </div>
        </div>
      </header>

      <section className="repair-container">
        <div className="repair-heading">
          <div>
            <div className="heading-badge">
              CMU IT SERVICE CENTER
            </div>

            <h1>
              แจ้งซ่อมครุภัณฑ์
            </h1>

            <p>
              กรุณากรอกข้อมูลให้ครบถ้วน
              เพื่อให้เจ้าหน้าที่สามารถดำเนินการได้อย่างรวดเร็ว
            </p>
          </div>

          <div className="heading-icon">
            🔧
          </div>
        </div>

        <form
          className="repair-form"
          onSubmit={
            handleSubmit
          }
        >
          {/* USER INFO */}
          <div className="form-card">
            <div className="card-title">
              <div className="card-icon purple">
                👤
              </div>

              <div>
                <h2>
                  ข้อมูลผู้แจ้ง
                </h2>

                <span>
                  ข้อมูลสำหรับติดต่อกลับ
                </span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  คำนำหน้า{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="prefix"
                  placeholder="เช่น นาย / นาง / นางสาว"
                  value={
                    user.prefix
                  }
                  onChange={
                    handleUserChange
                  }
                  disabled={
                    submitting ||
                    loadingUser
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  ชื่อ{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="fname"
                  placeholder="กรอกชื่อ"
                  value={
                    user.fname
                  }
                  onChange={
                    handleUserChange
                  }
                  disabled={
                    submitting ||
                    loadingUser
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  นามสกุล{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="lname"
                  placeholder="กรอกนามสกุล"
                  value={
                    user.lname
                  }
                  onChange={
                    handleUserChange
                  }
                  disabled={
                    submitting ||
                    loadingUser
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Email{" "}
                  <span>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="example@cmu.ac.th"
                  value={
                    user.email
                  }
                  onChange={
                    handleUserChange
                  }
                  disabled={
                    submitting ||
                    loadingUser
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* EQUIPMENT */}
          <div className="form-card">
            <div className="card-title">
              <div className="card-icon blue">
                🖥️
              </div>

              <div>
                <h2>
                  ข้อมูลครุภัณฑ์
                </h2>

                <span>
                  ข้อมูลที่ใช้ระบุอุปกรณ์ที่พบปัญหา
                </span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  ประเภทอุปกรณ์{" "}
                  <span>*</span>
                </label>

                <select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleCategoryChange
                  }
                  disabled={
                    submitting
                  }
                  required
                >
                  <option value="">
                    -- เลือกประเภทอุปกรณ์ --
                  </option>

                  <option value="computer">
                    คอมพิวเตอร์
                  </option>

                  <option value="printer">
                    เครื่องพิมพ์
                  </option>

                  <option value="network">
                    ระบบเครือข่าย
                  </option>

                  <option value="av">
                    โสตทัศนูปกรณ์
                  </option>

                  <option value="office">
                    อุปกรณ์สำนักงาน
                  </option>

                  <option value="other">
                    อื่น ๆ
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  ชื่อ/รุ่นอุปกรณ์
                </label>

                <input
                  type="text"
                  name="equipment"
                  value={
                    form.equipment
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="เช่น Dell OptiPlex 7090"
                  disabled={
                    submitting
                  }
                />
              </div>

              <div className="form-group full">
                <label>
                  สถานที่ตั้งอุปกรณ์{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="location"
                  value={
                    form.location
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="เช่น ห้อง 301 อาคารคณะสังคมศาสตร์"
                  disabled={
                    submitting
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* PROBLEM */}
          <div className="form-card">
            <div className="card-title">
              <div className="card-icon orange">
                ⚠
              </div>

              <div>
                <h2>
                  รายละเอียดปัญหา
                </h2>

                <span>
                  อธิบายอาการหรือปัญหาที่พบ
                </span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full">
                <label>
                  หัวข้อปัญหา{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="subject"
                  value={
                    form.subject
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="เช่น คอมพิวเตอร์เปิดไม่ติด"
                  disabled={
                    submitting
                  }
                  required
                />
              </div>

              <div className="form-group full">
                <label>
                  รายละเอียดปัญหา{" "}
                  <span>*</span>
                </label>

                <textarea
                  name="detail"
                  value={
                    form.detail
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="กรุณาอธิบายอาการที่พบ..."
                  rows={6}
                  disabled={
                    submitting
                  }
                  required
                />

                <div className="input-help">
                  ยิ่งระบุรายละเอียดมาก
                  เจ้าหน้าที่จะสามารถวิเคราะห์ปัญหาได้รวดเร็วยิ่งขึ้น
                </div>
              </div>
            </div>
          </div>

          {/* PRIORITY */}
          <div className="form-card">
            <div className="card-title">
              <div className="card-icon red">
                !
              </div>

              <div>
                <h2>
                  ระดับความเร่งด่วน
                </h2>

                <span>
                  ระบุความสำคัญของปัญหา
                </span>
              </div>
            </div>

            <div className="priority-grid">
              <label
                className={`priority-option ${
                  form.priority ===
                  "low"
                    ? "selected low"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={
                    form.priority ===
                    "low"
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    submitting
                  }
                />

                <div className="priority-content">
                  <strong>
                    ไม่เร่งด่วน
                  </strong>

                  <span>
                    สามารถรอดำเนินการตามลำดับได้
                  </span>
                </div>

                <div className="priority-check">
                  ✓
                </div>
              </label>

              <label
                className={`priority-option ${
                  form.priority ===
                  "normal"
                    ? "selected normal"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="normal"
                  checked={
                    form.priority ===
                    "normal"
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    submitting
                  }
                />

                <div className="priority-content">
                  <strong>
                    ปกติ
                  </strong>

                  <span>
                    ปัญหาที่ต้องการให้เจ้าหน้าที่ดำเนินการ
                  </span>
                </div>

                <div className="priority-check">
                  ✓
                </div>
              </label>

              <label
                className={`priority-option ${
                  form.priority ===
                  "high"
                    ? "selected high"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={
                    form.priority ===
                    "high"
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    submitting
                  }
                />

                <div className="priority-content">
                  <strong>
                    เร่งด่วน
                  </strong>

                  <span>
                    ส่งผลกระทบต่อการทำงานหรือการให้บริการ
                  </span>
                </div>

                <div className="priority-check">
                  ✓
                </div>
              </label>

              <label
                className={`priority-option ${
                  form.priority ===
                  "urgent"
                    ? "selected urgent"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="urgent"
                  checked={
                    form.priority ===
                    "urgent"
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    submitting
                  }
                />

                <div className="priority-content">
                  <strong>
                    ด่วนมาก
                  </strong>

                  <span>
                    ปัญหาสำคัญที่ควรดำเนินการโดยเร็ว
                  </span>
                </div>

                <div className="priority-check">
                  ✓
                </div>
              </label>
            </div>
          </div>

          {/* IMAGE */}
          <div className="form-card">
            <div className="card-title">
              <div className="card-icon green">
                📷
              </div>

              <div>
                <h2>
                  รูปภาพประกอบ
                </h2>

                <span>
                  แนบรูปภาพปัญหาเพื่อช่วยในการตรวจสอบ
                </span>
              </div>
            </div>

            <label className="upload-area">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={
                  handleImageChange
                }
                disabled={
                  submitting
                }
              />

              <div className="upload-icon">
                ↑
              </div>

              {image ? (
                <>
                  <strong>
                    {image.name}
                  </strong>

                  <span>
                    {(
                      image.size /
                      1024 /
                      1024
                    ).toFixed(
                      2
                    )}{" "}
                    MB
                  </span>

                  {imagePreview && (
                    <img
                      src={
                        imagePreview
                      }
                      alt="ตัวอย่างรูปภาพ"
                      style={{
                        maxWidth:
                          "220px",
                        maxHeight:
                          "160px",
                        objectFit:
                          "contain",
                        marginTop:
                          "12px",
                        borderRadius:
                          "10px",
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <strong>
                    คลิกเพื่อเลือกไฟล์รูปภาพ
                  </strong>

                  <span>
                    PNG, JPG, JPEG หรือ
                    WEBP ขนาดไม่เกิน 5 MB
                  </span>
                </>
              )}
            </label>
          </div>

          {/* NOTICE */}
          <div className="repair-notice">
            <div className="notice-icon">
              ℹ
            </div>

            <div>
              <strong>
                ก่อนส่งคำขอแจ้งซ่อม
              </strong>

              <p>
                กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                โดยเฉพาะสถานที่และรายละเอียดปัญหา
                เพื่อให้เจ้าหน้าที่สามารถติดต่อและดำเนินการได้อย่างรวดเร็ว
              </p>
            </div>
          </div>

          {/* ACTION */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              disabled={
                submitting
              }
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={
                submitting ||
                loadingUser
              }
            >
              {submitting ? (
                <>
                  <span className="button-spinner"></span>
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                <>
                  ส่งคำขอแจ้งซ่อม
                  <span>
                    →
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}