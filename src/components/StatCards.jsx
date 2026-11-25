import React from 'react';
import { Calendar, Plane, Briefcase, Plus, HeartPulse, Baby } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

/**
 * DonutRing: กราฟวงกลมจิ๋วแสดงสัดส่วนการใช้วันลา (% วันที่ใช้ไป)
 */
function DonutRing({
  percent = 0,
  size = 52,
  stroke = 4.5,
  strokeColor = '#10B981',
  trackColor = '#E2E8F0',
  label = null,
  sublabel = 'ใช้ไป',
}) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-800 leading-none">
          {label !== null ? label : `${percent}%`}
        </span>
        {sublabel && (
          <span className="text-[8px] text-slate-400 mt-0.5 font-medium leading-none">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default function StatCards() {
  const { quotas, setActiveTab, currentUser, fiscalYearInfo } = useLeave();

  const isFemale =
    currentUser?.gender === 'หญิง' ||
    currentUser?.gender === 'female' ||
    (!currentUser?.gender &&
      /^(นางสาว|น\.ส\.|นาง|Ms\.|Mrs\.|Miss)/.test((currentUser?.name || currentUser?.prefix || '').trim()));

  const isSickActual =
    currentUser?.employmentType === 'พนักงานราชการ' ||
    quotas.sick?.isSickAsActual ||
    quotas.sick?.limit === 'เท่าที่ป่วยจริง' ||
    quotas.sick?.limit === 999;

  // คำนวณวันลาพักผ่อน
  const vacLimit = Number(quotas.vacation?.limit) || 10;
  const vacRemaining = Number(quotas.vacation?.remaining) ?? 10;
  const vacUsed = Math.max(0, Number(quotas.vacation?.used) ?? (vacLimit - vacRemaining));
  const vacUsedPercent = Math.min(100, Math.round((vacUsed / vacLimit) * 100));

  // คำนวณวันลากิจ
  const perDefaultLimit = currentUser?.employmentType === 'พนักงานราชการ' ? 10 : 45;
  const perLimit = Number(quotas.personal?.limit) || perDefaultLimit;
  const perRemaining = Number(quotas.personal?.remaining) ?? perDefaultLimit;
  const perUsed = Math.max(0, Number(quotas.personal?.used) ?? (perLimit - perRemaining));
  const perUsedPercent = Math.min(100, Math.round((perUsed / perLimit) * 100));

  // คำนวณวันลาป่วย
  const sickLimit = Number(quotas.sick?.limit) || 60;
  const sickRemaining = Number(quotas.sick?.remaining) ?? 60;
  const sickUsed = Math.max(0, Number(quotas.sick?.used) || 0);
  const sickUsedPercent = isSickActual ? 0 : Math.min(100, Math.round((sickUsed / sickLimit) * 100));

  const cards = [
    {
      id: 'vacation',
      title: 'ลาพักผ่อน',
      remainingText: `${vacRemaining} วัน`,
      limitText: `${vacLimit} วัน`,
      usedText: `${vacUsed} วัน`,
      usedPercent: vacUsedPercent,
      isUnlimited: false,
      theme: {
        cardBg: 'bg-gradient-to-br from-white via-emerald-50/25 to-teal-50/40',
        borderColor: 'border-emerald-100/90 hover:border-emerald-300',
        glowColor: 'bg-emerald-400/15',
        ringStroke: '#10B981',
        ringTrack: '#E6F4EA',
        iconBg: 'bg-[#E6F5F2] text-[#0D9488]',
        barGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        badgeBg: 'bg-emerald-100/70 text-emerald-800 border-emerald-200/60',
      },
      icon: <Plane className="w-5 h-5 sm:w-6 sm:h-6 transform -rotate-45" />,
    },
    {
      id: 'personal',
      title: 'ลากิจ',
      remainingText: `${perRemaining} วัน`,
      limitText: `${perLimit} วัน`,
      usedText: `${perUsed} วัน`,
      usedPercent: perUsedPercent,
      isUnlimited: false,
      theme: {
        cardBg: 'bg-gradient-to-br from-white via-teal-50/25 to-emerald-50/40',
        borderColor: 'border-teal-100/90 hover:border-teal-300',
        glowColor: 'bg-teal-400/15',
        ringStroke: '#0D9488',
        ringTrack: '#E6F5F2',
        iconBg: 'bg-[#E5F5ED] text-[#047857]',
        barGradient: 'bg-gradient-to-r from-teal-500 to-emerald-500',
        badgeBg: 'bg-teal-100/70 text-teal-800 border-teal-200/60',
      },
      icon: (
        <div className="relative">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white stroke-[3]" />
          </div>
        </div>
      ),
    },
    {
      id: 'sick',
      title: 'ลาป่วย',
      remainingText: isSickActual ? 'เท่าที่ป่วยจริง' : `${sickRemaining} วัน`,
      limitText: isSickActual ? 'ตามความจำเป็น' : `${sickLimit} วัน`,
      usedText: `${sickUsed} วัน`,
      usedPercent: sickUsedPercent,
      isUnlimited: isSickActual,
      theme: {
        cardBg: 'bg-gradient-to-br from-white via-rose-50/20 to-amber-50/30',
        borderColor: 'border-rose-100/90 hover:border-rose-300',
        glowColor: 'bg-rose-400/15',
        ringStroke: '#F43F5E',
        ringTrack: '#FFE4E6',
        iconBg: 'bg-[#FFE8EC] text-[#EF4444]',
        barGradient: 'bg-gradient-to-r from-rose-500 to-pink-500',
        badgeBg: 'bg-rose-100/70 text-rose-800 border-rose-200/60',
      },
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
        </svg>
      ),
    },
  ];

  if (isFemale && quotas.maternity) {
    const matLimit = Number(quotas.maternity.limit) || 90;
    const matRemaining = Number(quotas.maternity.remaining) ?? 90;
    const matUsed = Math.max(0, Number(quotas.maternity.used) ?? (matLimit - matRemaining));
    const matUsedPercent = Math.min(100, Math.round((matUsed / matLimit) * 100));

    cards.push({
      id: 'maternity',
      title: 'ลาคลอดบุตร',
      remainingText: `${matRemaining} วัน`,
      limitText: `${matLimit} วัน`,
      usedText: `${matUsed} วัน`,
      usedPercent: matUsedPercent,
      isUnlimited: false,
      theme: {
        cardBg: 'bg-gradient-to-br from-white via-pink-50/25 to-purple-50/30',
        borderColor: 'border-pink-100/90 hover:border-pink-300',
        glowColor: 'bg-pink-400/15',
        ringStroke: '#EC4899',
        ringTrack: '#FCE7F3',
        iconBg: 'bg-[#FDF2F8] text-[#EC4899]',
        barGradient: 'bg-gradient-to-r from-pink-500 to-purple-500',
        badgeBg: 'bg-pink-100/70 text-pink-800 border-pink-200/60',
      },
      icon: <Baby className="w-5 h-5 sm:w-6 sm:h-6" />,
    });
  }

  const currentFiscalYearBE = fiscalYearInfo?.fiscalYearBE || 2569;
  const currentRoundTitle = fiscalYearInfo?.roundTitle || 'รอบที่ 1 (1 ต.ค. 2568 - 31 มี.ค. 2569)';

  return (
    <div className="space-y-3 mt-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ประจำปีงบประมาณ {currentFiscalYearBE}
          </span>
          <span className="text-xs text-slate-600 font-medium">
            {currentRoundTitle}
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          รอบการตัดวันลาตามระเบียบทางราชการ
        </span>
      </div>

      {/* Bento Grid Cards */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          cards.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        } gap-3 sm:gap-4 lg:gap-5`}
      >
        {cards.map((card) => {
          const { theme } = card;
          return (
            <div
              key={card.id}
              onClick={() => setActiveTab('history')}
              className={`bento-card-interactive group relative overflow-hidden rounded-3xl p-4 sm:p-5 ${theme.cardBg} border ${theme.borderColor} shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between`}
            >
              {/* Subtle Decorative Ambient Glow */}
              <div
                className={`pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full ${theme.glowColor} blur-2xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`}
              />

              <div>
                {/* Top Row: Icon + Donut Ring */}
                <div className="flex items-center justify-between relative z-10">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300`}
                  >
                    {card.icon}
                  </div>

                  {/* Circular Progress Ring (Donut) */}
                  <DonutRing
                    percent={card.usedPercent}
                    size={48}
                    stroke={4}
                    strokeColor={theme.ringStroke}
                    trackColor={theme.ringTrack}
                    label={card.isUnlimited ? '∞' : `${card.usedPercent}%`}
                    sublabel={card.isUnlimited ? 'ตามจริง' : 'ใช้ไป'}
                  />
                </div>

                {/* Middle Info: Title & Big Highlight Value */}
                <div className="mt-3.5 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500">
                      {card.title}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${theme.badgeBg}`}
                    >
                      คงเหลือ
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-prompt mt-1">
                    {card.remainingText}
                  </h3>
                </div>
              </div>

              {/* Bottom: Breakdown & Progress Track */}
              <div className="mt-4 pt-2.5 border-t border-slate-200/50 relative z-10 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    ใช้ไปแล้ว <strong className="text-slate-700 font-semibold">{card.usedText}</strong>
                  </span>
                  <span className="text-slate-400">
                    สิทธิ์ {card.limitText}
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${theme.barGradient} transition-all duration-700 ease-out`}
                    style={{
                      width: `${card.isUnlimited ? 100 : Math.min(100, Math.max(0, 100 - card.usedPercent))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
