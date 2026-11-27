import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { getFiscalYearInfo } from '../../utils/thaiDate';
import EmptyState from '../EmptyState';

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export default function AdminDashboardView() {
  const {
    currentUser,
    leaveRequests,
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
  const [leavesTodayPage, setLeavesTodayPage] = useState(1);

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

  // Pagination สำหรับสถานะการลาประจำวัน (แสดง 6 รายการต่อหน้า)
  const LEAVES_TODAY_PAGE_SIZE = 6;
  const totalLeavesTodayPages = Math.max(1, Math.ceil(leavesToday.length / LEAVES_TODAY_PAGE_SIZE));
  const currentLeavesTodayPage = Math.min(leavesTodayPage, totalLeavesTodayPages);
  const paginatedLeavesToday = useMemo(() => {
    const start = (currentLeavesTodayPage - 1) * LEAVES_TODAY_PAGE_SIZE;
    return leavesToday.slice(start, start + LEAVES_TODAY_PAGE_SIZE);
  }, [leavesToday, currentLeavesTodayPage]);

  return (
    <div className="space-y-6">
      {/* 1. Admin Stat Cards */}
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

      {/* 2. Middle Section: Today's Absence */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-colors flex items-center space-x-3 cursor-pointer group"
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
  );
}
