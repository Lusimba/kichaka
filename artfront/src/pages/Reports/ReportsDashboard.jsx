// src/pages/Reports/ReportsDashboard.jsx
import React, { useState, useMemo } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { salesPerformance, productionEfficiency, artistPerformance } from '../../components/data';
import Pagination from '../../components/Pagination';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const ReportsDashboard = () => {
  const [selectedDataset, setSelectedDataset] = useState('salesPerformance');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const datasetOptions = [
    { value: 'salesPerformance', label: 'Sales Performance' },
    { value: 'productionEfficiency', label: 'Production Efficiency' },
    { value: 'artistPerformance', label: 'Artist Performance' },
  ];

  const tableData = useMemo(() => {
    switch (selectedDataset) {
      case 'salesPerformance':
        return salesPerformance;
      case 'productionEfficiency':
        return productionEfficiency;
      case 'artistPerformance':
        return artistPerformance;
      default:
        return [];
    }
  }, [selectedDataset]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [tableData, currentPage]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const renderTable = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {Object.keys(paginatedData[0]).map((key) => (
            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {paginatedData.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, cellIndex) => (
              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderChart = () => {
    switch (selectedDataset) {
      case 'salesPerformance':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Revenue Over Time</h3>
            <Line 
              data={{
                labels: salesPerformance.map(item => item.month),
                datasets: [
                  {
                    label: 'Revenue',
                    data: salesPerformance.map(item => item.revenue),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  }
                ]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Revenue ($)'
                    }
                  }
                }
              }}
            />
            <h3 className="text-xl font-semibold mb-4 mt-8">Orders Over Time</h3>
            <Line 
              data={{
                labels: salesPerformance.map(item => item.month),
                datasets: [
                  {
                    label: 'Orders',
                    data: salesPerformance.map(item => item.orders),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                  }
                ]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Orders'
                    }
                  }
                }
              }}
            />
          </div>
        );
      case 'productionEfficiency':
        return (
          <Bar 
            data={{
              labels: productionEfficiency.map(item => item.product),
              datasets: [
                {
                  label: 'Average Production Time',
                  data: productionEfficiency.map(item => item.averageProductionTime),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                  label: 'Rejection Rate',
                  data: productionEfficiency.map(item => item.rejectionRate * 100),
                  backgroundColor: 'rgba(255, 99, 132, 0.6)',
                }
              ]
            }}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Value'
                  }
                }
              }
            }}
          />
        );
      case 'artistPerformance':
        return (
          <Pie 
            data={{
              labels: artistPerformance.map(item => item.name),
              datasets: [
                {
                  data: artistPerformance.map(item => item.totalRevenue),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                  ],
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Artist Revenue Distribution'
                }
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Reports Dashboard</h1>
      <div className="mb-4">
        <select 
          value={selectedDataset} 
          onChange={(e) => {
            setSelectedDataset(e.target.value);
            setCurrentPage(1);
          }}
          className="block w-full p-2 border rounded"
        >
          {datasetOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2">
          <div className="overflow-x-auto">
            {renderTable()}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        <div className="w-full lg:w-1/2">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;