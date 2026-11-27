import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import LeaveSummaryTable from '../LeaveSummaryTable';

export default function LeaveSummaryView() {
  const { leaveRequests } = useLeave();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-[#2F855A]">
              HR & Organization Records
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-prompt mt-1 flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-[#2F855A]" />
            <span>ตารางสรุปการลา</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            รวบรวมข้อมูลประวัติการขอลาทั้งหมดในองค์กร ค้นหา กรองสถานะ และส่งออกรายงานเป็นไฟล์ Excel หรือ PDF
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100">
        <LeaveSummaryTable requests={leaveRequests} />
      </div>
    </div>
  );
}
