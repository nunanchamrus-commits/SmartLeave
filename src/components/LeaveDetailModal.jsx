import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Check,
  FileDown,
  Edit3,
  Trash2,
  Save,
  RotateCcw,
  Calendar,
  User,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';
import { downloadLeaveSlipPdf } from '../utils/exportPdf';

export default function LeaveDetailModal() {
  const {
    selectedLeaveDetail,
    setSelectedLeaveDetail,
    currentUser,
    updateLeaveStatus,
    updateLeaveRequest,
    deleteLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    showToast,
  } = useLeave();

  const [approverRemark, setApproverRemark] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editForm, setEditForm] = useState({
    typeKey: 'vacation',
    type: 'ลาพักร้อน',
    startDate: '',
    endDate: '',
    days: 1,
    reason: '',
    substitute: '',
    status: '',
    note: '',
  });

  useEffect(() => {
    if (selectedLeaveDetail) {
      setApproverRemark('');
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setEditForm({
        typeKey: selectedLeaveDetail.typeKey || 'vacation',
        type: selectedLeaveDetail.type || 'ลาพักร้อน',
        startDate: selectedLeaveDetail.startDate || '',
        endDate: selectedLeaveDetail.endDate || '',
        days: selectedLeaveDetail.days || 1,
        reason: selectedLeaveDetail.reason || '',
        substitute: selectedLeaveDetail.substitute || '',
        status: selectedLeaveDetail.status || 'ยังไม่ยื่นเอกสาร',
        note: selectedLeaveDetail.note || '',
      });
    }
  }, [selectedLeaveDetail?.id]);

  if (!selectedLeaveDetail) return null;

  const req = selectedLeaveDetail;
  const isApprover = currentUser?.role === 'approver' || currentUser?.role === 'admin';
  const isOwner =
    currentUser?.employeeId === req.employeeId ||
    currentUser?.id === req.userId ||
    (currentUser?.raw_id && req.userId && Number(currentUser.raw_id) === Number(req.userId)) ||
    currentUser?.email === req.employeeEmail ||
    currentUser?.name === req.employeeName;

  const canEdit = isApprover || isOwner;

  const handleStatusChange = (nextStatus) => {
    if (nextStatus === 'อนุมัติ') {
      approveLeaveRequest(req.id, approverRemark || 'อนุมัติเรียบร้อย');
      setSelectedLeaveDetail(null);
      return;
    }
    if (nextStatus === 'ไม่อนุมัติ') {
      rejectLeaveRequest(req.id, approverRemark || 'ไม่อนุมัติเนื่องจากมีภารกิจจำเป็น');
      setSelectedLeaveDetail(null);
      return;
    }
    updateLeaveStatus(req.id, nextStatus, approverRemark);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const typeNames = {
      vacation: 'ลาพักร้อน',
      personal: 'ลากิจส่วนตัว',
      sick: 'ลาป่วย',
      maternity: 'ลาคลอดบุตร',
    };
    const finalType = typeNames[editForm.typeKey] || editForm.type;
    const dateRange =
      editForm.startDate && editForm.endDate
        ? editForm.startDate === editForm.endDate
          ? editForm.startDate
          : `${editForm.startDate} ถึง ${editForm.endDate}`
        : req.dateRange;

    const payload = {
      ...editForm,
      type: finalType,
      dateRange,
      days: parseFloat(editForm.days) || 1,
    };

    if (updateLeaveRequest) {
      await updateLeaveRequest(req.id, payload);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (deleteLeaveRequest) {
      await deleteLeaveRequest(req.id);
    }
    setSelectedLeaveDetail(null);
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
              <h3 className="font-bold text-base font-prompt">
                {isEditing ? 'แก้ไขรายละเอียดคำขอลา' : 'รายละเอียดคำขอลา'}
              </h3>
              <p className="text-[11px] text-emerald-200/80">รหัสคำขอ: {req.id}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedLeaveDetail(null);
            }}
            className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {isEditing ? (
            /* Edit Mode Form */
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs">
                กำลังแก้ไขข้อมูลคำขอลางาน การบันทึกจะซิงก์ตรงไปยัง Cloudflare D1 ทันที
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ประเภทการลา</label>
                <select
                  value={editForm.typeKey}
                  onChange={(e) => setEditForm({ ...editForm, typeKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 cursor-pointer"
                >
                  <option value="vacation">ลาพักร้อน</option>
                  <option value="personal">ลากิจส่วนตัว</option>
                  <option value="sick">ลาป่วย</option>
                  <option value="maternity">ลาคลอดบุตร</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">จำนวนวันลา</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={editForm.days}
                  onChange={(e) => setEditForm({ ...editForm, days: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เหตุผลการลา</label>
                <textarea
                  rows={3}
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                  placeholder="ระบุเหตุผลการลา..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ผู้ปฏิบัติงานแทน</label>
                <input
                  type="text"
                  value={editForm.substitute}
                  onChange={(e) => setEditForm({ ...editForm, substitute: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                  placeholder="เช่น นายอัครพล เจริญผล"
                />
              </div>

              {isApprover && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">สถานะคำขอ</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 cursor-pointer"
                    >
                      <option value="ยังไม่ยื่นเอกสาร">ยังไม่ยื่นเอกสาร</option>
                      <option value="อยู่ระหว่างตรวจสอบ">อยู่ระหว่างตรวจสอบ</option>
                      <option value="อนุมัติ">อนุมัติ</option>
                      <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ความเห็นผู้อนุมัติ</label>
                    <input
                      type="text"
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                      placeholder="หมายเหตุ..."
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกการแก้ไข</span>
                </button>
              </div>
            </form>
          ) : (
            /* Normal View */
            <>
              {/* Top Status & Type Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">ประเภทการลา</span>
                  <h4 className="text-base font-bold text-slate-800">{req.type}</h4>
                </div>
                <div>
                  {(req.status === 'ยังไม่ยื่นเอกสาร' || req.status === 'ยังไม่ส่งเอกสาร') && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200/70">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>ยังไม่ยื่นเอกสาร</span>
                    </span>
                  )}
                  {req.status === 'อยู่ระหว่างตรวจสอบ' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200/70">
                      <Clock className="w-3.5 h-3.5" />
                      <span>อยู่ระหว่างตรวจสอบ</span>
                    </span>
                  )}
                  {req.status === 'อนุมัติ' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>อนุมัติ</span>
                    </span>
                  )}
                  {req.status === 'ไม่อนุมัติ' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>ไม่อนุมัติ</span>
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

              {/* Status Management Buttons (Admin / Approver) */}
              {isApprover && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
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
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[11px] font-semibold text-slate-500">
                      ปรับสถานะคำขอลา (อัปเดตลง D1 และส่งแจ้งเตือนให้ผู้ใช้งานทันที)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={req.status === 'ยังไม่ยื่นเอกสาร' || req.status === 'ยังไม่ส่งเอกสาร'}
                        onClick={() => handleStatusChange('ยังไม่ยื่นเอกสาร')}
                        className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-xs border transition-all ${
                          req.status === 'ยังไม่ยื่นเอกสาร' || req.status === 'ยังไม่ส่งเอกสาร'
                            ? 'bg-orange-100 text-orange-800 border-orange-300 ring-2 ring-orange-400/30 cursor-default'
                            : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>ยังไม่ยื่นเอกสาร</span>
                      </button>
                      <button
                        type="button"
                        disabled={req.status === 'อยู่ระหว่างตรวจสอบ'}
                        onClick={() => handleStatusChange('อยู่ระหว่างตรวจสอบ')}
                        className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-xs border transition-all ${
                          req.status === 'อยู่ระหว่างตรวจสอบ'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-2 ring-yellow-400/40 cursor-default'
                            : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>อยู่ระหว่างตรวจสอบ</span>
                      </button>
                      <button
                        type="button"
                        disabled={req.status === 'อนุมัติ'}
                        onClick={() => handleStatusChange('อนุมัติ')}
                        className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-all shadow-sm ${
                          req.status === 'อนุมัติ'
                            ? 'bg-[#15803D] text-white ring-2 ring-emerald-400/40 cursor-default'
                            : 'bg-[#155A32] text-white hover:bg-[#124A29]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>อนุมัติ</span>
                      </button>
                      <button
                        type="button"
                        disabled={req.status === 'ไม่อนุมัติ'}
                        onClick={() => handleStatusChange('ไม่อนุมัติ')}
                        className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-xs border transition-all ${
                          req.status === 'ไม่อนุมัติ'
                            ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-400/30 cursor-default'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ไม่อนุมัติ</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Popup before Deleting */}
              {showDeleteConfirm && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-red-700 font-semibold text-xs sm:text-sm">
                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                    <span>ยืนยันการลบคำขอลางานนี้หรือไม่?</span>
                  </div>
                  <p className="text-xs text-red-600">
                    การลบจะลบคำขอลาออกจากระบบ Cloudflare D1 ทันที และคืนโควตาวันลา (หากเคยอนุมัติ)
                  </p>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-xs"
                    >
                      ยืนยันลบคำขอลา
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {!isEditing && canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
                  title="แก้ไขรายละเอียดคำขอลางาน"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>แก้ไขรายละเอียด</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-xs transition-colors shadow-2xs"
                  title="ลบคำขอลางานนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบคำขอลา</span>
                </button>
              </>
            )}

            {!isEditing && (
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
            )}
          </div>

          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedLeaveDetail(null);
            }}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

