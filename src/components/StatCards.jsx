import React from 'react';
import { Calendar, Plane, Briefcase, Plus, HeartPulse, Baby } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

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

  const cards = [
    {
      id: 'vacation',
      title: 'ลาพักผ่อน',
      value: `${quotas.vacation?.remaining ?? 10} วัน`,
      subtext: `จาก ${quotas.vacation?.limit ?? 10} วัน`,
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#E6F5F2] flex items-center justify-center text-[#0D9488] shadow-sm">
          <Plane className="w-6 h-6 transform -rotate-45" />
        </div>
      ),
      percent: Math.round(((Number(quotas.vacation?.remaining) || 0) / (Number(quotas.vacation?.limit) || 1)) * 100),
      barColor: 'bg-[#10B981]',
    },
    {
      id: 'personal',
      title: 'ลากิจ',
      value: `${quotas.personal?.remaining ?? (currentUser?.employmentType === 'พนักงานราชการ' ? 10 : 45)} วัน`,
      subtext: `จาก ${quotas.personal?.limit ?? (currentUser?.employmentType === 'พนักงานราชการ' ? 10 : 45)} วัน`,
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#E5F5ED] flex items-center justify-center text-[#047857] shadow-sm">
          <div className="relative">
            <Briefcase className="w-6 h-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Plus className="w-3 h-3 text-white stroke-[3]" />
            </div>
          </div>
        </div>
      ),
      percent: Math.round(((Number(quotas.personal?.remaining) || 0) / (Number(quotas.personal?.limit) || 1)) * 100),
      barColor: 'bg-[#16A34A]',
    },
    {
      id: 'sick',
      title: 'ลาป่วย',
      value: isSickActual ? 'เท่าที่ป่วยจริง' : `${quotas.sick?.remaining ?? 60} วัน`,
      subtext: isSickActual ? `ใช้ไปแล้ว ${quotas.sick?.used ?? 0} วัน` : `จาก ${quotas.sick?.limit ?? 60} วัน`,
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#FFE8EC] flex items-center justify-center text-[#EF4444] shadow-sm">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
          </svg>
        </div>
      ),
      percent: isSickActual ? 100 : Math.round(((Number(quotas.sick?.remaining) || 0) / (Number(quotas.sick?.limit) || 1)) * 100),
      barColor: 'bg-[#FB7185]',
    },
  ];

  if (isFemale && quotas.maternity) {
    cards.push({
      id: 'maternity',
      title: 'ลาคลอดบุตร',
      value: `${quotas.maternity.remaining} วัน`,
      subtext: `จาก ${quotas.maternity.limit} วัน`,
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] flex items-center justify-center text-[#EC4899] shadow-sm">
          <Baby className="w-6 h-6" />
        </div>
      ),
      percent: Math.round((quotas.maternity.remaining / quotas.maternity.limit) * 100),
      barColor: 'bg-[#EC4899]',
    });
  }

  const currentFiscalYearBE = fiscalYearInfo?.fiscalYearBE || 2569;
  const currentRoundTitle = fiscalYearInfo?.roundTitle || 'รอบที่ 1 (1 ต.ค. 2568 - 31 มี.ค. 2569)';

  return (
    <div className="space-y-3 mt-6">
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

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          cards.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        } gap-4 sm:gap-5`}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveTab('history')}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            {/* Top Row: Icon + Value & Label */}
            <div className="flex items-center space-x-3 sm:space-x-3.5">
              <div className="group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-500">
                  {card.title}
                </p>
                <h3 className="text-xl xl:text-2xl font-bold text-slate-800 tracking-tight font-prompt mt-0.5">
                  {card.value}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  {card.subtext}
                </p>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="mt-4 pt-1">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${card.barColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, card.percent))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

