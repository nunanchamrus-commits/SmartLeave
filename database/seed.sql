-- =====================================================================
-- MASTER SEED DATA: สำนักงานสหกรณ์จังหวัดขอนแก่น
-- ข้อมูลเริ่มต้นระบบ: แผนกสหกรณ์, สิทธิ์ผู้ใช้, ประเภทวันลา, นโยบาย PDPA
-- และข้อมูลบุคลากร 5 ท่านตามโครงสร้างจริง
-- =====================================================================

-- 1. สิทธิ์การใช้งานระบบ (System Roles)
INSERT OR REPLACE INTO roles (role_id, code, name_th, description) VALUES
(1, 'SYSTEM_ADMIN', 'ผู้ดูแลระบบสูงสุด', 'จัดการโครงสร้างระบบ การตั้งค่า และผู้ใช้งานทั้งหมด'),
(2, 'HR_ADMIN', 'ฝ่ายทรัพยากรบุคคล (HR)', 'บริหารจัดการสถิติวันลา ตรวจสอบความยินยอม PDPA และรายงาน'),
(3, 'APPROVER', 'ผู้อำนวยการ / หัวหน้ากลุ่มงาน (ผู้อนุมัติ)', 'พิจารณาอนุมัติหรือปฏิเสธคำขอลางานของเจ้าหน้าที่ในสังกัด'),
(4, 'EMPLOYEE', 'เจ้าหน้าที่ / นักวิชาการสหกรณ์', 'ยื่นคำขอลางาน ตรวจสอบโควตา และจัดการสิทธิ PDPA ของตนเอง');

-- 2. แผนกและกลุ่มงาน สำนักงานสหกรณ์จังหวัดขอนแก่น (Cooperative Departments - ทั้งหมด 14 กลุ่มงาน)
INSERT OR REPLACE INTO departments (department_id, code, name_th, name_en) VALUES
(1, 'DEP-ADMIN', 'ฝ่ายบริหารทั่วไป', 'General Administration Division'),
(2, 'DEP-ESTAB', 'กลุ่มจัดตั้งและส่งเสริมสหกรณ์', 'Cooperative Establishment and Promotion Group'),
(3, 'DEP-MGT', 'กลุ่มส่งเสริมและพัฒนาการบริหารการจัดการสหกรณ์', 'Cooperative Management and Administration Development Group'),
(4, 'DEP-BIZ', 'กลุ่มส่งเสริมและพัฒนาธุรกิจสหกรณ์', 'Cooperative Business Development Group'),
(5, 'DEP-AUD', 'กลุ่มตรวจการสหกรณ์', 'Cooperative Auditing and Inspection Group'),
(6, 'DEP-CP1', 'กลุ่มส่งเสริมสหกรณ์ 1', 'Cooperative Promotion Group 1'),
(7, 'DEP-CP2', 'กลุ่มส่งเสริมสหกรณ์ 2', 'Cooperative Promotion Group 2'),
(8, 'DEP-CP3', 'กลุ่มส่งเสริมสหกรณ์ 3', 'Cooperative Promotion Group 3'),
(9, 'DEP-CP4', 'กลุ่มส่งเสริมสหกรณ์ 4', 'Cooperative Promotion Group 4'),
(10, 'DEP-CP5', 'กลุ่มส่งเสริมสหกรณ์ 5', 'Cooperative Promotion Group 5'),
(11, 'DEP-CP6', 'กลุ่มส่งเสริมสหกรณ์ 6', 'Cooperative Promotion Group 6'),
(12, 'DEP-CP7', 'กลุ่มส่งเสริมสหกรณ์ 7', 'Cooperative Promotion Group 7'),
(13, 'DEP-CP8', 'กลุ่มส่งเสริมสหกรณ์ 8', 'Cooperative Promotion Group 8'),
(14, 'DEP-DONGMUN', 'นิคมสหกรณ์ดงมูล', 'Dong Mun Cooperative Settlement');

-- 3. ประเภทการลาตามระเบียบข้าราชการและมาตรฐานองค์กร (Master Leave Types)
INSERT OR REPLACE INTO leave_types (leave_type_id, code, name_th, name_en, default_days_per_year, is_paid, requires_attachment, min_days_notice, color_hex) VALUES
(1, 'vacation', 'ลาพักผ่อน (ประจำปี)', 'Annual Vacation Leave', 10.00, 1, 0, 3, '#155A32'),
(2, 'sick', 'ลาป่วย', 'Sick Leave', 30.00, 1, 1, 0, '#ef4444'),
(3, 'personal', 'ลากิจส่วนตัว', 'Personal Business Leave', 15.00, 1, 0, 1, '#0d9488'),
(4, 'maternity', 'ลาคลอดบุตร', 'Maternity Leave', 90.00, 1, 1, 15, '#ec4899'),
(5, 'ordination', 'ลาอุปสมบท / ประกอบพิธีทางศาสนา', 'Religious / Ordination Leave', 15.00, 1, 1, 30, '#8b5cf6'),
(6, 'military', 'ลารับราชการทหาร', 'Military Service Leave', 60.00, 1, 1, 15, '#64748b');

-- 4. นโยบายความเป็นส่วนตัวฉบับตั้งต้นตาม PDPA (Initial Privacy Notice v1.0)
INSERT OR REPLACE INTO pdpa_policies (policy_id, version, title, content_html, is_active, effective_date) VALUES
(1, 'v1.0', 'นโยบายความเป็นส่วนตัวและสิทธิของเจ้าของข้อมูล (Privacy Notice) - สำนักงานสหกรณ์จังหวัดขอนแก่น', 
'<h3>ประกาศการคุ้มครองข้อมูลส่วนบุคคลสำหรับระบบจัดการวันลา (Privacy Notice)</h3>
<p>สำนักงานสหกรณ์จังหวัดขอนแก่น ให้ความสำคัญอย่างยิ่งต่อการคุ้มครองข้อมูลส่วนบุคคลของเจ้าหน้าที่ทุกท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) จึงขอแจ้งรายละเอียดการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล ดังนี้:</p>
<h4>1. ข้อมูลที่เราเก็บรวบรวม</h4>
<ul>
  <li><strong>ข้อมูลทั่วไปสำหรับการปฏิบัติงาน:</strong> ชื่อ-นามสกุล, เพศ, รหัสเจ้าหน้าที่, ฝ่าย/กลุ่มงาน, ตำแหน่ง, อีเมล, เบอร์โทรศัพท์</li>
  <li><strong>ข้อมูลการลางาน:</strong> ประเภทการลา, วันที่ลา, จำนวนวัน, สถิติและโควตาวันลาคงเหลือ, เหตุผลการลา</li>
  <li><strong>ข้อมูลสุขภาพ (เฉพาะกรณีลาป่วยเกินเกณฑ์):</strong> ข้อมูลในใบรับรองแพทย์เพื่อประกอบการใช้สิทธิลาป่วยตามระเบียบทางราชการ</li>
</ul>
<h4>2. วัตถุประสงค์ในการเก็บรวบรวมและประมวลผล</h4>
<ul>
  <li>เพื่อดำเนินการพิจารณาอนุมัติคำขอลางาน และบันทึกประวัติการปฏิบัติงาน</li>
  <li>เพื่อคำนวณสิทธิประโยชน์ โควตาวันลา และสถิติการปฏิบัติราชการอย่างถูกต้อง</li>
  <li>เพื่อบริหารจัดการกำลังคนและวางแผนการปฏิบัติงานภายในหน่วยงาน</li>
</ul>
<h4>3. สิทธิของท่านในฐานะเจ้าของข้อมูลส่วนบุคคล</h4>
<p>ท่านมีสิทธิตามกฎหมายอย่างเต็มที่ในการ:</p>
<ul>
  <li>ขอเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลของท่าน</li>
  <li>ขอแก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง เป็นปัจจุบัน และสมบูรณ์</li>
  <li><strong>สามารถถอนความยินยอมได้ทุกเมื่อ</strong> โดยไม่มีเงื่อนไขผูกมัดหรือส่งผลกระทบต่อสิทธิปกติของท่าน</li>
</ul>',
1, CURRENT_DATE);

-- 5. ข้อมูลบุคลากรสำนักงานสหกรณ์จังหวัดขอนแก่น (5 ท่าน + 1 แอดมินกลาง)
-- รหัสผ่านเริ่มต้นแฮชด้วย Bcrypt ตัวอย่างรหัส 'Admin@Leave2026!'
INSERT OR REPLACE INTO users (user_id, employee_code, email, password_hash, prefix, first_name, last_name, english_name, gender, employment_type, phone, department_id, role_id, position, avatar_url, is_active) VALUES
(1, 'ADM-001', 'admin@smartleave.com', '$2a$12$e80yVv5gX9QoWjT9m5v6k.xL7Z3f6N7K1oXvYlC6F6zB0KqU4aWqy', 'นาย', 'ผู้ดูแลระบบ', 'ส่วนกลาง', 'System Administrator', 'ชาย', 'ข้าราชการ', '02-000-0000', 1, 1, 'System Administrator', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80', 1),
(2, 'EMP-001', 'panika.t@smartleave.com', '$2a$12$e80yVv5gX9QoWjT9m5v6k.xL7Z3f6N7K1oXvYlC6F6zB0KqU4aWqy', 'นางสาว', 'พนิกา', 'ธรรมเมือง', 'Panika Thammoeang', 'หญิง', 'ข้าราชการ', '081-234-5678', 6, 4, 'นักวิชาการสหกรณ์ปฏิบัติการ', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80', 1),
(3, 'MGR-002', 'somchai.m@smartleave.com', '$2a$12$e80yVv5gX9QoWjT9m5v6k.xL7Z3f6N7K1oXvYlC6F6zB0KqU4aWqy', 'นาย', 'สมชาย', 'มั่นคง', 'Somchai Mankhong', 'ชาย', 'ข้าราชการ', '089-876-5432', 1, 3, 'ผู้อำนวยการกลุ่มงานบริหาร / ผู้อนุมัติ', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80', 1),
(4, 'EMP-003', 'nichaphat.w@smartleave.com', '$2a$12$e80yVv5gX9QoWjT9m5v6k.xL7Z3f6N7K1oXvYlC6F6zB0KqU4aWqy', 'นางสาว', 'ณิชาภัทร', 'วงศ์ษา', 'Nichaphat Wongsa', 'หญิง', 'ข้าราชการ', '086-111-2233', 4, 4, 'เจ้าพนักงานส่งเสริมสหกรณ์ชำนาญงาน', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', 1),
(5, 'EMP-004', 'akarapol.c@smartleave.com', '$2a$12$e80yVv5gX9QoWjT9m5v6k.xL7Z3f6N7K1oXvYlC6F6zB0KqU4aWqy', 'นาย', 'อัครพล', 'เจริญผล', 'Akarapol Charoenphon', 'ชาย', 'พนักงานราชการ', '082-333-4455', 5, 4, 'นักวิชาการมาตรฐานสหกรณ์', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80', 1),
(6, 'EMP-005', 'suda.j@smartleave.com', '$2a$12$e80yVv5gX9QoWjT9m5v6k.xL7Z3f6N7K1oXvYlC6F6zB0KqU4aWqy', 'นางสาว', 'สุดา', 'ใจดี', 'Suda Jaidee', 'หญิง', 'ลูกจ้างประจำ', '084-555-6677', 1, 4, 'เจ้าหน้าที่ธุรการและสารบรรณ', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80', 1);

-- 6. โควตาวันลาประจำปี 2569 (Fiscal Year 2026)
-- Vacation (10), Sick (30), Personal (15), Maternity (90)
INSERT OR REPLACE INTO employee_leave_quotas (user_id, leave_type_id, fiscal_year, total_quota, used_days, remaining_days) VALUES
(2, 1, 2026, 10.0, 2.0, 8.0),
(2, 2, 2026, 30.0, 1.0, 29.0),
(2, 3, 2026, 15.0, 0.0, 15.0),
(2, 4, 2026, 90.0, 0.0, 90.0),

(3, 1, 2026, 10.0, 1.0, 9.0),
(3, 2, 2026, 30.0, 0.0, 30.0),
(3, 3, 2026, 15.0, 0.0, 15.0),
(3, 4, 2026, 90.0, 0.0, 90.0),

(4, 1, 2026, 10.0, 4.0, 6.0),
(4, 2, 2026, 30.0, 2.0, 28.0),
(4, 3, 2026, 15.0, 1.0, 14.0),
(4, 4, 2026, 90.0, 0.0, 90.0),

(5, 1, 2026, 10.0, 0.0, 10.0),
(5, 2, 2026, 30.0, 0.0, 30.0),
(5, 3, 2026, 15.0, 0.0, 15.0),
(5, 4, 2026, 90.0, 0.0, 90.0),

(6, 1, 2026, 10.0, 3.0, 7.0),
(6, 2, 2026, 30.0, 0.0, 30.0),
(6, 3, 2026, 15.0, 0.0, 15.0),
(6, 4, 2026, 90.0, 0.0, 90.0);

-- 7. คำขอลางานเริ่มต้นสำหรับการทดสอบ (Initial Leave Requests)
INSERT OR REPLACE INTO leave_requests (request_id, request_no, user_id, leave_type_id, start_date, end_date, total_days, reason, status, approver_id, approved_at) VALUES
(1, 'LV-2026-001', 2, 1, '2026-02-16', '2026-02-17', 2.0, 'พักผ่อนประจำปีกับครอบครัว', 'approved', 3, '2026-02-12 10:30:00'),
(2, 'LV-2026-002', 2, 2, '2026-01-20', '2026-01-20', 1.0, 'มีไข้หวัด พบแพทย์ที่โรงพยาบาลขอนแก่น', 'approved', 3, '2026-01-21 09:00:00'),
(3, 'LV-2026-003', 4, 3, '2026-02-20', '2026-02-20', 1.0, 'ติดต่อราชการทำบัตรประชาชนและเอกสารที่ว่าการอำเภอ', 'approved', 3, '2026-02-18 14:00:00'),
(4, 'LV-2026-004', 6, 1, '2026-02-25', '2026-02-27', 3.0, 'เดินทางไปต่างจังหวัดเพื่อร่วมงานแต่งงานญาติ', 'pending', NULL, NULL);
