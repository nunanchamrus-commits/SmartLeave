import React from 'react';
import {
  Home,
  CalendarPlus,
  FileText,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  CheckSquare,
  Shield,
  User,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    leaveRequests,
    setIsRequestModalOpen,
    logout,
    isAdmin,
  } = useLeave();

  const pendingApprovalsCount = leaveRequests.filter((r) => r.status === 'รออนุมัติ').length;

  // Distinct navigation items for User vs Admin
  const userNavItems = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Home },
    { id: 'request', label: 'ขอลา', icon: CalendarPlus, isAction: true },
    { id: 'history', label: 'ประวัติการลา', icon: FileText },
    { id: 'calendar', label: 'ปฏิทินการลา', icon: Calendar },
    { id: 'settings', label: 'ข้อมูลส่วนตัว', icon: Settings },
  ];

  const adminNavItems = [
    { id: 'dashboard', label: 'แดชบอร์ดผู้ดูแล', icon: LayoutDashboard },
    {
      id: 'approver',
      label: 'จัดการคำขอลา',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
    },
    { id: 'employees', label: 'จัดการพนักงาน & โควตา', icon: Users },
    { id: 'calendar', label: 'ปฏิทินองค์กร', icon: Calendar },
    { id: 'reports', label: 'รายงานสถิติองค์กร', icon: BarChart3 },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleNavClick = (item) => {
    if (item.isAction) {
      setIsRequestModalOpen(true);
    } else {
      setActiveTab(item.id);
    }
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#123E24] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center pt-7 pb-5 px-6 border-b border-emerald-900/40">
          <div className="relative mb-3 group cursor-pointer" onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'dashboard')}>
            <div className="w-16 h-16 rounded-full bg-white/10 p-1.5 shadow-lg shadow-emerald-950/40 border-2 border-white/25 backdrop-blur-xs flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="สำนักงานสหกรณ์จังหวัดขอนแก่น"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime-400 rounded-full flex items-center justify-center text-[#123E24] shadow-sm text-[10px] font-bold border border-emerald-900">
              ✓
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-prompt text-center">
            SmartLeave
          </h1>
          <p className="text-[11px] font-medium text-emerald-200/90 tracking-wide mt-0.5 text-center leading-tight">
            สำนักงานสหกรณ์จังหวัดขอนแก่น
          </p>
          <span className="text-[9.5px] text-emerald-300/70 text-center block mt-0.5">
            ระบบจัดการวันเวลาของการลา
          </span>

          {/* Current Role Badge */}
          <div className="mt-3 w-full">
            <div
              className={`py-1.5 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-1.5 ${
                isAdmin
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>โหมด: ผู้ดูแลระบบ (Admin)</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>โหมด: พนักงาน (User)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#2A6A48] text-white shadow-md shadow-emerald-950/20 translate-x-1'
                    : 'text-emerald-100/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-emerald-300' : 'text-emerald-200/80'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-amber-400 text-amber-950 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout & Footer Section */}
        <div className="px-4 py-4 border-t border-emerald-900/40 relative overflow-hidden">
          {/* Subtle leafy background shapes */}
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-emerald-800/30 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none" />

          {/* Decorative leaf SVG */}
          <div className="absolute bottom-0 left-0 w-36 h-28 pointer-events-none opacity-20">
            <svg viewBox="0 0 120 100" fill="none" className="w-full h-full text-emerald-300">
              <path d="M10,95 Q40,30 110,35 Q60,85 10,95 Z" fill="currentColor" />
              <path d="M5,95 Q20,50 80,60 Q40,90 5,95 Z" fill="currentColor" opacity="0.6" />
            </svg>
          </div>

          <button
            onClick={() => {
              if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                logout();
              }
            }}
            className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium text-emerald-200/80 hover:bg-white/10 hover:text-white transition-colors relative z-10"
          >
            <LogOut className="w-5 h-5 text-emerald-300" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
