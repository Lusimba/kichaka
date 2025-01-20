import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { addArtist, fetchSpecializations, selectSpecializations, selectSpecializationsLoading, selectSpecializationsError } from '../../../store/slices/hrSlice';

// Simple Alert Component
const Alert = ({ children, variant = 'info' }) => {
  const bgColor = variant === 'destructive' ? 'bg-red-100' : 'bg-blue-100';
  const textColor = variant === 'destructive' ? 'text-red-800' : 'text-blue-800';
  
  return (
    <div className={`p-4 rounded ${bgColor} ${textColor}`}>
      {children}
    </div>
  );
};

const AddArtistForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const specializationsData = useSelector(selectSpecializations);
  const loading = useSelector(selectSpecializationsLoading);
  const error = useSelector(selectSpecializationsError);
  
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    specialization: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    dispatch(fetchSpecializations());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecializationSelect = (specialization) => {
    setFormData({ ...formData, specialization: specialization.id });
    setSearchTerm(specialization.name);
    setShowDropdown(false);
  };

  const hasSpecializations = specializationsData?.results?.length > 0;
  const filteredSpecializations = hasSpecializations
    ? specializationsData.results.filter(spec =>
        spec.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.specialization) {
      setSubmitError('Please select a specialization from the dropdown list');
      return;
    }

    try {
      await dispatch(addArtist(formData)).unwrap();
      onClose();
    } catch (error) {
      setSubmitError(
        error?.error 
          ? `${error.error}${error.details ? `: ${error.details}` : ''}`
          : 'Failed to add artist. Please try again.'
      );
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading specializations...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        Error loading specializations: {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {!hasSpecializations && (
        <Alert>
          Please add specializations first before creating an artist.
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search specialization..."
            className="w-full p-2 border rounded"
            disabled={!hasSpecializations}
            required
          />
          
          {showDropdown && filteredSpecializations.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-60 overflow-auto">
              {filteredSpecializations.map((spec) => (
                <li
                  key={spec.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSpecializationSelect(spec)}
                >
                  {spec.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {submitError && (
          <Alert variant="destructive">
            {submitError}
          </Alert>
        )}

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={loading || !hasSpecializations}
        >
          {loading ? 'Adding...' : 'Add Artist'}
        </button>
      </form>
    </div>
  );
};

AddArtistForm.propTypes = {
  onClose: PropTypes.func.isRequired
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'destructive'])
};

export default AddArtistForm;