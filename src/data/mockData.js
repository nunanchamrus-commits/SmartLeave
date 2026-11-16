// =====================================================================
// SMARTLEAVE DATA TEMPLATES: สำนักงานสหกรณ์จังหวัดขอนแก่น
// ลบ mock data ออกทั้งหมด ให้ระบบทำงานร่วมกับ Cloudflare D1 จริง 100%
// =====================================================================

export const initialUser = null;

export const approverUser = null;

export const initialQuotas = {
  totalRemaining: 0,
  totalLimit: 0,
  vacation: {
    name: 'ลาพักร้อน',
    remaining: 0,
    limit: 10,
    unit: 'วัน',
    used: 0,
    color: '#16a34a',
    bg: '#EBF7EE',
  },
  personal: {
    name: 'ลากิจ',
    remaining: 0,
    limit: 45,
    unit: 'วัน',
    used: 0,
    color: '#0D9488',
    bg: '#E6F5F2',
  },
  sick: {
    name: 'ลาป่วย',
    remaining: 0,
    limit: 60,
    unit: 'วัน',
    used: 0,
    color: '#EF4444',
    bg: '#FFE8EC',
  },
  maternity: {
    name: 'ลาคลอดบุตร',
    remaining: 0,
    limit: 90,
    unit: 'วัน',
    used: 0,
    color: '#EC4899',
    bg: '#FDF2F8',
  },
};

export const initialLeaveRequests = [];

export const announcementsData = [];

export const notificationsData = [];

export const employeesList = [];

// นโยบายความเป็นส่วนตัวตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
export const initialPDPAPolicy = {
  version: '1.0 (2569)',
  effectiveDate: '1 มกราคม 2569',
  dataCollected: [
    { title: 'ข้อมูลส่วนตัวพื้นฐาน', desc: 'ชื่อ-นามสกุล, เพศ, รหัสพนักงาน, ตำแหน่งงาน, ฝ่าย/กลุ่มงาน' },
    { title: 'ข้อมูลการติดต่อ', desc: 'อีเมลองค์กร, เบอร์โทรศัพท์' },
    { title: 'ข้อมูลประวัติการลา', desc: 'ประเภทการลา, วันที่ลา, สถิติและโควตาคงเหลือ' },
    { title: 'ข้อมูลสุขภาพและเวชระเบียน', desc: 'ใบรับรองแพทย์และเหตุผลการลาป่วย (ประมวลผลตามกฎหมายแรงงานและระเบียบราชการ)' },
  ],
  purposes: [
    { title: 'การบริหารงานบุคคล', desc: 'ใช้สำหรับพิจารณาอนุมัติวันลาและติดตามสถิติการปฏิบัติงานของเจ้าหน้าที่' },
    { title: 'การคำนวณสิทธิประโยชน์', desc: 'ใช้ประเมินวันลาคงเหลือและสิทธิประโยชน์ตามระเบียบสหกรณ์' },
    { title: 'การปฏิบัติตามกฎหมาย', desc: 'เก็บรักษาบันทึกเพื่อการตรวจสอบตามระเบียบทางราชการ' },
  ],
  rights: [
    { title: 'สิทธิในการเข้าถึงและแก้ไข', desc: 'ท่านสามารถเข้าดูและขอแก้ไขข้อมูลส่วนตัวให้ถูกต้องได้ตลอดเวลา' },
    { title: 'สิทธิในการถอนความยินยอม', desc: 'ท่านสามารถแจ้งความประสงค์ถอนความยินยอมการประมวลผลข้อมูลได้' },
    { title: 'สิทธิในการลบข้อมูล', desc: 'ขอลบหรือทำลายข้อมูลเมื่อพ้นระยะเวลาจัดเก็บตามที่กฎหมายกำหนด' },
  ],
};
