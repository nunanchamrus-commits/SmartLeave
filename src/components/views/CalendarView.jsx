import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, User, Clock, RotateCcw } from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';

export default function CalendarView() {
  const { leaveRequests, setSelectedLeaveDetail, setIsRequestModalOpen, currentUser } = useLeave();
  const [filterMode, setFilterMode] = useState('all'); // 'my' | 'all'
  const [monthOffset, setMonthOffset] = useState(0);

  // Live real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const monthsThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiDayNames = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  // Current real date info
  const realToday = currentTime;
  const realYear = realToday.getFullYear();
  const realMonth = realToday.getMonth();
  const realDate = realToday.getDate();

  // Target display month & year based on monthOffset
  const displayDate = new Date(realYear, realMonth + monthOffset, 1);
  const displayYear = displayDate.getFullYear();
  const displayMonth = displayDate.getMonth();
  const displayYearBE = displayYear + 543;

  const todayDescription = `${thaiDayNames[realToday.getDay()]}ที่ ${realDate} ${monthsThai[realMonth]} ${realYear + 543}`;
  const formattedTime = currentTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Calculate days for the month grid
  const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay();
  const daysInCurrentMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();

  // Helper to get color style based on leave type
  const getEventStyle = (typeKey) => {
    switch (typeKey) {
      case 'sick':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'personal':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'maternity':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'vacation':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  // Find all requests matching a specific day
  const getEventsForDay = (day) => {
    const dayStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (leaveRequests || []).filter((req) => {
      if (!req.startDate || !req.endDate) return false;
      const inRange = dayStr >= req.startDate && dayStr <= req.endDate;
      if (!inRange) return false;

      if (filterMode === 'my') {
        return (
          req.employeeId === currentUser?.id ||
          (req.employeeName && currentUser?.name && req.employeeName.includes(currentUser.name.split(' ')[0]))
        );
      }
      return true;
    });
  };

  const days = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrent: false, isToday: false, events: [] });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const isToday =
      d === realDate &&
      displayMonth === realMonth &&
      displayYear === realYear;

    const dayEvents = getEventsForDay(d);
    days.push({
      day: d,
      isCurrent: true,
      isToday,
      events: dayEvents,
    });
  }

  // Next month leading days (to complete grid to 35 or 42 cells)
  const targetTotal = days.length <= 35 ? 35 : 42;
  const remaining = targetTotal - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, isCurrent: false, isToday: false, events: [] });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-slate-800 font-prompt">ปฏิทินการลา</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ดูตารางการลาของตนเองและบุคลากรแบบภาพรวม ซิงก์ตรงกับวันเวลาปัจจุบัน
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live Clock Chip */}
          <div className="hidden lg:flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-xs text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-600">{todayDescription}</span>
            <span className="font-mono font-bold text-[#155A32] pl-1 border-l border-slate-200">
              {formattedTime} น.
            </span>
          </div>

          {/* Filter toggle */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex space-x-1 shadow-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#155A32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ทั้งหมด</span>
            </button>
            <button
              onClick={() => setFilterMode('my')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterMode === 'my'
                  ? 'bg-[#155A32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>เฉพาะฉัน</span>
            </button>
          </div>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2 bg-[#155A32] hover:bg-[#114A29] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            + ขอลา
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 sm:p-6 space-y-4">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-bold text-slate-800 font-prompt">
              {monthsThai[displayMonth]} {displayYearBE}
            </h3>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setMonthOffset((p) => p - 1)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMonthOffset(0)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center space-x-1 ${
                monthOffset === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              title="กลับมาเดือนปัจจุบัน"
            >
              <RotateCcw className="w-3 h-3" />
              <span>วันนี้</span>
            </button>
            <button
              onClick={() => setMonthOffset((p) => p + 1)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 py-2">
          {daysOfWeek.map((d, i) => (
            <div key={i} className={i === 0 || i === 6 ? 'text-red-400' : ''}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((item, idx) => (
            <div
              key={idx}
              className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                item.isCurrent
                  ? item.isToday
                    ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-xs'
                  : 'bg-slate-50/50 border-slate-50 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    item.isToday
                      ? 'w-6 h-6 rounded-full bg-[#155A32] text-white flex items-center justify-center shadow-xs'
                      : item.isCurrent
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {item.day}
                </span>
                {item.isToday && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                    วันนี้
                  </span>
                )}
                {!item.isToday && item.events && item.events.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>

              {/* Event Chips */}
              <div className="space-y-1 mt-1 overflow-y-auto max-h-16">
                {item.events?.map((ev, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setSelectedLeaveDetail(ev)}
                    className={`w-full text-left px-1.5 py-0.5 rounded-lg text-[10px] font-medium border truncate transition-opacity hover:opacity-85 ${getEventStyle(
                      ev.typeKey
                    )}`}
                    title={`${ev.employeeName} - ${ev.type} (${ev.status})`}
                  >
                    {ev.employeeName ? ev.employeeName.split(' ')[0] : 'คำขอ'}: {ev.type}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
