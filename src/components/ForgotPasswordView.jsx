import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLeave } from '../context/LeaveContext';

export default function ForgotPasswordView({ onSwitchToLogin }) {
  const { resetPassword } = useLeave();

  // Form states
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Flow step: 'verify-otp' | 'reset-password' | 'done'
  const [step, setStep] = useState('verify-otp');

  // Password reset states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Refs for 6-digit OTP inputs
  const otpInputsRef = useRef([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle Send OTP
  const handleSendOtp = (e) => {
    if (e) e.preventDefault();
    setError('');

    const emailTrim = email.trim();
    if (!emailTrim) {
      setError('กรุณากรอกอีเมลที่ลงทะเบียนไว้');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    setIsSendingOtp(true);

    setTimeout(() => {
      // Generate a random 6-digit OTP
      const randomOtp = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(randomOtp);
      setOtpSent(true);
      setCountdown(60);
      setIsSendingOtp(false);
      setOtpDigits(['', '', '', '', '', '']);

      // Focus first OTP input box
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 100);
    }, 600);
  };

  // Handle single digit input
  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError('');

    // If entered a digit, auto-focus next box
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle paste in OTP inputs
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    setError('');

    // Focus next empty or the last box
    const nextIdx = Math.min(pasted.length, 5);
    otpInputsRef.current[nextIdx]?.focus();
  };

  // Quick auto-fill simulated OTP for demonstration
  const handleAutoFillOtp = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    setError('');
  };

  // Handle Confirm OTP verification
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('กรุณากรอกอีเมลของคุณ');
      return;
    }

    if (!otpSent) {
      setError('กรุณากดปุ่ม "ส่ง OTP" เพื่อรับรหัสยืนยันทางอีเมลก่อน');
      return;
    }

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setError('กรุณากรอกรหัส OTP ให้ครบทั้ง 6 หลัก');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setError('รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบหรือขอรับรหัสใหม่');
      return;
    }

    // Success OTP verification! Transition to reset-password step
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('reset-password');
    }, 500);
  };

  // Handle Set New Password
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('กรุณากรอกรหัสผ่านใหม่');
      return;
    }

    if (newPassword.length < 8) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      if (resetPassword) {
        resetPassword(email, newPassword);
      }

      // Celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsVerifying(false);
      setStep('done');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-prompt">
      {/* Decorative background glow & shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Brand Visual & Security Guidelines (5 of 12 cols) */}
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
                กู้คืนรหัสผ่านด้วยระบบยืนยันตัวตน OTP
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
                ระบบความปลอดภัยขั้นสูง ปกป้องข้อมูลส่วนบุคคลของเจ้าหน้าที่และข้าราชการด้วยรหัสยืนยันผ่านอีเมล
              </p>
            </div>
          </div>

          {/* Security Features Info Box */}
          <div className="relative z-10 my-8 space-y-3.5">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">รหัสยืนยัน OTP 6 หลัก</p>
                <p className="text-emerald-200/70 text-[11px]">ส่งตรงถึงกล่องจดหมายอีเมลของคุณทันที</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">รหัสผ่านใหม่ที่ปลอดภัย</p>
                <p className="text-emerald-200/70 text-[11px]">กำหนดความยาวอย่างน้อย 8 ตัวอักษร</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-lime-400/20 text-lime-300 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">เข้าสู่ระบบได้ทันที</p>
                <p className="text-emerald-200/70 text-[11px]">เมื่อตั้งรหัสผ่านใหม่เรียบร้อยแล้ว</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 pt-4 border-t border-emerald-800/40 text-[11px] text-emerald-300/60 flex items-center justify-between">
            <span>© 2026 SmartLeave Inc.</span>
            <span>เวอร์ชัน 1.0.0</span>
          </div>
        </div>

        {/* Right Side: Forgot Password & OTP Form (7 of 12 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Navigation & Back Button */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>กลับไปหน้าเข้าสู่ระบบ</span>
              </button>
              <span className="text-[11px] text-slate-400">
                {step === 'verify-otp' ? 'ขั้นตอนที่ 1 จาก 2' : step === 'reset-password' ? 'ขั้นตอนที่ 2 จาก 2' : 'เสร็จสมบูรณ์'}
              </span>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-start space-x-2.5 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Enter Email + Send OTP + Enter OTP + Confirm Button */}
            {step === 'verify-otp' && (
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                    🔐 กู้คืนรหัสผ่านความปลอดภัยสูง
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-prompt">
                    ลืมรหัสผ่าน (Forgot Password)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    กรอกอีเมลของคุณเพื่อรับรหัสยืนยัน OTP สำหรับใช้ตั้งรหัสผ่านใหม่
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {/* 1. Email Input + Send OTP Button */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      อีเมลของคุณ (Email Address) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
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
                          placeholder="เช่น panika.t@smartleave.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        />
                      </div>

                      {/* Send OTP Button */}
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || countdown > 0}
                        className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-xs flex-shrink-0 ${
                          countdown > 0
                            ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 hover:shadow-md'
                        }`}
                      >
                        {isSendingOtp ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>กำลังส่ง...</span>
                          </>
                        ) : countdown > 0 ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                            <span>ส่งอีกครั้ง ({countdown}s)</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{otpSent ? 'ส่ง OTP อีกครั้ง' : 'ส่งรหัส OTP'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Simulated OTP Email Notification Box */}
                  {otpSent && (
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl space-y-2 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว!</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded-full">
                          มีอายุ 5 นาที
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800">
                        สำหรับระบบทดสอบ รหัส OTP ของคุณคือ:
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-lg font-bold tracking-widest text-[#113C22] bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-xs">
                          {generatedOtp}
                        </span>
                        <button
                          type="button"
                          onClick={handleAutoFillOtp}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-colors"
                        >
                          กดเพื่อใส่รหัสอัตโนมัติ
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. OTP Input Box (6 Digits) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        กรอกรหัสยืนยัน OTP (6 หลัก) <span className="text-red-500">*</span>
                      </label>
                      {otpSent && countdown === 0 && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          ไม่ได้รับรหัส? ขอรหัสใหม่
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1.5 sm:gap-2.5" onPaste={handlePaste}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputsRef.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border transition-all outline-none ${
                            digit
                              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {otpSent
                        ? `กรอกรหัส 6 หลักที่ได้รับทางอีเมล ${email}`
                        : 'กรุณากดปุ่ม "ส่งรหัส OTP" เพื่อรับรหัสยืนยัน'}
                    </p>
                  </div>

                  {/* 3. Confirm Button */}
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full mt-4 py-3 px-4 bg-[#155A32] hover:bg-[#114929] text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 group"
                  >
                    {isVerifying ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>กดยืนยันรหัส OTP</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Set New Password */}
            {step === 'reset-password' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ยืนยันรหัส OTP สำเร็จแล้ว</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 font-prompt">
                    ตั้งรหัสผ่านใหม่ (Set New Password)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    สำหรับบัญชี: <span className="font-semibold text-slate-800">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      รหัสผ่านใหม่ (New Password) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ยืนยันรหัสผ่านใหม่อีกครั้ง (Confirm Password) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full mt-4 py-3 px-4 bg-[#155A32] hover:bg-[#114929] text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 group"
                  >
                    {isVerifying ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>บันทึกและตั้งรหัสผ่านใหม่</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: Done Screen */}
            {step === 'done' && (
              <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md border-2 border-emerald-200 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 font-prompt">
                    รีเซ็ตรหัสผ่านสำเร็จเรียบร้อย!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                    รหัสผ่านใหม่ของคุณได้รับการอัปเดตเรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="w-full py-3 px-4 bg-[#155A32] hover:bg-[#114929] text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>เข้าสู่ระบบด้วยรหัสผ่านใหม่</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Switch to Register link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              จำรหัสผ่านได้แล้ว?{' '}
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
      </div>
    </div>
  );
}
