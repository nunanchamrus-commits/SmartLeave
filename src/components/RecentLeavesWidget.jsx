import React from 'react';
import {
  FileText,
  ArrowRight,
  Plane,
  Briefcase,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function RecentLeavesWidget() {
  const { leaveRequests, setSelectedLeaveDetail, setActiveTab, searchQuery } = useLeave();

  // Filter requests for the current user (usr-101) or matching search
  const userRequests = leaveRequests.filter((r) => r.employeeId === 'usr-101');
  const filtered = searchQuery
    ? userRequests.filter(
        (r) =>
          r.type.includes(searchQuery) ||
          r.dateRange.includes(searchQuery) ||
          r.status.includes(searchQuery) ||
          r.reason.includes(searchQuery)
      )
    : userRequests;

  // Display top 4 matching the screenshot
  const displayRequests = filtered.slice(0, 4);

  const getLeaveIcon = (typeKey) => {
    switch (typeKey) {
      case 'vacation':
        return <Plane className="w-4 h-4 text-emerald-600 -rotate-45" />;
      case 'personal':
        return (
          <div className="relative">
            <Briefcase className="w-4 h-4 text-emerald-700" />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
              +
            </span>
          </div>
        );
      case 'sick':
        return (
          <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
          </svg>
        );
      case 'maternity':
        return (
          <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        );
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'อนุมัติ':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#E2F7E7] text-[#15803D]">
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-[#134226]">
          <FileText className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base font-prompt">
            รายการการลา ล่าสุด
          </h3>
        </div>

        <button
          onClick={() => setActiveTab('history')}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#155A32] hover:bg-[#124B2A] text-white text-xs font-medium transition-all shadow-sm group"
        >
          <span>ดูทั้งหมด</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Table Header */}
      <div className="hidden sm:grid grid-cols-12 gap-2 py-2.5 px-3 text-xs font-semibold text-slate-500 border-b border-slate-50 mt-1">
        <div className="col-span-4">วันที่ลา</div>
        <div className="col-span-3">ประเภทการลา</div>
        <div className="col-span-2 text-center">จำนวนวัน</div>
        <div className="col-span-2 text-center">สถานะ</div>
        <div className="col-span-1"></div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100 flex-1">
        {displayRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            ไม่พบรายการการลา
          </div>
        ) : (
          displayRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedLeaveDetail(req)}
              className="py-3 px-2 sm:px-3 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
            >
              {/* Date */}
              <div className="col-span-4 font-semibold text-xs sm:text-sm text-slate-800">
                {req.dateRange}
              </div>

              {/* Leave Type */}
              <div className="col-span-3 flex items-center space-x-2">
                <span className="p-1 rounded-md bg-slate-50 group-hover:bg-white transition-colors">
                  {getLeaveIcon(req.typeKey)}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {req.type}
                </span>
              </div>

              {/* Days Count */}
              <div className="col-span-2 text-left sm:text-center text-xs sm:text-sm font-medium text-slate-600">
                {req.days} วัน
              </div>

              {/* Status Badge */}
              <div className="col-span-2 flex sm:justify-center">
                {getStatusBadge(req.status)}
              </div>

              {/* Chevron Arrow */}
              <div className="col-span-1 flex justify-end">
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

