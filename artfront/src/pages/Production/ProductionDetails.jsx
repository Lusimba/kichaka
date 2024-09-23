import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchSingleTask, 
  fetchRejectionHistories, 
  updateTaskStage, 
  createRejectionHistory,
  reassignArtist,
  selectSingleTask,
  selectRejectionHistories,
  selectLoading,
  selectError
} from '../../store/slices/productionSlice';
import { fetchArtists, selectArtists } from '../../store/slices/hrSlice';
import confetti from 'canvas-confetti';
import { debounce } from 'lodash';

const DEPARTMENT_CHOICES = {
  'C': 'Carpentry',
  'S': 'Sanding',
  'P': 'Painting',
};

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

function ProductionDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const task = useSelector(selectSingleTask);
  const rejectionHistories = useSelector(selectRejectionHistories);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const artists = useSelector(selectArtists);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isReassigningArtist, setIsReassigningArtist] = useState(false);
  const [acceptedItems, setAcceptedItems] = useState('');
  const [artistSearch, setArtistSearch] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [filteredArtists, setFilteredArtists] = useState([]);

  const debouncedFetchArtists = useCallback(
    debounce((searchTerm) => dispatch(fetchArtists({ page: 1, searchTerm })), 300),
    [dispatch]
  );

  useEffect(() => {
    dispatch(fetchSingleTask(id));
    dispatch(fetchRejectionHistories());
  }, [dispatch, id]);

  useEffect(() => {
    if (task) {
      setAcceptedItems(task.accepted.toString());
    }
  }, [task]);

  useEffect(() => {
    if (artistSearch) {
      debouncedFetchArtists(artistSearch);
    }
  }, [artistSearch, debouncedFetchArtists]);

  useEffect(() => {
    if (artists.length > 0 && artistSearch) {
      setFilteredArtists(
        artists
          .filter(artist => 
            artist.name.toLowerCase().includes(artistSearch.toLowerCase())
          )
          .slice(0, 5)
      );
    } else {
      setFilteredArtists([]);
    }
  }, [artists, artistSearch]);

  const handleReassignArtist = useCallback(() => {
    setIsReassigningArtist(true);
    setArtistSearch('');
    setSelectedArtist(null);
  }, []);

  const confirmArtistReassignment = useCallback(() => {
    if (selectedArtist && task) {
      dispatch(reassignArtist({ taskId: task.id, newArtistId: selectedArtist.id }))
        .unwrap()
        .then(() => {
          setIsReassigningArtist(false);
          setArtistSearch('');
          setSelectedArtist(null);
          setFilteredArtists([]);  // Clear the filtered artists list
        })
        .catch((error) => {
          alert('Failed to reassign artist: ' + error);
        });
    }
  }, [selectedArtist, task, dispatch]);

  const handleArtistInputChange = useCallback((e) => {
    setArtistSearch(e.target.value);
    setSelectedArtist(null);
    if (!e.target.value) {
      setFilteredArtists([]);  // Clear the list when input is empty
    }
  }, []);

  const handleArtistSelect = useCallback((artist) => {
    setSelectedArtist(artist);
    setArtistSearch(artist.name);
    setFilteredArtists([]);  // Clear the filtered artists list
  }, []);

  const moveToNextStage = useCallback(() => {
    if (task) {
      const currentStageNumber = parseInt(task.current_stage);
      if (currentStageNumber < 7) {
        const newStage = (currentStageNumber + 1).toString();
        const newStatus = newStage === '7' ? 'C' : task.status;
        const acceptedItemsValue = acceptedItems === '' ? 0 : parseInt(acceptedItems);
        dispatch(updateTaskStage({ 
          taskId: task.id, 
          newStage, 
          newStatus, 
          accepted: acceptedItemsValue 
        }))
          .unwrap()
          .then(() => {
            if (newStage === '7') {
              finishTask();
            }
          })
          .catch((error) => {
            alert('Failed to move to next stage: ' + error);
          });
      }
    }
  }, [task, acceptedItems, dispatch]);

  const finishTask = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 }
    });
  }, []);

  const handleReject = useCallback(() => {
    setShowRejectForm(true);
  }, []);

  const handleRefer = useCallback(() => {
    if (task) {
      const rejectionData = {
        task_id: task.id,
        stage: task.current_stage,
        department: selectedDepartment,
      };

      dispatch(createRejectionHistory(rejectionData))
        .unwrap()
        .then(() => {
          dispatch(updateTaskStage({ 
            taskId: task.id, 
            newStage: task.current_stage,
            incrementRejection: true 
          }))
            .unwrap()
            .then(() => {
              setShowRejectForm(false);
              setSelectedDepartment('');
            })
            .catch((error) => {
              alert('Failed to update rejection count: ' + error);
            });
        })
        .catch((error) => {
          alert('Failed to create rejection history: ' + error);
        });
    }
  }, [task, selectedDepartment, dispatch]);

  const handleAcceptedItemsChange = useCallback((e) => {
    const value = e.target.value;
    if (task && (value === '' || (parseInt(value) > 0 && parseInt(value) <= task.quantity))) {
      setAcceptedItems(value);
    }
  }, [task]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Production Task Details</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Task Information</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Item</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{task.item_name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Artist</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">
                {isReassigningArtist ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={artistSearch}
                      onChange={handleArtistInputChange}
                      className="w-full border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                      placeholder="Search for an artist..."
                    />
                    {filteredArtists.length > 0 && !selectedArtist && (
                      <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {filteredArtists.map((artist) => (
                          <li
                            key={artist.id}
                            onClick={() => handleArtistSelect(artist)}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                          >
                            {artist.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <span>{task.artist_name}</span>
                )}
              </dd>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1 text-right">
                {isReassigningArtist ? (
                  <button
                    onClick={confirmArtistReassignment}
                    disabled={!selectedArtist}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    onClick={handleReassignArtist}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Reassign
                  </button>
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Quantity</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{task.quantity}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{task.start_date}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">End Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{task.end_date}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Stage</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {CURRENT_STAGE_CHOICES[task.current_stage]}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{STATUS_CHOICES[task.status]}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{task.notes}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Accepted Items</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{task.accepted}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Rejection Count</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{task.rejection_count}</dd>
            </div>
          </dl>
        </div>
      </div>

      {task.rejection_count > 0 && (
        <div className="mt-4 p-4 border rounded bg-yellow-100">
          <p className="text-yellow-700">
            {task.rejection_count > 1 ? `${task.rejection_count} items have been rejected. Please address the rejections before proceeding to the next stage` :
              '1 item has been rejected. Please address the rejection before proceeding to the next stage'
            }
          </p>
        </div>
      )}
      
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handleReject}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled = {task.current_stage === '7' }
        >
          Reject
        </button>
        <div className="flex items-center">
          <label htmlFor="acceptedItems" className="mr-2">Accepted Items:</label>
          <input
            id="acceptedItems"
            type="number"
            value={acceptedItems}
            onChange={handleAcceptedItemsChange}
            className="w-20 px-2 py-1 border rounded mr-2"
            min="1"
          />
          <span className="text-sm text-gray-500">Max: {task.quantity}</span>
        </div>
        <button
          onClick={moveToNextStage}
          disabled={
            task.status === 'C' || 
            task.current_stage === '7' || 
            (task.current_stage === '6' && (acceptedItems === '' || parseInt(acceptedItems) === 0 || parseInt(acceptedItems) > task.quantity)) ||
            task.rejection_count > 0
          }
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {task.current_stage === '6' ? 'Finish' : task.current_stage === '7' ? 'Completed' : 'Next Stage'}
        </button>
      </div>
      {showRejectForm && (
        <div className="mt-4 p-4 border rounded">
          <h4 className="text-lg font-medium mb-2">Reject Task</h4>

          <div className="my-3 p-4 border rounded bg-yellow-100">
            <p className="text-yellow-700">
              Add a rejection for each defective item in this task.
            </p>
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="block w-full p-2 border rounded mb-2"
          >
            <option value="">Select Department</option>
            {Object.entries(DEPARTMENT_CHOICES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleRefer}
            disabled={!selectedDepartment}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Refer
          </button>
        </div>
      )}
      
      <div className="mt-6">
        <Link to="/" className="text-indigo-600 hover:text-indigo-900">
          Back to Production Tracking
        </Link>
      </div>
    </div>
  );
}

export default ProductionDetails;