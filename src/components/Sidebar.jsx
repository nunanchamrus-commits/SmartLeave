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
        {/* ==================== MULTI-LAYER DECORATIVE PATTERNS ==================== */}
        {/* Layer 1: Base Khon Kaen Mudmee / Geometric Ikat Pattern (ทั้งแถบแบบจางละมุน) */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-[0.075]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="sidebar-mudmee-pattern"
                width="36"
                height="36"
                patternUnits="userSpaceOnUse"
              >
                {/* ข้าวหลามตัดมัดหมี่ */}
                <path
                  d="M18 2 L34 18 L18 34 L2 18 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.9"
                />
                <path
                  d="M18 9 L27 18 L18 27 L9 18 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.7"
                />
                <circle cx="18" cy="18" r="1.6" fill="white" />
                <circle cx="0" cy="0" r="1.2" fill="white" />
                <circle cx="36" cy="0" r="1.2" fill="white" />
                <circle cx="0" cy="36" r="1.2" fill="white" />
                <circle cx="36" cy="36" r="1.2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sidebar-mudmee-pattern)" />
          </svg>
        </div>

        {/* Layer 2: Top-Right Soft Concentric Waves & Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 pointer-events-none select-none">
          <div className="absolute inset-4 rounded-full bg-emerald-200/15 blur-2xl" />
          <svg viewBox="0 0 180 180" fill="none" className="w-full h-full text-white opacity-[0.14]">
            <circle cx="145" cy="35" r="32" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
            <circle cx="145" cy="35" r="56" stroke="currentColor" strokeWidth="0.9" />
            <circle cx="145" cy="35" r="82" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 6" />
            <circle cx="145" cy="35" r="108" stroke="currentColor" strokeWidth="0.6" />
            {/* เส้นคลื่นโค้งด้านบน */}
            <path d="M10 42 Q 55 18, 95 45 T 175 30" stroke="currentColor" strokeWidth="1" opacity="0.7" />
            <path d="M20 56 Q 65 32, 105 58 T 175 46" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
          </svg>
        </div>

        {/* Layer 3: Mid-Side Subtle Flowing Leaf Vein Silhouette */}
        <div className="absolute top-1/2 -left-10 -translate-y-1/2 w-36 h-64 pointer-events-none select-none opacity-[0.08]">
          <svg viewBox="0 0 120 220" fill="none" className="w-full h-full text-emerald-100">
            <path d="M18 210 C 48 155, 40 85, 82 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M40 160 C 12 148, 12 124, 42 130 C 52 138, 48 152, 40 160 Z" fill="currentColor" />
            <path d="M47 122 C 80 112, 92 86, 62 84 C 48 92, 44 110, 47 122 Z" fill="currentColor" />
            <path d="M56 84 C 28 70, 32 46, 62 56 C 68 66, 62 76, 56 84 Z" fill="currentColor" />
            <path d="M72 48 C 96 42, 102 22, 82 22 C 70 28, 68 40, 72 48 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-7 pb-5 px-6">
          <div className="relative mb-3 group cursor-pointer" onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'dashboard')}>
            <div className="w-16 h-16 rounded-full bg-white/15 p-1.5 shadow-md shadow-emerald-950/20 border-2 border-white/30 backdrop-blur-xs flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="สำนักงานสหกรณ์จังหวัดขอนแก่น"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime-300 rounded-full flex items-center justify-center text-[#2E6F4E] shadow-sm text-[10px] font-bold border border-white/40">
              ✓
            </span>
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
              className={`py-1.5 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-1.5 ${
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

        {/* Layer 4: Thai Mudmee Diamond Ornament Divider */}
        <div className="relative z-10 px-5 pointer-events-none select-none flex items-center space-x-2 opacity-60">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/40 to-white/60" />
          <svg width="28" height="10" viewBox="0 0 28 10" fill="none" className="text-emerald-100 flex-shrink-0">
            <path d="M2 5 L6 2 L10 5 L6 8 Z" fill="currentColor" opacity="0.65" />
            <path d="M14 1 L19 5 L14 9 L9 5 Z" fill="currentColor" />
            <path d="M18 5 L22 2 L26 5 L22 8 Z" fill="currentColor" opacity="0.65" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/40 to-white/60" />
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

        {/* Logout & Footer Section with Layered Botanical Leaves + Cooperative Rice Stalks */}
        <div className="relative z-10 px-4 py-4 border-t border-white/15 overflow-hidden">
          {/* Soft ambient glow */}
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-lime-200/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Bottom-Left: Botanical Leaves SVG */}
          <div className="absolute bottom-0 left-0 w-36 h-24 pointer-events-none select-none opacity-[0.18]">
            <svg viewBox="0 0 140 100" fill="none" className="w-full h-full text-emerald-100">
              <path d="M8,96 Q40,28 112,34 Q62,84 8,96 Z" fill="currentColor" />
              <path d="M8,96 Q54,58 106,36" stroke="#2B6849" strokeWidth="1.2" opacity="0.5" />
              <path d="M2,96 Q18,52 78,62 Q38,90 2,96 Z" fill="currentColor" opacity="0.65" />
            </svg>
          </div>

          {/* Bottom-Right: Cooperative Rice / Wheat Stalk SVG */}
          <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none select-none opacity-[0.16]">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-lime-100">
              <path d="M84 98 C 76 68, 62 42, 42 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <ellipse cx="47" cy="24" rx="5" ry="2.6" transform="rotate(-38 47 24)" fill="currentColor" />
              <ellipse cx="56" cy="34" rx="5.5" ry="2.8" transform="rotate(-32 56 34)" fill="currentColor" />
              <ellipse cx="64" cy="46" rx="5.5" ry="2.8" transform="rotate(-26 64 46)" fill="currentColor" />
              <ellipse cx="71" cy="59" rx="5.5" ry="2.8" transform="rotate(-20 71 59)" fill="currentColor" />
              <ellipse cx="38" cy="33" rx="5" ry="2.6" transform="rotate(35 38 33)" fill="currentColor" opacity="0.8" />
              <ellipse cx="47" cy="45" rx="5.5" ry="2.8" transform="rotate(32 47 45)" fill="currentColor" opacity="0.8" />
              <ellipse cx="55" cy="58" rx="5.5" ry="2.8" transform="rotate(28 55 58)" fill="currentColor" opacity="0.8" />
              <ellipse cx="63" cy="71" rx="5.5" ry="2.8" transform="rotate(24 63 71)" fill="currentColor" opacity="0.8" />
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
