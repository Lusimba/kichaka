import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { addArtist, fetchSpecializations, selectSpecializations, selectSpecializationsLoading, selectSpecializationsError } from '../../../store/slices/hrSlice';

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

  const handleSpecializationSearch = (e) => {
    setSearchTerm(e.target.value);
    setFormData({ ...formData, specialization: e.target.value });
    setShowDropdown(true);
  };

  const handleSpecializationSelect = (specialization) => {
    setFormData({ ...formData, specialization: specialization.id });
    setSearchTerm(specialization.name);
    setShowDropdown(false);
  };

  const filteredSpecializations = specializationsData && specializationsData.results
    ? specializationsData.results.filter(spec =>
        spec.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await dispatch(addArtist(formData)).unwrap();
      console.log('New Artist Added Successfully');
      onClose();
    } catch (error) {
      console.error('Failed to add artist:', error);
      setSubmitError('Failed to add artist. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="text"
        name="phone_number"
        value={formData.phone_number}
        onChange={handleChange}
        placeholder="Phone Number"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <div className="relative">
        <input
          type="text"
          name="specialization"
          value={searchTerm}
          onChange={handleSpecializationSearch}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Specialization"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        {showDropdown && filteredSpecializations.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b max-h-60 overflow-auto">
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
      {submitError && <p className="text-red-500 mb-4">{submitError}</p>}
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" disabled={loading}>
        {loading ? 'Adding...' : 'Add Artist'}
      </button>
    </form>
  );
};

AddArtistForm.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default AddArtistForm;