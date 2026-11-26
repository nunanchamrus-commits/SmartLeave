import React from 'react';
import {
  Home,
  CalendarPlus,
  CalendarX2,
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
  X,
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

  const pendingApprovalsCount = leaveRequests.filter(
    (r) => r.status === 'ยังไม่ยื่นเอกสาร' || r.status === 'อยู่ระหว่างตรวจสอบ'
  ).length;

  const pendingCancellationsCount = leaveRequests.filter(
    (r) => r.cancelStatus === 'pending'
  ).length;

  // Distinct navigation items for User vs Admin
  const userNavItems = [
    { id: 'dashboard', label: 'หน้าหลัก', icon: Home },
    { id: 'request', label: 'ขอลา/ยกเลิกวันลา', icon: CalendarPlus, isAction: true },
    { id: 'history', label: 'ตรวจสอบสถานะการลา', icon: FileText },
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
    {
      id: 'cancel-approvals',
      label: 'ยกเลิกวันลา',
      icon: CalendarX2,
      badge: pendingCancellationsCount > 0 ? pendingCancellationsCount : null,
    },
    { id: 'employees', label: 'จัดการพนักงาน & โควตา', icon: Users },
    { id: 'calendar', label: 'ปฏิทินการลา', icon: Calendar },
    { id: 'reports', label: 'รายงานสถิติการลา', icon: BarChart3 },
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-[#2E6F4E] via-[#347B57] to-[#2B6849] text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-hidden ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* ==================== MODERN LUXURY LAYERED PATTERNS (เรียบหรู ไม่มีจุด) ==================== */}
        {/* Layer 1: Ultra-Fine Architectural Diagonal Silk Lines */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-[0.055]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="sidebar-luxury-lines"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(35)"
              >
                <line x1="0" y1="0" x2="0" y2="28" stroke="white" strokeWidth="0.9" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sidebar-luxury-lines)" />
          </svg>
        </div>

        {/* Layer 2: Velvety Ambient Silk Light Glows */}
        <div className="absolute -top-20 -right-16 w-60 h-60 rounded-full bg-emerald-200/15 blur-3xl pointer-events-none select-none" />
        <div className="absolute bottom-1/4 -left-24 w-56 h-56 rounded-full bg-teal-200/12 blur-3xl pointer-events-none select-none" />

        {/* Layer 3: Top-Right Sleek Architectural Sweeping Arcs */}
        <div className="absolute top-0 right-0 w-60 h-52 pointer-events-none select-none opacity-[0.14]">
          <svg viewBox="0 0 240 200" fill="none" className="w-full h-full text-white">
            <path d="M55 -15 C 110 55, 175 40, 250 85" stroke="currentColor" strokeWidth="1.1" />
            <path d="M25 -15 C 95 75, 165 62, 250 112" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
            <path d="M0 -10 C 82 95, 155 86, 250 140" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
            <circle cx="195" cy="25" r="58" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
            <circle cx="195" cy="25" r="88" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>

        {/* Layer 4: Subtle Diagonal Glass Sheen Overlay */}
        <div
          className="absolute inset-0 pointer-events-none select-none opacity-[0.09]"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 42%, rgba(255,255,255,0.14) 78%, rgba(255,255,255,0) 100%)',
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-7 pb-5 px-6">
          {/* Mobile Close Button */}
          {setMobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors"
              title="ปิดเมนู"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="relative mb-3 group cursor-pointer" onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'dashboard')}>
            <div className="w-20 h-20 rounded-full bg-white/15 p-2 shadow-md shadow-emerald-950/20 border-2 border-white/30 backdrop-blur-xs flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="สำนักงานสหกรณ์จังหวัดขอนแก่น"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-prompt text-center">
            SmartLeave
          </h1>
          <p className="text-[11px] font-medium text-emerald-50/90 tracking-wide mt-0.5 text-center leading-tight">
            สำนักงานสหกรณ์จังหวัดขอนแก่น
          </p>
          <span className="text-[9.5px] text-emerald-100/80 text-center block mt-0.5">
            ระบบจัดการวันเวลาของการลา
          </span>

          {/* Current Role Badge */}
          <div className="mt-3 w-full">
            <div
              className={`py-1.5 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-1.5 backdrop-blur-xs ${
                isAdmin
                  ? 'bg-amber-300/20 text-amber-100 border border-amber-200/35'
                  : 'bg-white/15 text-emerald-50 border border-white/25'
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-300" />
                  <span>โหมด: ผู้ดูแลระบบ (Admin)</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-emerald-200" />
                  <span>โหมด: พนักงาน (User)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sleek Modern Glass Hairline Divider */}
        <div className="relative z-10 px-6 pointer-events-none select-none">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        {/* Navigation Items */}
        <nav className="relative z-10 flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm translate-x-1 backdrop-blur-xs border border-white/15'
                    : 'text-emerald-50/90 hover:bg-white/15 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1.5">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 text-lime-200' : 'text-emerald-100/85 group-hover:scale-110 group-hover:text-white'
                    }`}
                  />
                  <span className="transition-transform duration-200 ease-out group-hover:translate-x-1 inline-block">
                    {item.label}
                  </span>
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

        {/* Logout & Footer Section with Modern Layered Wave Curves */}
        <div className="relative z-10 px-4 py-4 border-t border-white/15 overflow-hidden">
          {/* Layer 4: Sleek Layered Translucent Ribbon Waves */}
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none select-none opacity-[0.16]">
            <svg viewBox="0 0 260 96" preserveAspectRatio="none" fill="none" className="w-full h-full text-white">
              <path
                d="M0 58 C 65 28, 130 82, 200 44 C 228 28, 248 34, 260 40 L260 96 L0 96 Z"
                fill="currentColor"
                opacity="0.45"
              />
              <path
                d="M0 72 C 70 48, 145 92, 220 56 C 240 46, 252 50, 260 54 L260 96 L0 96 Z"
                fill="currentColor"
                opacity="0.65"
              />
              <path
                d="M0 44 C 75 18, 140 70, 260 26"
                stroke="currentColor"
                strokeWidth="1.2"
                opacity="0.7"
              />
            </svg>
          </div>

          <button
            onClick={() => {
              if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                logout();
              }
            }}
            className="group w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-emerald-50/90 hover:bg-white/15 hover:text-white transition-all duration-200 relative z-10"
          >
            <div className="flex items-center space-x-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1.5">
              <LogOut className="w-5 h-5 text-lime-200 transition-transform duration-200 group-hover:scale-110" />
              <span className="transition-transform duration-200 ease-out group-hover:translate-x-1 inline-block">
                ออกจากระบบ
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
