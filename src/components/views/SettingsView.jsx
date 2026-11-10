import React, { useState } from 'react';
import { User, Bell, Shield, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';

export default function SettingsView() {
  const { currentUser, setCurrentUser, resetToDefault } = useLeave();

  const [formData, setFormData] = useState({
    name: currentUser.name,
    title: currentUser.title,
    department: currentUser.department,
    email: currentUser.email,
    phone: currentUser.phone,
    employeeId: currentUser.employeeId,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      ...formData,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 font-prompt">การตั้งค่าระบบและบัญชีผู้ใช้</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          จัดการข้อมูลส่วนบุคคล การแจ้งเตือน และสิทธิ์การใช้งาน
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-50 shadow-sm"
          />
          <div>
            <h3 className="font-bold text-base text-slate-800">{currentUser.name}</h3>
            <p className="text-xs text-slate-500">{currentUser.department}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              สถานะ: พนักงานประจำ (Active)
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งงาน</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ฝ่าย / แผนก</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">รหัสพนักงาน</label>
              <input
                type="text"
                disabled
                value={formData.employeeId}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">อีเมลติดต่อ</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('รีเซ็ตข้อมูลเป็นค่าเริ่มต้นของระบบ?')) {
                  resetToDefault();
                }
              }}
              className="flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตค่าเริ่มต้น</span>
            </button>

            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#155A32] hover:bg-[#114A29] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการแก้ไข</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

