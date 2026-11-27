import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
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
  Upload,
  Edit3,
  X,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { POSITIONS_BY_EMPLOYMENT_TYPE, JOB_TITLE_OPTIONS, DEPARTMENT_OPTIONS } from '../RegisterView';

const AVATAR_PRESETS = [
  {
    label: 'รูปโปรไฟล์',
    gender: 'ทั่วไป',
    url: 'https://i.pinimg.com/736x/f5/47/d8/f547d800625af9056d62efe8969aeea0.jpg',
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
  let prefix = (user?.prefix || '').trim();
  let firstName = (user?.firstName || '').trim();
  let lastName = (user?.lastName || '').trim();
  let name = (user?.name || '').trim();

  const prefixes = [
    'นางสาว', 'น.ส.', 'นาง', 'นาย', 'ดร.', 'ศ.', 'รศ.', 'ผศ.',
    'ร้อยเอก', 'ร้อยโท', 'ร้อยตรี', 'พันเอก', 'พันโท', 'พันตรี',
    'ว่าที่ ร.ต.', 'ว่าที่ร้อยตรี'
  ];

  if (prefix && firstName.startsWith(prefix)) {
    while (firstName.startsWith(prefix)) {
      firstName = firstName.slice(prefix.length).trim();
    }
  }

  if (!firstName && name) {
    if (prefix && name.startsWith(prefix)) {
      const rest = name.slice(prefix.length).trim();
      const parts = rest.split(/\s+/).filter(Boolean);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    } else {
      for (const p of prefixes) {
        if (name.startsWith(p)) {
          if (!prefix) prefix = p;
          const rest = name.slice(p.length).trim();
          const parts = rest.split(/\s+/).filter(Boolean);
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
          break;
        }
      }
    }
    if (!firstName) {
      const parts = name.split(/\s+/).filter(Boolean);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
  }

  if (firstName) {
    let stripped = true;
    while (stripped && firstName) {
      stripped = false;
      if (prefix && firstName.startsWith(prefix)) {
        firstName = firstName.slice(prefix.length).trim();
        stripped = true;
        continue;
      }
      for (const p of prefixes) {
        if (firstName.startsWith(p)) {
          if (!prefix) prefix = p;
          firstName = firstName.slice(p.length).trim();
          stripped = true;
          break;
        }
      }
    }
  }

  if (!prefix) {
    prefix = user?.gender === 'ชาย' || /^นาย/.test(name) ? 'นาย' : 'นางสาว';
  }

  const fullName = `${prefix}${firstName}${lastName ? ' ' + lastName : ''}`.trim();
  return { prefix, firstName, lastName, name: fullName };
}

export default function SettingsView() {
  const { currentUser, updateUserProfile, resetToDefault, showToast, changeUserPassword } = useLeave();

  const initialTh = extractThaiNameFields(currentUser);
  const initialEn = extractEnglishNameFields(currentUser);

  const standardPrefixes = ['นาย', 'นาง', 'นางสาว', 'ดร.'];
  const [profileData, setProfileData] = useState(() => currentUser || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [prefixChoice, setPrefixChoice] = useState(() => {
    const p = initialTh.prefix?.trim();
    if (standardPrefixes.includes(p)) return p;
    if (p) return 'อื่นๆ';
    return initialTh.gender === 'ชาย' ? 'นาย' : 'นางสาว';
  });
  const [customPrefix, setCustomPrefix] = useState(() => {
    const p = initialTh.prefix?.trim();
    return standardPrefixes.includes(p) ? '' : p;
  });

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
    title: currentUser?.title || currentUser?.position || '',
    department: currentUser?.department || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    employeeId: currentUser?.employeeId || '',
    avatar: currentUser?.avatar || '',
  });

  // ดึงข้อมูลโปรไฟล์ล่าสุดโดยตรงจากฐานข้อมูล D1 มาแสดงในหน้าข้อมูลส่วนตัว
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFreshProfileFromDb = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      let dbUser = null;
      if (api && api.getProfile) {
        const res = await api.getProfile().catch(() => null);
        if (res && res.success && res.user) {
          dbUser = res.user;
        }
      }
      if (!dbUser && api && api.getEmployees && currentUser) {
        const emps = await api.getEmployees().catch(() => []);
        if (Array.isArray(emps)) {
          dbUser = emps.find(
            (e) =>
              (e.raw_id && currentUser.raw_id && Number(e.raw_id) === Number(currentUser.raw_id)) ||
              (e.id && currentUser.id && String(e.id) === String(currentUser.id)) ||
              (e.employeeId && currentUser.employeeId && e.employeeId.toLowerCase() === currentUser.employeeId.toLowerCase()) ||
              (e.email && currentUser.email && e.email.toLowerCase() === currentUser.email.toLowerCase())
          );
        }
      }

      if (dbUser) {
        const userToUse = { ...currentUser, ...dbUser };
        setProfileData(userToUse);

        const th = extractThaiNameFields(userToUse);
        const en = extractEnglishNameFields(userToUse);

        const standardList = ['นาย', 'นาง', 'นางสาว', 'ดร.'];
        const userPfx = (th.prefix || '').trim();
        if (standardList.includes(userPfx)) {
          setPrefixChoice(userPfx);
          setCustomPrefix('');
        } else if (userPfx) {
          setPrefixChoice('อื่นๆ');
          setCustomPrefix(userPfx);
        } else {
          setPrefixChoice(userToUse.gender === 'ชาย' ? 'นาย' : 'นางสาว');
          setCustomPrefix('');
        }

        setFormData({
          name: th.name,
          prefix: userPfx || (userToUse.gender === 'ชาย' ? 'นาย' : 'นางสาว'),
          firstName: th.firstName,
          lastName: th.lastName,
          prefixEn: en.prefixEn,
          firstNameEn: en.firstNameEn,
          lastNameEn: en.lastNameEn,
          englishName: en.englishName,
          gender: normalizeGender(userToUse),
          employmentType: userToUse.employmentType || 'ข้าราชการ',
          title: userToUse.title || userToUse.position || '',
          department: userToUse.department || '',
          email: userToUse.email || '',
          phone: userToUse.phone || '',
          employeeId: userToUse.employeeId || '',
          avatar: userToUse.avatar || '',
        });
        if (manual && showToast) {
          showToast('รีเฟรชข้อมูลล่าสุดจากระบบเรียบร้อยแล้ว', 'success');
        }
      } else if (manual) {
        if (resetToDefault) resetToDefault();
        if (showToast) showToast('รีเฟรชข้อมูลจากระบบเรียบร้อยแล้ว', 'success');
      }
    } catch (err) {
      console.log('[SettingsView] fetchFreshProfileFromDb Note:', err.message);
    } finally {
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFreshProfileFromDb(false);
  }, []);

  const openEditModal = () => {
    const active = profileData || currentUser;
    const th = extractThaiNameFields(active);
    const en = extractEnglishNameFields(active);

    const standardList = ['นาย', 'นาง', 'นางสาว', 'ดร.'];
    const userPfx = (th.prefix || '').trim();
    if (standardList.includes(userPfx)) {
      setPrefixChoice(userPfx);
      setCustomPrefix('');
    } else if (userPfx) {
      setPrefixChoice('อื่นๆ');
      setCustomPrefix(userPfx);
    } else {
      setPrefixChoice(active?.gender === 'ชาย' ? 'นาย' : 'นางสาว');
      setCustomPrefix('');
    }

    setFormData({
      name: th.name,
      prefix: userPfx || (active?.gender === 'ชาย' ? 'นาย' : 'นางสาว'),
      firstName: th.firstName,
      lastName: th.lastName,
      prefixEn: en.prefixEn,
      firstNameEn: en.firstNameEn,
      lastNameEn: en.lastNameEn,
      englishName: en.englishName,
      gender: normalizeGender(active),
      employmentType: active?.employmentType || 'ข้าราชการ',
      title: active?.title || active?.position || '',
      department: active?.department || '',
      email: active?.email || '',
      phone: active?.phone || '',
      employeeId: active?.employeeId || '',
      avatar: active?.avatar || '',
    });
    setIsEditModalOpen(true);
  };

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const fileInputRef = useRef(null);
  const isFormDirtyRef = useRef(false);
  const lastUserKeyRef = useRef(currentUser?.id || currentUser?.raw_id || currentUser?.email || '');

  const updateFormField = (updater) => {
    isFormDirtyRef.current = true;
    setFormData(updater);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (showToast) showToast('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WEBP)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      if (showToast) showToast('ไฟล์รูปภาพมีขนาดใหญ่เกิน 10MB กรุณาเลือกรูปภาพที่มีขนาดเล็กลง', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to scale down and optimize avatar image for fast loading and database storage
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        updateFormField((prev) => ({ ...prev, avatar: dataUrl }));
        setShowAvatarPicker(false);
        if (showToast) showToast('นำเข้ารูปภาพจากเครื่องสำเร็จแล้ว กรุณากดปุ่ม "บันทึกข้อมูล" ด้านล่าง', 'success');
      };
      img.onerror = () => {
        if (showToast) showToast('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ', 'error');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      if (showToast) showToast('ไม่สามารถอ่านไฟล์ได้', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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

  // ซิงก์ข้อมูลในฟอร์มเมื่อ currentUser ในระบบเปลี่ยนแปลง (เฉพาะเมื่อเปลี่ยนบัญชีหรือยังไม่ได้แก้ไขค้างอยู่)
  useEffect(() => {
    if (!currentUser) return;
    const nextUserKey = currentUser.id || currentUser.raw_id || currentUser.email || '';
    const isSameUser = nextUserKey === lastUserKeyRef.current;
    if (isSameUser && isFormDirtyRef.current) return;
    lastUserKeyRef.current = nextUserKey;

    const th = extractThaiNameFields(currentUser);
    const en = extractEnglishNameFields(currentUser);

    const standardList = ['นาย', 'นาง', 'นางสาว', 'ดร.'];
    const userPfx = (th.prefix || '').trim();
    if (standardList.includes(userPfx)) {
      setPrefixChoice(userPfx);
      setCustomPrefix('');
    } else if (userPfx) {
      setPrefixChoice('อื่นๆ');
      setCustomPrefix(userPfx);
    } else {
      setPrefixChoice(currentUser.gender === 'ชาย' ? 'นาย' : 'นางสาว');
      setCustomPrefix('');
    }

    setFormData({
      name: th.name,
      prefix: userPfx || (currentUser.gender === 'ชาย' ? 'นาย' : 'นางสาว'),
      firstName: th.firstName,
      lastName: th.lastName,
      prefixEn: en.prefixEn,
      firstNameEn: en.firstNameEn,
      lastNameEn: en.lastNameEn,
      englishName: en.englishName,
      gender: normalizeGender(currentUser),
      employmentType: currentUser.employmentType || 'ข้าราชการ',
      title: currentUser.title || currentUser.position || '',
      department: currentUser.department || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      employeeId: currentUser.employeeId || '',
      avatar: currentUser.avatar || '',
    });
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;

    const chosenPrefix = prefixChoice === 'อื่นๆ' ? customPrefix.trim() : prefixChoice;
    if (prefixChoice === 'อื่นๆ' && !chosenPrefix) {
      if (showToast) showToast('กรุณาระบุคำนำหน้าชื่อ', 'error');
      return;
    }

    let cleanFn = (formData.firstName || '').trim();
    if (chosenPrefix && cleanFn.startsWith(chosenPrefix)) {
      cleanFn = cleanFn.slice(chosenPrefix.length).trim();
    }
    const cleanLn = (formData.lastName || '').trim();
    const fullThaiName = `${chosenPrefix}${cleanFn}${cleanLn ? ' ' + cleanLn : ''}`.trim();

    if (!cleanFn && !formData.name?.trim()) {
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
      prefix: chosenPrefix,
      firstName: cleanFn,
      lastName: cleanLn,
      title: formData.title,
      position: formData.title,
      id: currentUser?.id,
      raw_id: currentUser?.raw_id,
      userId: currentUser?.raw_id || currentUser?.userId,
      employeeId: currentUser?.employeeId || formData.employeeId,
      oldEmail: currentUser?.email,
      email: cleanEmail,
      name: fullThaiName || formData.name,
    };

    if (updateUserProfile) {
      setIsSavingProfile(true);
      try {
        const res = await updateUserProfile(payload);
        if (res) {
          isFormDirtyRef.current = false;
          const merged = { ...(profileData || {}), ...payload, ...res };
          setProfileData(merged);
          setFormData((prev) => ({
            ...prev,
            ...merged,
            email: res.email || cleanEmail,
            title: res.title || res.position || payload.title,
            department: res.department || payload.department,
          }));
          setIsEditModalOpen(false);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }
      } finally {
        setIsSavingProfile(false);
      }
    }
  };

  const handleSelectAvatar = (url, gender) => {
    updateFormField((prev) => ({
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

  const displayUser = profileData || currentUser || {};

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
          ข้อมูลส่วนตัว
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          สำนักงานสหกรณ์จังหวัดขอนแก่น — ตรวจสอบและจัดการข้อมูลส่วนบุคคล
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

      {/* Profile Information Display Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        {/* Avatar & Header Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={displayUser.avatar || currentUser?.avatar || 'https://i.pinimg.com/736x/f5/47/d8/f547d800625af9056d62efe8969aeea0.jpg'}
                alt={displayUser.name || 'โปรไฟล์'}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-50 shadow-md transition-all"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="font-bold text-lg text-slate-800">{displayUser.name || 'เจ้าหน้าที่สหกรณ์'}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  (displayUser.gender === 'ชาย') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {displayUser.gender === 'ชาย' ? 'ชาย' : 'หญิง'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {displayUser.employmentType || 'ข้าราชการ'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {currentUser?.role === 'approver' || currentUser?.role === 'admin' ? 'ผู้อนุมัติ' : 'เจ้าหน้าที่'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {displayUser.title || displayUser.position || 'เจ้าหน้าที่'} • {displayUser.department || 'สำนักงานสหกรณ์จังหวัดขอนแก่น'}
              </p>
            </div>
          </div>
        </div>

        {/* 7 Required Profile Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. ชื่อ-สกุล */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1.5 font-medium">
              <User className="w-4 h-4 text-emerald-600" />
              <span>ชื่อ - สกุล</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800">
              {displayUser.name || '-'}
            </p>
            {displayUser.englishName && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                (EN: {displayUser.englishName})
              </p>
            )}
          </div>

          {/* 2. เพศ */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1.5 font-medium">
              <User className="w-4 h-4 text-emerald-600" />
              <span>เพศ</span>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                displayUser.gender === 'ชาย'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {displayUser.gender === 'ชาย' ? 'ชาย' : 'หญิง'}
              </span>
            </div>
          </div>

          {/* 3. ประเภทการจ้างงาน */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1.5 font-medium">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>ประเภทการจ้างงาน</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800">
              {displayUser.employmentType || 'ข้าราชการ'}
            </p>
          </div>

          {/* 4. ตำแหน่งงาน */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1.5 font-medium">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>ตำแหน่งงาน</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800">
              {displayUser.title || displayUser.position || '-'}
            </p>
          </div>

          {/* 5. ฝ่าย / กลุ่มงาน */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-slate-50 transition-colors md:col-span-2">
            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1.5 font-medium">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>ฝ่าย / กลุ่มงาน</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800">
              {displayUser.department || '-'}
            </p>
          </div>

          {/* 6. อีเมลติดต่อ */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1.5 font-medium">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>อีเมลติดต่อ</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800 break-all">
              {displayUser.email || '-'}
            </p>
          </div>

          {/* 7. เบอร์โทรศัพท์ติดต่อ */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1.5 font-medium">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>เบอร์โทรศัพท์ติดต่อ</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800">
              {displayUser.phone || '-'}
            </p>
          </div>
        </div>

        {/* Action Bar Bottom */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-slate-100 gap-3">
          <button
            type="button"
            onClick={() => fetchFreshProfileFromDb(true)}
            disabled={isRefreshing}
            className="flex items-center justify-center space-x-2 text-xs text-slate-500 hover:text-slate-800 py-2 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isRefreshing ? 'กำลังดึงข้อมูลล่าสุด...' : 'รีเฟรชข้อมูลจากระบบ'}</span>
          </button>

          <button
            type="button"
            onClick={openEditModal}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 text-white font-semibold rounded-xl text-xs sm:text-sm bg-[#2F855A] hover:bg-[#256F4A] shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>แก้ไขข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Modal Popup: แก้ไขข้อมูลส่วนตัว */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-800">
                    แก้ไขข้อมูลส่วนตัว
                  </h3>
                  <p className="text-xs text-slate-500">
                    ปรับปรุงข้อมูลชื่อ-สกุล เพศ ตำแหน่ง และช่องทางการติดต่อ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm">
              {/* Avatar Selector Inside Modal */}
              <div className="flex items-center space-x-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <div className="relative group">
                  <img
                    src={formData.avatar || currentUser?.avatar}
                    alt={formData.name}
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-100 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 p-1 bg-[#2F855A] text-white rounded-lg shadow-sm hover:bg-[#256F4A] transition-all cursor-pointer"
                    title="คลิกเพื่อนำเข้ารูปภาพจากเครื่อง"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">รูปภาพโปรไฟล์</p>
                  <p className="text-[11px] text-slate-500 mb-2">อัปโหลดรูปภาพใหม่จากเครื่อง หรือเลือกรูปสำเร็จรูป</p>
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2F855A] hover:bg-[#256F4A] rounded-lg transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>อัปโหลดรูป</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60 cursor-pointer"
                    >
                      เลือกรูปสำเร็จรูป
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden File Input for Image Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              {/* Avatar Preset & Custom Picker */}
              {showAvatarPicker && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">เลือกรูปโปรไฟล์</span>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
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
                        className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${formData.avatar === preset.url
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-12 h-12 rounded-xl object-cover mb-1 shadow-xs"
                        />
                        <span className="text-[10px] text-slate-600 text-center line-clamp-1">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Row 1: ชื่อ - นามสกุล (ภาษาไทย) */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold mb-1">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>ชื่อ - นามสกุล (ภาษาไทย)</span>
                  <span className="text-slate-400 font-normal text-xs">(แยก คำนำหน้า, ชื่อจริง, นามสกุล) <span className="text-rose-500">*</span></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      คำนำหน้า (ไทย) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={prefixChoice}
                        onChange={(e) => {
                          const choice = e.target.value;
                          setPrefixChoice(choice);
                          let newPrefix = choice === 'อื่นๆ' ? customPrefix.trim() : choice;
                          let newGender = formData.gender;
                          let newPrefixEn = formData.prefixEn;
                          if (choice === 'นาย') {
                            newGender = 'ชาย';
                            newPrefixEn = 'Mr.';
                          } else if (choice === 'นาง') {
                            newGender = 'หญิง';
                            newPrefixEn = 'Mrs.';
                          } else if (choice === 'นางสาว') {
                            newGender = 'หญิง';
                            newPrefixEn = 'Miss';
                          }
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
                        <option value="อื่นๆ">อื่นๆ</option>
                      </select>
                    </div>
                  </div>

                  {prefixChoice === 'อื่นๆ' && (
                    <div className="sm:col-span-12 flex items-center space-x-2 p-2.5 bg-emerald-50/70 border border-emerald-300 rounded-xl animate-in fade-in duration-150">
                      <span className="text-xs font-bold text-emerald-800 flex-shrink-0">
                        ระบุคำนำหน้า:
                      </span>
                      <input
                        type="text"
                        value={customPrefix}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomPrefix(val);
                          const newFullName = `${val}${formData.firstName || ''} ${formData.lastName || ''}`.trim();
                          setFormData((prev) => ({
                            ...prev,
                            prefix: val,
                            name: newFullName,
                          }));
                        }}
                        placeholder="พิมพ์คำนำหน้าของท่าน เช่น ว่าที่ ร.ต., ผศ., อาจารย์, พันเอก"
                        className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all font-medium"
                      />
                    </div>
                  )}

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

              {/* Row 2: เพศ */}
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
                      onClick={() => updateFormField({ ...formData, gender: g.value })}
                      className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${formData.gender === g.value
                        ? 'bg-[#2F855A] text-white border-[#2F855A] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: ชื่อภาษาอังกฤษ */}
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

              {/* Row 4: ประเภทการจ้างงาน */}
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

              {/* Row 5: ตำแหน่งงาน และ ฝ่าย/กลุ่มงาน */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งงาน</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <select
                      aria-label="ตำแหน่งงาน"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full max-w-full truncate pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer ${formData.title ? 'text-slate-800' : 'text-slate-400'
                        }`}
                    >
                      <option value="" className="text-slate-400">
                        -- เลือกตำแหน่งงาน --
                      </option>
                      {(() => {
                        const list =
                          formData.employmentType && POSITIONS_BY_EMPLOYMENT_TYPE[formData.employmentType]
                            ? POSITIONS_BY_EMPLOYMENT_TYPE[formData.employmentType]
                            : JOB_TITLE_OPTIONS;
                        return (
                          <>
                            {formData.title && !list.includes(formData.title) && (
                              <option value={formData.title} className="text-slate-800">
                                {formData.title}
                              </option>
                            )}
                            {list.map((jobTitle) => (
                              <option key={jobTitle} value={jobTitle} className="text-slate-800">
                                {jobTitle}
                              </option>
                            ))}
                          </>
                        );
                      })()}
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
                      className={`w-full max-w-full truncate pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all appearance-none cursor-pointer ${formData.department ? 'text-slate-800' : 'text-slate-400'
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

              {/* Row 6: อีเมลติดต่อ และ เบอร์โทรศัพท์ติดต่อ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อีเมลติดต่อ <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
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

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-colors text-xs sm:text-sm cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-[#2F855A] hover:bg-[#256F4A] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังบันทึก...</span>
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
        </div>
      )}

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
              className={`flex items-center justify-center space-x-2 px-6 py-2.5 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 ${passwordSuccess
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
