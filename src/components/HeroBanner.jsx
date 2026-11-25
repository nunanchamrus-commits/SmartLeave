import React from 'react';
import { useLeave } from '../context/LeaveContext';
import DinoMascot from './DinoMascot';

export default function HeroBanner() {
  const { currentUser, quotas } = useLeave();
  const rawName = (currentUser?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`).trim();
  const cleanFullName = rawName
    .replace(/^((นาย|นางสาว|นาง|น\.ส\.|ดร\.|ศ\.|รศ\.|ผศ\.|Mr\.|Mrs\.|Ms\.|Miss)\s*)+/gi, '')
    .trim() || 'ผู้ใช้งาน';

  const vacRemaining = Number(quotas.vacation?.remaining) ?? 10;
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'สวัสดีตอนเช้าครับ' : (currentHour < 17 ? 'สวัสดีตอนบ่ายครับ' : 'สวัสดีช่วงเย็นครับ');
  const dinoTip = `${timeGreeting} มีวันหยุดพักผ่อนเหลืออีก ${vacRemaining} วันนะ ✨`;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#D5EFE0] via-[#E3F4EA] to-[#DCF2E5] p-4 sm:p-7 shadow-sm border border-emerald-100/60">
      {/* Background organic curves */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-200/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 -mb-20 w-64 h-64 rounded-full bg-teal-200/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Left Text Content */}
        <div className="space-y-1.5 sm:space-y-2 text-center md:text-left max-w-xl">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E5638] tracking-tight font-prompt">
              สวัสดีค่ะ คุณ{cleanFullName} <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h2>
          </div>
          <p className="text-sm sm:text-lg font-semibold text-[#2B6E4A]">
            ยินดีต้อนรับสู่ระบบจัดการวันเวลาของการลา
          </p>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            จัดการการลาได้ง่าย สะดวก รวดเร็ว ทุกที่ ทุกเวลา
          </p>
        </div>

        {/* Right Mascot: Dino Digital Assistant with Interactive Speech Bubble */}
        <div className="relative flex-shrink-0 flex items-center justify-center pt-2 sm:pt-0">
          <DinoMascot
            pose="assistant"
            size={135}
            bubbleText={dinoTip}
            className="hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </div>
  );
}
