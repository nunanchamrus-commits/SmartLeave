import React, { useState } from 'react';
import { X, Calendar, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLeave } from '../context/LeaveContext';

export default function LeaveRequestModal() {
  const { isRequestModalOpen, setIsRequestModalOpen, submitLeaveRequest, quotas } = useLeave();

  const getTodayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [leaveType, setLeaveType] = useState('vacation');
  const [startDate, setStartDate] = useState(getTodayISO);
  const [endDate, setEndDate] = useState(getTodayISO);
  const [durationMode, setDurationMode] = useState('full'); // 'full', 'half-morning', 'half-afternoon'
  const [reason, setReason] = useState('');
  const [substitute, setSubstitute] = useState('เอ');
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isRequestModalOpen) return null;

  // Calculate duration in days
  const calculateDays = () => {
    if (durationMode === 'half-morning' || durationMode === 'half-afternoon') {
      return 0.5;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const daysCount = calculateDays();

  // Get quota info
  const getCurrentQuota = () => {
    switch (leaveType) {
      case 'vacation':
        return { name: 'ลาพักร้อน', remaining: quotas.vacation.remaining };
      case 'personal':
        return { name: 'ลากิจ', remaining: quotas.personal.remaining };
      case 'sick':
        return { name: 'ลาป่วย', remaining: quotas.sick.remaining };
      case 'maternity':
        return { name: 'ลาคลอดบุตร', remaining: quotas.maternity ? quotas.maternity.remaining : 90 };
      default:
        return { name: 'อื่นๆ', remaining: 10 };
    }
  };

  const quotaInfo = getCurrentQuota();

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('กรุณากรอกเหตุผลการลา');
      return;
    }
    if (daysCount > quotaInfo.remaining && leaveType !== 'sick') {
      setErrorMsg(`จำนวนวันลาเกินโควตาคงเหลือ (${quotaInfo.remaining} วัน)`);
      return;
    }

    const typeLabels = {
      vacation: 'ลาพักร้อน',
      personal: 'ลากิจ',
      sick: 'ลาป่วย',
      maternity: 'ลาคลอดบุตร',
    };

    const dateRangeStr =
      startDate === endDate
        ? `${formatThaiDate(startDate)}${durationMode !== 'full' ? ' (ครึ่งวัน)' : ''}`
        : `${formatThaiDate(startDate)} – ${formatThaiDate(endDate)}`;

    submitLeaveRequest({
      type: typeLabels[leaveType],
      typeKey: leaveType,
      dateRange: dateRangeStr,
      startDate,
      endDate,
      days: daysCount,
      reason,
      substitute,
      attachment: fileName,
    });

    // Fire confetti effect
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsRequestModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#123E24] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg font-prompt">ยื่นคำขอลา (Leave Request)</h3>
          </div>
          <button
            onClick={() => setIsRequestModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">ยื่นคำขอลาเรียบร้อยแล้ว!</h4>
            <p className="text-sm text-slate-500">
              คำขอของคุณถูกบันทึกเรียบร้อยแล้ว (สถานะ: ยังไม่ยื่นเอกสาร)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Leave Type Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                ประเภทการลา <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'vacation', label: 'ลาพักร้อน' },
                  { id: 'personal', label: 'ลากิจ' },
                  { id: 'sick', label: 'ลาป่วย' },
                  { id: 'maternity', label: 'ลาคลอดบุตร' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => {
                      setLeaveType(t.id);
                      setErrorMsg('');
                    }}
                    className={`py-2.5 px-2 rounded-2xl border text-center transition-all ${
                      leaveType === t.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Mode */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">ช่วงเวลา</label>
              <div className="flex space-x-2">
                {[
                  { id: 'full', label: 'เต็มวัน' },
                  { id: 'half-morning', label: 'ครึ่งวันเช้า' },
                  { id: 'half-afternoon', label: 'ครึ่งวันบ่าย' },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setDurationMode(m.id)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border transition-colors ${
                      durationMode === m.id
                        ? 'bg-[#155A32] text-white border-[#155A32]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ตั้งแต่วันที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (e.target.value > endDate) setEndDate(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ถึงวันที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  disabled={durationMode !== 'full'}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Calculated duration summary badge */}
            <div className="p-3 bg-emerald-50/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900 border border-emerald-100">
              <span className="font-medium">สรุปจำนวนวันลาที่ขอ:</span>
              <span className="font-bold text-sm bg-white px-3 py-1 rounded-full shadow-xs border border-emerald-200 text-emerald-800">
                {daysCount} วัน
              </span>
            </div>

            {/* Reason */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เหตุผลการลา <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="ระบุเหตุผลการลา เช่น พักผ่อนกับครอบครัว, พบแพทย์..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
              />
            </div>

            {/* Colleague handover */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ผู้ปฏิบัติงานแทน</label>
              <input
                type="text"
                value={substitute}
                onChange={(e) => setSubstitute(e.target.value)}
                placeholder="ระบุชื่อ - นามสกุล ผู้ปฏิบัติงานแทน เช่น เอ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เอกสารแนบ (ถ้ามี)</label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-3 text-center transition-colors cursor-pointer bg-slate-50/50">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>
                    {fileName ? (
                      <span className="font-semibold text-emerald-700">{fileName}</span>
                    ) : (
                      'คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์มาวางที่นี่'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#155A32] hover:bg-[#114929] text-white font-semibold shadow-sm hover:shadow transition-all"
              >
                ยืนยันการขอลา
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

