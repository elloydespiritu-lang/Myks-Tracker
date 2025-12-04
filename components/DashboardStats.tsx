import React from 'react';

interface StatsData {
  totalWagered: number;
  netProfit: number;
  roi: number;
  winRate: number;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

interface DashboardStatsProps {
  stats: StatsData;
}

const StatCard: React.FC<{ title: string; value: string; colorClass: string; isPrimary?: boolean; }> = ({ title, value, colorClass, isPrimary = false }) => (
  <div className={`bg-gray-800 rounded-lg shadow-lg transition-transform hover:scale-105 ${isPrimary ? 'p-6' : 'p-4'}`}>
    <h3 className={`font-medium text-gray-400 ${isPrimary ? 'text-base' : 'text-sm'}`}>{title}</h3>
    <p className={`font-semibold ${colorClass} ${isPrimary ? 'text-4xl mt-1' : 'text-2xl'}`}>{value}</p>
  </div>
);

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-6 mb-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Balance" 
          value={`₱${stats.balance.toFixed(2)}`} 
          colorClass={stats.balance >= 0 ? 'text-blue-400' : 'text-red-400'} 
          isPrimary
        />
        <StatCard 
          title="Net Profit" 
          value={`${stats.netProfit >= 0 ? '+' : ''}₱${stats.netProfit.toFixed(2)}`} 
          colorClass={stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'} 
          isPrimary
        />
        <StatCard 
          title="ROI (Settled)" 
          value={`${stats.roi.toFixed(1)}%`} 
          colorClass={stats.roi >= 0 ? 'text-green-400' : 'text-red-400'} 
          isPrimary
        />
      </div>
      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Deposits" 
          value={`₱${stats.totalDeposits.toFixed(2)}`} 
          colorClass="text-green-400" 
        />
        <StatCard 
          title="Total Withdrawals" 
          value={`₱${stats.totalWithdrawals.toFixed(2)}`} 
          colorClass="text-red-400" 
        />
        <StatCard 
          title="Total Wagered" 
          value={`₱${stats.totalWagered.toFixed(2)}`} 
          colorClass="text-gray-300" 
        />
        <StatCard 
          title="Win Rate" 
          value={`${stats.winRate.toFixed(1)}%`} 
          colorClass="text-yellow-400" 
        />
      </div>
    </div>
  );
};