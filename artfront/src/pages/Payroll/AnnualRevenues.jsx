// src/pages/Payroll/AnnualRevenues.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { format, parse, getYear } from 'date-fns';
import Pagination from '../../components/Pagination';
import { artistData } from './data';

const AnnualRevenues = ({ selectedYear, setSelectedYear }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset currentPage to 1 when selectedYear changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear]);

  const annualData = useMemo(() => {
    const monthlyData = artistData.flatMap(artist => 
      artist.items.map(item => ({
        ...item,
        artist: artist.name
      }))
    );

    const yearData = monthlyData.filter(item => getYear(parse(item.dateCompleted, 'yyyy-MM-dd', new Date())) === selectedYear);

    const monthlyRevenue = yearData.reduce((acc, item) => {
      const month = format(parse(item.dateCompleted, 'yyyy-MM-dd', new Date()), 'MMMM');
      if (!acc[month]) {
        acc[month] = { revenue: 0, items: {} };
      }
      acc[month].revenue += item.cost;
      acc[month].items[item.itemName] = (acc[month].items[item.itemName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyRevenue)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        mostSoldItem: Object.entries(data.items).reduce((a, b) => a[1] > b[1] ? a : b)[0]
      }))
      .filter(month => month.revenue > 0)
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [selectedYear]);

  const totalRevenue = annualData.reduce((sum, month) => sum + month.revenue, 0);

  const totalPages = Math.ceil((annualData.length + 1) / itemsPerPage);  // +1 for total row
  const paginatedData = annualData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const years = [...new Set(artistData.flatMap(artist => 
    artist.items.map(item => getYear(parse(item.dateCompleted, 'yyyy-MM-dd', new Date())))
  ))].sort((a, b) => b - a);

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    setCurrentPage(1);  // Reset to first page when year changes
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <label htmlFor="year-select" className="mr-2">Select Year:</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={handleYearChange}
          className="border rounded px-2 py-1"
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="border-b bg-white">
            <tr>
              <th className="py-2 px-4 text-left">Month</th>
              <th className="py-2 px-4 text-left">Revenue</th>
              <th className="py-2 px-4 text-left">Most Sold Item</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((month, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{month.month}</td>
                <td className="py-2 px-4">${month.revenue.toLocaleString()}</td>
                <td className="py-2 px-4">{month.mostSoldItem}</td>
              </tr>
            ))}
            {currentPage === totalPages && (
              <tr className="bg-gray-200 font-bold">
                <td className="py-2 px-4">Total</td>
                <td className="py-2 px-4">${totalRevenue.toLocaleString()}</td>
                <td className="py-2 px-4"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AnnualRevenues;