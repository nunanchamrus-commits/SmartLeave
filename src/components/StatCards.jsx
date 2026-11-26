import React, { useState } from 'react';
import {
  Calendar,
  Plane,
  Briefcase,
  Plus,
  HeartPulse,
  Baby,
  Heart,
  Award,
  Shield,
  GraduationCap,
  Globe,
  Activity,
} from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isFemale =
    currentUser?.gender === 'หญิง' ||
    currentUser?.gender === 'female' ||
    (!currentUser?.gender &&
      /^(นางสาว|น\.ส\.|นาง|Ms\.|Mrs\.|Miss)/.test((currentUser?.name || currentUser?.prefix || '').trim()));

  const isMale = !isFemale;

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

  // คำนวณวันลาไปช่วยเหลือภริยาที่คลอดบุตร (ชาย)
  const patLimit = Number(quotas.paternity?.limit) || 15;
  const patRemaining = Number(quotas.paternity?.remaining) ?? 15;
  const patUsed = Math.max(0, Number(quotas.paternity?.used) ?? (patLimit - patRemaining));
  const patUsedPercent = Math.min(100, Math.round((patUsed / patLimit) * 100));

  // คำนวณวันลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์ (ชาย)
  const ordLimit = Number(quotas.ordination?.limit) || 120;
  const ordRemaining = Number(quotas.ordination?.remaining) ?? 120;
  const ordUsed = Math.max(0, Number(quotas.ordination?.used) ?? (ordLimit - ordRemaining));
  const ordUsedPercent = Math.min(100, Math.round((ordUsed / ordLimit) * 100));

  // คำนวณวันลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล (ชาย)
  const milLimit = Number(quotas.military?.limit) || 7;
  const milRemaining = Number(quotas.military?.remaining) ?? 7;
  const milUsed = Math.max(0, Number(quotas.military?.used) ?? (milLimit - milRemaining));
  const milUsedPercent = Math.min(100, Math.round((milUsed / milLimit) * 100));

  // คำนวณวันลาไปศึกษา ฝึกอบรม หรือดูงาน (ชาย-หญิง)
  const stuLimit = Number(quotas.study?.limit) || 1460;
  const stuRemaining = Number(quotas.study?.remaining) ?? 1460;
  const stuUsed = Math.max(0, Number(quotas.study?.used) ?? (stuLimit - stuRemaining));
  const stuUsedPercent = Math.min(100, Math.round((stuUsed / stuLimit) * 100));

  // คำนวณวันลาไปปฏิบัติงานในองค์กรระหว่างประเทศ (ชาย-หญิง)
  const intLimit = Number(quotas.international?.limit) || 1460;
  const intRemaining = Number(quotas.international?.remaining) ?? 1460;
  const intUsed = Math.max(0, Number(quotas.international?.used) ?? (intLimit - intRemaining));
  const intUsedPercent = Math.min(100, Math.round((intUsed / intLimit) * 100));

  // คำนวณวันลาติดตามคู่สมรส (ชาย-หญิง)
  const spoLimit = Number(quotas.spouse?.limit) || 730;
  const spoRemaining = Number(quotas.spouse?.remaining) ?? 730;
  const spoUsed = Math.max(0, Number(quotas.spouse?.used) ?? (spoLimit - spoRemaining));
  const spoUsedPercent = Math.min(100, Math.round((spoUsed / spoLimit) * 100));

  // คำนวณวันลาไปฟื้นฟูสมรรถภาพด้านอาชีพ (ชาย-หญิง)
  const rehLimit = Number(quotas.rehab?.limit) || 365;
  const rehRemaining = Number(quotas.rehab?.remaining) ?? 365;
  const rehUsed = Math.max(0, Number(quotas.rehab?.used) ?? (rehLimit - rehRemaining));
  const rehUsedPercent = Math.min(100, Math.round((rehUsed / rehLimit) * 100));

  const cards = [
    {
      id: 'vacation',
      category: 'general',
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
      category: 'general',
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
      category: 'general',
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

  // สิทธิ์ลาเฉพาะผู้หญิง: ลาคลอดบุตร
  if (isFemale) {
    const matLimit = Number(quotas.maternity?.limit) || 90;
    const matRemaining = Number(quotas.maternity?.remaining) ?? 90;
    const matUsed = Math.max(0, Number(quotas.maternity?.used) ?? (matLimit - matRemaining));
    const matUsedPercent = Math.min(100, Math.round((matUsed / matLimit) * 100));

    cards.push({
      id: 'maternity',
      category: 'general',
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

  // สิทธิ์ลาเฉพาะผู้ชาย: ลาไปช่วยเหลือภริยาที่คลอดบุตร, ลาอุปสมบท/ฮัจย์, ลาตรวจเลือกทหาร
  if (isMale) {
    cards.push({
      id: 'paternity',
      category: 'general',
      title: 'ลาไปช่วยเหลือภริยาที่คลอดบุตร',
      remainingText: `${patRemaining} วัน`,
      limitText: `${patLimit} วัน`,
      usedText: `${patUsed} วัน`,
      usedPercent: patUsedPercent,
      isUnlimited: false,
      theme: {
        cardBg: 'bg-gradient-to-br from-white via-sky-50/30 to-blue-50/40',
        borderColor: 'border-sky-100/90 hover:border-sky-300',
        glowColor: 'bg-sky-400/15',
        ringStroke: '#0284C7',
        ringTrack: '#E0F2FE',
        iconBg: 'bg-[#E0F2FE] text-[#0284C7]',
        barGradient: 'bg-gradient-to-r from-sky-500 to-blue-500',
        badgeBg: 'bg-sky-100/70 text-sky-800 border-sky-200/60',
      },
      icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />,
    });

    cards.push({
      id: 'ordination',
      category: 'special',
      title: 'ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์',
      remainingText: `${ordRemaining} วัน`,
      limitText: `${ordLimit} วัน`,
      usedText: `${ordUsed} วัน`,
      usedPercent: ordUsedPercent,
      isUnlimited: false,
      theme: {
        cardBg: 'bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/40',
        borderColor: 'border-amber-100/90 hover:border-amber-300',
        glowColor: 'bg-amber-400/15',
        ringStroke: '#D97706',
        ringTrack: '#FEF3C7',
        iconBg: 'bg-[#FEF3C7] text-[#D97706]',
        barGradient: 'bg-gradient-to-r from-amber-500 to-yellow-500',
        badgeBg: 'bg-amber-100/70 text-amber-800 border-amber-200/60',
      },
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />,
    });

    cards.push({
      id: 'military',
      category: 'special',
      title: 'ลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล',
      remainingText: `${milRemaining} วัน`,
      limitText: `${milLimit} วัน`,
      usedText: `${milUsed} วัน`,
      usedPercent: milUsedPercent,
      isUnlimited: false,
      theme: {
        cardBg: 'bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/40',
        borderColor: 'border-indigo-100/90 hover:border-indigo-300',
        glowColor: 'bg-indigo-400/15',
        ringStroke: '#4F46E5',
        ringTrack: '#EEF2FF',
        iconBg: 'bg-[#EEF2FF] text-[#4F46E5]',
        barGradient: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        badgeBg: 'bg-indigo-100/70 text-indigo-800 border-indigo-200/60',
      },
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />,
    });
  }

  // สิทธิ์ลาทั่วไปแสดงทั้งชายและหญิง: ศึกษาดูงาน, องค์กรระหว่างประเทศ, ติดตามคู่สมรส, ฟื้นฟูสมรรถภาพ
  cards.push({
    id: 'study',
    category: 'special',
    title: 'ลาไปศึกษา ฝึกอบรม หรือดูงาน',
    remainingText: stuRemaining === 1460 ? '4 ปี' : `${stuRemaining} วัน`,
    limitText: '4 ปี (1,460 วัน)',
    usedText: `${stuUsed} วัน`,
    usedPercent: stuUsedPercent,
    isUnlimited: false,
    theme: {
      cardBg: 'bg-gradient-to-br from-white via-violet-50/30 to-purple-50/40',
      borderColor: 'border-violet-100/90 hover:border-violet-300',
      glowColor: 'bg-violet-400/15',
      ringStroke: '#7C3AED',
      ringTrack: '#F3E8FF',
      iconBg: 'bg-[#F3E8FF] text-[#7C3AED]',
      barGradient: 'bg-gradient-to-r from-violet-500 to-purple-500',
      badgeBg: 'bg-violet-100/70 text-violet-800 border-violet-200/60',
    },
    icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />,
  });

  cards.push({
    id: 'international',
    category: 'special',
    title: 'ลาไปปฏิบัติงานในองค์กรระหว่างประเทศ',
    remainingText: intRemaining === 1460 ? '4 ปี' : `${intRemaining} วัน`,
    limitText: '4 ปี (1,460 วัน)',
    usedText: `${intUsed} วัน`,
    usedPercent: intUsedPercent,
    isUnlimited: false,
    theme: {
      cardBg: 'bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/40',
      borderColor: 'border-blue-100/90 hover:border-blue-300',
      glowColor: 'bg-blue-400/15',
      ringStroke: '#2563EB',
      ringTrack: '#DBEAFE',
      iconBg: 'bg-[#DBEAFE] text-[#2563EB]',
      barGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      badgeBg: 'bg-blue-100/70 text-blue-800 border-blue-200/60',
    },
    icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
  });

  cards.push({
    id: 'spouse',
    category: 'special',
    title: 'ลาติดตามคู่สมรส',
    remainingText: spoRemaining === 730 ? '2 ปี' : `${spoRemaining} วัน`,
    limitText: '2 ปี (730 วัน)',
    usedText: `${spoUsed} วัน`,
    usedPercent: spoUsedPercent,
    isUnlimited: false,
    theme: {
      cardBg: 'bg-gradient-to-br from-white via-rose-50/25 to-pink-50/35',
      borderColor: 'border-rose-100/90 hover:border-rose-300',
      glowColor: 'bg-rose-400/15',
      ringStroke: '#E11D48',
      ringTrack: '#FFE4E6',
      iconBg: 'bg-[#FFE4E6] text-[#E11D48]',
      barGradient: 'bg-gradient-to-r from-rose-500 to-pink-500',
      badgeBg: 'bg-rose-100/70 text-rose-800 border-rose-200/60',
    },
    icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />,
  });

  cards.push({
    id: 'rehab',
    category: 'special',
    title: 'ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ',
    remainingText: rehRemaining === 365 ? '12 เดือน' : `${rehRemaining} วัน`,
    limitText: '12 เดือน (365 วัน)',
    usedText: `${rehUsed} วัน`,
    usedPercent: rehUsedPercent,
    isUnlimited: false,
    theme: {
      cardBg: 'bg-gradient-to-br from-white via-emerald-50/30 to-green-50/40',
      borderColor: 'border-emerald-100/90 hover:border-emerald-300',
      glowColor: 'bg-emerald-500/15',
      ringStroke: '#059669',
      ringTrack: '#D1FAE5',
      iconBg: 'bg-[#D1FAE5] text-[#059669]',
      barGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100/70 text-emerald-800 border-emerald-200/60',
    },
    icon: <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />,
  });

  const generalCount = cards.filter((c) => c.category === 'general').length;
  const specialCount = cards.filter((c) => c.category === 'special').length;

  const displayCards =
    selectedCategory === 'all'
      ? cards
      : cards.filter((c) => c.category === selectedCategory);

  const currentFiscalYearBE = fiscalYearInfo?.fiscalYearBE || 2569;
  const currentRoundTitle = fiscalYearInfo?.roundTitle || 'รอบที่ 1 (1 ต.ค. 2568 - 31 มี.ค. 2569)';

  return (
    <div className="space-y-4">
      {/* Header Info & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ประจำปีงบประมาณ {currentFiscalYearBE}
          </span>
          <span className="text-xs text-slate-600 font-medium">
            {currentRoundTitle}
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ทั้งหมด ({cards.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('general')}
            className={`px-3 py-1 rounded-xl font-semibold transition-all ${
              selectedCategory === 'general'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            การลาทั่วไป ({generalCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('special')}
            className={`px-3 py-1 rounded-xl font-semibold transition-all ${
              selectedCategory === 'special'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            การลาตามระเบียบอื่นๆ ({specialCount})
          </button>
        </div>
      </div>

      {/* Bento Grid Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
      >
        {displayCards.map((card) => {
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
                    <span className="text-xs font-semibold text-slate-500 line-clamp-1" title={card.title}>
                      {card.title}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${theme.badgeBg}`}
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
