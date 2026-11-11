import React, { useState } from 'react';
import {
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Building,
  UserCheck,
  Eye,
  Edit3,
  FileDown,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { downloadLeaveSlipPdf } from '../../utils/exportPdf';

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
  } = useLeave();

  const [searchEmployee, setSearchEmployee] = useState('');

  const now = new Date();
  const currentYearBE = now.getFullYear() + 543;
  const currentMonthYearBE = `${THAI_MONTHS_SHORT[now.getMonth()]} ${currentYearBE}`;

  const pendingRequests = leaveRequests.filter(
    (r) => r.status === 'ยังไม่ยื่นเอกสาร' || r.status === 'อยู่ระหว่างตรวจสอบ'
  );
  const approvedRequests = leaveRequests.filter((r) => r.status === 'อนุมัติ');

  // Filter employees
  const filteredEmployees = searchEmployee
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
          e.department.toLowerCase().includes(searchEmployee.toLowerCase()) ||
          e.employeeId.toLowerCase().includes(searchEmployee.toLowerCase())
      )
    : employees;

  return (
    <div className="space-y-6">
      {/* 1. Admin Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F351E] via-[#154628] to-[#1E5D37] p-6 sm:p-8 text-white shadow-md border border-emerald-900/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center space-x-1 shadow-sm">
                <span>👑 ผู้ดูแลระบบและผู้อนุมัติ</span>
              </span>
              <span className="text-xs text-emerald-200/80">Executive HR Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-prompt">
              ยินดีต้อนรับ คุณสมชาย มั่นคง 👋
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Pending Approvals */}
        <div
          onClick={() => setActiveTab('approver')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
              ต้องดำเนินการ
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">คำขอที่รอตรวจสอบ/อนุมัติ</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-prompt mt-0.5">
              {pendingRequests.length} รายการ
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              คลิกเพื่อเปิดดูคิวรอพิจารณา ➔
            </p>
          </div>
        </div>

        {/* Card 2: On leave today */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800">
              วันนี้
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">พนักงานที่ลาวันนี้</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-prompt mt-0.5">
              2 คน
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              พนิกา (พักร้อน), อัครพล (พักร้อน)
            </p>
          </div>
        </div>

        {/* Card 3: Total Headcount */}
        <div
          onClick={() => setActiveTab('employees')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              กำลังพล
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">พนักงานทั้งหมดในองค์กร</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-prompt mt-0.5">
              {employees.length} คน
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              เข้างานปกติ {employees.length - 2} คน (92.8%)
            </p>
          </div>
        </div>

        {/* Card 4: Org Utilization */}
        <div
          onClick={() => setActiveTab('reports')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              ปี {currentYearBE}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">อัตราการใช้วันลาทั้งองค์กร</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-prompt mt-0.5">
              41.2%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              อนุมัติไปแล้ว {approvedRequests.length} คำขอ
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
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">ไม่มีคำขอที่รอพิจารณา</p>
              <p className="text-xs">ทุกคำขอในระบบได้รับการพิจารณาเรียบร้อยแล้ว</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          req.status === 'อยู่ระหว่างตรวจสอบ'
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
                    {req.status === 'ยังไม่ยื่นเอกสาร' ? (
                      <button
                        type="button"
                        onClick={() => updateLeaveStatus(req.id, 'อยู่ระหว่างตรวจสอบ')}
                        className="px-2.5 py-1.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold text-xs transition-colors flex items-center space-x-1"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>อยู่ระหว่างตรวจสอบ</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateLeaveStatus(req.id, 'ยังไม่ยื่นเอกสาร')}
                        className="px-2.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold text-xs transition-colors flex items-center space-x-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>ยังไม่ยื่นเอกสาร</span>
                      </button>
                    )}
                    <button
                      onClick={() => rejectLeaveRequest(req.id, 'ไม่อนุมัติเนื่องจากมีภารกิจงานเร่งด่วน')}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ไม่อนุมัติ</span>
                    </button>
                    <button
                      onClick={() => approveLeaveRequest(req.id, 'อนุมัติเรียบร้อย')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#155A32] hover:bg-[#114929] text-white font-semibold text-xs transition-colors shadow-xs flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (5 of 12 cols): On Leave Today & Dept Summary */}
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
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80"
                  alt="พนิกา"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    นางสาวพนิกา ธรรมเมือง
                  </p>
                  <p className="text-[11px] text-slate-500">UI/UX Designer</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-200/60 text-emerald-800">
                  ลาพักร้อน (2 วัน)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80"
                  alt="อัครพล"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    นายอัครพล เจริญผล
                  </p>
                  <p className="text-[11px] text-slate-500">Frontend Engineer</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-200/60 text-teal-800">
                  ลาพักร้อน (3 วัน)
                </span>
              </div>
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

      {/* 4. Bottom Section: Employee Quotas Snapshot */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800 font-prompt">
              ภาพรวมโควตาวันลาพนักงานรายบุคคล (Staff Quota Snapshot)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ตรวจสอบสิทธิวันลาคงเหลือของพนักงานแต่ละแผนกในสังกัด
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
              placeholder="ค้นหาชื่อพนักงาน หรือแผนก..."
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 w-48 sm:w-64"
            />
            <button
              onClick={() => setActiveTab('employees')}
              className="px-3.5 py-1.5 bg-[#155A32] hover:bg-[#114929] text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
            >
              จัดการพนักงาน ➔
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-4">พนักงาน</th>
                <th className="py-2.5 px-4">ฝ่าย / แผนก</th>
                <th className="py-2.5 px-4 text-center">พักร้อนคงเหลือ</th>
                <th className="py-2.5 px-4 text-center">กิจส่วนตัว</th>
                <th className="py-2.5 px-4 text-center">ลาป่วย</th>
                <th className="py-2.5 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.slice(0, 5).map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center space-x-2.5">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-800">{emp.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {emp.vacationRem} / 10 วัน
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-teal-700">
                    {emp.personalRem} / 15 วัน
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600">
                    {emp.sickRem} / 30 วัน
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        emp.status.includes('ลา')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

