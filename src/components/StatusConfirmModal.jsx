import React, { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

export default function StatusConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  req,
  targetStatus,
  defaultRemark = '',
}) {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRemark(defaultRemark || '');
      setError('');
    }
  }, [isOpen, defaultRemark]);

  if (!isOpen || !req) return null;

  const isApprove = targetStatus === 'อนุมัติ';
  const isReject = targetStatus === 'ไม่อนุมัติ';
  const isChecking = targetStatus === 'อยู่ระหว่างตรวจสอบ';

  const headerBg = isApprove
    ? 'bg-[#2F855A]'
    : isReject
    ? 'bg-red-600'
    : isChecking
    ? 'bg-sky-600'
    : 'bg-orange-600';

  const confirmBtnBg = isApprove
    ? 'bg-[#2F855A] hover:bg-[#256F4A]'
    : isReject
    ? 'bg-red-600 hover:bg-red-700'
    : isChecking
    ? 'bg-sky-600 hover:bg-sky-700'
    : 'bg-orange-600 hover:bg-orange-700';

  const statusBadgeClass = isApprove
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : isReject
    ? 'bg-red-100 text-red-800 border-red-200'
    : isChecking
    ? 'bg-sky-100 text-sky-800 border-sky-300'
    : 'bg-orange-100 text-orange-800 border-orange-200';

  const titleText = isApprove
    ? 'ยืนยันการอนุมัติคำขอลา'
    : isReject
    ? 'ยืนยันการไม่อนุมัติคำขอลา'
    : isChecking
    ? 'ยืนยันเปลี่ยนสถานะเป็น "อยู่ระหว่างตรวจสอบ"'
    : 'ยืนยันเปลี่ยนสถานะเป็น "ยังไม่ยื่นเอกสาร"';

  const confirmBtnText = isApprove
    ? 'ยืนยันอนุมัติ'
    : isReject
    ? 'ยืนยันไม่อนุมัติ'
    : `ยืนยัน${targetStatus}`;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isReject && !remark.trim()) {
      setError('กรุณาระบุเหตุผลการไม่อนุมัติคำขอลา (จำเป็นต้องระบุ)');
      return;
    }
    onConfirm(remark.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className={`px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between text-white ${headerBg}`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              {isApprove && <Check className="w-4 h-4 text-white" />}
              {isReject && <X className="w-4 h-4 text-white" />}
              {isChecking && <Clock className="w-4 h-4 text-white" />}
              {!isApprove && !isReject && !isChecking && <AlertCircle className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h3 className="font-bold text-base font-prompt">{titleText}</h3>
              <p className="text-[11px] opacity-80">รหัสคำขอ: {req.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">ผู้ยื่นคำขอ:</span>
              <span className="font-bold text-slate-800">
                {req.employeeName} {req.department ? `(${req.department})` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">ประเภทการลา:</span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 text-xs">
                {req.type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">ช่วงเวลา:</span>
              <span className="font-medium text-slate-700">
                {req.dateRange} ({req.days} วัน)
              </span>
            </div>
            {req.substitute && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">ผู้ปฏิบัติงานแทน:</span>
                <span className="text-slate-700 font-medium">{req.substitute}</span>
              </div>
            )}
            {req.reason && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 text-xs block mb-0.5">เหตุผลการลา:</span>
                <p className="text-slate-700 italic text-xs bg-white p-2 rounded-xl border border-slate-100">
                  "{req.reason}"
                </p>
              </div>
            )}
          </div>

          {/* Status Change Indicator */}
          <div className="flex items-center justify-center space-x-2 text-xs py-1">
            <span className="text-slate-400">สถานะเดิม:</span>
            <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {req.status}
            </span>
            <span className="text-slate-400">➔</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-md border ${statusBadgeClass}`}>
              {targetStatus}
            </span>
          </div>

          {/* Remark Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700 text-xs">
                {isReject ? (
                  <span>
                    เหตุผลการไม่อนุมัติ <span className="text-rose-500 font-bold">* (จำเป็นต้องระบุ)</span>
                  </span>
                ) : (
                  <span>
                    ข้อคิดเห็น / หมายเหตุจากผู้อนุมัติ <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
                  </span>
                )}
              </label>
              {isReject && (
                <span className="text-[10px] text-rose-500 font-medium">บังคับระบุ</span>
              )}
            </div>

            <textarea
              rows={isReject ? 3 : 2}
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                isReject
                  ? 'กรุณาระบุเหตุผลการไม่อนุมัติคำขอลา (จำเป็น เช่น ติดภารกิจเร่งด่วน, เอกสารไม่ครบถ้วน)...'
                  : 'ระบุข้อความถึงผู้ขอลา (ถ้ามี หรือสามารถเว้นว่างได้)...'
              }
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:ring-2 transition-all ${
                error
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20 text-slate-800'
                  : isReject
                  ? 'border-slate-300 focus:ring-red-500/20 focus:border-red-600 text-slate-800'
                  : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800'
              }`}
            />

            {error && (
              <p className="text-xs text-rose-600 font-medium flex items-center space-x-1 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            กรุณากดยืนยันอีกรอบเพื่อบันทึกสถานะลงระบบและแจ้งเตือนผู้ใช้งาน
          </p>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-white font-semibold text-xs transition-all shadow-sm ${confirmBtnBg}`}
            >
              {isApprove && <Check className="w-3.5 h-3.5" />}
              {isReject && <X className="w-3.5 h-3.5" />}
              {isChecking && <Clock className="w-3.5 h-3.5" />}
              {!isApprove && !isReject && !isChecking && <AlertCircle className="w-3.5 h-3.5" />}
              <span>{confirmBtnText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

