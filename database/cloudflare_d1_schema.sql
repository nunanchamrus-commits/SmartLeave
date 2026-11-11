-- =====================================================================
-- CLOUDFLARE D1 (SQLITE) SCHEMA: SmartLeave & PDPA Compliance
-- รองรับ Cloudflare D1 Serverless SQL Database โดยเฉพาะ
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- 1. แผนกและบทบาทผู้ใช้งาน (ORGANIZATION & ACCESS CONTROL)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
    department_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_th TEXT NOT NULL,
    name_en TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_th TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_code TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    prefix TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    english_name TEXT,
    gender TEXT DEFAULT 'หญิง',
    employment_type TEXT DEFAULT 'ข้าราชการ',
    phone TEXT,
    department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
    role_id INTEGER NOT NULL REFERENCES roles(role_id),
    position TEXT,
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ---------------------------------------------------------------------
-- 2. ประเภทวันลาและโควตา (LEAVE TYPES & QUOTAS)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS leave_types (
    leave_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_th TEXT NOT NULL,
    name_en TEXT,
    default_days_per_year REAL NOT NULL DEFAULT 0.0,
    is_paid INTEGER DEFAULT 1,
    requires_attachment INTEGER DEFAULT 0,
    min_days_notice INTEGER DEFAULT 0,
    color_hex TEXT DEFAULT '#16a34a',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS employee_leave_quotas (
    quota_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    leave_type_id INTEGER NOT NULL REFERENCES leave_types(leave_type_id),
    fiscal_year INTEGER NOT NULL,
    total_quota REAL NOT NULL,
    carry_over_days REAL DEFAULT 0.0,
    used_days REAL DEFAULT 0.0,
    pending_days REAL DEFAULT 0.0,
    remaining_days REAL NOT NULL,
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(user_id, leave_type_id, fiscal_year)
);

-- ---------------------------------------------------------------------
-- 3. คำขอลางานและการอนุมัติ (LEAVE REQUESTS & WORKFLOW)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS leave_requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_no TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    leave_type_id INTEGER NOT NULL REFERENCES leave_types(leave_type_id),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    period_type TEXT CHECK (period_type IN ('full', 'half_morning', 'half_afternoon')) DEFAULT 'full',
    total_days REAL NOT NULL,
    reason TEXT NOT NULL,
    substitute_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    approver_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    approved_at TEXT,
    rejection_reason TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS leave_attachments (
    attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL REFERENCES leave_requests(request_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT,
    is_sensitive_medical INTEGER DEFAULT 0,
    uploaded_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS leave_approval_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL REFERENCES leave_requests(request_id) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES users(user_id),
    action TEXT CHECK (action IN ('SUBMIT', 'APPROVE', 'REJECT', 'CANCEL', 'AMEND')) NOT NULL,
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ---------------------------------------------------------------------
-- 4. กฎหมาย PDPA และสิทธิข้อมูลส่วนบุคคล (PDPA COMPLIANCE & CONSENT)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS pdpa_policies (
    policy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content_html TEXT NOT NULL,
    is_active INTEGER DEFAULT 0,
    effective_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS pdpa_consents (
    consent_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    policy_id INTEGER NOT NULL REFERENCES pdpa_policies(policy_id),
    consent_type TEXT NOT NULL,
    is_agreed INTEGER NOT NULL DEFAULT 0,
    agreed_at TEXT,
    revoked_at TEXT,
    ip_address TEXT,
    user_agent TEXT,
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(user_id, policy_id, consent_type)
);

CREATE TABLE IF NOT EXISTS pdpa_audit_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS data_subject_requests (
    dsr_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    request_type TEXT CHECK (request_type IN ('ACCESS', 'RECTIFY', 'ERASE', 'RESTRICT', 'PORTABILITY')) NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('SUBMITTED', 'IN_REVIEW', 'COMPLETED', 'REJECTED')) DEFAULT 'SUBMITTED',
    resolution_note TEXT,
    processed_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    processed_at TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ---------------------------------------------------------------------
-- 5. การแจ้งเตือนและประกาศ (NOTIFICATIONS & ANNOUNCEMENTS)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    badge TEXT DEFAULT 'ทั่วไป',
    is_pinned INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'info',
    link_url TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ---------------------------------------------------------------------
-- 6. ดัชนี (INDEXES)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_employee_code ON users(employee_code);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pdpa_consents_user ON pdpa_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_pdpa_audit_created ON pdpa_audit_logs(created_at);

-- ---------------------------------------------------------------------
-- 7. มุมมอง (VIEWS)
-- ---------------------------------------------------------------------

CREATE VIEW IF NOT EXISTS v_employee_leave_summary AS
SELECT 
    u.user_id,
    u.employee_code,
    (u.first_name || ' ' || u.last_name) AS full_name,
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
WHERE u.is_active = 1;

CREATE VIEW IF NOT EXISTS v_pending_approvals AS
SELECT 
    lr.request_id,
    lr.request_no,
    lr.created_at AS applied_at,
    u.user_id AS applicant_id,
    u.employee_code,
    (u.first_name || ' ' || u.last_name) AS applicant_name,
    u.avatar_url,
    d.name_th AS department_name,
    lt.name_th AS leave_type_name,
    lt.color_hex AS leave_type_color,
    lr.start_date,
    lr.end_date,
    lr.period_type,
    lr.total_days,
    lr.reason,
    (sub.first_name || ' ' || sub.last_name) AS substitute_name,
    (SELECT COUNT(*) FROM leave_attachments WHERE request_id = lr.request_id) AS attachment_count
FROM leave_requests lr
JOIN users u ON lr.user_id = u.user_id
JOIN leave_types lt ON lr.leave_type_id = lt.leave_type_id
LEFT JOIN departments d ON u.department_id = d.department_id
LEFT JOIN users sub ON lr.substitute_user_id = sub.user_id
WHERE lr.status = 'pending';

-- ---------------------------------------------------------------------
-- 8. ข้อมูล MASTER ตั้งต้น (INITIAL SEED DATA)
-- ---------------------------------------------------------------------

INSERT OR IGNORE INTO roles (role_id, code, name_th, description) VALUES
(1, 'SYSTEM_ADMIN', 'ผู้ดูแลระบบสูงสุด', 'จัดการโครงสร้างระบบ การตั้งค่า และผู้ใช้งานทั้งหมด'),
(2, 'HR_ADMIN', 'ฝ่ายทรัพยากรบุคคล (HR)', 'บริหารจัดการสถิติวันลา ตรวจสอบความยินยอม PDPA และรายงาน'),
(3, 'APPROVER', 'หัวหน้างาน / ผู้จัดการ', 'พิจารณาอนุมัติหรือปฏิเสธคำขอลางานของพนักงานในสังกัด'),
(4, 'EMPLOYEE', 'พนักงานทั่วไป', 'ยื่นคำขอลางาน ตรวจสอบโควตา และจัดการสิทธิ PDPA ของตนเอง');

INSERT OR IGNORE INTO departments (department_id, code, name_th, name_en) VALUES
(1, 'DEP-IT', 'ฝ่ายเทคโนโลยีสารสนเทศและวิศวกรรม', 'Information Technology & Engineering'),
(2, 'DEP-HR', 'ฝ่ายทรัพยากรบุคคลและการจัดการ', 'Human Resources & Administration'),
(3, 'DEP-MKT', 'ฝ่ายการตลาดและการสื่อสาร', 'Marketing & Communications'),
(4, 'DEP-ACC', 'ฝ่ายการเงินและการบัญชี', 'Finance & Accounting'),
(5, 'DEP-OPS', 'ฝ่ายปฏิบัติการ', 'Operations');

INSERT OR IGNORE INTO leave_types (leave_type_id, code, name_th, name_en, default_days_per_year, is_paid, requires_attachment, min_days_notice, color_hex) VALUES
(1, 'vacation', 'ลาพักร้อน (ประจำปี)', 'Annual Vacation Leave', 10.0, 1, 0, 3, '#16a34a'),
(2, 'sick', 'ลาป่วย', 'Sick Leave', 30.0, 1, 1, 0, '#ef4444'),
(3, 'personal', 'ลากิจจำเป็น', 'Personal Business Leave', 5.0, 1, 0, 1, '#0d9488'),
(4, 'maternity', 'ลาคลอดบุตร', 'Maternity Leave', 98.0, 1, 1, 15, '#ec4899'),
(5, 'ordination', 'ลาอุปสมบท / ประกอบพิธีทางศาสนา', 'Religious / Ordination Leave', 15.0, 1, 1, 30, '#8b5cf6'),
(6, 'military', 'ลารับราชการทหาร', 'Military Service Leave', 60.0, 1, 1, 15, '#64748b');

INSERT OR IGNORE INTO pdpa_policies (policy_id, version, title, content_html, is_active, effective_date) VALUES
(1, 'v1.0', 'นโยบายความเป็นส่วนตัวและสิทธิของเจ้าของข้อมูล (Privacy Notice)', 
'<h3>ประกาศการคุ้มครองข้อมูลส่วนบุคคลสำหรับระบบจัดการวันลา (Privacy Notice)</h3><p>บริษัทให้ความสำคัญอย่างยิ่งต่อการคุ้มครองข้อมูลส่วนบุคคลของพนักงานทุกท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</p><h4>1. ข้อมูลที่เราเก็บรวบรวม</h4><ul><li>ข้อมูลทั่วไป: ชื่อ-นามสกุล, รหัสพนักงาน, แผนก, ตำแหน่ง, อีเมล</li><li>ข้อมูลการลา: ประเภทวันลา, วันที่ลา, สถิติและโควตาวันลาคงเหลือ, เหตุผลการลา</li><li>ข้อมูลสุขภาพ: ข้อมูลในใบรับรองแพทย์เพื่อประกอบสิทธิลาป่วย</li></ul><h4>2. วัตถุประสงค์ในการประมวลผล</h4><ul><li>เพื่อดำเนินการพิจารณาอนุมัติคำขอลางาน และบันทึกเวลาทำงานตามสัญญาจ้าง</li><li>เพื่อคำนวณสิทธิประโยชน์ โควตาวันลา และค่าจ้างอย่างถูกต้อง</li></ul><h4>3. สิทธิของท่านในฐานะเจ้าของข้อมูล</h4><ul><li>สิทธิขอเข้าถึงและรับสำเนาข้อมูลส่วนบุคคล</li><li>สิทธิขอแก้ไขข้อมูลให้ถูกต้อง</li><li><strong>สามารถถอนความยินยอมได้ทุกเมื่อ</strong> โดยไม่มีเงื่อนไขผูกมัดหรือผลกระทบต่อสิทธิการจ้างงานปกติ</li></ul>',
1, date('now', 'localtime'));

INSERT OR IGNORE INTO users (user_id, employee_code, email, password_hash, prefix, first_name, last_name, phone, department_id, role_id, position, is_active) VALUES
(1, 'ADM-001', 'admin@SmartLeave.com', '$2a$12$e80yVv5gX9QoWjT9m5v6k.xL7Z3f6N7K1oXvYlC6F6zB0KqU4aWqy', 'นาย', 'ผู้ดูแลระบบ', 'ส่วนกลาง', '02-000-0000', 1, 1, 'System Administrator', 1);

