import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Building,
  Mail,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLeave } from '../context/LeaveContext';

const JOB_TITLE_OPTIONS = [
  'นักวิชาการสหกรณ์ชำนาญการ',
  'นักจัดการงานทั่วไป',
  'นักวิชาการสหกรณ์ปฏิบัติการ',
  'นักวิชาการสหกรณ์ชำนาญการพิเศษ',
  'นิติกรปฏิบัติการ',
  'นิติกรชำนาญการ',
  'เจ้าพนักงานส่งเสริมสหกรณ์',
  'เจ้าพนักงานส่งเสริมสหกรณ์อาวุโส',
  'นายช่างโยธาอาวุโส',
  'นักวิเคราะห์นโยบายและแผน',
  'นิติกร',
  'นักวิชาการสหกรณ์',
  'นักวิชาการมาตราฐานสินค้า',
  'เจ้าพนักงานธุรการ',
  'เจ้าพนักงานการเงินและบัญชี',
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

const EMPLOYMENT_TYPE_OPTIONS = [
  'ข้าราชการ',
  'ลูกจ้างประจำ',
  'พนักงานราชการ',
  'ลูกจ้างเหมาบริการ',
];

export default function RegisterView({ onSwitchToLogin }) {
  const { register } = useLeave();

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    email: '',
    title: '',
    department: '',
    employmentType: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-generate valid ASCII email preview when empty
  const handleNameChange = (e) => {
    const val = e.target.value;
    const asciiSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s.]/g, '')
      .trim()
      .replace(/\s+/g, '.');
    setFormData((prev) => ({
      ...prev,
      fullName: val,
      email: prev.email ? prev.email : asciiSlug ? `${asciiSlug}@smartleave.com` : '',
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validation
    if (!formData.fullName.trim()) {
      setError('กรุณากรอกชื่อ - นามสกุล');
      return;
    }
    if (!formData.gender) {
      setError('กรุณาเลือกเพศ');
      return;
    }
    if (!formData.title.trim()) {
      setError('กรุณาเลือกตำแหน่งงาน');
      return;
    }
    if (!formData.department.trim()) {
      setError('กรุณาเลือกสังกัดกลุ่ม / ฝ่าย');
      return;
    }
    if (!formData.employmentType) {
      setError('กรุณาเลือกประเภทการจ้างงาน');
      return;
    }
    if (!formData.password) {
      setError('กรุณากำหนดรหัสผ่าน');
      return;
    }
    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(async () => {
      try {
        // Register through LeaveContext into D1 Database
        await register({
          fullName: formData.fullName.trim(),
          gender: formData.gender,
          title: formData.title.trim(),
          department: formData.department.trim(),
          employmentType: formData.employmentType,
          email: formData.email.trim(),
          password: formData.password,
        });

        // Fire celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-prompt">
      {/* Decorative background glow & shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">

        {/* Left Side: Brand Visual & Feature Highlights (5 of 12 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F3D24] via-[#123E24] to-[#165632] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center space-x-3.5">
              <div className="w-16 h-16 rounded-full bg-white/10 p-1.5 shadow-lg shadow-emerald-950/40 border-2 border-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="สำนักงานสหกรณ์จังหวัดขอนแก่น"
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-prompt">
                  SmartLeave
                </h1>
                <p className="text-xs font-medium text-emerald-200/90 leading-tight">
                  สำนักงานสหกรณ์จังหวัดขอนแก่น
                </p>
                <p className="text-[10.5px] text-emerald-300/70 mt-0.5">
                  ระบบบริหารจัดการวันเวลาของการลา
                </p>
              </div>
            </div>

            {/* Intro text */}
            <div className="mt-8 space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                เริ่มต้นใช้งานระบบ SmartLeave วันนี้
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
                ลงทะเบียนเพื่อเข้าถึงระบบยื่นคำขอลาออนไลน์ ติดตามวันลาคงเหลือ และเชื่อมต่อกับปฏิทินขององค์กร
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="relative z-10 my-8 space-y-3.5">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">รับสิทธิวันลาทันที</p>
                <p className="text-emerald-200/70 text-[11px]">ได้รับโควตาลาพักร้อน ลากิจ ลาป่วย และลาคลอดอัตโนมัติ</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">ปฏิทินกลางขององค์กร</p>
                <p className="text-emerald-200/70 text-[11px]">ซิงก์ตารางวันลาร่วมกับบุคลากรในฝ่ายได้ทันที</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-lime-400/20 text-lime-300 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">ความปลอดภัยสูงสุด</p>
                <p className="text-emerald-200/70 text-[11px]">ข้อมูลถูกจัดเก็บและเข้าถึงได้เฉพาะผู้มีสิทธิ์</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 pt-4 border-t border-emerald-800/40 text-[11px] text-emerald-300/60 flex items-center justify-between">
            <span>© 2026 SmartLeave Inc.</span>
            <span>ระบบทรัพยากรบุคคลดิจิทัล</span>
          </div>
        </div>

        {/* Right Side: Registration Form (7 of 12 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Mobile Brand Header */}
            <div className="flex lg:hidden items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full p-1 bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="สำนักงานสหกรณ์จังหวัดขอนแก่น"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#113C22] font-prompt leading-tight">SmartLeave</h1>
                <p className="text-xs text-slate-500 font-medium">สำนักงานสหกรณ์จังหวัดขอนแก่น</p>
              </div>
            </div>

            {/* Top Switcher Link */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                ลงทะเบียนสมาชิกใหม่
              </span>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-0.5" />
                <span>กลับสู่หน้าเข้าสู่ระบบ</span>
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 font-prompt">
              สร้างบัญชีผู้ใช้ใหม่
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              กรอกข้อมูลส่วนบุคคล ตำแหน่งงาน และสังกัดกลุ่ม/ฝ่ายเพื่อลงทะเบียน
            </p>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center space-x-2 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-xs sm:text-sm">

              {/* 1. ชื่อ - นามสกุล */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={handleNameChange}
                    placeholder="เช่น นายชาญชัย มิ่งขวัญ"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 1.5 เพศ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เพศ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="เพศ">
                  {[
                    { value: 'ชาย', label: 'ชาย' },
                    { value: 'หญิง', label: 'หญิง' },
                  ].map((option) => {
                    const isSelected = formData.gender === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, gender: option.value }));
                          setError('');
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. ตำแหน่งงาน และ สังกัดกลุ่ม/ฝ่าย (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ตำแหน่งงาน */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่งงาน (Job Title) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                      aria-label="ตำแหน่งงาน"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, title: e.target.value }));
                        setError('');
                      }}
                      className={`w-full max-w-full truncate pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all appearance-none cursor-pointer ${
                        formData.title ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      <option value="" className="text-slate-400">
                        -- เลือกตำแหน่งงาน --
                      </option>
                      {JOB_TITLE_OPTIONS.map((jobTitle) => (
                        <option key={jobTitle} value={jobTitle} className="text-slate-800">
                          {jobTitle}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* สังกัดกลุ่ม/ฝ่าย */}
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สังกัดกลุ่ม / ฝ่าย <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <select
                      aria-label="สังกัดกลุ่ม / ฝ่าย"
                      value={formData.department}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, department: e.target.value }));
                        setError('');
                      }}
                      className={`w-full max-w-full truncate pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all appearance-none cursor-pointer ${
                        formData.department ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      <option value="" className="text-slate-400">
                        -- เลือกสังกัดกลุ่ม / ฝ่าย --
                      </option>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <option key={dept} value={dept} className="text-slate-800">
                          {dept}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2.5 ประเภทการจ้างงาน */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทการจ้างงาน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <select
                    aria-label="ประเภทการจ้างงาน"
                    value={formData.employmentType}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, employmentType: e.target.value }));
                      setError('');
                    }}
                    className={`w-full max-w-full truncate pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all appearance-none cursor-pointer ${
                      formData.employmentType ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    <option value="" className="text-slate-400">
                      -- เลือกประเภทการจ้างงาน --
                    </option>
                    {EMPLOYMENT_TYPE_OPTIONS.map((empType) => (
                      <option key={empType} value={empType} className="text-slate-800">
                        {empType}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* อีเมลสำหรับเข้าสู่ระบบ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมลองค์กร (สำหรับเข้าสู่ระบบ)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="username@smartleave.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 3. รหัสผ่าน และ ยืนยันรหัสผ่าน (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* รหัสผ่าน */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setError('');
                      }}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* ยืนยันรหัสผ่าน */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        setError('');
                      }}
                      placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-300 bg-red-50/20'
                          : 'border-slate-200'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password matching hint */}
              {formData.confirmPassword && (
                <div className="text-[11px] flex items-center space-x-1 mt-0.5">
                  {formData.password === formData.confirmPassword ? (
                    <span className="text-emerald-700 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      รหัสผ่านตรงกันสมบูรณ์
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      รหัสผ่านไม่ตรงกัน
                    </span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-4 bg-[#155A32] hover:bg-[#114929] text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ยืนยันการสมัครสมาชิก</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to login link */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-600">
                มีบัญชีผู้ใช้อยู่แล้ว?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  เข้าสู่ระบบที่นี่
                </button>
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              การสมัครสมาชิกนี้ถือว่ายอมรับนโยบายการใช้งานระบบลางานขององค์กร
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

