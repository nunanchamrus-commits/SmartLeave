import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Save,
  CheckCircle2,
  RotateCcw,
  Shield,
  FileText,
  Sparkles,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';

const AVATAR_PRESETS = [
  {
    label: 'เจ้าหน้าที่หญิง (ค่าเริ่มต้น)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    label: 'เจ้าหน้าที่ชาย / ผู้บริหาร',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    label: 'บุคคลากร 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    label: 'บุคคลากร 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  },
];

export default function SettingsView() {
  const {
    currentUser,
    updateUserProfile,
    resetToDefault,
    setIsPrivacyModalOpen,
    healthConsent,
    showToast,
  } = useLeave();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    title: currentUser?.title || '',
    department: currentUser?.department || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    employeeId: currentUser?.employeeId || '',
    avatar: currentUser?.avatar || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Synchronize form if currentUser changes (e.g. login switch or external update)
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        title: currentUser.title || '',
        department: currentUser.department || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        employeeId: currentUser.employeeId || '',
        avatar: currentUser.avatar || '',
      });
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      if (showToast) showToast('กรุณากรอกชื่อ-นามสกุล', 'error');
      return;
    }

    if (updateUserProfile) {
      updateUserProfile(formData);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSelectAvatar = (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    setShowAvatarPicker(false);
  };

  return (
    <div className="space-y-6 max-w-4xl font-prompt pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            โปรไฟล์ & บัญชีผู้ใช้
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mt-1">
          การตั้งค่าระบบและข้อมูลส่วนบุคคล
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          สำนักงานสหกรณ์จังหวัดขอนแก่น — จัดการข้อมูลเจ้าหน้าที่ การติดต่อ และสิทธิ์การใช้งาน
        </p>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-3 text-emerald-900 text-sm shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold">บันทึกข้อมูลเรียบร้อยแล้ว!</p>
            <p className="text-xs text-emerald-700">
              ข้อมูลส่วนบุคคลได้รับการอัปเดตลงระบบและฐานข้อมูลเรียบร้อยแล้ว
            </p>
          </div>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        {/* Avatar & Header Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={formData.avatar || currentUser?.avatar}
                alt={formData.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-50 shadow-md transition-all group-hover:brightness-95"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-2 -right-2 p-1.5 bg-[#155A32] text-white rounded-xl shadow-md hover:bg-[#114A29] transition-all"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-slate-800">{formData.name || 'เจ้าหน้าที่สหกรณ์'}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {currentUser?.role === 'approver' || currentUser?.role === 'admin' ? 'ผู้อนุมัติ / ผู้ดูแล' : 'พนักงานประจำ'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{formData.department || 'สำนักงานสหกรณ์จังหวัดขอนแก่น'}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                รหัสประจำตัว: {formData.employeeId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="self-start sm:self-center px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60"
          >
            เลือกรูปภาพโปรไฟล์
          </button>
        </div>

        {/* Avatar Preset Selector */}
        {showAvatarPicker && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">เลือกรูปภาพโปรไฟล์สำเร็จรูป</span>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ปิด
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectAvatar(preset.url)}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    formData.avatar === preset.url
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-14 h-14 rounded-xl object-cover mb-1.5 shadow-xs"
                  />
                  <span className="text-[10px] text-slate-600 text-center line-clamp-1">{preset.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-[11px] text-slate-500 mb-1">หรือระบุลิงก์รูปภาพ (Image URL)</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Input Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="เช่น นางสาวพนิกา ธรรมเมือง"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งงาน</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="เช่น นักวิชาการสหกรณ์ หรือ พนักงาน"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ฝ่าย / กลุ่มงาน</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="เช่น ฝ่ายส่งเสริมและพัฒนาสหกรณ์"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">รหัสพนักงาน (ระบบกำหนด)</label>
              <input
                type="text"
                disabled
                value={formData.employeeId}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">อีเมลติดต่อราชการ</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="name@smartleave.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="เช่น 081-234-5678"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between pt-6 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นของระบบหรือไม่?')) {
                  resetToDefault();
                }
              }}
              className="flex items-center justify-center space-x-2 text-xs text-slate-500 hover:text-slate-800 py-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตค่าเริ่มต้นระบบ</span>
            </button>

            <button
              type="submit"
              className={`flex items-center justify-center space-x-2 px-7 py-2.5 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] ${
                savedSuccess
                  ? 'bg-emerald-600 ring-2 ring-emerald-400'
                  : 'bg-[#155A32] hover:bg-[#114A29]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  <span>บันทึกสำเร็จเรียบร้อย!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security & PDPA Compliance Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800">
                ความปลอดภัยและความเป็นส่วนตัว (PDPA Compliance)
              </h3>
              <p className="text-xs text-slate-500">
                การปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen && setIsPrivacyModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ดูนโยบาย PDPA</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="font-semibold text-slate-700">สถานะความยินยอมการประมวลผลข้อมูล</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-800 font-medium">ยินยอมตามข้อกำหนดทั่วไปแล้ว</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              จัดเก็บข้อมูลส่วนบุคคลเพื่อการบริหารจัดการวันลาและสวัสดิการ
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="font-semibold text-slate-700">การประมวลผลข้อมูลสุขภาพ (ใบรับรองแพทย์)</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-2.5 h-2.5 rounded-full ${healthConsent ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-slate-800 font-medium">
                {healthConsent ? 'ยินยอมให้ตรวจสอบข้อมูลสุขภาพ' : 'ยังไม่ได้ให้ความยินยอมพิเศษ'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {healthConsent
                ? 'ระบบสามารถประมวลผลใบรับรองแพทย์เพื่อสิทธิ์ลาป่วยเกิน 2 วันได้'
                : 'คลิกดูนโยบาย PDPA เพื่อปรับปรุงความยินยอมข้อมูลสุขภาพ'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
