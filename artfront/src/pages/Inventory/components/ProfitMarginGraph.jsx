import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProfitMarginGraph = React.memo(({ item }) => {
  if (!item) {
    return <div className="text-center py-8">Select an item to view the profit margin</div>;
  }

  const totalCost = parseFloat(item.total_production_cost);
  const sellingPrice = parseFloat(item.selling_price);
  const profitMargin = sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;

  const data = {
    labels: ['Profit Margin'],
    datasets: [
      {
        label: 'Profit Margin (%)',
        data: [profitMargin],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Profit Margin for ${item.name}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Profit Margin (%)'
        }
      },
    },
  };

  const costBreakdown = [
    { label: 'Splitting/Drawing', value: parseFloat(item.splitting_drawing_cost) },
    { label: 'Carving/Cutting', value: parseFloat(item.carving_cutting_cost) },
    { label: 'Sanding', value: parseFloat(item.sanding_cost) },
    { label: 'Painting', value: parseFloat(item.painting_cost) },
    { label: 'Finishing', value: parseFloat(item.finishing_cost) },
    { label: 'Packaging', value: parseFloat(item.packaging_cost) },
  ];

  return (
    <div>
      <Bar data={data} options={options} />
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h4 className="text-lg font-semibold mb-2">Price Breakdown</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Production Cost:</p>
            <p className="text-lg">${totalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-medium">Selling Price:</p>
            <p className="text-lg">${sellingPrice.toFixed(2)}</p>
          </div>
          <div className="col-span-2">
            <p className="font-medium">Profit:</p>
            <p className="text-lg text-green-600">${(sellingPrice - totalCost).toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-4">
          <h5 className="font-semibold mb-2">Cost Breakdown:</h5>
          <ul className="list-disc pl-5">
            {costBreakdown.map(({ label, value }) => (
              <li key={label}>{label}: ${value.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
});

ProfitMarginGraph.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
    total_production_cost: PropTypes.string,
    selling_price: PropTypes.string,
    splitting_drawing_cost: PropTypes.string,
    carving_cutting_cost: PropTypes.string,
    sanding_cost: PropTypes.string,
    painting_cost: PropTypes.string,
    finishing_cost: PropTypes.string,
    packaging_cost: PropTypes.string,
  }),
};

ProfitMarginGraph.displayName = 'ProfitMarginGraph';

export default ProfitMarginGraph;