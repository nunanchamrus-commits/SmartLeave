import React from 'react';
import HeroBanner from '../HeroBanner';
import StatCards from '../StatCards';
import CalendarWidget from '../CalendarWidget';
import AnnouncementsWidget from '../AnnouncementsWidget';
import RecentLeavesWidget from '../RecentLeavesWidget';
import QuickActionBanner from '../QuickActionBanner';

export default function DashboardView() {
  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Banner */}
      <HeroBanner />

      {/* 2. Top 4 Stat Summary Cards */}
      <StatCards />

      {/* 3. Middle & Bottom Grid (Matches the screenshot layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 of 12 cols): Calendar + HR Announcement */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <CalendarWidget />
          <AnnouncementsWidget />
        </div>

        {/* Right Column (7 of 12 cols): Recent Leave Requests + Action Banner */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <RecentLeavesWidget />
          <QuickActionBanner />
        </div>
      </div>
    </div>
  );
}

