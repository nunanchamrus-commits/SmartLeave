import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowRight,
  UserCheck,
  Database,
  Eye,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function PdpaConsentView() {
  const { currentUser, acceptPdpa, logout } = useLeave();

  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!isAgreed) {
      setError('กรุณาทำเครื่องหมายถูกเพื่อยืนยันว่าคุณได้อ่านและยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      acceptPdpa();
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-prompt">
      {/* Decorative background glow & shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Main PDPA Container Card */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top Green Header Banner */}
        <div className="bg-gradient-to-r from-[#0F3D24] via-[#123E24] to-[#165632] p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-full bg-white/15 p-1.5 shadow-lg border border-white/25 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="สำนักงานสหกรณ์จังหวัดขอนแก่น"
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                    PDPA Consent Required
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                  นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
                </h1>
                <p className="text-xs text-emerald-200/85">
                  สำนักงานสหกรณ์จังหวัดขอนแก่น • ระบบบริหารจัดการการลา SmartLeave
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <div className="text-left">
                <p className="text-[10px] text-emerald-200/80 uppercase tracking-wider">บัญชีผู้ใช้งาน</p>
                <p className="text-xs font-semibold text-white truncate max-w-[160px]">
                  {currentUser?.name || 'ผู้ใช้งาน'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <form onSubmit={handleConfirm} className="p-6 sm:p-8 space-y-5">
          {/* Greeting Banner */}
          <div className="flex items-start space-x-3 p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
            <UserCheck className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm text-emerald-900">
              <p className="font-semibold">
                สวัสดีคุณ {currentUser?.name || 'ผู้ใช้งาน'}
              </p>
              <p className="text-xs text-emerald-700/90 mt-0.5 leading-relaxed">
                เพื่อให้เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) กรุณาตรวจสอบรายละเอียดและกดยินยอมให้ระบบเข้าถึงข้อมูลส่วนบุคคลของท่านก่อนเข้าใช้งาน
              </p>
            </div>
          </div>

          {/* Scrollable PDPA Policy Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 max-h-64 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>1. ข้อมูลส่วนบุคคลที่ระบบเก็บรวบรวมและเข้าถึง</span>
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs text-slate-600">
                <li>ข้อมูลระบุตัวตน: ชื่อ - นามสกุล, ตำแหน่ง, สังกัดกลุ่ม/ฝ่าย, อีเมล และเบอร์โทรศัพท์ติดต่อ</li>
                <li>ข้อมูลการปฏิบัติงานและการลา: วันลาคงเหลือ, ประเภทการลา, ช่วงวันที่ลา, เหตุผลการลา และชื่อผู้ปฏิบัติงานแทน</li>
                <li>เอกสารหลักฐานประกอบการลา: เอกสารแนบหรือใบรับรองแพทย์ (เฉพาะกรณีที่มีการแนบไฟล์ประกอบคำขอ)</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>2. วัตถุประสงค์ในการประมวลผลและการเปิดเผยข้อมูล</span>
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs text-slate-600">
                <li>เพื่อใช้ในการพิจารณายื่นคำขอ การตรวจสอบสิทธิ์วันลา และการอนุมัติการลาโดยผู้บังคับบัญชา</li>
                <li>เพื่อจัดทำแบบใบลาอิเล็กทรอนิกส์ (ไฟล์ PDF) และรายงานสถิติการลาภายในสำนักงานสหกรณ์จังหวัดขอนแก่น</li>
                <li>เพื่อแสดงสถานะวันลาบนปฏิทินทีมงานสำหรับการวางแผนมอบหมายงานให้ผู้ปฏิบัติงานแทน</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>3. การรักษาความมั่นคงปลอดภัยและสิทธิของเจ้าของข้อมูล</span>
              </h3>
              <p className="text-xs text-slate-600 pl-1">
                ข้อมูลของท่านจะได้รับการจัดเก็บอย่างปลอดภัยและเข้าถึงได้เฉพาะตัวท่าน ผู้บังคับบัญชาที่มีอำนาจอนุมัติ และเจ้าหน้าที่ฝ่ายทรัพยากรบุคคลที่ได้รับอนุญาตเท่านั้น ท่านมีสิทธิขอเข้าถึง ขอแก้ไข หรือขอระงับการใช้ข้อมูลตามที่กฎหมายกำหนด
              </p>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label
            className={`flex items-start space-x-3 p-4 rounded-2xl border cursor-pointer transition-all select-none ${
              isAgreed
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => {
                setIsAgreed(e.target.checked);
                if (e.target.checked) setError('');
              }}
              className="w-5 h-5 mt-0.5 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 flex-shrink-0 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">
              ข้าพเจ้าได้อ่านและเข้าใจรายละเอียดข้างต้นแล้ว และ<span className="font-bold text-emerald-800">ให้ความยินยอม</span>ในการเก็บรวบรวม ใช้ และเข้าถึงข้อมูลส่วนบุคคลของข้าพเจ้า เพื่อประโยชน์ในการบริหารจัดการระบบการลา SmartLeave
            </span>
          </label>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center space-x-2 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={logout}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>ไม่ยินยอม (ออกจากระบบ)</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-7 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all flex items-center justify-center space-x-2 group ${
                isAgreed
                  ? 'bg-[#155A32] hover:bg-[#114929] shadow-emerald-950/15 hover:shadow-lg'
                  : 'bg-emerald-700/70 hover:bg-emerald-700 cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>ยืนยันยินยอมและเข้าใช้งานระบบ</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

