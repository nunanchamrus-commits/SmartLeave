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
  Camera,
  Check,
  ChevronDown,
  Globe,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';

const JOB_TITLE_OPTIONS = [
  'นักวิชาการสหกรณ์ชำนาญการ',
  'นักจัดการงานทั่วไป',
  'นักจัดการงานทั่วไปชำนาญการ',
  'นักวิชาการสหกรณ์ปฏิบัติการ',
  'นักวิชาการสหกรณ์ชำนาญการพิเศษ',
  'นิติกรปฏิบัติการ',
  'นิติกรชำนาญการ',
  'เจ้าพนักงานส่งเสริมสหกรณ์',
  'เจ้าพนักงานส่งเสริมสหกรณ์ชำนาญงาน',
  'เจ้าพนักงานส่งเสริมสหกรณ์อาวุโส',
  'นายช่างโยธาอาวุโส',
  'นักวิเคราะห์นโยบายและแผน',
  'นิติกร',
  'นักวิชาการสหกรณ์',
  'นักวิชาการมาตราฐานสินค้า',
  'เจ้าพนักงานธุรการ',
  'เจ้าพนักงานการเงินและบัญชี',
  'พนักงานขับรถยนต์',
  'พนักงานขับรถยนต์ ส2',
];

const DEPARTMENT_OPTIONS = [
  'ฝ่ายบริหารทั่วไป',
  'กลุ่มจัดตั้งและส่งเสริมสหกรณ์',
  'กลุ่มส่งเสริมและพัฒนาการบริหารการจัดการสหกรณ์',
  'กลุ่มส่งเสริมและพัฒนาธุรกิจสหกรณ์',
  'กลุ่มตรวจการสหกรณ์',
  'กลุ่มส่งเสริมสหกรณ์ 1',
  'กลุ่มส่งเสริมสหกรณ์ 2',
  'กลุ่มส่งเสริมสหกรณ์ 3',
  'กลุ่มส่งเสริมสหกรณ์ 4',
  'กลุ่มส่งเสริมสหกรณ์ 5',
  'กลุ่มส่งเสริมสหกรณ์ 6',
  'กลุ่มส่งเสริมสหกรณ์ 7',
  'กลุ่มส่งเสริมสหกรณ์ 8',
  'นิคมสหกรณ์ดงมูล',
];

const AVATAR_PRESETS = [
  {
    label: 'เจ้าหน้าที่หญิง 1 (ทางการ)',
    gender: 'หญิง',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    label: 'เจ้าหน้าที่หญิง 2',
    gender: 'หญิง',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    label: 'เจ้าหน้าที่ชาย 1 (ทางการ)',
    gender: 'ชาย',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    label: 'เจ้าหน้าที่ชาย 2',
    gender: 'ชาย',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  },
];

const normalizeGender = (user) => {
  if (user?.gender === 'หญิง' || user?.gender === 'ชาย') return user.gender;
  return /^นาย/.test((user?.name || '').trim()) ? 'ชาย' : 'หญิง';
};

function extractEnglishNameFields(user) {
  if (user?.firstNameEn || user?.lastNameEn) {
    const rawPfx = user.prefixEn === 'Ms.' ? 'Miss' : user.prefixEn;
    return {
      prefixEn: rawPfx || (user.gender === 'ชาย' ? 'Mr.' : 'Miss'),
      firstNameEn: user.firstNameEn || '',
      lastNameEn: user.lastNameEn || '',
      englishName: user.englishName || `${rawPfx || ''} ${user.firstNameEn || ''} ${user.lastNameEn || ''}`.trim(),
    };
  }
  const raw = user?.englishName || '';
  if (!raw.trim()) {
    const isMale = user?.gender === 'ชาย' || user?.prefix?.includes('นาย');
    return {
      prefixEn: isMale ? 'Mr.' : 'Miss',
      firstNameEn: '',
      lastNameEn: '',
      englishName: '',
    };
  }
  const parts = raw.trim().split(/\s+/);
  const firstLower = parts[0].toLowerCase().replace(/\.$/, '');
  let prefixEn = 'Mr.';
  let firstNameEn = '';
  let lastNameEn = '';
  if (['mr', 'mrs', 'ms', 'miss'].includes(firstLower)) {
    prefixEn = firstLower === 'mr' ? 'Mr.' : (firstLower === 'mrs' ? 'Mrs.' : 'Miss');
    firstNameEn = parts[1] || '';
    lastNameEn = parts.slice(2).join(' ') || '';
  } else {
    prefixEn = user?.gender === 'ชาย' || user?.prefix?.includes('นาย') ? 'Mr.' : ((user?.prefix?.includes('นาง') && !user?.prefix?.includes('นางสาว')) ? 'Mrs.' : 'Miss');
    firstNameEn = parts[0] || '';
    lastNameEn = parts.slice(1).join(' ') || '';
  }
  return {
    prefixEn,
    firstNameEn,
    lastNameEn,
    englishName: raw,
  };
}

function extractThaiNameFields(user) {
  let prefix = user?.prefix || '';
  let firstName = user?.firstName || '';
  let lastName = user?.lastName || '';
  let name = (user?.name || '').trim();

  if (!firstName && name) {
    const prefixes = ['นางสาว', 'น.ส.', 'นาง', 'นาย', 'ดร.', 'ศ.', 'รศ.', 'ผศ.'];
    for (const p of prefixes) {
      if (name.startsWith(p)) {
        prefix = p;
        const rest = name.slice(p.length).trim();
        const parts = rest.split(/\s+/).filter(Boolean);
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
        break;
      }
    }
    if (!firstName) {
      const parts = name.split(/\s+/).filter(Boolean);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
  }

  if (!prefix) {
    prefix = user?.gender === 'ชาย' || /^นาย/.test(name) ? 'นาย' : 'นางสาว';
  }

  const fullName = name || `${prefix}${firstName} ${lastName}`.trim();
  return { prefix, firstName, lastName, name: fullName };
}

export default function SettingsView() {
  const { currentUser, updateUserProfile, resetToDefault, showToast, changeUserPassword } = useLeave();

  const initialTh = extractThaiNameFields(currentUser);
  const initialEn = extractEnglishNameFields(currentUser);

  const [formData, setFormData] = useState({
    name: initialTh.name,
    prefix: initialTh.prefix,
    firstName: initialTh.firstName,
    lastName: initialTh.lastName,
    prefixEn: initialEn.prefixEn,
    firstNameEn: initialEn.firstNameEn,
    lastNameEn: initialEn.lastNameEn,
    englishName: initialEn.englishName,
    gender: normalizeGender(currentUser),
    employmentType: currentUser?.employmentType || 'ข้าราชการ',
    title: currentUser?.title || '',
    department: currentUser?.department || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    employeeId: currentUser?.employeeId || '',
    avatar: currentUser?.avatar || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // ส่วนจัดการรหัสผ่าน (Password Management)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // ซิงก์ข้อมูลในฟอร์มเมื่อ currentUser ในระบบเปลี่ยนแปลง
  useEffect(() => {
    if (currentUser) {
      const th = extractThaiNameFields(currentUser);
      const en = extractEnglishNameFields(currentUser);
      setFormData({
        name: th.name,
        prefix: th.prefix,
        firstName: th.firstName,
        lastName: th.lastName,
        prefixEn: en.prefixEn,
        firstNameEn: en.firstNameEn,
        lastNameEn: en.lastNameEn,
        englishName: en.englishName,
        gender: normalizeGender(currentUser),
        employmentType: currentUser.employmentType || 'ข้าราชการ',
        title: currentUser.title || '',
        department: currentUser.department || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        employeeId: currentUser.employeeId || '',
        avatar: currentUser.avatar || '',
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullThaiName = `${formData.prefix || ''}${formData.firstName} ${formData.lastName || ''}`.trim();
    if (!formData.firstName?.trim() && !formData.name?.trim()) {
      if (showToast) showToast('กรุณากรอกชื่อจริงภาษาไทย', 'error');
      return;
    }

    const cleanEmail = (formData.email || '').trim();
    if (!cleanEmail) {
      if (showToast) showToast('กรุณากรอกอีเมลติดต่อ', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      if (showToast) showToast('รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', 'error');
      return;
    }

    const payload = {
      ...formData,
      id: currentUser?.id,
      raw_id: currentUser?.raw_id,
      userId: currentUser?.raw_id || currentUser?.userId,
      employeeId: currentUser?.employeeId || formData.employeeId,
      oldEmail: currentUser?.email,
      email: cleanEmail,
      name: fullThaiName || formData.name,
    };

    if (updateUserProfile) {
      const res = await updateUserProfile(payload);
      if (res) {
        setFormData((prev) => ({ ...prev, email: cleanEmail }));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    }
  };

  const handleSelectAvatar = (url, gender) => {
    setFormData((prev) => ({
      ...prev,
      avatar: url,
      gender: gender || prev.gender,
    }));
    setShowAvatarPicker(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      if (showToast) showToast('กรุณาระบุรหัสผ่านปัจจุบัน', 'error');
      return;
    }
    if (!passwordData.newPassword) {
      if (showToast) showToast('กรุณาระบุรหัสผ่านใหม่', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      if (showToast) showToast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      if (showToast) showToast('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (changeUserPassword) {
        const res = await changeUserPassword(passwordData.currentPassword, passwordData.newPassword);
        if (res && res.success) {
          setPasswordSuccess(true);
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setTimeout(() => setPasswordSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 w-full font-prompt pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            โปรไฟล์ & ข้อมูลเจ้าหน้าที่
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mt-1">
          การตั้งค่าและแก้ไขข้อมูลส่วนบุคคล
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          สำนักงานสหกรณ์จังหวัดขอนแก่น — ปรับปรุงข้อมูลส่วนตัว เพศ และช่องทางการติดต่อ
        </p>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-3 text-emerald-900 text-sm shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold">บันทึกข้อมูลส่วนบุคคลเรียบร้อยแล้ว!</p>
            <p className="text-xs text-emerald-700">
              ข้อมูลชื่อ เพศ ตำแหน่ง และแผนกของท่านได้รับการอัปเดตลงระบบเรียบร้อยแล้ว
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
                className="absolute -bottom-2 -right-2 p-1.5 bg-[#2F855A] text-white rounded-xl shadow-md hover:bg-[#256F4A] transition-all"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-slate-800">{formData.name || 'เจ้าหน้าที่สหกรณ์'}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {formData.gender === 'ชาย' ? 'ชาย' : 'หญิง'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {currentUser?.role === 'approver' || currentUser?.role === 'admin' ? 'ผู้อนุมัติ' : 'เจ้าหน้าที่'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{formData.department || 'สำนักงานสหกรณ์จังหวัดขอนแก่น'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="self-start sm:self-center px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60"
          >
            เลือกรูปโปรไฟล์
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
                  onClick={() => handleSelectAvatar(preset.url, preset.gender)}
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
        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          {/* Row 1: ชื่อ - นามสกุล (ภาษาไทย) (แยก คำนำหน้า, ชื่อ, นามสกุล) */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold mb-1">
              <User className="w-4 h-4 text-emerald-600" />
              <span>ชื่อ - นามสกุล (ภาษาไทย)</span>
              <span className="text-slate-400 font-normal text-xs">(แยก คำนำหน้า, ชื่อจริง, นามสกุล) <span className="text-rose-500">*</span></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">คำนำหน้า (ไทย)</label>
                <select
                  value={formData.prefix || 'นางสาว'}
                  onChange={(e) => {
                    const newPrefix = e.target.value;
                    const isMale = newPrefix === 'นาย';
                    const newGender = isMale ? 'ชาย' : (['นาง', 'นางสาว'].includes(newPrefix) ? 'หญิง' : formData.gender);
                    const newPrefixEn = isMale ? 'Mr.' : (newPrefix === 'นาง' ? 'Mrs.' : 'Miss');
                    const newFullName = `${newPrefix}${formData.firstName || ''} ${formData.lastName || ''}`.trim();
                    setFormData((prev) => ({
                      ...prev,
                      prefix: newPrefix,
                      gender: newGender,
                      prefixEn: prev.prefixEn || newPrefixEn,
                      name: newFullName,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all font-medium cursor-pointer"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ดร.">ดร.</option>
                  <option value="">(ไม่มี)</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  ชื่อจริง (First Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => {
                    const newFirst = e.target.value;
                    const newFullName = `${formData.prefix || ''}${newFirst} ${formData.lastName || ''}`.trim();
                    setFormData((prev) => ({
                      ...prev,
                      firstName: newFirst,
                      name: newFullName,
                    }));
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all font-medium"
                  placeholder="กรอกชื่อจริง"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  นามสกุล (Last Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => {
                    const newLast = e.target.value;
                    const newFullName = `${formData.prefix || ''}${formData.firstName || ''} ${newLast}`.trim();
                    setFormData((prev) => ({
                      ...prev,
                      lastName: newLast,
                      name: newFullName,
                    }));
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all font-medium"
                  placeholder="เช่น ธรรมเมือง"
                />
              </div>
            </div>
          </div>

          {/* Row: เพศ (Gender) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              เพศ (Gender) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[
                { value: 'หญิง', label: 'หญิง (ญ)' },
                { value: 'ชาย', label: 'ชาย (ช)' },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g.value })}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    formData.gender === g.value
                      ? 'bg-[#2F855A] text-white border-[#2F855A] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row: ชื่อภาษาอังกฤษ (แยก คำนำหน้า, ชื่อ, นามสกุล) */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold mb-1">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>ชื่อ - นามสกุล (ภาษาอังกฤษ)</span>
              <span className="text-slate-400 font-normal text-xs">(แยก คำนำหน้า, ชื่อ, นามสกุล)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">คำนำหน้า (Title)</label>
                <select
                  aria-label="คำนำหน้าภาษาอังกฤษ"
                  value={formData.prefixEn === 'Ms.' ? 'Miss' : (formData.prefixEn || (formData.gender === 'ชาย' ? 'Mr.' : 'Miss'))}
                  onChange={(e) => {
                    const newPrefixEn = e.target.value;
                    const newFullNameEn = `${newPrefixEn} ${formData.firstNameEn || ''} ${formData.lastNameEn || ''}`.trim();
                    setFormData({ ...formData, prefixEn: newPrefixEn, englishName: newFullNameEn });
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all cursor-pointer font-medium"
                >
                  <option value="Mr.">Mr. (นาย)</option>
                  <option value="Mrs.">Mrs. (นาง)</option>
                  <option value="Miss">Miss (นางสาว)</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">ชื่อภาษาอังกฤษ (First Name)</label>
                <input
                  type="text"
                  value={formData.firstNameEn}
                  onChange={(e) => {
                    const newFirst = e.target.value;
                    const p = formData.prefixEn === 'Ms.' ? 'Miss' : (formData.prefixEn || (formData.gender === 'ชาย' ? 'Mr.' : 'Miss'));
                    setFormData({ 
                      ...formData, 
                      firstNameEn: newFirst, 
                      englishName: `${p} ${newFirst} ${formData.lastNameEn || ''}`.trim() 
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="First Name"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">นามสกุลภาษาอังกฤษ (Last Name)</label>
                <input
                  type="text"
                  value={formData.lastNameEn}
                  onChange={(e) => {
                    const newLast = e.target.value;
                    const p = formData.prefixEn === 'Ms.' ? 'Miss' : (formData.prefixEn || (formData.gender === 'ชาย' ? 'Mr.' : 'Miss'));
                    setFormData({ 
                      ...formData, 
                      lastNameEn: newLast, 
                      englishName: `${p} ${formData.firstNameEn || ''} ${newLast}`.trim() 
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="เช่น Thammoeang"
                />
              </div>
            </div>
          </div>

          {/* Row: ประเภทการจ้างงาน */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ประเภทการจ้างงาน
            </label>
            <select
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all cursor-pointer"
            >
              <option value="ข้าราชการ">ข้าราชการ</option>
              <option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option>
              <option value="พนักงานราชการ">พนักงานราชการ</option>
            </select>
          </div>

          {/* Row 2: ตำแหน่งงาน และ ฝ่าย/กลุ่มงาน */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งงาน</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  aria-label="ตำแหน่งงาน"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full max-w-full truncate pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer ${
                    formData.title ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  <option value="" className="text-slate-400">
                    -- เลือกตำแหน่งงาน --
                  </option>
                  {formData.title && !JOB_TITLE_OPTIONS.includes(formData.title) && (
                    <option value={formData.title} className="text-slate-800">
                      {formData.title}
                    </option>
                  )}
                  {JOB_TITLE_OPTIONS.map((jobTitle) => (
                    <option key={jobTitle} value={jobTitle} className="text-slate-800">
                      {jobTitle}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="min-w-0">
              <label className="block font-semibold text-slate-700 mb-1">ฝ่าย / กลุ่มงาน</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  aria-label="ฝ่าย / กลุ่มงาน"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full max-w-full truncate pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer ${
                    formData.department ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  <option value="" className="text-slate-400">
                    -- เลือกสังกัดกลุ่ม / ฝ่าย --
                  </option>
                  {formData.department && !DEPARTMENT_OPTIONS.includes(formData.department) && (
                    <option value={formData.department} className="text-slate-800">
                      {formData.department}
                    </option>
                  )}
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept} className="text-slate-800">
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 3: อีเมลติดต่อ และ เบอร์โทรศัพท์ติดต่อ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">อีเมลติดต่อ</label>
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
                resetToDefault();
              }}
              className="flex items-center justify-center space-x-2 text-xs text-slate-500 hover:text-slate-800 py-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเฟรชข้อมูลจากระบบ</span>
            </button>

            <button
              type="submit"
              className={`flex items-center justify-center space-x-2 px-7 py-2.5 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] ${
                savedSuccess
                  ? 'bg-emerald-600 ring-2 ring-emerald-400'
                  : 'bg-[#2F855A] hover:bg-[#256F4A]'
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

      {/* Password Change Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                เปลี่ยนรหัสผ่าน (Change Password)
              </h3>
              <p className="text-xs text-slate-400">
                อัปเดตรหัสผ่านสำหรับเข้าสู่ระบบของท่าน (ความยาวอย่างน้อย 8 ตัวอักษร)
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Current Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              รหัสผ่านปัจจุบัน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                placeholder="ระบุรหัสผ่านเดิมที่ใช้งานอยู่"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                รหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 transition-all"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className={`flex items-center justify-center space-x-2 px-6 py-2.5 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 ${
                passwordSuccess
                  ? 'bg-emerald-600 ring-2 ring-emerald-400'
                  : 'bg-[#2F855A] hover:bg-[#256F4A]'
              }`}
            >
              {passwordSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  <span>เปลี่ยนรหัสผ่านสำเร็จ!</span>
                </>
              ) : isUpdatingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>บันทึกรหัสผ่านใหม่</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
