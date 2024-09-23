import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Pagination from '../../../components/Pagination';
import Modal from './Modal';

const OnLeaveInactiveComponent = ({ employees, inactiveArtists, specializations, onCountUpdate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);

  const combinedList = useMemo(() => {
    const inactiveStaff = employees
      .filter(employee => employee.status === 'inactive' || employee.status === 'On Leave')
      .map(employee => ({
        ...employee,
        type: 'staff'
      }));
    const artistList = inactiveArtists.map(artist => ({
      id: artist.id,
      name: artist.name,
      role: 'Artist',
      status: 'Inactive',
      leaveStartDate: 'N/A',
      expectedReturnDate: 'N/A',
      hire_date: artist.hire_date,
      phone_number: artist.phone_number,
      specialization: artist.specialization,
      type: 'artist'
    }));
    return [...inactiveStaff, ...artistList];
  }, [ employees, inactiveArtists ] );
  
  useEffect(() => {
    onCountUpdate();
  }, [combinedList, onCountUpdate]);

  const filteredList = combinedList.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const closeModal = () => {
    setSelectedPerson(null);
  };

  const getSpecializationName = (specializationId) => {
    const specialization = specializations.find(spec => spec.id === specializationId);
    return specialization ? specialization.name : 'Unknown';
  };

  return (
    <>
      <input
        type="text"
        placeholder="Search inactive employees and artists..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className='text-left'>
            <tr>
              <th className="py-2 px-4 border-b">NAME</th>
              <th className="py-2 px-4 border-b">ROLE</th>
              <th className="py-2 px-4 border-b">STATUS</th>
              <th className="py-2 px-4 border-b">HIRE DATE</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((person) => (
              <tr key={`${person.type}-${person.id}`} className="hover:bg-gray-100 cursor-pointer">
                <td className="py-2 px-4 border-b">{person.name}</td>
                <td className="py-2 px-4 border-b">{person.role}</td>
                <td className="py-2 px-4 border-b">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {person.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{new Date(person.hire_date).toLocaleDateString()}</td>
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
      <Modal
        isOpen={!!selectedPerson}
        onClose={closeModal}
        title={selectedPerson ? selectedPerson.name : ''}
      >
        {selectedPerson && (
          <div>
            <p>Role: {selectedPerson.role}</p>
            <p>Status: {selectedPerson.status}</p>
            <p>Hire Date: {new Date(selectedPerson.hire_date).toLocaleDateString()}</p>
            <p>Phone Number: {selectedPerson.phone_number || 'N/A'}</p>
            {selectedPerson.type === 'artist' && (
              <p>Specialization: {getSpecializationName(selectedPerson.specialization)}</p>
            )}
            {selectedPerson.type === 'staff' && (
              <>
                <p>Leave Start Date: {selectedPerson.leaveStartDate}</p>
                <p>Expected Return Date: {selectedPerson.expectedReturnDate}</p>
              </>
            )}
            <Link 
              to={`/hr/${selectedPerson.type}/${selectedPerson.id}`} 
              className="text-blue-500 hover:underline"
            >
              View Full Profile
            </Link>
          </div>
        )}
      </Modal>
    </>
  );
};

OnLeaveInactiveComponent.propTypes = {
  employees: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    leaveStartDate: PropTypes.string,  // Changed to optional
    expectedReturnDate: PropTypes.string,  // Changed to optional
    hire_date: PropTypes.string.isRequired,
    phone_number: PropTypes.string
  })).isRequired,
  inactiveArtists: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    specialization: PropTypes.number.isRequired,
    hire_date: PropTypes.string.isRequired,
    phone_number: PropTypes.string
  })).isRequired,
  specializations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  onCountUpdate: PropTypes.func.isRequired
};

export default OnLeaveInactiveComponent;