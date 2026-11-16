import React from 'react';
import HeroBanner from '../HeroBanner';
import StatCards from '../StatCards';
import CalendarWidget from '../CalendarWidget';
import RecentLeavesWidget from '../RecentLeavesWidget';

export default function DashboardView() {
  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome Banner */}
      <HeroBanner />

      {/* 2. Top 4 Stat Summary Cards */}
      <StatCards />

      {/* 3. Middle & Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 of 12 cols): Calendar */}
        <div className="lg:col-span-5 space-y-6">
          <CalendarWidget />
        </div>

        {/* Right Column (7 of 12 cols): Recent Leave Requests */}
        <div className="lg:col-span-7 space-y-6">
          <RecentLeavesWidget />
        </div>
      </div>
    </div>
  );
}

