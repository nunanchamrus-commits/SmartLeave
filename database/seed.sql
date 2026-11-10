-- =====================================================================
-- MASTER SEED DATA: ข้อมูลตั้งต้นระบบ (Master Configuration Only)
-- หมายเหตุ: ไม่มีข้อมูลพนักงานปลอม มีเพียงข้อมูลตั้งต้นเพื่อเริ่มใช้งานระบบ
-- =====================================================================

-- 1. สิทธิ์การใช้งานระบบ (System Roles)
INSERT INTO roles (role_id, code, name_th, description) VALUES
(1, 'SYSTEM_ADMIN', 'ผู้ดูแลระบบสูงสุด', 'จัดการโครงสร้างระบบ การตั้งค่า และผู้ใช้งานทั้งหมด'),
(2, 'HR_ADMIN', 'ฝ่ายทรัพยากรบุคคล (HR)', 'บริหารจัดการสถิติวันลา ตรวจสอบความยินยอม PDPA และรายงาน'),
(3, 'APPROVER', 'หัวหน้างาน / ผู้จัดการ', 'พิจารณาอนุมัติหรือปฏิเสธคำขอลางานของพนักงานในสังกัด'),
(4, 'EMPLOYEE', 'พนักงานทั่วไป', 'ยื่นคำขอลางาน ตรวจสอบโควตา และจัดการสิทธิ PDPA ของตนเอง');

-- 2. แผนกตั้งต้น (Default Departments)
INSERT INTO departments (department_id, code, name_th, name_en) VALUES
(1, 'DEP-IT', 'ฝ่ายเทคโนโลยีสารสนเทศและวิศวกรรม', 'Information Technology & Engineering'),
(2, 'DEP-HR', 'ฝ่ายทรัพยากรบุคคลและการจัดการ', 'Human Resources & Administration'),
(3, 'DEP-MKT', 'ฝ่ายการตลาดและการสื่อสาร', 'Marketing & Communications'),
(4, 'DEP-ACC', 'ฝ่ายการเงินและการบัญชี', 'Finance & Accounting'),
(5, 'DEP-OPS', 'ฝ่ายปฏิบัติการ', 'Operations');

-- 3. ประเภทการลาตามกฎหมายแรงงานและมาตรฐานองค์กร (Master Leave Types)
INSERT INTO leave_types (leave_type_id, code, name_th, name_en, default_days_per_year, is_paid, requires_attachment, min_days_notice, color_hex) VALUES
(1, 'vacation', 'ลาพักร้อน (ประจำปี)', 'Annual Vacation Leave', 10.00, TRUE, FALSE, 3, '#16a34a'),
(2, 'sick', 'ลาป่วย', 'Sick Leave', 30.00, TRUE, TRUE, 0, '#ef4444'),
(3, 'personal', 'ลากิจจำเป็น', 'Personal Business Leave', 5.00, TRUE, FALSE, 1, '#0d9488'),
(4, 'maternity', 'ลาคลอดบุตร', 'Maternity Leave', 98.00, TRUE, TRUE, 15, '#ec4899'),
(5, 'ordination', 'ลาอุปสมบท / ประกอบพิธีทางศาสนา', 'Religious / Ordination Leave', 15.00, TRUE, TRUE, 30, '#8b5cf6'),
(6, 'military', 'ลารับราชการทหาร', 'Military Service Leave', 60.00, TRUE, TRUE, 15, '#64748b');

-- 4. นโยบายความเป็นส่วนตัวฉบับตั้งต้นตาม PDPA (Initial Privacy Notice v1.0)
-- ใช้ข้อความภาษาเข้าใจง่าย ชัดเจน ไม่กำกวม และไม่มีเงื่อนไขผูกมัด
INSERT INTO pdpa_policies (policy_id, version, title, content_html, is_active, effective_date) VALUES
(1, 'v1.0', 'นโยบายความเป็นส่วนตัวและสิทธิของเจ้าของข้อมูล (Privacy Notice)', 
'<h3>ประกาศการคุ้มครองข้อมูลส่วนบุคคลสำหรับระบบจัดการวันลา (Privacy Notice)</h3>
<p>บริษัทให้ความสำคัญอย่างยิ่งต่อการคุ้มครองข้อมูลส่วนบุคคลของพนักงานทุกท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) จึงขอแจ้งรายละเอียดการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล ดังนี้:</p>
<h4>1. ข้อมูลที่เราเก็บรวบรวม</h4>
<ul>
  <li><strong>ข้อมูลทั่วไปสำหรับการจ้างงาน:</strong> ชื่อ-นามสกุล, รหัสพนักงาน, แผนก, ตำแหน่ง, อีเมลองค์กร</li>
  <li><strong>ข้อมูลการลางาน:</strong> ประเภทการลา, วันที่ลา, จำนวนวัน, สถิติและโควตาวันลาคงเหลือ, เหตุผลการลา</li>
  <li><strong>ข้อมูลสุขภาพ (เฉพาะกรณีลาป่วยเกินเกณฑ์):</strong> ข้อมูลในใบรับรองแพทย์เพื่อประกอบการใช้สิทธิลาป่วยตามกฎหมายแรงงาน</li>
</ul>
<h4>2. วัตถุประสงค์ในการเก็บรวบรวมและประมวลผล</h4>
<ul>
  <li>เพื่อดำเนินการพิจารณาอนุมัติคำขอลางาน และบันทึกเวลาทำงานตามสัญญาจ้างงาน</li>
  <li>เพื่อคำนวณสิทธิประโยชน์ โควตาวันลา และค่าจ้างอย่างถูกต้อง</li>
  <li>เพื่อบริหารจัดการกำลังคนและวางแผนการปฏิบัติงานภายในองค์กร</li>
</ul>
<h4>3. สิทธิของท่านในฐานะเจ้าของข้อมูลส่วนบุคคล</h4>
<p>ท่านมีสิทธิตามกฎหมายอย่างเต็มที่ในการ:</p>
<ul>
  <li>ขอเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลของท่าน</li>
  <li>ขอแก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง เป็นปัจจุบัน และสมบูรณ์</li>
  <li><strong>สามารถถอนความยินยอมได้ทุกเมื่อ</strong> โดยไม่มีเงื่อนไขผูกมัดหรือส่งผลกระทบต่อสิทธิพนักงานปกติของท่าน</li>
</ul>',
TRUE, CURRENT_DATE);

-- 5. บัญชีผู้ดูแลระบบตั้งต้น (Initial System Administrator Account)
-- หมายเหตุ: รหัสผ่านเริ่มต้นแฮชด้วย Bcrypt ตัวอย่างรหัส 'Admin@Leave2026!'
INSERT INTO users (user_id, employee_code, email, password_hash, prefix, first_name, last_name, phone, department_id, role_id, position, is_active) VALUES
(1, 'ADM-001', 'admin@SmartLeave.com', '$2a$12$e80yVv5gX9QoWjT9m5v6k.xL7Z3f6N7K1oXvYlC6F6zB0KqU4aWqy', 'นาย', 'ผู้ดูแลระบบ', 'ส่วนกลาง', '02-000-0000', 1, 1, 'System Administrator', TRUE);

