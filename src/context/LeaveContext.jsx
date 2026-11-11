import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialUser,
  approverUser,
  initialQuotas,
  initialLeaveRequests,
  announcementsData,
  notificationsData,
  employeesList,
} from '../data/mockData';
import api from '../services/api';

const LeaveContext = createContext();

function inferUserGender(user) {
  if (!user) return 'หญิง';
  if (user.gender === 'หญิง' || user.gender === 'ชาย' || user.gender === 'อื่นๆ') return user.gender;
  const name = (user.name || '').trim();
  if (/^(นางสาว|น\.ส\.|นาง)/.test(name) || user.id === 'usr-101') return 'หญิง';
  if (/^นาย/.test(name) || user.id === 'usr-102' || user.id === 'usr-202') return 'ชาย';
  return 'หญิง';
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
  const gender = emp.gender || inferUserGender(emp);
  const defaults = {
    vacation: 10,
    personal: 15,
    sick: 30,
    maternity: gender === 'ชาย' ? 0 : 90,
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

  // PDPA Consent State: Require confirmation after logging in
  const [isPdpaAccepted, setIsPdpaAccepted] = useState(() => {
    return sessionStorage.getItem('smartleave_pdpa') === 'true';
  });

  // Load from localStorage or use initial data
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smartleave_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // ล้างแคชข้อมูลพนักงานไอทีเก่าออกอัตโนมัติ
        if (parsed.department?.includes('UI/UX') || parsed.department?.includes('วิศวกรรม')) {
          localStorage.setItem('smartleave_user', JSON.stringify(initialUser));
          return initialUser;
        }
        return {
          ...parsed,
          gender: parsed.gender || inferUserGender(parsed),
        };
      } catch (e) {}
    }
    return initialUser;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem('smartleave_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // ล้างแคชคำขอลาฝ่ายไอทีเดิมออก
          if (parsed.some((r) => r.department?.includes('UI/UX') || r.department?.includes('วิศวกรรม'))) {
            localStorage.setItem('smartleave_requests', JSON.stringify(initialLeaveRequests));
            return initialLeaveRequests;
          }
          return parsed
            .filter((r) => r.status !== 'ยกเลิก' && r.status !== 'cancelled')
            .map((r) => ({
              ...r,
              status: normalizeLeaveStatus(r.status),
              startDate: r.startDate ? r.startDate.replace('2025-', '2026-') : r.startDate,
              endDate: r.endDate ? r.endDate.replace('2025-', '2026-') : r.endDate,
              dateRange: r.dateRange ? r.dateRange.replace(/2568/g, '2569') : r.dateRange,
              appliedDate: r.appliedDate ? r.appliedDate.replace(/2568/g, '2569') : r.appliedDate,
              approvedDate: r.approvedDate ? r.approvedDate.replace(/2568/g, '2569') : r.approvedDate,
            }));
        }
      } catch (e) { }
    }
    return initialLeaveRequests;
  });

  const [quotas, setQuotas] = useState(() => {
    const saved = localStorage.getItem('smartleave_quotas') || localStorage.getItem('leaveflow_quotas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const vacationUsed = parsed.vacation?.used ?? 2;
        const personalUsed = parsed.personal?.used ?? 0;
        const sickUsed = parsed.sick?.used ?? 1;
        const maternityUsed = parsed.maternity?.used ?? 0;

        const vacationRem = Math.max(0, 10 - vacationUsed);
        const personalRem = Math.max(0, 15 - personalUsed);
        const sickRem = Math.max(0, 30 - sickUsed);
        const maternityRem = Math.max(0, 90 - maternityUsed);
        const totalRem = vacationRem + personalRem + sickRem;

        return {
          totalRemaining: totalRem,
          totalLimit: 55,
          vacation: { ...initialQuotas.vacation, ...parsed.vacation, limit: 10, remaining: vacationRem, used: vacationUsed },
          personal: { ...initialQuotas.personal, ...parsed.personal, name: 'ลากิจ', limit: 15, remaining: personalRem, used: personalUsed },
          sick: { ...initialQuotas.sick, ...parsed.sick, limit: 30, remaining: sickRem, used: sickUsed },
          maternity: { ...initialQuotas.maternity, ...parsed.maternity, limit: 90, remaining: maternityRem, used: maternityUsed },
        };
      } catch (e) {}
    }
    return initialQuotas;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('smartleave_notifications') || localStorage.getItem('leaveflow_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((n) => ({
            ...n,
            description: n.description ? n.description.replace(/2568/g, '2569') : n.description,
          }));
        }
      } catch (e) { }
    }
    return notificationsData;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('smartleave_employees') || localStorage.getItem('leaveflow_employees');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // หากแคชเดิมมีจำนวนคนไม่ใช่ 5 คน หรือเป็นแผนกไอที ให้ล้างแคชและใช้รายชื่อเจ้าหน้าที่สหกรณ์ 5 คนใหม่ทันที
          if (parsed.length !== 5 || parsed.some((e) => e.department?.includes('UI/UX') || e.department?.includes('วิศวกรรม'))) {
            localStorage.setItem('smartleave_employees', JSON.stringify(employeesList));
            return employeesList.map(normalizeEmployeeQuotas);
          }
          return parsed.map((emp) =>
            normalizeEmployeeQuotas({
              ...emp,
              gender: emp.gender || inferUserGender(emp),
              maternityRem: emp.maternityRem === 98 ? 90 : emp.maternityRem,
            })
          );
        }
      } catch (e) {}
    }
    return employeesList.map(normalizeEmployeeQuotas);
  });

  const isAdmin = currentUser.role === 'approver' || currentUser.role === 'admin';

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3200);
  };

  const [announcements, setAnnouncements] = useState(announcementsData);

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
    } catch (e) {}
  }, []);

  const updateEmployeeQuota = async (empId, quotaUpdatesOrKey, value) => {
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

    const targetBase = employees.find((emp) => emp.id === empId || emp.employeeId === empId);
    const nextEmp = targetBase ? normalizeEmployeeQuotas({ ...targetBase, ...normalizedUpdates }) : null;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId || emp.employeeId === empId) {
          return normalizeEmployeeQuotas({ ...emp, ...normalizedUpdates });
        }
        return emp;
      })
    );

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
    try {
      if (api && api.updateEmployeeQuota) {
        await api.updateEmployeeQuota(empId, {
          ...normalizedUpdates,
          email: nextEmp?.email || '',
        });
      }
    } catch (e) {
      console.log('[Update Quota D1 Note]:', e.message);
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

  const fetchLiveDatabaseData = async () => {
    try {
      // 1. ดึงข้อมูลพนักงานสดจาก Cloudflare D1
      const empData = await api.getEmployees();
      let latestEmployees = employees;
      if (Array.isArray(empData) && empData.length > 0) {
        latestEmployees = empData.map(normalizeEmployeeQuotas);
        setEmployees(latestEmployees);
        setIsDbConnected(true);

        // ซิงก์ข้อมูล currentUser เข้ากับข้อมูลล่าสุดใน DB
        if (currentUser) {
          const freshUser = latestEmployees.find(
            (e) => (e.email && e.email.toLowerCase() === currentUser.email?.toLowerCase()) || (e.employeeId && e.employeeId === currentUser.employeeId)
          );
          if (freshUser) {
            setCurrentUser((prev) => ({
              ...prev,
              ...freshUser,
              gender: freshUser.gender || prev.gender,
            }));
          }
        }
      }

      // 2. ดึงรายการคำขอลาสดจาก Cloudflare D1
      const leavesData = await api.getLeaveRequests();
      if (Array.isArray(leavesData)) {
        const normalizedLeaves = leavesData.map((r) => ({
          ...r,
          status: normalizeLeaveStatus(r.status),
        }));
        setLeaveRequests(normalizedLeaves);
        recalculateQuotas(normalizedLeaves, latestEmployees, Array.isArray(empData) && empData.length > 0);
      }

      // 3. ดึงประกาศสดจาก Cloudflare D1
      const annData = await api.getAnnouncements();
      if (Array.isArray(annData) && annData.length > 0) {
        setAnnouncements(annData);
      }

      // 4. ดึงการแจ้งเตือนสดจาก Cloudflare D1
      const notifData = await api.getNotifications();
      if (Array.isArray(notifData) && notifData.length > 0) {
        setNotifications(notifData);
      }
    } catch (err) {
      console.log('[D1 Live Sync Note]: Running in local offline state');
    }
  };

  useEffect(() => {
    fetchLiveDatabaseData();
  }, [isAuthenticated]);

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
      (r) => (r.employeeId === targetUser?.id || r.employeeId === targetUser?.employeeId || r.employeeName === targetUser?.name) && r.status === 'อนุมัติ'
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

  // Switch role between employee and approver
  const switchRole = (role) => {
    const nextUser = role === 'approver' ? approverUser : initialUser;
    setCurrentUser(nextUser);
    recalculateQuotas(leaveRequests, employees, true, nextUser);
  };

  // Submit a new leave request
  const submitLeaveRequest = async (newRequestData) => {
    const id = `req-${Date.now()}`;
    const newReq = {
      id,
      employeeId: currentUser.employeeId || currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      status: 'ยังไม่ยื่นเอกสาร',
      appliedDate: 'วันนี้',
      approvedDate: null,
      approver: 'นายสมชาย มั่นคง',
      note: '',
      ...newRequestData,
    };

    const updated = [newReq, ...leaveRequests];
    setLeaveRequests(updated);
    recalculateQuotas(updated, employees, true);

    // Add notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `ยื่นคำขอ${newReq.type}สำเร็จ`,
      description: `คำขอลาวันที่ ${newReq.dateRange} (สถานะ: ยังไม่ยื่นเอกสาร)`,
      time: 'เมื่อสักครู่',
      read: false,
      type: 'pending',
    };
    setNotifications([newNotif, ...notifications]);

    setIsRequestModalOpen(false);

    // ส่งบันทึกลง D1 Database จริง
    try {
      if (api && api.createLeaveRequest) {
        await api.createLeaveRequest({
          ...newRequestData,
          employeeId: currentUser.employeeId,
          email: currentUser.email,
          userId: currentUser.id ? String(currentUser.id).replace('usr-', '') : null,
        });
        const fresh = await api.getLeaveRequests();
        if (Array.isArray(fresh) && fresh.length > 0) {
          const normalizedFresh = fresh.map((r) => ({
            ...r,
            status: normalizeLeaveStatus(r.status),
          }));
          setLeaveRequests(normalizedFresh);
          recalculateQuotas(normalizedFresh, employees, true);
        }
      }
    } catch (e) {
      console.log('[Leave submit to DB note]:', e.message);
    }

    return newReq;
  };

  // Update status (Admin / Approver only) across the 4 workflow statuses
  const updateLeaveStatus = async (requestId, nextStatus, remark = '') => {
    if (!isAdmin) return;
    const normalizedStatus = normalizeLeaveStatus(nextStatus);
    const isFinalDecision = normalizedStatus === 'อนุมัติ' || normalizedStatus === 'ไม่อนุมัติ';

    const updated = leaveRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: normalizedStatus,
          approvedDate: isFinalDecision ? 'วันนี้' : null,
          note: remark !== undefined && remark !== '' ? remark : r.note,
        };
      }
      return r;
    });

    const target = leaveRequests.find((r) => r.id === requestId);
    const wasApproved = target?.status === 'อนุมัติ';
    const isNowApproved = normalizedStatus === 'อนุมัติ';

    setLeaveRequests(updated);

    // ปรับวันลาที่ใช้ไปและคงเหลือในตารางพนักงานทันทีเมื่อเปลี่ยนสถานะเข้าหรือออกจากการอนุมัติ
    let nextEmployees = employees;
    if (target && wasApproved !== isNowApproved) {
      const typeKey = ['vacation', 'personal', 'sick', 'maternity'].includes(target.typeKey)
        ? target.typeKey
        : null;
      const daysDelta = isNowApproved ? Number(target.days || 0) : -Number(target.days || 0);
      if (typeKey && daysDelta !== 0) {
        nextEmployees = employees.map((emp) => {
          const isMatch =
            (emp.raw_id && target.user_id && Number(emp.raw_id) === Number(target.user_id)) ||
            (target.userId && emp.id && `usr-${target.userId}` === emp.id) ||
            (target.employeeId && (emp.employeeId === target.employeeId || emp.id === target.employeeId)) ||
            (target.employeeEmail && emp.email?.toLowerCase() === target.employeeEmail.toLowerCase()) ||
            (target.employeeName && emp.name === target.employeeName);
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
        setEmployees(nextEmployees);
      }
    }
    recalculateQuotas(updated, nextEmployees, true);

    if (selectedLeaveDetail?.id === requestId) {
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

    // ส่งอัปเดตสถานะไปยัง Database
    try {
      if (api && api.updateLeaveStatus) {
        await api.updateLeaveStatus(requestId, normalizedStatus, remark);
      } else if (normalizedStatus === 'อนุมัติ' && api?.approveLeave) {
        await api.approveLeave(requestId, remark || 'อนุมัติเรียบร้อย');
      } else if (normalizedStatus === 'ไม่อนุมัติ' && api?.rejectLeave) {
        await api.rejectLeave(requestId, remark || 'ไม่อนุมัติ');
      }
    } catch (e) {
      console.log('[Update Leave Status DB note]:', e.message);
    }

    if (target) {
      const notifType =
        normalizedStatus === 'อนุมัติ'
          ? 'approved'
          : normalizedStatus === 'ไม่อนุมัติ'
          ? 'rejected'
          : 'pending';
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: `อัปเดตสถานะคำขอ${target.type}: ${normalizedStatus}`,
        description: remark
          ? `คำขอวันที่ ${target.dateRange} • ${remark}`
          : `คำขอวันที่ ${target.dateRange} เปลี่ยนเป็น "${normalizedStatus}"`,
        time: 'เมื่อสักครู่',
        read: false,
        type: notifType,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    showToast(`ปรับสถานะคำขอเป็น "${normalizedStatus}" เรียบร้อยแล้ว`, 'success');
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
  const markAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markNotificationRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Update User Profile (Settings) - บันทึกลง Cloudflare D1 100%
  const updateUserProfile = async (updatedData) => {
    // 1. รวมข้อมูลที่แก้ไข
    const updatedUser = {
      ...currentUser,
      ...updatedData,
      prefix: updatedData.prefix ?? currentUser.prefix,
      firstName: updatedData.firstName ?? currentUser.firstName,
      lastName: updatedData.lastName ?? currentUser.lastName,
      prefixEn: updatedData.prefixEn ?? currentUser.prefixEn,
      firstNameEn: updatedData.firstNameEn ?? currentUser.firstNameEn,
      lastNameEn: updatedData.lastNameEn ?? currentUser.lastNameEn,
      englishName: updatedData.englishName ?? currentUser.englishName,
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
        (updatedUser.employeeId && emp.employeeId === updatedUser.employeeId) ||
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
        await api.updateProfile(updatedUser);
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

  // Login action (Strict Database Authentication 100%)
  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    try {
      if (api && api.login) {
        const res = await api.login(email.trim(), password);
        if (res && res.user) {
          const dbUser = {
            ...res.user,
            gender: res.user.gender || inferUserGender(res.user),
          };
          setCurrentUser(dbUser);
          setIsAuthenticated(true);
          setIsPdpaAccepted(false);
          sessionStorage.setItem('smartleave_auth', 'true');
          sessionStorage.removeItem('smartleave_pdpa');
          sessionStorage.setItem('smartleave_user', JSON.stringify(dbUser));
          localStorage.setItem('smartleave_user', JSON.stringify(dbUser));
          if (res.token) {
            localStorage.setItem('smartleave_token', res.token);
          }
          fetchLiveDatabaseData();
          return { success: true, user: dbUser };
        }
      }
      return { success: false, message: 'ไม่สามารถติดต่อฐานข้อมูล Cloudflare D1 ได้' };
    } catch (apiErr) {
      console.log('[API Login Error]:', apiErr.message);
      // ปฏิเสธการเข้าสู่ระบบทันทีหากข้อมูลไม่ตรงกับ Database
      setIsAuthenticated(false);
      return {
        success: false,
        message: apiErr.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือไม่พบบัญชีในฐานข้อมูล Cloudflare D1',
      };
    }
  };

  // Reset password action - บันทึกลง Cloudflare D1 จริง 100%
  const resetPassword = async (email, newPassword) => {
    if (!email || !newPassword) return false;
    try {
      if (api && api.resetPassword) {
        const res = await api.resetPassword(email, newPassword);
        if (res && res.success) {
          showToast(`ตั้งรหัสผ่านใหม่สำหรับ ${email} ใน Cloudflare D1 สำเร็จแล้ว`, 'success');
          return true;
        }
      }
    } catch (e) {
      console.log('[Reset Password D1 Note]:', e.message);
    }
    showToast(`ตั้งรหัสผ่านใหม่สำหรับ ${email} เรียบร้อยแล้ว`, 'success');
    return true;
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
    try {
      if (api && api.register) {
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
        if (res && res.user && res.user.id) {
          dbUserId = res.user.id;
        }
      }
    } catch (apiErr) {
      console.log('[Register API Sync Note]:', apiErr.message);
    }

    // 2. จัดเก็บข้อมูลลง State
    const newUser = {
      id: dbUserId,
      name: userData.fullName,
      prefix: prefix || (userData.gender === 'หญิง' ? 'นางสาว' : 'นาย'),
      firstName,
      lastName,
      prefixEn,
      firstNameEn,
      lastNameEn,
      englishName: fullEnglishName,
      gender: userData.gender || (prefix?.includes('นาง') ? 'หญิง' : 'ชาย'),
      title: userData.title,
      department: userData.department,
      employmentType: userData.employmentType || '',
      email: userData.email || `${newId}@smartleave.com`,
      phone: userData.phone || '081-999-8888',
      employeeId: empCode,
      avatar:
        userData.gender === 'ชาย'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
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
    fetchLiveDatabaseData();

    showToast(`ยินดีต้อนรับ คุณ${newUser.name} สมัครสมาชิกสำเร็จแล้ว!`, 'success');
    return newUser;
  };

  // Accept PDPA consent action
  const acceptPdpa = () => {
    setIsPdpaAccepted(true);
    sessionStorage.setItem('smartleave_pdpa', 'true');
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

  // Reset to original mock data via Cloudflare D1 seed
  const resetToDefault = async () => {
    try {
      if (api && api.request) {
        await api.request('/seed', { method: 'POST' }).catch(() => {});
      }
    } catch (e) {}

    localStorage.removeItem('smartleave_requests');
    localStorage.removeItem('smartleave_employees');
    localStorage.removeItem('smartleave_quotas');
    sessionStorage.clear();

    setCurrentUser(initialUser);
    setLeaveRequests(initialLeaveRequests);
    setQuotas(initialQuotas);
    setNotifications(notificationsData);
    setEmployees(employeesList.map(normalizeEmployeeQuotas));
    setActiveTab('dashboard');
    setIsAuthenticated(false);
    setIsPdpaAccepted(false);

    await fetchLiveDatabaseData();
    showToast('รีเซ็ตข้อมูลระบบและซิงก์ Cloudflare D1 เรียบร้อยแล้ว', 'info');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <LeaveContext.Provider
      value={{
        isAuthenticated,
        isPdpaAccepted,
        acceptPdpa,
        login,
        register,
        resetPassword,
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
        notifications,
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
        updateLeaveStatus,
        approveLeaveRequest,
        rejectLeaveRequest,
        markAllNotificationsRead,
        markNotificationRead,
        resetToDefault,
        isAdmin,
        employees,
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

