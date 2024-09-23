// src/pages/Payroll/components/RecentActivities.jsx
import React from 'react';

const RecentActivities = ({ activities }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Revenue Growth Graph (Annual)</h2>
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-start space-x-3 bg-white p-3 rounded shadow">
          <span className="text-2xl">{activity.icon}</span>
          <div>
            <p className="font-medium">{activity.message}</p>
            <p className="text-sm text-gray-500">{activity.time}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentActivities;