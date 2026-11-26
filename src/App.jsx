import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { LeaveProvider, useLeave } from './context/LeaveContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ForgotPasswordView from './components/ForgotPasswordView';
import PdpaConsentView from './components/PdpaConsentView';
import DashboardView from './components/views/DashboardView';
import AdminDashboardView from './components/views/AdminDashboardView';
import AdminEmployeesView from './components/views/AdminEmployeesView';
import LeaveHistoryView from './components/views/LeaveHistoryView';
import CalendarView from './components/views/CalendarView';
import ApproverView from './components/views/ApproverView';
import AdminCancelApprovalsView from './components/views/AdminCancelApprovalsView';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';
import LeaveRequestModal from './components/LeaveRequestModal';
import LeaveDetailModal from './components/LeaveDetailModal';
import AnnouncementsModal from './components/AnnouncementsModal';
import MobileBottomNav from './components/MobileBottomNav';

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeTab, isAdmin } = useLeave();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? <AdminDashboardView /> : <DashboardView />;
      case 'employees':
        return <AdminEmployeesView />;
      case 'history':
        return <LeaveHistoryView />;
      case 'calendar':
      case 'holidays':
        return <CalendarView />;
      case 'approver':
        return <ApproverView />;
      case 'cancel-approvals':
        return <AdminCancelApprovalsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return isAdmin ? <AdminDashboardView /> : <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-[#F4F7F5] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Content Body */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-24 lg:pb-10">
          <div className="max-w-7xl mx-auto">
            <div key={activeTab} className="animate-fade-in-up">
              {renderActiveView()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMoreClick={() => setMobileMenuOpen(true)} />

      {/* Global Interactive Modals */}
      <LeaveRequestModal />
      <LeaveDetailModal />
      <AnnouncementsModal />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isPdpaAccepted, toast } = useLeave();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot-password'

  // Reset authMode to login once user logs in, so future logouts go back to login screen
  useEffect(() => {
    if (isAuthenticated) {
      setAuthMode('login');
    }
  }, [isAuthenticated]);

  const renderScreen = () => {
    if (!isAuthenticated) {
      if (authMode === 'register') {
        return <RegisterView onSwitchToLogin={() => setAuthMode('login')} />;
      }
      if (authMode === 'forgot-password') {
        return <ForgotPasswordView onSwitchToLogin={() => setAuthMode('login')} />;
      }
      return (
        <LoginView
          onSwitchToRegister={() => setAuthMode('register')}
          onSwitchToForgotPassword={() => setAuthMode('forgot-password')}
        />
      );
    }

    if (!isPdpaAccepted) {
      return <PdpaConsentView />;
    }

    return <MainLayout />;
  };

  return (
    <>
      {renderScreen()}

      {/* Global Toast Notification */}
      {toast?.show && (
        <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-[#2E6F4E] text-white border-emerald-800/50'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <LeaveProvider>
      <AppContent />
    </LeaveProvider>
  );
}
