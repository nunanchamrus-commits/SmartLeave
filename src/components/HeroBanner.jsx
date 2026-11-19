import React from 'react';
import { useLeave } from '../context/LeaveContext';

export default function HeroBanner() {
  const { currentUser } = useLeave();
  const rawName = (currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`).trim();
  const cleanFullName = rawName
    .replace(/^((นาย|นางสาว|นาง|น\.ส\.|ดร\.|ศ\.|รศ\.|ผศ\.|Mr\.|Mrs\.|Ms\.|Miss)\s*)+/gi, '')
    .trim() || 'ผู้ใช้งาน';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#D5EFE0] via-[#E3F4EA] to-[#DCF2E5] p-6 sm:p-8 shadow-sm border border-emerald-100/60">
      {/* Background organic curves */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-200/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 -mb-20 w-64 h-64 rounded-full bg-teal-200/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Text Content */}
        <div className="space-y-2 text-left max-w-xl">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E5638] tracking-tight font-prompt">
              สวัสดีค่ะ คุณ{cleanFullName} <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg font-semibold text-[#2B6E4A]">
            ยินดีต้อนรับสู่ระบบจัดการวันเวลาของการลา
          </p>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            จัดการการลาได้ง่าย สะดวก รวดเร็ว ทุกที่ ทุกเวลา
          </p>
        </div>

        {/* Right Illustration: 3D Vacation & Leave Scene (Transparent Background) */}
        <div className="relative flex-shrink-0 w-44 sm:w-52 md:w-60 lg:w-64 flex items-center justify-center">
          <img
            src="/hero-vacation-transparent.png"
            alt="ภาพประกอบการลาและท่องเที่ยว SmartLeave"
            className="w-full h-auto max-h-32 sm:max-h-36 md:max-h-40 lg:max-h-44 object-contain select-none filter drop-shadow-[0_8px_18px_rgba(30,86,56,0.16)] transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          />
        </div>
      </div>
    </div>
  );
}
