import React, { useState } from 'react';
import {
  CalendarX2,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  FileText,
  Paperclip,
  Eye,
  Download,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';

export default function AdminCancelApprovalsView() {
  const {
    leaveRequests,
    approveCancelLeaveRequest,
    rejectCancelLeaveRequest,
    setSelectedLeaveDetail,
  } = useLeave();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    req: null,
    action: '', // 'approve' | 'reject'
    remark: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null); // { name, url }

  const pendingCancellations = (leaveRequests || []).filter(
    (r) => r.cancelStatus === 'pending'
  );
  const processedCancellations = (leaveRequests || []).filter(
    (r) => r.cancelStatus === 'approved' || r.cancelStatus === 'rejected' || (r.status === 'ยกเลิกวันลา' || r.status === 'ยกเลิกวันลา')
  );

  const openConfirm = (req, action) => {
    setConfirmModal({
      isOpen: true,
      req,
      action,
      remark:
        action === 'approve'
          ? 'อนุญาตให้ยกเลิกวันลาเรียบร้อย'
          : 'ไม่อนุญาตให้ยกเลิกวันลา',
    });
  };

  const closeConfirm = () => {
    setConfirmModal({
      isOpen: false,
      req: null,
      action: '',
      remark: '',
    });
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!confirmModal.req) return;
    setIsSubmitting(true);
    try {
      if (confirmModal.action === 'approve') {
        await approveCancelLeaveRequest(
          confirmModal.req.id,
          confirmModal.remark.trim() || 'อนุญาตให้ยกเลิกวันลาเรียบร้อย'
        );
      } else {
        await rejectCancelLeaveRequest(
          confirmModal.req.id,
          confirmModal.remark.trim() || 'ไม่อนุญาตให้ยกเลิกวันลา'
        );
      }
      closeConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAttachment = (url, name) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'cancel-leave-document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImageUrl = (url = '', name = '') => {
    return url.startsWith('data:image/') || /\.(png|jpe?g|gif|webp)$/i.test(name);
  };

  return (
    <div className="space-y-6 font-prompt">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              ผู้ดูแลระบบ • คำยกเลิกวันลา
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">
            พิจารณาคำยกเลิกวันลา
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจสอบเอกสารประกอบและพิจารณาอนุญาตหรือไม่อนุญาตคำยกเลิกวันลาของเจ้าหน้าที่
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs flex items-center space-x-1.5 border border-rose-200">
            <CalendarX2 className="w-4 h-4" />
            <span>รอพิจารณา {pendingCancellations.length} รายการ</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'pending'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>รอพิจารณาขอยกเลิก ({pendingCancellations.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#155A32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>ประวัติการพิจารณา ({processedCancellations.length})</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* TAB 1: PENDING CANCELLATIONS */}
          {activeTab === 'pending' && (
            <>
              {pendingCancellations.length === 0 ? (
                <div className="py-14 text-center text-slate-400 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">
                    ไม่มีคำยกเลิกวันลาที่รอการพิจารณาในขณะนี้
                  </p>
                  <p className="text-xs">
                    เมื่อเจ้าหน้าที่ยื่นคำยกเลิกวันลา รายการและเอกสารแนบจะแสดงที่นี่
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCancellations.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl border border-rose-200/80 bg-white hover:border-rose-300 transition-all shadow-xs space-y-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                              {req.employeeName}
                            </span>
                            <span className="text-xs text-slate-400">({req.department})</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {req.type}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                              ยกเลิกวันลา
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              สถานะลาเดิม: {req.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                            <span>
                              <strong className="text-slate-700">ช่วงวันที่ลาเดิม:</strong> {req.dateRange} ({req.days} วัน)
                            </span>
                            {(req.cancelDateRange || req.cancelDays > 0) && (
                              <span className="text-rose-700 font-semibold">
                                <strong>วันที่ขอยกเลิก:</strong> {req.cancelDateRange || req.dateRange} ({req.cancelDays || req.days} วัน)
                              </span>
                            )}
                            {req.cancelRequestedAt && (
                              <span>
                                <strong className="text-slate-700">วันที่ยื่นขอยกเลิก:</strong> {req.cancelRequestedAt}
                              </span>
                            )}
                          </div>

                          {/* Reason Box */}
                          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-slate-700 space-y-1">
                            <span className="font-bold text-rose-800 block">เหตุผลการยกเลิกวันลา:</span>
                            <p className="italic">"{req.cancelReason || '-'}"</p>
                          </div>

                          {/* Attachment Box */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {req.cancelAttachmentUrl || req.cancelAttachmentName ? (
                              <div className="inline-flex items-center flex-wrap gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                <Paperclip className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                <span className="font-semibold text-slate-700 max-w-[220px] truncate">
                                  {req.cancelAttachmentName || 'เอกสารการยกเลิกวันลา'}
                                </span>
                                {req.cancelAttachmentUrl && (
                                  <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewDoc({
                                          name: req.cancelAttachmentName || 'เอกสารการยกเลิกวันลา',
                                          url: req.cancelAttachmentUrl,
                                        })
                                      }
                                      className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center space-x-1 transition-colors"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>ดูเอกสาร</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDownloadAttachment(
                                          req.cancelAttachmentUrl,
                                          req.cancelAttachmentName
                                        )
                                      }
                                      className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center space-x-1 transition-colors"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>ดาวน์โหลด</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 flex items-center space-x-1">
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>ไม่ได้แนบเอกสารการยกเลิกวันลา</span>
                              </span>
                            )}
                          </div>

                          {/* Quota Refund Info if original leave was approved */}
                          {req.status === 'อนุมัติ' && (() => {
                            const cancelDays = Number(req.cancelDays || 0) > 0 ? Math.min(Number(req.days || 0), Number(req.cancelDays)) : Number(req.days || 0);
                            const remDays = Math.max(0, Number((Number(req.days || 0) - cancelDays).toFixed(2)));
                            const isPartial = remDays > 0 && cancelDays > 0 && cancelDays < Number(req.days || 0);
                            return (
                              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                                <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>
                                  {isPartial ? (
                                    <>
                                      คำขอลานี้เคยได้รับอนุมัติแล้ว — หากอนุญาตให้ยกเลิกเฉพาะวันที่ <strong>{req.cancelDateRange}</strong> ระบบจะคืนสิทธิ์วันลา <strong>{cancelDays} วัน</strong> (คงเหลือวันลาเดิม {remDays} วัน) ให้อัตโนมัติ
                                    </>
                                  ) : (
                                    <>
                                      คำขอลานี้เคยได้รับอนุมัติแล้ว — หากอนุญาตให้ยกเลิก ระบบจะคืนสิทธิ์วันลา <strong>{cancelDays} วัน</strong> ให้อัตโนมัติ
                                    </>
                                  )}
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedLeaveDetail(req)}
                            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>ดูรายละเอียด</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openConfirm(req, 'reject')}
                            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs transition-colors flex items-center space-x-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>ไม่อนุญาต</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openConfirm(req, 'approve')}
                            className="px-4 py-2 rounded-xl bg-[#155A32] hover:bg-[#114929] text-white font-semibold text-xs transition-colors shadow-sm flex items-center space-x-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>อนุญาต</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PROCESSED CANCELLATIONS HISTORY */}
          {activeTab === 'history' && (
            <>
              {processedCancellations.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm">ยังไม่มีประวัติการพิจารณาคำยกเลิกวันลา</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {processedCancellations.map((req) => {
                    const isCancelApproved = req.cancelStatus === 'approved' || (req.status === 'ยกเลิกวันลา' || req.status === 'ยกเลิกวันลา');
                    return (
                      <div
                        key={req.id}
                        className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">
                              {req.employeeName}
                            </span>
                            <span className="text-xs text-slate-400">({req.department})</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isCancelApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {isCancelApproved ? 'อนุญาตยกเลิกวันลาแล้ว' : 'ไม่อนุญาตยกเลิกวันลา'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {req.type} • ช่วงลา: {req.dateRange} ({req.days} วัน)
                            {req.cancelDateRange ? ` • วันที่ยกเลิก: ${req.cancelDateRange} (${req.cancelDays || req.days} วัน)` : ''}
                            {req.cancelDecidedAt ? ` • พิจารณาเมื่อ: ${req.cancelDecidedAt}` : ''}
                          </div>
                          {req.cancelReason && (
                            <div className="text-xs text-slate-500">
                              <strong className="text-slate-600">เหตุผลขอยกเลิก:</strong> {req.cancelReason}
                            </div>
                          )}
                          {req.cancelRemark && (
                            <div className="text-xs text-slate-600">
                              <strong className="text-slate-700">หมายเหตุผู้ดูแล:</strong> {req.cancelRemark}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {req.cancelAttachmentUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  name: req.cancelAttachmentName || 'เอกสารการยกเลิกวันลา',
                                  url: req.cancelAttachmentUrl,
                                })
                              }
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ดูเอกสารแนบ</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedLeaveDetail(req)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            รายละเอียด
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm Approve / Reject Cancellation Modal */}
      {confirmModal.isOpen && confirmModal.req && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div
              className={`px-6 py-4 flex items-center justify-between text-white ${
                confirmModal.action === 'approve' ? 'bg-[#155A32]' : 'bg-red-600'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  {confirmModal.action === 'approve' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
                <h3 className="font-bold text-base">
                  {confirmModal.action === 'approve'
                    ? 'ยืนยันอนุญาตการยกเลิกวันลา'
                    : 'ยืนยันไม่อนุญาตการยกเลิกวันลา'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeConfirm}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">ผู้ยื่นคำขอ:</span>
                  <span className="font-bold text-slate-800">{confirmModal.req.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ประเภทการลา:</span>
                  <span className="font-semibold text-emerald-800">{confirmModal.req.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ช่วงวันที่ลาเดิม:</span>
                  <span className="font-medium text-slate-700">
                    {confirmModal.req.dateRange} ({confirmModal.req.days} วัน)
                  </span>
                </div>
                {(confirmModal.req.cancelDateRange || confirmModal.req.cancelDays > 0) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">วันที่ขอยกเลิก:</span>
                    <span className="font-bold text-rose-700">
                      {confirmModal.req.cancelDateRange || confirmModal.req.dateRange} ({confirmModal.req.cancelDays || confirmModal.req.days} วัน)
                    </span>
                  </div>
                )}
                {confirmModal.req.cancelReason && (
                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500 block mb-0.5">เหตุผลขอยกเลิก:</span>
                    <p className="italic text-slate-700">"{confirmModal.req.cancelReason}"</p>
                  </div>
                )}
              </div>

              {confirmModal.action === 'approve' && confirmModal.req.status === 'อนุมัติ' && (() => {
                const origD = Number(confirmModal.req.days || 0);
                const cDays = Number(confirmModal.req.cancelDays || 0) > 0 ? Math.min(origD, Number(confirmModal.req.cancelDays)) : origD;
                const remD = Math.max(0, Number((origD - cDays).toFixed(2)));
                const isPartial = remD > 0 && cDays > 0 && cDays < origD;
                return (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      {isPartial ? (
                        <>
                          เมื่อยืนยัน ระบบจะยกเลิกเฉพาะวันที่ <strong>{confirmModal.req.cancelDateRange}</strong> (คงเหลือวันลาเดิม {remD} วัน) และคืนสิทธิ์วันลาจำนวน{' '}
                          <strong>{cDays} วัน</strong> กลับไปยังโควตาของพนักงานอัตโนมัติ
                        </>
                      ) : (
                        <>
                          เมื่อยืนยัน ระบบจะเปลี่ยนสถานะเป็น <strong>"ยกเลิกวันลา"</strong> และคืนสิทธิ์วันลาจำนวน{' '}
                          <strong>{cDays} วัน</strong> กลับไปยังโควตาของพนักงานอัตโนมัติ
                        </>
                      )}
                    </span>
                  </div>
                );
              })()}

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  หมายเหตุจากผู้ดูแลระบบ
                </label>
                <input
                  type="text"
                  value={confirmModal.remark}
                  onChange={(e) =>
                    setConfirmModal((prev) => ({ ...prev, remark: e.target.value }))
                  }
                  placeholder="ระบุหมายเหตุ (ถ้ามี)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeConfirm}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-xl text-white font-semibold shadow-sm transition-colors disabled:opacity-60 ${
                    confirmModal.action === 'approve'
                      ? 'bg-[#155A32] hover:bg-[#114929]'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting
                    ? 'กำลังบันทึก...'
                    : confirmModal.action === 'approve'
                      ? 'ยืนยันอนุญาต'
                      : 'ยืนยันไม่อนุญาต'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#123E24] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <Paperclip className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <h4 className="font-bold text-sm sm:text-base truncate">{previewDoc.name}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDownloadAttachment(previewDoc.url, previewDoc.name)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-full hover:bg-white/15 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[400px]">
              {isImageUrl(previewDoc.url, previewDoc.name) ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-w-full max-h-[72vh] rounded-xl shadow-md object-contain"
                />
              ) : (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[72vh] rounded-xl border border-slate-200 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
