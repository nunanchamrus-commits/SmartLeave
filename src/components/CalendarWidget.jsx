import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, RotateCcw } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function CalendarWidget() {
  const { setSelectedLeaveDetail, leaveRequests } = useLeave();
  const [selectedDayEvent, setSelectedDayEvent] = useState(null);

  // Real-time current clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Month navigation: offset from current real month (0 = current month)
  const [monthOffset, setMonthOffset] = useState(0);

  const monthsThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiDayNames = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

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

  // Real-time formatted string
  const todayDescription = `${thaiDayNames[realToday.getDay()]}ที่ ${realDate} ${monthsThai[realMonth]} ${realYear + 543}`;
  const formattedTime = currentTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Dynamically find events for any day in the displayed month & year
  const getEventForDay = (day) => {
    const dayStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const matches = (leaveRequests || []).filter((req) => {
      if (!req.startDate || !req.endDate) return false;
      return dayStr >= req.startDate && dayStr <= req.endDate;
    });

    if (matches.length === 0) return null;

    const first = matches[0];
    let dot = 'green';
    let badge = first.status || 'อนุมัติ';
    let label = `${first.type}: ${first.employeeName}`;
    if (first.typeKey === 'sick') dot = 'red';
    else if (first.typeKey === 'personal') dot = 'blue';
    else if (first.typeKey === 'vacation') dot = 'green';

    return {
      type: first.typeKey,
      dot,
      label,
      badge,
      request: first,
    };
  };

  // Day of week of the 1st day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay();
  // Days in current display month
  const daysInCurrentMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  // Days in previous month
  const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();

  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const isToday =
      d === realDate &&
      displayMonth === realMonth &&
      displayYear === realYear;

    const event = getEventForDay(d);

    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isToday,
      event,
    });
  }

  // 3. Next month leading days (fill up grid to 35 or 42 slots)
  const targetSlots = calendarCells.length <= 35 ? 35 : 42;
  const remaining = targetSlots - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const handleCellClick = (cell) => {
    if (!cell.isCurrentMonth) return;
    if (cell.event) {
      setSelectedDayEvent({
        day: cell.day,
        month: monthsThai[displayMonth],
        year: displayYearBE,
        ...cell.event,
      });
      if (cell.event.request) {
        setSelectedLeaveDetail(cell.event.request);
      }
    } else if (cell.isToday) {
      setSelectedDayEvent({
        day: cell.day,
        month: monthsThai[displayMonth],
        year: displayYearBE,
        label: 'วันนี้ (วันปฏิบัติงานปกติ)',
        badge: 'ปัจจุบัน',
      });
    } else {
      setSelectedDayEvent(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
      {/* Real-time Date & Time Indicator Banner */}
      <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-100/80 rounded-xl px-3 py-2 mb-3 text-xs">
        <div className="flex items-center space-x-1.5 text-emerald-950 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">{todayDescription}</span>
        </div>
        <div className="flex items-center space-x-1 font-mono font-bold text-[#155A32] bg-white px-2 py-0.5 rounded-lg border border-emerald-200/60 shadow-xs">
          <Clock className="w-3 h-3 text-emerald-600" />
          <span>{formattedTime} น.</span>
        </div>
      </div>

      {/* Header with Title and Month Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-[#134226]">
          <CalendarIcon className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base font-prompt">
            ปฏิทินการลา
          </h3>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-1 text-xs sm:text-sm font-semibold text-slate-700">
          <button
            onClick={() => setMonthOffset((prev) => prev - 1)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-1.5 tracking-tight font-bold text-slate-800">
            {monthsThai[displayMonth]} {displayYearBE}
          </span>
          <button
            onClick={() => setMonthOffset((prev) => prev + 1)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {monthOffset !== 0 && (
            <button
              onClick={() => setMonthOffset(0)}
              className="ml-1 p-1 px-1.5 text-[10px] rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors flex items-center space-x-0.5"
              title="กลับมาเดือนปัจจุบัน"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>วันนี้</span>
            </button>
          )}
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-semibold text-slate-600">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {calendarCells.map((cell, idx) => {
          const isSelected = selectedDayEvent && selectedDayEvent.day === cell.day && cell.isCurrentMonth;
          return (
            <div
              key={idx}
              onClick={() => handleCellClick(cell)}
              className={`relative h-9 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer select-none ${
                !cell.isCurrentMonth
                  ? 'text-slate-300 font-light'
                  : 'text-slate-700 font-medium hover:bg-slate-50'
              } ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
            >
              {/* Today Badge Highlight */}
              {cell.isToday ? (
                <div className="w-7 h-7 rounded-full bg-[#155A32] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-emerald-400">
                  {cell.day}
                </div>
              ) : cell.event?.type === 'sick' && cell.isCurrentMonth ? (
                <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs border border-rose-200">
                  {cell.day}
                </div>
              ) : cell.event?.type === 'vacation' && cell.isCurrentMonth ? (
                <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#166534] flex items-center justify-center font-semibold text-xs border border-emerald-300/40">
                  {cell.day}
                </div>
              ) : (
                <span className="text-xs">{cell.day}</span>
              )}

              {/* Status Indicator Dots */}
              {cell.isCurrentMonth && cell.event && !cell.isToday && (
                <div className="absolute bottom-0.5 flex space-x-0.5">
                  {cell.event.dot === 'orange' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ring-1 ring-white" />
                  )}
                  {cell.event.dot === 'blue' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 ring-1 ring-white" />
                  )}
                  {cell.event.dot === 'green' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ring-1 ring-white" />
                  )}
                  {cell.event.dot === 'red' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Day Details Popover / Banner if clicked */}
      {selectedDayEvent && (
        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs animate-in fade-in">
          <div className="truncate mr-2">
            <span className="font-bold text-emerald-900">
              วันที่ {selectedDayEvent.day} {selectedDayEvent.month}:
            </span>{' '}
            <span className="text-slate-700">{selectedDayEvent.label}</span>
          </div>
          <span className="flex-shrink-0 px-2 py-0.5 bg-white text-emerald-800 rounded-full font-medium text-[10px] shadow-xs">
            {selectedDayEvent.badge}
          </span>
        </div>
      )}

      {/* Legend Footer */}
      <div className="flex items-center justify-center space-x-4 pt-3 mt-2 border-t border-slate-100 text-[11px] text-slate-600">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#155A32] ring-1 ring-emerald-400" />
          <span className="font-semibold text-slate-700">วันนี้</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>พักร้อน</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>ลากิจ</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>ลาป่วย</span>
        </div>
      </div>
    </div>
  );
}
