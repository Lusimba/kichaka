// src/components/Inventory/SummaryCard.jsx
import React from 'react';

function SummaryCard({ icon, title, value, color = "text-blue-500", onClick }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer" onClick={onClick}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;