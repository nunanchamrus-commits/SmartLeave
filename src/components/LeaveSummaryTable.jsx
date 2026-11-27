import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileDown,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';
import { downloadLeaveSlipPdf, downloadLeaveSummaryPdf } from '../utils/exportPdf';
import EmptyState from './EmptyState';

// Helper formatting request ID to SL-XXXX
export const formatRequestId = (id) => {
  if (!id) return '-';
  const str = String(id);
  if (str.startsWith('SL-') || str.startsWith('sl-')) return str.toUpperCase();
  if (str.startsWith('req-')) return `SL-${str.slice(4)}`;
  return `SL-${str}`;
};

export default function LeaveSummaryTable({ requests = null }) {
  const {
    leaveRequests: contextRequests,
    setSelectedLeaveDetail,
    showToast,
    employees,
  } = useLeave();

  // Use passed requests or fallback to all leaveRequests from context
  const allRequests = requests || contextRequests || [];

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [downloadingId, setDownloadingId] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Distinct departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set();
    allRequests.forEach((r) => {
      if (r.department) set.add(r.department.trim());
    });
    return Array.from(set).sort();
  }, [allRequests]);

  // Distinct leave types for filter dropdown
  const leaveTypes = useMemo(() => {
    const set = new Set();
    allRequests.forEach((r) => {
      if (r.type) set.add(r.type.trim());
    });
    return Array.from(set).sort();
  }, [allRequests]);

  // Summary counts
  const summaryCounts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let checking = 0;
    let cancelled = 0;

    allRequests.forEach((r) => {
      if (r.status === 'อนุมัติ' || r.status === 'approved') approved++;
      else if (r.status === 'ไม่อนุมัติ' || r.status === 'rejected') rejected++;
      else if (r.status === 'อยู่ระหว่างตรวจสอบ' || r.status === 'checking') checking++;
      else if (r.status === 'ยกเลิกวันลา' || r.status === 'ยกเลิกการลา' || r.cancelStatus === 'approved') cancelled++;
      else pending++;
    });

    return {
      total: allRequests.length,
      pending,
      approved,
      rejected,
      checking,
      cancelled,
    };
  }, [allRequests]);

  // Filtered requests based on criteria
  const filteredRequests = useMemo(() => {
    return allRequests.filter((r) => {
      // 1. Search term match (ID, employee name, department, leave type, reason)
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const idStr = formatRequestId(r.id).toLowerCase();
        const nameStr = (r.employeeName || '').toLowerCase();
        const deptStr = (r.department || '').toLowerCase();
        const typeStr = (r.type || '').toLowerCase();
        const reasonStr = (r.reason || '').toLowerCase();
        const subStr = (r.substitute || '').toLowerCase();

        const match =
          idStr.includes(q) ||
          nameStr.includes(q) ||
          deptStr.includes(q) ||
          typeStr.includes(q) ||
          reasonStr.includes(q) ||
          subStr.includes(q);

        if (!match) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending') {
          if (r.status !== 'ยังไม่ยื่นเอกสาร' && r.status !== 'รออนุมัติ') return false;
        } else if (statusFilter === 'checking') {
          if (r.status !== 'อยู่ระหว่างตรวจสอบ') return false;
        } else if (statusFilter === 'approved') {
          if (r.status !== 'อนุมัติ' && r.status !== 'approved') return false;
        } else if (statusFilter === 'rejected') {
          if (r.status !== 'ไม่อนุมัติ' && r.status !== 'rejected') return false;
        } else if (statusFilter === 'cancelled') {
          if (r.status !== 'ยกเลิกวันลา' && r.status !== 'ยกเลิกการลา' && r.cancelStatus !== 'approved') return false;
        } else if (r.status !== statusFilter) {
          return false;
        }
      }

      // 3. Type filter
      if (typeFilter !== 'all' && r.type !== typeFilter) {
        return false;
      }

      // 4. Department filter
      if (departmentFilter !== 'all' && r.department !== departmentFilter) {
        return false;
      }

      return true;
    });
  }, [allRequests, searchTerm, statusFilter, typeFilter, departmentFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRequests = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, validCurrentPage, pageSize]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDepartmentFilter('all');
    setCurrentPage(1);
  };

  // Download single leave PDF slip
  const handleDownloadSinglePdf = async (req, e) => {
    if (e) e.stopPropagation();
    setDownloadingId(req.id);
    try {
      await downloadLeaveSlipPdf(req);
      if (showToast) showToast(`ส่งออกใบลา ${formatRequestId(req.id)} เป็น PDF เรียบร้อยแล้ว`, 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('เกิดข้อผิดพลาดในการดาวน์โหลด PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Export full summary PDF
  const handleExportFullPdf = async () => {
    setIsExportingPdf(true);
    try {
      await downloadLeaveSummaryPdf(filteredRequests, 'รายงานสรุปข้อมูลคำขอลาทั้งหมด');
      if (showToast) showToast('ส่งออกรายงานสรุป PDF สำเร็จ', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('เกิดข้อผิดพลาดในการส่งออก PDF', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export to Excel / CSV
  const handleExportCsv = () => {
    if (filteredRequests.length === 0) {
      if (showToast) showToast('ไม่มีข้อมูลคำขอลาสำหรับส่งออก', 'warning');
      return;
    }

    const headers = [
      'เลขที่คำขอลา',
      'วันที่ยื่นคำขอ',
      'ชื่อ-สกุลผู้ยื่น',
      'ฝ่าย/กลุ่มงาน',
      'ประเภทการลา',
      'ช่วงวันที่ลา',
      'จำนวนวันลา (วัน)',
      'ผู้ปฏิบัติงานแทน',
      'เหตุผลการลา',
      'สถานะคำขอ',
      'วันที่พิจารณา',
      'หมายเหตุผู้อนุมัติ',
    ];

    const rows = filteredRequests.map((r) => [
      formatRequestId(r.id),
      `"${r.appliedDate || '-'}"`,
      `"${(r.employeeName || '').replace(/"/g, '""')}"`,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      `"${r.type || '-'}"`,
      `"${(r.dateRange || '').replace(/"/g, '""')}"`,
      r.days || 0,
      `"${(r.substitute || '-').replace(/"/g, '""')}"`,
      `"${(r.reason || '-').replace(/"/g, '""')}"`,
      `"${r.status || '-'}"`,
      `"${r.approvedDate || '-'}"`,
      `"${(r.note || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ตารางสรุปการลา_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) showToast('ส่งออกตารางสรุปการลาเป็นไฟล์ Excel/CSV สำเร็จ', 'success');
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'อนุมัติ':
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>อนุมัติ</span>
          </span>
        );
      case 'ไม่อนุมัติ':
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>ไม่อนุมัติ</span>
          </span>
        );
      case 'อยู่ระหว่างตรวจสอบ':
      case 'checking':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-300">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>อยู่ระหว่างตรวจสอบ</span>
          </span>
        );
      case 'ยกเลิกวันลา':
      case 'ยกเลิกการลา':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>ยกเลิกวันลา</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
            <AlertCircle className="w-3 h-3 text-orange-600" />
            <span>{status || 'ยังไม่ยื่นเอกสาร'}</span>
          </span>
        );
    }
  };

  // Helper for Leave Type Badge styling
  const renderTypeBadge = (type) => {
    let colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (type?.includes('ป่วย')) colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
    else if (type?.includes('กิจ')) colorClass = 'bg-teal-50 text-teal-800 border-teal-200';
    else if (type?.includes('คลอด')) colorClass = 'bg-purple-50 text-purple-800 border-purple-200';
    else if (type?.includes('ฟื้นฟู')) colorClass = 'bg-amber-50 text-amber-800 border-amber-200';

    return (
      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${colorClass}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Summary Badges & Export Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 mr-1 flex items-center space-x-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>สรุปข้อมูล ({filteredRequests.length} รายการ):</span>
          </span>
          <button
            type="button"
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer border ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ทั้งหมด ({summaryCounts.total})
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('approved'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer border ${
              statusFilter === 'approved'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            อนุมัติแล้ว ({summaryCounts.approved})
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('checking'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer border ${
              statusFilter === 'checking'
                ? 'bg-sky-700 text-white border-sky-700'
                : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
            }`}
          >
            อยู่ระหว่างตรวจสอบ ({summaryCounts.checking})
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer border ${
              statusFilter === 'pending'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
            }`}
          >
            ยังไม่ยื่นเอกสาร ({summaryCounts.pending})
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer border ${
              statusFilter === 'rejected'
                ? 'bg-rose-700 text-white border-rose-700'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            ไม่อนุมัติ ({summaryCounts.rejected})
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="ส่งออกตารางเป็นไฟล์ Excel (CSV)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>ส่งออก Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleExportFullPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="ส่งออกรายงานสรุปเป็น PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'กำลังส่งออก...' : 'ส่งออก PDF'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ค้นหาเลขที่คำขอ, ชื่อ, ฝ่าย, เหตุผล..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Filter by Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 cursor-pointer"
          >
            <option value="all">สถานะคำขอ: ทั้งหมด</option>
            <option value="อนุมัติ">อนุมัติ</option>
            <option value="อยู่ระหว่างตรวจสอบ">อยู่ระหว่างตรวจสอบ</option>
            <option value="ยังไม่ยื่นเอกสาร">ยังไม่ยื่นเอกสาร</option>
            <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
            <option value="cancelled">ยกเลิกวันลา</option>
          </select>
        </div>

        {/* Filter by Leave Type */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 cursor-pointer"
          >
            <option value="all">ประเภทการลา: ทั้งหมด</option>
            {leaveTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Filter by Department & Reset */}
        <div className="flex items-center space-x-2">
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 cursor-pointer truncate"
          >
            <option value="all">ฝ่าย/กลุ่มงาน: ทั้งหมด</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer flex-shrink-0"
              title="ล้างตัวกรองทั้งหมด"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">เลขที่คำขอ</th>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">ผู้ยื่นคำขอ</th>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">ประเภทการลา</th>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">ช่วงวันที่ลา</th>
                <th className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">จำนวน</th>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">วันที่ยื่น</th>
                <th className="py-3 px-3 sm:px-4 whitespace-nowrap">ผู้ปฏิบัติงานแทน</th>
                <th className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">สถานะ</th>
                <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <EmptyState
                      compact
                      variant="search"
                      title="ไม่พบข้อมูลคำขอลา"
                      description="ไม่มีข้อมูลที่ตรงกับคำค้นหาหรือตัวกรองที่ระบุ ลองล้างตัวกรองเพื่อดูรายการทั้งหมด"
                    />
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => {
                  const emp = employees.find(
                    (e) =>
                      (req.userId && (e.id === req.userId || e.raw_id === req.userId || String(e.raw_id) === String(req.userId))) ||
                      (req.employeeId && e.employeeId && e.employeeId.toLowerCase() === req.employeeId.toLowerCase()) ||
                      (req.employeeName && e.name && e.name.trim() === req.employeeName.trim())
                  );
                  const avatar =
                    emp?.avatar ||
                    req.avatar ||
                    'https://i.pinimg.com/736x/f5/47/d8/f547d800625af9056d62efe8969aeea0.jpg';

                  return (
                    <tr
                      key={req.id}
                      onClick={() => {
                        if (setSelectedLeaveDetail) setSelectedLeaveDetail(req);
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Request ID */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 group-hover:border-emerald-300">
                          {formatRequestId(req.id)}
                        </span>
                      </td>

                      {/* Employee Info */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center space-x-2.5 min-w-[160px]">
                          <img
                            src={avatar}
                            alt={req.employeeName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                              {req.employeeName || emp?.name || 'เจ้าหน้าที่'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {req.department || emp?.department || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        {renderTypeBadge(req.type)}
                      </td>

                      {/* Date Range */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700">
                          {req.dateRange}
                        </span>
                      </td>

                      {/* Days */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          {req.days} วัน
                        </span>
                      </td>

                      {/* Applied Date */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-slate-500">
                        {req.appliedDate || '-'}
                      </td>

                      {/* Substitute */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-slate-600 max-w-[130px] truncate">
                        {req.substitute || '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        {renderStatusBadge(req.status)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Export PDF Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDownloadSinglePdf(req, e)}
                            disabled={downloadingId === req.id}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer"
                            title="ดาวน์โหลดใบลา PDF"
                          >
                            {downloadingId === req.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                            ) : (
                              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </button>

                          {/* View Detail Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (setSelectedLeaveDetail) setSelectedLeaveDetail(req);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors inline-flex items-center space-x-1 cursor-pointer"
                            title="ดูรายละเอียดคำขอลา"
                          >
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span>ดู</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination & Record Count */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>แสดง</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-pointer outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>รายการต่อหน้า (ทั้งหมด {filteredRequests.length} รายการ)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="mr-2">
              หน้า {validCurrentPage} จาก {totalPages}
            </span>
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
