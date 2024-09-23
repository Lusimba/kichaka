// src/pages/Payroll/components/SummaryCards.jsx
import React from 'react';

const SummaryCard = ({ title, value, icon, onClick, active }) => (
  <div 
    className={`p-4 rounded shadow cursor-pointer ${active ? 'bg-blue-100' : 'bg-white hover:bg-gray-100'}`} 
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      <div className="text-right">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const SummaryCards = ({ totalRevenueThisMonth, totalAnnualRevenue, totalItemsThisMonth, activeTab, handleTileClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <SummaryCard 
      title="Totals This Month" 
      value={`KES. ${totalRevenueThisMonth.toLocaleString()}`} 
      icon="📊" 
      onClick={() => handleTileClick('Totals This Month')} 
      active={activeTab === 'Totals This Month'} 
    />
    <SummaryCard 
      title="Bonuses" 
      value={`Bonuses Paid This Year`} 
      icon="🎉" 
      onClick={() => handleTileClick('Bonuses')} 
      active={activeTab === 'Bonuses'} 
    />
    {/* <SummaryCard 
      title="Annual Revenues" 
      value={`KES. ${totalAnnualRevenue.toLocaleString()}`} 
      icon="💰" 
      onClick={() => handleTileClick('Annual Revenues')} 
      active={activeTab === 'Annual Revenues'} 
    /> */}
  </div>
);

export default SummaryCards;