import React, { useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Building,
  BarChart3,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';

export default function ReportsView() {
  const { leaveRequests, employees, fetchLiveDatabaseData } = useLeave();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentYearBE = currentYear + 543;
  const currentMonthIndex = now.getMonth();

  // ซิงค์ข้อมูลล่าสุดกับ Database เมื่อเข้าสู่หน้านี้
  useEffect(() => {
    if (fetchLiveDatabaseData) {
      fetchLiveDatabaseData({ silent: true });
    }
  }, []);

  // 1. คำนวณสถิติรายเดือนจากฐานข้อมูลจริง 100% (ไม่มีการ Hardcode ค่าจำลอง)
  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];

  const monthlyData = thaiMonthsShort.map((m, idx) => {
    const monthNum = String(idx + 1).padStart(2, '0');
    const prefix = `${currentYear}-${monthNum}`;
    const monthRequests = (leaveRequests || []).filter(
      (r) => r.startDate && String(r.startDate).startsWith(prefix)
    );
    const totalDays = monthRequests.reduce((sum, r) => sum + Number(r.days || 1), 0);
    return {
      m,
      monthIndex: idx,
      days: totalDays,
      requestsCount: monthRequests.length,
    };
  });

  const maxMonthDays = Math.max(...monthlyData.map((d) => d.days), 1);

  // 2. คำนวณสัดส่วนประเภทการลาจากข้อมูลใน Database
  const typeDefinitions = [
    { key: 'vacation', label: 'ลาพักผ่อน (Vacation Leave)', color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    { key: 'personal', label: 'ลากิจส่วนตัว (Personal Leave)', color: 'bg-teal-500', barColor: 'bg-teal-500' },
    { key: 'sick', label: 'ลาป่วย (Sick Leave)', color: 'bg-rose-500', barColor: 'bg-rose-500' },
    { key: 'maternity', label: 'ลาคลอดบุตร (Maternity Leave)', color: 'bg-purple-500', barColor: 'bg-purple-500' },
  ];

  const typeStats = typeDefinitions.map((def) => {
    const matching = (leaveRequests || []).filter(
      (r) => (r.typeKey || 'vacation') === def.key
    );
    const totalDays = matching.reduce((sum, r) => sum + Number(r.days || 1), 0);
    return {
      ...def,
      requestsCount: matching.length,
      totalDays,
    };
  });

  const totalLeaveDaysAcrossAll = typeStats.reduce((sum, t) => sum + t.totalDays, 0);

  // 3. สถิติสถานะคำขอลาจาก Database
  const statusStats = {
    total: (leaveRequests || []).length,
    approved: (leaveRequests || []).filter((r) => r.status === 'อนุมัติ').length,
    checking: (leaveRequests || []).filter(
      (r) => r.status === 'อยู่ระหว่างตรวจสอบ' || r.status === 'รออนุมัติ'
    ).length,
    notSubmitted: (leaveRequests || []).filter((r) => r.status === 'ยังไม่ยื่นเอกสาร').length,
    rejected: (leaveRequests || []).filter((r) => r.status === 'ไม่อนุมัติ').length,
  };

  // 4. สถิติการลาแยกตามกลุ่ม/ฝ่าย จาก Database
  const departmentStats = {};
  (leaveRequests || []).forEach((r) => {
    const dept = r.department || 'สำนักงานสหกรณ์จังหวัดขอนแก่น';
    if (!departmentStats[dept]) {
      departmentStats[dept] = { requests: 0, days: 0 };
    }
    departmentStats[dept].requests += 1;
    departmentStats[dept].days += Number(r.days || 1);
  });

  const sortedDepartments = Object.entries(departmentStats)
    .sort((a, b) => b[1].days - a[1].days);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-prompt">
            รายงานสถิติการลา
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ข้อมูลสถิติการลาประจำปี พ.ศ. {currentYearBE}
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">คำขอทั้งหมด</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 font-prompt">{statusStats.total}</p>
          <p className="text-[11px] text-slate-400">รายการคำขอลาในระบบ</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold text-emerald-800">อนุมัติแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 font-prompt">{statusStats.approved}</p>
          <p className="text-[11px] text-emerald-600/80">คำขอที่ได้รับอนุมัติ</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold text-amber-800">อยู่ระหว่างตรวจสอบ</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 font-prompt">{statusStats.checking}</p>
          <p className="text-[11px] text-amber-600/80">รอพิจารณา/ส่งต่อ</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold text-blue-800">วันลารวมทั้งหมด</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 font-prompt">{totalLeaveDaysAcrossAll}</p>
          <p className="text-[11px] text-blue-600/80">วันทำการที่ใช้ไป</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-semibold text-purple-800">บุคลากรใน D1</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700 font-prompt">{(employees || []).length}</p>
          <p className="text-[11px] text-purple-600/80">เจ้าหน้าที่ในฐานข้อมูล</p>
        </div>
      </div>

      {/* Visual Chart Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Simulated Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 font-prompt">
                สถิติการลาประจำเดือน (ปี {currentYearBE})
              </h3>
              <p className="text-xs text-slate-500">
                คำนวณจากวันลาจริงในระบบ
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium">
              รวม {totalLeaveDaysAcrossAll} วัน
            </span>
          </div>

          <div className="pt-4 flex items-end justify-between h-48 gap-2">
            {monthlyData.map((item, idx) => {
              const isCurrentMonth = idx === currentMonthIndex;
              const barHeightPercent = item.days > 0 ? Math.min(100, Math.max(12, (item.days / maxMonthDays) * 100)) : 4;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] text-slate-500 font-bold">
                    {item.days > 0 ? item.days : '-'}
                  </span>
                  <div
                    style={{ height: `${barHeightPercent}%` }}
                    title={`${item.m}: ${item.days} วัน (${item.requestsCount} คำขอ)`}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isCurrentMonth
                        ? 'bg-[#2F855A] shadow-md ring-2 ring-emerald-300'
                        : item.days > 0
                        ? 'bg-emerald-400 hover:bg-emerald-500'
                        : 'bg-slate-100'
                    }`}
                  />
                  <span className={`text-[10px] ${isCurrentMonth ? 'font-bold text-[#2F855A]' : 'text-slate-400'}`}>
                    {item.m}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2F855A]" />
              <span>เดือนปัจจุบัน ({thaiMonthsShort[currentMonthIndex]})</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span>มีสถิติการลา</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-100" />
              <span>ไม่มีการลา</span>
            </span>
          </div>
        </div>

        {/* Leave Type Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 font-prompt">
                สัดส่วนการลาแต่ละประเภท
              </h3>
              <p className="text-xs text-slate-500">
                รวมจำนวนวันลาแยกตามประเภทจากคำขอในฐานข้อมูล D1
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium">
              4 ประเภท
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {typeStats.map((item) => {
              const pct = totalLeaveDaysAcrossAll > 0
                ? Math.round((item.totalDays / totalLeaveDaysAcrossAll) * 100)
                : 0;
              return (
                <div key={item.key}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span>{item.label}</span>
                    </span>
                    <span className="text-slate-600">
                      {item.totalDays} วัน ({item.requestsCount} คำขอ • {pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${item.barColor} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, item.totalDays > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>วันลาที่บันทึกในฐานข้อมูลรวมทั้งหมด</span>
            <span className="font-bold text-slate-800 font-prompt text-sm">{totalLeaveDaysAcrossAll} วัน</span>
          </div>
        </div>
      </div>

      {/* Department Breakdown Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <Building className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-base text-slate-800 font-prompt">
                สถิติการลาแยกตามกลุ่ม / ฝ่ายในสังกัด
              </h3>
              <p className="text-xs text-slate-500">
                สรุปคำขอลาและจำนวนวันลาแยกตามแผนกงานจากข้อมูลใน D1
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {sortedDepartments.length} แผนกที่มีบันทึกการลา
          </span>
        </div>

        {sortedDepartments.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            ยังไม่พบข้อมูลการลาแยกตามกลุ่มงาน
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedDepartments.map(([deptName, stat], idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/70 transition-all flex items-center justify-between"
              >
                <div className="space-y-0.5 max-w-[70%]">
                  <p className="text-xs font-semibold text-slate-800 truncate" title={deptName}>
                    {deptName}
                  </p>
                  <p className="text-[11px] text-slate-500">{stat.requests} คำขอ</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-700 font-prompt">{stat.days}</span>
                  <span className="text-[10px] text-slate-400 block">วัน</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
