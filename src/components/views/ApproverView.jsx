import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Check,
  X,
  AlertCircle,
  UserCheck,
  FileDown,
  Printer,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { downloadLeaveSlipPdf, downloadLeaveSummaryPdf } from '../../utils/exportPdf';
import StatusConfirmModal from '../StatusConfirmModal';

export default function ApproverView() {
  const {
    currentUser,
    switchRole,
    leaveRequests,
    updateLeaveStatus,
    approveLeaveRequest,
    rejectLeaveRequest,
    setSelectedLeaveDetail,
    setActiveTab: setMainActiveTab,
    showToast,
  } = useLeave();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [remarks, setRemarks] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [isExportingAllPdf, setIsExportingAllPdf] = useState(false);

  // State สำหรับ Modal กดยืนยันการเปลี่ยนสถานะอีกรอบ (อนุมัติ, ไม่อนุมัติ, อยู่ระหว่างตรวจสอบ, ยังไม่ยื่นเอกสาร)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    req: null,
    targetStatus: '',
    defaultRemark: '',
  });

  const pendingRequests = leaveRequests.filter(
    (r) => r.status === 'ยังไม่ยื่นเอกสาร' || r.status === 'อยู่ระหว่างตรวจสอบ'
  );
  const historyRequests = leaveRequests.filter(
    (r) => r.status === 'อนุมัติ' || r.status === 'ไม่อนุมัติ' || r.status === 'ยกเลิกวันลา' || r.status === 'ยกเลิกการลา'
  );
  const pendingCancellationsCount = leaveRequests.filter(
    (r) => r.cancelStatus === 'pending'
  ).length;

  const handleOpenConfirm = (req, targetStatus) => {
    let defaultRemark = remarks[req.id] || '';
    if (!defaultRemark) {
      if (targetStatus === 'อนุมัติ') defaultRemark = 'อนุมัติเรียบร้อย';
      else if (targetStatus === 'ไม่อนุมัติ') defaultRemark = 'ไม่อนุมัติเนื่องจากมีภารกิจงานเร่งด่วน';
      else if (targetStatus === 'อยู่ระหว่างตรวจสอบ') defaultRemark = 'อยู่ระหว่างตรวจสอบเอกสาร';
    }
    setConfirmModal({
      isOpen: true,
      req,
      targetStatus,
      defaultRemark,
    });
  };

  const handleCloseConfirm = () => {
    setConfirmModal({
      isOpen: false,
      req: null,
      targetStatus: '',
      defaultRemark: '',
    });
  };

  const handleConfirmAction = async (finalRemark) => {
    if (!confirmModal.req) return;
    const { req, targetStatus } = confirmModal;
    const remark = finalRemark !== undefined ? finalRemark : confirmModal.defaultRemark;

    if (targetStatus === 'อนุมัติ') {
      await approveLeaveRequest(req.id, remark || 'อนุมัติเรียบร้อย');
    } else if (targetStatus === 'ไม่อนุมัติ') {
      await rejectLeaveRequest(req.id, remark || 'ไม่อนุมัติเนื่องจากมีภารกิจงานเร่งด่วน');
    } else {
      await updateLeaveStatus(req.id, targetStatus, remark || '');
    }

    handleCloseConfirm();
  };

  const handleDownloadSlip = async (req, e) => {
    if (e) e.stopPropagation();
    setDownloadingId(req.id);
    try {
      await downloadLeaveSlipPdf(req);
      if (showToast) showToast(`ส่งออกใบลา ${req.id} เป็น PDF สำเร็จ`, 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('เกิดข้อผิดพลาดในการดาวน์โหลด PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportSummaryPdf = async () => {
    setIsExportingAllPdf(true);
    try {
      const listToExport = activeTab === 'pending' ? pendingRequests : leaveRequests;
      const title = activeTab === 'pending' ? 'รายงานคำขอรอพิจารณาอนุมัติ' : 'รายงานตรวจสอบสถานะการลาทั้งหมดในองค์กร';
      await downloadLeaveSummaryPdf(listToExport, title);
      if (showToast) showToast('ส่งออกรายงานสรุป PDF สำเร็จ', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('เกิดข้อผิดพลาดในการสร้าง PDF', 'error');
    } finally {
      setIsExportingAllPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-prompt">
            ระบบพิจารณาอนุมัติคำขอลา (Approver Portal)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจสอบ อนุมัติ ปฏิเสธคำขอ และส่งออกใบลาอิเล็กทรอนิกส์เป็น PDF สำหรับผู้บริหาร
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export PDF Button */}
          <button
            onClick={handleExportSummaryPdf}
            disabled={isExportingAllPdf}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#2F855A] text-xs sm:text-sm font-semibold transition-colors shadow-xs disabled:opacity-60"
            title="ส่งออกรายงานคำขอเป็นไฟล์ PDF"
          >
            {isExportingAllPdf ? (
              <div className="w-4 h-4 border-2 border-emerald-700/30 border-t-emerald-700 rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-emerald-700" />
            )}
            <span>{isExportingAllPdf ? 'กำลังสร้าง PDF...' : 'ส่งออกรายงาน PDF'}</span>
          </button>

          {pendingCancellationsCount > 0 && (
            <button
              type="button"
              onClick={() => setMainActiveTab('cancel-approvals')}
              className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center space-x-1.5 border border-rose-200 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>มีคำขอยกเลิกวันลา {pendingCancellationsCount} รายการ ➔</span>
            </button>
          )}
          <div className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-800 font-bold text-xs flex items-center space-x-1.5 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>รอพิจารณา {pendingRequests.length} รายการ</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${activeTab === 'pending'
                ? 'bg-[#2F855A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>รายการรอพิจารณา ({pendingRequests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${activeTab === 'history'
                ? 'bg-[#2F855A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
                }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>รายการที่พิจารณาแล้ว ({historyRequests.length})</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* TAB 1: PENDING REQUESTS */}
          {activeTab === 'pending' && (
            <>
              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-medium text-slate-600">ไม่มีคำขอที่รอการพิจารณาในขณะนี้</p>
                  <p className="text-xs">ทุกคำขอได้รับการตรวจสอบเรียบร้อยแล้ว</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {req.employeeName}
                          </span>
                          <span className="text-xs text-slate-400">({req.department})</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {req.type}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${req.status === 'อยู่ระหว่างตรวจสอบ'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-orange-100 text-orange-700 border-orange-200'
                              }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <strong className="text-slate-700">ช่วงเวลา:</strong> {req.dateRange} ({req.days} วัน)
                          </span>
                          {(req.typeKey === 'vacation' || req.substitute) && (
                            <span>
                              <strong className="text-slate-700">ผู้ปฏิบัติงานแทน:</strong> {req.substitute || 'ไม่มี'}
                            </span>
                          )}
                          <span>
                            <strong className="text-slate-700">วันที่ยื่น:</strong> {req.appliedDate || '-'}
                          </span>
                        </div>

                        {req.reason && (
                          <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            "{req.reason}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0 flex-shrink-0">
                        {/* Download PDF button */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadSlip(req, e)}
                          disabled={downloadingId === req.id}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                          title="ส่งออกใบลาเป็น PDF"
                        >
                          {downloadingId === req.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>ส่งออก PDF</span>
                        </button>

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedLeaveDetail(req)}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ดูรายละเอียด</span>
                        </button>

                        {/* Toggle Status: ยังไม่ยื่นเอกสาร <-> อยู่ระหว่างตรวจสอบ */}
                        {req.status === 'ยังไม่ยื่นเอกสาร' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenConfirm(req, 'อยู่ระหว่างตรวจสอบ')}
                            className="px-3.5 py-2 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>อยู่ระหว่างตรวจสอบ</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenConfirm(req, 'ยังไม่ยื่นเอกสาร')}
                            className="px-3.5 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>ยังไม่ยื่นเอกสาร</span>
                          </button>
                        )}

                        {/* Reject */}
                        <button
                          type="button"
                          onClick={() => handleOpenConfirm(req, 'ไม่อนุมัติ')}
                          className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>ไม่อนุมัติ</span>
                        </button>

                        {/* Approve */}
                        <button
                          type="button"
                          onClick={() => handleOpenConfirm(req, 'อนุมัติ')}
                          className="col-span-2 sm:col-span-1 px-4 py-2 rounded-xl bg-[#2F855A] hover:bg-[#256F4A] text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>อนุมัติ</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PROCESSED HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {historyRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm">ยังไม่มีรายการที่ได้รับการพิจารณา</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {historyRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedLeaveDetail(req)}
                      className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm">
                            {req.employeeName}
                          </span>
                          <span className="text-xs text-slate-400">({req.department})</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${req.status === 'อนุมัติ'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : req.status === 'ไม่อนุมัติ'
                                ? 'bg-[#FEE2E2] text-[#DC2626]'
                                : req.status === 'อยู่ระหว่างตรวจสอบ'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.type} • {req.dateRange} ({req.days} วัน) • วันที่พิจารณา: {req.approvedDate || req.appliedDate}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Direct PDF export button */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadSlip(req, e)}
                          disabled={downloadingId === req.id}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors shadow-2xs"
                          title="ดาวน์โหลดใบลาเป็น PDF"
                        >
                          {downloadingId === req.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>ส่งออก PDF</span>
                        </button>

                        <div className="text-emerald-700 font-semibold text-xs flex items-center space-x-0.5 pl-2">
                          <span>รายละเอียด</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal before status changes */}
      <StatusConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        req={confirmModal.req}
        targetStatus={confirmModal.targetStatus}
        defaultRemark={confirmModal.defaultRemark}
      />
    </div>
  );
}
