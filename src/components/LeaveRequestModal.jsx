import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CalendarPlus,
  CalendarX2,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Check,
  Clock,
  FileText,
  FileDown,
} from 'lucide-react';
import { downloadCancelLeaveSlipPdf } from '../utils/exportPdf';
import confetti from 'canvas-confetti';
import { useLeave } from '../context/LeaveContext';
import ThaiDatePicker from './ThaiDatePicker';
import {
  enumerateIsoDates,
  formatThaiDateBE,
  formatCancelDatesBE,
  getTodayThaiISO,
  getLastLeaveDateISO,
  isLeaveCancellable,
} from '../utils/thaiDate';

export default function LeaveRequestModal() {
  const {
    isRequestModalOpen,
    setIsRequestModalOpen,
    submitLeaveRequest,
    submitCancelLeaveRequest,
    myLeaveRequests,
    quotas,
    currentUser,
    preselectedCancelId,
    setPreselectedCancelId,
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

  const getSickMinDateISO = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
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

  // --- State สำหรับแท็บ "ยกเลิกวันลา" ---
  const [selectedCancelId, setSelectedCancelId] = useState('');
  const [isSelectingCancelItem, setIsSelectingCancelItem] = useState(true);
  const [selectedCancelDates, setSelectedCancelDates] = useState([]);
  const [cancelRangeStart, setCancelRangeStart] = useState('');
  const [cancelRangeEnd, setCancelRangeEnd] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelFileName, setCancelFileName] = useState('');
  const [cancelFileData, setCancelFileData] = useState('');
  const [cancelErrorMsg, setCancelErrorMsg] = useState('');
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [isCancelSuccess, setIsCancelSuccess] = useState(false);
  const [isDownloadingCancelPdf, setIsDownloadingCancelPdf] = useState(false);
  const [lastCancelledReq, setLastCancelledReq] = useState(null);

  // รายการลาของฉันที่สามารถยื่นขอยกเลิกได้ (ขอยกเลิกได้ถึงวันที่ลาวันสุดท้าย เช่น ลา 25-28 ยกเลิกได้ถึงวันที่ 28)
  const todayIso = getTodayThaiISO();
  const cancellableLeaves = (myLeaveRequests || []).filter((r) =>
    isLeaveCancellable(r, todayIso)
  );

  const selectedLeave = cancellableLeaves.find((r) => String(r.id) === String(selectedCancelId)) || null;
  const selectedLeaveAllDates = selectedLeave
    ? enumerateIsoDates(selectedLeave.startDate, selectedLeave.endDate)
    : [];
  const useRangePickerForCancel = selectedLeaveAllDates.length > 31;

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

      if (preselectedCancelId) {
        setModalTab('cancel');
        setSelectedCancelId(String(preselectedCancelId));
        setIsSelectingCancelItem(false);
        if (typeof setPreselectedCancelId === 'function') {
          setPreselectedCancelId(null);
        }
      } else {
        if (cancellableLeaves.length === 1) {
          setSelectedCancelId(String(cancellableLeaves[0].id));
          setIsSelectingCancelItem(false);
        } else {
          setSelectedCancelId('');
          setIsSelectingCancelItem(true);
        }
      }
    }
  }, [isRequestModalOpen, preselectedCancelId]);

  // Auto-select if only 1 cancellable leave exists when switching to cancel tab
  useEffect(() => {
    if (modalTab === 'cancel') {
      if (cancellableLeaves.length === 1) {
        setSelectedCancelId(String(cancellableLeaves[0].id));
        setIsSelectingCancelItem(false);
      } else if (selectedCancelId) {
        const stillExists = cancellableLeaves.some((r) => String(r.id) === String(selectedCancelId));
        if (!stillExists) {
          setSelectedCancelId('');
          setIsSelectingCancelItem(true);
        }
      } else {
        setIsSelectingCancelItem(true);
      }
    }
  }, [modalTab, cancellableLeaves.length]);

  // Sync selectable dates whenever selected leave changes
  useEffect(() => {
    if (selectedLeave) {
      const allDates = enumerateIsoDates(selectedLeave.startDate, selectedLeave.endDate);
      setSelectedCancelDates(allDates);
      setCancelRangeStart(selectedLeave.startDate || '');
      setCancelRangeEnd(selectedLeave.endDate || selectedLeave.startDate || '');
    } else {
      setSelectedCancelDates([]);
      setCancelRangeStart('');
      setCancelRangeEnd('');
    }
  }, [selectedCancelId, selectedLeave?.startDate, selectedLeave?.endDate]);

  const toggleCancelDate = (isoDate) => {
    setCancelErrorMsg('');
    setSelectedCancelDates((prev) =>
      prev.includes(isoDate) ? prev.filter((d) => d !== isoDate) : [...prev, isoDate].sort()
    );
  };

  const activeCancelDates = useRangePickerForCancel
    ? enumerateIsoDates(cancelRangeStart, cancelRangeEnd)
    : [...selectedCancelDates].sort();

  const origSelectedDays = Number(selectedLeave?.days || 0);
  const computedCancelDays = selectedLeave
    ? origSelectedDays === 0.5
      ? (activeCancelDates.length > 0 ? 0.5 : 0)
      : Math.min(origSelectedDays, activeCancelDates.length)
    : 0;
  const remainingAfterCancel = Math.max(0, Number((origSelectedDays - computedCancelDays).toFixed(2)));

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

  const handleDownloadCancelPdf = async (customReq = null) => {
    const target = customReq || selectedLeave;
    if (!target) return;
    setIsDownloadingCancelPdf(true);
    try {
      const effDates = activeCancelDates.length > 0 ? activeCancelDates : [target.startDate];
      const effStart = effDates[0] || target.startDate;
      const effEnd = effDates[effDates.length - 1] || target.endDate;
      const effCancelDays = computedCancelDays > 0 ? computedCancelDays : (target.days || 1);
      const reqToExport = {
        ...target,
        cancelReason: cancelReason.trim() || target.cancelReason || 'มีความจำเป็นเร่งด่วนในการปฏิบัติภารกิจราชการ',
        cancelStartDate: effStart,
        cancelEndDate: effEnd,
        cancelDates: effDates,
        cancelDays: effCancelDays,
        cancelRequestedAt: target.cancelRequestedAt || formatThaiDateBE(new Date()),
        cancelStatus: target.cancelStatus || 'pending',
      };
      await downloadCancelLeaveSlipPdf(reqToExport);
    } catch (err) {
      console.error('Error downloading cancel leave PDF:', err);
      setCancelErrorMsg('ไม่สามารถดาวน์โหลดไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsDownloadingCancelPdf(false);
    }
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
    const todayIso = getTodayISO();
    if ((leaveType === 'vacation' || leaveType === 'personal') && startDate < todayIso) {
      setErrorMsg('การลาพักผ่อนและลากิจไม่สามารถลาย้อนหลังได้');
      return;
    }
    const sickMinIso = getSickMinDateISO();
    if (leaveType === 'sick' && startDate < sickMinIso) {
      setErrorMsg('การลาป่วยสามารถลาย้อนหลังได้ไม่เกิน 7 วัน');
      return;
    }
    if (leaveType !== 'vacation' && !reason.trim()) {
      setErrorMsg('กรุณากรอกเหตุผลการลา');
      return;
    }
    if (daysCount > quotaInfo.remaining && !quotaInfo.isActual) {
      setErrorMsg(`จำนวนวันลาเกินโควตาคงเหลือ (${quotaInfo.remaining} วัน)`);
      return;
    }
    if (leaveType === 'sick' && daysCount >= 3 && !fileName && !fileData) {
      setErrorMsg('หากลาป่วย3วันขึ้นไปต้องแนบใบรับรองแพทย์');
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
      reason: leaveType === 'vacation' ? '' : reason.trim(),
      substitute: leaveType === 'vacation' ? substitute.trim() : '',
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
    if (!selectedCancelId || !selectedLeave) {
      setCancelErrorMsg('กรุณาเลือกรายการลาที่ต้องการขอยกเลิก');
      return;
    }

    const lastDate = getLastLeaveDateISO(selectedLeave);
    const today = getTodayThaiISO();
    if (lastDate && today > lastDate) {
      setCancelErrorMsg(
        `ไม่สามารถยกเลิกคำขอนี้ได้ เนื่องจากพ้นกำหนดวันลาวันสุดท้าย (${formatThaiDateBE(lastDate)}) แล้ว ระบบอนุญาตให้ยกเลิกได้ถึงวันที่ลาวันสุดท้ายเท่านั้น`
      );
      return;
    }

    if (activeCancelDates.length === 0 || computedCancelDays <= 0) {
      setCancelErrorMsg('กรุณาเลือกอย่างน้อย 1 วันที่ต้องการยกเลิกวันลา');
      return;
    }
    if (!cancelReason.trim()) {
      setCancelErrorMsg('กรุณาระบุเหตุผลการยกเลิกวันลา');
      return;
    }

    setCancelErrorMsg('');
    setIsCancelSubmitting(true);
    try {
      const res = await submitCancelLeaveRequest(selectedCancelId, {
        cancelReason: cancelReason.trim(),
        cancelAttachmentName: cancelFileName,
        cancelAttachmentUrl: cancelFileData,
        cancelStartDate: activeCancelDates[0] || selectedLeave.startDate,
        cancelEndDate: activeCancelDates[activeCancelDates.length - 1] || selectedLeave.endDate,
        cancelDates: activeCancelDates,
        cancelDays: computedCancelDays,
      });
      if (res?.success) {
        const lastReq = {
          ...selectedLeave,
          cancelReason: cancelReason.trim(),
          cancelStartDate: activeCancelDates[0] || selectedLeave.startDate,
          cancelEndDate: activeCancelDates[activeCancelDates.length - 1] || selectedLeave.endDate,
          cancelDates: activeCancelDates,
          cancelDays: computedCancelDays,
          cancelRequestedAt: formatThaiDateBE(new Date()),
          cancelStatus: 'pending',
        };
        setLastCancelledReq(lastReq);
        setIsCancelSuccess(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#2E6F4E] text-white">
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
                ขอลา / ยกเลิกวันลา
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
                  ? 'bg-[#2F855A] text-white shadow-sm'
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
              <span>ยกเลิกวันลา</span>
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
                            const today = getTodayISO();
                            const sickMin = getSickMinDateISO();
                            const minForNew = t.id === 'sick' ? sickMin : today;
                            if (startDate < minForNew) {
                              setStartDate(today);
                              if (endDate < today) setEndDate(today);
                            }
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
                            ? 'bg-[#2F855A] text-white border-[#2F855A]'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Pickers (พ.ศ.) */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ตั้งแต่วันที่ <span className="text-red-500">*</span>
                      </label>
                      <ThaiDatePicker
                        value={startDate}
                        min={leaveType === 'sick' ? getSickMinDateISO() : getTodayISO()}
                        onChange={(val) => {
                          setStartDate(val);
                          if (val > endDate) setEndDate(val);
                          setErrorMsg('');
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ถึงวันที่ <span className="text-red-500">*</span>
                      </label>
                      <ThaiDatePicker
                        value={endDate}
                        disabled={durationMode !== 'full'}
                        onChange={(val) => {
                          setEndDate(val);
                          setErrorMsg('');
                        }}
                        min={startDate || (leaveType === 'sick' ? getSickMinDateISO() : getTodayISO())}
                      />
                    </div>
                  </div>
                  {leaveType === 'sick' && (
                    <div className="text-[11px] px-1">
                      <span className="text-red-500 font-medium">
                        * การลาป่วยสามารถเลือกวันลาย้อนหลังได้ไม่เกิน 7 วัน
                      </span>
                    </div>
                  )}
                </div>

                {/* Calculated duration summary badge */}
                <div className="p-3 bg-emerald-50/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900 border border-emerald-100">
                  <span className="font-medium">สรุปจำนวนวันลาที่ขอ:</span>
                  <span className="font-bold text-sm bg-white px-3 py-1 rounded-full shadow-xs border border-emerald-200 text-emerald-800">
                    {daysCount} วัน
                  </span>
                </div>

                {/* Reason (ไม่แสดงสำหรับลาพักผ่อน) */}
                {leaveType !== 'vacation' && (
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
                      placeholder="ระบุเหตุผลการลา เช่น พบแพทย์, ติดธุระส่วนตัว..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
                    />
                  </div>
                )}

                {/* Colleague handover (เฉพาะลาพักผ่อนเท่านั้น) */}
                {leaveType === 'vacation' && (
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
                )}

                {/* Attachment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      เอกสารแนบ (PDF / รูปภาพ)
                      {leaveType === 'sick' && (
                        <span className="text-red-500 font-normal text-xs ml-1">
                          หากลาป่วย3วันขึ้นไปต้องแนบใบรับรองแพทย์
                        </span>
                      )}
                    </label>
                    <span className="text-[11px] text-slate-400">ขนาดไม่เกิน 3 MB</span>
                  </div>
                  <div className={`relative border-2 border-dashed ${
                    leaveType === 'sick' && daysCount >= 3 && !fileName
                      ? 'border-red-300 bg-red-50/40 hover:border-red-400'
                      : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
                  } rounded-2xl p-3 text-center transition-colors`}>
                    <input
                      type="file"
                      accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-0"
                    />
                    <div className="flex items-center justify-between px-2 text-xs text-slate-500 relative z-10 pointer-events-none">
                      <div className="flex items-center space-x-2 truncate max-w-[85%]">
                        <UploadCloud className={`w-4 h-4 ${
                          leaveType === 'sick' && daysCount >= 3 && !fileName ? 'text-red-500' : 'text-emerald-600'
                        } flex-shrink-0`} />
                        <span className="truncate">
                          {fileName ? (
                            <span className="font-semibold text-emerald-700">{fileName}</span>
                          ) : leaveType === 'sick' && daysCount >= 3 ? (
                            <span className="text-red-500 font-medium">คลิกเพื่อแนบใบรับรองแพทย์ (จำเป็นสำหรับลาป่วย 3 วันขึ้นไป)</span>
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
                    className="px-6 py-2 rounded-full bg-[#2F855A] hover:bg-[#256F4A] text-white font-semibold shadow-sm hover:shadow transition-all"
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
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">ส่งคำขอยกเลิกวันลาเรียบร้อยแล้ว!</h4>
                <p className="text-sm text-slate-500 max-w-sm">
                  คำขอยกเลิกวันลาของคุณถูกส่งไปยังผู้ดูแลระบบเพื่อพิจารณาอนุญาตแล้ว
                </p>
                {lastCancelledReq && (
                  <button
                    type="button"
                    onClick={() => handleDownloadCancelPdf(lastCancelledReq)}
                    disabled={isDownloadingCancelPdf}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isDownloadingCancelPdf ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    <span>ดาวน์โหลดใบขอยกเลิกวันลา (PDF)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelSuccess(false);
                    setCancelReason('');
                    setCancelFileName('');
                    setCancelFileData('');
                    setSelectedCancelId('');
                    setSelectedCancelDates([]);
                    setLastCancelledReq(null);
                    setIsRequestModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold text-slate-700">
                      {selectedLeave && !isSelectingCancelItem
                        ? 'รายการลาที่เลือกยกเลิก'
                        : 'เลือกรายการลาที่ต้องการขอยกเลิก'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    {selectedLeave && !isSelectingCancelItem && cancellableLeaves.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIsSelectingCancelItem(true)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                      >
                        เปลี่ยนรายการ ({cancellableLeaves.length})
                      </button>
                    )}
                  </div>

                  {cancellableLeaves.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600 text-xs sm:text-sm">
                        ยังไม่มีรายการลาที่สามารถขอยกเลิกได้ในขณะนี้
                      </p>
                    </div>
                  ) : selectedLeave && !isSelectingCancelItem ? (
                    /* แสดงเฉพาะรายการที่เลือก ซ่อนรายการอื่นไว้ทั้งหมด */
                    <div className="p-3.5 rounded-2xl border bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/15 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">
                            {selectedLeave.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getMiniStatusBadge(selectedLeave.status)}`}
                          >
                            {selectedLeave.status}
                          </span>
                          {selectedLeave.cancelStatus === 'rejected' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                              เคยไม่อนุญาตยกเลิก
                            </span>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className="text-[11px] text-slate-600 truncate">
                            {selectedLeave.dateRange} ({selectedLeave.days} วัน)
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex-shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            ยกเลิกได้ถึง {formatThaiDateBE(getLastLeaveDateISO(selectedLeave))}
                          </span>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-rose-600 bg-rose-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                    </div>
                  ) : (
                    /* แสดงรายการทั้งหมดให้ผู้ใช้กดเลือก (เมื่อเลือกแล้วจะซ่อนรายการอื่นอัตโนมัติ) */
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {cancellableLeaves.map((req) => {
                        const isSelected = String(selectedCancelId) === String(req.id);
                        return (
                          <button
                            type="button"
                            key={req.id}
                            onClick={() => {
                              setSelectedCancelId(String(req.id));
                              setIsSelectingCancelItem(false);
                              setCancelErrorMsg('');
                            }}
                            className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/15'
                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-rose-300'
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
                              <div className="flex items-center flex-wrap gap-2 mt-1">
                                <span className="text-[11px] text-slate-500 truncate">
                                  {req.dateRange} ({req.days} วัน)
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex-shrink-0">
                                  <Clock className="w-2.5 h-2.5" />
                                  ยกเลิกได้ถึง {formatThaiDateBE(getLastLeaveDateISO(req))}
                                </span>
                              </div>
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

                {/* เลือกวันที่เฉพาะที่ต้องการยกเลิกวันลา (เช่น ลา 18-21 เลือกยกเลิกเฉพาะวันที่ 21) */}
                {selectedLeave && selectedLeaveAllDates.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="font-semibold text-slate-800 text-xs">
                        เลือกวันที่ต้องการยกเลิกวันลา <span className="text-red-500">*</span>
                      </label>
                      {!useRangePickerForCancel && selectedLeaveAllDates.length > 1 && (
                        <div className="flex items-center space-x-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCancelDates(selectedLeaveAllDates);
                              setCancelErrorMsg('');
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                          >
                            เลือกทั้งหมด
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedCancelDates([])}
                            className="text-rose-600 hover:text-rose-800 font-semibold hover:underline"
                          >
                            ล้างที่เลือก
                          </button>
                        </div>
                      )}
                    </div>

                    {useRangePickerForCancel ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <span className="block text-[11px] font-medium text-slate-600 mb-1">
                            ยกเลิกตั้งแต่วันที่
                          </span>
                          <ThaiDatePicker
                            value={cancelRangeStart}
                            min={selectedLeave.startDate}
                            max={selectedLeave.endDate}
                            onChange={(val) => {
                              setCancelRangeStart(val);
                              if (val > cancelRangeEnd) setCancelRangeEnd(val);
                              setCancelErrorMsg('');
                            }}
                          />
                        </div>
                        <div>
                          <span className="block text-[11px] font-medium text-slate-600 mb-1">
                            ถึงวันที่
                          </span>
                          <ThaiDatePicker
                            value={cancelRangeEnd}
                            min={cancelRangeStart || selectedLeave.startDate}
                            max={selectedLeave.endDate}
                            onChange={(val) => {
                              setCancelRangeEnd(val);
                              setCancelErrorMsg('');
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedLeaveAllDates.map((iso) => {
                          const isChecked = selectedCancelDates.includes(iso);
                          return (
                            <button
                              type="button"
                              key={iso}
                              onClick={() => toggleCancelDate(iso)}
                              className={`px-2.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                                isChecked
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/40'
                              }`}
                            >
                              <span className="truncate">{formatThaiDateBE(iso)}</span>
                              <span
                                className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ml-1 ${
                                  isChecked
                                    ? 'bg-white/25 text-white'
                                    : 'border border-slate-300 bg-slate-50'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Summary of selected cancellation dates */}
                    <div className="pt-2 border-t border-rose-200/70 flex items-center justify-between flex-wrap gap-1.5 text-[11px]">
                      {computedCancelDays > 0 ? (
                        <>
                          <span className="text-rose-800 font-semibold">
                            {remainingAfterCancel > 0
                              ? `ยกเลิกบางส่วน: ${formatCancelDatesBE(activeCancelDates, activeCancelDates[0], activeCancelDates[activeCancelDates.length - 1], computedCancelDays)} (${computedCancelDays} วัน)`
                              : `ยกเลิกทั้งหมด ${computedCancelDays} วัน`}
                          </span>
                          {remainingAfterCancel > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-white border border-rose-200 text-slate-600 font-medium">
                              คงเหลือวันลาเดิม {remainingAfterCancel} วัน
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-rose-600 font-medium">
                          กรุณาคลิกเลือกวันที่ต้องการยกเลิกอย่างน้อย 1 วัน
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancel Reason */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เหตุผลการยกเลิกวันลา <span className="text-red-500">*</span>
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
                      แนบเอกสารการยกเลิกวันลา (PDF / รูปภาพ)
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
                            'คลิกเพื่อแนบแบบฟอร์ม/เอกสารยกเลิกวันลา (PDF หรือรูปภาพ)'
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
                <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100">
                  {selectedLeave ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadCancelPdf()}
                      disabled={isDownloadingCancelPdf}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-all shadow-2xs hover:shadow-xs disabled:opacity-60"
                      title="ดาวน์โหลดแบบฟอร์มใบขอยกเลิกวันลา (PDF) ฉบับทางการ"
                    >
                      {isDownloadingCancelPdf ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>ดาวน์โหลดใบยกเลิก (PDF)</span>
                    </button>
                  ) : <div />}
                  <div className="flex items-center space-x-2">
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
                      {isCancelSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันการยกเลิกวันลา'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
