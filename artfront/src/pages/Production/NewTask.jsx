import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../store/slices/productionSlice';
import { fetchInventoryData } from '../../store/slices/inventorySlice';
import { fetchArtists } from '../../store/slices/hrSlice';
import { addHours, addDays, parseISO, formatISO } from 'date-fns';
import { debounce } from 'lodash';

function NewTask() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inventoryItems = useSelector(state => state.inventory.items.results || []);
  const artists = useSelector(state => state.hr.artists.results || []);
  const [error, setError] = useState(null);
  
  const [task, setTask] = useState({
    itemDetails: '',
    sku: '',
    itemId: null,
    artistDetails: '',
    artistId: null,
    description: '',
    estimatedTime: '',
    timeUnit: 'hours',
    startDateTime: '',
    endDateTime: '',
    currentStage: 0,
    product: '',
    status: 'In Progress',
    quantity: 1
  });
  
  const [suggestions, setSuggestions] = useState({ items: [], artists: [] });

  const debouncedFetchInventory = useCallback(
    debounce((searchTerm) => dispatch(fetchInventoryData({ page: 1, searchTerm })), 300),
    [dispatch]
  );

  const debouncedFetchArtists = useCallback(
    debounce((searchTerm) => dispatch(fetchArtists({ page: 1, searchTerm })), 300),
    [dispatch]
  );

  useEffect(() => {
    if (task.itemDetails) {
      debouncedFetchInventory(task.itemDetails);
    }
  }, [task.itemDetails, debouncedFetchInventory]);

  useEffect(() => {
    if (task.artistDetails) {
      debouncedFetchArtists(task.artistDetails);
    }
  }, [task.artistDetails, debouncedFetchArtists]);

  useEffect(() => {
    if (inventoryItems.length > 0 && task.itemDetails) {
      setSuggestions(prevSuggestions => ({
        ...prevSuggestions,
        items: inventoryItems.filter(item => 
          item.name.toLowerCase().includes(task.itemDetails.toLowerCase()) ||
          item.sku.toLowerCase().includes(task.itemDetails.toLowerCase())
        ).slice(0, 5)
      }));
    } else {
      setSuggestions(prevSuggestions => ({ ...prevSuggestions, items: [] }));
    }
  }, [inventoryItems, task.itemDetails]);

  useEffect(() => {
    if (artists.length > 0 && task.artistDetails && !task.artistId) {
      setSuggestions(prevSuggestions => ({
        ...prevSuggestions,
        artists: artists.filter(artist => 
          artist.name.toLowerCase().includes(task.artistDetails.toLowerCase())
        ).slice(0, 5)
      }));
    } else {
      setSuggestions(prevSuggestions => ({ ...prevSuggestions, artists: [] }));
    }
  }, [artists, task.artistDetails, task.artistId]);

  const calculateEndDateTime = useCallback(() => {
    if (task.startDateTime && task.estimatedTime) {
      const startDate = parseISO(task.startDateTime);
      const endDate = task.timeUnit === 'hours'
        ? addHours(startDate, parseInt(task.estimatedTime))
        : addDays(startDate, parseInt(task.estimatedTime));
      return formatISO(endDate, { representation: 'complete' }).slice(0, 16);
    }
    return '';
  }, [task.startDateTime, task.estimatedTime, task.timeUnit]);

  useEffect(() => {
    const endDateTime = calculateEndDateTime();
    if (endDateTime) {
      setTask(prevTask => ({ ...prevTask, endDateTime }));
    }
  }, [calculateEndDateTime]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTask(prevTask => ({
      ...prevTask,
      [name]: value,
      ...(name === 'itemDetails' && { itemId: null, sku: '' }),
      ...(name === 'artistDetails' && { artistId: null })
    }));
  }, []);

  const handleSuggestionClick = useCallback((field, item) => {
    if (field === 'itemDetails') {
      setTask(prevTask => ({ 
        ...prevTask, 
        itemDetails: `${item.sku} - ${item.name}`, 
        sku: item.sku,
        itemId: item.id
      }));
    } else if (field === 'artistDetails') {
      setTask(prevTask => ({ 
        ...prevTask, 
        artistDetails: item.name, 
        artistId: item.id 
      }));
    }
    setSuggestions(prev => ({ ...prev, [field === 'itemDetails' ? 'items' : 'artists']: [] }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!task.itemId || !task.artistId) {
      setError('Please select both an item and an artist');
      return;
    }

    const taskData = {
      item: task.itemId,
      artist: task.artistId,
      quantity: parseInt(task.quantity),
      start_date: task.startDateTime.split('T')[0],
      end_date: task.endDateTime.split('T')[0],
      notes: task.description
    };

    try {
      const resultAction = await dispatch(createTask(taskData));
      
      if (createTask.fulfilled.match(resultAction)) {
        navigate('/');
      } else {
        throw new Error(resultAction.error?.message || 'Failed to create task');
      }
    } catch (err) {
      console.error('An error occurred:', err);
      setError(`Error: ${err.message}`);
    }
  };

  const formInputs = useMemo(() => (
    <>
      <div>
        <label htmlFor="itemDetails" className="block text-sm font-medium text-gray-700">Item Details (Search by SKU or Name)</label>
        <input
          type="text"
          name="itemDetails"
          id="itemDetails"
          value={task.itemDetails}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {suggestions.items.length > 0 && (
          <ul className="mt-1 border border-gray-300 rounded-md shadow-sm">
            {suggestions.items.map((item) => (
              <li 
                key={item.id}
                onClick={() => handleSuggestionClick('itemDetails', item)}
                className="py-1 px-3 hover:bg-gray-100 cursor-pointer"
              >
                {item.sku} - {item.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="artistDetails" className="block text-sm font-medium text-gray-700">Artist (Search by Name)</label>
        <input
          type="text"
          name="artistDetails"
          id="artistDetails"
          value={task.artistDetails}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {suggestions.artists.length > 0 && !task.artistId && (
          <ul className="mt-1 border border-gray-300 rounded-md shadow-sm">
            {suggestions.artists.map((artist) => (
              <li 
                key={artist.id}
                onClick={() => handleSuggestionClick('artistDetails', artist)}
                className="py-1 px-3 hover:bg-gray-100 cursor-pointer"
              >
                {artist.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          value={task.quantity}
          onChange={handleChange}
          min="1"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="description"
          id="description"
          rows="3"
          value={task.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">Estimated Time</label>
          <input
            type="number"
            name="estimatedTime"
            id="estimatedTime"
            value={task.estimatedTime}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="timeUnit" className="block text-sm font-medium text-gray-700">Time Unit</label>
          <select
            name="timeUnit"
            id="timeUnit"
            value={task.timeUnit}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">Start Date and Time (EAT)</label>
        <input
          type="datetime-local"
          name="startDateTime"
          id="startDateTime"
          value={task.startDateTime}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700">End Date and Time (Calculated, EAT)</label>
        <input
          type="datetime-local"
          name="endDateTime"
          id="endDateTime"
          value={task.endDateTime}
          readOnly
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
        />
      </div>
    </>
  ), [task, suggestions, handleChange, handleSuggestionClick]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Task</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {formInputs}
        <div className="flex justify-between">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Task
          </button>
          <Link
            to="/"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default React.memo(NewTask);