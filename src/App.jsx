import React, { useState } from 'react';
import { LeaveProvider, useLeave } from './context/LeaveContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import DashboardView from './components/views/DashboardView';
import AdminDashboardView from './components/views/AdminDashboardView';
import AdminEmployeesView from './components/views/AdminEmployeesView';
import LeaveHistoryView from './components/views/LeaveHistoryView';
import CalendarView from './components/views/CalendarView';
import ApproverView from './components/views/ApproverView';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';
import LeaveRequestModal from './components/LeaveRequestModal';
import LeaveDetailModal from './components/LeaveDetailModal';
import AnnouncementsModal from './components/AnnouncementsModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';

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
        return <CalendarView />;
      case 'approver':
        return <ApproverView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return isAdmin ? <AdminDashboardView /> : <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F7F5] overflow-hidden">
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
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <LeaveRequestModal />
      <LeaveDetailModal />
      <AnnouncementsModal />
      <PrivacyPolicyModal />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useLeave();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterView onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginView onSwitchToRegister={() => setAuthMode('register')} />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <LeaveProvider>
      <AppContent />
    </LeaveProvider>
  );
}
