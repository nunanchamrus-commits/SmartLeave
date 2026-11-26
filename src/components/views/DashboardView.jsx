import React from 'react';
import StatCards from '../StatCards';

export default function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Leave Quota Cards */}
      <StatCards />
    </div>
  );
}
