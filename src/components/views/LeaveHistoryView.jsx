import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  Plane,
  Briefcase,
  PlusCircle,
  FileDown,
} from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { downloadLeaveSlipPdf, downloadLeaveSummaryPdf } from '../../utils/exportPdf';

export default function LeaveHistoryView() {
  const { leaveRequests, setSelectedLeaveDetail, setIsRequestModalOpen, showToast } = useLeave();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isExportingSummary, setIsExportingSummary] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const filteredRequests = leaveRequests.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = typeFilter === 'all' || r.typeKey === typeFilter;
    const matchSearch =
      search === '' ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      r.dateRange.includes(search) ||
      r.employeeName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const handleExportSummaryPdf = async () => {
    setIsExportingSummary(true);
    try {
      await downloadLeaveSummaryPdf(filteredRequests, 'รายงานประวัติการลา');
      if (showToast) showToast('ส่งออกรายงานสรุปการลาเป็น PDF เรียบร้อยแล้ว', 'success');
    } catch (e) {
      console.error(e);
      if (showToast) showToast('เกิดข้อผิดพลาดในการสร้าง PDF', 'error');
    } finally {
      setIsExportingSummary(false);
    }
  };

  const handleExportRowPdf = async (req) => {
    setDownloadingId(req.id);
    try {
      await downloadLeaveSlipPdf(req);
      if (showToast) showToast(`ส่งออกใบลา ${req.id} เป็น PDF สำเร็จ`, 'success');
    } catch (e) {
      console.error(e);
      if (showToast) showToast('เกิดข้อผิดพลาดในการดาวน์โหลด PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['รหัส', 'ชื่อผู้ขอ', 'ประเภทการลา', 'ช่วงวันที่', 'จำนวนวัน', 'สถานะ', 'เหตุผล'];
    const rows = filteredRequests.map((r) => [
      r.id,
      r.employeeName,
      r.type,
      `"${r.dateRange}"`,
      r.days,
      r.status,
      `"${r.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ประวัติการลา_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'อนุมัติ':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
            อนุมัติ
          </span>
        );
      case 'รออนุมัติ':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
            รออนุมัติ
          </span>
        );
      case 'ไม่อนุมัติ':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626]">
            ไม่อนุมัติ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-prompt">ประวัติการลาทั้งหมด</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจสอบรายการคำขอลา วันลาที่อนุมัติแล้ว และสถานะการพิจารณา
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportSummaryPdf}
            disabled={isExportingSummary}
            className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-[#155A32] rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-60"
            title="ส่งออกรายงานรายการทั้งหมดเป็นไฟล์ PDF"
          >
            {isExportingSummary ? (
              <div className="w-4 h-4 border-2 border-emerald-700/30 border-t-emerald-700 rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-emerald-700" />
            )}
            <span>{isExportingSummary ? 'กำลังสร้าง PDF...' : 'ส่งออกรายงาน PDF'}</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#155A32] hover:bg-[#114A29] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ยื่นคำขอลาใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'รออนุมัติ', label: 'รออนุมัติ' },
            { id: 'อนุมัติ', label: 'อนุมัติแล้ว' },
            { id: 'ไม่อนุมัติ', label: 'ไม่อนุมัติ' },
            { id: 'ยกเลิก', label: 'ยกเลิก' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#155A32] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาตามประเภท, วันที่, หรือเหตุผล..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-slate-700"
            >
              <option value="all">ประเภทการลาทั้งหมด</option>
              <option value="vacation">ลาพักร้อน</option>
              <option value="personal">ลากิจส่วนตัว</option>
              <option value="sick">ลาป่วย</option>
              <option value="maternity">ลาคลอดบุตร</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">วันที่ลา</th>
                <th className="py-3 px-4">ประเภทการลา</th>
                <th className="py-3 px-4">ผู้ยื่นคำขอ</th>
                <th className="py-3 px-4 text-center">จำนวนวัน</th>
                <th className="py-3 px-4">เหตุผล</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    ไม่พบรายการการลาที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedLeaveDetail(req)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {req.dateRange}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium">{req.type}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {req.employeeName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">
                      {req.days} วัน
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                      {req.reason}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportRowPdf(req);
                          }}
                          disabled={downloadingId === req.id}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-medium transition-colors shadow-2xs"
                          title="ดาวน์โหลดใบลาเป็น PDF"
                        >
                          {downloadingId === req.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLeaveDetail(req)}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-0.5 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <span>ดูข้อมูล</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

