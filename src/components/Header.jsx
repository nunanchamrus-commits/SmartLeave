import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  UserCheck,
  RotateCcw,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  Info,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function Header({ onMenuClick }) {
  const {
    currentUser,
    switchRole,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    resetToDefault,
    setActiveTab,
    logout,
    isAdmin,
  } = useLeave();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const monthsThaiShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const formattedHeaderDate = `${currentDateTime.getDate()} ${monthsThaiShort[currentDateTime.getMonth()]} ${currentDateTime.getFullYear() + 543}`;
  const formattedHeaderTime = currentDateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#F4F7F5]/90 backdrop-blur-md">
      {/* Left: Mobile Menu + Search bar */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
          title="เปิดเมนู"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-2 lg:hidden flex-shrink-0">
          <img
            src="/logo.png"
            alt="โลโก้สำนักงานสหกรณ์จังหวัดขอนแก่น"
            className="w-8 h-8 object-contain"
          />
        </div>

        {/* Pill Search Input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-sm text-slate-700 placeholder-slate-400 shadow-sm border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Real-time Clock Badge */}
        <div className="hidden xl:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-600 font-medium">{formattedHeaderDate}</span>
          <span className="font-mono font-bold text-[#155A32] pl-1.5 border-l border-slate-200">
            {formattedHeaderTime} น.
          </span>
        </div>

        {/* Quick Role Switcher Pill (Compare User vs Admin in 1 Click) */}
        <button
          onClick={() => switchRole(isAdmin ? 'employee' : 'approver')}
          className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border ${
            isAdmin
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
          }`}
          title="คลิกเพื่อสลับบทบาทดูความแตกต่างทันที"
        >
          <span>{isAdmin ? '👑 มุมมอง: Admin (ผู้ดูแล)' : '👤 มุมมอง: User (พนักงาน)'}</span>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full shadow-2xs font-semibold text-slate-700">
            สลับเป็น {isAdmin ? 'User' : 'Admin'} ➔
          </span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="relative p-2.5 bg-white rounded-full border border-slate-200/80 shadow-sm text-slate-600 hover:text-emerald-700 hover:border-emerald-200 transition-all focus:outline-none"
            title="การแจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full border-2 border-white shadow-sm animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-slate-800">การแจ้งเตือน</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} ใหม่
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    อ่านทั้งหมด
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">
                    ไม่มีการแจ้งเตือนใหม่
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                        notif.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/50 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'approved' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'pending' && (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'info' && (
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Info className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${notif.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {notif.description}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {notif.time}
                        </span>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center space-x-3 pl-1 pr-2.5 py-1 rounded-full hover:bg-white/80 transition-colors focus:outline-none"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-sm"
            />
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-xs text-slate-400 font-normal">
                {currentUser.title}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {/* Profile Menu Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium">เข้าสู่ระบบในชื่อ</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{currentUser.name}</p>
                <p className="text-xs text-emerald-700 font-medium">{currentUser.department}</p>
              </div>

              {/* Role Switcher */}
              <div className="p-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                  สลับบทบาททดสอบระบบ (Demo Role)
                </p>
                <button
                  onClick={() => {
                    switchRole('employee');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                    currentUser.role === 'employee'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>นางสาวพนิกา (พนักงาน)</span>
                  </div>
                  {currentUser.role === 'employee' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </button>
                <button
                  onClick={() => {
                    switchRole('approver');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between mt-1 ${
                    currentUser.role === 'approver'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>นายสมชาย (ผู้อนุมัติ/ผู้จัดการ)</span>
                  </div>
                  {currentUser.role === 'approver' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </button>
              </div>

              {/* Menu options */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>การตั้งค่าข้อมูลส่วนตัว</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('ต้องการรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                      resetToDefault();
                      setIsProfileMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>รีเซ็ตข้อมูลระบบเป็นค่าเริ่มต้น</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                      setIsProfileMenuOpen(false);
                      logout();
                    }
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

