import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Clock,
  RotateCcw,
  X,
  FileText,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import EmptyState from '../EmptyState';

export default function CalendarView() {
  const {
    leaveRequests,
    doesLeaveBelongToUser,
    setSelectedLeaveDetail,
    setIsRequestModalOpen,
    currentUser,
    isAdmin,
  } = useLeave();

  // ปฏิทินของ User แสดงเฉพาะของตัวเองเท่านั้น ส่วน Admin แสดงของทุกคนเป็นค่าเริ่มต้น
  const [filterMode, setFilterMode] = useState(isAdmin ? 'all' : 'my'); // 'my' | 'all'
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDayStr, setSelectedDayStr] = useState(null); // วันที่ที่คลิกเพื่อเปิดดูรายการลาในวันนั้น

  useEffect(() => {
    if (!isAdmin) {
      setFilterMode('my');
    }
  }, [isAdmin]);

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

      if (!isAdmin || filterMode === 'my') {
        return doesLeaveBelongToUser
          ? doesLeaveBelongToUser(req, currentUser)
          : (
            (currentUser?.id && req.employeeId === currentUser.id) ||
            (currentUser?.employeeId && req.employeeId === currentUser.employeeId) ||
            (currentUser?.email && req.employeeEmail && req.employeeEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
            (req.employeeName && currentUser?.name && req.employeeName.trim() === currentUser.name.trim())
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

    const dayStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = getEventsForDay(d);
    days.push({
      day: d,
      dateStr: dayStr,
      dayOfWeek: new Date(displayYear, displayMonth, d).getDay(),
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

  // ข้อมูลวันแบบสดที่ถูกคลิกเลือกเปิดดู
  const selectedDayItem = selectedDayStr
    ? days.find((item) => item.isCurrent && item.dateStr === selectedDayStr) || null
    : null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'อนุมัติ':
        return 'bg-[#DCFCE7] text-[#15803D] border-emerald-200';
      case 'ไม่อนุมัติ':
        return 'bg-[#FEE2E2] text-[#DC2626] border-red-200';
      case 'อยู่ระหว่างตรวจสอบ':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ยกเลิกวันลา':
      case 'ยกเลิกการลา':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

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
            <span className="font-mono font-bold text-[#2F855A] pl-1 border-l border-slate-200">
              {formattedTime} น.
            </span>
          </div>

          {/* Filter toggle: Admin ดูของทุกคน/ของตนเองได้ ส่วน User ถูกล็อกเป็นของตนเอง */}
          {isAdmin ? (
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex space-x-1 shadow-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterMode === 'all'
                    ? 'bg-[#2F855A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ทั้งหมด (ทุกคน)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('my')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterMode === 'my'
                    ? 'bg-[#2F855A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>เฉพาะของฉัน</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-xl border border-emerald-200/80 text-xs font-semibold shadow-xs">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>ปฏิทินของฉัน ({currentUser?.name || 'ผู้ใช้งาน'})</span>
            </div>
          )}

          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2 bg-[#2F855A] hover:bg-[#256F4A] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            + ขอลา
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-3 sm:p-6 space-y-4">
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
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-500 py-2">
          {daysOfWeek.map((d, i) => (
            <div key={i} className={i === 0 || i === 6 ? 'text-red-400' : ''}>
              <span className="sm:hidden">{['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][i]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>

        {/* Grid Days (คลิกที่แต่ละวันเพื่อเปิดดูรายการลาในวันนั้นได้ทันที ไม่ต้องเลื่อนดูในช่องเล็ก) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((item, idx) => {
            const visibleEvents = (item.events || []).slice(0, 2);
            const hiddenCount = Math.max(0, (item.events?.length || 0) - visibleEvents.length);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (item.isCurrent && item.dateStr) {
                    setSelectedDayStr(item.dateStr);
                  }
                }}
                className={`min-h-[72px] sm:min-h-[116px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
                  item.isCurrent
                    ? item.isToday
                      ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs cursor-pointer hover:bg-emerald-50/70'
                      : 'bg-white border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-sm cursor-pointer'
                    : 'bg-slate-50/50 border-slate-50 text-slate-300'
                }`}
                title={item.isCurrent ? 'คลิกเพื่อดูรายละเอียดการลาในวันนี้' : undefined}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold ${
                      item.isToday
                        ? 'w-6 h-6 rounded-full bg-[#2F855A] text-white flex items-center justify-center shadow-xs'
                        : item.isCurrent
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.day}
                  </span>
                  <div className="flex items-center space-x-1">
                    {item.isToday && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                        วันนี้
                      </span>
                    )}
                    {item.isCurrent && item.events && item.events.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded-full">
                        {item.events.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Event Chips */}
                <div className="space-y-1 mt-1.5 overflow-hidden">
                  {visibleEvents.map((ev, i) => (
                    <div
                      key={ev.id || i}
                      className={`w-full text-left px-1.5 py-0.5 rounded-lg text-[10px] font-medium border truncate ${getEventStyle(
                        ev.typeKey
                      )}`}
                      title={`${ev.employeeName} - ${ev.type} (${ev.status})`}
                    >
                      {ev.employeeName ? ev.employeeName.split(' ')[0] : 'คำขอ'}: {ev.type}
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <div className="w-full text-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 transition-colors">
                      +{hiddenCount} รายการ (คลิกดู)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Leave Details Modal (คลิกวันที่ในปฏิทินเพื่อดูรายการลาทั้งหมดของวันนั้น) */}
      {selectedDayItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedDayStr(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#2E6F4E] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg font-prompt">
                    {thaiDayNames[selectedDayItem.dayOfWeek]}ที่ {selectedDayItem.day} {monthsThai[displayMonth]} {displayYearBE}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    {selectedDayItem.events.length > 0
                      ? `มีรายการลาทั้งหมด ${selectedDayItem.events.length} รายการ`
                      : 'ไม่มีรายการลาในวันนี้'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayStr(null)}
                className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-3">
              {selectedDayItem.events.length === 0 ? (
                <EmptyState
                  compact
                  variant="calendar"
                  title="ไม่มีรายการลาในวันนี้"
                  description={
                    isAdmin && filterMode === 'all'
                      ? 'เจ้าหน้าที่ทุกคนปฏิบัติงานตามปกติในวันนี้'
                      : 'ท่านไม่มีรายการลาในวันนี้'
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {selectedDayItem.events.map((ev, i) => (
                    <button
                      type="button"
                      key={ev.id || i}
                      onClick={() => {
                        setSelectedDayStr(null);
                        setSelectedLeaveDetail(ev);
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="font-bold text-slate-800 text-sm">
                            {ev.employeeName || 'ผู้ใช้งาน'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getEventStyle(ev.typeKey)}`}>
                            {ev.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(ev.status)}`}>
                            {ev.status}
                          </span>
                        </div>
                        {ev.department && (
                          <p className="text-[11px] text-slate-400">{ev.department}</p>
                        )}
                        <p className="text-xs text-slate-600">
                          ช่วงวันที่ลา: <span className="font-semibold text-slate-800">{ev.dateRange}</span> ({ev.days} วัน)
                        </p>
                        {ev.reason && (
                          <p className="text-[11px] text-slate-500 truncate">เหตุผล: {ev.reason}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedDayStr(null);
                  setIsRequestModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#2F855A] hover:bg-[#256F4A] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                + ขอลา / ยกเลิกวันลา
              </button>
              <button
                type="button"
                onClick={() => setSelectedDayStr(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/70 text-xs font-semibold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
