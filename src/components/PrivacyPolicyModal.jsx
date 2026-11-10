import React from 'react';
import { ShieldCheck, Check, AlertCircle, X, Lock, CheckCircle2 } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';
import { initialPDPAPolicy } from '../data/mockData';

export default function PrivacyPolicyModal() {
  const {
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
    healthConsent,
    setHealthConsent,
    acceptPDPAConsent,
    revokePDPAConsent,
  } = useLeave();

  if (!isPrivacyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden font-prompt">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0F3D24] via-[#155A32] to-[#1E7441] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                นโยบายความเป็นส่วนตัวและสิทธิของคุณ
              </h3>
              <p className="text-xs text-emerald-200">
                Privacy Notice & Consent Management ({initialPDPAPolicy.version})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPrivacyModalOpen(false)}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed custom-scroll">
          
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
            👋 <strong>เรียน เจ้าของข้อมูลส่วนบุคคล:</strong> เพื่อให้การใช้งานระบบลางาน การคำนวณสิทธิประโยชน์ และการประสานงานภายในองค์กรเป็นไปอย่างถูกต้อง โปร่งใส บริษัทขอแจ้งนโยบายการคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ดังนี้:
          </div>

          {/* Section 1: Data Collected */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center mr-2">
                1
              </span>
              เราเก็บรวบรวมข้อมูลอะไรบ้าง?
            </h4>
            <ul className="list-disc pl-8 space-y-1.5 text-slate-600">
              {initialPDPAPolicy.dataCollected.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Section 2: Purposes */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center mr-2">
                2
              </span>
              วัตถุประสงค์ในการเก็บรวบรวมและประมวลผล
            </h4>
            <ul className="list-disc pl-8 space-y-1.5 text-slate-600">
              {initialPDPAPolicy.purposes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Section 3: Rights */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center mr-2">
                3
              </span>
              สิทธิของท่านในฐานะเจ้าของข้อมูลส่วนบุคคล
            </h4>
            <ul className="list-disc pl-8 space-y-1.5 text-slate-600">
              {initialPDPAPolicy.rights.map((item, idx) => (
                <li key={idx} className={idx === 2 ? 'font-semibold text-emerald-800' : ''}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
            <h4 className="font-bold text-amber-950 text-xs sm:text-sm mb-1.5 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 text-amber-600" />
              การขอความยินยอมข้อมูลสุขภาพ (โดยสมัครใจ ไม่มีเงื่อนไขผูกมัด)
            </h4>
            <p className="text-xs text-amber-900 mb-3 leading-relaxed">
              การประมวลผลข้อมูลทั่วไปเป็นไปตามสัญญาจ้างงาน ส่วนข้อมูลสุขภาพในใบรับรองแพทย์จัดเป็นข้อมูลอ่อนไหว (Sensitive Data) ท่านสามารถเลือกให้หรือไม่ให้ความยินยอมได้:
            </p>

            <label className="flex items-start space-x-3 cursor-pointer select-none bg-white p-3.5 rounded-xl border border-amber-200 hover:border-amber-300 transition">
              <input
                type="checkbox"
                checked={healthConsent}
                onChange={(e) => setHealthConsent(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900">
                  ยินยอมให้ประมวลผลข้อมูลสุขภาพในใบรับรองแพทย์ผ่านระบบ
                </span>
                <p className="text-slate-500 mt-0.5">
                  เพื่อใช้ประกอบการอนุมัติสิทธิลาป่วย (หากไม่ยินยอม สามารถแสดงเอกสารโดยตรงต่อ HR ได้โดยไม่มีผลกระทบต่อสิทธิการลา)
                </p>
              </div>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center">
            <Lock className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            บันทึก Consent Audit Log ทุกครั้งที่ปรับเปลี่ยนสถานะ
          </div>
          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={revokePDPAConsent}
              className="w-1/2 sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
            >
              ถอนความยินยอม
            </button>
            <button
              type="button"
              onClick={acceptPDPAConsent}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#155A32] hover:bg-[#114929] shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>รับทราบและยืนยันการตั้งค่า</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

