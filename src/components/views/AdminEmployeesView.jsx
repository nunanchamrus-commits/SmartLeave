import React, { useState } from 'react';
import {
  Users,
  Search,
  Edit2,
  Shield,
  Download,
  X,
  Save,
  CalendarCheck,
  Clock,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';

const LEAVE_QUOTA_TYPES = [
  { key: 'vacation', label: 'ลาพักร้อน', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { key: 'personal', label: 'ลากิจส่วนตัว', dotColor: 'bg-teal-500', textColor: 'text-teal-700' },
  { key: 'sick', label: 'ลาป่วย', dotColor: 'bg-rose-500', textColor: 'text-rose-600' },
  { key: 'maternity', label: 'ลาคลอดบุตร', dotColor: 'bg-pink-500', textColor: 'text-pink-600' },
];

function matchesEmployee(req, emp) {
  if (!req || !emp) return false;
  if (emp.raw_id && req.user_id && Number(req.user_id) === Number(emp.raw_id)) return true;
  if (req.userId && emp.id && (`usr-${req.userId}` === emp.id || String(req.userId) === String(emp.raw_id))) return true;
  if (emp.employeeId && req.employeeId && (req.employeeId === emp.employeeId || req.employeeId === emp.id)) return true;
  if (emp.id && req.employeeId === emp.id) return true;
  if (emp.email && req.employeeEmail && emp.email.toLowerCase() === req.employeeEmail.toLowerCase()) return true;
  if (emp.name && req.employeeName && req.employeeName.trim() === emp.name.trim()) return true;
  return false;
}

export default function AdminEmployeesView() {
  const { employees, leaveRequests, updateEmployeeQuota, showToast } = useLeave();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [editingEmp, setEditingEmp] = useState(null);

  // Modal edit form state (Limit, Used, Rem per leave type)
  const [editForm, setEditForm] = useState({
    vacationLimit: 10,
    vacationUsed: 0,
    vacationRem: 10,
    personalLimit: 15,
    personalUsed: 0,
    personalRem: 15,
    sickLimit: 30,
    sickUsed: 0,
    sickRem: 30,
    maternityLimit: 90,
    maternityUsed: 0,
    maternityRem: 90,
  });

  const getEmployeeLeaveStats = (emp) => {
    const approvedLeaves = (leaveRequests || []).filter(
      (r) => r.status === 'อนุมัติ' && matchesEmployee(r, emp)
    );
    const byTypeCount = {
      vacation: approvedLeaves.filter((r) => r.typeKey === 'vacation').length,
      personal: approvedLeaves.filter((r) => r.typeKey === 'personal').length,
      sick: approvedLeaves.filter((r) => r.typeKey === 'sick').length,
      maternity: approvedLeaves.filter((r) => r.typeKey === 'maternity').length,
    };

    const vacationLimit = Number(emp.vacationLimit ?? 10);
    const vacationRem = Number(emp.vacationRem ?? vacationLimit);
    const vacationUsed = Number(emp.vacationUsed ?? Math.max(0, vacationLimit - vacationRem));

    const personalLimit = Number(emp.personalLimit ?? 15);
    const personalRem = Number(emp.personalRem ?? personalLimit);
    const personalUsed = Number(emp.personalUsed ?? Math.max(0, personalLimit - personalRem));

    const sickLimit = Number(emp.sickLimit ?? 30);
    const sickRem = Number(emp.sickRem ?? sickLimit);
    const sickUsed = Number(emp.sickUsed ?? Math.max(0, sickLimit - sickRem));

    const matDefault = emp.gender === 'ชาย' ? 0 : 90;
    const maternityLimit = Number(emp.maternityLimit ?? matDefault);
    const maternityRem = Number(emp.maternityRem ?? maternityLimit);
    const maternityUsed = Number(emp.maternityUsed ?? Math.max(0, maternityLimit - maternityRem));

    const totalUsedDays = vacationUsed + personalUsed + sickUsed + maternityUsed;
    const generalRem = vacationRem + personalRem + sickRem;
    const generalLimit = vacationLimit + personalLimit + sickLimit;

    return {
      approvedLeaves,
      approvedCount: approvedLeaves.length,
      byTypeCount,
      vacationLimit,
      vacationUsed,
      vacationRem,
      personalLimit,
      personalUsed,
      personalRem,
      sickLimit,
      sickUsed,
      sickRem,
      maternityLimit,
      maternityUsed,
      maternityRem,
      totalUsedDays,
      generalRem,
      generalLimit,
    };
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.englishName || '').toLowerCase().includes(q) ||
      (emp.title || '').toLowerCase().includes(q);
    const matchDept = departmentFilter === 'all' || (emp.department || '').includes(departmentFilter);
    return matchSearch && matchDept;
  });

  const handleOpenEdit = (emp) => {
    const stats = getEmployeeLeaveStats(emp);
    setEditingEmp(emp);
    setEditForm({
      vacationLimit: stats.vacationLimit,
      vacationUsed: stats.vacationUsed,
      vacationRem: stats.vacationRem,
      personalLimit: stats.personalLimit,
      personalUsed: stats.personalUsed,
      personalRem: stats.personalRem,
      sickLimit: stats.sickLimit,
      sickUsed: stats.sickUsed,
      sickRem: stats.sickRem,
      maternityLimit: stats.maternityLimit,
      maternityUsed: stats.maternityUsed,
      maternityRem: stats.maternityRem,
    });
  };

  const handleQuotaFieldChange = (typeKey, part, rawValue) => {
    const isEmpty = rawValue === '';
    const numVal = isEmpty ? 0 : Math.max(0, parseFloat(rawValue) || 0);
    const inputVal = isEmpty ? '' : rawValue;

    setEditForm((prev) => {
      const curLimit = prev[`${typeKey}Limit`] === '' ? 0 : Number(prev[`${typeKey}Limit`] || 0);
      const curUsed = prev[`${typeKey}Used`] === '' ? 0 : Number(prev[`${typeKey}Used`] || 0);

      if (part === 'Limit') {
        const nextRem = Math.max(0, numVal - curUsed);
        return {
          ...prev,
          [`${typeKey}Limit`]: inputVal,
          [`${typeKey}Rem`]: nextRem,
        };
      }

      if (part === 'Used') {
        const nextRem = Math.max(0, curLimit - numVal);
        return {
          ...prev,
          [`${typeKey}Used`]: inputVal,
          [`${typeKey}Rem`]: nextRem,
        };
      }

      // part === 'Rem'
      if (numVal > curLimit) {
        return {
          ...prev,
          [`${typeKey}Limit`]: numVal,
          [`${typeKey}Used`]: 0,
          [`${typeKey}Rem`]: inputVal,
        };
      }
      return {
        ...prev,
        [`${typeKey}Used`]: Math.max(0, curLimit - numVal),
        [`${typeKey}Rem`]: inputVal,
      };
    });
  };

  const handleQuotaFieldBlur = (typeKey, part) => {
    setEditForm((prev) => {
      if (prev[`${typeKey}${part}`] === '') {
        return { ...prev, [`${typeKey}${part}`]: 0 };
      }
      return prev;
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingEmp) return;

    const payload = {
      vacationLimit: Math.max(0, Number(editForm.vacationLimit || 0)),
      vacationUsed: Math.max(0, Number(editForm.vacationUsed || 0)),
      vacationRem: Math.max(0, Number(editForm.vacationRem || 0)),
      personalLimit: Math.max(0, Number(editForm.personalLimit || 0)),
      personalUsed: Math.max(0, Number(editForm.personalUsed || 0)),
      personalRem: Math.max(0, Number(editForm.personalRem || 0)),
      sickLimit: Math.max(0, Number(editForm.sickLimit || 0)),
      sickUsed: Math.max(0, Number(editForm.sickUsed || 0)),
      sickRem: Math.max(0, Number(editForm.sickRem || 0)),
      maternityLimit: Math.max(0, Number(editForm.maternityLimit || 0)),
      maternityUsed: Math.max(0, Number(editForm.maternityUsed || 0)),
      maternityRem: Math.max(0, Number(editForm.maternityRem || 0)),
    };

    await updateEmployeeQuota(editingEmp.id, payload);
    setEditingEmp(null);
  };

  const handleExportCsv = () => {
    const headers = [
      'รหัสพนักงาน',
      'ชื่อ-นามสกุล',
      'ตำแหน่ง',
      'ฝ่าย/กลุ่มงาน',
      'ลาไปแล้ว (ครั้ง)',
      'ใช้ไปรวม (วัน)',
      'พักร้อนคงเหลือ/สิทธิ์ (วัน)',
      'ลากิจคงเหลือ/สิทธิ์ (วัน)',
      'ลาป่วยคงเหลือ/สิทธิ์ (วัน)',
      'ลาคลอดคงเหลือ/สิทธิ์ (วัน)',
      'คงเหลือสิทธิ์ลาทั่วไปรวม (วัน)',
    ];

    const rows = filteredEmployees.map((emp) => {
      const s = getEmployeeLeaveStats(emp);
      return [
        emp.employeeId || emp.id,
        `"${(emp.name || '').replace(/"/g, '""')}"`,
        `"${(emp.title || '').replace(/"/g, '""')}"`,
        `"${(emp.department || '').replace(/"/g, '""')}"`,
        s.approvedCount,
        s.totalUsedDays,
        `${s.vacationRem}/${s.vacationLimit}`,
        `${s.personalRem}/${s.personalLimit}`,
        `${s.sickRem}/${s.sickLimit}`,
        `${s.maternityRem}/${s.maternityLimit}`,
        `${s.generalRem}/${s.generalLimit}`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ข้อมูลวันลาพนักงาน_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (showToast) showToast('ส่งออกรายงานข้อมูลวันลาพนักงานเรียบร้อยแล้ว', 'success');
  };

  const uniqueDepartments = Array.from(
    new Set(employees.map((e) => e.department).filter(Boolean))
  );
  const departments = [
    { id: 'all', label: 'ทุกฝ่าย / กลุ่มงาน' },
    ...uniqueDepartments.map((d) => ({ id: d, label: d })),
  ];

  const editingStats = editingEmp ? getEmployeeLeaveStats(editingEmp) : null;
  const previewGeneralRem =
    Number(editForm.vacationRem || 0) +
    Number(editForm.personalRem || 0) +
    Number(editForm.sickRem || 0);
  const previewGeneralLimit =
    Number(editForm.vacationLimit || 0) +
    Number(editForm.personalLimit || 0) +
    Number(editForm.sickLimit || 0);
  const previewGeneralUsed =
    Number(editForm.vacationUsed || 0) +
    Number(editForm.personalUsed || 0) +
    Number(editForm.sickUsed || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
              Admin & HR Only
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-prompt mt-1">
            จัดการข้อมูลพนักงานและวันลา (Staff & Leave Management)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ดูจำนวนครั้งที่ลา คงเหลือสิทธิ์ลา และแก้ไขจำนวนวันลาของพนักงานแต่ละบุคคล
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>ส่งออกรายงาน CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อพนักงาน หรือตำแหน่ง..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-slate-700"
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">พนักงาน</th>
                <th className="py-3 px-4">ฝ่าย / แผนก</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">ลาไปแล้ว</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">ลาพักร้อน</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">ลากิจ</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">ลาป่วย</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">ลาคลอด</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">คงเหลือสิทธิ์ลา</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  <span className="sr-only">แก้ไขวันลา</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    ไม่พบรายชื่อพนักงานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const s = getEmployeeLeaveStats(emp);
                  const noMaternity = emp.gender === 'ชาย' && s.maternityLimit === 0 && s.maternityRem === 0;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <p className="font-bold text-slate-900">{emp.name}</p>
                              {emp.gender && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    emp.gender === 'หญิง'
                                      ? 'bg-pink-50 text-pink-700 border border-pink-200/60'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                  }`}
                                >
                                  {emp.gender}
                                </span>
                              )}
                              {emp.employmentType && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                  {emp.employmentType}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {emp.title}{' '}
                              {emp.englishName && (
                                <span className="text-slate-400 font-normal">({emp.englishName})</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[180px]">{emp.department}</td>

                      {/* Leave frequency count */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(emp)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                            s.approvedCount > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="คลิกเพื่อดูรายละเอียดและแก้ไขวันลา"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>{s.approvedCount} ครั้ง</span>
                        </button>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          ใช้ไป {s.totalUsedDays} วัน
                        </div>
                      </td>

                      {/* Vacation */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="font-bold text-emerald-700">
                          {s.vacationRem} / {s.vacationLimit} วัน
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ใช้ {s.vacationUsed} วัน
                          {s.byTypeCount.vacation > 0 ? ` (${s.byTypeCount.vacation} ครั้ง)` : ''}
                        </div>
                      </td>

                      {/* Personal */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="font-bold text-teal-700">
                          {s.personalRem} / {s.personalLimit} วัน
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ใช้ {s.personalUsed} วัน
                          {s.byTypeCount.personal > 0 ? ` (${s.byTypeCount.personal} ครั้ง)` : ''}
                        </div>
                      </td>

                      {/* Sick */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="font-bold text-rose-600">
                          {s.sickRem} / {s.sickLimit} วัน
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ใช้ {s.sickUsed} วัน
                          {s.byTypeCount.sick > 0 ? ` (${s.byTypeCount.sick} ครั้ง)` : ''}
                        </div>
                      </td>

                      {/* Maternity */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {noMaternity ? (
                          <span className="text-xs text-slate-400">-</span>
                        ) : (
                          <>
                            <div className="font-bold text-pink-600">
                              {s.maternityRem} / {s.maternityLimit} วัน
                            </div>
                            <div className="text-[11px] text-slate-400">
                              ใช้ {s.maternityUsed} วัน
                              {s.byTypeCount.maternity > 0 ? ` (${s.byTypeCount.maternity} ครั้ง)` : ''}
                            </div>
                          </>
                        )}
                      </td>

                      {/* Total Remaining Entitlement */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#155A32] border border-emerald-200/80">
                          {s.generalRem} / {s.generalLimit} วัน
                        </span>
                        {!noMaternity && s.maternityRem > 0 && (
                          <div className="text-[10px] text-pink-600 mt-0.5">
                            + ลาคลอด {s.maternityRem} วัน
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(emp)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>แก้ไขวันลา</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Leave Days & Quota Modal */}
      {editingEmp && editingStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-[#123E24] text-white">
              <div className="flex items-center space-x-2.5">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base font-prompt">
                  แก้ไขจำนวนวันลาและสิทธิ์ลา: {editingEmp.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmp(null)}
                className="p-1 rounded-full hover:bg-white/15 text-emerald-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Employee & Leave Summary Header */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={editingEmp.avatar}
                    alt={editingEmp.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  <div>
                    <p className="font-bold text-slate-800">{editingEmp.name}</p>
                    <p className="text-xs text-slate-500">
                      {editingEmp.title} • {editingEmp.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs">
                    ลาไปแล้ว {editingStats.approvedCount} ครั้ง
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-[#155A32] font-bold text-xs">
                    คงเหลือรวม {previewGeneralRem} / {previewGeneralLimit} วัน
                  </span>
                </div>
              </div>

              {/* Approved Leave History Snapshot for this Employee */}
              {editingStats.approvedLeaves.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>รายการที่อนุมัติแล้ว ({editingStats.approvedCount} ครั้ง)</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {editingStats.approvedLeaves.map((lr) => (
                      <div
                        key={lr.id}
                        className="flex items-center justify-between text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-amber-100/80 text-slate-700"
                      >
                        <span className="font-semibold">{lr.type}</span>
                        <span className="text-slate-500">{lr.dateRange}</span>
                        <span className="font-bold text-emerald-700">{lr.days} วัน</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4 Leave-Type Editable Grid */}
              <div className="space-y-2.5">
                <div className="hidden sm:grid grid-cols-12 gap-2 px-3 text-[11px] font-bold text-slate-500">
                  <div className="col-span-4">ประเภทการลา</div>
                  <div className="col-span-3 text-center">สิทธิ์รวมต่อปี (วัน)</div>
                  <div className="col-span-2 text-center">ใช้ไปแล้ว (วัน)</div>
                  <div className="col-span-3 text-center">คงเหลือ (วัน)</div>
                </div>

                {LEAVE_QUOTA_TYPES.map((lt) => (
                  <div
                    key={lt.key}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70"
                  >
                    <div className="sm:col-span-4 flex items-center justify-between sm:justify-start sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${lt.dotColor}`} />
                        <div>
                          <p className={`font-bold text-xs sm:text-sm ${lt.textColor}`}>{lt.label}</p>
                          <p className="text-[11px] text-slate-400">
                            อนุมัติแล้ว {editingStats.byTypeCount[lt.key]} ครั้ง
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="sm:hidden block text-[11px] text-slate-500 mb-1">
                        สิทธิ์รวมต่อปี (วัน)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editForm[`${lt.key}Limit`]}
                        onChange={(e) => handleQuotaFieldChange(lt.key, 'Limit', e.target.value)}
                        onBlur={() => handleQuotaFieldBlur(lt.key, 'Limit')}
                        className="w-full px-3 py-1.5 text-center bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="sm:hidden block text-[11px] text-slate-500 mb-1">
                        ใช้ไปแล้ว (วัน)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editForm[`${lt.key}Used`]}
                        onChange={(e) => handleQuotaFieldChange(lt.key, 'Used', e.target.value)}
                        onBlur={() => handleQuotaFieldBlur(lt.key, 'Used')}
                        className="w-full px-3 py-1.5 text-center bg-white border border-slate-200 rounded-xl font-semibold text-amber-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="sm:hidden block text-[11px] text-slate-500 mb-1">
                        คงเหลือ (วัน)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editForm[`${lt.key}Rem`]}
                        onChange={(e) => handleQuotaFieldChange(lt.key, 'Rem', e.target.value)}
                        onBlur={() => handleQuotaFieldBlur(lt.key, 'Rem')}
                        className="w-full px-3 py-1.5 text-center bg-white border border-emerald-200 rounded-xl font-bold text-[#155A32] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong>สรุปสิทธิ์ลาทั่วไป (พักร้อน + ลากิจ + ลาป่วย):</strong> ใช้ไปแล้ว{' '}
                  <strong>{previewGeneralUsed}</strong> วัน
                </span>
                <span className="font-bold text-[#155A32]">
                  คงเหลือ {previewGeneralRem} จาก {previewGeneralLimit} วัน
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#155A32] hover:bg-[#114929] text-white font-semibold text-xs shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกจำนวนวันลา</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
