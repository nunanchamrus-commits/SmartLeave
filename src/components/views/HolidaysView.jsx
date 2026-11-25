import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  Search,
  Sparkles,
  Info,
  Calendar,
  X,
  AlertCircle,
  Tag,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { getCalendarHolidays } from '../../data/holidays';
import DinoMascot from '../DinoMascot';

const THAI_MONTH_NAMES = [
  '',
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

const THAI_DAY_NAMES = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
];

export default function HolidaysView() {
  const { isAdmin, customHolidays, addCustomHoliday, deleteCustomHoliday } = useLeave();

  // Current real date
  const now = new Date();
  const currentYear = now.getFullYear();
  const todayStr = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // State
  const [selectedYear, setSelectedYear] = useState(currentYear); // Gregorian year (e.g. 2026)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('all'); // 'all' | 'q1' | 'q2' | 'q3' | 'q4' | 'custom'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State for Add Holiday
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    type: 'special', // 'special' | 'substitute' | 'official'
  });
  const [formError, setFormError] = useState('');

  // Fetch all holidays for selectedYear (Standard + Custom)
  const allYearHolidays = useMemo(() => {
    return getCalendarHolidays(selectedYear, customHolidays);
  }, [selectedYear, customHolidays]);

  // Find next upcoming holiday (from today onward)
  const nextUpcoming = useMemo(() => {
    // Check current year then next year
    const combinedUpcoming = [
      ...getCalendarHolidays(currentYear, customHolidays),
      ...getCalendarHolidays(currentYear + 1, customHolidays),
    ]
      .filter((h) => h.dateStr >= todayStr)
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    return combinedUpcoming.length > 0 ? combinedUpcoming[0] : null;
  }, [currentYear, customHolidays, todayStr]);

  // Calculate days remaining to next upcoming holiday
  const daysUntilNext = useMemo(() => {
    if (!nextUpcoming) return null;
    const [y, m, d] = nextUpcoming.dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }, [nextUpcoming, now]);

  // Filtered Holidays
  const filteredHolidays = useMemo(() => {
    return allYearHolidays.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchDate = item.fullDate?.toLowerCase().includes(q) || item.dateStr?.includes(q);
        if (!matchName && !matchDesc && !matchDate) return false;
      }

      // 2. Quarter Filter
      if (selectedQuarter === 'custom') {
        return item.isCustom === true;
      }
      if (selectedQuarter === 'q1') {
        return item.month >= 1 && item.month <= 3;
      }
      if (selectedQuarter === 'q2') {
        return item.month >= 4 && item.month <= 6;
      }
      if (selectedQuarter === 'q3') {
        return item.month >= 7 && item.month <= 9;
      }
      if (selectedQuarter === 'q4') {
        return item.month >= 10 && item.month <= 12;
      }

      return true;
    });
  }, [allYearHolidays, searchQuery, selectedQuarter]);

  // Group holidays by Month
  const holidaysByMonth = useMemo(() => {
    const groups = {};
    filteredHolidays.forEach((h) => {
      if (!groups[h.month]) groups[h.month] = [];
      groups[h.month].push(h);
    });
    return groups;
  }, [filteredHolidays]);

  // Helper to get Thai Day name for a dateStr
  const getDayOfWeekName = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return THAI_DAY_NAMES[dt.getDay()];
  };

  // Helper to check if long weekend (Friday or Monday)
  const isLongWeekend = (dateStr) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const day = new Date(y, m - 1, d).getDay();
    return day === 1 || day === 5; // Monday or Friday
  };

  // Handle Submit Form
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
      setIsAddModalOpen(false);
      setFormData({ name: '', date: '', description: '', type: 'special' });
      setFormError('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 font-prompt">
                ปฏิทินวันหยุดราชการ
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                ตรวจสอบวันหยุดนักขัตฤกษ์ประจำปี วางแผนการลาพักผ่อนล่วงหน้าอย่างมีความสุข
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Add Holiday (Admin only) & Year Select */}
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setIsAddModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มวันหยุดพิเศษ</span>
            </button>
          )}

          {/* Year Selector Pills */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedYear === yr
                    ? 'bg-[#1E5638] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                พ.ศ. {yr + 543}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Banner: Next Upcoming Holiday Countdown */}
      {nextUpcoming && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#184E34] via-[#226343] to-[#164930] text-white p-5 sm:p-7 shadow-md border border-emerald-900/20">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-2 flex flex-col items-center justify-center flex-shrink-0 backdrop-blur-xs shadow-inner">
                <span className="text-[11px] font-medium text-emerald-200 uppercase leading-none">
                  {THAI_MONTH_NAMES[parseInt(nextUpcoming.dateStr.split('-')[1], 10)]?.slice(0, 4)}
                </span>
                <span className="text-2xl font-black text-white leading-none mt-1 font-prompt">
                  {nextUpcoming.dateStr.split('-')[2]}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-slate-900 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-900" />
                    <span>วันหยุดที่ใกล้ถึงที่สุด</span>
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
                <h3 className="text-xl sm:text-2xl font-extrabold font-prompt text-white">
                  {nextUpcoming.name}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl">
                  {getDayOfWeekName(nextUpcoming.dateStr)}ที่ {nextUpcoming.fullDate} — {nextUpcoming.description}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 hidden lg:flex items-center pr-4">
              <DinoMascot pose="holiday" size={110} className="filter drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar & Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quarter Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
          {[
            { id: 'all', label: `ทั้งปี (${allYearHolidays.length})` },
            { id: 'q1', label: 'ไตรมาส 1 (ม.ค. - มี.ค.)' },
            { id: 'q2', label: 'ไตรมาส 2 (เม.ย. - มิ.ย.)' },
            { id: 'q3', label: 'ไตรมาส 3 (ก.ค. - ก.ย.)' },
            { id: 'q4', label: 'ไตรมาส 4 (ต.ค. - ธ.ค.)' },
            ...(customHolidays && customHolidays.length > 0
              ? [{ id: 'custom', label: `พิเศษ (${customHolidays.length})` }]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedQuarter(tab.id)}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedQuarter === tab.id
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
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

      {/* Holidays List Grouped by Month */}
      {filteredHolidays.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <DinoMascot pose="error" size={90} className="mb-2" />
          <h4 className="font-bold text-slate-800 font-prompt text-base">ไม่พบรายการวันหยุดที่ตรงกับเงื่อนไข</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกดูวันหยุดในไตรมาสอื่นๆ
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(holidaysByMonth)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([monthNum, holidays]) => (
              <div key={monthNum} className="space-y-3">
                {/* Month Title */}
                <div className="flex items-center space-x-2 px-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-slate-800 text-base font-prompt">
                    {THAI_MONTH_NAMES[Number(monthNum)]} {selectedYear + 543}
                  </h3>
                  <span className="text-xs text-slate-400">
                    ({holidays.length} วัน)
                  </span>
                </div>

                {/* Holiday Cards in this Month */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {holidays.map((h) => {
                    const isLong = isLongWeekend(h.dateStr);
                    const isPast = h.dateStr < todayStr;
                    const isToday = h.dateStr === todayStr;

                    return (
                      <div
                        key={h.id}
                        className={`relative rounded-2xl p-4 border transition-all flex items-start space-x-3.5 bg-white shadow-2xs hover:shadow-sm ${
                          isToday
                            ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                            : isPast
                            ? 'border-slate-200/60 opacity-80'
                            : 'border-slate-200/90 hover:border-emerald-300'
                        }`}
                      >
                        {/* Date Box */}
                        <div
                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border ${
                            isToday
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                              : isPast
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-200/80 shadow-2xs'
                          }`}
                        >
                          <span className="text-[10px] font-semibold leading-none">
                            {getDayOfWeekName(h.dateStr).replace('วัน', '')}
                          </span>
                          <span className="text-xl font-black font-prompt leading-tight mt-0.5">
                            {h.day}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mb-1">
                            {h.isCustom ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                <ShieldCheck className="w-3 h-3 text-purple-600" />
                                <span>กำหนดโดยหน่วยงาน</span>
                              </span>
                            ) : h.name.includes('ชดเชย') ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                วันหยุดชดเชย
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                วันหยุดราชการ
                              </span>
                            )}

                            {isLong && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                🌴 หยุดยาว
                              </span>
                            )}

                            {isToday && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-600 text-white">
                                วันนี้
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-800 text-sm font-prompt leading-snug line-clamp-2">
                            {h.name}
                          </h4>
                          <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {h.description || 'วันหยุดราชการประจำปี'}
                          </p>
                          <div className="mt-2 text-[10.5px] text-slate-400 font-medium">
                            {h.fullDate}
                          </div>
                        </div>

                        {/* Admin Delete Action for Custom Holidays */}
                        {isAdmin && h.isCustom && (
                          <div className="absolute top-3 right-3">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(h.id)}
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="ลบวันหยุดพิเศษนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
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
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomHoliday(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Holiday Modal (Admin Only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1E5638] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CalendarPlusIcon className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base font-prompt">เพิ่มวันหยุดพิเศษประจำหน่วยงาน</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitAdd} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Holiday Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อวันหยุด <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น วันหยุดพิเศษประจำจังหวัด / วันหยุดกรณีพิเศษ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่หยุด <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทวันหยุด
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  <option value="special">วันหยุดพิเศษประจำหน่วยงาน</option>
                  <option value="official">วันหยุดราชการกรณีพิเศษ (มติ ครม.)</option>
                  <option value="substitute">วันหยุดชดเชย</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียด / หมายเหตุ (ถ้ามี)
                </label>
                <textarea
                  rows={2}
                  placeholder="ระบุวัตถุประสงค์ หรือประกาศหน่วยงานที่เกี่ยวข้อง..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E5638] hover:bg-[#16442B] text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  + บันทึกวันหยุด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarPlusIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M10 16h4" />
      <path d="M12 14v4" />
    </svg>
  );
}
