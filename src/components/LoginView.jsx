import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  Check,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function LoginView({ onSwitchToRegister, onSwitchToForgotPassword }) {
  const { login } = useLeave();

  const [email, setEmail] = useState('panika.t@smartleave.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    {
      id: 'panika',
      name: 'นางสาวพนิกา ธรรมเมือง',
      role: 'พนักงานทั่วไป (User View)',
      email: 'panika.t@smartleave.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80',
      badge: '👤 แดชบอร์ดพนักงาน ยื่นขอลา',
      desc: 'ตรวจเช็กวันลาคงเหลือ, ยื่นคำขอลา, ดูประวัติส่วนตัว',
    },
    {
      id: 'somchai',
      name: 'นายสมชาย มั่นคง',
      role: 'ผู้ดูแลระบบและผู้อนุมัติ (Admin View)',
      email: 'somchai.m@smartleave.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&h=128&q=80',
      badge: '👑 แดชบอร์ดผู้บริหาร จัดการโควตา',
      desc: 'อนุมัติคำขอด่วน, จัดการพนักงานทั้งองค์กร, รายงานสถิติ',
    },
  ];

  const handleSelectDemoAccount = (acc) => {
    setEmail(acc.email);
    setPassword('123456');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('กรุณากรอกอีเมล');
      return;
    }
    if (!password) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (!success) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-prompt">
      {/* Decorative background glow & shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">

        {/* Left Side: Brand Visual & Feature Highlights (5 of 12 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F3D24] via-[#123E24] to-[#165632] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle leafy background curves */}
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
                ระบบจัดการวันเวลาของการลาที่ทันสมัยที่สุด
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
                ยกระดับการทำงานด้วยระบบขอลาออนไลน์ สะดวก รวดเร็ว อนุมัติไว ตรวจสอบได้ทุกที่ ทุกเวลา
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
                <p className="font-semibold text-white">ของ่าย อนุมัติไว</p>
                <p className="text-emerald-200/70 text-[11px]">แจ้งเตือนทันทีเมื่อคำขอได้รับการพิจารณา</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">ปฏิทินวันลาขององค์กร</p>
                <p className="text-emerald-200/70 text-[11px]">เห็นภาพรวมวันลาเพื่อวางแผนงานได้ไม่สะดุด</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-lime-400/20 text-lime-300 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">ตรวจสอบโควตา Real-time</p>
                <p className="text-emerald-200/70 text-[11px]">คำนวณวันลาคงเหลืออัตโนมัติถูกต้องแม่นยำ</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 pt-4 border-t border-emerald-800/40 text-[11px] text-emerald-300/60 flex items-center justify-between">
            <span>© 2026 SmartLeave Inc.</span>
            <span>เวอร์ชัน 1.0.0</span>
          </div>
        </div>

        {/* Right Side: Login Form (7 of 12 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
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

            {/* Header */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                ยินดีต้อนรับกลับมา
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-prompt">
                เข้าสู่ระบบ SmartLeave
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                กรุณาเลือกบัญชีทดสอบหรือกรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
              </p>
            </div>

            {/* Quick Demo Account Selector (Click to auto-fill) */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                เลือกบัญชีทดสอบด่วน (One-Click Demo Account):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoAccounts.map((acc) => {
                  const isSelected = email === acc.email;
                  return (
                    <button
                      type="button"
                      key={acc.id}
                      onClick={() => handleSelectDemoAccount(acc)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center space-x-3 ${isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {acc.name.split(' ')[0]} {acc.name.split(' ')[1]}
                          </p>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                          {acc.badge}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {acc.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  อีเมล (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="name@SmartLeave.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    รหัสผ่าน (Password)
                  </label>
                  <button
                    type="button"
                    onClick={onSwitchToForgotPassword}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600">จดจำการเข้าสู่ระบบในเครื่องนี้</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#155A32] hover:bg-[#114929] text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>เข้าสู่ระบบ SmartLeave</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register link */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-600">
                ยังไม่มีบัญชีผู้ใช้?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  สมัครสมาชิกใหม่ที่นี่
                </button>
              </p>
            </div>
          </div>

          {/* Footer notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              ติดปัญหาการเข้าใช้งาน? ติดต่อฝ่ายทรัพยากรบุคคล (HR) ได้ที่{' '}
              <span className="text-emerald-700 font-medium">hr@SmartLeave.com</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

