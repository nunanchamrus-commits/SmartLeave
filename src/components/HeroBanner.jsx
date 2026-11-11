import React from 'react';
import { useLeave } from '../context/LeaveContext';

export default function HeroBanner() {
  const { currentUser } = useLeave();
  const firstName = currentUser.name.split(' ')[0].replace('นางสาว', '').replace('นาย', '');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#D5EFE0] via-[#E3F4EA] to-[#DCF2E5] p-6 sm:p-8 shadow-sm border border-emerald-100/60">
      {/* Background organic curves */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-200/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 -mb-20 w-64 h-64 rounded-full bg-teal-200/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Text Content */}
        <div className="space-y-2 text-left max-w-xl">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#113C22] tracking-tight font-prompt">
              สวัสดีค่ะ คุณ{firstName} <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg font-semibold text-[#185331]">
            ยินดีต้อนรับสู่ระบบจัดการวันเวลาของการลา
          </p>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            จัดการการลาได้ง่าย สะดวก รวดเร็ว ทุกที่ ทุกเวลา
          </p>
        </div>

        {/* Right Illustration: Calendar + Clock + Leaves */}
        <div className="relative flex-shrink-0 w-64 h-36 sm:w-80 sm:h-44 flex items-center justify-center">
          {/* Decorative SVG Graphic reproducing the screenshot's calendar, clock & leaves */}
          <svg
            viewBox="0 0 360 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md select-none"
          >
            {/* Background Botanical Leaves */}
            <g opacity="0.85">
              {/* Large leaf left */}
              <path
                d="M170 140 C140 100, 150 40, 210 20 C230 60, 210 110, 170 140 Z"
                fill="#86EFAC"
                opacity="0.6"
              />
              <path
                d="M170 140 C190 80, 210 20, 210 20"
                stroke="#4ADE80"
                strokeWidth="2"
              />
              {/* Back right leaf */}
              <path
                d="M270 150 C290 90, 330 60, 360 70 C350 110, 320 150, 270 150 Z"
                fill="#4ADE80"
                opacity="0.5"
              />
              {/* Foreground leaf right */}
              <path
                d="M290 170 C310 120, 350 110, 355 125 C345 155, 320 175, 290 170 Z"
                fill="#22C55E"
                opacity="0.7"
              />
            </g>

            {/* Calendar Block (Left/Center) */}
            <g transform="translate(140, 24)">
              {/* Calendar Shadow */}
              <rect x="8" y="12" width="130" height="116" rx="14" fill="#000" opacity="0.06" />
              {/* Calendar Base */}
              <rect x="0" y="6" width="130" height="116" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
              {/* Calendar Header */}
              <rect x="0" y="6" width="130" height="24" rx="14" fill="#2E7D4D" />
              <rect x="0" y="20" width="130" height="10" fill="#2E7D4D" />

              {/* Spiral rings */}
              <path d="M22 2 C22 -2, 26 -2, 26 2 L26 12 C26 16, 22 16, 22 12 Z" fill="#94A3B8" />
              <path d="M42 2 C42 -2, 46 -2, 46 2 L46 12 C46 16, 42 16, 42 12 Z" fill="#94A3B8" />
              <path d="M62 2 C62 -2, 66 -2, 66 2 L66 12 C66 16, 62 16, 62 12 Z" fill="#94A3B8" />
              <path d="M82 2 C82 -2, 86 -2, 86 2 L86 12 C86 16, 82 16, 82 12 Z" fill="#94A3B8" />
              <path d="M102 2 C102 -2, 106 -2, 106 2 L106 12 C106 16, 102 16, 102 12 Z" fill="#94A3B8" />

              {/* Calendar Grid Cells */}
              <rect x="14" y="38" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="34" y="38" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="54" y="38" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="74" y="38" width="14" height="12" rx="3" fill="#DCFCE7" />
              <rect x="94" y="38" width="14" height="12" rx="3" fill="#F1F5F9" />

              <rect x="14" y="56" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="34" y="56" width="14" height="12" rx="3" fill="#F1F5F9" />
              {/* Checked Day Badge */}
              <circle cx="61" cy="62" r="11" fill="#16A34A" />
              <path d="M57 62 L60 65 L66 59" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              <rect x="74" y="56" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="94" y="56" width="14" height="12" rx="3" fill="#F1F5F9" />

              <rect x="14" y="74" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="34" y="74" width="14" height="12" rx="3" fill="#DCFCE7" />
              <rect x="54" y="74" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="74" y="74" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="94" y="74" width="14" height="12" rx="3" fill="#F1F5F9" />

              <rect x="14" y="92" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="34" y="92" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="54" y="92" width="14" height="12" rx="3" fill="#F1F5F9" />
              <rect x="74" y="92" width="14" height="12" rx="3" fill="#DCFCE7" />
              <rect x="94" y="92" width="14" height="12" rx="3" fill="#F1F5F9" />
            </g>

            {/* Analog Clock (Right) */}
            <g transform="translate(245, 45)">
              {/* Clock Outer Rim */}
              <circle cx="48" cy="48" r="46" fill="#15803D" stroke="#FFFFFF" strokeWidth="3" />
              {/* Clock Inner Bezel */}
              <circle cx="48" cy="48" r="40" fill="#FFFFFF" />

              {/* Hour markers */}
              <circle cx="48" cy="14" r="2" fill="#15803D" />
              <circle cx="82" cy="48" r="2" fill="#15803D" />
              <circle cx="48" cy="82" r="2" fill="#15803D" />
              <circle cx="14" cy="48" r="2" fill="#15803D" />

              {/* Additional tick marks */}
              <line x1="65" y1="19" x2="63" y2="23" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="77" y1="31" x2="73" y2="33" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="77" y1="65" x2="73" y2="63" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="31" y1="19" x2="33" y2="23" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

              {/* Hour Hand */}
              <line x1="48" y1="48" x2="48" y2="26" stroke="#0F3D24" strokeWidth="3.5" strokeLinecap="round" />
              {/* Minute Hand */}
              <line x1="48" y1="48" x2="68" y2="34" stroke="#0F3D24" strokeWidth="2.5" strokeLinecap="round" />
              {/* Center Pin */}
              <circle cx="48" cy="48" r="3.5" fill="#15803D" />
              <circle cx="48" cy="48" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Extra plant leaf overlapping clock */}
            <path
              d="M260 170 C240 130, 260 110, 285 100 C280 135, 275 160, 260 170 Z"
              fill="#16A34A"
              opacity="0.85"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

