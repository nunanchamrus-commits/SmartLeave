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

export function LeaveProvider({ children }) {
  // Authentication State: Require login before reaching dashboard
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      localStorage.removeItem('leaveflow_auth');
    } catch (e) { }
    const saved = sessionStorage.getItem('smartleave_auth');
    return saved === 'true';
  });

  // Load from localStorage or use initial data
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smartleave_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem('smartleave_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r) => ({
            ...r,
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
        const maternityRem = Math.max(0, 98 - maternityUsed);
        const totalRem = vacationRem + personalRem + sickRem;

        return {
          totalRemaining: totalRem,
          totalLimit: 55,
          vacation: { ...initialQuotas.vacation, ...parsed.vacation, limit: 10, remaining: vacationRem, used: vacationUsed },
          personal: { ...initialQuotas.personal, ...parsed.personal, name: 'ลากิจ', limit: 15, remaining: personalRem, used: personalUsed },
          sick: { ...initialQuotas.sick, ...parsed.sick, limit: 30, remaining: sickRem, used: sickUsed },
          maternity: { ...initialQuotas.maternity, ...parsed.maternity, limit: 98, remaining: maternityRem, used: maternityUsed },
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
    return saved ? JSON.parse(saved) : employeesList;
  });

  const isAdmin = currentUser.role === 'approver' || currentUser.role === 'admin';

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3200);
  };

  const updateEmployeeQuota = (empId, quotaKey, value) => {
    const updated = employees.map((emp) => {
      if (emp.id === empId) {
        return { ...emp, [quotaKey]: Number(value) };
      }
      return emp;
    });
    setEmployees(updated);
    showToast('อัปเดตโควตาวันลาพนักงานเรียบร้อยแล้ว', 'success');
  };

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // PDPA States
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [healthConsent, setHealthConsent] = useState(() => {
    return localStorage.getItem('smartleave_pdpa_health') === 'true';
  });
  const [pdpaAuditLogs, setPdpaAuditLogs] = useState(() => {
    const saved = localStorage.getItem('smartleave_pdpa_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch initial leave requests from Cloudflare D1 Backend
  useEffect(() => {
    api.getLeaveRequests()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          console.log('[SmartLeave D1] Fetched live leave records:', data);
          setLeaveRequests(data);
          recalculateQuotas(data);
        }
      })
      .catch((err) => {
        console.log('[SmartLeave] Running in offline/mock mode:', err.message);
      });
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('smartleave_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('smartleave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('smartleave_quotas', JSON.stringify(quotas));
  }, [quotas]);

  useEffect(() => {
    localStorage.setItem('smartleave_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('smartleave_employees', JSON.stringify(employees));
  }, [employees]);

  // Recalculate quotas based on approved/pending requests for current user
  const recalculateQuotas = (requests) => {
    const userApprovedRequests = requests.filter(
      (r) => r.employeeId === 'usr-101' && r.status === 'อนุมัติ'
    );
    const vacationUsed = userApprovedRequests
      .filter((r) => r.typeKey === 'vacation')
      .reduce((sum, r) => sum + r.days, 0);
    const personalUsed = userApprovedRequests
      .filter((r) => r.typeKey === 'personal')
      .reduce((sum, r) => sum + r.days, 0);
    const sickUsed = userApprovedRequests
      .filter((r) => r.typeKey === 'sick')
      .reduce((sum, r) => sum + r.days, 0);
    const maternityUsed = userApprovedRequests
      .filter((r) => r.typeKey === 'maternity')
      .reduce((sum, r) => sum + r.days, 0);

    const vacationRem = Math.max(0, 10 - vacationUsed);
    const personalRem = Math.max(0, 15 - personalUsed);
    const sickRem = Math.max(0, 30 - sickUsed);
    const maternityRem = Math.max(0, 98 - maternityUsed);
    const totalRem = vacationRem + personalRem + sickRem;

    setQuotas({
      totalRemaining: totalRem,
      totalLimit: 55,
      vacation: { ...initialQuotas.vacation, remaining: vacationRem, used: vacationUsed, limit: 10 },
      personal: { ...initialQuotas.personal, remaining: personalRem, used: personalUsed, limit: 15, name: 'ลากิจ' },
      sick: { ...initialQuotas.sick, remaining: sickRem, used: sickUsed, limit: 30 },
      maternity: { ...initialQuotas.maternity, remaining: maternityRem, used: maternityUsed, limit: 98 },
    });
  };

  // Switch role between employee and approver
  const switchRole = (role) => {
    if (role === 'approver') {
      setCurrentUser(approverUser);
    } else {
      setCurrentUser(initialUser);
    }
  };

  // Submit a new leave request
  const submitLeaveRequest = (newRequestData) => {
    const id = `req-${Date.now()}`;
    const newReq = {
      id,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      status: 'รออนุมัติ',
      appliedDate: 'วันนี้',
      approvedDate: null,
      approver: 'นายสมชาย มั่นคง',
      note: '',
      ...newRequestData,
    };

    const updated = [newReq, ...leaveRequests];
    setLeaveRequests(updated);

    // Sync to Cloudflare D1 asynchronously
    api.createLeaveRequest({
      typeKey: newRequestData.typeKey || 'vacation',
      startDate: newRequestData.startDate,
      endDate: newRequestData.endDate,
      days: newRequestData.days || 1,
      reason: newRequestData.reason,
      substitute: newRequestData.substitute,
    }).catch((err) => console.log('[D1 Sync] Note:', err.message));

    // Add notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `ยื่นคำขอ${newReq.type}สำเร็จ`,
      description: `คำขอลาวันที่ ${newReq.dateRange} รอการอนุมัติจากผู้จัดการ`,
      time: 'เมื่อสักครู่',
      read: false,
      type: 'pending',
    };
    setNotifications([newNotif, ...notifications]);

    setIsRequestModalOpen(false);
    return newReq;
  };

  // Approve a request
  const approveLeaveRequest = (requestId, approverNote = 'อนุมัติเรียบร้อย') => {
    const updated = leaveRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'อนุมัติ',
          approvedDate: 'วันนี้',
          note: approverNote,
        };
      }
      return r;
    });

    setLeaveRequests(updated);
    recalculateQuotas(updated);

    // Sync to D1
    api.approveLeave(requestId, approverNote).catch(() => {});

    const target = leaveRequests.find((r) => r.id === requestId);
    if (target) {
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: `คำขอ${target.type}ได้รับการอนุมัติ`,
        description: `คำขอวันที่ ${target.dateRange} ได้รับการอนุมัติเรียบร้อย`,
        time: 'เมื่อสักครู่',
        read: false,
        type: 'approved',
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  // Reject a request
  const rejectLeaveRequest = (requestId, rejectReason = 'ไม่อนุมัติเนื่องจากมีงานด่วนในช่วงเวลาดังกล่าว') => {
    const updated = leaveRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'ไม่อนุมัติ',
          approvedDate: 'วันนี้',
          note: rejectReason,
        };
      }
      return r;
    });

    setLeaveRequests(updated);

    // Sync to D1
    api.rejectLeave(requestId, rejectReason).catch(() => {});

    const target = leaveRequests.find((r) => r.id === requestId);
    if (target) {
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: `คำขอ${target.type}ไม่ได้รับการอนุมัติ`,
        description: `เหตุผล: ${rejectReason}`,
        time: 'เมื่อสักครู่',
        read: false,
        type: 'rejected',
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  // Cancel a request (by employee)
  const cancelLeaveRequest = (requestId) => {
    const updated = leaveRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'ยกเลิก',
        };
      }
      return r;
    });
    setLeaveRequests(updated);
    recalculateQuotas(updated);
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

  // Update User Profile (Settings)
  const updateUserProfile = (updatedData) => {
    // 1. Merge with current user
    const updatedUser = {
      ...currentUser,
      ...updatedData,
    };

    // 2. Update currentUser state & localStorage
    setCurrentUser(updatedUser);
    localStorage.setItem('smartleave_user', JSON.stringify(updatedUser));

    // 3. Update matching employee in employees state & localStorage
    const updatedEmployees = employees.map((emp) => {
      if (
        emp.id === updatedUser.id ||
        (updatedUser.employeeId && emp.employeeId === updatedUser.employeeId) ||
        (updatedUser.email && emp.email?.toLowerCase() === updatedUser.email?.toLowerCase())
      ) {
        return {
          ...emp,
          name: updatedUser.name || emp.name,
          title: updatedUser.title || emp.title,
          department: updatedUser.department || emp.department,
          email: updatedUser.email || emp.email,
          phone: updatedUser.phone || emp.phone,
          avatar: updatedUser.avatar || emp.avatar,
        };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    localStorage.setItem('smartleave_employees', JSON.stringify(updatedEmployees));

    // 4. Update matching leaveRequests so past requests reflect the new name/department
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
    localStorage.setItem('smartleave_requests', JSON.stringify(updatedRequests));

    // 5. Try calling Cloudflare Worker / D1 API
    api.updateProfile(updatedUser).catch((err) => {
      console.log('[UpdateProfile D1 Fallback]:', err.message);
    });

    // 6. Show toast notification
    showToast('บันทึกข้อมูลส่วนบุคคลเรียบร้อยแล้ว', 'success');

    return updatedUser;
  };

  // Login action
  const login = (email, password) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();

    // Check if there is saved user data in localStorage to preserve profile updates
    let savedUser = null;
    try {
      const savedUserJson = localStorage.getItem('smartleave_user');
      if (savedUserJson) savedUser = JSON.parse(savedUserJson);
    } catch (e) {}

    let userToSet = initialUser;

    if (
      lowerEmail.includes('somchai') ||
      lowerEmail.includes('mgr') ||
      lowerEmail.includes('manager') ||
      lowerEmail.includes('admin')
    ) {
      userToSet = approverUser;
      if (savedUser && (savedUser.role === 'approver' || savedUser.role === 'admin' || savedUser.id === approverUser.id)) {
        userToSet = { ...approverUser, ...savedUser };
      }
    } else if (lowerEmail.includes('panika') || lowerEmail.includes('user')) {
      userToSet = initialUser;
      if (savedUser && (savedUser.role === 'employee' || savedUser.id === initialUser.id)) {
        userToSet = { ...initialUser, ...savedUser };
      }
    } else {
      // Look up in existing employees
      const matchedEmp = employees.find((e) => e.email?.toLowerCase() === lowerEmail);
      if (matchedEmp) {
        userToSet = {
          ...initialUser,
          ...matchedEmp,
        };
      } else {
        userToSet = {
          ...initialUser,
          email,
          name: email.split('@')[0],
        };
      }
    }

    setCurrentUser(userToSet);
    setIsAuthenticated(true);
    sessionStorage.setItem('smartleave_auth', 'true');
    localStorage.setItem('smartleave_user', JSON.stringify(userToSet));

    // เช็คการแสดง PDPA Modal ครั้งแรกหลังล็อกอิน
    const hasAgreed = localStorage.getItem('smartleave_pdpa_agreed');
    if (!hasAgreed) {
      setTimeout(() => {
        setIsPrivacyModalOpen(true);
      }, 500);
    }
    return true;
  };

  // Register action
  const register = (userData) => {
    const newId = `usr-${Date.now()}`;
    const newUser = {
      id: newId,
      name: userData.fullName,
      title: userData.title,
      department: userData.department,
      email: userData.email || `${newId}@smartleave.com`,
      phone: userData.phone || '081-999-8888',
      employeeId: `EMP-${new Date().getFullYear() + 543}-${Math.floor(100 + Math.random() * 900)}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      role: 'employee',
      vacationRem: 10,
      personalRem: 5,
      sickRem: 10,
      maternityRem: 98,
      status: 'ปกติ',
    };

    const updatedEmployees = [newUser, ...employees];
    setEmployees(updatedEmployees);
    localStorage.setItem('smartleave_employees', JSON.stringify(updatedEmployees));

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    sessionStorage.setItem('smartleave_auth', 'true');
    sessionStorage.setItem('smartleave_auth', 'true');
    localStorage.setItem('smartleave_user', JSON.stringify(newUser));

    showToast(`ยินดีต้อนรับ คุณ${newUser.name} สมัครสมาชิกสำเร็จแล้ว!`, 'success');
    return newUser;
  };

  // Logout action
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('smartleave_auth');
    localStorage.removeItem('smartleave_auth');
    setActiveTab('dashboard');
  };

  // Reset to original mock data
  const resetToDefault = () => {
    localStorage.clear();
    sessionStorage.clear();
    setCurrentUser(initialUser);
    setLeaveRequests(initialLeaveRequests);
    setQuotas(initialQuotas);
    setNotifications(notificationsData);
    setActiveTab('dashboard');
    setIsAuthenticated(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <LeaveContext.Provider
      value={{
        isAuthenticated,
        login,
        register,
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
        announcements: announcementsData,
        isRequestModalOpen,
        setIsRequestModalOpen,
        selectedLeaveDetail,
        setSelectedLeaveDetail,
        isAnnouncementModalOpen,
        setIsAnnouncementModalOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        cancelLeaveRequest,
        markAllNotificationsRead,
        markNotificationRead,
        resetToDefault,
        isAdmin,
        employees,
        updateEmployeeQuota,
        toast,
        showToast,
        isPrivacyModalOpen,
        setIsPrivacyModalOpen,
        healthConsent,
        setHealthConsent,
        pdpaAuditLogs,
        setPdpaAuditLogs,
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

