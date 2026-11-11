-- =====================================================================
-- DATABASE SCHEMA: SmartLeave & PDPA Consent Management System
-- ระบบจัดการวันลาและสิทธิข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
-- Compatible with: PostgreSQL, MySQL 8.0+, MariaDB, SQLite (with standard types)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ตารางโครงสร้างองค์กรและสิทธิ์การใช้งาน (ORGANIZATION & ACCESS CONTROL)
-- ---------------------------------------------------------------------

-- แผนก / ฝ่ายงาน
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name_th VARCHAR(150) NOT NULL,
    name_en VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- บทบาทและสิทธิ์ผู้ใช้งาน (Roles & Permissions)
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,     -- 'EMPLOYEE', 'APPROVER', 'HR_ADMIN', 'SYSTEM_ADMIN'
    name_th VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- บัญชีผู้ใช้งาน / พนักงาน (Users / Employees)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,   -- รหัสพนักงาน เช่น EMP-2026-001
    email VARCHAR(150) NOT NULL UNIQUE,          -- อีเมลองค์กร
    password_hash VARCHAR(255) NOT NULL,         -- รหัสผ่านที่ผ่านการ Hash (Bcrypt/Argon2)
    prefix VARCHAR(20),                          -- นาย / นาง / นางสาว
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    prefix_en VARCHAR(20),                       -- Mr. / Mrs. / Ms.
    first_name_en VARCHAR(100),                  -- First name (English)
    last_name_en VARCHAR(100),                   -- Last name (English)
    english_name VARCHAR(150),                   -- ชื่อ-นามสกุล ภาษาอังกฤษแบบเต็ม
    gender VARCHAR(20) DEFAULT 'หญิง',           -- ชาย / หญิง
    employment_type VARCHAR(50) DEFAULT 'ข้าราชการ', -- ข้าราชการ / ลูกจ้างประจำ / พนักงานราชการ / ลูกจ้างเหมาบริการ
    phone VARCHAR(30),
    department_id INT,
    role_id INT NOT NULL,
    position VARCHAR(100),                       -- ตำแหน่งงาน
    avatar_url VARCHAR(500),                     -- รูปโปรไฟล์
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- จัดเก็บประวัติเซสชันการเข้าใช้งาน (User Sessions)
CREATE TABLE user_sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 2. ตารางการจัดการประเภทวันลาและโควตา (LEAVE TYPES & QUOTAS)
-- ---------------------------------------------------------------------

-- ประเภทการลา (Leave Types)
CREATE TABLE leave_types (
    leave_type_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,            -- 'vacation', 'sick', 'personal', 'maternity'
    name_th VARCHAR(100) NOT NULL,               -- ลาพักร้อน, ลาป่วย, ลากิจ
    name_en VARCHAR(100),
    default_days_per_year DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    is_paid BOOLEAN DEFAULT TRUE,                -- ลาโดยได้รับค่าจ้างหรือไม่
    requires_attachment BOOLEAN DEFAULT FALSE,   -- บังคับแนบเอกสาร (เช่น ใบรับรองแพทย์) หรือไม่
    min_days_notice INT DEFAULT 0,               -- ต้องยื่นขอล่วงหน้าอย่างน้อยกี่วัน
    color_hex VARCHAR(20) DEFAULT '#16a34a',     -- รหัสสีสำหรับ UI และปฏิทิน
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- โควตาวันลาประจำปีของพนักงานแต่ละคน (Employee Annual Quotas)
CREATE TABLE employee_leave_quotas (
    quota_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    fiscal_year INT NOT NULL,                    -- ปีงบประมาณ เช่น 2026 หรือ 2569
    total_quota DECIMAL(5, 2) NOT NULL,          -- สิทธิ์วันลาทั้งหมดของปี
    carry_over_days DECIMAL(5, 2) DEFAULT 0.00,  -- วันลาสะสมยกยอดมาจากปีก่อน
    used_days DECIMAL(5, 2) DEFAULT 0.00,        -- วันลาที่ใช้และอนุมัติแล้ว
    pending_days DECIMAL(5, 2) DEFAULT 0.00,     -- วันลาที่อยู่ระหว่างรออนุมัติ
    remaining_days DECIMAL(5, 2) NOT NULL,       -- วันลาคงเหลือจริง
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_leave_year (user_id, leave_type_id, fiscal_year),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id)
);

-- ---------------------------------------------------------------------
-- 3. ตารางการยื่นคำขอและการอนุมัติวันลา (LEAVE REQUESTS & WORKFLOW)
-- ---------------------------------------------------------------------

-- คำขอลางาน (Leave Requests)
CREATE TABLE leave_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    request_no VARCHAR(50) NOT NULL UNIQUE,      -- รหัสคำขอ เช่น LV-2026-0001
    user_id INT NOT NULL,                        -- ผู้ยื่นขอลา
    leave_type_id INT NOT NULL,                  -- ประเภทวันลา
    start_date DATE NOT NULL,                    -- วันเริ่มต้น
    end_date DATE NOT NULL,                      -- วันสิ้นสุด
    period_type ENUM('full', 'half_morning', 'half_afternoon') DEFAULT 'full',
    total_days DECIMAL(4, 2) NOT NULL,           -- จำนวนวันที่ขอลา (เช่น 0.5, 1.0, 2.5)
    reason TEXT NOT NULL,                        -- เหตุผลการขอลา
    substitute_user_id INT NULL,                 -- ผู้ปฏิบัติงานแทน (เพื่อนร่วมงาน)
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approver_id INT NULL,                        -- ผู้มีอำนาจพิจารณาอนุมัติ
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id),
    FOREIGN KEY (substitute_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (approver_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ไฟล์แนบประกอบการลา (Leave Attachments)
-- คุ้มครองความปลอดภัยและกำหนดการเข้าถึงข้อมูลอ่อนไหว (เช่น ใบรับรองแพทย์)
CREATE TABLE leave_attachments (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,             -- Path บน Object Storage / Server
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100),
    is_sensitive_medical BOOLEAN DEFAULT FALSE,  -- จัดเป็นข้อมูลอ่อนไหวตาม PDPA มาตรา 26
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES leave_requests(request_id) ON DELETE CASCADE
);

-- ประวัติบันทึกขั้นตอนการพิจารณาอนุมัติ (Leave Approval Logs)
CREATE TABLE leave_approval_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    actor_id INT NOT NULL,                       -- ผู้ดำเนินการ (ผู้จัดการ/HR)
    action ENUM('SUBMIT', 'APPROVE', 'REJECT', 'CANCEL', 'AMEND') NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES leave_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(user_id)
);

-- ---------------------------------------------------------------------
-- 4. ตารางจัดการความยินยอมและสิทธิข้อมูลส่วนบุคคล (PDPA COMPLIANCE & CONSENT)
-- ---------------------------------------------------------------------

-- ฉบับนโยบายความเป็นส่วนตัว (Privacy Policies)
CREATE TABLE pdpa_policies (
    policy_id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,         -- เช่น 'v1.0', 'v1.1'
    title VARCHAR(255) NOT NULL,
    content_html LONGTEXT NOT NULL,              -- เนื้อหานโยบายฉบับเต็ม ภาษาเข้าใจง่าย ไม่กำกวม
    is_active BOOLEAN DEFAULT FALSE,             -- นโยบายฉบับที่กำลังบังคับใช้อยู่
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สถานะการให้ความยินยอมและการถอนความยินยอม (User Consents)
CREATE TABLE pdpa_consents (
    consent_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    policy_id INT NOT NULL,
    consent_type VARCHAR(50) NOT NULL,           -- 'general_notice', 'sensitive_health_data', 'system_cookies'
    is_agreed BOOLEAN NOT NULL DEFAULT FALSE,    -- ยินยอมหรือไม่
    agreed_at TIMESTAMP NULL,                    -- วันเวลาที่กดยินยอม
    revoked_at TIMESTAMP NULL,                   -- วันเวลาที่กดถอนความยินยอม (ถอนได้ทุกเมื่อ)
    ip_address VARCHAR(45),
    user_agent TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_policy_type (user_id, policy_id, consent_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES pdpa_policies(policy_id)
);

-- สมุดบันทึกหลักฐานตามกฎหมาย PDPA (Audit Trail Logs)
CREATE TABLE pdpa_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,                 -- 'VIEW_NOTICE', 'AGREE_CONSENT', 'REVOKE_CONSENT', 'DSR_EXPORT', 'DSR_CORRECT'
    policy_version VARCHAR(20) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- คำร้องขอใช้สิทธิของเจ้าของข้อมูล (Data Subject Rights Requests - DSR)
CREATE TABLE data_subject_requests (
    dsr_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    request_type ENUM('ACCESS', 'RECTIFY', 'ERASE', 'RESTRICT', 'PORTABILITY') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('SUBMITTED', 'IN_REVIEW', 'COMPLETED', 'REJECTED') DEFAULT 'SUBMITTED',
    resolution_note TEXT,
    processed_by INT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 5. ตารางการสื่อสารภายในและแจ้งเตือน (NOTIFICATIONS & ANNOUNCEMENTS)
-- ---------------------------------------------------------------------

-- ประกาศขององค์กร / ฝ่ายบุคคล (Announcements)
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    badge VARCHAR(50) DEFAULT 'ทั่วไป',          -- 'สำคัญ', 'ระเบียบบริษัท', 'วันหยุด'
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by INT NULL,
    expires_at DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- การแจ้งเตือนผู้ใช้งาน (User Notifications)
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'info',             -- 'approved', 'rejected', 'pending', 'pdpa_alert'
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 6. ดัชนีเพื่อเพิ่มประสิทธิภาพ (INDEXES)
-- ---------------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_code ON users(employee_code);
CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_pdpa_consents_user ON pdpa_consents(user_id);
CREATE INDEX idx_pdpa_audit_created ON pdpa_audit_logs(created_at);

-- ---------------------------------------------------------------------
-- 7. มุมมองข้อมูลสำหรับการเรียกดูรายงาน (VIEWS)
-- ---------------------------------------------------------------------

-- วิวสำหรับดึงสรุปโควตาคงเหลือของพนักงานแต่ละคน
CREATE OR REPLACE VIEW v_employee_leave_summary AS
SELECT 
    u.user_id,
    u.employee_code,
    CONCAT(u.first_name, ' ', u.last_name) AS full_name,
    d.name_th AS department_name,
    lt.code AS leave_type_code,
    lt.name_th AS leave_type_name,
    q.fiscal_year,
    q.total_quota,
    q.used_days,
    q.pending_days,
    q.remaining_days
FROM users u
JOIN employee_leave_quotas q ON u.user_id = q.user_id
JOIN leave_types lt ON q.leave_type_id = lt.leave_type_id
LEFT JOIN departments d ON u.department_id = d.department_id
WHERE u.is_active = TRUE;

-- วิวสำหรับกล่องคำขอรอการพิจารณาของหัวหน้างาน (Approval Queue)
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT 
    lr.request_id,
    lr.request_no,
    lr.created_at AS applied_at,
    u.user_id AS applicant_id,
    u.employee_code,
    CONCAT(u.first_name, ' ', u.last_name) AS applicant_name,
    u.avatar_url,
    d.name_th AS department_name,
    lt.name_th AS leave_type_name,
    lt.color_hex AS leave_type_color,
    lr.start_date,
    lr.end_date,
    lr.period_type,
    lr.total_days,
    lr.reason,
    CONCAT(sub.first_name, ' ', sub.last_name) AS substitute_name,
    (SELECT COUNT(*) FROM leave_attachments WHERE request_id = lr.request_id) AS attachment_count
FROM leave_requests lr
JOIN users u ON lr.user_id = u.user_id
JOIN leave_types lt ON lr.leave_type_id = lt.leave_type_id
LEFT JOIN departments d ON u.department_id = d.department_id
LEFT JOIN users sub ON lr.substitute_user_id = sub.user_id
WHERE lr.status = 'pending';

