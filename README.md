# SmartLeave - ระบบจัดการวันลาและสิทธิข้อมูลส่วนบุคคล (Leave Management & PDPA)

ระบบจัดการวันลาพนักงาน **SmartLeave** ได้รับการออกแบบโครงสร้างแยกระหว่าง **ส่วนหน้าบ้าน (Frontend)** และ **ส่วนฐานข้อมูล (Database)** อย่างเป็นสัดส่วน พร้อมเชื่อมต่อกับข้อกำหนดของ **พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)**

---

## 🏗️ โครงสร้างสถาปัตยกรรมระบบ (System Architecture)

```
project_cooperative/
│
├── 📁 database/                        # [ฐานข้อมูล] สคริปต์ SQL และเอกสารฐานข้อมูล
│   ├── schema.sql                     # สคริปต์ DDL สร้างตาราง, ดัชนี, Foreign Keys และ Views
│   ├── seed.sql                       # ข้อมูล Master ตั้งต้นระบบ (Roles, Leave Types, นโยบาย PDPA)
│   └── README.md                      # รายละเอียดความสัมพันธ์ตาราง (ER Diagram) และวิธีติดตั้ง
│
├── 📁 src/                             # [หน้าบ้าน - Frontend (React + Vite + Tailwind)]
│   ├── services/
│   │   └── api.js                     # ชั้น API Client เชื่อมต่อ Backend / Database
│   ├── context/
│   │   └── LeaveContext.jsx           # State Management (Auth, Leaves, Quotas, PDPA Consent)
│   ├── components/
│   │   ├── LoginView.jsx              # หน้าเข้าสู่ระบบและลงทะเบียนพนักงานใหม่
│   │   ├── PrivacyPolicyModal.jsx     # หน้าต่างแจ้งนโยบาย PDPA และขอความยินยอม (Consent)
│   │   ├── LeaveRequestModal.jsx      # แบบฟอร์มยื่นคำขอลางาน
│   │   ├── LeaveDetailModal.jsx       # รายละเอียดคำขอและพิมพ์ใบลา
│   │   ├── AnnouncementsModal.jsx     # ประกาศขององค์กร
│   │   ├── Header.jsx, Sidebar.jsx    # แถบนำทางและเมนูผู้ใช้งาน
│   │   ├── StatCards.jsx              # การ์ดสรุปโควตาวันลา
│   │   └── views/                     # แยกมุมมองผู้ใช้และผู้ดูแล
│   │       ├── DashboardView.jsx      # หน้าหลักพนักงาน
│   │       ├── LeaveHistoryView.jsx   # ประวัติการลา (กรอง/ค้นหา/ส่งออก CSV)
│   │       ├── CalendarView.jsx       # ปฏิทินแสดงวันลาองค์กร
│   │       ├── ApproverView.jsx       # หน้าพิจารณาอนุมัติคำขอสำหรับผู้จัดการ/HR
│   │       ├── ReportsView.jsx        # รายงานสถิติการลา
│   │       └── SettingsView.jsx       # ตั้งค่าข้อมูลส่วนตัวและจัดการสิทธิ PDPA
│   └── data/
│       └── mockData.js                # โครงสร้าง Data Models มาตรฐาน (ลบข้อมูลปลอมออกทั้งหมด)
│
├── workflow_leave_management.png      # ภาพแผนผังขั้นตอนการทำงาน (Workflow)
├── workflow_leave_management.svg      # แผนผังเวกเตอร์ Workflow
└── package.json                       # รายการไลบรารีของโปรเจกต์
```

---

## 🗄️ 1. ส่วนฐานข้อมูล (Database Layer)

* **ไฟล์ DDL:** [`database/schema.sql`](file:///d:/project_cooperative/database/schema.sql)
* **ไฟล์ Master Data:** [`database/seed.sql`](file:///d:/project_cooperative/database/seed.sql)
* **ตารางหลัก 12 ตาราง:**
  1. `departments` : แผนกงานในองค์กร
  2. `roles` : สิทธิ์ผู้ใช้งาน (`SYSTEM_ADMIN`, `HR_ADMIN`, `APPROVER`, `EMPLOYEE`)
  3. `users` : ข้อมูลพนักงานและข้อมูลการเข้าใช้งาน
  4. `user_sessions` : บันทึก Token และเซสชันการล็อกอิน
  5. `leave_types` : การตั้งค่าประเภทการลา (ลาพักร้อน, ลาป่วย, ลากิจ, ลาคลอด)
  6. `employee_leave_quotas` : สิทธิ์วันลาของพนักงานแต่ละคนตามปีงบประมาณ
  7. `leave_requests` : คำขอลางาน พร้อมสถานะ (`pending`, `approved`, `rejected`, `cancelled`)
  8. `leave_attachments` : ไฟล์แนบ พร้อมแฟล็กคุ้มครองข้อมูลอ่อนไหว (`is_sensitive_medical`)
  9. `leave_approval_history` : บันทึกประวัติการอนุมัติ/ปฏิเสธของหัวหน้างาน
  10. `pdpa_policies` : นโยบายความเป็นส่วนตัวแต่ละเวอร์ชัน (ภาษาชัดเจน ไม่กำกวม)
  11. `pdpa_consents` : บันทึกการยินยอม และ **การถอนความยินยอม (`revoked_at`)** ที่ถอนได้ทุกเมื่อ
  12. `pdpa_audit_logs` : บันทึกหลักฐานกิจกรรมความยินยอมตามเกณฑ์กฎหมาย PDPA

---

## 💻 2. ส่วนหน้าบ้าน (Frontend Layer)

* **เอาข้อมูลปลอมออกทั้งหมด:**
  * ลบรายชื่อพนักงานปลอม (`นางสาวพนิกา`, `นายสมชาย`) และคำขอลาตัวอย่างออก
  * ปฏิทินและการ์ดสรุปยอดวันลาเชื่อมต่อกับข้อมูลจริง ไม่มีการ Hardcode วันที่
* **ระบบ PDPA Consent & Privacy Notice:**
  * เมื่อพนักงานลงทะเบียนใหม่ (Register) หรือเข้าสู่ระบบครั้งแรก (Login) ระบบจะเปิดหน้าต่าง **Privacy Policy Modal** อัตโนมัติ
  * แจ้งข้อมูลที่จัดเก็บ, วัตถุประสงค์ และสิทธิในการ **ถอนความยินยอมได้ทุกเมื่อโดยไม่มีเงื่อนไขผูกมัด**
  * มีเมนู **Privacy Center** ในหน้า Settings ให้ตรวจสอบสถานะ, ถอนความยินยอม, และดาวน์โหลดสำเนาข้อมูลส่วนบุคคล (Right to Data Portability)
* **การเชื่อมต่อ API:**
  * มีไฟล์ [`src/services/api.js`](file:///d:/project_cooperative/src/services/api.js) รองรับการยิง REST API เข้า Backend พร้อม Fallback จัดเก็บใน LocalStorage อัตโนมัติ

---

## 🚀 วิธีการติดตั้งและรันระบบ

### 1. ติดตั้งฐานข้อมูล (Database)
```bash
mysql -u root -p -e "CREATE DATABASE smartleave_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p smartleave_db < database/schema.sql
mysql -u root -p smartleave_db < database/seed.sql
```

### 2. รันส่วนหน้าบ้าน (Frontend)
```bash
npm install
npm run dev
```
เข้าใช้งานผ่านเบราว์เซอร์ที่: `http://localhost:5173`
