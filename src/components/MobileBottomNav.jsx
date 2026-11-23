import React from 'react';
import {
  Home,
  CalendarPlus,
  CalendarX2,
  FileText,
  Calendar,
  Users,
  LayoutDashboard,
  CheckSquare,
  Menu,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function MobileBottomNav({ onMoreClick }) {
  const {
    activeTab,
    setActiveTab,
    setIsRequestModalOpen,
    isAdmin,
    leaveRequests,
  } = useLeave();

  const pendingApprovalsCount = (leaveRequests || []).filter(
    (r) => r.status === 'ยังไม่ยื่นเอกสาร' || r.status === 'อยู่ระหว่างตรวจสอบ' || r.status === 'รออนุมัติ'
  ).length;

  const pendingCancellationsCount = (leaveRequests || []).filter(
    (r) => r.cancelStatus === 'pending'
  ).length;

  // เมนูนำทางด้านล่างสำหรับ User ปกติ
  const userItems = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Home },
    { id: 'history', label: 'สถานะลา', icon: FileText },
    { id: 'request', label: 'ขอลา', icon: CalendarPlus, isAction: true },
    { id: 'calendar', label: 'ปฏิทิน', icon: Calendar },
    { id: 'more', label: 'เพิ่มเติม', icon: Menu, isMore: true },
  ];

  // เมนูนำทางด้านล่างสำหรับ Admin / ผู้อนุมัติ
  const adminItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    {
      id: 'approver',
      label: 'พิจารณาลา',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
    },
    {
      id: 'cancel-approvals',
      label: 'ยกเลิกวันลา',
      icon: CalendarX2,
      badge: pendingCancellationsCount > 0 ? pendingCancellationsCount : null,
    },
    { id: 'employees', label: 'พนักงาน', icon: Users },
    { id: 'more', label: 'เมนูหลัก', icon: Menu, isMore: true },
  ];

  const items = isAdmin ? adminItems : userItems;

  const handleClick = (item) => {
    if (item.isMore) {
      if (onMoreClick) onMoreClick();
    } else if (item.isAction) {
      setIsRequestModalOpen(true);
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <nav
      aria-label="เมนูหลักสำหรับโทรศัพท์มือถือ"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden px-2 pt-1 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] select-none"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isAction && !item.isMore && activeTab === item.id;

          // ปุ่มเด่นตรงกลางสำหรับ "ขอลา"
          if (item.isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleClick(item)}
                className="flex flex-col items-center justify-center -mt-4 group focus:outline-hidden"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1E5638] to-[#2F855A] text-white flex items-center justify-center shadow-lg shadow-emerald-900/25 group-active:scale-95 transition-transform border-2 border-white">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold text-[#1E5638] mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative group focus:outline-hidden ${
                isActive
                  ? 'text-[#2F855A]'
                  : 'text-slate-500 hover:text-slate-800 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-active:scale-90 ${
                    isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 truncate max-w-[60px] ${
                  isActive ? 'font-bold text-[#2F855A]' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F855A] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
