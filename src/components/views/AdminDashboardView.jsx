import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Building,
  FileDown,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { downloadLeaveSlipPdf, downloadCancelLeaveSlipPdf } from '../../utils/exportPdf';
import { getFiscalYearInfo } from '../../utils/thaiDate';
import StatusConfirmModal from '../StatusConfirmModal';
import EmptyState from '../EmptyState';

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export default function AdminDashboardView() {
  const {
    currentUser,
    leaveRequests,
    updateLeaveStatus,
    approveLeaveRequest,
    rejectLeaveRequest,
    setSelectedLeaveDetail,
    setActiveTab,
    employees,
    showToast,
    fetchLiveDatabaseData,
  } = useLeave();

  // ซิงก์ข้อมูลล่าสุดจากฐานข้อมูลเมื่อเข้าสู่หน้าแดชบอร์ด
  useEffect(() => {
    if (fetchLiveDatabaseData) {
      fetchLiveDatabaseData({ silent: true });
    }
  }, []);

  // State สำหรับ Pagination (5 รายการต่อหน้า)
  const [pendingPage, setPendingPage] = useState(1);
  const [leavesTodayPage, setLeavesTodayPage] = useState(1);

  // State สำหรับ Modal กดยืนยันการเปลี่ยนสถานะอีกรอบ
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    req: null,
    targetStatus: '',
    defaultRemark: '',
  });

  const handleOpenConfirm = (req, targetStatus) => {
    let defaultRemark = '';
    if (targetStatus === 'อนุมัติ') defaultRemark = 'อนุมัติเรียบร้อย';
    else if (targetStatus === 'ไม่อนุมัติ') defaultRemark = 'ไม่อนุมัติเนื่องจากมีภารกิจงานเร่งด่วน';
    else if (targetStatus === 'อยู่ระหว่างตรวจสอบ') defaultRemark = 'อยู่ระหว่างตรวจสอบเอกสาร';
    setConfirmModal({
      isOpen: true,
      req,
      targetStatus,
      defaultRemark,
    });
  };

  const handleCloseConfirm = () => {
    setConfirmModal({ isOpen: false, req: null, targetStatus: '', defaultRemark: '' });
  };

  const handleConfirmAction = async (finalRemark) => {
    if (!confirmModal.req) return;
    const { req, targetStatus } = confirmModal;
    const remark = finalRemark !== undefined ? finalRemark : confirmModal.defaultRemark;

    if (targetStatus === 'อนุมัติ') {
      await approveLeaveRequest(req.id, remark || 'อนุมัติเรียบร้อย');
    } else if (targetStatus === 'ไม่อนุมัติ') {
      await rejectLeaveRequest(req.id, remark || 'ไม่อนุมัติเนื่องจากมีภารกิจงานเร่งด่วน');
    } else {
      await updateLeaveStatus(req.id, targetStatus, remark || '');
    }

    handleCloseConfirm();
  };

  const now = new Date();
  const fiscalYearInfo = useMemo(() => getFiscalYearInfo(now), []);
  const currentYearBE = fiscalYearInfo.fiscalYearBE;
  const currentMonthYearBE = `${THAI_MONTHS_SHORT[now.getMonth()]} ${currentYearBE}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const pendingRequests = leaveRequests.filter(
    (r) => r.status === 'ยังไม่ยื่นเอกสาร' || r.status === 'อยู่ระหว่างตรวจสอบ' || r.status === 'รออนุมัติ'
  );
  const approvedRequests = leaveRequests.filter((r) => r.status === 'อนุมัติ' || r.status === 'approved');

  // คำนวณพนักงานที่ลางานในวันนี้จากข้อมูลจริงในฐานข้อมูล 100%
  const leavesToday = useMemo(() => {
    return (leaveRequests || []).filter((req) => {
      if (req.status !== 'อนุมัติ' && req.status !== 'approved') return false;
      if (!req.startDate || !req.endDate) return false;
      const start = String(req.startDate).slice(0, 10);
      const end = String(req.endDate).slice(0, 10);
      return todayStr >= start && todayStr <= end;
    });
  }, [leaveRequests, todayStr]);

  // คำนวณอัตราการใช้วันลาทั้งองค์กรจากฐานข้อมูลจริง
  const totalApprovedDays = useMemo(() => {
    return approvedRequests.reduce((sum, r) => sum + (Number(r.days) || 0), 0);
  }, [approvedRequests]);

  const totalUsedDays = useMemo(() => {
    return employees.reduce((sum, e) => {
      const vac = Number(e.vacationUsed) || 0;
      const per = Number(e.personalUsed) || 0;
      const sic = Number(e.sickUsed) || 0;
      return sum + vac + per + sic;
    }, 0);
  }, [employees]);

  const totalAllocatedQuota = useMemo(() => {
    return employees.reduce((sum, e) => {
      const vac = Number(e.vacationLimit) || 10;
      const per = Number(e.personalLimit) || (e.employmentType === 'พนักงานราชการ' ? 10 : 45);
      const sic = e.employmentType === 'พนักงานราชการ' || e.isSickAsActual || Number(e.sickLimit) === 999 ? 60 : (Number(e.sickLimit) || 60);
      return sum + vac + per + sic;
    }, 0);
  }, [employees]);

  const daysUsedForRate = totalUsedDays > 0 ? totalUsedDays : totalApprovedDays;
  const orgUtilizationRate = totalAllocatedQuota > 0
    ? ((daysUsedForRate / totalAllocatedQuota) * 100).toFixed(1)
    : '0.0';

  const workingTodayCount = Math.max(0, employees.length - leavesToday.length);
  const workingTodayPercent = employees.length > 0
    ? ((workingTodayCount / employees.length) * 100).toFixed(1)
    : '100.0';

  // Pagination สำหรับคิวคำขอด่วน (แสดง 5 รายการต่อหน้า)
  const PENDING_PAGE_SIZE = 5;
  const totalPendingPages = Math.max(1, Math.ceil(pendingRequests.length / PENDING_PAGE_SIZE));
  const currentPendingPage = Math.min(pendingPage, totalPendingPages);
  const paginatedPendingRequests = useMemo(() => {
    const start = (currentPendingPage - 1) * PENDING_PAGE_SIZE;
    return pendingRequests.slice(start, start + PENDING_PAGE_SIZE);
  }, [pendingRequests, currentPendingPage]);

  // Pagination สำหรับสถานะการลาประจำวัน (แสดง 5 รายการต่อหน้า)
  const LEAVES_TODAY_PAGE_SIZE = 5;
  const totalLeavesTodayPages = Math.max(1, Math.ceil(leavesToday.length / LEAVES_TODAY_PAGE_SIZE));
  const currentLeavesTodayPage = Math.min(leavesTodayPage, totalLeavesTodayPages);
  const paginatedLeavesToday = useMemo(() => {
    const start = (currentLeavesTodayPage - 1) * LEAVES_TODAY_PAGE_SIZE;
    return leavesToday.slice(start, start + LEAVES_TODAY_PAGE_SIZE);
  }, [leavesToday, currentLeavesTodayPage]);

  return (
    <div className="space-y-6">
      {/* 1. Admin Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2E6F4E] via-[#38845D] to-[#45966C] p-6 sm:p-8 text-white shadow-md border border-emerald-900/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center space-x-1 shadow-sm">
                <span>👑 ผู้ดูแลระบบและผู้อนุมัติ</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/70 text-emerald-100 border border-emerald-500/30">
                ประจำปีงบประมาณ {fiscalYearInfo.fiscalYearBE} ({fiscalYearInfo.roundTitle})
              </span>
              <span className="text-xs text-emerald-200/80 hidden sm:inline">Executive HR Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-prompt">
              ยินดีต้อนรับ {currentUser?.name || 'ผู้ดูแลระบบ'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-normal max-w-xl">
              ศูนย์กลางควบคุมการบริหารจัดการวันลา กำลังพล และการอนุมัติคำขอของบุคลากรทั้งองค์กร
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActiveTab('approver')}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-md transition-all group"
            >
              <Clock className="w-4 h-4" />
              <span>รอพิจารณา ({pendingRequests.length})</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/15 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>จัดการพนักงาน ({employees.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
        {/* Card 1: Pending Approvals */}
        <div
          onClick={() => setActiveTab('approver')}
          className="bento-card-interactive bg-gradient-to-br from-white via-amber-50/25 to-orange-50/30 rounded-3xl p-4 sm:p-5 shadow-xs border border-amber-100/90 hover:shadow-md hover:border-amber-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200/80 animate-pulse">
              ต้องดำเนินการ
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">คำขอที่รอตรวจสอบ/อนุมัติ</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-prompt mt-1">
              {pendingRequests.length} รายการ
            </h3>
            <p className="text-[10px] sm:text-[11px] text-amber-700 font-semibold mt-1 truncate">
              เปิดดูคิวรอพิจารณา ➔
            </p>
          </div>
        </div>

        {/* Card 2: On leave today (จากฐานข้อมูลจริง) */}
        <div className="bento-card-interactive bg-gradient-to-br from-white via-teal-50/25 to-emerald-50/30 rounded-3xl p-4 sm:p-5 shadow-xs border border-teal-100/90 hover:shadow-md hover:border-teal-300 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center shadow-2xs">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200/80">
              วันนี้
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">พนักงานที่ลาวันนี้</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-prompt mt-1">
              {leavesToday.length} คน
            </h3>
            <p
              className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate"
              title={leavesToday.length > 0 ? leavesToday.map((r) => `${r.employeeName || 'เจ้าหน้าที่'} (${r.type || 'ลา'})`).join(', ') : 'ไม่มีพนักงานลางานวันนี้'}
            >
              {leavesToday.length > 0
                ? leavesToday.map((r) => `${r.employeeName || 'เจ้าหน้าที่'} (${r.type || 'ลา'})`).join(', ')
                : 'ไม่มีพนักงานลาวันนี้'}
            </p>
          </div>
        </div>

        {/* Card 3: Total Headcount */}
        <div
          onClick={() => setActiveTab('employees')}
          className="bento-card-interactive bg-gradient-to-br from-white via-emerald-50/25 to-teal-50/30 rounded-3xl p-4 sm:p-5 shadow-xs border border-emerald-100/90 hover:shadow-md hover:border-emerald-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/80">
              กำลังพล
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">พนักงานทั้งหมด</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-prompt mt-1">
              {employees.length} คน
            </h3>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium mt-1 truncate">
              เข้างาน {workingTodayCount} คน ({workingTodayPercent}%)
            </p>
          </div>
        </div>

        {/* Card 4: Org Utilization (คำนวณจากฐานข้อมูลจริง) */}
        <div
          onClick={() => setActiveTab('reports')}
          className="bento-card-interactive bg-gradient-to-br from-white via-blue-50/25 to-indigo-50/30 rounded-3xl p-4 sm:p-5 shadow-xs border border-blue-100/90 hover:shadow-md hover:border-blue-300 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200/80">
              ปี {currentYearBE}
            </span>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">อัตราการใช้วันลา</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-prompt mt-1">
              {orgUtilizationRate}%
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
              อนุมัติ {approvedRequests.length} คำขอ ({daysUsedForRate.toFixed(1)} วัน)
            </p>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Quick Approvals Table + Today's Absence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 of 12 cols): Quick Action Approval Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-[#134226]">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-base font-prompt">
                คิวคำขอที่รอการพิจารณาด่วน ({pendingRequests.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('approver')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <EmptyState
              compact
              variant="check"
              title="ไม่มีคำขอที่รอพิจารณาด่วน"
              description="ทุกคำขอในระบบได้รับการตรวจสอบและพิจารณาครบถ้วนแล้ว"
            />
          ) : (
            <>
              <div className="space-y-3">
                {paginatedPendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {req.employeeName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {req.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${req.status === 'อยู่ระหว่างตรวจสอบ'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-700'
                            }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {req.days} วัน
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>ช่วงวันที่:</strong> {req.dateRange}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        "{req.reason}"
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await downloadLeaveSlipPdf(req);
                            if (showToast) showToast(`ส่งออกใบลา ${req.id} เป็น PDF สำเร็จ`, 'success');
                          } catch (err) {
                            console.error(err);
                            if (showToast) showToast('เกิดข้อผิดพลาดในการสร้าง PDF', 'error');
                          }
                        }}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition-colors shadow-2xs"
                        title="ส่งออกใบลาเป็น PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      {(req.status === 'ยกเลิกวันลา' || req.cancelStatus) && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await downloadCancelLeaveSlipPdf(req);
                              if (showToast) showToast(`ส่งออกใบยกเลิกวันลา ${req.id} เป็น PDF สำเร็จ`, 'success');
                            } catch (err) {
                              console.error(err);
                              if (showToast) showToast('เกิดข้อผิดพลาดในการสร้าง PDF ยกเลิกวันลา', 'error');
                            }
                          }}
                          className="p-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-800 transition-colors shadow-2xs"
                          title="ส่งออกใบยกเลิกวันลาเป็น PDF"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {req.status === 'ยังไม่ยื่นเอกสาร' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenConfirm(req, 'อยู่ระหว่างตรวจสอบ')}
                          className="px-2.5 py-1.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold text-xs transition-colors flex items-center space-x-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>อยู่ระหว่างตรวจสอบ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenConfirm(req, 'ยังไม่ยื่นเอกสาร')}
                          className="px-2.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold text-xs transition-colors flex items-center space-x-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>ยังไม่ยื่นเอกสาร</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenConfirm(req, 'ไม่อนุมัติ')}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>ไม่อนุมัติ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenConfirm(req, 'อนุมัติ')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2F855A] hover:bg-[#256F4A] text-white font-semibold text-xs transition-colors shadow-xs flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>อนุมัติ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPendingPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    หน้า {currentPendingPage} จาก {totalPendingPages} (ทั้งหมด {pendingRequests.length} รายการ)
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={currentPendingPage <= 1}
                      onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>ก่อนหน้า</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentPendingPage >= totalPendingPages}
                      onClick={() => setPendingPage((p) => Math.min(totalPendingPages, p + 1))}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <span>ถัดไป</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column (5 of 12 cols): On Leave Today & Dept Summary (ดึงจากฐานข้อมูลจริง 100%) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-[#134226]">
                <Building className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-base font-prompt">
                  สถานะการลาประจำวัน
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-400">{currentMonthYearBE}</span>
            </div>

            <div className="mt-3 space-y-3">
              {leavesToday.length === 0 ? (
                <EmptyState
                  compact
                  variant="check"
                  title="ไม่มีพนักงานลางานในวันนี้"
                  description="บุคลากรทุกคนปฏิบัติหน้าที่ตามปกติ (เข้างานครบ 100%)"
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {paginatedLeavesToday.map((req) => {
                      const emp = employees.find(
                        (e) =>
                          (req.userId && (e.id === req.userId || e.raw_id === req.userId || String(e.raw_id) === String(req.userId))) ||
                          (req.employeeId && e.employeeId && e.employeeId.toLowerCase() === req.employeeId.toLowerCase()) ||
                          (req.employeeName && e.name && e.name.trim() === req.employeeName.trim())
                      );
                      const avatar =
                        emp?.avatar ||
                        req.avatar ||
                        'https://i.pinimg.com/736x/f5/47/d8/f547d800625af9056d62efe8969aeea0.jpg';
                      const dept = req.department || emp?.department || 'สำนักงานสหกรณ์จังหวัดขอนแก่น';
                      const title = emp?.title || emp?.position || req.position || 'เจ้าหน้าที่สหกรณ์';
                      const typeBadgeColor =
                        req.typeKey === 'sick'
                          ? 'bg-rose-100 text-rose-800'
                          : req.typeKey === 'personal'
                          ? 'bg-teal-100 text-teal-800'
                          : req.typeKey === 'maternity'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800';

                      return (
                        <div
                          key={req.id}
                          onClick={() => {
                            if (setSelectedLeaveDetail) setSelectedLeaveDetail(req);
                          }}
                          className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-colors flex items-center space-x-3 cursor-pointer group"
                        >
                          <img
                            src={avatar}
                            alt={req.employeeName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-800 transition-colors">
                              {req.employeeName || emp?.name || 'เจ้าหน้าที่'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {title} • {dept}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${typeBadgeColor}`}>
                            {req.type || 'ลางาน'} ({req.days} วัน)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalLeavesTodayPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <span>
                        หน้า {currentLeavesTodayPage} จาก {totalLeavesTodayPages} (ทั้งหมด {leavesToday.length} รายการ)
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          disabled={currentLeavesTodayPage <= 1}
                          onClick={() => setLeavesTodayPage((p) => Math.max(1, p - 1))}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>ก่อนหน้า</span>
                        </button>
                        <button
                          type="button"
                          disabled={currentLeavesTodayPage >= totalLeavesTodayPages}
                          onClick={() => setLeavesTodayPage((p) => Math.min(totalLeavesTodayPages, p + 1))}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        >
                          <span>ถัดไป</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('calendar')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>เปิดดูปฏิทินวันลาทั้งองค์กร</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal before status changes */}
      <StatusConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        req={confirmModal.req}
        targetStatus={confirmModal.targetStatus}
        defaultRemark={confirmModal.defaultRemark}
      />
    </div>
  );
}
