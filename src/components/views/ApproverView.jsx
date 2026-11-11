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

export default function ApproverView() {
  const {
    currentUser,
    switchRole,
    leaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    setSelectedLeaveDetail,
    showToast,
  } = useLeave();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [remarks, setRemarks] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [isExportingAllPdf, setIsExportingAllPdf] = useState(false);

  const pendingRequests = leaveRequests.filter((r) => r.status === 'รออนุมัติ');
  const historyRequests = leaveRequests.filter((r) => r.status !== 'รออนุมัติ');

  const handleApprove = (id) => {
    const remark = remarks[id] || 'อนุมัติเรียบร้อย';
    approveLeaveRequest(id, remark);
    if (showToast) showToast('อนุมัติคำขอลาเรียบร้อยแล้ว', 'success');
  };

  const handleReject = (id) => {
    const remark = remarks[id] || 'ไม่อนุมัติเนื่องจากมีภารกิจงานเร่งด่วน';
    rejectLeaveRequest(id, remark);
    if (showToast) showToast('ปฏิเสธคำขอลาเรียบร้อยแล้ว', 'info');
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
      const title = activeTab === 'pending' ? 'รายงานคำขอรอพิจารณาอนุมัติ' : 'รายงานประวัติคำขอลาทั้งหมดในองค์กร';
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
      {/* Banner if currently viewing as employee */}
      {currentUser.role !== 'approver' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold">โหมดทดสอบระบบสำหรับผู้จัดการ (Admin):</span> ปัจจุบันคุณเข้าสู่ระบบในชื่อพนักงาน (นางสาวพนิกา) คลิกปุ่มด้านขวาเพื่อสลับเป็นผู้จัดการ (นายสมชาย) เพื่ออนุมัติคำขอ
            </div>
          </div>
          <button
            onClick={() => switchRole('approver')}
            className="flex-shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            สลับเป็นผู้จัดการ (นายสมชาย)
          </button>
        </div>
      )}

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
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#155A32] text-xs sm:text-sm font-semibold transition-colors shadow-xs disabled:opacity-60"
            title="ส่งออกรายงานคำขอเป็นไฟล์ PDF"
          >
            {isExportingAllPdf ? (
              <div className="w-4 h-4 border-2 border-emerald-700/30 border-t-emerald-700 rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-emerald-700" />
            )}
            <span>{isExportingAllPdf ? 'กำลังสร้าง PDF...' : 'ส่งออกรายงาน PDF'}</span>
          </button>

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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'pending'
                  ? 'bg-[#155A32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>รายการรอพิจารณา ({pendingRequests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#155A32] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>ประวัติที่พิจารณาแล้ว ({historyRequests.length})</span>
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
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-slate-900 text-sm">
                            {req.employeeName}
                          </span>
                          <span className="text-xs text-slate-400">({req.department})</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {req.type}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <strong className="text-slate-700">ช่วงเวลา:</strong> {req.dateRange} ({req.days} วัน)
                          </span>
                          <span>
                            <strong className="text-slate-700">ผู้ปฏิบัติงานแทน:</strong> {req.substitute || 'ไม่มี'}
                          </span>
                          <span>
                            <strong className="text-slate-700">วันที่ยื่น:</strong> {req.appliedDate || '-'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{req.reason}"
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
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

                        {/* Reject */}
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>ไม่อนุมัติ</span>
                        </button>

                        {/* Approve */}
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-2 rounded-xl bg-[#155A32] hover:bg-[#114929] text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>อนุมัติคำขอ</span>
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
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              req.status === 'อนุมัติ'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'ไม่อนุมัติ'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
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
    </div>
  );
}
