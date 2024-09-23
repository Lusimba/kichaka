import { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { addSpecialization, selectSpecializationsLoading, selectSpecializationsError } from '../../../store/slices/hrSlice';

const AddSpecializationForm = ({ onClose }) => {
  const [specialization, setSpecialization] = useState('');
  const dispatch = useDispatch();
  const loading = useSelector(selectSpecializationsLoading);
  const error = useSelector(selectSpecializationsError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addSpecialization({ name: specialization })).unwrap();
      onClose();
    } catch (err) {
      console.error('Error adding specialization:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        placeholder="New Specialization"
        className="w-full p-2 mb-4 border rounded"
        required
        disabled={loading}
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button 
        type="submit" 
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Specialization'}
      </button>
    </form>
  );
};

AddSpecializationForm.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default AddSpecializationForm;