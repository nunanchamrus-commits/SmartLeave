import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Search,
  X,
  AlertCircle,
  ShieldCheck,
  CalendarCheck,
  Calendar,
  CalendarPlus,
  Grid,
  List,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLeave } from '../../context/LeaveContext';
import { getCalendarHolidays, getHolidaysMap } from '../../data/holidays';
import DinoMascot from '../DinoMascot';
import ThaiDatePicker from '../ThaiDatePicker';
import { formatThaiDateBE } from '../../utils/thaiDate';

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const THAI_DAYS_OF_WEEK = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
];

const THAI_DAYS_SHORT = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

export default function HolidaysView() {
  const { isAdmin, customHolidays, addCustomHoliday, deleteCustomHoliday } = useLeave();

  // Real-time current clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const realToday = currentTime;
  const realYear = realToday.getFullYear();
  const realMonth = realToday.getMonth();
  const realDate = realToday.getDate();
  const todayStr = `${realYear}-${String(realMonth + 1).padStart(2, '0')}-${String(realDate).padStart(2, '0')}`;

  // Calendar Navigation State
  // monthOffset from current month (0 = current month)
  const [monthOffset, setMonthOffset] = useState(0);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [selectedHolidayDetail, setSelectedHolidayDetail] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Target display month & year based on monthOffset
  const displayDate = new Date(realYear, realMonth + monthOffset, 1);
  const displayYear = displayDate.getFullYear();
  const displayMonth = displayDate.getMonth();
  const displayYearBE = displayYear + 543;

  // Real-time formatted clock string
  const todayDescription = `${THAI_DAYS_OF_WEEK[realToday.getDay()]}ที่ ${realDate} ${THAI_MONTHS[realMonth]} ${realYear + 543}`;
  const formattedTime = currentTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Map of all holidays for the display year (Standard + Custom)
  const holidaysMap = useMemo(() => {
    return getHolidaysMap(displayYear, customHolidays);
  }, [displayYear, customHolidays]);

  // List of all holidays for the display year
  const allYearHolidays = useMemo(() => {
    return getCalendarHolidays(displayYear, customHolidays);
  }, [displayYear, customHolidays]);

  // Find next upcoming holiday (nearest to today from current year or next year)
  const nextUpcoming = useMemo(() => {
    const combinedUpcoming = [
      ...getCalendarHolidays(realYear, customHolidays),
      ...getCalendarHolidays(realYear + 1, customHolidays),
    ]
      .filter((h) => h.dateStr >= todayStr)
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    return combinedUpcoming.length > 0 ? combinedUpcoming[0] : null;
  }, [realYear, customHolidays, todayStr]);

  // Days remaining until next upcoming holiday
  const daysUntilNext = useMemo(() => {
    if (!nextUpcoming) return null;
    const [y, m, d] = nextUpcoming.dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const diffTime = target.getTime() - realToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }, [nextUpcoming, realToday]);

  // Holidays in current displayed month
  const monthHolidays = useMemo(() => {
    return allYearHolidays.filter((h) => h.month === displayMonth + 1);
  }, [allYearHolidays, displayMonth]);

  // Calculate days for the calendar grid
  const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay();
  const daysInCurrentMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();

  const calendarDays = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      holiday: null,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const isToday =
      d === realDate &&
      displayMonth === realMonth &&
      displayYear === realYear;

    const dayStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeek = new Date(displayYear, displayMonth, d).getDay();
    const holiday = holidaysMap[dayStr] || null;

    calendarDays.push({
      day: d,
      dateStr: dayStr,
      dayOfWeek,
      isCurrentMonth: true,
      isToday,
      holiday,
    });
  }

  // 3. Next month leading days (fill up grid to 35 or 42 slots)
  const targetSlots = calendarDays.length <= 35 ? 35 : 42;
  const remainingSlots = targetSlots - calendarDays.length;
  for (let d = 1; d <= remainingSlots; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      isToday: false,
      holiday: null,
    });
  }

  const getTodayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Form State for Add Holiday
  const [formData, setFormData] = useState({
    name: '',
    date: getTodayISO(),
    description: '',
    type: 'special',
  });
  const [formError, setFormError] = useState('');
  const [isAddSuccess, setIsAddSuccess] = useState(false);

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('กรุณากรอกชื่อวันหยุด');
      return;
    }
    if (!formData.date) {
      setFormError('กรุณาเลือกวันที่');
      return;
    }

    const success = addCustomHoliday(formData);
    if (success) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      setIsAddSuccess(true);
      setFormError('');

      // Auto jump calendar to the month of the added holiday
      const [newY, newM] = formData.date.split('-').map(Number);
      const targetOffset = (newY - realYear) * 12 + (newM - 1 - realMonth);
      setMonthOffset(targetOffset);
    }
  };

  const getDayOfWeekName = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return THAI_DAYS_OF_WEEK[dt.getDay()];
  };

  const isLongWeekend = (dateStr) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const day = new Date(y, m - 1, d).getDay();
    return day === 1 || day === 5; // Monday or Friday
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 font-prompt">
                ปฏิทินวันหยุดราชการ
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                ตารางปฏิทินวันหยุดนักขัตฤกษ์และวันหยุดพิเศษประจำปี
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Live Clock, Add Holiday (Admin only), View Switch */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Live Clock Chip */}
          <div className="hidden xl:flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-xs text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-600">{todayDescription}</span>
            <span className="font-mono font-bold text-emerald-700 pl-1 border-l border-slate-200">
              {formattedTime} น.
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>ตารางปฏิทิน</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>สรุปทั้งปี</span>
            </button>
          </div>

          {/* Add Holiday Button for Admin */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setIsAddSuccess(false);
                setFormData({ name: '', date: getTodayISO(), description: '', type: 'special' });
                setIsAddModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มวันหยุดพิเศษ</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Banner: Next Upcoming Holiday Countdown */}
      {nextUpcoming && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 sm:p-6 shadow-md border border-emerald-900/20">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-2 flex flex-col items-center justify-center flex-shrink-0 backdrop-blur-xs shadow-inner">
                <span className="text-[11px] font-medium text-emerald-200 uppercase leading-none">
                  {THAI_MONTHS[parseInt(nextUpcoming.dateStr.split('-')[1], 10) - 1]?.slice(0, 4)}
                </span>
                <span className="text-2xl font-black text-white leading-none mt-1 font-prompt">
                  {nextUpcoming.dateStr.split('-')[2]}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-slate-900 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-900" />
                    <span>วันหยุดราชการถัดไป</span>
                  </span>
                  {daysUntilNext !== null && (
                    <span className="text-xs text-emerald-200 font-medium">
                      (อีก {daysUntilNext === 0 ? 'วันนี้แล้ว!' : `${daysUntilNext} วัน`})
                    </span>
                  )}
                  {isLongWeekend(nextUpcoming.dateStr) && (
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-teal-400/20 text-teal-200 border border-teal-300/30">
                      🌴 วันหยุดยาวต่อเนื่อง
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold font-prompt text-white">
                  {nextUpcoming.name}
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xl">
                  {getDayOfWeekName(nextUpcoming.dateStr)}ที่ {nextUpcoming.fullDate} — {nextUpcoming.description}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 hidden md:flex items-center pr-2">
              <DinoMascot
                src="/dino-mascot4.png"
                size={115}
                className="filter drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: CALENDAR GRID VIEW */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 p-3 sm:p-6 space-y-4">
          {/* Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-prompt">
                {THAI_MONTHS[displayMonth]} {displayYearBE}
              </h3>
              {monthHolidays.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  วันหยุด {monthHolidays.length} วัน
                </span>
              )}
            </div>

            {/* Navigation Buttons: Prev / Today / Next */}
            <div className="flex items-center space-x-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setMonthOffset((p) => p - 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset(0)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center space-x-1 cursor-pointer ${
                  monthOffset === 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                title="กลับมาเดือนปัจจุบัน"
              >
                <RotateCcw className="w-3 h-3" />
                <span>เดือนนี้</span>
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset((p) => p + 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Month Jump Chips */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-medium border-b border-slate-100">
            {THAI_MONTHS.map((mName, mIdx) => {
              const isSelected = displayMonth === mIdx;
              return (
                <button
                  key={mIdx}
                  type="button"
                  onClick={() => {
                    const targetOffset = (displayYear - realYear) * 12 + (mIdx - realMonth);
                    setMonthOffset(targetOffset);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mName}
                </button>
              );
            })}
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-500 py-1">
            {THAI_DAYS_SHORT.map((d, i) => (
              <div key={i} className={i === 0 || i === 6 ? 'text-red-400 font-bold' : ''}>
                <span className="sm:hidden">{['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][i]}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
          </div>

          {/* CALENDAR GRID (ตาราง 7 คอลัมน์) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {calendarDays.map((item, idx) => {
              const hasHoliday = !!item.holiday;
              const isToday = item.isToday;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.isCurrentMonth && item.holiday) {
                      setSelectedHolidayDetail(item.holiday);
                    }
                  }}
                  className={`min-h-[82px] sm:min-h-[120px] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between select-none ${
                    !item.isCurrentMonth
                      ? 'bg-slate-50/40 border-slate-100 text-slate-300'
                      : hasHoliday
                      ? /* วันไหนที่มีวันหยุด ช่องนั้นเป็นสีม่วงอ่อนทั้งช่อง */
                        'bg-[#F3E8FF] border-[#D8B4FE] text-purple-950 shadow-xs ring-1 ring-purple-300/70 cursor-pointer hover:bg-[#E9D5FF] hover:border-purple-400 hover:shadow-md'
                      : item.dayOfWeek === 0 || item.dayOfWeek === 6
                      ? 'bg-slate-50/60 border-slate-100 text-slate-600 hover:bg-slate-100/60'
                      : isToday
                      ? 'bg-white border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50/80 hover:border-slate-200'
                  }`}
                  title={item.holiday ? `${item.holiday.name} (คลิกดูรายละเอียด)` : undefined}
                >
                  {/* Top Row: Date Number & Badges */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs sm:text-sm font-bold flex items-center justify-center ${
                        hasHoliday
                          ? 'w-6 h-6 rounded-full bg-purple-700 text-white shadow-2xs font-prompt'
                          : isToday
                          ? 'w-6 h-6 rounded-full bg-emerald-600 text-white shadow-2xs font-prompt'
                          : item.isCurrentMonth
                          ? item.dayOfWeek === 0 || item.dayOfWeek === 6
                            ? 'text-red-500'
                            : 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {item.day}
                    </span>

                    {/* Badge right */}
                    <div className="flex items-center space-x-1">
                      {isToday && !hasHoliday && (
                        <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                          วันนี้
                        </span>
                      )}
                      {hasHoliday && (
                        <span className="text-[9.5px] font-bold text-purple-800 bg-purple-200/90 px-1.5 py-0.2 rounded-md">
                          วันหยุด
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Holiday Content Inside Cell (แสดงชื่อวันหยุดชัดเจนในช่องสีม่วงอ่อน) */}
                  {hasHoliday && (
                    <div className="mt-1 space-y-1">
                      <div
                        className="text-[11px] sm:text-xs font-bold text-purple-950 font-prompt leading-tight line-clamp-2"
                        title={item.holiday.name}
                      >
                        {item.holiday.name}
                      </div>

                      <div className="flex items-center space-x-1 flex-wrap gap-y-0.5">
                        {item.holiday.isCustom ? (
                          <span className="inline-flex items-center text-[9px] font-semibold bg-purple-200 text-purple-900 px-1 rounded">
                            กำหนดโดยหน่วยงาน
                          </span>
                        ) : item.holiday.name.includes('ชดเชย') ? (
                          <span className="inline-flex items-center text-[9px] font-semibold bg-purple-200 text-purple-900 px-1 rounded">
                            วันหยุดชดเชย
                          </span>
                        ) : null}

                        {isLongWeekend(item.dateStr) && (
                          <span className="text-[9px] font-semibold text-amber-900 bg-amber-200/80 px-1 rounded">
                            🌴 หยุดยาว
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom spacer for empty cells */}
                  {!hasHoliday && <div />}
                </div>
              );
            })}
          </div>

          {/* Legend Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
            <div className="flex items-center space-x-4 flex-wrap gap-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#F3E8FF] border border-[#D8B4FE] ring-1 ring-purple-300" />
                <span className="font-semibold text-slate-700">วันหยุดราชการ / วันหยุดพิเศษ</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-white border border-emerald-400 ring-1 ring-emerald-500/30" />
                <span>วันที่ปัจจุบัน (วันนี้)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-slate-200" />
                <span>วันปฏิบัติหน้าที่ตามปกติ</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              * คลิกที่ช่องวันหยุดเพื่อดูรายละเอียดหรือจัดการวันหยุดพิเศษ
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: FULL ANNUAL LIST VIEW */
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 font-prompt">
              รายการวันหยุดทั้งหมด ประจำปี พ.ศ. {displayYearBE} ({allYearHolidays.length} วัน)
            </h3>
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อวันหยุด..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allYearHolidays
              .filter((h) => !searchQuery.trim() || h.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((h) => {
                const isPast = h.dateStr < todayStr;
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHolidayDetail(h)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3 cursor-pointer ${
                      h.dateStr === todayStr
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                        : isPast
                        ? 'bg-slate-50 border-slate-200/70 opacity-70'
                        : 'bg-white border-slate-200/80 hover:bg-emerald-50/40 hover:border-emerald-300'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center flex-shrink-0 font-prompt shadow-xs">
                      <span className="text-[10px] font-semibold leading-none">{THAI_MONTHS[h.month - 1]?.slice(0, 3)}</span>
                      <span className="text-lg font-black leading-tight mt-0.5">{h.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm font-prompt truncate">{h.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{h.description || 'วันหยุดราชการ'}</p>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">{h.fullDate}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Holiday Detail Modal (คลิกดูรายละเอียดของวันหยุด) */}
          {selectedHolidayDetail && (
            <div
              onClick={() => setSelectedHolidayDetail(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-fade-in-up"
              >
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#2E6F4E] text-white">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg font-prompt">รายละเอียดวันหยุดราชการ</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHolidayDetail(null)}
                    className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
                  <div className="p-4 rounded-2xl bg-[#F3E8FF] border border-[#D8B4FE] space-y-2 text-purple-950">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-700 text-white">
                        {selectedHolidayDetail.isCustom ? 'กำหนดโดยหน่วยงาน' : selectedHolidayDetail.badge}
                      </span>
                      <span className="text-xs font-semibold text-purple-800">
                        {getDayOfWeekName(selectedHolidayDetail.dateStr)}
                      </span>
                    </div>
                    <h4 className="text-lg font-extrabold font-prompt text-purple-950">
                      {selectedHolidayDetail.name}
                    </h4>
                    <p className="text-xs text-purple-800 leading-relaxed">
                      {selectedHolidayDetail.fullDate}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">คำอธิบาย / วัตถุประสงค์</label>
                    <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                      {selectedHolidayDetail.description || 'วันหยุดราชการและวันหยุดนักขัตฤกษ์ประจำปีตามประกาศสำนักนายกรัฐมนตรี'}
                    </p>
                  </div>

                  {selectedHolidayDetail.isCustom && (
                    <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      เพิ่มโดย: {selectedHolidayDetail.createdBy || 'ผู้ดูแลระบบ'}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {isAdmin && selectedHolidayDetail.isCustom ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmId(selectedHolidayDetail.id);
                          setSelectedHolidayDetail(null);
                        }}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>ลบวันหยุดนี้</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedHolidayDetail(null)}
                      className="px-6 py-2 rounded-full bg-[#2F855A] hover:bg-[#256F4A] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmId && (
            <div
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base font-prompt">
                    ยืนยันการลบวันหยุดพิเศษ?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    รายการวันหยุดนี้จะถูกลบออกจากปฏิทินของทุกคนในระบบ
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteCustomHoliday(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    ยืนยันลบ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Custom Holiday Modal (Admin Only) - Styled exactly like LeaveRequestModal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
                {/* Header matching LeaveRequestModal */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#2E6F4E] text-white">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
                      <CalendarPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg font-prompt">
                        เพิ่มวันหยุดพิเศษประจำหน่วยงาน
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsAddSuccess(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body: Success or Form */}
                {isAddSuccess ? (
                  <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3 animate-fade-in-up">
                    <DinoMascot
                      pose="success"
                      size={140}
                      bubbleText="บันทึกวันหยุดพิเศษเรียบร้อยแล้วครับ! ✨"
                    />
                    <h4 className="text-xl font-extrabold text-slate-800 font-prompt mt-1">
                      เพิ่มวันหยุดเรียบร้อยแล้ว!
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
                      วันหยุดใหม่ถูกบันทึกและแสดงผลบนปฏิทินของทุกคนในระบบเรียบร้อยแล้ว
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddSuccess(false);
                        setIsAddModalOpen(false);
                        setFormData({ name: '', date: getTodayISO(), description: '', type: 'special' });
                      }}
                      className="mt-2 px-6 py-2 rounded-full bg-[#2F855A] hover:bg-[#256F4A] text-white font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      ตกลง
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAdd} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    {formError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center space-x-2 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Holiday Type Selection Cards */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-2">
                        ประเภทวันหยุด <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'special', label: 'วันหยุดพิเศษ', desc: 'ประจำหน่วยงาน' },
                          { id: 'official', label: 'วันหยุดราชการ', desc: 'มติ ครม. กรณีพิเศษ' },
                          { id: 'substitute', label: 'วันหยุดชดเชย', desc: 'ชดเชยวันหยุดราชการ' },
                        ].map((t) => (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => setFormData({ ...formData, type: t.id })}
                            className={`py-2 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              formData.type === t.id
                                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500/20 shadow-2xs'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-xs font-semibold">{t.label}</div>
                            <div className="text-[10.5px] text-slate-400 mt-0.5">{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Holiday Name */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ชื่อวันหยุด <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setFormError('');
                        }}
                        placeholder="เช่น วันหยุดพิเศษประจำจังหวัด / วันหยุดกรณีพิเศษ"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm"
                      />
                    </div>

                    {/* Date Picker using ThaiDatePicker (พ.ศ.) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        วันที่กำหนดหยุด (พ.ศ.) <span className="text-red-500">*</span>
                      </label>
                      <ThaiDatePicker
                        value={formData.date}
                        onChange={(val) => {
                          setFormData({ ...formData, date: val });
                          setFormError('');
                        }}
                        placeholder="เลือกวันที่ (พ.ศ.)"
                      />
                    </div>

                    {/* Selected Date Summary Badge */}
                    {formData.date && (
                      <div className="p-3 bg-emerald-50/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900 border border-emerald-100">
                        <span className="font-medium">สรุปวันที่กำหนดหยุด:</span>
                        <span className="font-bold text-xs sm:text-sm bg-white px-3 py-1 rounded-full shadow-xs border border-emerald-200 text-emerald-800 font-prompt">
                          {formatThaiDateBE(formData.date)}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        รายละเอียด / วัตถุประสงค์ (ถ้ามี)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="ระบุวัตถุประสงค์ หรือประกาศหน่วยงานที่เกี่ยวข้อง..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm"
                      />
                    </div>

                    {/* Footer Buttons matching LeaveRequestModal */}
                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddModalOpen(false);
                          setIsAddSuccess(false);
                        }}
                        className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full bg-[#2F855A] hover:bg-[#256F4A] text-white font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        บันทึกวันหยุด
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  );
}
