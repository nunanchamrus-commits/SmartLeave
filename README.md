# 🌿 SmartLeave - ระบบบริหารจัดการวันเวลาของการลา
### สำนักงานสหกรณ์จังหวัดขอนแก่น (Khon Kaen Provincial Cooperative Office)

**SmartLeave** คือระบบบริหารจัดการวันเวลาของการลาและสถิติวันลาบุคลากรภาครัฐยุคใหม่ พัฒนาขึ้นเพื่อรองรับโครงสร้างการทำงานและระเบียบวันลาของสำนักงานสหกรณ์จังหวัดขอนแก่นอย่างสมบูรณ์แบบ ทำงานบนสถาปัตยกรรม **Serverless Full-Stack (React 18 + Vite + Tailwind CSS + Cloudflare Workers + Cloudflare D1 SQLite)**

---

## 🌟 จุดเด่นและฟีเจอร์หลัก (Key Features)

### 1. ระบบยืนยันตัวตนและความปลอดภัย (Authentication & PDPA)
- **เข้าสู่ระบบด้วยชื่อ-สกุล ภาษาอังกฤษ:** ล็อกอินด้วยชื่อ-สกุลภาษาอังกฤษตามบัตรเจ้าหน้าที่ (เช่น `Suda Jaidee`, `Panika Thammoeang`) หรืออีเมล พร้อมรหัสผ่านความปลอดภัยสูง (ขั้นต่ำ 8 ตัวอักษร)
- **การแยกสิทธิ์ตามบทบาทอัตโนมัติ (Strict Role Separation):**
  - 👤 **โหมดพนักงาน (Employee Mode):** แดชบอร์ดสรุปยอดวันลา, ยื่นคำขอลา, ตรวจสอบสถานะการลา, ปฏิทินวันลา, จัดการข้อมูลส่วนตัว
  - 🛡️ **โหมดผู้ดูแล / ผู้อนุมัติ (Admin & Approver Mode):** แดชบอร์ดผู้บริหาร, จัดการคำขอลาและพิจารณาอนุมัติ, บริหารรายชื่อบุคลากรและปรับโควตา, รายงานสถิติภาพรวมองค์กร
- **ระบบคุ้มครองข้อมูลส่วนบุคคล (PDPA Consent):** ตรวจสอบและบันทึกความยินยอมของเจ้าหน้าที่รายบุคคลลงตาราง `pdpa_consents` พร้อมเก็บบันทึกประวัติ `pdpa_audit_logs`
- **ระบบรีเซ็ตรหัสผ่านผ่าน OTP:** รองรับการขอรับรหัส OTP ทางอีเมลเพื่อยืนยันตัวตนในการตั้งรหัสผ่านใหม่

---

### 2. สิทธิ์และโควตาวันลาตามระเบียบบุคลากรภาครัฐ (Government Leave Quotas)
คำนวณและควบคุมจำนวนวันลาตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยการลาของข้าราชการและประเภทบุคลากร:
| ประเภทบุคลากร (Employment Type) | ลาป่วย (Sick) | ลาคลอดบุตร (Maternity) | ลากิจส่วนตัว (Personal) | ลาพักผ่อน (Vacation) |
| :--- | :---: | :---: | :---: | :---: |
| **ข้าราชการ (Civil Servant)** | 60 วัน | 90 วัน | 45 วัน | 10 วัน |
| **ลูกจ้างประจำ (Permanent Employee)** | 60 วัน | 90 วัน | 45 วัน | 10 วัน |
| **พนักงานราชการ (Government Employee)** | **เท่าที่ป่วยจริง** | 90 วัน | 10 วัน | 10 วัน |

---

### 3. ระบบยื่นคำขอลาและการอนุมัติ (Leave Request & Approver Workflow)
- **ยื่นคำขอลาออนไลน์:** คำนวณวันลาคงเหลือแบบ Real-time รองรับทั้งเต็มวัน, ครึ่งวันเช้า และครึ่งวันบ่าย
- **ระบบระบุผู้ปฏิบัติหน้าที่แทน:** บันทึกชื่อหรือเลือกรหัสบุคลากรที่ปฏิบัติหน้าที่แทนขณะลา
- **พอร์ทัลผู้อนุมัติ (Approver Portal):** 
  - ผู้อำนวยการ/หัวหน้ากลุ่มงานสามารถตรวจสอบรายละเอียดคำขอ
  - ดำเนินการ **อนุมัติ**, **ไม่อนุมัติ** หรือ **ส่งกลับเพื่อตรวจสอบ** พร้อมระบุข้อคิดเห็น
  - เมื่อคำขอได้รับการอนุมัติ ระบบจะตัดยอดวันลาคงเหลือใน D1 ทันที

---

### 4. ปฏิทินและสถิติภาพรวม (Calendar, History & Reports)
- **ปฏิทินการลา (Calendar View):** แสดงวันหยุดนักขัตฤกษ์ทางการและรายการลาของบุคลากรในรูปแบบสีตามประเภทการลา
- **ตรวจสอบสถานะและประวัติการลา (Leave History):** คัดกรองคำขอตามสถานะ (ยังไม่ยื่นเอกสาร, อยู่ระหว่างตรวจสอบ, อนุมัติ, ไม่อนุมัติ, ยกเลิก) ค้นหาข้อมูล และส่งออกเป็นไฟล์ **CSV (Excel Compatible)**
- **รายงานสถิติการลา (Reports & Analytics):** วิเคราะห์แนวโน้มการลาในแต่ละเดือนของปีงบประมาณ และสัดส่วนประเภทการลา

---

### 5. การแจ้งเตือนและข้อมูลส่วนตัว (Notifications & Profile Settings)
- **การแจ้งเตือน Real-time:** แสดงวันเวลาตามมาตรฐานเวลาจริงประเทศไทย (UTC+7) พร้อมแยกระหว่างการแจ้งเตือนสำหรับพนักงานและการแจ้งเตือนคำขอเข้าสำหรับผู้ดูแล
- **หน้าข้อมูลส่วนตัว (Profile Settings):** แก้ไขข้อมูลชื่อ-สกุล (ไทย-อังกฤษ), คำนำหน้า, เพศ, ตำแหน่ง, ฝ่าย, เบอร์โทรศัพท์ และอีเมล โดยระบบจะบันทึกแทนที่ข้อมูลลงฐานข้อมูล Cloudflare D1 ทันที

---

## 💻 เทคโนโลยีที่ใช้พัฒนา (Tech Stack)

### Frontend
- **Core Framework:** [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) (Single Page Application)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Icons & UI:** [Lucide React](https://lucide.dev/)
- **Visual Feedback:** [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **PDF & Document:** [html2pdf.js](https://www.npmjs.com/package/html2pdf.js), [pdf-lib](https://pdf-lib.js.org/)

### Backend & Cloud Infrastructure
- **API Engine:** [Cloudflare Workers](https://workers.cloudflare.com/) (Edge Serverless Environment)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless Distributed SQLite)
- **API Design:** RESTful API with JSON responses & Bearer Token Authentication
- **Schema Management:** Dynamic SQL Schema Migration (Idempotent Table Auto-Creation)

---

## 👥 บัญชีผู้ใช้งานเริ่มต้นสำหรับทดสอบ (Demo Accounts)

ทุกบัญชีมีรหัสผ่านเริ่มต้นคือ: `12345678`

| ชื่อ-สกุล ภาษาอังกฤษ (Username) | ชื่อ-สกุล ภาษาไทย | รหัสบุคลากร | ประเภทบุคลากร | สิทธิ์ในระบบ | สังกัดกลุ่ม/ฝ่าย |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **System Administrator** | นายผู้ดูแลระบบ ส่วนกลาง | `ADM-001` | ข้าราชการ | 🛡️ **Admin** | ฝ่ายบริหารทั่วไป |
| **Panika Thammoeang** | นางสาวพนิกา ธรรมเมือง | `EMP-001` | ข้าราชการ | 👤 **User** | กลุ่มส่งเสริมสหกรณ์ 1 |
| **Somchai Mankhong** | นายสมชาย มั่นคง | `MGR-002` | ข้าราชการ | 🛡️ **Approver** | ฝ่ายบริหารทั่วไป |
| **Nichaphat Wongsa** | นางสาวณิชาภัทร วงศ์ษา | `EMP-003` | ข้าราชการ | 👤 **User** | กลุ่มส่งเสริมและพัฒนาธุรกิจสหกรณ์ |
| **Akarapol Charoenphon** | นายอัครพล เจริญผล | `EMP-004` | พนักงานราชการ | 👤 **User** | กลุ่มตรวจการสหกรณ์ |
| **Suda Jaidee** | นางสาวสุดา ใจดี | `EMP-005` | ลูกจ้างประจำ | 👤 **User** | ฝ่ายบริหารทั่วไป |

---

## 📂 โครงสร้างโฟลเดอร์โปรเจกต์ (Project Structure)

```text
SmartLeave/
├── public/                     # Static Assets (โลโก้ และไฟล์สาธารณะ)
├── src/
│   ├── components/             # React Components หลัก
│   │   ├── views/              # มุมมองหน้าจอตามแท็บเมนู
│   │   │   ├── AdminDashboardView.jsx  # แดชบอร์ดผู้ดูแลระบบ
│   │   │   ├── AdminEmployeesView.jsx  # จัดการรายชื่อพนักงานและโควตา
│   │   │   ├── ApproverView.jsx        # พอร์ทัลพิจารณาอนุมัติคำขอลา
│   │   │   ├── CalendarView.jsx        # ปฏิทินวันลาขององค์กร
│   │   │   ├── DashboardView.jsx       # แดชบอร์ดสำหรับพนักงาน
│   │   │   ├── LeaveHistoryView.jsx    # ประวัติและสถานะการลา
│   │   │   ├── ReportsView.jsx         # รายงานสถิติภาพรวม
│   │   │   └── SettingsView.jsx        # หน้าจัดการข้อมูลส่วนตัว
│   │   ├── Header.jsx          # แถบนำทางด้านบนและการแจ้งเตือน
│   │   ├── Sidebar.jsx         # เมนูนำทางด้านข้างแบ่งตาม Role
│   │   ├── LoginView.jsx       # หน้าจอเข้าสู่ระบบ
│   │   ├── RegisterView.jsx    # หน้าจอลงทะเบียนพนักงานใหม่
│   │   ├── ForgotPasswordView.jsx # หน้ารีเซ็ตรหัสผ่านด้วย OTP
│   │   ├── PdpaConsentView.jsx # หน้าขอยินยอม PDPA
│   │   ├── StatCards.jsx       # การ์ดสรุปยอดโควตาวันลา
│   │   ├── LeaveRequestModal.jsx   # โมดอลยื่นคำขอลา
│   │   └── LeaveDetailModal.jsx    # โมดอลดูรายละเอียดคำขอลา
│   ├── context/
│   │   └── LeaveContext.jsx    # Global State Manager & Sync Engine
│   ├── data/
│   │   └── mockData.js         # ข้อมูลตั้งต้นและ Mock Data สำรอง
│   ├── services/
│   │   └── api.js              # HTTP Client เชื่อมต่อ Cloudflare Workers
│   ├── App.jsx                 # Main Application Component
│   ├── index.css               # Tailwind CSS Stylesheet
│   └── main.jsx                # React Entry Point
├── worker/
│   └── index.js                # Cloudflare Workers API & D1 SQLite Logic
├── wrangler.toml               # การตั้งค่า Cloudflare Workers & D1 Binding
├── vite.config.js              # การตั้งค่า Vite Build Tool
├── tailwind.config.js          # การตั้งค่า Tailwind CSS
└── package.json                # Project Dependencies & Scripts
```

---

## 🚀 วิธีการติดตั้งและรันระบบ (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป แนะนำ LTS)
- npm หรือ yarn หรือ pnpm

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันระบบในสภาพแวดล้อม Development (Frontend)
```bash
npm run dev
```
เข้าใช้งานผ่านเบราว์เซอร์ที่: `http://localhost:5173`

### 3. รัน Cloudflare Worker (Backend API & D1 Database)
หากต้องการรันหรือทดสอบ Backend API ในเครื่อง:
```bash
npx wrangler dev
```

### 4. Build สำหรับ Production
```bash
npm run build
```
ไฟล์ที่ Build เสร็จสมบูรณ์จะอยู่ที่โฟลเดอร์ `dist/` พร้อมสำหรับการนำขึ้นโฮสต์ (เช่น Cloudflare Pages หรือ Cloudflare Workers Assets)

---

## 📄 ใบอนุญาต (License)
ลิขสิทธิ์ของ **สำนักงานสหกรณ์จังหวัดขอนแก่น** (Khon Kaen Provincial Cooperative Office)
สงวนลิขสิทธิ์ พ.ศ. 2569 (2026)
