// src/pages/HR/components/StaffMembersComponent.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import Pagination from '../../../components/Pagination';

const StaffMembersComponent = ({ staffMembers, updateStaffMember }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const ROLE_CHOICES = {
    'supervisor': 'Supervisor',
    'manager': 'Manager',
    'proprietor': 'Proprietor'
  };

  const STATUS_CHOICES = {
    'active': 'Active',
    'inactive': 'Inactive'
  };

  const staffMembersArray = Array.isArray(staffMembers.results) ? staffMembers.results : [];

  const filteredStaffMembers = staffMembersArray.filter(staff =>
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffPerPage = 10;
  const totalPages = Math.ceil(filteredStaffMembers.length / staffPerPage);
  const paginatedStaffMembers = filteredStaffMembers.slice(
    (currentPage - 1) * staffPerPage,
    currentPage * staffPerPage
  );

  const handleEdit = (staff) => {
    setEditingId(staff.id);
    setEditData({
      user: staff.user,
      role: staff.role,
      status: staff.status,
      hire_date: staff.hire_date
    });
  };

  const handleSave = async (staffId) => {
    try {
      await updateStaffMember(staffId, editData);
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Failed to update staff member:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleChange = (e, field) => {
    setEditData({ ...editData, [field]: e.target.value });
  };

  return (
    <>
      <input
        type="text"
        placeholder="Search staff members..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className='text-left'>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Hire Date</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStaffMembers.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">
                  {staff.name || 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingId === staff.id ? (
                    <select
                      value={editData.role}
                      onChange={(e) => handleChange(e, 'role')}
                      className="border rounded p-1"
                    >
                      {Object.entries(ROLE_CHOICES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    ROLE_CHOICES[staff.role] || staff.role
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingId === staff.id ? (
                    <select
                      value={editData.status}
                      onChange={(e) => handleChange(e, 'status')}
                      className="border rounded p-1"
                    >
                      {Object.entries(STATUS_CHOICES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {STATUS_CHOICES[staff.status] || staff.status}
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 border-b">{staff.hire_date || 'N/A'}</td>
                <td className="py-2 px-4 border-b">
                  {editingId === staff.id ? (
                    <>
                      <button onClick={() => handleSave(staff.id)} className="text-green-600 hover:text-green-900 mr-2">Save</button>
                      <button onClick={handleCancel} className="text-red-600 hover:text-red-900">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => handleEdit(staff)} className="text-blue-600 hover:text-blue-900">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

StaffMembersComponent.propTypes = {
  staffMembers: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string,
      role: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      hire_date: PropTypes.string,
      user: PropTypes.any // You might want to define this more specifically
    })),
    PropTypes.shape({
      results: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string,
        role: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        hire_date: PropTypes.string,
        user: PropTypes.any // You might want to define this more specifically
      }))
    })
  ]).isRequired,
  updateStaffMember: PropTypes.func.isRequired
};

export default StaffMembersComponent;