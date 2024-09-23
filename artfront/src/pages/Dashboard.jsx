// src/pages/Dashboard.jsx
import React from 'react';
import Layout from '../components/Layout';

function Dashboard() {
  const stats = [
    { title: 'Current Orders', value: 25 },
    { title: 'In Production', value: 18 },
    { title: 'Completed Today', value: 7 },
    { title: 'Quality Issues', value: 2 },
  ];

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-medium text-gray-600 mb-2">{stat.title}</h3>
            <p className="text-3xl font-bold text-[#012A4A]">{stat.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default Dashboard;