import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { THAI_MONTHS_FULL, formatThaiDateBE } from '../utils/thaiDate';

const WEEKDAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function parseISO(isoStr) {
  if (typeof isoStr === 'string') {
    const m = isoStr.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      return {
        year: parseInt(m[1], 10),
        month: parseInt(m[2], 10) - 1,
        day: parseInt(m[3], 10),
      };
    }
  }
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
}

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function ThaiDatePicker({
  value,
  onChange,
  min,
  max,
  disabled = false,
  className = '',
  placeholder = 'เลือกวันที่ (พ.ศ.)',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const parsed = parseISO(value);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  useEffect(() => {
    if (value) {
      const p = parseISO(value);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const now = new Date();
  const todayISO = toISO(now.getFullYear(), now.getMonth(), now.getDate());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const iso = toISO(viewYear, viewMonth, day);
    if (min && iso < min) return;
    if (max && iso > max) return;
    if (onChange) onChange(iso);
    setOpen(false);
  };

  const handleSelectToday = () => {
    if (min && todayISO < min) return;
    if (max && todayISO > max) return;
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    if (onChange) onChange(todayISO);
    setOpen(false);
  };

  const yearOptions = [];
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 3; y++) {
    yearOptions.push(y);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none flex items-center justify-between text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className={value ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {value ? formatThaiDateBE(value) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 mt-1.5 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Month / Year (พ.ศ.) Header */}
          <div className="flex items-center justify-between mb-3 gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {THAI_MONTHS_FULL.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    พ.ศ. {y + 543}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
            {WEEKDAYS_TH.map((wd, idx) => (
              <div
                key={wd}
                className={`text-[11px] font-bold py-1 ${
                  idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const iso = toISO(viewYear, viewMonth, day);
              const isSelected = value === iso;
              const isToday = todayISO === iso;
              const isDisabled = Boolean((min && iso < min) || (max && iso > max));
              return (
                <button
                  type="button"
                  key={iso}
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#155A32] text-white font-bold shadow-xs'
                      : isToday
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-300'
                        : 'text-slate-700 hover:bg-slate-100'
                  } ${isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleSelectToday}
              disabled={Boolean((min && todayISO < min) || (max && todayISO > max))}
              className="text-emerald-700 hover:text-emerald-900 font-bold disabled:opacity-40"
            >
              วันนี้ ({formatThaiDateBE(todayISO)})
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 font-medium"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
