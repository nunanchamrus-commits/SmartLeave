import React from 'react';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function QuickActionBanner() {
  const { setIsRequestModalOpen } = useLeave();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#D7EFE0] via-[#E4F5EA] to-[#DCF1E4] p-5 sm:p-6 border border-emerald-100/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Background soft glow */}
      <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* Left Icon Graphic */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-200 flex items-center justify-center shadow-xs">
          {/* Calendar SVG with green checkmark */}
          <div className="relative text-emerald-700">
            <svg
              className="w-9 h-9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pt-2">
              <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          {/* Subtle leaves ornament */}
          <span className="absolute -top-1 -right-1 text-emerald-500">🍃</span>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#113E22] tracking-tight font-prompt">
            ของ่าย อนุมัติไว
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
            ด้วยระบบจัดการการลาที่ทันสมัย
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => setIsRequestModalOpen(true)}
        className="flex-shrink-0 flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#155A32] hover:bg-[#114929] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all group"
      >
        <span>ขอลาเลย</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

