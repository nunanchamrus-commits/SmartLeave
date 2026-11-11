import React, { useState } from 'react';
import { X, Calendar, User, FileText, CheckCircle, Clock, XCircle, AlertTriangle, Check, Ban, FileDown } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';
import { downloadLeaveSlipPdf } from '../utils/exportPdf';

export default function LeaveDetailModal() {
  const {
    selectedLeaveDetail,
    setSelectedLeaveDetail,
    currentUser,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest,
    showToast,
  } = useLeave();

  const [approverRemark, setApproverRemark] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!selectedLeaveDetail) return null;

  const req = selectedLeaveDetail;
  const isPending = req.status === 'รออนุมัติ';
  const isApprover = currentUser.role === 'approver' || currentUser.role === 'admin';

  const handleApprove = () => {
    approveLeaveRequest(req.id, approverRemark || 'อนุมัติเรียบร้อย');
    setSelectedLeaveDetail(null);
  };

  const handleReject = () => {
    rejectLeaveRequest(req.id, approverRemark || 'ไม่อนุมัติเนื่องจากมีภารกิจจำเป็น');
    setSelectedLeaveDetail(null);
  };

  const handleCancel = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอนี้?')) {
      cancelLeaveRequest(req.id);
      setSelectedLeaveDetail(null);
    }
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadLeaveSlipPdf(req);
      if (showToast) showToast('ดาวน์โหลดใบลาเป็น PDF เรียบร้อยแล้ว', 'success');
    } catch (e) {
      console.error(e);
      if (showToast) showToast('เกิดข้อผิดพลาดในการดาวน์โหลด PDF', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#123E24] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base font-prompt">รายละเอียดคำขอลา</h3>
              <p className="text-[11px] text-emerald-200/80">รหัสคำขอ: {req.id}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedLeaveDetail(null)}
            className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Top Status & Type Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">ประเภทการลา</span>
              <h4 className="text-base font-bold text-slate-800">{req.type}</h4>
            </div>
            <div>
              {req.status === 'อนุมัติ' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>อนุมัติแล้ว</span>
                </span>
              )}
              {req.status === 'รออนุมัติ' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>รอการอนุมัติ</span>
                </span>
              )}
              {req.status === 'ไม่อนุมัติ' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626]">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>ไม่อนุมัติ</span>
                </span>
              )}
              {req.status === 'ยกเลิก' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                  <Ban className="w-3.5 h-3.5" />
                  <span>ยกเลิกแล้ว</span>
                </span>
              )}
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block">ผู้ยื่นคำขอ</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{req.employeeName}</span>
              <span className="text-[11px] text-slate-500">{req.department}</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block">จำนวนวันลา</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{req.days} วัน</span>
              <span className="text-[11px] text-slate-500">{req.dateRange}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block mb-1">เหตุผลการลา</span>
            <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed">
              {req.reason || 'ไม่ได้ระบุเหตุผล'}
            </p>
          </div>

          {/* Substitute Colleague & Approver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block">ผู้ปฏิบัติงานแทน</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {req.substitute || 'ไม่มี'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block">ผู้อนุมัติ</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {req.approver || 'นายสมชาย มั่นคง'}
              </span>
            </div>
          </div>

          {/* Attachment */}
          {req.attachment && (
            <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{req.attachment}</span>
              </div>
              <span className="text-emerald-700 font-medium cursor-pointer hover:underline">
                ดาวน์โหลด
              </span>
            </div>
          )}

          {/* Approver Note */}
          {req.note && (
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900">
              <span className="font-semibold block">ความเห็นจากผู้อนุมัติ:</span>
              <p className="mt-0.5">{req.note}</p>
            </div>
          )}

          {/* If Approver Mode & Pending -> Show Action Input & Buttons */}
          {isApprover && isPending && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block font-semibold text-slate-700 text-xs">
                ข้อคิดเห็น / หมายเหตุจากผู้อนุมัติ
              </label>
              <input
                type="text"
                value={approverRemark}
                onChange={(e) => setApproverRemark(e.target.value)}
                placeholder="ระบุข้อความถึงผู้ขอลา..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={handleReject}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>ไม่อนุมัติ</span>
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-[#155A32] text-white hover:bg-[#124A29] font-semibold text-xs transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>อนุมัติคำขอ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#155A32] hover:bg-[#114929] text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-60"
              title="ดาวน์โหลดไฟล์ PDF ใบลาเข้าสู่เครื่อง"
            >
              {isExportingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5 text-lime-300" />
              )}
              <span>{isExportingPdf ? 'กำลังประมวลผล PDF...' : 'ส่งออกเป็น PDF'}</span>
            </button>

            {!isApprover && isPending && (
              <button
                onClick={handleCancel}
                className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline px-2 py-1"
              >
                ยกเลิกคำขอนี้
              </button>
            )}
          </div>
          <button
            onClick={() => setSelectedLeaveDetail(null)}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

