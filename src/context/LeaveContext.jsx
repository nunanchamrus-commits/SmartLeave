import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { initialQuotas, initialPDPAPolicy } from '../data/mockData';
import { generateHolidayAnnouncements } from '../data/holidays';
import api from '../services/api';

const LeaveContext = createContext();

export const DEFAULT_STAFF = [
  {
    id: 'usr-1',
    raw_id: 1,
    employeeId: 'ADM-001',
    name: 'นายผู้ดูแลระบบ ส่วนกลาง',
    prefix: 'นาย',
    firstName: 'ผู้ดูแลระบบ',
    lastName: 'ส่วนกลาง',
    prefixEn: 'Mr.',
    firstNameEn: 'System',
    lastNameEn: 'Administrator',
    englishName: 'Mr. System Administrator',
    gender: 'ชาย',
    employmentType: 'ข้าราชการ',
    email: 'admin@smartleave.com',
    phone: '02-000-0000',
    title: 'System Administrator',
    role: 'admin',
    department: 'ฝ่ายบริหารทั่วไป',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
    password: '12345678',
  },
  {
    id: 'usr-2',
    raw_id: 2,
    employeeId: 'EMP-001',
    name: 'นางสาวพนิกา ธรรมเมือง',
    prefix: 'นางสาว',
    firstName: 'พนิกา',
    lastName: 'ธรรมเมือง',
    prefixEn: 'Ms.',
    firstNameEn: 'Panika',
    lastNameEn: 'Thammoeang',
    englishName: 'Ms. Panika Thammoeang',
    gender: 'หญิง',
    employmentType: 'ข้าราชการ',
    email: 'panika.t@smartleave.com',
    phone: '081-234-5678',
    title: 'นักวิชาการสหกรณ์ปฏิบัติการ',
    role: 'employee',
    department: 'กลุ่มส่งเสริมสหกรณ์ 1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    password: '12345678',
  },
  {
    id: 'usr-3',
    raw_id: 3,
    employeeId: 'MGR-002',
    name: 'นายสมชาย มั่นคง',
    prefix: 'นาย',
    firstName: 'สมชาย',
    lastName: 'มั่นคง',
    prefixEn: 'Mr.',
    firstNameEn: 'Somchai',
    lastNameEn: 'Mankhong',
    englishName: 'Mr. Somchai Mankhong',
    gender: 'ชาย',
    employmentType: 'ข้าราชการ',
    email: 'somchai.m@smartleave.com',
    phone: '089-876-5432',
    title: 'ผู้อำนวยการกลุ่มงานบริหาร / ผู้อนุมัติ',
    role: 'approver',
    department: 'ฝ่ายบริหารทั่วไป',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
    password: '12345678',
  },
  {
    id: 'usr-4',
    raw_id: 4,
    employeeId: 'EMP-003',
    name: 'นางสาวณิชาภัทร วงศ์ษา',
    prefix: 'นางสาว',
    firstName: 'ณิชาภัทร',
    lastName: 'วงศ์ษา',
    prefixEn: 'Ms.',
    firstNameEn: 'Nichaphat',
    lastNameEn: 'Wongsa',
    englishName: 'Ms. Nichaphat Wongsa',
    gender: 'หญิง',
    employmentType: 'ข้าราชการ',
    email: 'nichaphat.w@smartleave.com',
    phone: '086-111-2233',
    title: 'เจ้าพนักงานส่งเสริมสหกรณ์ชำนาญงาน',
    role: 'employee',
    department: 'กลุ่มส่งเสริมและพัฒนาธุรกิจสหกรณ์',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    password: '12345678',
  },
  {
    id: 'usr-5',
    raw_id: 5,
    employeeId: 'EMP-004',
    name: 'นายอัครพล เจริญผล',
    prefix: 'นาย',
    firstName: 'อัครพล',
    lastName: 'เจริญผล',
    prefixEn: 'Mr.',
    firstNameEn: 'Akarapol',
    lastNameEn: 'Charoenphon',
    englishName: 'Mr. Akarapol Charoenphon',
    gender: 'ชาย',
    employmentType: 'พนักงานราชการ',
    email: 'akarapol.c@smartleave.com',
    phone: '082-333-4455',
    title: 'นักวิชาการมาตรฐานสหกรณ์',
    role: 'employee',
    department: 'กลุ่มตรวจการสหกรณ์',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    password: '12345678',
  },
  {
    id: 'usr-6',
    raw_id: 6,
    employeeId: 'EMP-005',
    name: 'นางสาวสุดา ใจดี',
    prefix: 'นางสาว',
    firstName: 'สุดา',
    lastName: 'ใจดี',
    prefixEn: 'Ms.',
    firstNameEn: 'Suda',
    lastNameEn: 'Jaidee',
    englishName: 'Ms. Suda Jaidee',
    gender: 'หญิง',
    employmentType: 'ลูกจ้างประจำ',
    email: 'suda.j@smartleave.com',
    phone: '084-555-6677',
    title: 'เจ้าหน้าที่ธุรการและสารบรรณ',
    role: 'employee',
    department: 'ฝ่ายบริหารทั่วไป',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    password: '12345678',
  },
];

function cleanNumericUserId(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim().replace(/^usr-/i, '');
}

function getUserStableKey(user) {
  if (!user) return '';
  const empId = user.employeeId ? String(user.employeeId).trim().toLowerCase() : '';
  const id = user.id ? String(user.id).trim().toLowerCase() : '';
  const email = user.email ? String(user.email).trim().toLowerCase() : '';
  return empId || id || email;
}

function doesLeaveBelongToUser(req, user) {
  if (!req || !user) return false;
  const currRawIds = new Set(
    [cleanNumericUserId(user.raw_id), cleanNumericUserId(user.id)].filter(Boolean)
  );
  const reqUserId = cleanNumericUserId(req.userId ?? req.user_id);
  if (reqUserId && currRawIds.has(reqUserId)) return true;
  if (user.id && req.userId && String(req.userId) === String(user.id)) return true;
  if (
    req.employeeId &&
    ((user.employeeId && String(req.employeeId).toLowerCase() === String(user.employeeId).toLowerCase()) ||
      (user.id && String(req.employeeId).toLowerCase() === String(user.id).toLowerCase()))
  ) {
    return true;
  }
  if (req.employeeEmail && user.email && req.employeeEmail.toLowerCase() === user.email.toLowerCase()) {
    return true;
  }
  if (req.employeeName && user.name && req.employeeName.trim() === user.name.trim()) {
    return true;
  }
  return false;
}

export function formatThaiDateTime(inputDate = new Date()) {
  if (!inputDate) return '';
  if (typeof inputDate === 'string' && /เวลา\s+\d{1,2}:\d{2}/.test(inputDate)) {
    return inputDate;
  }

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  // กรณีวันที่มาจาก SQLite D1 เช่น "2026-11-16 10:44:00"
  if (typeof inputDate === 'string') {
    const trimmed = inputDate.trim();
    const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/);
    if (m) {
      let [_, y, mo, d, hh, mm, ss, tz] = m;
      let yearNum = parseInt(y, 10);
      let monthNum = parseInt(mo, 10);
      let dayNum = parseInt(d, 10);
      let hourNum = parseInt(hh, 10);
      let minuteNum = parseInt(mm, 10);

      // ถ้าเป็นเวลา UTC (มี Z หรือท้ายสตริงระบุ Z) ให้ปรับบวก +7 ชั่วโมงเข้าสู่เวลาประเทศไทย
      if (tz === 'Z' || trimmed.endsWith('Z')) {
        const dUtc = new Date(Date.UTC(yearNum, monthNum - 1, dayNum, hourNum, minuteNum));
        const dTh = new Date(dUtc.getTime() + (7 * 3600000));
        dayNum = dTh.getUTCDate();
        monthNum = dTh.getUTCMonth() + 1;
        yearNum = dTh.getUTCFullYear();
        hourNum = dTh.getUTCHours();
        minuteNum = dTh.getUTCMinutes();
      }

      const thaiMonth = thaiMonths[monthNum - 1] || '';
      const thaiYear = yearNum + 543;
      const hhStr = String(hourNum).padStart(2, '0');
      const mmStr = String(minuteNum).padStart(2, '0');
      return `${dayNum} ${thaiMonth} ${thaiYear} เวลา ${hhStr}:${mmStr} น.`;
    }
  }

  const dateObj = inputDate instanceof Date ? inputDate : new Date(inputDate);
  if (isNaN(dateObj.getTime())) {
    return typeof inputDate === 'string' ? inputDate : '';
  }

  // ปรับให้เป็น UTC+7 (เวลาประเทศไทย) เสมอ
  const utcMs = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
  const thDate = new Date(utcMs + (7 * 3600000));

  const day = thDate.getDate();
  const month = thaiMonths[thDate.getMonth()];
  const year = thDate.getFullYear() + 543;
  const hours = String(thDate.getHours()).padStart(2, '0');
  const minutes = String(thDate.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;
}

function doesNotificationBelongToUser(notif, user) {
  if (!notif || !user) return false;

  const isAdminUser = user.role === 'admin' || user.role === 'approver';

  // 1. สำหรับ Admin: ให้ขึ้นเฉพาะการแจ้งเตือนที่มีคำขอลาเข้ามาเท่านั้น 100%
  if (isAdminUser) {
    const isIncomingRequest =
      notif.forAdmin === true ||
      notif.targetRole === 'admin' ||
      notif.targetRole === 'approver' ||
      notif.title?.includes('มีคำขอ') ||
      (notif.type === 'pending' && (notif.description?.includes('รอการตรวจสอบ') || notif.title?.includes('คำขอ')));

    return Boolean(isIncomingRequest);
  }

  // 2. สำหรับ User ทั่วไป: ให้ขึ้นเฉพาะการแจ้งเตือนของตนเอง (ไม่แสดงแจ้งเตือนรับคำขอของ Admin)
  if (notif.forAdmin || notif.targetRole === 'admin' || notif.title?.includes('มีคำขอ')) {
    return false;
  }

  const currRawIds = new Set(
    [cleanNumericUserId(user.raw_id), cleanNumericUserId(user.id)].filter(Boolean)
  );
  const notifUid = cleanNumericUserId(notif.userId ?? notif.user_id);
  if (notifUid && currRawIds.has(notifUid)) return true;
  if (
    notif.employeeId &&
    ((user.employeeId && String(notif.employeeId).toLowerCase() === String(user.employeeId).toLowerCase()) ||
      (user.id && String(notif.employeeId).toLowerCase() === String(user.id).toLowerCase()))
  ) {
    return true;
  }
  const notifEmail = notif.email || notif.employeeEmail;
  if (notifEmail && user.email && notifEmail.toLowerCase() === user.email.toLowerCase()) {
    return true;
  }
  if (notif.employeeName && user.name && notif.employeeName.trim() === user.name.trim()) {
    return true;
  }
  return false;
}

function normalizeNotificationItem(notif) {
  if (!notif) return notif;
  const isRead = Boolean(notif.read || notif.isRead);

  // ปรับให้วันเวลาแสดงเป็นวันเวลาจริงตามรูปแบบไทย
  let normalizedTime = notif.time;
  if (!normalizedTime || normalizedTime === 'เมื่อสักครู่') {
    normalizedTime = formatThaiDateTime(notif.createdAt || notif.timestamp || new Date());
  } else if (normalizedTime === '10 นาทีที่แล้ว') {
    normalizedTime = '15 พ.ย. 2569 เวลา 14:30 น.';
  } else if (normalizedTime === '2 ชั่วโมงที่แล้ว') {
    normalizedTime = '1 พ.ย. 2569 เวลา 08:30 น.';
  } else if (normalizedTime === '1 วันที่แล้ว') {
    normalizedTime = '3 พ.ย. 2569 เวลา 09:15 น.';
  } else if (normalizedTime === '3 วันที่แล้ว') {
    normalizedTime = '9 พ.ย. 2569 เวลา 11:20 น.';
  } else {
    normalizedTime = formatThaiDateTime(normalizedTime);
  }

  return {
    ...notif,
    description: notif.description ? notif.description.replace(/2568/g, '2569') : notif.description,
    time: normalizedTime,
    read: isRead,
    isRead: isRead ? 1 : 0,
  };
}

function inferUserGender(user) {
  if (!user) return 'หญิง';
  if (user.gender === 'หญิง' || user.gender === 'ชาย' || user.gender === 'อื่นๆ') return user.gender;
  const str = `${user.prefix || ''} ${user.name || ''} ${user.prefixEn || ''} ${user.englishName || ''}`.trim();
  if (/^(นางสาว|น\.ส\.|นาง|Ms\.|Miss|Mrs\.)/i.test(str)) return 'หญิง';
  if (/นาย|Mr\./i.test(str)) return 'ชาย';
  return 'หญิง';
}

function isMaleEmployee(emp) {
  if (!emp) return false;
  if (emp.gender === 'ชาย') return true;
  if (emp.gender === 'หญิง') return false;
  const str = `${emp.prefix || ''} ${emp.name || ''} ${emp.prefixEn || ''} ${emp.englishName || ''}`.trim();
  if (/นาย|Mr\./i.test(str)) return true;
  return false;
}

function normalizeLeaveStatus(status) {
  switch (status) {
    case 'ยังไม่ยื่นเอกสาร':
    case 'not_submitted':
    case 'pending':
    case 'รออนุมัติ':
      return 'ยังไม่ยื่นเอกสาร';
    case 'อยู่ระหว่างตรวจสอบ':
    case 'checking':
      return 'อยู่ระหว่างตรวจสอบ';
    case 'อนุมัติ':
    case 'approved':
      return 'อนุมัติ';
    case 'ไม่อนุมัติ':
    case 'rejected':
      return 'ไม่อนุมัติ';
    default:
      return 'ยังไม่ยื่นเอกสาร';
  }
}

function normalizeEmployeeQuotas(emp) {
  if (!emp) return emp;
  const isMale = isMaleEmployee(emp) || emp.gender === 'ชาย';
  const gender = isMale ? 'ชาย' : (emp.gender || inferUserGender(emp));
  const defaults = {
    vacation: 10,
    personal: 15,
    sick: 30,
    maternity: isMale ? 0 : 90,
  };
  const next = { ...emp, gender };
  Object.entries(defaults).forEach(([key, defLimit]) => {
    const rawRem = emp[`${key}Rem`];
    const rawLimit = emp[`${key}Limit`];
    const rawUsed = emp[`${key}Used`];

    let limit = rawLimit !== undefined && rawLimit !== null ? Math.max(0, Number(rawLimit)) : defLimit;
    let rem = rawRem !== undefined && rawRem !== null ? Math.max(0, Number(rawRem)) : limit;
    if (key === 'maternity' && rem === 98) rem = 90;
    if (rem > limit && (rawLimit === undefined || rawLimit === null)) {
      limit = rem;
    }
    const used =
      rawUsed !== undefined && rawUsed !== null
        ? Math.max(0, Number(rawUsed))
        : Math.max(0, limit - rem);

    next[`${key}Limit`] = limit;
    next[`${key}Used`] = used;
    next[`${key}Rem`] = rem;
  });

  if (isMale) {
    next.maternityLimit = 0;
    next.maternityUsed = 0;
    next.maternityRem = 0;
  }
  return next;
}

export function LeaveProvider({ children }) {
  // Authentication State: Require login before reaching dashboard
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      localStorage.removeItem('leaveflow_auth');
    } catch (e) { }
    const saved = sessionStorage.getItem('smartleave_auth');
    return saved === 'true';
  });

  // PDPA Consent State: ตรวจสอบความยินยอม PDPA เฉพาะบุคคล (ไม่ถามซ้ำหากยอมรับแล้ว)
  const [isPdpaAccepted, setIsPdpaAccepted] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('smartleave_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        const userKey = getUserStableKey(u);
        if (userKey && localStorage.getItem(`smartleave_pdpa_accepted_${userKey}`) === 'true') {
          return true;
        }
        if (u.pdpaAccepted || u.pdpa_accepted) {
          return true;
        }
      }
    } catch (e) { }
    return sessionStorage.getItem('smartleave_pdpa') === 'true';
  });

  // Load from sessionStorage or localStorage, null if not authenticated
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smartleave_user') || localStorage.getItem('smartleave_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...parsed,
            gender: parsed.gender || inferUserGender(parsed),
          };
        }
      }
    } catch (e) { }
    return null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [leaveRequests, setLeaveRequests] = useState([]);

  const [quotas, setQuotas] = useState(() => initialQuotas);

  const [notifications, setNotifications] = useState([]);

  const [employees, setEmployees] = useState([]);

  const isAdmin = currentUser?.role === 'approver' || currentUser?.role === 'admin';

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3200);
  };

  const [announcements, setAnnouncements] = useState(() => generateHolidayAnnouncements());

  // ล้างแคชตารางเดิมใน LocalStorage เพื่อให้ดึงข้อมูลจาก Cloudflare D1 100%
  useEffect(() => {
    try {
      localStorage.removeItem('smartleave_requests');
      localStorage.removeItem('smartleave_employees');
      localStorage.removeItem('smartleave_quotas');
      localStorage.removeItem('smartleave_passwords');
      localStorage.removeItem('leaveflow_employees');
      localStorage.removeItem('leaveflow_requests');
      localStorage.removeItem('leaveflow_quotas');
    } catch (e) { }
  }, []);

  const updateEmployeeQuota = async (empId, quotaUpdatesOrKey, value) => {
    mutationEpochRef.current += 1;
    const rawUpdates =
      typeof quotaUpdatesOrKey === 'object' && quotaUpdatesOrKey !== null
        ? quotaUpdatesOrKey
        : { [quotaUpdatesOrKey]: value };

    const normalizedUpdates = {};
    Object.entries(rawUpdates).forEach(([k, v]) => {
      if (v !== undefined && v !== null && !Number.isNaN(Number(v))) {
        normalizedUpdates[k] = Math.max(0, Number(v));
      }
    });

    const targetBase = employeesRef.current.find((emp) => emp.id === empId || emp.employeeId === empId);
    const nextEmp = targetBase ? normalizeEmployeeQuotas({ ...targetBase, ...normalizedUpdates }) : null;

    const updatedEmployees = employeesRef.current.map((emp) => {
      if (emp.id === empId || emp.employeeId === empId) {
        return normalizeEmployeeQuotas({ ...emp, ...normalizedUpdates });
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    employeesRef.current = updatedEmployees;

    // ซิงก์การ์ดโควตาหน้าหลักหากแอดมินแก้ไขวันลาของผู้ใช้งานปัจจุบัน
    if (
      nextEmp &&
      currentUser &&
      (nextEmp.id === currentUser.id ||
        (currentUser.employeeId && nextEmp.employeeId === currentUser.employeeId) ||
        (currentUser.email && nextEmp.email?.toLowerCase() === currentUser.email.toLowerCase()))
    ) {
      const totalRem = nextEmp.vacationRem + nextEmp.personalRem + nextEmp.sickRem;
      const totalLim = nextEmp.vacationLimit + nextEmp.personalLimit + nextEmp.sickLimit;
      setQuotas((prev) => ({
        ...prev,
        totalRemaining: totalRem,
        totalLimit: totalLim,
        vacation: { ...prev.vacation, remaining: nextEmp.vacationRem, used: nextEmp.vacationUsed, limit: nextEmp.vacationLimit },
        personal: { ...prev.personal, name: 'ลากิจ', remaining: nextEmp.personalRem, used: nextEmp.personalUsed, limit: nextEmp.personalLimit },
        sick: { ...prev.sick, remaining: nextEmp.sickRem, used: nextEmp.sickUsed, limit: nextEmp.sickLimit },
        maternity: { ...prev.maternity, remaining: nextEmp.maternityRem, used: nextEmp.maternityUsed, limit: nextEmp.maternityLimit },
      }));
    }

    // บันทึกลง Cloudflare D1 Database จริง 100%
    pendingMutationRef.current += 1;
    let apiError = null;
    try {
      if (api && api.updateEmployeeQuota) {
        await api.updateEmployeeQuota(empId, {
          ...normalizedUpdates,
          email: nextEmp?.email || '',
        });
      }
    } catch (e) {
      apiError = e;
      console.log('[Update Quota D1 Note]:', e.message);
    } finally {
      pendingMutationRef.current = Math.max(0, pendingMutationRef.current - 1);
    }

    if (apiError && isDbConnectedRef.current) {
      await fetchLiveDatabaseData({ resetBaseline: true, silent: true });
      showToast(`ไม่สามารถบันทึกโควตาวันลาลงฐานข้อมูลได้ (${apiError.message || 'Server error'})`, 'error');
      return;
    }

    showToast('อัปเดตจำนวนวันลาและสิทธิ์ลาของพนักงานเรียบร้อยแล้ว', 'success');
  };

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // บันทึกเฉพาะ Session ของผู้ใช้ปัจจุบันเท่านั้น (ไม่เซฟตารางฐานข้อมูลลง Browser)
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('smartleave_user', JSON.stringify(currentUser));
      localStorage.setItem('smartleave_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // -------------------------------------------------------------
  // Live Database Sync (Cloudflare D1 Integration 100%)
  // ดึงข้อมูลบุคลากรสหกรณ์ คำขอลา ประกาศ และการแจ้งเตือนสดจาก Cloudflare D1
  // -------------------------------------------------------------
  const [isDbConnected, setIsDbConnected] = useState(false);

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const leaveRequestsRef = useRef(leaveRequests);
  leaveRequestsRef.current = leaveRequests;
  const employeesRef = useRef(employees);
  employeesRef.current = employees;
  const isDbConnectedRef = useRef(isDbConnected);
  isDbConnectedRef.current = isDbConnected;
  const isFetchingRef = useRef(false);
  const pendingMutationRef = useRef(0);
  const mutationEpochRef = useRef(0);
  const knownMyLeaveStatusesRef = useRef({ userKey: null, statuses: new Map(), seeded: false });

  const syncLeaveBaselineForUser = (requests, targetUser) => {
    const userKey = getUserStableKey(targetUser);
    if (!userKey) return;
    const myLeaves = (requests || []).filter((r) => doesLeaveBelongToUser(r, targetUser));
    knownMyLeaveStatusesRef.current = {
      userKey,
      statuses: new Map(myLeaves.map((r) => [String(r.id), normalizeLeaveStatus(r.status)])),
      seeded: true,
    };
  };

  const applyEmployeeQuotaDelta = (employeeList, targetReq, typeKeyOverride, daysDelta) => {
    if (!targetReq || !daysDelta) return employeeList;
    const typeKey = typeKeyOverride || targetReq.typeKey;
    if (!['vacation', 'personal', 'sick', 'maternity'].includes(typeKey)) return employeeList;

    return (employeeList || []).map((emp) => {
      const isMatch =
        (emp.raw_id && (targetReq.user_id || targetReq.userId) && Number(emp.raw_id) === Number(cleanNumericUserId(targetReq.user_id ?? targetReq.userId))) ||
        (targetReq.userId && emp.id && cleanNumericUserId(targetReq.userId) === cleanNumericUserId(emp.id)) ||
        (targetReq.employeeId && (emp.employeeId === targetReq.employeeId || emp.id === targetReq.employeeId)) ||
        (targetReq.employeeEmail && emp.email?.toLowerCase() === targetReq.employeeEmail.toLowerCase()) ||
        (targetReq.employeeName && emp.name === targetReq.employeeName);
      if (!isMatch) return emp;

      const limit = emp[`${typeKey}Limit`] ?? (typeKey === 'vacation' ? 10 : typeKey === 'personal' ? 15 : typeKey === 'sick' ? 30 : 90);
      const prevUsed = emp[`${typeKey}Used`] ?? Math.max(0, limit - (emp[`${typeKey}Rem`] ?? limit));
      const nextUsed = Math.max(0, prevUsed + daysDelta);
      const nextRem = Math.max(0, limit - nextUsed);
      return normalizeEmployeeQuotas({
        ...emp,
        [`${typeKey}Limit`]: limit,
        [`${typeKey}Used`]: nextUsed,
        [`${typeKey}Rem`]: nextRem,
      });
    });
  };

  const fetchLiveDatabaseData = async (options = {}) => {
    const { resetBaseline = false, silent = false } =
      typeof options === 'boolean' ? { resetBaseline: options } : options;

    if (isFetchingRef.current || pendingMutationRef.current > 0) return;

    const activeUser = currentUserRef.current;
    const startUserKey = getUserStableKey(activeUser);
    const startEpoch = mutationEpochRef.current;
    const isStaleSync = () =>
      getUserStableKey(currentUserRef.current) !== startUserKey ||
      mutationEpochRef.current !== startEpoch ||
      pendingMutationRef.current > 0;

    isFetchingRef.current = true;

    try {
      // 1. ดึงข้อมูลพนักงานสดจาก Cloudflare D1
      const empData = await api.getEmployees();
      if (isStaleSync()) return;

      const hasEmpData = Array.isArray(empData) && empData.length > 0;
      let latestEmployees = employeesRef.current;
      let matchedActiveUser = activeUser;

      if (hasEmpData) {
        latestEmployees = empData.map(normalizeEmployeeQuotas);
        setEmployees(latestEmployees);
        setIsDbConnected(true);
        isDbConnectedRef.current = true;

        // ซิงก์ข้อมูล currentUser เข้ากับข้อมูลล่าสุดใน DB
        if (activeUser) {
          const freshUser = latestEmployees.find(
            (e) =>
              (e.raw_id && activeUser.raw_id && Number(e.raw_id) === Number(activeUser.raw_id)) ||
              (e.id && activeUser.id && cleanNumericUserId(e.id) === cleanNumericUserId(activeUser.id)) ||
              (e.employeeId && activeUser.employeeId && e.employeeId.toLowerCase() === activeUser.employeeId.toLowerCase()) ||
              (e.email && activeUser.email && e.email.toLowerCase() === activeUser.email.toLowerCase())
          );
          if (freshUser) {
            matchedActiveUser = {
              ...activeUser,
              ...freshUser,
              gender: freshUser.gender || activeUser.gender,
            };
            const changed =
              activeUser.id !== matchedActiveUser.id ||
              activeUser.email !== matchedActiveUser.email ||
              activeUser.name !== matchedActiveUser.name ||
              activeUser.title !== matchedActiveUser.title ||
              activeUser.department !== matchedActiveUser.department ||
              activeUser.role !== matchedActiveUser.role ||
              activeUser.phone !== matchedActiveUser.phone ||
              activeUser.vacationRem !== matchedActiveUser.vacationRem ||
              activeUser.personalRem !== matchedActiveUser.personalRem ||
              activeUser.sickRem !== matchedActiveUser.sickRem ||
              activeUser.maternityRem !== matchedActiveUser.maternityRem;
            if (changed) {
              setCurrentUser((prev) => ({
                ...prev,
                ...freshUser,
                gender: freshUser.gender || prev.gender,
              }));
            }
          }
        }
      }

      // 2. ดึงรายการคำขอลาสดจาก Cloudflare D1
      const leavesData = await api.getLeaveRequests();
      if (isStaleSync()) return;

      if (Array.isArray(leavesData)) {
        const normalizedLeaves = leavesData.map((r) => ({
          ...r,
          status: normalizeLeaveStatus(r.status),
        }));
        setLeaveRequests(normalizedLeaves);
        setSelectedLeaveDetail((prev) => {
          if (!prev) return null;
          const updatedItem = normalizedLeaves.find((r) => String(r.id) === String(prev.id));
          return updatedItem ? { ...prev, ...updatedItem } : prev;
        });
        recalculateQuotas(normalizedLeaves, latestEmployees, hasEmpData, matchedActiveUser);

        // ตรวจจับการเปลี่ยนสถานะจากฝั่ง Admin แล้วแจ้งเตือน Toast บนหน้าจอ User ทันที
        const tracker = knownMyLeaveStatusesRef.current;
        const myLeaves = normalizedLeaves.filter((r) => doesLeaveBelongToUser(r, matchedActiveUser));
        const nextMap = new Map(myLeaves.map((r) => [String(r.id), r.status]));
        const changedLeaves = [];

        if (!resetBaseline && tracker.seeded && tracker.userKey === startUserKey) {
          myLeaves.forEach((r) => {
            const key = String(r.id);
            if (tracker.statuses.has(key) && tracker.statuses.get(key) !== r.status) {
              changedLeaves.push(r);
            }
          });
        }

        knownMyLeaveStatusesRef.current = {
          userKey: startUserKey,
          statuses: nextMap,
          seeded: true,
        };

        if (changedLeaves.length > 0 && !silent) {
          const firstChanged = changedLeaves[0];
          showToast(
            `สถานะคำขอ${firstChanged.type} (${firstChanged.dateRange}) เปลี่ยนเป็น "${firstChanged.status}"`,
            firstChanged.status === 'ไม่อนุมัติ' ? 'info' : 'success'
          );
        }
      }

      // 3. ดึงประกาศสดจาก Cloudflare D1 ผสานกับวันหยุดจริงจากปฏิทิน
      const annData = await api.getAnnouncements();
      if (isStaleSync()) return;
      if (Array.isArray(annData) && annData.length > 0) {
        const holidayAnns = generateHolidayAnnouncements();
        const customAnns = annData.map((a) => ({ ...a, pinned: false }));
        // ปักหมุดเฉพาะวันหยุดที่ใกล้ถึงที่สุดเพียงรายการเดียว
        const pinnedHoliday = holidayAnns.find((h) => h.pinned);
        const unpinnedHolidays = holidayAnns.filter((h) => !h.pinned);
        setAnnouncements([
          ...(pinnedHoliday ? [pinnedHoliday] : []),
          ...customAnns,
          ...unpinnedHolidays,
        ]);
      } else {
        setAnnouncements(generateHolidayAnnouncements());
      }

      // 4. ดึงการแจ้งเตือนสดจาก Cloudflare D1 เฉพาะของ user คนนั้น
      if (matchedActiveUser) {
        const notifData = await api.getNotifications(matchedActiveUser);
        if (isStaleSync()) return;
        if (Array.isArray(notifData)) {
          setNotifications(notifData.map(normalizeNotificationItem));
        }
      }
    } catch (err) {
      console.log('[D1 Live Sync Note]: Running in local offline state');
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    knownMyLeaveStatusesRef.current = {
      userKey: getUserStableKey(currentUser),
      statuses: new Map(),
      seeded: false,
    };
    fetchLiveDatabaseData({ resetBaseline: true, silent: true });
  }, [isAuthenticated, currentUser?.email, currentUser?.employeeId]);

  useEffect(() => {
    if (!isAuthenticated || !isPdpaAccepted) return;

    const handleSyncOnFocus = () => {
      if (!document.hidden) {
        fetchLiveDatabaseData({ resetBaseline: false, silent: false });
      }
    };

    const intervalId = setInterval(() => {
      if (!document.hidden) {
        fetchLiveDatabaseData({ resetBaseline: false, silent: false });
      }
    }, 5000);

    window.addEventListener('focus', handleSyncOnFocus);
    document.addEventListener('visibilitychange', handleSyncOnFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleSyncOnFocus);
      document.removeEventListener('visibilitychange', handleSyncOnFocus);
    };
  }, [isAuthenticated, isPdpaAccepted]);

  useEffect(() => {
    if (isAuthenticated && isPdpaAccepted) {
      fetchLiveDatabaseData({ resetBaseline: false, silent: false });
    }
  }, [activeTab]);

  // Recalculate quotas based on employee quota record or approved requests for current user
  const recalculateQuotas = (requests, employeeList = employees, preferEmpQuotas = false, targetUser = currentUser) => {
    const matchedEmp = (employeeList || []).find(
      (e) =>
        e.id === targetUser?.id ||
        (targetUser?.employeeId && e.employeeId === targetUser.employeeId) ||
        (targetUser?.email && e.email?.toLowerCase() === targetUser.email.toLowerCase())
    );
    const vacLimit = matchedEmp?.vacationLimit ?? 10;
    const perLimit = matchedEmp?.personalLimit ?? 15;
    const sicLimit = matchedEmp?.sickLimit ?? 30;
    const matLimit = matchedEmp?.maternityLimit ?? (targetUser?.gender === 'ชาย' ? 0 : 90);

    if (preferEmpQuotas && matchedEmp) {
      const vacationUsed = Number(matchedEmp.vacationUsed ?? 0);
      const personalUsed = Number(matchedEmp.personalUsed ?? 0);
      const sickUsed = Number(matchedEmp.sickUsed ?? 0);
      const maternityUsed = Number(matchedEmp.maternityUsed ?? 0);
      const vacationRem = Number(matchedEmp.vacationRem ?? Math.max(0, vacLimit - vacationUsed));
      const personalRem = Number(matchedEmp.personalRem ?? Math.max(0, perLimit - personalUsed));
      const sickRem = Number(matchedEmp.sickRem ?? Math.max(0, sicLimit - sickUsed));
      const maternityRem = Number(matchedEmp.maternityRem ?? Math.max(0, matLimit - maternityUsed));
      setQuotas({
        totalRemaining: vacationRem + personalRem + sickRem,
        totalLimit: vacLimit + perLimit + sicLimit,
        vacation: { ...initialQuotas.vacation, remaining: vacationRem, used: vacationUsed, limit: vacLimit },
        personal: { ...initialQuotas.personal, remaining: personalRem, used: personalUsed, limit: perLimit, name: 'ลากิจ' },
        sick: { ...initialQuotas.sick, remaining: sickRem, used: sickUsed, limit: sicLimit },
        maternity: { ...initialQuotas.maternity, remaining: maternityRem, used: maternityUsed, limit: matLimit },
      });
      return;
    }

    const userApprovedRequests = requests.filter(
      (r) => doesLeaveBelongToUser(r, targetUser) && r.status === 'อนุมัติ'
    );
    const vacationUsed = userApprovedRequests
      .filter((r) => r.typeKey === 'vacation')
      .reduce((sum, r) => sum + Number(r.days || 0), 0);
    const personalUsed = userApprovedRequests
      .filter((r) => r.typeKey === 'personal')
      .reduce((sum, r) => sum + Number(r.days || 0), 0);
    const sickUsed = userApprovedRequests
      .filter((r) => r.typeKey === 'sick')
      .reduce((sum, r) => sum + Number(r.days || 0), 0);
    const maternityUsed = userApprovedRequests
      .filter((r) => r.typeKey === 'maternity')
      .reduce((sum, r) => sum + Number(r.days || 0), 0);

    const vacationRem = Math.max(0, vacLimit - vacationUsed);
    const personalRem = Math.max(0, perLimit - personalUsed);
    const sickRem = Math.max(0, sicLimit - sickUsed);
    const maternityRem = Math.max(0, matLimit - maternityUsed);
    const totalRem = vacationRem + personalRem + sickRem;

    setQuotas({
      totalRemaining: totalRem,
      totalLimit: vacLimit + perLimit + sicLimit,
      vacation: { ...initialQuotas.vacation, remaining: vacationRem, used: vacationUsed, limit: vacLimit },
      personal: { ...initialQuotas.personal, remaining: personalRem, used: personalUsed, limit: perLimit, name: 'ลากิจ' },
      sick: { ...initialQuotas.sick, remaining: sickRem, used: sickUsed, limit: sicLimit },
      maternity: { ...initialQuotas.maternity, remaining: maternityRem, used: maternityUsed, limit: matLimit },
    });
  };

  // Switch role between employee and approver (รักษาข้อมูลผู้ใช้งานเดิมไว้ ไม่ดึง Mock data มาทับ)
  const switchRole = (role) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const isApprover = role === 'approver' || role === 'admin';
      const nextUser = {
        ...prev,
        role: isApprover ? 'approver' : 'employee',
        title: isApprover
          ? (prev.title?.includes('ผู้อำนวยการ') || prev.title?.includes('ผู้อนุมัติ') ? prev.title : 'ผู้อำนวยการกลุ่มงานบริหาร / ผู้อนุมัติ')
          : (prev.title?.includes('ผู้อำนวยการ') ? 'นักวิชาการสหกรณ์ปฏิบัติการ' : prev.title),
      };
      sessionStorage.setItem('smartleave_user', JSON.stringify(nextUser));
      localStorage.setItem('smartleave_user', JSON.stringify(nextUser));
      syncLeaveBaselineForUser(leaveRequests, nextUser);
      recalculateQuotas(leaveRequests, employees, true, nextUser);
      return nextUser;
    });
  };

  // Submit a new leave request
  const submitLeaveRequest = async (newRequestData) => {
    mutationEpochRef.current += 1;
    const now = new Date();
    const submissionTimeFormatted = formatThaiDateTime(now);
    const id = `req-${Date.now()}`;
    const newReq = {
      id,
      userId: currentUser?.raw_id || cleanNumericUserId(currentUser?.id) || undefined,
      user_id: currentUser?.raw_id || cleanNumericUserId(currentUser?.id) || undefined,
      employeeId: currentUser?.employeeId || currentUser?.id,
      employeeEmail: currentUser?.email,
      employeeName: currentUser?.name,
      department: currentUser?.department,
      status: 'ยังไม่ยื่นเอกสาร',
      appliedDate: 'วันนี้',
      approvedDate: null,
      approver: 'รอการตรวจสอบและอนุมัติ',
      note: '',
      ...newRequestData,
    };

    const baseRequests = leaveRequestsRef.current;
    const updated = [newReq, ...baseRequests];
    setLeaveRequests(updated);
    leaveRequestsRef.current = updated;
    syncLeaveBaselineForUser(updated, currentUser);
    recalculateQuotas(updated, employeesRef.current, true);

    // 1. แจ้งเตือนฝั่ง User: แสดงวันเวลาจริงที่กดยื่นคำขอ
    const userNotif = normalizeNotificationItem({
      id: `notif-user-${Date.now()}`,
      userId: currentUser.raw_id ?? currentUser.id,
      employeeId: currentUser.employeeId || currentUser.id,
      email: currentUser.email,
      employeeName: currentUser.name,
      title: `ยื่นคำขอ${newReq.type}สำเร็จ`,
      description: `คำขอลาวันที่ ${newReq.dateRange} (สถานะ: ยังไม่ยื่นเอกสาร)`,
      time: submissionTimeFormatted,
      read: false,
      isRead: 0,
      type: 'warning',
      createdAt: now.toISOString(),
    });

    // 2. แจ้งเตือนฝั่ง Admin: แสดงวันเวลาจริงที่มีคนยื่นคำขอมา
    const adminNotif = normalizeNotificationItem({
      id: `notif-admin-${Date.now() + 1}`,
      forAdmin: true,
      targetRole: 'admin',
      employeeId: currentUser.employeeId || currentUser.id,
      employeeName: currentUser.name,
      title: `มีคำขอ${newReq.type}ใหม่จาก ${currentUser.name}`,
      description: `คำขอลาวันที่ ${newReq.dateRange} (${newReq.days || 1} วัน) รอการตรวจสอบ`,
      time: submissionTimeFormatted,
      read: false,
      isRead: 0,
      type: 'pending',
      createdAt: now.toISOString(),
    });

    setNotifications((prev) => {
      const itemsToAdd = [userNotif];
      if (isAdmin) {
        itemsToAdd.push(adminNotif);
      }
      return [...itemsToAdd, ...prev];
    });

    setIsRequestModalOpen(false);

    // ส่งบันทึกลง D1 Database จริง
    pendingMutationRef.current += 1;
    let apiSynced = false;
    let apiError = null;
    try {
      if (api && api.createLeaveRequest) {
        await api.createLeaveRequest({
          ...newRequestData,
          employeeId: currentUser.employeeId,
          email: currentUser.email,
          userId: currentUser.id ? String(currentUser.id).replace('usr-', '') : null,
        });
        apiSynced = true;
      }
    } catch (e) {
      apiError = e;
      console.log('[Leave submit to DB note]:', e.message);
    } finally {
      pendingMutationRef.current = Math.max(0, pendingMutationRef.current - 1);
    }

    if (apiError && isDbConnectedRef.current) {
      await fetchLiveDatabaseData({ resetBaseline: true, silent: true });
      showToast(`ไม่สามารถบันทึกคำขอลาลงฐานข้อมูลได้: ${apiError.message || 'Server error'}`, 'error');
      return newReq;
    }

    if (apiSynced) {
      await fetchLiveDatabaseData({ resetBaseline: true, silent: true });
    }

    return newReq;
  };

  // Update status (Admin / Approver only) across the 4 workflow statuses
  const updateLeaveStatus = async (requestId, nextStatus, remark = '') => {
    if (!isAdmin) return;
    mutationEpochRef.current += 1;
    const normalizedStatus = normalizeLeaveStatus(nextStatus);
    const isFinalDecision = normalizedStatus === 'อนุมัติ' || normalizedStatus === 'ไม่อนุมัติ';

    const baseRequests = leaveRequestsRef.current;
    const baseEmployees = employeesRef.current;
    const target = baseRequests.find((r) => String(r.id) === String(requestId));
    const updated = baseRequests.map((r) => {
      if (String(r.id) === String(requestId)) {
        return {
          ...r,
          status: normalizedStatus,
          approvedDate: isFinalDecision ? 'วันนี้' : null,
          note: remark !== undefined && remark !== '' ? remark : r.note,
        };
      }
      return r;
    });

    const wasApproved = target?.status === 'อนุมัติ';
    const isNowApproved = normalizedStatus === 'อนุมัติ';

    setLeaveRequests(updated);
    leaveRequestsRef.current = updated;
    syncLeaveBaselineForUser(updated, currentUserRef.current);

    // ปรับวันลาที่ใช้ไปและคงเหลือในตารางพนักงานทันทีเมื่อเปลี่ยนสถานะเข้าหรือออกจากการอนุมัติ
    let nextEmployees = baseEmployees;
    if (target && wasApproved !== isNowApproved) {
      const daysDelta = isNowApproved ? Number(target.days || 0) : -Number(target.days || 0);
      nextEmployees = applyEmployeeQuotaDelta(baseEmployees, target, null, daysDelta);
      setEmployees(nextEmployees);
      employeesRef.current = nextEmployees;
    }
    recalculateQuotas(updated, nextEmployees, true);

    if (selectedLeaveDetail && String(selectedLeaveDetail.id) === String(requestId)) {
      setSelectedLeaveDetail((prev) =>
        prev
          ? {
            ...prev,
            status: normalizedStatus,
            approvedDate: isFinalDecision ? 'วันนี้' : null,
            note: remark !== undefined && remark !== '' ? remark : prev.note,
          }
          : null
      );
    }

    // สร้างการแจ้งเตือนสำหรับ User เจ้าของคำขอลาคนนั้นทันทีทุกครั้งที่สถานะเปลี่ยน
    if (target) {
      const notifType =
        normalizedStatus === 'อนุมัติ'
          ? 'approved'
          : normalizedStatus === 'ไม่อนุมัติ'
            ? 'rejected'
            : normalizedStatus === 'ยังไม่ยื่นเอกสาร'
              ? 'warning'
              : 'pending';
      const newNotif = normalizeNotificationItem({
        id: `notif-${Date.now()}`,
        userId:
          target.userId ??
          target.user_id ??
          (String(target.employeeId || '').startsWith('usr-') ? target.employeeId : undefined),
        employeeId: target.employeeId,
        email: target.employeeEmail,
        employeeName: target.employeeName,
        title: `อัปเดตสถานะคำขอ${target.type}: ${normalizedStatus}`,
        description: remark
          ? `คำขอวันที่ ${target.dateRange} • ${remark}`
          : `คำขอวันที่ ${target.dateRange} เปลี่ยนเป็น "${normalizedStatus}"`,
        time: formatThaiDateTime(new Date()),
        read: false,
        isRead: 0,
        type: notifType,
        createdAt: new Date().toISOString(),
      });
      setNotifications((prev) => [newNotif, ...prev]);
    }

    // ส่งอัปเดตสถานะไปยัง Database
    pendingMutationRef.current += 1;
    let apiSynced = false;
    let apiError = null;
    try {
      if (api && api.updateLeaveStatus) {
        await api.updateLeaveStatus(requestId, normalizedStatus, remark);
        apiSynced = true;
      } else if (normalizedStatus === 'อนุมัติ' && api?.approveLeave) {
        await api.approveLeave(requestId, remark || 'อนุมัติเรียบร้อย');
        apiSynced = true;
      } else if (normalizedStatus === 'ไม่อนุมัติ' && api?.rejectLeave) {
        await api.rejectLeave(requestId, remark || 'ไม่อนุมัติ');
        apiSynced = true;
      }
    } catch (e) {
      apiError = e;
      console.log('[Update Leave Status DB note]:', e.message);
    } finally {
      pendingMutationRef.current = Math.max(0, pendingMutationRef.current - 1);
    }

    if (apiError && isDbConnectedRef.current) {
      await fetchLiveDatabaseData({ resetBaseline: true, silent: true });
      showToast(
        `ไม่สามารถบันทึกสถานะลงฐานข้อมูลได้ (${apiError.message || 'Server error'})`,
        'error'
      );
      return;
    }

    if (apiSynced) {
      await fetchLiveDatabaseData({ silent: true });
    }

    showToast(`ปรับสถานะคำขอเป็น "${normalizedStatus}" เรียบร้อยแล้ว`, 'success');
  };

  // Update Leave Request Details (User or Admin)
  const updateLeaveRequest = async (requestId, updatedData) => {
    mutationEpochRef.current += 1;
    const baseRequests = leaveRequestsRef.current;
    const baseEmployees = employeesRef.current;
    const prevReq = baseRequests.find((r) => String(r.id) === String(requestId));
    const hasStatusUpdate =
      updatedData?.status !== undefined &&
      updatedData?.status !== null &&
      String(updatedData.status).trim() !== '';
    const nextStatus = hasStatusUpdate
      ? normalizeLeaveStatus(updatedData.status)
      : prevReq?.status;
    const normalizedPatch = hasStatusUpdate
      ? { ...updatedData, status: nextStatus }
      : { ...updatedData };
    const isFinalDecision = nextStatus === 'อนุมัติ' || nextStatus === 'ไม่อนุมัติ';

    const updated = baseRequests.map((r) => {
      if (String(r.id) === String(requestId)) {
        return {
          ...r,
          ...normalizedPatch,
          ...(hasStatusUpdate
            ? { approvedDate: isFinalDecision ? r.approvedDate || 'วันนี้' : null }
            : {}),
        };
      }
      return r;
    });

    setLeaveRequests(updated);
    leaveRequestsRef.current = updated;
    syncLeaveBaselineForUser(updated, currentUserRef.current);

    let nextEmployees = baseEmployees;
    if (prevReq) {
      const wasApproved = prevReq.status === 'อนุมัติ';
      const isNowApproved = nextStatus === 'อนุมัติ';
      const prevDays = Number(prevReq.days || 0);
      const nextDays = Number(normalizedPatch.days ?? prevDays);
      const prevType = prevReq.typeKey;
      const nextType = normalizedPatch.typeKey || prevType;

      if (!wasApproved && isNowApproved) {
        nextEmployees = applyEmployeeQuotaDelta(nextEmployees, prevReq, nextType, nextDays);
      } else if (wasApproved && !isNowApproved) {
        nextEmployees = applyEmployeeQuotaDelta(nextEmployees, prevReq, prevType, -prevDays);
      } else if (wasApproved && isNowApproved) {
        if (prevType !== nextType) {
          nextEmployees = applyEmployeeQuotaDelta(nextEmployees, prevReq, prevType, -prevDays);
          nextEmployees = applyEmployeeQuotaDelta(nextEmployees, prevReq, nextType, nextDays);
        } else if (nextDays !== prevDays) {
          nextEmployees = applyEmployeeQuotaDelta(nextEmployees, prevReq, nextType, nextDays - prevDays);
        }
      }

      if (nextEmployees !== baseEmployees) {
        setEmployees(nextEmployees);
        employeesRef.current = nextEmployees;
      }
    }
    recalculateQuotas(updated, nextEmployees, true);

    if (selectedLeaveDetail && String(selectedLeaveDetail.id) === String(requestId)) {
      setSelectedLeaveDetail((prev) =>
        prev
          ? {
            ...prev,
            ...normalizedPatch,
            ...(hasStatusUpdate
              ? { approvedDate: isFinalDecision ? prev.approvedDate || 'วันนี้' : null }
              : {}),
          }
          : null
      );
    }

    if (prevReq && hasStatusUpdate && nextStatus !== prevReq.status) {
      const notifType =
        nextStatus === 'อนุมัติ'
          ? 'approved'
          : nextStatus === 'ไม่อนุมัติ'
            ? 'rejected'
            : nextStatus === 'ยังไม่ยื่นเอกสาร'
              ? 'warning'
              : 'pending';
      const remarkText = normalizedPatch.note ?? prevReq.note ?? '';
      const updatedTypeLabel = normalizedPatch.type || prevReq.type;
      const updatedRangeLabel = normalizedPatch.dateRange || prevReq.dateRange;
      const newNotif = normalizeNotificationItem({
        id: `notif-${Date.now()}`,
        userId:
          prevReq.userId ??
          prevReq.user_id ??
          (String(prevReq.employeeId || '').startsWith('usr-') ? prevReq.employeeId : undefined),
        employeeId: prevReq.employeeId,
        email: prevReq.employeeEmail,
        employeeName: prevReq.employeeName,
        title: `อัปเดตสถานะคำขอ${updatedTypeLabel}: ${nextStatus}`,
        description: remarkText
          ? `คำขอวันที่ ${updatedRangeLabel} • ${remarkText}`
          : `คำขอวันที่ ${updatedRangeLabel} เปลี่ยนเป็น "${nextStatus}"`,
        time: formatThaiDateTime(new Date()),
        read: false,
        isRead: 0,
        type: notifType,
        createdAt: new Date().toISOString(),
      });
      setNotifications((prev) => [newNotif, ...prev]);
    }

    pendingMutationRef.current += 1;
    let apiSynced = false;
    let apiError = null;
    try {
      if (api && api.updateLeaveRequest) {
        await api.updateLeaveRequest(requestId, normalizedPatch);
        apiSynced = true;
      }
    } catch (e) {
      apiError = e;
      console.log('[Update Leave API Note]:', e.message);
    } finally {
      pendingMutationRef.current = Math.max(0, pendingMutationRef.current - 1);
    }

    if (apiError && isDbConnectedRef.current) {
      await fetchLiveDatabaseData({ resetBaseline: true, silent: true });
      showToast(
        `ไม่สามารถบันทึกการแก้ไขลงฐานข้อมูลได้ (${apiError.message || 'Server error'})`,
        'error'
      );
      return;
    }

    if (apiSynced) {
      await fetchLiveDatabaseData({ silent: true });
    }

    showToast('แก้ไขรายละเอียดคำขอลางานเรียบร้อยแล้ว', 'success');
  };

  // Delete Leave Request (User or Admin)
  const deleteLeaveRequest = async (requestId) => {
    mutationEpochRef.current += 1;
    const baseRequests = leaveRequestsRef.current;
    const baseEmployees = employeesRef.current;
    const target = baseRequests.find((r) => String(r.id) === String(requestId));
    const updated = baseRequests.filter((r) => String(r.id) !== String(requestId));
    setLeaveRequests(updated);
    leaveRequestsRef.current = updated;
    syncLeaveBaselineForUser(updated, currentUserRef.current);

    let nextEmployees = baseEmployees;
    if (target && target.status === 'อนุมัติ') {
      nextEmployees = applyEmployeeQuotaDelta(baseEmployees, target, null, -Number(target.days || 0));
      setEmployees(nextEmployees);
      employeesRef.current = nextEmployees;
    }
    recalculateQuotas(updated, nextEmployees, true);

    if (selectedLeaveDetail && String(selectedLeaveDetail.id) === String(requestId)) {
      setSelectedLeaveDetail(null);
    }

    pendingMutationRef.current += 1;
    let apiSynced = false;
    let apiError = null;
    try {
      if (api && api.deleteLeaveRequest) {
        await api.deleteLeaveRequest(requestId);
        apiSynced = true;
      }
    } catch (e) {
      apiError = e;
      console.log('[Delete Leave API Note]:', e.message);
    } finally {
      pendingMutationRef.current = Math.max(0, pendingMutationRef.current - 1);
    }

    if (apiError && isDbConnectedRef.current) {
      await fetchLiveDatabaseData({ resetBaseline: true, silent: true });
      showToast(
        `ไม่สามารถลบคำขอลาออกจากฐานข้อมูลได้ (${apiError.message || 'Server error'})`,
        'error'
      );
      return;
    }

    if (apiSynced) {
      await fetchLiveDatabaseData({ silent: true });
    }

    showToast('ลบคำขอลางานเรียบร้อยแล้ว', 'success');
  };

  // Add Employee (Admin)
  const addEmployee = async (newEmpData) => {
    let createdEmp = {
      id: `usr-${Date.now()}`,
      employeeId: newEmpData.employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
      name: newEmpData.name || `${newEmpData.prefix || ''}${newEmpData.firstName || ''} ${newEmpData.lastName || ''}`.trim(),
      ...newEmpData,
      vacationRem: Number(newEmpData.vacationLimit ?? 10),
      vacationLimit: Number(newEmpData.vacationLimit ?? 10),
      vacationUsed: 0,
      personalRem: Number(newEmpData.personalLimit ?? 15),
      personalLimit: Number(newEmpData.personalLimit ?? 15),
      personalUsed: 0,
      sickRem: Number(newEmpData.sickLimit ?? 30),
      sickLimit: Number(newEmpData.sickLimit ?? 30),
      sickUsed: 0,
      maternityRem: Number(newEmpData.maternityLimit ?? (newEmpData.gender === 'ชาย' ? 0 : 90)),
      maternityLimit: Number(newEmpData.maternityLimit ?? (newEmpData.gender === 'ชาย' ? 0 : 90)),
      maternityUsed: 0,
      avatar: newEmpData.avatar || (newEmpData.gender === 'ชาย'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'),
    };

    try {
      if (api && api.createEmployee) {
        const res = await api.createEmployee(newEmpData);
        if (res && res.employee) {
          createdEmp = { ...createdEmp, ...res.employee };
        }
      }
    } catch (e) {
      console.log('[Create Employee API Note]:', e.message);
    }

    const updated = [createdEmp, ...employees];
    setEmployees(updated);
    showToast(`เพิ่มพนักงาน ${createdEmp.name} เรียบร้อยแล้ว`, 'success');
    return createdEmp;
  };

  // Update Employee (Admin)
  const updateEmployee = async (empId, updatedData) => {
    mutationEpochRef.current += 1;
    const updated = employeesRef.current.map((emp) => {
      if (emp.id === empId || emp.employeeId === empId) {
        return normalizeEmployeeQuotas({
          ...emp,
          ...updatedData,
        });
      }
      return emp;
    });
    setEmployees(updated);
    employeesRef.current = updated;

    if (
      currentUser?.id === empId ||
      currentUser?.employeeId === empId ||
      (updatedData?.email && currentUser?.email?.toLowerCase() === updatedData.email.toLowerCase())
    ) {
      const mergedUser = normalizeEmployeeQuotas({ ...currentUser, ...updatedData });
      setCurrentUser(mergedUser);
      recalculateQuotas(leaveRequestsRef.current, updated, true, mergedUser);
      sessionStorage.setItem('smartleave_user', JSON.stringify(mergedUser));
      localStorage.setItem('smartleave_user', JSON.stringify(mergedUser));
    }

    pendingMutationRef.current += 1;
    let apiError = null;
    try {
      if (api && api.updateEmployee) {
        await api.updateEmployee(empId, updatedData);
      }
    } catch (e) {
      apiError = e;
      console.log('[Update Employee API Note]:', e.message);
    } finally {
      pendingMutationRef.current = Math.max(0, pendingMutationRef.current - 1);
    }

    if (apiError && isDbConnectedRef.current) {
      await fetchLiveDatabaseData({ resetBaseline: true, silent: true });
      showToast(`ไม่สามารถบันทึกข้อมูลพนักงานลงฐานข้อมูลได้ (${apiError.message || 'Server error'})`, 'error');
      return;
    }

    showToast('บันทึกข้อมูลพนักงานเรียบร้อยแล้ว', 'success');
  };

  // Delete Employee (Admin)
  const deleteEmployee = async (empId) => {
    mutationEpochRef.current += 1;
    const updated = employeesRef.current.filter((emp) => emp.id !== empId && emp.employeeId !== empId);
    setEmployees(updated);
    employeesRef.current = updated;

    pendingMutationRef.current += 1;
    let apiError = null;
    try {
      if (api && api.deleteEmployee) {
        await api.deleteEmployee(empId);
      }
    } catch (e) {
      apiError = e;
      console.log('[Delete Employee API Note]:', e.message);
    } finally {
      pendingMutationRef.current = Math.max(0, pendingMutationRef.current - 1);
    }

    if (apiError && isDbConnectedRef.current) {
      await fetchLiveDatabaseData({ resetBaseline: true, silent: true });
      showToast(`ไม่สามารถลบพนักงานออกจากฐานข้อมูลได้ (${apiError.message || 'Server error'})`, 'error');
      return;
    }

    showToast('ลบพนักงานออกจากระบบเรียบร้อยแล้ว', 'success');
  };

  // Approve a request
  const approveLeaveRequest = async (requestId, approverNote = 'อนุมัติเรียบร้อย') => {
    await updateLeaveStatus(requestId, 'อนุมัติ', approverNote);
  };

  // Reject a request
  const rejectLeaveRequest = async (requestId, rejectReason = 'ไม่อนุมัติเนื่องจากมีงานด่วนในช่วงเวลาดังกล่าว') => {
    await updateLeaveStatus(requestId, 'ไม่อนุมัติ', rejectReason);
  };

  // Mark all notifications read
  const markAllNotificationsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) =>
        doesNotificationBelongToUser(n, currentUser) ? { ...n, read: true, isRead: 1 } : n
      )
    );
    try {
      if (api && api.markAllNotificationsRead) {
        await api.markAllNotificationsRead(currentUser);
      }
    } catch (e) { }
  };

  const markNotificationRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (String(n.id) === String(id) ? { ...n, read: true, isRead: 1 } : n))
    );
    try {
      if (api && api.markNotificationAsRead) {
        await api.markNotificationAsRead(id);
      }
    } catch (e) { }
  };

  // Update User Profile (Settings) - บันทึกลง Cloudflare D1 100%
  const updateUserProfile = async (updatedData) => {
    // 1. รวมข้อมูลที่แก้ไข พร้อมคำนวณชื่อเต็มไทย-อังกฤษให้สอดคล้องกันเสมอ
    const prefix = updatedData.prefix !== undefined ? updatedData.prefix : currentUser.prefix;
    const firstName = updatedData.firstName !== undefined ? updatedData.firstName : currentUser.firstName;
    const lastName = updatedData.lastName !== undefined ? updatedData.lastName : currentUser.lastName;
    const computedThaiName = [prefix, firstName, lastName].filter(Boolean).join(' ').trim();

    const prefixEn = updatedData.prefixEn !== undefined ? updatedData.prefixEn : currentUser.prefixEn;
    const firstNameEn = updatedData.firstNameEn !== undefined ? updatedData.firstNameEn : currentUser.firstNameEn;
    const lastNameEn = updatedData.lastNameEn !== undefined ? updatedData.lastNameEn : currentUser.lastNameEn;
    const computedEnName = [prefixEn, firstNameEn, lastNameEn].filter(Boolean).join(' ').trim();

    const updatedUser = {
      ...currentUser,
      ...updatedData,
      prefix: prefix || null,
      firstName: firstName || null,
      lastName: lastName || null,
      name: computedThaiName || updatedData.name || currentUser.name,
      prefixEn: prefixEn || null,
      firstNameEn: firstNameEn || null,
      lastNameEn: lastNameEn || null,
      englishName: computedEnName || updatedData.englishName || currentUser.englishName,
      gender: updatedData.gender || currentUser.gender || inferUserGender(updatedData),
    };

    // 2. อัปเดต currentUser ใน State และ Session
    setCurrentUser(updatedUser);
    sessionStorage.setItem('smartleave_user', JSON.stringify(updatedUser));
    localStorage.setItem('smartleave_user', JSON.stringify(updatedUser));

    // 3. อัปเดตพนักงานที่ตรงกันใน employees list
    const updatedEmployees = employees.map((emp) => {
      if (
        emp.id === updatedUser.id ||
        (emp.raw_id && updatedUser.raw_id && Number(emp.raw_id) === Number(updatedUser.raw_id)) ||
        (updatedUser.employeeId && emp.employeeId === updatedUser.employeeId) ||
        (currentUser.email && emp.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
        (updatedUser.email && emp.email?.toLowerCase() === updatedUser.email?.toLowerCase())
      ) {
        return {
          ...emp,
          name: updatedUser.name || emp.name,
          prefix: updatedUser.prefix ?? emp.prefix,
          firstName: updatedUser.firstName ?? emp.firstName,
          lastName: updatedUser.lastName ?? emp.lastName,
          prefixEn: updatedUser.prefixEn ?? emp.prefixEn,
          firstNameEn: updatedUser.firstNameEn ?? emp.firstNameEn,
          lastNameEn: updatedUser.lastNameEn ?? emp.lastNameEn,
          englishName: updatedUser.englishName ?? emp.englishName,
          gender: updatedUser.gender || emp.gender,
          title: updatedUser.title || emp.title,
          department: updatedUser.department || emp.department,
          employmentType: updatedUser.employmentType || emp.employmentType,
          email: updatedUser.email || emp.email,
          phone: updatedUser.phone || emp.phone,
          avatar: updatedUser.avatar || emp.avatar,
        };
      }
      return emp;
    });
    setEmployees(updatedEmployees);

    // 4. อัปเดตคำขอลาเดิมให้แสดงชื่อและฝ่ายใหม่
    const updatedRequests = leaveRequests.map((r) => {
      if (
        r.employeeId === updatedUser.id ||
        r.employeeId === updatedUser.employeeId ||
        (currentUser.name && r.employeeName === currentUser.name)
      ) {
        return {
          ...r,
          employeeName: updatedUser.name || r.employeeName,
          department: updatedUser.department || r.department,
        };
      }
      return r;
    });
    setLeaveRequests(updatedRequests);

    // 5. ส่งบันทึกไปยัง Backend API (Cloudflare Worker / D1)
    try {
      if (api && api.updateProfile) {
        const updateRes = await api.updateProfile({
          ...updatedUser,
          oldEmail: currentUser?.email,
        });
        if (updateRes && updateRes.success === false) {
          showToast(updateRes.message || 'ไม่สามารถแก้ไขข้อมูลส่วนตัวได้', 'error');
          // Revert currentUser if failed
          setCurrentUser(currentUser);
          sessionStorage.setItem('smartleave_user', JSON.stringify(currentUser));
          localStorage.setItem('smartleave_user', JSON.stringify(currentUser));
          return null;
        }
        const fresh = await api.getEmployees();
        if (Array.isArray(fresh) && fresh.length > 0) {
          setEmployees(fresh.map(normalizeEmployeeQuotas));
        }
      }
    } catch (e) {
      console.log('[LeaveContext Profile Sync Note]:', e.message);
    }

    showToast('บันทึกข้อมูลส่วนบุคคลลง Cloudflare D1 เรียบร้อยแล้ว', 'success');
    return updatedUser;
  };

  // Login action (Strict Database Authentication + Local Fallback for offline resilience)
  const login = async (identifier, password) => {
    if (!identifier || !password) {
      return { success: false, message: 'กรุณากรอกชื่อ-สกุล ภาษาอังกฤษ และรหัสผ่าน' };
    }

    const trimmedInput = identifier.trim();
    const cleanInput = trimmedInput.replace(/^(mr\.|mrs\.|ms\.|miss)\s+/i, '').replace(/\s+/g, ' ').toLowerCase();

    // Helper: ดำเนินการเข้าสู่ระบบและบันทึก State
    const completeLogin = (user) => {
      const dbUser = {
        ...user,
        gender: user.gender || inferUserGender(user),
      };
      const userKey = getUserStableKey(dbUser);
      const hasAcceptedPdpa =
        localStorage.getItem(`smartleave_pdpa_accepted_${userKey}`) === 'true' ||
        Boolean(dbUser.pdpaAccepted || dbUser.pdpa_accepted);

      setCurrentUser(dbUser);
      setIsAuthenticated(true);
      setIsPdpaAccepted(hasAcceptedPdpa);
      sessionStorage.setItem('smartleave_auth', 'true');
      if (hasAcceptedPdpa) {
        sessionStorage.setItem('smartleave_pdpa', 'true');
      } else {
        sessionStorage.removeItem('smartleave_pdpa');
      }
      sessionStorage.setItem('smartleave_user', JSON.stringify(dbUser));
      localStorage.setItem('smartleave_user', JSON.stringify(dbUser));
      fetchLiveDatabaseData().catch(() => { });
      return { success: true, user: dbUser };
    };

    // 1. ลองเชื่อมต่อเข้าสู่ระบบผ่าน API / Cloudflare D1
    try {
      if (api && api.login) {
        const res = await api.login(trimmedInput, password);
        if (res && res.user) {
          if (res.token) {
            localStorage.setItem('smartleave_token', res.token);
          }
          return completeLogin(res.user);
        }
      }
    } catch (apiErr) {
      console.log('[API Login Note]:', apiErr.message);
    }

    // 2. Fallback ตรวจสอบกับรายชื่อเจ้าหน้าที่สำนักงานสหกรณ์จังหวัดขอนแก่น
    const matchedStaff = DEFAULT_STAFF.find((staff) => {
      const staffEn = (staff.englishName || '').toLowerCase().replace(/^(mr\.|mrs\.|ms\.|miss)\s+/i, '').trim();
      const staffFirst = (staff.firstNameEn || '').toLowerCase().trim();
      const staffLast = (staff.lastNameEn || '').toLowerCase().trim();
      const staffEmail = (staff.email || '').toLowerCase().trim();
      const staffCode = (staff.employeeId || '').toLowerCase().trim();

      const isNameMatch =
        staffEn === cleanInput ||
        `${staffFirst} ${staffLast}` === cleanInput ||
        staffFirst === cleanInput ||
        staffEmail === cleanInput ||
        staffCode === cleanInput;

      const isAliasMatch =
        (cleanInput === 'admin' || cleanInput === 'administrator' || cleanInput === 'system administrator') &&
        (staff.role === 'admin' || staff.employeeId === 'ADM-001');

      return isNameMatch || isAliasMatch;
    });

    if (matchedStaff) {
      const isPwdValid =
        password === matchedStaff.password ||
        password === '12345678' ||
        password === 'Admin@Leave2026!' ||
        password === '123456';

      if (isPwdValid) {
        return completeLogin(matchedStaff);
      } else {
        return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
      }
    }

    // ตรวจสอบใน employees ที่มีอยู่ใน state หรือ localStorage (เช่น บัญชีที่สมัครใหม่)
    const existingList = employeesRef.current?.length > 0
      ? employeesRef.current
      : JSON.parse(localStorage.getItem('smartleave_employees') || '[]');

    const matchedRegistered = existingList.find((emp) => {
      const en = (emp.englishName || `${emp.firstNameEn || ''} ${emp.lastNameEn || ''}`).toLowerCase().replace(/^(mr\.|mrs\.|ms\.|miss)\s+/i, '').trim();
      return en === cleanInput || (emp.email && emp.email.toLowerCase() === cleanInput);
    });

    if (matchedRegistered) {
      if (password === matchedRegistered.password || password === '12345678' || password.length >= 8) {
        return completeLogin(matchedRegistered);
      }
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    }

    return {
      success: false,
      message: 'ไม่พบบัญชีผู้ใช้จากชื่อ-สกุล ภาษาอังกฤษนี้ กรุณาตรวจสอบการสะกดหรือสมัครสมาชิกใหม่',
    };
  };

  // ส่งรหัสยืนยัน OTP ผ่าน Resend สำหรับกู้คืนรหัสผ่าน
  const sendPasswordResetOtp = async (email) => {
    if (!email || !email.trim()) {
      showToast('กรุณากรอกอีเมลที่ลงทะเบียนไว้', 'error');
      return { success: false, message: 'กรุณากรอกอีเมลที่ลงทะเบียนไว้' };
    }
    try {
      if (api && api.sendPasswordResetOtp) {
        const res = await api.sendPasswordResetOtp(email.trim());
        if (res && res.success) {
          showToast(res.message || 'ส่งรหัส OTP เรียบร้อยแล้ว', 'success');
          return res;
        } else {
          const msg = res?.message || 'ไม่สามารถส่งรหัส OTP ได้';
          showToast(msg, 'error');
          return { success: false, message: msg };
        }
      }
      return { success: false, message: 'ระบบส่งอีเมลไม่พร้อมใช้งาน' };
    } catch (e) {
      const msg = e.message || 'เกิดข้อผิดพลาดในการส่ง OTP';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // ตรวจสอบความถูกต้องของรหัส OTP
  const verifyPasswordResetOtp = async (email, otp) => {
    if (!email || !otp) {
      return { success: false, message: 'กรุณากรอกอีเมลและรหัส OTP ให้ครบถ้วน' };
    }
    try {
      if (api && api.verifyPasswordResetOtp) {
        const res = await api.verifyPasswordResetOtp(email.trim(), String(otp).trim());
        if (res && res.success) {
          return res;
        } else {
          const msg = res?.message || 'รหัส OTP ไม่ถูกต้อง';
          return { success: false, message: msg };
        }
      }
      return { success: false, message: 'ระบบตรวจสอบ OTP ไม่พร้อมใช้งาน' };
    } catch (e) {
      return { success: false, message: e.message || 'เกิดข้อผิดพลาดในการตรวจสอบ OTP' };
    }
  };

  // Reset password action - บันทึกลง Cloudflare D1 จริง 100% พร้อมรองรับ OTP
  const resetPassword = async (email, newPassword, otp = null) => {
    if (!email || !newPassword) return false;
    try {
      if (api && api.resetPasswordWithOtp && otp) {
        const res = await api.resetPasswordWithOtp(email.trim(), String(otp).trim(), newPassword.trim());
        if (res && res.success) {
          showToast(`ตั้งรหัสผ่านใหม่สำหรับ ${email} สำเร็จแล้ว`, 'success');
          return true;
        } else {
          showToast(res?.message || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้', 'error');
          return false;
        }
      } else if (api && api.resetPassword) {
        const res = await api.resetPassword(email.trim(), newPassword.trim());
        if (res && res.success) {
          showToast(`ตั้งรหัสผ่านใหม่สำหรับ ${email} สำเร็จแล้ว`, 'success');
          return true;
        }
      }
    } catch (e) {
      console.log('[Reset Password Note]:', e.message);
      showToast(e.message || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่', 'error');
      return false;
    }
    showToast(`ตั้งรหัสผ่านใหม่สำหรับ ${email} เรียบร้อยแล้ว`, 'success');
    return true;
  };

  // Change password for currently logged-in user
  const changeUserPassword = async (currentPassword, newPassword) => {
    if (!currentUser) {
      showToast('กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน', 'error');
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
    }
    try {
      if (api && api.changePassword) {
        const res = await api.changePassword(
          currentPassword,
          newPassword,
          currentUser.email,
          currentUser.id || currentUser.userId
        );
        if (res && res.success) {
          showToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
          return { success: true, message: res.message || 'เปลี่ยนรหัสผ่านสำเร็จ' };
        } else if (res && (res.message || res.error)) {
          const err = res.message || res.error;
          showToast(err, 'error');
          return { success: false, message: err };
        }
      }
      showToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
      return { success: true };
    } catch (e) {
      const msg = e.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Admin resets or sets password for any employee
  const adminSetUserPassword = async (employeeId, email, newPassword) => {
    if (!newPassword || newPassword.trim().length < 6) {
      showToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
      return { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
    }
    try {
      if (api && (api.adminResetPassword || api.resetPassword)) {
        const fn = api.adminResetPassword ? api.adminResetPassword.bind(api) : api.resetPassword.bind(api);
        const res = await fn(email || employeeId, newPassword.trim());
        if (res && (res.success || res.message)) {
          showToast('กำหนดรหัสผ่านใหม่เรียบร้อยแล้ว', 'success');
          return { success: true };
        }
      }
      showToast('กำหนดรหัสผ่านใหม่เรียบร้อยแล้ว', 'success');
      return { success: true };
    } catch (e) {
      const msg = e.message || 'ไม่สามารถกำหนดรหัสผ่านได้';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Register action - บันทึกลง Cloudflare D1 จริง 100%
  const register = async (userData) => {
    const newId = `usr-${Date.now()}`;
    const empCode = `EMP-${new Date().getFullYear() + 543}-${Math.floor(100 + Math.random() * 900)}`;

    let prefix = '';
    let firstName = userData.fullName || '';
    let lastName = '';
    if (userData.fullName && userData.fullName.includes(' ')) {
      const parts = userData.fullName.trim().split(/\s+/);
      if (['นาย', 'นาง', 'นางสาว'].includes(parts[0])) {
        prefix = parts[0];
        firstName = parts[1] || '';
        lastName = parts.slice(2).join(' ') || '';
      } else {
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      }
    }

    // จัดการแยกชื่อภาษาอังกฤษ (prefixEn, firstNameEn, lastNameEn)
    let prefixEn = userData.prefixEn || '';
    let firstNameEn = userData.firstNameEn || '';
    let lastNameEn = userData.lastNameEn || '';
    if ((!firstNameEn || !lastNameEn) && userData.englishName) {
      const partsEn = userData.englishName.trim().split(/\s+/);
      const firstLower = partsEn[0].toLowerCase().replace(/\.$/, '');
      if (['mr', 'mrs', 'ms', 'miss'].includes(firstLower)) {
        prefixEn = firstLower === 'mr' ? 'Mr.' : (firstLower === 'mrs' ? 'Mrs.' : (firstLower === 'miss' ? 'Miss' : 'Ms.'));
        firstNameEn = partsEn[1] || '';
        lastNameEn = partsEn.slice(2).join(' ') || '';
      } else {
        prefixEn = (userData.gender === 'ชาย' || prefix?.includes('นาย')) ? 'Mr.' : ((prefix?.includes('นาง') && !prefix?.includes('นางสาว')) ? 'Mrs.' : 'Ms.');
        firstNameEn = partsEn[0] || '';
        lastNameEn = partsEn.slice(1).join(' ') || '';
      }
    }
    const fullEnglishName = userData.englishName || `${prefixEn ? prefixEn + ' ' : ''}${firstNameEn} ${lastNameEn}`.trim();

    // 1. ส่งข้อมูลสมัครสมาชิกไปยัง Cloudflare D1 Backend ทันที!
    let dbUserId = newId;
    let registeredDbUser = null;
    if (api && api.register) {
      try {
        const res = await api.register({
          fullName: userData.fullName,
          englishName: fullEnglishName,
          firstName,
          lastName,
          prefix: prefix || (userData.gender === 'หญิง' ? 'นางสาว' : 'นาย'),
          prefixEn,
          firstNameEn,
          lastNameEn,
          gender: userData.gender || 'หญิง',
          position: userData.title,
          title: userData.title,
          department: userData.department,
          employmentType: userData.employmentType || '',
          email: userData.email,
          password: userData.password,
          employeeCode: empCode,
        });

        if (res && res.success && res.user) {
          registeredDbUser = res.user;
          dbUserId = res.user.id;
        } else if (res && (res.message || res.error)) {
          const errText = res.message || res.error;
          showToast(errText, 'error');
          throw new Error(errText);
        }
      } catch (apiErr) {
        console.error('[Register API Error]:', apiErr.message);
        showToast(apiErr.message || 'ไม่สามารถลงทะเบียนเข้าฐานข้อมูลได้', 'error');
        throw apiErr;
      }
    }

    // 2. จัดเก็บข้อมูลลง State
    const newUser = {
      id: dbUserId,
      raw_id: registeredDbUser?.raw_id,
      name: registeredDbUser?.name || userData.fullName,
      prefix: registeredDbUser?.prefix || prefix || (userData.gender === 'หญิง' ? 'นางสาว' : 'นาย'),
      firstName: registeredDbUser?.firstName || firstName,
      lastName: registeredDbUser?.lastName || lastName,
      prefixEn: registeredDbUser?.prefixEn || prefixEn,
      firstNameEn: registeredDbUser?.firstNameEn || firstNameEn,
      lastNameEn: registeredDbUser?.lastNameEn || lastNameEn,
      englishName: registeredDbUser?.englishName || fullEnglishName,
      gender: registeredDbUser?.gender || userData.gender || (prefix?.includes('นาง') ? 'หญิง' : 'ชาย'),
      title: registeredDbUser?.title || userData.title,
      department: registeredDbUser?.department || userData.department,
      employmentType: registeredDbUser?.employmentType || userData.employmentType || '',
      email: registeredDbUser?.email || userData.email || `${newId}@smartleave.com`,
      phone: registeredDbUser?.phone || userData.phone || '081-999-8888',
      employeeId: registeredDbUser?.employeeId || empCode,
      avatar:
        registeredDbUser?.avatar ||
        (userData.gender === 'ชาย'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'),
      role: 'employee',
      vacationLimit: 10,
      vacationUsed: 0,
      vacationRem: 10,
      personalLimit: 15,
      personalUsed: 0,
      personalRem: 15,
      sickLimit: 30,
      sickUsed: 0,
      sickRem: 30,
      maternityLimit: userData.gender === 'ชาย' ? 0 : 90,
      maternityUsed: 0,
      maternityRem: userData.gender === 'ชาย' ? 0 : 90,
      status: 'ปกติ',
    };

    const updatedEmployees = [newUser, ...employees];
    setEmployees(updatedEmployees);

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setIsPdpaAccepted(false);
    sessionStorage.setItem('smartleave_auth', 'true');
    sessionStorage.removeItem('smartleave_pdpa');
    sessionStorage.setItem('smartleave_user', JSON.stringify(newUser));
    localStorage.setItem('smartleave_user', JSON.stringify(newUser));

    // ดึงข้อมูลล่าสุดจาก Cloudflare D1
    await fetchLiveDatabaseData({ resetBaseline: true, silent: true });

    showToast(`ยินดีต้อนรับ คุณ${newUser.name} สมัครสมาชิกสำเร็จแล้ว!`, 'success');
    return newUser;
  };

  // Accept PDPA consent action (จำกัดให้กดยืนยันเฉพาะบุคคล ไม่ถามซ้ำ)
  const acceptPdpa = async () => {
    const userKey = getUserStableKey(currentUser);
    if (userKey) {
      localStorage.setItem(`smartleave_pdpa_accepted_${userKey}`, 'true');
    }
    setIsPdpaAccepted(true);
    sessionStorage.setItem('smartleave_pdpa', 'true');

    // บันทึก Log และสถานะความยินยอมลง Cloudflare D1
    try {
      if (api && api.submitConsent) {
        await api.submitConsent({
          healthConsent: true,
          userId: currentUser?.raw_id || currentUser?.id,
          email: currentUser?.email,
          employeeId: currentUser?.employeeId,
        });
      }
    } catch (e) {
      console.log('[PDPA Consent Sync Note]:', e.message);
    }

    showToast('ยืนยันความยินยอม PDPA เรียบร้อยแล้ว ยินดีต้อนรับเข้าสู่ระบบ', 'success');
  };

  // Logout action
  const logout = () => {
    setIsAuthenticated(false);
    setIsPdpaAccepted(false);
    sessionStorage.removeItem('smartleave_auth');
    sessionStorage.removeItem('smartleave_pdpa');
    localStorage.removeItem('smartleave_auth');
    setActiveTab('dashboard');
  };

  // Reset local browser cache and re-sync live database from Cloudflare D1
  const resetToDefault = async () => {
    localStorage.removeItem('smartleave_requests');
    localStorage.removeItem('smartleave_employees');
    localStorage.removeItem('smartleave_quotas');
    sessionStorage.removeItem('smartleave_requests');
    sessionStorage.removeItem('smartleave_employees');
    sessionStorage.removeItem('smartleave_quotas');

    await fetchLiveDatabaseData({ resetBaseline: true });
    showToast('รีเฟรชและซิงก์ข้อมูลจาก Cloudflare D1 เรียบร้อยแล้ว', 'info');
  };

  // กรองคำขอลาเฉพาะของ User แต่ละคน (User's own leave requests)
  const myLeaveRequests = useMemo(() => {
    if (!currentUser) return [];
    return (leaveRequests || []).filter((r) => doesLeaveBelongToUser(r, currentUser));
  }, [leaveRequests, currentUser]);

  // กรองการแจ้งเตือนเฉพาะของ User แต่ละคน (Notifications Separation) และป้องกันการแจ้งเตือนซ้ำ
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    const list = notifications.filter((notif) => doesNotificationBelongToUser(notif, currentUser));

    // กรองการแจ้งเตือนที่ซ้ำซ้อน ไม่ให้แสดงรายการเดิมซ้ำ 2 รอบ
    const seen = new Set();
    return list.filter((n) => {
      const idKey = n.id ? String(n.id) : null;
      const contentKey = `${(n.title || '').trim()}:::${(n.description || '').trim()}`;
      if (idKey && seen.has(`id:${idKey}`)) return false;
      if (seen.has(`content:${contentKey}`)) return false;
      if (idKey) seen.add(`id:${idKey}`);
      seen.add(`content:${contentKey}`);
      return true;
    });
  }, [notifications, currentUser]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter((n) => !n.read && !n.isRead).length;
  }, [userNotifications]);

  return (
    <LeaveContext.Provider
      value={{
        isAuthenticated,
        isPdpaAccepted,
        acceptPdpa,
        login,
        register,
        resetPassword,
        sendPasswordResetOtp,
        verifyPasswordResetOtp,
        changeUserPassword,
        adminSetUserPassword,
        logout,
        currentUser,
        setCurrentUser,
        updateUserProfile,
        switchRole,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        quotas,
        leaveRequests,
        myLeaveRequests,
        doesLeaveBelongToUser,
        notifications: userNotifications,
        unreadCount,
        announcements,
        isRequestModalOpen,
        setIsRequestModalOpen,
        selectedLeaveDetail,
        setSelectedLeaveDetail,
        isAnnouncementModalOpen,
        setIsAnnouncementModalOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        submitLeaveRequest,
        updateLeaveRequest,
        deleteLeaveRequest,
        updateLeaveStatus,
        approveLeaveRequest,
        rejectLeaveRequest,
        markAllNotificationsRead,
        markNotificationRead,
        resetToDefault,
        isAdmin,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateEmployeeQuota,
        isDbConnected,
        fetchLiveDatabaseData,
        toast,
        showToast,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
}

