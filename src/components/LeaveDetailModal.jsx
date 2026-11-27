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
  Save,
  RotateCcw,
  Calendar,
  User,
  Download,
  Eye,
  CalendarX2,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';
import { downloadLeaveSlipPdf, downloadCancelLeaveSlipPdf } from '../utils/exportPdf';
import { getHolidaysMap } from '../data/holidays';
import {
  formatThaiDateRangeBE,
  formatThaiDateBE,
  getLastLeaveDateISO,
  isLeaveCancellable,
  getTodayThaiISO,
} from '../utils/thaiDate';
import ThaiDatePicker from './ThaiDatePicker';

export default function LeaveDetailModal() {
  const {
    selectedLeaveDetail,
    setSelectedLeaveDetail,
    openCancelLeaveModal,
    currentUser,
    employees,
    updateLeaveStatus,
    updateLeaveRequest,
    deleteLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    showToast,
    customHolidays,
  } = useLeave();

  const [approverRemark, setApproverRemark] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCancelPdf, setIsExportingCancelPdf] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingStatusConfirm, setPendingStatusConfirm] = useState(null);

  const [editForm, setEditForm] = useState({
    typeKey: 'vacation',
    type: 'ลาพักผ่อน',
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
      setPendingStatusConfirm(null);
      setEditForm({
        typeKey: selectedLeaveDetail.typeKey || 'vacation',
        type: selectedLeaveDetail.type || 'ลาพักผ่อน',
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

  const reqEmp = (employees || []).find(
    (e) => e.id === req.userId || e.id === req.employeeId || e.name === req.employeeName
  );
  const isReqMale =
    reqEmp?.gender === 'ชาย' ||
    Boolean(req.employeeName?.includes('นาย')) ||
    (isOwner && (currentUser?.gender === 'ชาย' || currentUser?.prefix?.includes('นาย')));

  const handleStatusChange = (nextStatus) => {
    if (nextStatus === 'ไม่อนุมัติ' && !approverRemark.trim()) {
      if (showToast) showToast('กรุณาระบุเหตุผลการไม่อนุมัติในช่องข้อคิดเห็นด้านล่าง (จำเป็นต้องระบุ)', 'error');
      return;
    }
    setPendingStatusConfirm(nextStatus);
    setShowDeleteConfirm(false);
  };

  const handleExecuteStatusChange = (nextStatus) => {
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

    // ตรวจสอบวันหยุดราชการ: บล็อกไม่ให้เลือกวันหยุดราชการ
    if (editForm.startDate) {
      const year = parseInt(editForm.startDate.slice(0, 4), 10);
      const hMap = getHolidaysMap(year, customHolidays || []);
      if (hMap[editForm.startDate]) {
        if (showToast) {
          showToast(`ไม่สามารถเลือกวันลาในวันหยุดราชการได้ (${hMap[editForm.startDate].name})`, 'error');
        } else {
          alert(`ไม่สามารถเลือกวันลาในวันหยุดราชการได้ (${hMap[editForm.startDate].name})`);
        }
        return;
      }
    }
    if (editForm.endDate) {
      const year = parseInt(editForm.endDate.slice(0, 4), 10);
      const hMap = getHolidaysMap(year, customHolidays || []);
      if (hMap[editForm.endDate]) {
        if (showToast) {
          showToast(`ไม่สามารถเลือกวันลาในวันหยุดราชการได้ (${hMap[editForm.endDate].name})`, 'error');
        } else {
          alert(`ไม่สามารถเลือกวันลาในวันหยุดราชการได้ (${hMap[editForm.endDate].name})`);
        }
        return;
      }
    }

    // กำหนดให้มีแค่ ลากิจ, ลาป่วย, ลาพักผ่อน ที่สามารถลาครึ่งวันได้
    if (!['vacation', 'personal', 'sick'].includes(editForm.typeKey)) {
      const numDays = parseFloat(editForm.days);
      if (numDays < 1 || numDays % 1 !== 0) {
        if (showToast) {
          showToast('ประเภทการลานี้ไม่สามารถลาครึ่งวันได้ ต้องเป็นจำนวนเต็มวันเท่านั้น (มีเฉพาะลากิจ ลาป่วย ลาพักผ่อน)', 'error');
        } else {
          alert('ประเภทการลานี้ไม่สามารถลาครึ่งวันได้ ต้องเป็นจำนวนเต็มวันเท่านั้น (มีเฉพาะลากิจ ลาป่วย ลาพักผ่อน)');
        }
        return;
      }
    }

    const typeNames = {
      vacation: 'ลาพักผ่อน',
      personal: 'ลากิจส่วนตัว',
      sick: 'ลาป่วย',
      maternity: 'ลาคลอดบุตร',
      paternity: 'ลาไปช่วยเหลือภริยาที่คลอดบุตร',
      ordination: 'ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์',
      military: 'ลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล',
      study: 'ลาไปศึกษา ฝึกอบรม หรือดูงาน',
      international: 'ลาไปปฏิบัติงานในองค์กรระหว่างประเทศ',
      spouse: 'ลาติดตามคู่สมรส',
      rehab: 'ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ',
    };
    const finalType = typeNames[editForm.typeKey] || editForm.type;
    const dateRange =
      editForm.startDate && editForm.endDate
        ? formatThaiDateRangeBE(editForm.startDate, editForm.endDate, req.dateRange, parseFloat(editForm.days) || 1)
        : req.dateRange;

    const payload = {
      ...editForm,
      type: finalType,
      dateRange,
      days: parseFloat(editForm.days) || 1,
      reason: editForm.typeKey === 'vacation' ? '' : editForm.reason,
      substitute: editForm.typeKey === 'vacation' ? editForm.substitute : '',
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

  const handleDownloadCancelPdf = async () => {
    setIsExportingCancelPdf(true);
    try {
      await downloadCancelLeaveSlipPdf(req);
      if (showToast) showToast('ดาวน์โหลดใบขอยกเลิกวันลาเป็น PDF เรียบร้อยแล้ว', 'success');
    } catch (e) {
      console.error(e);
      if (showToast) showToast('เกิดข้อผิดพลาดในการดาวน์โหลดใบยกเลิกวันลา PDF', 'error');
    } finally {
      setIsExportingCancelPdf(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#2E6F4E] text-white">
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
                  <option value="vacation">ลาพักผ่อน</option>
                  <option value="personal">ลากิจส่วนตัว</option>
                  <option value="sick">ลาป่วย</option>
                  {(!isReqMale || editForm.typeKey === 'maternity') && (
                    <option value="maternity">ลาคลอดบุตร</option>
                  )}
                  {(isReqMale || editForm.typeKey === 'paternity') && (
                    <option value="paternity">ลาไปช่วยเหลือภริยาที่คลอดบุตร</option>
                  )}
                  {(isReqMale || editForm.typeKey === 'ordination') && (
                    <option value="ordination">ลาอุปสมบทหรือลาไปประกอบพิธีฮัจย์</option>
                  )}
                  {(isReqMale || editForm.typeKey === 'military') && (
                    <option value="military">ลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล</option>
                  )}
                  <option value="study">ลาไปศึกษา ฝึกอบรม หรือดูงาน</option>
                  <option value="international">ลาไปปฏิบัติงานในองค์กรระหว่างประเทศ</option>
                  <option value="spouse">ลาติดตามคู่สมรส</option>
                  <option value="rehab">ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่เริ่มต้น</label>
                  <ThaiDatePicker
                    value={editForm.startDate}
                    onChange={(val) =>
                      setEditForm((prev) => ({
                        ...prev,
                        startDate: val,
                        endDate: prev.endDate && val > prev.endDate ? val : prev.endDate,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่สิ้นสุด</label>
                  <ThaiDatePicker
                    value={editForm.endDate}
                    min={editForm.startDate}
                    onChange={(val) => setEditForm({ ...editForm, endDate: val })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>จำนวนวันลา</span>
                  {!['vacation', 'personal', 'sick'].includes(editForm.typeKey) && (
                    <span className="text-[11px] text-amber-600 font-normal">
                      *(ต้องเป็นจำนวนเต็มวันเท่านั้น)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step={['vacation', 'personal', 'sick'].includes(editForm.typeKey) ? '0.5' : '1'}
                  min={['vacation', 'personal', 'sick'].includes(editForm.typeKey) ? '0.5' : '1'}
                  value={editForm.days}
                  onChange={(e) => setEditForm({ ...editForm, days: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                />
              </div>

              {editForm.typeKey !== 'vacation' && (
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
              )}

              {editForm.typeKey === 'vacation' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ผู้ปฏิบัติงานแทน</label>
                  <input
                    type="text"
                    value={editForm.substitute}
                    onChange={(e) => setEditForm({ ...editForm, substitute: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    placeholder="ระบุชื่อผู้ปฏิบัติงานแทน"
                  />
                </div>
              )}

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
                  {(req.status === 'ยกเลิกการลา' || req.status === 'ยกเลิกวันลา') && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>ยกเลิกวันลา</span>
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

              {/* Reason (ไม่แสดงสำหรับลาพักผ่อนหากไม่ได้ระบุ) */}
              {(req.typeKey !== 'vacation' || req.reason) && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-400 font-medium block mb-1">เหตุผลการลา</span>
                  <p className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed">
                    {req.reason || 'ไม่ได้ระบุเหตุผล'}
                  </p>
                </div>
              )}

              {/* Substitute Colleague (เฉพาะลาพักผ่อน) & Approver */}
              <div className={`grid grid-cols-1 ${(req.typeKey === 'vacation' || req.substitute) ? 'sm:grid-cols-2' : ''} gap-3 text-xs`}>
                {(req.typeKey === 'vacation' || req.substitute) && (
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-medium block">ผู้ปฏิบัติงานแทน</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {req.substitute || 'ไม่มี'}
                    </span>
                  </div>
                )}

                <div className="p-3 bg-white rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium block">ผู้อนุมัติ</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {req.approver || '-'}
                  </span>
                </div>
              </div>

              {/* Attachment */}
              {(req.attachment || req.attachmentUrl) && (
                <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-600 truncate max-w-[65%]">
                    <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate font-medium">{req.attachmentName || req.attachment || 'เอกสารแนบ'}</span>
                  </div>
                  {req.attachmentUrl ? (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const w = window.open('');
                          if (w) {
                            if (req.attachmentUrl.startsWith('data:application/pdf')) {
                              w.document.write(`<iframe src="${req.attachmentUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              w.document.title = req.attachmentName || req.attachment || 'เอกสารแนบ.pdf';
                            } else {
                              w.location.href = req.attachmentUrl;
                            }
                          }
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer hover:underline flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>เปิดดู</span>
                      </button>
                      <span className="text-slate-300">|</span>
                      <a
                        href={req.attachmentUrl}
                        download={req.attachmentName || req.attachment || 'เอกสารแนบ.pdf'}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer hover:underline flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ดาวน์โหลด</span>
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">(มีเฉพาะชื่อไฟล์)</span>
                  )}
                </div>
              )}

              {/* Approver Note */}
              {req.note && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                  <span className="font-semibold block">ความเห็นจากผู้อนุมัติ:</span>
                  <p className="mt-0.5">{req.note}</p>
                </div>
              )}

              {/* Leave Cancellation Info & Document */}
              {(req.cancelStatus || req.cancelReason || req.cancelAttachmentName || req.cancelAttachmentUrl) && (
                <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <span className="font-bold text-rose-800">ข้อมูลคำขอยกเลิกวันลา</span>
                    {req.cancelStatus === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200">
                        รอพิจารณาอนุญาตยกเลิก
                      </span>
                    )}
                    {req.cancelStatus === 'approved' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                        อนุญาตยกเลิกวันลาแล้ว
                      </span>
                    )}
                    {req.cancelStatus === 'rejected' && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[11px] border border-red-200">
                        ไม่อนุญาตยกเลิกวันลา
                      </span>
                    )}
                  </div>
                  {(req.cancelDateRange || req.cancelDays > 0) && (
                    <p className="text-rose-800 font-semibold">
                      <span className="font-semibold text-slate-600">วันที่ยกเลิก: </span>
                      {req.cancelDateRange || req.dateRange} ({req.cancelDays || req.days} วัน)
                    </p>
                  )}
                  {req.cancelReason && (
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-600">เหตุผลยกเลิกวันลา: </span>
                      {req.cancelReason}
                    </p>
                  )}
                  {req.cancelRemark && (
                    <p className="text-slate-700">
                      <span className="font-semibold text-slate-600">หมายเหตุผู้ดูแล: </span>
                      {req.cancelRemark}
                    </p>
                  )}
                  {(req.cancelAttachmentName || req.cancelAttachmentUrl) && (
                    <div className="p-2.5 bg-white rounded-xl border border-rose-100 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-slate-600 truncate max-w-[60%]">
                        <FileText className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span className="truncate font-medium">
                          {req.cancelAttachmentName || 'เอกสารการยกเลิกวันลา'}
                        </span>
                      </div>
                      {req.cancelAttachmentUrl && (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const w = window.open('');
                              if (w) {
                                if (req.cancelAttachmentUrl.startsWith('data:application/pdf')) {
                                  w.document.write(`<iframe src="${req.cancelAttachmentUrl}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                                  w.document.title = req.cancelAttachmentName || 'เอกสารการยกเลิกวันลา.pdf';
                                } else {
                                  w.location.href = req.cancelAttachmentUrl;
                                }
                              }
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>เปิดดู</span>
                          </button>
                          <span className="text-slate-300">|</span>
                          <a
                            href={req.cancelAttachmentUrl}
                            download={req.cancelAttachmentName || 'เอกสารการยกเลิกวันลา'}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline flex items-center space-x-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ดาวน์โหลด</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="pt-2 border-t border-rose-100 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-rose-800 font-medium">แบบฟอร์มขอยกเลิกวันลา (PDF):</span>
                    <button
                      type="button"
                      onClick={handleDownloadCancelPdf}
                      disabled={isExportingCancelPdf}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-colors shadow-2xs disabled:opacity-60"
                      title="ดาวน์โหลดใบขอยกเลิกวันลาเป็น PDF"
                    >
                      {isExportingCancelPdf ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>ดาวน์โหลดใบยกเลิก (PDF)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Management Buttons (Admin / Approver) */}
              {isApprover && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-700 text-xs">
                      ข้อคิดเห็น / หมายเหตุจากผู้อนุมัติ {req.status === 'อยู่ระหว่างตรวจสอบ' && <span className="text-rose-500 font-normal">(จำเป็นต้องระบุเมื่อไม่อนุมัติ)</span>}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={approverRemark}
                    onChange={(e) => setApproverRemark(e.target.value)}
                    placeholder={req.status === 'อยู่ระหว่างตรวจสอบ' ? "ระบุเหตุผล (จำเป็นเมื่อกดไม่อนุมัติ)..." : "ระบุข้อความถึงผู้ขอลา (ถ้ามี)..."}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[11px] font-semibold text-slate-500">
                      ปรับสถานะคำขอลา (อัปเดตลง D1 และส่งแจ้งเตือนให้ผู้ใช้งานทันที)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {req.status !== 'อยู่ระหว่างตรวจสอบ' && req.status !== 'อนุมัติ' && req.status !== 'ไม่อนุมัติ' ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('อยู่ระหว่างตรวจสอบ')}
                          className="col-span-2 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs border transition-all bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200 shadow-2xs cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5 text-sky-700" />
                          <span>อยู่ระหว่างตรวจสอบ</span>
                        </button>
                      ) : (
                        <>
                          {req.status === 'อยู่ระหว่างตรวจสอบ' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange('ยังไม่ยื่นเอกสาร')}
                              className="col-span-2 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl bg-sky-50 hover:bg-orange-50 text-sky-800 hover:text-orange-800 border border-sky-200 hover:border-orange-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="คลิกเพื่อเปลี่ยนสถานะกลับเป็นยังไม่ยื่นเอกสาร"
                            >
                              <Clock className="w-3.5 h-3.5 text-sky-600" />
                              <span>สถานะปัจจุบัน: อยู่ระหว่างตรวจสอบ (คลิกเพื่อเปลี่ยนเป็น "ยังไม่ยื่นเอกสาร")</span>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={req.status === 'อนุมัติ'}
                            onClick={() => handleStatusChange('อนุมัติ')}
                            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-all shadow-sm cursor-pointer ${
                              req.status === 'อนุมัติ'
                                ? 'bg-[#15803D] text-white ring-2 ring-emerald-400/40 cursor-default'
                                : 'bg-[#2F855A] text-white hover:bg-[#256F4A]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>อนุมัติ</span>
                          </button>
                          <button
                            type="button"
                            disabled={req.status === 'ไม่อนุมัติ'}
                            onClick={() => handleStatusChange('ไม่อนุมัติ')}
                            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-xs border transition-all cursor-pointer ${
                              req.status === 'ไม่อนุมัติ'
                                ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-400/30 cursor-default'
                                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ไม่อนุมัติ</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Confirmation Prompt before Status Change */}
                  {pendingStatusConfirm && (
                    <div className={`p-4 rounded-2xl border space-y-2.5 animate-in fade-in ${
                      pendingStatusConfirm === 'อนุมัติ'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : pendingStatusConfirm === 'ไม่อนุมัติ'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : pendingStatusConfirm === 'อยู่ระหว่างตรวจสอบ'
                        ? 'bg-sky-50 border-sky-200 text-sky-900'
                        : 'bg-orange-50 border-orange-200 text-orange-900'
                    }`}>
                      <div className="flex items-center space-x-2 font-semibold text-xs sm:text-sm">
                        {pendingStatusConfirm === 'อนุมัติ' ? (
                          <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                        ) : pendingStatusConfirm === 'ไม่อนุมัติ' ? (
                          <X className="w-4 h-4 flex-shrink-0 text-red-600" />
                        ) : pendingStatusConfirm === 'อยู่ระหว่างตรวจสอบ' ? (
                          <Clock className="w-4 h-4 flex-shrink-0 text-sky-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 flex-shrink-0 text-orange-600" />
                        )}
                        <span>ยืนยันการเปลี่ยนสถานะคำขอลาเป็น "{pendingStatusConfirm}" หรือไม่?</span>
                      </div>
                      <p className="text-xs opacity-80">
                        {approverRemark
                          ? `หมายเหตุผู้อนุมัติ: "${approverRemark}" • ระบบจะบันทึกสถานะลงฐานข้อมูล D1 และแจ้งเตือนผู้ใช้งาน`
                          : 'ระบบจะบันทึกสถานะลงฐานข้อมูล D1 ทันที และส่งการแจ้งเตือนไปยังผู้ใช้งาน'}
                      </p>
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPendingStatusConfirm(null)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = pendingStatusConfirm;
                            setPendingStatusConfirm(null);
                            handleExecuteStatusChange(next);
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs ${
                            pendingStatusConfirm === 'อนุมัติ'
                              ? 'bg-[#2F855A] hover:bg-[#256F4A]'
                              : pendingStatusConfirm === 'ไม่อนุมัติ'
                              ? 'bg-red-600 hover:bg-red-700'
                              : pendingStatusConfirm === 'อยู่ระหว่างตรวจสอบ'
                              ? 'bg-sky-600 hover:bg-sky-700'
                              : 'bg-orange-600 hover:bg-orange-700'
                          }`}
                        >
                          {pendingStatusConfirm === 'อนุมัติ' ? (
                            <span>ยืนยันอนุมัติ</span>
                          ) : pendingStatusConfirm === 'ไม่อนุมัติ' ? (
                            <span>ยืนยันไม่อนุมัติ</span>
                          ) : (
                            <span>ยืนยันเปลี่ยนสถานะ</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {!isEditing && (
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#2F855A] hover:bg-[#256F4A] text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-60"
                title="ดาวน์โหลดไฟล์ PDF ใบลาเข้าสู่เครื่อง"
              >
                {isExportingPdf ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-lime-300" />
                )}
                <span>{isExportingPdf ? 'กำลังประมวลผล...' : 'ใบลา (PDF)'}</span>
              </button>
            )}

            {!isEditing && (req.cancelStatus || req.status === 'ยกเลิกวันลา' || req.cancelDays > 0) && (
              <button
                onClick={handleDownloadCancelPdf}
                disabled={isExportingCancelPdf}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-60"
                title="ดาวน์โหลดไฟล์ PDF ใบขอยกเลิกวันลาเข้าสู่เครื่อง"
              >
                {isExportingCancelPdf ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-rose-200" />
                )}
                <span>{isExportingCancelPdf ? 'กำลังประมวลผล...' : 'ใบยกเลิก (PDF)'}</span>
              </button>
            )}

            {!isEditing && isOwner && isLeaveCancellable(req, getTodayThaiISO()) && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedLeaveDetail(null);
                  if (openCancelLeaveModal) {
                    openCancelLeaveModal(req.id);
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors shadow-xs"
                title={`ยื่นขอยกเลิกวันลานี้ (ขอยกเลิกได้ถึง ${formatThaiDateBE(getLastLeaveDateISO(req))})`}
              >
                <CalendarX2 className="w-3.5 h-3.5 text-rose-600" />
                <span>ขอยกเลิกวันลานี้</span>
              </button>
            )}

            {!isEditing && isOwner && getLastLeaveDateISO(req) && getTodayThaiISO() > getLastLeaveDateISO(req) && req.status !== 'ไม่อนุมัติ' && req.status !== 'ยกเลิกการลา' && req.status !== 'ยกเลิกวันลา' && !req.cancelStatus && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200"
                title="ระบบอนุญาตให้ขอยกเลิกได้ถึงวันที่ลาวันสุดท้ายเท่านั้น"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>พ้นกำหนดวันลาวันสุดท้ายแล้ว ({formatThaiDateBE(getLastLeaveDateISO(req))})</span>
              </span>
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

