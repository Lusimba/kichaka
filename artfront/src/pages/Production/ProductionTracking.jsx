// src/pages/Production/ProductionTracking.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks } from '../../store/slices/productionSlice';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_CHOICES = {
  'P': 'Pending',
  'I': 'In Progress',
  'C': 'Completed',
  'X': 'Cancelled',
};

const CURRENT_STAGE_CHOICES = {
  '0': 'Ordered',
  '1': 'Splitting/drawing',
  '2': 'Carving/cutting',
  '3': 'Sanding',
  '4': 'Painting',
  '5': 'Finishing',
  '6': 'Packaging',
  '7': 'Done',
};

function ProductionTracking() {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector(state => state.production);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const filteredTasks = tasks && tasks.results ? tasks.results.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    const itemNameMatch = task.item_name.toLowerCase().includes(searchLower);
    const artistNameMatch = task.artist_name.toLowerCase().includes(searchLower);
    const stageMatch = CURRENT_STAGE_CHOICES[task.current_stage].toLowerCase().includes(searchLower);
    const statusMatch = STATUS_CHOICES[task.status].toLowerCase().includes(searchLower);
    const dateMatch = task.start_date.includes(searchTerm) || task.end_date.includes(searchTerm);

    return itemNameMatch || artistNameMatch || stageMatch || statusMatch || dateMatch;
  }) : [];

  const totalPages = tasks && tasks.count ? Math.ceil(tasks.count / 10) : 0; // Assuming 10 items per page

  if (loading.tasks) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size={100} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  if (!tasks || !tasks.results) {
    return <div className="text-center mt-4">No data available</div>;
  }

  return (
    <div className="space-y-4 max-w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Production Tracking</h2>
      </div>

      <input
        type="text"
        placeholder="Search by item name, artist name, dates, status, or stage"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {filteredTasks.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{task.item_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.artist_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.start_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.end_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span>{CURRENT_STAGE_CHOICES[task.current_stage] || task.current_stage}</span>
                      {task.rejection_count > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                          R{task.rejection_count}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{STATUS_CHOICES[task.status] || task.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/production/${task.id}`} className="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center mt-4">No matching tasks found</div>
      )}

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default ProductionTracking;