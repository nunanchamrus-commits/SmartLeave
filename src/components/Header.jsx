import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  RotateCcw,
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  Info,
  XCircle,
  AlertCircle,
  X,
  User,
  Briefcase,
  Building,
  Mail,
  Phone,
  Shield,
  BadgeCheck,
  Maximize2,
} from 'lucide-react';
import { useLeave } from '../context/LeaveContext';

export default function Header({ onMenuClick }) {
  const {
    currentUser,
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
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    if (!isProfilePreviewOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsProfilePreviewOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfilePreviewOpen]);

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
    <>
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
                  notifications.map((notif) => {
                    const isRead =
                      notif.read === true ||
                      notif.read === 1 ||
                      notif.read === '1' ||
                      notif.read === 'true' ||
                      notif.isRead === true ||
                      notif.isRead === 1 ||
                      notif.isRead === '1' ||
                      notif.isRead === 'true' ||
                      notif.is_read === true ||
                      notif.is_read === 1 ||
                      notif.is_read === '1' ||
                      notif.is_read === 'true';
                    return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (isAdmin && (notif.linkUrl === '/cancel-approvals' || notif.title?.includes('ยกเลิกวันลา') || notif.title?.includes('ยกเลิกการลา'))) {
                          setActiveTab('cancel-approvals');
                          setIsNotifDropdownOpen(false);
                        } else if (isAdmin && notif.linkUrl === '/approver') {
                          setActiveTab('approver');
                          setIsNotifDropdownOpen(false);
                        }
                      }}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                        isRead ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/50 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'approved' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {(notif.type === 'pending' || notif.type === 'status') && (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'rejected' && (
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type === 'warning' && (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                        {notif.type !== 'approved' && notif.type !== 'pending' && notif.type !== 'status' && notif.type !== 'rejected' && notif.type !== 'warning' && (
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Info className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {notif.description}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {notif.time}
                        </span>
                      </div>
                      {!isRead && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                      )}
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileMenuRef}>
          <div className="flex items-center space-x-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/80 transition-colors">
            {/* คลิกที่รูปโปรไฟล์โดยตรงเพื่อเปิดดูรูปเต็มและข้อมูล */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileMenuOpen(false);
                setIsProfilePreviewOpen(true);
              }}
              className="relative group rounded-full focus:outline-none"
              title="คลิกเพื่อดูรูปโปรไฟล์เต็มและข้อมูล"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-600 shadow-sm transition-all group-hover:scale-105 cursor-pointer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#155A32] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                <Maximize2 className="w-2.5 h-2.5" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-1.5 pr-1 focus:outline-none"
            >
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-400 font-normal">
                  {currentUser.title}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* Profile Menu Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-slate-100 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsProfilePreviewOpen(true);
                  }}
                  className="flex-shrink-0 group relative rounded-full"
                  title="ดูรูปโปรไฟล์เต็ม"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-600 transition-all"
                  />
                </button>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium">เข้าสู่ระบบในชื่อ</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{currentUser.name}</p>
                  <p className="text-xs text-emerald-700 font-medium truncate">{currentUser.department}</p>
                </div>
              </div>

              {/* Menu options */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsProfilePreviewOpen(true);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>ดูรูปโปรไฟล์เต็มและข้อมูล</span>
                </button>
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
                    resetToDefault();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>รีเฟรชข้อมูลจากฐานข้อมูล</span>
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

    {/* Full Profile Photo & User Info Modal */}
    {isProfilePreviewOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setIsProfilePreviewOpen(false)}
      >
        <div
          className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 bg-[#123E24] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-prompt">ข้อมูลโปรไฟล์ผู้ใช้งาน</h3>
                <p className="text-[11px] text-emerald-200">สำนักงานสหกรณ์จังหวัดขอนแก่น</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsProfilePreviewOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Full Photo + Info */}
          <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Full Profile Image */}
            <div className="md:col-span-5 flex flex-col items-center space-y-3">
              <div className="w-full aspect-square max-w-[260px] rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-100 shadow-md flex items-center justify-center">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-contain bg-slate-900/5"
                />
              </div>
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isAdmin
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {isAdmin ? <Shield className="w-3.5 h-3.5 text-amber-600" /> : <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่ / พนักงาน'}</span>
              </span>
            </div>

            {/* Right: User Information */}
            <div className="md:col-span-7 space-y-3.5 text-xs sm:text-sm">
              <div className="pb-3 border-b border-slate-100">
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 font-prompt">
                  {currentUser.name || '-'}
                </h4>
                {currentUser.englishName && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{currentUser.englishName}</p>
                )}
                {currentUser.employeeId && (
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-mono font-semibold">
                    รหัส: {currentUser.employeeId}
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start space-x-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">ตำแหน่งงาน</span>
                    <span className="font-semibold text-slate-800">{currentUser.title || '-'}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Building className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">ฝ่าย / กลุ่มงาน</span>
                    <span className="font-semibold text-slate-800">{currentUser.department || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block">ประเภทบุคลากร</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {currentUser.employmentType || 'ข้าราชการ'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block">เพศ</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {currentUser.gender || '-'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 pt-1">
                  <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">อีเมล</span>
                    <span className="font-medium text-slate-700 break-all">{currentUser.email || '-'}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-slate-400 block">เบอร์โทรศัพท์</span>
                    <span className="font-medium text-slate-700">{currentUser.phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => {
                setIsProfilePreviewOpen(false);
                setActiveTab('settings');
              }}
              className="px-4 py-2 rounded-xl bg-[#155A32] hover:bg-[#114929] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>แก้ไขข้อมูลส่วนตัว</span>
            </button>
            <button
              type="button"
              onClick={() => setIsProfilePreviewOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/70 text-xs font-semibold transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

