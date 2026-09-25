
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./settings.css";

export default function SettingsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    prefix: "นาย",
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    repairCreated: true,
    repairProgress: true,
    repairCompleted: true,
    email: false,
  });

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfile = () => {
    alert("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
  };

  const changePassword = () => {
    if (!password.current) {
      alert("กรุณากรอกรหัสผ่านปัจจุบัน");
      return;
    }

    if (!password.newPassword) {
      alert("กรุณากรอกรหัสผ่านใหม่");
      return;
    }

    if (password.newPassword.length < 6) {
      alert("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password.newPassword !== password.confirm) {
      alert("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    alert("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");

    setPassword({
      current: "",
      newPassword: "",
      confirm: "",
    });
  };

  const saveNotifications = () => {
    alert("บันทึกการตั้งค่าการแจ้งเตือนแล้ว");
  };

  const logout = () => {
    fetch("/api/logout", { method: "POST" }).finally(() => {
      document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      router.push("/login");
    });
  };

  return (
    <div className="settings-page">

      {/* ================= SIDEBAR ================= */}
      <aside className="settings-sidebar">

        <div className="settings-brand">

          <div className="settings-cmu-logo">
            CMU
          </div>

          <div>
            <h2>Fix it</h2>
            <span>ระบบแจ้งซ่อมครุภัณฑ์</span>
          </div>

        </div>

        <div className="settings-menu-title">
          MAIN MENU
        </div>

        <nav className="settings-menu">

          <button
            type="button"
            className="settings-menu-item"
            onClick={() => router.push("/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className="settings-menu-item"
            onClick={() => router.push("/repair")}
          >
            <span>＋</span>
            แจ้งซ่อมใหม่
          </button>

          <button
            type="button"
            className="settings-menu-item"
            onClick={() => router.push("/repair-list")}
          >
            <span>▤</span>
            รายการแจ้งซ่อม
          </button>

          <button
            type="button"
            className="settings-menu-item"
            onClick={() => router.push("/statistics")}
          >
            <span>◔</span>
            สถิติการแจ้งซ่อม
          </button>

        </nav>

        <div className="settings-menu-title settings-system-title">
          SYSTEM
        </div>

        <nav className="settings-menu">

          <button
            type="button"
            className="settings-menu-item active"
          >
            <span>⚙</span>
            ตั้งค่า
          </button>

        </nav>

        <div className="settings-sidebar-bottom">

          <div className="settings-support">
            <div className="settings-support-icon">
              ?
            </div>

            <div>
              <strong>ต้องการความช่วยเหลือ?</strong>
              <span>ติดต่อเจ้าหน้าที่ IT Support</span>
            </div>
          </div>

          <button
            type="button"
            className="settings-logout"
            onClick={logout}
          >
            <span>↪</span>
            ออกจากระบบ
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}
      <main className="settings-main">

        {/* TOPBAR */}
        <header className="settings-topbar">

          <div className="settings-breadcrumb">
            <span>Fix it</span>
            <b>/</b>
            <strong>ตั้งค่า</strong>
          </div>

          <div className="settings-top-user">

            <div className="settings-avatar">
              U
            </div>

            <div>
              <strong>ผู้ใช้งาน</strong>
              <span>User</span>
            </div>

            <span className="settings-arrow">
              ⌄
            </span>

          </div>

        </header>

        {/* CONTENT */}
        <section className="settings-content">

          <div className="settings-heading">

            <div>
              <span>ACCOUNT SETTINGS</span>

              <h1>
                ตั้งค่าระบบ
              </h1>

              <p>
                จัดการข้อมูลบัญชีและการตั้งค่าการใช้งาน Fix it
              </p>
            </div>

          </div>

          {/* SETTINGS LAYOUT */}
          <div className="settings-layout">

            {/* TAB MENU */}
            <div className="settings-tabs">

              <button
                type="button"
                className={
                  activeTab === "profile"
                    ? "setting-tab active"
                    : "setting-tab"
                }
                onClick={() => setActiveTab("profile")}
              >
                <span className="tab-icon purple">
                  ◉
                </span>

                <div>
                  <strong>ข้อมูลส่วนตัว</strong>
                  <small>จัดการข้อมูลบัญชี</small>
                </div>

                <b>›</b>
              </button>

              <button
                type="button"
                className={
                  activeTab === "password"
                    ? "setting-tab active"
                    : "setting-tab"
                }
                onClick={() => setActiveTab("password")}
              >
                <span className="tab-icon orange">
                  🔒
                </span>

                <div>
                  <strong>เปลี่ยนรหัสผ่าน</strong>
                  <small>รักษาความปลอดภัยบัญชี</small>
                </div>

                <b>›</b>
              </button>

              <button
                type="button"
                className={
                  activeTab === "notification"
                    ? "setting-tab active"
                    : "setting-tab"
                }
                onClick={() => setActiveTab("notification")}
              >
                <span className="tab-icon blue">
                  🔔
                </span>

                <div>
                  <strong>การแจ้งเตือน</strong>
                  <small>จัดการการแจ้งเตือน</small>
                </div>

                <b>›</b>
              </button>

            </div>

            {/* SETTINGS PANEL */}
            <div className="settings-panel">

              {/* ================= PROFILE ================= */}
              {activeTab === "profile" && (
                <div>

                  <div className="panel-title">

                    <div className="panel-title-icon">
                      ◉
                    </div>

                    <div>
                      <h2>ข้อมูลส่วนตัว</h2>
                      <p>
                        แก้ไขข้อมูลส่วนตัวของคุณ
                      </p>
                    </div>

                  </div>

                  <div className="profile-header">

                    <div className="big-avatar">
                      U
                    </div>

                    <div>
                      <h3>ผู้ใช้งาน</h3>
                      <span>
                        Fix it User
                      </span>
                    </div>

                  </div>

                  <div className="form-grid">

                    <div className="form-group">

                      <label>
                        คำนำหน้า
                      </label>

                      <select
                        name="prefix"
                        value={profile.prefix}
                        onChange={handleProfileChange}
                      >
                        <option value="นาย">นาย</option>
                        <option value="นาง">นาง</option>
                        <option value="นางสาว">
                          นางสาว
                        </option>
                      </select>

                    </div>

                    <div className="form-group">
                      <label>
                        Username
                      </label>

                      <input
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleProfileChange}
                        placeholder="Username"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        ชื่อ
                      </label>

                      <input
                        type="text"
                        name="fname"
                        value={profile.fname}
                        onChange={handleProfileChange}
                        placeholder="ชื่อ"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        นามสกุล
                      </label>

                      <input
                        type="text"
                        name="lname"
                        value={profile.lname}
                        onChange={handleProfileChange}
                        placeholder="นามสกุล"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        placeholder="example@cmu.ac.th"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        เบอร์โทรศัพท์
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        placeholder="08xxxxxxxx"
                      />
                    </div>

                  </div>

                  <div className="form-actions">

                    <button
                      type="button"
                      className="save-button"
                      onClick={saveProfile}
                    >
                      ✓ บันทึกข้อมูล
                    </button>

                  </div>

                </div>
              )}

              {/* ================= PASSWORD ================= */}
              {activeTab === "password" && (
                <div>

                  <div className="panel-title">

                    <div className="panel-title-icon orange-icon">
                      🔒
                    </div>

                    <div>
                      <h2>เปลี่ยนรหัสผ่าน</h2>
                      <p>
                        เปลี่ยนรหัสผ่านเพื่อรักษาความปลอดภัยบัญชี
                      </p>
                    </div>

                  </div>

                  <div className="security-warning">

                    <span>🔐</span>

                    <div>
                      <strong>
                        คำแนะนำด้านความปลอดภัย
                      </strong>

                      <p>
                        ควรใช้รหัสผ่านที่มีความยาวอย่างน้อย
                        6 ตัวอักษร และไม่ควรใช้รหัสผ่านเดียวกับระบบอื่น
                      </p>
                    </div>

                  </div>

                  <div className="password-form">

                    <div className="form-group">

                      <label>
                        รหัสผ่านปัจจุบัน
                      </label>

                      <input
                        type="password"
                        name="current"
                        value={password.current}
                        onChange={handlePasswordChange}
                        placeholder="กรอกรหัสผ่านปัจจุบัน"
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        รหัสผ่านใหม่
                      </label>

                      <input
                        type="password"
                        name="newPassword"
                        value={password.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="กรอกรหัสผ่านใหม่"
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        ยืนยันรหัสผ่านใหม่
                      </label>

                      <input
                        type="password"
                        name="confirm"
                        value={password.confirm}
                        onChange={handlePasswordChange}
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                      />

                    </div>

                  </div>

                  <div className="form-actions">

                    <button
                      type="button"
                      className="save-button orange-button"
                      onClick={changePassword}
                    >
                      🔒 เปลี่ยนรหัสผ่าน
                    </button>

                  </div>

                </div>
              )}

              {/* ================= NOTIFICATION ================= */}
              {activeTab === "notification" && (
                <div>

                  <div className="panel-title">

                    <div className="panel-title-icon blue-icon">
                      🔔
                    </div>

                    <div>
                      <h2>การแจ้งเตือน</h2>
                      <p>
                        เลือกประเภทการแจ้งเตือนที่ต้องการรับ
                      </p>
                    </div>

                  </div>

                  <div className="notification-list">

                    <div className="notification-setting">

                      <div className="notification-icon">
                        ＋
                      </div>

                      <div className="notification-text">
                        <strong>
                          แจ้งเตือนเมื่อสร้างรายการแจ้งซ่อม
                        </strong>

                        <span>
                          แจ้งเตือนเมื่อส่งรายการแจ้งซ่อมสำเร็จ
                        </span>
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={
                            notifications.repairCreated
                          }
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              repairCreated:
                                e.target.checked,
                            })
                          }
                        />

                        <span className="slider"></span>

                      </label>

                    </div>

                    <div className="notification-setting">

                      <div className="notification-icon blue-notification">
                        ⚒
                      </div>

                      <div className="notification-text">
                        <strong>
                          แจ้งเตือนเมื่อเริ่มดำเนินการ
                        </strong>

                        <span>
                          แจ้งเตือนเมื่อเจ้าหน้าที่รับงานและเริ่มซ่อม
                        </span>
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={
                            notifications.repairProgress
                          }
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              repairProgress:
                                e.target.checked,
                            })
                          }
                        />

                        <span className="slider"></span>

                      </label>

                    </div>

                    <div className="notification-setting">

                      <div className="notification-icon green-notification">
                        ✓
                      </div>

                      <div className="notification-text">
                        <strong>
                          แจ้งเตือนเมื่อซ่อมเสร็จ
                        </strong>

                        <span>
                          แจ้งเตือนเมื่อรายการซ่อมดำเนินการเสร็จแล้ว
                        </span>
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={
                            notifications.repairCompleted
                          }
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              repairCompleted:
                                e.target.checked,
                            })
                          }
                        />

                        <span className="slider"></span>

                      </label>

                    </div>

                    <div className="notification-setting">

                      <div className="notification-icon email-notification">
                        ✉
                      </div>

                      <div className="notification-text">
                        <strong>
                          การแจ้งเตือนผ่าน Email
                        </strong>

                        <span>
                          รับข่าวสารและสถานะงานผ่าน Email
                        </span>
                      </div>

                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              email: e.target.checked,
                            })
                          }
                        />

                        <span className="slider"></span>

                      </label>

                    </div>

                  </div>

                  <div className="form-actions">

                    <button
                      type="button"
                      className="save-button blue-button"
                      onClick={saveNotifications}
                    >
                      ✓ บันทึกการตั้งค่า
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

          {/* FOOTER */}
          <footer className="settings-footer">
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

