"use client";

import { useRouter } from "next/navigation";
import "./home.css";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="home">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">

        <div className="nav-brand">

          <div className="cmu-mark">
            CMU
          </div>

          <div className="brand-text">
            <strong>Fix it</strong>
            <span>ระบบแจ้งซ่อมครุภัณฑ์</span>
          </div>

        </div>


        <div className="nav-links">
          <a href="#home">หน้าหลัก</a>
          <a href="#service">บริการ</a>
          <a href="#how">วิธีใช้งาน</a>
          <a href="#contact">ติดต่อเรา</a>
        </div>


        <button
          className="login-btn"
          onClick={() => router.push("/login")}
        >
          เข้าสู่ระบบ
          <span>→</span>
        </button>

      </nav>


      {/* ================= HERO ================= */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            <span className="pulse"></span>
            CMU IT SERVICE CENTER
          </div>

          <h1>
            ระบบแจ้งซ่อม
            <br />
            <span>ครุภัณฑ์ออนไลน์</span>
          </h1>

          <p>
            แจ้งปัญหา ติดตามสถานะ และตรวจสอบประวัติการซ่อม
            <br />
            ได้ง่ายในระบบเดียว สำหรับบุคลากรมหาวิทยาลัยเชียงใหม่
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => router.push("/login")}
            >
              <span>＋</span>
              แจ้งซ่อม / เข้าสู่ระบบ
            </button>

            <button
              className="secondary-btn"
              onClick={() => {
                document
                  .getElementById("how")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              ดูวิธีใช้งาน
              <span>↓</span>
            </button>

          </div>


          <div className="hero-trust">

            <div className="trust-item">
              <strong>24/7</strong>
              <span>รับแจ้งปัญหาออนไลน์</span>
            </div>

            <div className="trust-line"></div>

            <div className="trust-item">
              <strong>CMU</strong>
              <span>มหาวิทยาลัยเชียงใหม่</span>
            </div>

            <div className="trust-line"></div>

            <div className="trust-item">
              <strong>IT</strong>
              <span>IT Support</span>
            </div>

          </div>

        </div>


        {/* ================= HERO VISUAL ================= */}
        <div className="hero-visual">

          <div className="circle circle-one"></div>
          <div className="circle circle-two"></div>

          <div className="dashboard-preview">

            <div className="preview-top">

              <div className="preview-brand">
                <div className="mini-logo">CMU</div>

                <div>
                  <strong>Fix it</strong>
                  <small>Dashboard</small>
                </div>
              </div>

              <div className="preview-avatar">
                U
              </div>

            </div>


            <div className="preview-title">
              <small>CMU IT SERVICE CENTER</small>
              <h3>สวัสดี 👋</h3>
              <p>ยินดีต้อนรับเข้าสู่ระบบแจ้งซ่อม</p>
            </div>


            <div className="preview-stats">

              <div>
                <span>ทั้งหมด</span>
                <strong>128</strong>
              </div>

              <div>
                <span>รอดำเนินการ</span>
                <strong>18</strong>
              </div>

              <div>
                <span>เสร็จแล้ว</span>
                <strong>98</strong>
              </div>

            </div>


            <div className="preview-list">

              <div className="preview-row">
                <div className="preview-icon">PC</div>

                <div>
                  <strong>คอมพิวเตอร์เปิดไม่ติด</strong>
                  <small>สำนักงานคณะ</small>
                </div>

                <span className="working">
                  กำลังซ่อม
                </span>
              </div>


              <div className="preview-row">
                <div className="preview-icon printer">
                  PR
                </div>

                <div>
                  <strong>เครื่องพิมพ์ใช้งานไม่ได้</strong>
                  <small>ห้องธุรการ</small>
                </div>

                <span className="waiting">
                  รอดำเนินการ
                </span>
              </div>


              <div className="preview-row">
                <div className="preview-icon done">
                  ✓
                </div>

                <div>
                  <strong>โปรเจกเตอร์ภาพไม่ชัด</strong>
                  <small>ห้องประชุม</small>
                </div>

                <span className="completed">
                  เสร็จแล้ว
                </span>
              </div>

            </div>

          </div>


          <div className="floating-card floating-one">

            <div className="floating-icon green">
              ✓
            </div>

            <div>
              <strong>ซ่อมเสร็จแล้ว</strong>
              <span>HD-00126</span>
            </div>

          </div>


          <div className="floating-card floating-two">

            <div className="floating-icon purple">
              ⚒
            </div>

            <div>
              <strong>กำลังดำเนินการ</strong>
              <span>12 รายการ</span>
            </div>

          </div>

        </div>

      </section>


      {/* ================= STATISTICS ================= */}
      <section className="statistics">

        <div className="stat-box">
          <div className="stat-number">128+</div>
          <div className="stat-label">รายการแจ้งซ่อม</div>
        </div>

        <div className="stat-box">
          <div className="stat-number">98+</div>
          <div className="stat-label">งานที่ดำเนินการเสร็จ</div>
        </div>

        <div className="stat-box">
          <div className="stat-number">30+</div>
          <div className="stat-label">งานที่กำลังดำเนินการ</div>
        </div>

        <div className="stat-box">
          <div className="stat-number">24/7</div>
          <div className="stat-label">บริการรับแจ้งออนไลน์</div>
        </div>

      </section>


      {/* ================= SERVICES ================= */}
      <section className="services section" id="service">

        <div className="section-heading">

          <span>OUR SERVICES</span>

          <h2>
            บริการของ Fix it
          </h2>

          <p>
            แจ้งปัญหาและติดตามงานซ่อมครุภัณฑ์
            ได้สะดวก รวดเร็ว และเป็นระบบ
          </p>

        </div>


        <div className="service-grid">

          <div className="service-card">

            <div className="service-card-icon purple">
              ＋
            </div>

            <h3>แจ้งซ่อมออนไลน์</h3>

            <p>
              แจ้งปัญหาครุภัณฑ์และอุปกรณ์
              ผ่านระบบออนไลน์ได้ทุกที่ทุกเวลา
            </p>

            <button onClick={() => router.push("/login")}>
              แจ้งซ่อม →
            </button>

          </div>


          <div className="service-card">

            <div className="service-card-icon blue">
              ◷
            </div>

            <h3>ติดตามสถานะ</h3>

            <p>
              ตรวจสอบสถานะงานซ่อมของคุณ
              ได้แบบเป็นขั้นตอนและชัดเจน
            </p>

            <button onClick={() => router.push("/login")}>
              ตรวจสอบ →
            </button>

          </div>


          <div className="service-card">

            <div className="service-card-icon green">
              ✓
            </div>

            <h3>ประวัติการแจ้งซ่อม</h3>

            <p>
              ดูประวัติการแจ้งซ่อมย้อนหลัง
              และรายละเอียดการดำเนินงาน
            </p>

            <button onClick={() => router.push("/login")}>
              ดูประวัติ →
            </button>

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section section" id="how">

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            แจ้งซ่อมง่ายใน 3 ขั้นตอน
          </h2>

          <p>
            ไม่ต้องเดินทาง ไม่ต้องใช้เอกสาร
            เพียงแจ้งผ่านระบบออนไลน์
          </p>

        </div>


        <div className="steps">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              👤
            </div>

            <h3>เข้าสู่ระบบ</h3>

            <p>
              เข้าสู่ระบบด้วย Username
              และ Password ของคุณ
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              📝
            </div>

            <h3>แจ้งปัญหา</h3>

            <p>
              กรอกรายละเอียดปัญหา
              และข้อมูลครุภัณฑ์
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              🔧
            </div>

            <h3>ติดตามงาน</h3>

            <p>
              ตรวจสอบสถานะและติดตาม
              การดำเนินงานของเจ้าหน้าที่
            </p>

          </div>

        </div>

      </section>


      {/* ================= CATEGORIES ================= */}
      <section className="category-section section">

        <div className="section-heading">

          <span>REPAIR CATEGORIES</span>

          <h2>
            รองรับงานแจ้งซ่อมหลากหลายประเภท
          </h2>

        </div>


        <div className="categories">

          <div className="category">
            <span>💻</span>
            <strong>คอมพิวเตอร์</strong>
            <small>Computer</small>
          </div>

          <div className="category">
            <span>🖨️</span>
            <strong>เครื่องพิมพ์</strong>
            <small>Printer</small>
          </div>

          <div className="category">
            <span>📡</span>
            <strong>ระบบเครือข่าย</strong>
            <small>Network</small>
          </div>

          <div className="category">
            <span>📽️</span>
            <strong>โสตทัศนูปกรณ์</strong>
            <small>AV Equipment</small>
          </div>

          <div className="category">
            <span>🖥️</span>
            <strong>อุปกรณ์สำนักงาน</strong>
            <small>Office Equipment</small>
          </div>

          <div className="category">
            <span>⚙️</span>
            <strong>อื่น ๆ</strong>
            <small>Other</small>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="cta">

        <div className="cta-content">

          <span>CMU IT SERVICE CENTER</span>

          <h2>
            พบปัญหาเกี่ยวกับครุภัณฑ์?
          </h2>

          <p>
            แจ้งปัญหาของคุณผ่าน Fix it
            แล้วให้ทีม IT Support ช่วยดูแล
          </p>

          <button
            onClick={() => router.push("/login")}
          >
            แจ้งซ่อมทันที
            <span>→</span>
          </button>

        </div>

        <div className="cta-circle"></div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="footer" id="contact">

        <div className="footer-main">

          <div className="footer-brand">

            <div className="footer-logo">
              CMU
            </div>

            <div>
              <strong>Fix it</strong>
              <span>
                ระบบแจ้งซ่อมครุภัณฑ์
              </span>
            </div>

          </div>


          <div className="footer-info">

            <strong>
              ศูนย์บริการเทคโนโลยีสารสนเทศ
            </strong>

            <p>
              มหาวิทยาลัยเชียงใหม่
            </p>

          </div>


          <div className="footer-contact">

            <strong>ติดต่อ IT Support</strong>

            <p>
              ☎ โทรศัพท์ : IT Support
            </p>

            <p>
              ✉ Email : IT Support
            </p>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 Fix it
          </span>

          <span>
            Chiang Mai University
          </span>

        </div>

      </footer>

    </main>
  );
}

