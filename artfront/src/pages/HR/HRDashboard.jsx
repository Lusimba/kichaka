import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchArtists, 
  fetchStaffMembers, 
  fetchSpecializations, 
  updateStaffMember,
  updateArtist,
  selectStaffMembers,
  selectStaffMembersError,
  selectSpecializations
} from '../../store/slices/hrSlice';
import AddArtistForm from './forms/AddArtistForm';
import AddStaffMemberForm from './forms/AddStaffMemberForm';
import AddSpecializationForm from './forms/AddSpecializationForm';
import Modal from './components/Modal';
import SummaryCard from './components/SummaryCard';
import AllArtistsComponent from './components/AllArtistsComponent';
import StaffMembersComponent from './components/StaffMembersComponent';
import SpecializationsComponent from './components/SpecializationsComponent';
import OnLeaveInactiveComponent from './components/OnLeaveInactiveComponent';
import LoadingSpinner from '../../components/LoadingSpinner';

const HRDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('All Artists');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ isLoading, setIsLoading ] = useState( true );
  
  const [artistsPage, setArtistsPage] = useState(1);
  const [artistsSearchTerm, setArtistsSearchTerm] = useState('');

  const artistsList = useSelector(state => state.hr.artists);
  const staffMembersList = useSelector(selectStaffMembers);
  const specializationsList = useSelector(selectSpecializations);
  const error = useSelector(selectStaffMembersError);

  const fetchArtistsCallback = useCallback((params) => {
    dispatch(fetchArtists(params));
  }, [dispatch]);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          dispatch(fetchArtists({ page: artistsPage, searchTerm: artistsSearchTerm })).unwrap(),
          dispatch(fetchStaffMembers()).unwrap(),
          dispatch(fetchSpecializations()).unwrap()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [dispatch, artistsPage, artistsSearchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  const handleTileClick = useCallback((title) => {
    setActiveTab(title);
    navigate(`?tab=${encodeURIComponent(title)}`);
  }, [navigate]);

  const memoizedForms = useMemo(() => ({
    'All Artists': <AddArtistForm onClose={() => setIsModalOpen(false)} />,
    'Staff Members': <AddStaffMemberForm onClose={() => setIsModalOpen(false)} />,
    'Specializations': <AddSpecializationForm onClose={() => setIsModalOpen(false)} />,
  }), []);

  const getModalTitle = useCallback(() => `Add New ${activeTab === 'Staff Members' ? 'Staff Member' : activeTab === 'Specializations' ? 'Specialization' : 'Artist'}`, [activeTab]);

  const handleUpdateStaffMember = useCallback(async (staffId, updatedData) => {
    try {
      await dispatch(updateStaffMember({ id: staffId, ...updatedData })).unwrap();
      dispatch(fetchStaffMembers());
    } catch (error) {
      console.error('Failed to update staff member:', error);
    }
  }, [dispatch]);

  const handleUpdateArtist = useCallback(async (artistId, updatedData) => {
    try {
      await dispatch(updateArtist({ id: artistId, ...updatedData })).unwrap();
      dispatch(fetchArtists());
    } catch (error) {
      console.error('Failed to update artist:', error);
    }
  }, [dispatch]);

  const inactiveCount = useMemo(() => {
    const inactiveStaffCount = staffMembersList.results?.filter(employee => employee.status !== 'active').length || 0;
    const inactiveArtistCount = artistsList.results?.filter(artist => !artist.is_active).length || 0;
    return inactiveStaffCount + inactiveArtistCount;
  }, [staffMembersList, artistsList]);

  const renderActiveComponent = useCallback(() => {
    switch (activeTab) {
      case 'All Artists':
        return <AllArtistsComponent 
          artists={artistsList} 
          loading={isLoading} 
          updateArtist={handleUpdateArtist} 
          specializations={specializationsList} 
          fetchArtists={fetchArtistsCallback}
        />;
      case 'Staff Members':
        return <StaffMembersComponent 
          staffMembers={staffMembersList} 
          updateStaffMember={handleUpdateStaffMember}
        />;
      case 'Specializations':
        return <SpecializationsComponent specializations={specializationsList} />;
      case 'On Leave/Inactive':
        return <OnLeaveInactiveComponent 
          employees={staffMembersList.results?.filter(employee => employee.status !== 'active') || []}
          inactiveArtists={artistsList.results?.filter(artist => !artist.is_active) || []}
          specializations={specializationsList.results || []}
          onCountUpdate={() => {}} // Placeholder function as we're now using memoized inactiveCount
        />;
      default:
        return null;
    }
  }, [activeTab, artistsList, staffMembersList, specializationsList, isLoading, handleUpdateArtist, handleUpdateStaffMember, fetchArtistsCallback]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size={100} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Human Resources Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="All Artists" value={artistsList?.count || 0} icon="🎨" onClick={() => handleTileClick('All Artists')} active={activeTab === 'All Artists'} />
        <SummaryCard title="Specializations" value={specializationsList?.count || 0} icon="🔧" onClick={() => handleTileClick('Specializations')} active={activeTab === 'Specializations'} />
        <SummaryCard title="On Leave/Inactive" value={inactiveCount} icon="🚫" onClick={() => handleTileClick('On Leave/Inactive')} active={activeTab === 'On Leave/Inactive'} />
        <SummaryCard title="Staff Members" value={staffMembersList?.count || 0} icon="👔" onClick={() => handleTileClick('Staff Members')} active={activeTab === 'Staff Members'} />
      </div>

      {activeTab !== 'On Leave/Inactive' && activeTab !== 'Staff Members' && (
        <div className="flex space-x-4 mb-6">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => setIsModalOpen(true)}>
            + Add New {activeTab === 'Specializations' ? 'Specialization' : 'Artist'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 w-full gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">{activeTab}</h2>
          {renderActiveComponent()}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={getModalTitle()}
      >
        {memoizedForms[activeTab] || null}
      </Modal>
    </div>
  );
};

export default HRDashboard;