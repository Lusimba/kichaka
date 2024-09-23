import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchMonthlyCompletionStats } from '../../../store/slices/payrollSlice';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MonthlyCompletionStatsGraph = ({ selectedYear, setSelectedYear }) => {
  const dispatch = useDispatch();
  const { monthlyCompletionStats, monthlyStatsLoading, monthlyStatsError } = useSelector((state) => state.payroll);

  useEffect(() => {
    dispatch(fetchMonthlyCompletionStats());
  }, [dispatch]);

  const formattedData = useMemo(() => {
    if (!monthlyCompletionStats || monthlyCompletionStats.length === 0) {
      return [];
    }
    return monthlyCompletionStats
      .filter((item) => parseISO(item.month).getFullYear() === selectedYear)
      .map((item) => ({
        ...item,
        month: format(parseISO(item.month), 'MMM'),
        total_earnings: parseFloat(item.total_earnings),
      }))
      .sort((a, b) => parseISO(a.month) - parseISO(b.month));
  }, [monthlyCompletionStats, selectedYear]);

  const createChartData = (label, data, color) => ({
    labels: formattedData.map(item => item.month),
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: color.replace(')', ', 0.5)').replace('rgb', 'rgba'),
        tension: 0.1,
      },
    ],
  });

  const chartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  });

  const tasksData = createChartData('Total Tasks', formattedData.map(item => item.total_tasks), 'rgb(255, 99, 132)');
  const completedData = createChartData('Total Completed', formattedData.map(item => item.total_completed), 'rgb(53, 162, 235)');
  const earningsData = createChartData('Total Earnings ($)', formattedData.map(item => item.total_earnings), 'rgb(75, 192, 192)');

  const years = useMemo(() => {
    if (!monthlyCompletionStats || monthlyCompletionStats.length === 0) {
      return [new Date().getFullYear()];
    }
    return [...new Set(monthlyCompletionStats.map((item) => parseISO(item.month).getFullYear()))];
  }, [monthlyCompletionStats]);

  if (monthlyStatsLoading) return <div>Loading...</div>;
  if (monthlyStatsError) return <div>Error: {monthlyStatsError}</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <h3 className='text-xl text-center'>Annual Statistics</h3>
      </div>
      {formattedData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Line options={chartOptions('Tasks Completed')} data={tasksData} />
          </div>
          <div>
            <Line options={chartOptions('Items/Pieces Completed')} data={completedData} />
          </div>
          <div>
            <Line options={chartOptions('Total Earnings Paid Out')} data={earningsData} />
          </div>
        </div>
      ) : (
        <div>No data available for the selected year.</div>
      )}
    </div>
  );
};

export default MonthlyCompletionStatsGraph;