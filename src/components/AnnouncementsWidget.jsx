import React from 'react';
import { Megaphone, ChevronRight, Volume2, Pin } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function AnnouncementsWidget() {
  const { announcements, setIsAnnouncementModalOpen } = useLeave();
  const primaryAnnouncement = (announcements || []).find((a) => a.pinned) || announcements?.[0];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center space-x-2 text-[#134226]">
          <Megaphone className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800 text-base font-prompt">
            ประกาศจากฝ่ายบุคคล
          </h3>
        </div>

        <button
          onClick={() => setIsAnnouncementModalOpen(true)}
          className="flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <span>ดูทั้งหมด</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      {/* Main Announcement Banner */}
      <div
        onClick={() => setIsAnnouncementModalOpen(true)}
        className="mt-1 flex items-start sm:items-center space-x-3.5 p-3.5 rounded-2xl bg-[#EAF7EE] border border-emerald-100/80 cursor-pointer hover:bg-emerald-100/60 transition-colors group"
      >
        {/* Speaker or Holiday icon in mint circle */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#B8E7CC] flex items-center justify-center text-[#114B27] shadow-xs group-hover:scale-105 transition-transform">
          {primaryAnnouncement?.isHoliday ? (
            <span className="text-lg select-none">🏛️</span>
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
            {primaryAnnouncement?.pinned && (
              <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200">
                <Pin className="w-2.5 h-2.5 mr-0.5 text-amber-700" />
                วันหยุดใกล้ถึง
              </span>
            )}
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              {primaryAnnouncement?.badge || 'วันหยุดนักขัตฤกษ์'}
            </span>
            {primaryAnnouncement?.date && (
              <span className="text-[10px] text-slate-500 font-medium">
                • {primaryAnnouncement.date}
              </span>
            )}
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-[#113E22] truncate">
            {primaryAnnouncement?.title}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
            {primaryAnnouncement?.content}
          </p>
        </div>
      </div>
    </div>
  );
}

