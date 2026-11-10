import React from 'react';
import { X, Megaphone, Volume2, Calendar, Pin } from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function AnnouncementsModal() {
  const { announcements, isAnnouncementModalOpen, setIsAnnouncementModalOpen } = useLeave();

  if (!isAnnouncementModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#123E24] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base font-prompt">ประกาศจากฝ่ายทรัพยากรบุคคล (HR)</h3>
          </div>
          <button
            onClick={() => setIsAnnouncementModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Announcements */}
        <div className="p-6 overflow-y-auto space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-4 rounded-2xl border transition-all ${
                ann.pinned
                  ? 'bg-emerald-50/60 border-emerald-200 shadow-xs'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                    <Volume2 className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {ann.badge}
                  </span>
                  {ann.pinned && (
                    <span className="flex items-center text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                      <Pin className="w-2.5 h-2.5 mr-0.5" /> ปักหมุด
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{ann.date}</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 leading-snug">
                {ann.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {ann.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => setIsAnnouncementModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

