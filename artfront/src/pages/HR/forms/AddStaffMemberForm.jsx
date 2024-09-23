import { useState } from 'react';
import PropTypes from 'prop-types';

const AddStaffMemberForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Staff Member Data:', formData);
    // Here you would typically send this data to your backend
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
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
        name="role"
        value={formData.role}
        onChange={handleChange}
        placeholder="Role"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="text"
        name="department"
        value={formData.department}
        onChange={handleChange}
        placeholder="Department"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Add Staff Member
      </button>
    </form>
  );
};

AddStaffMemberForm.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default AddStaffMemberForm;