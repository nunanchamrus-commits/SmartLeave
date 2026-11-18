import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CalendarPlus,
  CalendarX2,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLeave } from '../context/LeaveContext';

export default function LeaveRequestModal() {
  const {
    isRequestModalOpen,
    setIsRequestModalOpen,
    submitLeaveRequest,
    submitCancelLeaveRequest,
    myLeaveRequests,
    quotas,
    currentUser,
  } = useLeave();

  const isMale =
    currentUser?.gender === 'ชาย' ||
    currentUser?.gender === 'male' ||
    Boolean(currentUser?.prefix?.includes('นาย')) ||
    Boolean(currentUser?.prefixEn?.includes('Mr.')) ||
    Boolean(currentUser?.name?.startsWith('นาย')) ||
    Boolean(currentUser?.englishName?.startsWith('Mr.'));

  const availableLeaveTypes = [
    { id: 'vacation', label: 'ลาพักผ่อน' },
    { id: 'personal', label: 'ลากิจ' },
    { id: 'sick', label: 'ลาป่วย' },
    ...(!isMale ? [{ id: 'maternity', label: 'ลาคลอดบุตร' }] : []),
  ];

  const getTodayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Top-level tab inside modal: 'leave' (ซ้ายมือ: ขอลา) | 'cancel' (ขวามือ: ขอยกเลิกการลา)
  const [modalTab, setModalTab] = useState('leave');

  // --- State สำหรับแท็บ "ขอลา" ---
  const [leaveType, setLeaveType] = useState('vacation');
  const [startDate, setStartDate] = useState(getTodayISO);
  const [endDate, setEndDate] = useState(getTodayISO);
  const [durationMode, setDurationMode] = useState('full'); // 'full', 'half-morning', 'half-afternoon'
  const [reason, setReason] = useState('');
  const [substitute, setSubstitute] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // --- State สำหรับแท็บ "ขอยกเลิกการลา" ---
  const [selectedCancelId, setSelectedCancelId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFileName, setCancelFileName] = useState('');
  const [cancelFileData, setCancelFileData] = useState('');
  const [cancelErrorMsg, setCancelErrorMsg] = useState('');
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [isCancelSuccess, setIsCancelSuccess] = useState(false);

  // รายการลาของฉันที่สามารถยื่นขอยกเลิกได้
  const cancellableLeaves = (myLeaveRequests || []).filter(
    (r) =>
      r.status !== 'ไม่อนุมัติ' &&
      r.status !== 'ยกเลิกการลา' &&
      r.cancelStatus !== 'pending' &&
      r.cancelStatus !== 'approved'
  );

  // รายการที่ยื่นขอยกเลิกไปแล้วและอยู่ระหว่างรอพิจารณา
  const pendingCancelLeaves = (myLeaveRequests || []).filter(
    (r) => r.cancelStatus === 'pending'
  );

  // Reset modal errors/selection when opened
  useEffect(() => {
    if (isRequestModalOpen) {
      setErrorMsg('');
      setCancelErrorMsg('');
      setIsSuccess(false);
      setIsCancelSuccess(false);
    }
  }, [isRequestModalOpen]);

  // Auto-select first cancellable leave when switching to cancel tab
  useEffect(() => {
    if (modalTab === 'cancel' && cancellableLeaves.length > 0) {
      const stillExists = cancellableLeaves.some((r) => String(r.id) === String(selectedCancelId));
      if (!stillExists) {
        setSelectedCancelId(String(cancellableLeaves[0].id));
      }
    }
  }, [modalTab, cancellableLeaves.length]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        setErrorMsg('ขนาดไฟล์ต้องไม่เกิน 3 MB เพื่อประสิทธิภาพของระบบ');
        return;
      }
      setErrorMsg('');
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setFileData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileName('');
    setFileData('');
  };

  const handleCancelFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        setCancelErrorMsg('ขนาดไฟล์เอกสารการยกเลิกต้องไม่เกิน 3 MB');
        return;
      }
      setCancelErrorMsg('');
      setCancelFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setCancelFileData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCancelFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCancelFileName('');
    setCancelFileData('');
  };

  // If user is male and leaveType was set to maternity, auto-reset to vacation
  if (isMale && leaveType === 'maternity') {
    setLeaveType('vacation');
  }

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
    const isSickAsActual = currentUser?.employmentType === 'พนักงานราชการ' || quotas.sick?.isSickAsActual;
    switch (leaveType) {
      case 'vacation':
        return { name: 'ลาพักผ่อน', remaining: Number(quotas.vacation?.remaining ?? 10), isActual: false };
      case 'personal':
        return { name: 'ลากิจ', remaining: Number(quotas.personal?.remaining ?? (currentUser?.employmentType === 'พนักงานราชการ' ? 10 : 45)), isActual: false };
      case 'sick':
        return {
          name: 'ลาป่วย',
          remaining: isSickAsActual ? 999 : Number(quotas.sick?.remaining ?? 60),
          isActual: isSickAsActual,
        };
      case 'maternity':
        return { name: 'ลาคลอดบุตร', remaining: Number(quotas.maternity ? quotas.maternity.remaining : 90), isActual: false };
      default:
        return { name: 'อื่นๆ', remaining: 10, isActual: false };
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
    if (daysCount > quotaInfo.remaining && !quotaInfo.isActual) {
      setErrorMsg(`จำนวนวันลาเกินโควตาคงเหลือ (${quotaInfo.remaining} วัน)`);
      return;
    }

    const typeLabels = {
      vacation: 'ลาพักผ่อน',
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
      attachmentName: fileName,
      attachmentUrl: fileData,
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsRequestModalOpen(false);
      setReason('');
      setSubstitute('');
      setFileName('');
      setFileData('');
    }, 1500);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCancelId) {
      setCancelErrorMsg('กรุณาเลือกรายการลาที่ต้องการขอยกเลิก');
      return;
    }
    if (!cancelReason.trim()) {
      setCancelErrorMsg('กรุณาระบุเหตุผลการขอยกเลิกการลา');
      return;
    }

    setCancelErrorMsg('');
    setIsCancelSubmitting(true);
    try {
      const res = await submitCancelLeaveRequest(selectedCancelId, {
        cancelReason: cancelReason.trim(),
        cancelAttachmentName: cancelFileName,
        cancelAttachmentUrl: cancelFileData,
      });
      if (res?.success) {
        setIsCancelSuccess(true);
        setTimeout(() => {
          setIsCancelSuccess(false);
          setCancelReason('');
          setCancelFileName('');
          setCancelFileData('');
          setSelectedCancelId('');
          setIsRequestModalOpen(false);
        }, 1500);
      }
    } finally {
      setIsCancelSubmitting(false);
    }
  };

  const getMiniStatusBadge = (status) => {
    if (status === 'อนุมัติ') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (status === 'อยู่ระหว่างตรวจสอบ') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#123E24] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
              {modalTab === 'leave' ? (
                <Calendar className="w-4 h-4" />
              ) : (
                <CalendarX2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-prompt">
                ขอลา / ขอยกเลิกการลา
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRequestModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Tab Switcher: ขอลา (ซ้าย) | ขอยกเลิกการลา (ขวา) */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200/80">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setModalTab('leave');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                modalTab === 'leave'
                  ? 'bg-[#155A32] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CalendarPlus className="w-4 h-4" />
              <span>ขอลา</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setModalTab('cancel');
                setCancelErrorMsg('');
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                modalTab === 'cancel'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CalendarX2 className="w-4 h-4" />
              <span>ขอยกเลิกการลา</span>
              {pendingCancelLeaves.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    modalTab === 'cancel'
                      ? 'bg-white/25 text-white'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {pendingCancelLeaves.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ==================== TAB 1: ขอลา (ซ้าย) ==================== */}
        {modalTab === 'leave' && (
          <>
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
                  <div className={`grid grid-cols-2 ${isMale ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-2`}>
                    {availableLeaveTypes.map((t) => {
                      let remBadge = '';
                      if (t.id === 'vacation') remBadge = `${quotas.vacation?.remaining ?? 10} วัน`;
                      else if (t.id === 'personal') remBadge = `${quotas.personal?.remaining ?? (currentUser?.employmentType === 'พนักงานราชการ' ? 10 : 45)} วัน`;
                      else if (t.id === 'sick') {
                        const isSickActual = currentUser?.employmentType === 'พนักงานราชการ' || quotas.sick?.isSickAsActual;
                        remBadge = isSickActual ? 'เท่าที่ป่วยจริง' : `${quotas.sick?.remaining ?? 60} วัน`;
                      } else if (t.id === 'maternity') remBadge = `${quotas.maternity?.remaining ?? 90} วัน`;

                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            setLeaveType(t.id);
                            setErrorMsg('');
                          }}
                          className={`py-2 px-2 rounded-2xl border text-center transition-all ${
                            leaveType === t.id
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs font-semibold">{t.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            เหลือ {remBadge}
                          </div>
                        </button>
                      );
                    })}
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
                    placeholder="ระบุชื่อ - นามสกุล ผู้ปฏิบัติงานแทน"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Attachment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">เอกสารแนบ (PDF / รูปภาพ)</label>
                    <span className="text-[11px] text-slate-400">ขนาดไม่เกิน 3 MB</span>
                  </div>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-3 text-center transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-0"
                    />
                    <div className="flex items-center justify-between px-2 text-xs text-slate-500 relative z-10 pointer-events-none">
                      <div className="flex items-center space-x-2 truncate max-w-[85%]">
                        <UploadCloud className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">
                          {fileName ? (
                            <span className="font-semibold text-emerald-700">{fileName}</span>
                          ) : (
                            'คลิกเพื่อเลือกไฟล์ PDF หรือรูปภาพ (ไม่เกิน 3 MB)'
                          )}
                        </span>
                      </div>
                      {fileName && (
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-rose-500 hover:text-rose-700 p-1 pointer-events-auto transition-colors"
                          title="ลบไฟล์แนบ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
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
          </>
        )}

        {/* ==================== TAB 2: ขอยกเลิกการลา (ขวา) ==================== */}
        {modalTab === 'cancel' && (
          <>
            {isCancelSuccess ? (
              <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">ส่งคำขอยกเลิกการลาเรียบร้อยแล้ว!</h4>
                <p className="text-sm text-slate-500">
                  คำขอยกเลิกการลาของคุณถูกส่งไปยังผู้ดูแลระบบเพื่อพิจารณาอนุญาตแล้ว
                </p>
              </div>
            ) : (
              <form onSubmit={handleCancelSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                {cancelErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center space-x-2 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{cancelErrorMsg}</span>
                  </div>
                )}

                {/* Select Leave Request to Cancel */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-2">
                    เลือกรายการลาที่ต้องการขอยกเลิก <span className="text-red-500">*</span>
                  </label>

                  {cancellableLeaves.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600 text-xs sm:text-sm">
                        ยังไม่มีรายการลาที่สามารถขอยกเลิกได้ในขณะนี้
                      </p>
                      <p className="text-[11px] text-slate-400">
                        รายการที่ยกเลิกแล้ว ไม่อนุมัติ หรือกำลังรอพิจารณายกเลิกจะไม่แสดงในรายการนี้
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {cancellableLeaves.map((req) => {
                        const isSelected = String(selectedCancelId) === String(req.id);
                        return (
                          <button
                            type="button"
                            key={req.id}
                            onClick={() => {
                              setSelectedCancelId(String(req.id));
                              setCancelErrorMsg('');
                            }}
                            className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/15'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center flex-wrap gap-1.5">
                                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                  {req.type}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getMiniStatusBadge(req.status)}`}
                                >
                                  {req.status}
                                </span>
                                {req.cancelStatus === 'rejected' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                                    เคยไม่อนุญาตยกเลิก
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {req.dateRange} ({req.days} วัน)
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Cancel Reason */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เหตุผลการขอยกเลิกการลา <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    disabled={cancellableLeaves.length === 0}
                    onChange={(e) => {
                      setCancelReason(e.target.value);
                      setCancelErrorMsg('');
                    }}
                    placeholder="ระบุเหตุผลที่ต้องการยกเลิกวันลา เช่น ติดภารกิจราชการเร่งด่วน, เปลี่ยนแปลงแผนการเดินทาง..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none disabled:opacity-50"
                  />
                </div>

                {/* Cancellation Document Attachment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      แนบเอกสารการยกเลิกการลา (PDF / รูปภาพ)
                    </label>
                    <span className="text-[11px] text-slate-400">ขนาดไม่เกิน 3 MB</span>
                  </div>
                  <div className="relative border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-2xl p-4 text-center transition-colors bg-rose-50/30">
                    <input
                      type="file"
                      accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                      disabled={cancellableLeaves.length === 0}
                      onChange={handleCancelFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-0 disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center justify-between px-2 text-xs text-slate-500 relative z-10 pointer-events-none">
                      <div className="flex items-center space-x-2.5 truncate max-w-[85%]">
                        <UploadCloud className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        <span className="truncate">
                          {cancelFileName ? (
                            <span className="font-semibold text-rose-700">{cancelFileName}</span>
                          ) : (
                            'คลิกเพื่อแนบแบบฟอร์ม/เอกสารขอยกเลิกการลา (PDF หรือรูปภาพ)'
                          )}
                        </span>
                      </div>
                      {cancelFileName && (
                        <button
                          type="button"
                          onClick={handleRemoveCancelFile}
                          className="text-rose-500 hover:text-rose-700 p-1 pointer-events-auto transition-colors"
                          title="ลบไฟล์แนบ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pending Cancellation Requests Notice */}
                {pendingCancelLeaves.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>คำขอยกเลิกที่อยู่ระหว่างรอพิจารณา ({pendingCancelLeaves.length} รายการ)</span>
                    </div>
                    <div className="space-y-1">
                      {pendingCancelLeaves.map((p) => (
                        <div key={p.id} className="text-[11px] text-amber-900/80 flex items-center justify-between">
                          <span className="truncate">{p.type} ({p.dateRange})</span>
                          <span className="font-semibold text-amber-700 flex-shrink-0 ml-2">รอ Admin พิจารณา</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                  >
                    ปิด
                  </button>
                  <button
                    type="submit"
                    disabled={cancellableLeaves.length === 0 || isCancelSubmitting}
                    className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันการขอยกเลิกการลา'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
