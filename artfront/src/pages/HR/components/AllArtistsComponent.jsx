import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Pagination from '../../../components/Pagination';

const AllArtistsComponent = ({ artists, loading, updateArtist, specializations, fetchArtists }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [specializationSearchTerm, setSpecializationSearchTerm] = useState('');
  const [showSpecializationDropdown, setShowSpecializationDropdown] = useState(false);
  const [filteredSpecializations, setFilteredSpecializations] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchArtistsData = useCallback(() => {
    fetchArtists({ page: currentPage, searchTerm });
  }, [fetchArtists, currentPage, searchTerm]);

  useEffect(() => {
    fetchArtistsData();
  }, [ fetchArtistsData ] );
  
  const filteredArtists = useMemo(() => {
    return artists.results.filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specializations.results.find(spec => spec.id === artist.specialization)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.is_active ? 'active' : 'inactive').includes(searchTerm.toLowerCase()) ||
      artist.phone_number.includes(searchTerm)
    );
  }, [ artists.results, specializations.results, searchTerm ] );
  

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const validateFields = () => {
    const errors = {};
    if (!editData.specialization) {
      errors.specialization = 'Specialization is required';
    }
    if (editData.is_active === undefined || editData.is_active === '') {
      errors.is_active = 'Status is required';
    }
    if (!editData.phone_number) {
      errors.phone_number = 'Phone number is required';
    }
    return errors;
  };

  const handleEdit = (artist) => {
    setEditingId(artist.id);
    setEditData({
      specialization: artist.specialization,
      is_active: artist.is_active,
      phone_number: artist.phone_number
    });
    setSpecializationSearchTerm(specializations.results.find(spec => spec.id === artist.specialization)?.name || "");
    setValidationErrors({});
  };

  const handleSave = async (artistId) => {
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await updateArtist(artistId, editData);
      setEditingId(null);
      setEditData({});
      setSpecializationSearchTerm('');
      setValidationErrors({});
      fetchArtistsData(); // Refresh the list after update
    } catch (error) {
      console.error('Failed to update artist:', error);
      setValidationErrors({ submit: 'Failed to update artist. Please try again.' });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setSpecializationSearchTerm('');
    setValidationErrors({});
  };

  const handleChange = (e, field) => {
    setEditData({ ...editData, [field]: e.target.value });
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSpecializationSearch = (e) => {
    const searchValue = e.target.value;
    setSpecializationSearchTerm(searchValue);
    setEditData({ ...editData, specialization: searchValue });
    setValidationErrors(prev => ({ ...prev, specialization: undefined }));
    
    const filtered = specializations && specializations.results
      ? specializations.results.filter(spec =>
          spec.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      : [];
    setFilteredSpecializations(filtered);
  };

  const handleSpecializationFocus = () => {
    setShowSpecializationDropdown(true);
    setFilteredSpecializations(specializations.results || []);
  };

  const handleSpecializationSelect = (specialization) => {
    setEditData({ ...editData, specialization: specialization.id });
    setSpecializationSearchTerm(specialization.name);
    setShowSpecializationDropdown(false);
    setValidationErrors(prev => ({ ...prev, specialization: undefined }));
  };

  if (loading) {
    return <div className="text-center py-4">Loading artists...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <>
      {/* <input
        type="text"
        placeholder="Search artists..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={handleSearch}
      /> */}

      {/* Known Issues - all artists lists not working to show proper data upon filtering, also on leave data not showing correctly for all data from artists */}
      {artists.results.length === 0 ? (
        <div className="text-center py-4">No artists found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className='text-left'>
                <tr>
                  <th className="py-2 px-4 border-b">NAME</th>
                  <th className="py-2 px-4 border-b">SPECIALIZATION</th>
                  <th className="py-2 px-4 border-b">STATUS</th>
                  <th className="py-2 px-4 border-b">HIRE DATE</th>
                  <th className="py-2 px-4 border-b text-center">PHONE NUMBER</th>
                  <th className="py-2 px-4 border-b">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {artists.results.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">
                      <Link to={`/hr/artist/${artist.id}`} className="block w-full h-full">
                        {artist.name}
                      </Link>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === artist.id ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={specializationSearchTerm}
                            onChange={handleSpecializationSearch}
                            onFocus={handleSpecializationFocus}
                            onBlur={() => setTimeout(() => setShowSpecializationDropdown(false), 200)}
                            className={`border rounded p-1 w-full ${validationErrors.specialization ? 'border-red-500' : ''}`}
                            placeholder="Type to search or select"
                          />
                          {validationErrors.specialization && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.specialization}</p>
                          )}
                          {showSpecializationDropdown && (
                            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-b max-h-60 overflow-auto">
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
                      ) : (
                        specializations.results.find(spec => spec.id === artist.specialization)?.name || 'Unknown'
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === artist.id ? (
                        <div>
                          <select
                            value={editData.is_active}
                            onChange={(e) => handleChange(e, 'is_active')}
                            className={`border rounded p-1 ${validationErrors.is_active ? 'border-red-500' : ''}`}
                          >
                            <option value="">Select status</option>
                            <option value={true}>Active</option>
                            <option value={false}>Inactive</option>
                          </select>
                          {validationErrors.is_active && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.is_active}</p>
                          )}
                        </div>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          artist.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {artist.is_active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">{new Date(artist.hire_date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {editingId === artist.id ? (
                        <div>
                          <input
                            type="text"
                            value={editData.phone_number}
                            onChange={(e) => handleChange(e, 'phone_number')}
                            className={`border rounded p-1 w-full ${validationErrors.phone_number ? 'border-red-500' : ''}`}
                          />
                          {validationErrors.phone_number && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.phone_number}</p>
                          )}
                        </div>
                      ) : (
                        artist.phone_number || 'N/A'
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === artist.id ? (
                        <>
                          <button onClick={() => handleSave(artist.id)} className="text-green-600 hover:text-green-900 mr-2">Save</button>
                          <button onClick={handleCancel} className="text-red-600 hover:text-red-900">Cancel</button>
                          {validationErrors.submit && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.submit}</p>
                          )}
                        </>
                      ) : (
                        <button onClick={() => handleEdit(artist)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(artists.count / 10)} // Assuming 10 items per page
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
};

AllArtistsComponent.propTypes = {
  artists: PropTypes.shape({
    results: PropTypes.array.isRequired,
    count: PropTypes.number.isRequired
  }),
  specializations: PropTypes.shape({
    results: PropTypes.array
  }),
  loading: PropTypes.bool,
  updateArtist: PropTypes.func.isRequired,
  fetchArtists: PropTypes.func.isRequired
};

export default AllArtistsComponent;