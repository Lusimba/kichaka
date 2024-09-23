import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnnualArtistStats, generateBonuses, payBonuses } from '../../store/slices/payrollSlice';
import Pagination from '../../components/Pagination';

const Bonuses = ({ selectedYear: propSelectedYear, setSelectedYear }) => {
  const dispatch = useDispatch();
  const { 
    annualArtistStats, 
    loadingYears, 
    error, 
    payingBonuses, 
    payBonusesError,
    lastBonusPaymentResult,
    fetchedYears // New state to track which years have been fetched
  } = useSelector(state => state.payroll);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [bonusPercentage, setBonusPercentage] = useState(5);
  const [generateError, setGenerateError] = useState(null);
  const itemsPerPage = 10;

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [internalSelectedYear, setInternalSelectedYear] = useState(propSelectedYear || currentYear);

  useEffect(() => {
    if (propSelectedYear !== undefined) {
      setInternalSelectedYear(propSelectedYear);
    }
  }, [propSelectedYear]);

  useEffect(() => {
    if (!loadingYears[internalSelectedYear] && !fetchedYears.includes(internalSelectedYear)) {
      dispatch(fetchAnnualArtistStats(internalSelectedYear));
    }
  }, [dispatch, internalSelectedYear, loadingYears, fetchedYears]);

  const isLoading = loadingYears[internalSelectedYear];

  const currentYearStats = useMemo(() => {
    return annualArtistStats[internalSelectedYear] || [];
  }, [annualArtistStats, internalSelectedYear]);

  const filteredArtists = useMemo(() => {
    return currentYearStats.filter(artist => 
      artist.artist_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentYearStats, searchTerm]);

  const totalPages = Math.ceil(filteredArtists.length / itemsPerPage);
  const paginatedArtists = useMemo(() => {
    return filteredArtists.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredArtists, currentPage, itemsPerPage]);

  const totalBonusAmount = useMemo(() => {
    return filteredArtists.reduce((sum, artist) => sum + (artist.bonus_amount || 0), 0);
  }, [filteredArtists]);

  const handleYearChange = (e) => {
    const newYear = Number(e.target.value);
    setInternalSelectedYear(newYear);
    if (setSelectedYear) {
      setSelectedYear(newYear);
    }
    setCurrentPage(1);
    if (!loadingYears[newYear] && !fetchedYears.includes(newYear)) {
      dispatch(fetchAnnualArtistStats(newYear));
    }
  };

  const handleGenerateBonuses = () => {
    dispatch(generateBonuses({ year: internalSelectedYear, percentage: bonusPercentage }))
      .unwrap()
      .then(() => {
        dispatch(fetchAnnualArtistStats(internalSelectedYear));
        setGenerateError(null);
      })
      .catch((error) => {
        setGenerateError(error.message || 'Bonuses already generated for this year');
      });
  };

  const handlePayBonusForArtist = (artistId) => {
    dispatch(payBonuses({ year: internalSelectedYear, artistIds: [artistId] }))
      .unwrap()
      .then(() => {
        dispatch(fetchAnnualArtistStats(internalSelectedYear));
      })
      .catch((error) => {
        console.error('Failed to pay bonus for artist:', error);
      });
  };

  const yearOptions = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => currentYear - i);
  }, [currentYear]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchAnnualArtistStats(internalSelectedYear))} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="container mx-auto">
      <div className="mb-6 flex items-center space-x-4">
        <div>
          <label htmlFor="year-select" className="mr-2">Select Year:</label>
          <select
            id="year-select"
            value={internalSelectedYear}
            onChange={handleYearChange}
            className="border rounded px-2 py-1"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bonus-percentage" className="mr-2">Bonus Percentage:</label>
          <input
            type="number"
            id="bonus-percentage"
            value={bonusPercentage}
            onChange={(e) => setBonusPercentage(Number(e.target.value))}
            className="border rounded px-2 py-1 w-16"
            min="0"
            max="100"
          />
        </div>
        <button
          onClick={handleGenerateBonuses}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={payingBonuses}
        >
          Generate Bonuses
        </button>
      </div>

      {generateError && (
        <div className="mb-4 text-red-600">
          Error: {generateError}
        </div>
      )}

      {lastBonusPaymentResult && (
        <div className="mb-4 text-green-600">
          {lastBonusPaymentResult}
        </div>
      )}

      {payBonusesError && (
        <div className="mb-4 text-red-600">
          Error paying bonuses: {payBonusesError}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search artists..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="border-b bg-white">
            <tr>
              <th className="py-2 px-4 text-left">Artist Name</th>
              <th className="py-2 px-4 text-left">Annual Revenue ({internalSelectedYear})</th>
              <th className="py-2 px-4 text-left">Total Completed</th>
              <th className="py-2 px-4 text-left">Bonus Amount</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedArtists.length > 0 ? (
              paginatedArtists.map(artist => (
                <tr key={artist.artist_name} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{artist.artist_name}</td>
                  <td className="py-2 px-4">KES. {artist.total_earnings.toLocaleString()}</td>
                  <td className="py-2 px-4">{artist.total_items}</td>
                  <td className="py-2 px-4">KES. {artist.bonus_amount.toLocaleString()}</td>
                  <td className="py-2 px-4">{artist.bonus_status}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handlePayBonusForArtist(artist.artist_id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
                      disabled={artist.bonus_status === 'PAID' || payingBonuses}
                    >
                      {artist.bonus_status === 'PAID' ? 'Paid' : 'Pay Bonus'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center">No artists found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
          
      <div className="bg-white p-4 rounded shadow mt-2">
        <p className="text-lg font-semibold">
          Total Bonus Amount: KES. {totalBonusAmount.toLocaleString()}
        </p>
      </div>

      <div className="mt-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Bonuses;