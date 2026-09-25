-- =====================================================
-- Helpdesk schema สำหรับ TiDB Cloud Serverless
-- รันด้วย:
--   mysql --comments -h <host> -P 4000 -u <user> -p --ssl-mode=VERIFY_IDENTITY \
--         -D <database> < db/schema.sql
-- หรือวางในหน้า "SQL Editor" ของ TiDB Cloud Console ก็ได้
-- =====================================================

-- -----------------------------------------------------
-- ตาราง users: เก็บบัญชีผู้ใช้จริง (แทนของเดิมที่ hardcode
-- admin/user ไว้ในโค้ดและเทียบรหัสผ่านแบบ plain text)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'technician', 'user') NOT NULL DEFAULT 'user',
  full_name     VARCHAR(128) NULL,
  email         VARCHAR(190) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username)
);

-- -----------------------------------------------------
-- ตาราง repair_requests: รายการแจ้งซ่อม (ใช้อยู่แล้วในโค้ดเดิม
-- app/api/repair/route.ts — คอลัมน์ด้านล่างตรงกับ query ที่มีอยู่)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS repair_requests (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  repair_no        VARCHAR(64) NOT NULL,

  prefix           VARCHAR(16) NOT NULL,
  fname            VARCHAR(128) NOT NULL,
  lname            VARCHAR(128) NOT NULL,
  email            VARCHAR(190) NOT NULL,

  category         VARCHAR(64) NOT NULL,
  equipment        VARCHAR(128) NULL,
  location         VARCHAR(255) NOT NULL,
  subject          VARCHAR(255) NOT NULL,
  detail           TEXT NOT NULL,
  priority         ENUM('low', 'normal', 'high') NOT NULL DEFAULT 'normal',

  image_name       VARCHAR(255) NULL,
  image_path       VARCHAR(255) NULL,

  status           ENUM('pending', 'progress', 'done') NOT NULL DEFAULT 'pending',
  technician_id    BIGINT NULL,
  resolution_text  TEXT NULL,
  repair_cost      DECIMAL(10, 2) NULL,

  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accepted_at      TIMESTAMP NULL,
  started_at       TIMESTAMP NULL,
  completed_at     TIMESTAMP NULL,
  closed_at        TIMESTAMP NULL,

  UNIQUE KEY uq_repair_no (repair_no),
  KEY idx_repair_email (email),
  KEY idx_repair_status (status),
  KEY idx_repair_created_at (created_at),
  CONSTRAINT fk_repair_technician
    FOREIGN KEY (technician_id) REFERENCES users(id)
    ON DELETE SET NULL
);
