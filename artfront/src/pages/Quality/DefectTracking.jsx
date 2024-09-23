import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRejectionHistories, markDefectFixed, updateTaskStage } from '../../store/slices/productionSlice';
import Pagination from '../../components/Pagination';

const DEPARTMENT_CHOICES = {
  'C': 'Carpentry',
  'S': 'Sanding',
  'P': 'Painting',
};

const CURRENT_STAGE_CHOICES = {
  '0': 'Ordered',
  '1': 'Splitting/drawing',
  '2': 'Carving/cutting',
  '3': 'Sanding',
  '4': 'Painting',
  '5': 'Finishing',
  '6': 'Packaging',
  '7': 'Done'
};

function DefectTracking() {
  const dispatch = useDispatch();
  const { rejectionHistories, loading, error } = useSelector(state => state.production);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    dispatch(fetchRejectionHistories());
  }, [dispatch]);

  const filteredItems = rejectionHistories.results 
    ? rejectionHistories.results.filter(item =>
        (item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        DEPARTMENT_CHOICES[item.department]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referred_by_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const totalPages = Math.ceil(filteredItems.length / 10);

  const calculateTimeSinceReferral = (referralDate) => {
    const now = new Date();
    const referral = new Date(referralDate);
    const diffTime = Math.abs(now - referral);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${diffDays} days, ${diffHours} hours`;
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleReturnToProduction = async (rejectionHistoryId, productionTaskId) => {
    setLocalError(null);
    try {
      // First, mark the defect as fixed
      await dispatch(markDefectFixed(rejectionHistoryId)).unwrap();

      // Then, update the production task
      await dispatch(updateTaskStage({ 
        taskId: productionTaskId, 
        decrementRejection: true,
        newStatus: 'I'  // Set status back to 'In Progress'
      })).unwrap();

      // Finally, fetch updated rejection histories
      dispatch(fetchRejectionHistories());
    } catch (error) {
      console.error('Failed to return item to production:', error);
      setLocalError(typeof error === 'object' ? JSON.stringify(error) : String(error));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {typeof error === 'object' ? JSON.stringify(error) : String(error)}</div>;
  if (!rejectionHistories.results) return <div>No pending defects found.</div>;

  const currentItems = filteredItems.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="space-y-4 max-w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Defect Tracking</h2>
      </div>

      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{localError}</span>
        </div>
      )}

      <input
        type="text"
        placeholder="Search by product, artist, department, or staff member"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full p-2 border rounded mb-4"
      />

      {currentItems.length === 0 ? (
        <div>No pending defects found.</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Referred</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Since Referral</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{DEPARTMENT_CHOICES[item.department]}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.artist_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{calculateTimeSinceReferral(item.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{CURRENT_STAGE_CHOICES[item.stage]}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/production/${item.production_task}`} className="text-indigo-600 hover:text-indigo-900 mr-2">
                      View Details
                    </Link>
                    <button
                      onClick={() => handleReturnToProduction(item.id, item.production_task)}
                      className="text-green-600 hover:text-green-900 mr-2"
                    >
                      Return to Production
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default DefectTracking;