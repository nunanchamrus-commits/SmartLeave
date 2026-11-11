# โครงสร้างฐานข้อมูลระบบจัดการวันลาและ PDPA (Database Architecture)

ฐานข้อมูลของระบบ **SmartLeave** ถูกออกแบบตามหลัก Normalized Database (3NF) และสอดคล้องกับข้อกำหนดของ **พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)**

---

## 🗂️ ไฟล์ในโฟลเดอร์ฐานข้อมูล

1. **`schema.sql`** : สคริปต์ DDL สำหรับสร้างตาราง (Tables), ความสัมพันธ์ (Foreign Keys), ดัชนี (Indexes) และมุมมอง (Views)
2. **`seed.sql`** : ข้อมูลตั้งต้นระบบ (Master Data) ประกอบด้วย บทบาท (Roles), แผนก (Departments), ประเภทการลา (Leave Types), นโยบาย PDPA ฉบับแรก (v1.0) และบัญชีผู้ดูแลระบบตั้งต้น (Admin) โดย **ไม่มีข้อมูลพนักงานปลอม**

---

## 📋 แผนผังความสัมพันธ์ตาราง (Database Schema Overview)

```
[departments] 1 ────< N [users] 1 ────< N [employee_leave_quotas] >──── 1 [leave_types]
                         │
                         ├────< N [leave_requests] 1 ────< N [leave_attachments]
                         │             │
                         │             └────< N [leave_approval_history]
                         │
                         ├────< N [pdpa_consents] >──── 1 [pdpa_policies]
                         │
                         ├────< N [pdpa_audit_logs]
                         │
                         ├────< N [notifications]
                         │
                         └────< N [data_subject_requests]
```

---

## 🔐 รายละเอียดตารางและวัตถุประสงค์

### 1. หมวดองค์กรและผู้ใช้งาน (Users & Access)
* `departments`: รายชื่อแผนก / ฝ่าย
* `roles`: สิทธิ์ผู้ใช้งาน (`SYSTEM_ADMIN`, `HR_ADMIN`, `APPROVER`, `EMPLOYEE`)
* `users`: บัญชีพนักงาน รหัสพนักงาน อีเมล แฮชรหัสผ่าน และตำแหน่ง
* `user_sessions`: ประวัติเซสชันการล็อกอินและ Access Token

### 2. หมวดการลางานและโควตา (Leave & Workflow)
* `leave_types`: การตั้งค่าประเภทการลา (ลาพักร้อน, ลาป่วย, ลากิจ, ลาคลอด) และการบังคับแนบเอกสาร
* `employee_leave_quotas`: สิทธิ์วันลาของพนักงานแต่ละคนตามปีงบประมาณ คำนวณวันลาสะสม วันที่ใช้ไป และคงเหลือ
* `leave_requests`: รายการยื่นคำขอลางาน วันที่เริ่ม-สิ้นสุด เหตุผล และสถานะ (`pending`, `approved`, `rejected`, `cancelled`)
* `leave_attachments`: เก็บหลักฐานไฟล์แนบ และมีแฟล็ก `is_sensitive_medical` เพื่อคุ้มครองข้อมูลสุขภาพ
* `leave_approval_history`: ประวัติบันทึกขั้นตอนการพิจารณาอนุมัติของหัวหน้างาน

### 3. หมวดการคุ้มครองข้อมูลส่วนบุคคล (PDPA Compliance)
* `pdpa_policies`: เก็บนโยบายความเป็นส่วนตัวแต่ละเวอร์ชัน เนื้อหาภาษาเข้าใจง่าย ไม่กำกวม
* `pdpa_consents`: บันทึกสถานะการให้ความยินยอม วันที่ยินยอม และ **วันที่ถอนความยินยอม (`revoked_at`)** ที่พนักงานกดถอนได้ทุกเมื่อ
* `pdpa_audit_logs`: บันทึกหลักฐานกิจกรรมตามกฎหมาย PDPA (Timestamp, IP Address, Action)
* `data_subject_requests`: ระบบรองรับการใช้สิทธิของเจ้าของข้อมูล (ขอดูสำเนา, ขอแก้ไข, ขอลบ)

---

## 🚀 วิธีการนำเข้าฐานข้อมูล (Installation)

### สำหรับ MySQL / MariaDB:
```bash
mysql -u root -p -e "CREATE DATABASE smartleave_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p smartleave_db < schema.sql
mysql -u root -p smartleave_db < seed.sql
```

### สำหรับ PostgreSQL:
สามารถรันคำสั่ง SQL ใน `schema.sql` และ `seed.sql` ผ่าน pgAdmin หรือ `psql` ได้ทันที (เปลี่ยน `AUTO_INCREMENT` เป็น `SERIAL` หรือ `GENERATED ALWAYS AS IDENTITY`)

