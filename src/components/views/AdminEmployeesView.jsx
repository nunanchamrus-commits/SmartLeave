import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  Shield,
  Download,
  Plus,
  X,
  Save,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';

export default function AdminEmployeesView() {
  const { employees, updateEmployeeQuota, showToast } = useLeave();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [editingEmp, setEditingEmp] = useState(null);

  // Modal edit form state
  const [editForm, setEditForm] = useState({
    vacationRem: 0,
    personalRem: 0,
    sickRem: 0,
    maternityRem: 0,
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDept = departmentFilter === 'all' || emp.department.includes(departmentFilter);
    return matchSearch && matchDept;
  });

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setEditForm({
      vacationRem: emp.vacationRem,
      personalRem: emp.personalRem,
      sickRem: emp.sickRem,
      maternityRem: emp.maternityRem,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingEmp) return;
    updateEmployeeQuota(editingEmp.id, 'vacationRem', editForm.vacationRem);
    updateEmployeeQuota(editingEmp.id, 'personalRem', editForm.personalRem);
    updateEmployeeQuota(editingEmp.id, 'sickRem', editForm.sickRem);
    updateEmployeeQuota(editingEmp.id, 'maternityRem', editForm.maternityRem);
    setEditingEmp(null);
    showToast(`อัปเดตโควตาวันลาของ ${editingEmp.name} เรียบร้อยแล้ว`, 'success');
  };

  const departments = [
    { id: 'all', label: 'ทุกฝ่าย / แผนก' },
    { id: 'UI/UX', label: 'ฝ่ายออกแบบผลิตภัณฑ์ (UI/UX)' },
    { id: 'Frontend', label: 'ฝ่ายวิศวกรรมซอฟต์แวร์' },
    { id: 'Marketing', label: 'ฝ่ายการตลาด' },
    { id: 'Quality Assurance', label: 'ฝ่ายประกันคุณภาพ (QA)' },
    { id: 'DevOps', label: 'ฝ่ายไอทีและระบบคลาวด์' },
  ];

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
            จัดการข้อมูลพนักงานและโควตาวันลา (Staff & Quota Management)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจสอบสิทธิ์ ปรับเปลี่ยนโควตาวันลาคงเหลือ และติดตามสถานะพนักงานทุกคน
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              alert('ส่งออกรายงานโควตาพนักงานเรียบร้อย');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>ส่งออกรายงาน</span>
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
            placeholder="ค้นหาชื่อพนักงาน, รหัสประจำตัว, หรือตำแหน่ง..."
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
                <th className="py-3 px-4 text-center">ลาพักร้อน</th>
                <th className="py-3 px-4 text-center">ลากิจ</th>
                <th className="py-3 px-4 text-center">ลาป่วย</th>
                <th className="py-3 px-4 text-center">ลาคลอด</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.title}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{emp.department}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {emp.vacationRem} วัน
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-teal-700">
                    {emp.personalRem} วัน
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600">
                    {emp.sickRem} วัน
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-pink-600">
                    {emp.maternityRem} วัน
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.status.includes('ลา')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1 ml-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>ปรับโควตา</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Quota Modal */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#123E24] text-white">
              <div className="flex items-center space-x-2.5">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base font-prompt">
                  ปรับโควตาวันลา: {editingEmp.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingEmp(null)}
                className="p-1 rounded-full hover:bg-white/15 text-emerald-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center space-x-3 mb-2">
                <img
                  src={editingEmp.avatar}
                  alt={editingEmp.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-800">{editingEmp.name}</p>
                  <p className="text-xs text-slate-500">{editingEmp.department}</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  โควตาลาพักร้อนคงเหลือ (วัน)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={editForm.vacationRem}
                  onChange={(e) => setEditForm({ ...editForm, vacationRem: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  โควตาลากิจคงเหลือ (วัน)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={editForm.personalRem}
                  onChange={(e) => setEditForm({ ...editForm, personalRem: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  โควตาลาป่วยคงเหลือ (วัน)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={editForm.sickRem}
                  onChange={(e) => setEditForm({ ...editForm, sickRem: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  โควตาลาคลอดบุตรคงเหลือ (วัน)
                </label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={editForm.maternityRem}
                  onChange={(e) => setEditForm({ ...editForm, maternityRem: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
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
                  <span>บันทึกโควตา</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

