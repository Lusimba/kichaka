import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO, getYear } from 'date-fns';
import { fetchPayrollData, generateMonthlyPayroll, resetGenerationStatus } from '../../store/slices/payrollSlice';
import SummaryCards from './components/SummaryCards';
import PayrollThisMonth from './PayrollThisMonth';
import AnnualRevenues from './AnnualRevenues';
import Bonuses from './Bonuses';
import MonthlyCompletionStatsGraph from './components/MonthlyCompletionStatsGraph';

const PayrollDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { payrollData, loading, error, generatingPayroll, generationSuccess, generationError } = useSelector(state => state.payroll);
  const [activeTab, setActiveTab] = useState('Totals This Month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM yyyy');

  useEffect(() => {
    dispatch(fetchPayrollData());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    if (generationSuccess) {
      alert('Monthly payroll generated successfully!');
      dispatch(fetchPayrollData());
      dispatch(resetGenerationStatus());
    }
    if (generationError) {
      let errorMessage = 'An error occurred while generating payroll.';
      if (typeof generationError === 'string') {
        errorMessage = generationError;
      } else if (generationError && generationError.message) {
        errorMessage = generationError.message;
      } else if (generationError && generationError.error) {
        errorMessage = generationError.error;
      }
      alert(`Error generating payroll: ${errorMessage}`);
      dispatch(resetGenerationStatus());
    }
  }, [generationSuccess, generationError, dispatch]);

  const handleTileClick = (title) => {
    setActiveTab(title);
    navigate(`?tab=${encodeURIComponent(title)}`);
  };

  const handleGeneratePayroll = () => {
    dispatch(generateMonthlyPayroll());
  };

  const summaryData = useMemo(() => {
    if (!payrollData.length) return { 
      totalItemsThisMonth: 0, 
      totalRevenueThisMonth: 0, 
      totalAnnualRevenue: 0 
    };

    const thisMonthPayroll = payrollData.filter(payroll => 
      format(parseISO(payroll.month), 'MMMM yyyy') === currentMonth
    );

    const thisYearPayroll = payrollData.filter(payroll => 
      getYear(parseISO(payroll.month)) === selectedYear
    );

    return {
      totalItemsThisMonth: thisMonthPayroll.reduce((sum, payroll) => sum + payroll.item_qty, 0),
      totalRevenueThisMonth: thisMonthPayroll.reduce((sum, payroll) => sum + parseFloat(payroll.total_earnings), 0),
      totalAnnualRevenue: thisYearPayroll.reduce((sum, payroll) => sum + parseFloat(payroll.total_earnings), 0),
    };
  }, [payrollData, currentMonth, selectedYear]);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Totals This Month':
        return <PayrollThisMonth />;
      case 'Annual Revenues':
        return <AnnualRevenues selectedYear={selectedYear} setSelectedYear={setSelectedYear} />;
      case 'Bonuses':
        return <Bonuses selectedYear={selectedYear} setSelectedYear={setSelectedYear} />;
      default:
        return <PayrollThisMonth />;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Payroll Dashboard</h1>

      <SummaryCards 
        totalRevenueThisMonth={summaryData.totalRevenueThisMonth}
        totalItemsThisMonth={summaryData.totalItemsThisMonth}
        totalAnnualRevenue={summaryData.totalAnnualRevenue}
        activeTab={activeTab}
        handleTileClick={handleTileClick}
      />

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleGeneratePayroll}
          disabled={generatingPayroll}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {generatingPayroll ? 'Generating...' : 'Generate Monthly Payroll'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          {renderActiveTabContent()}
        </div>
        <MonthlyCompletionStatsGraph selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
      </div>
    </div>
  );
};

export default PayrollDashboard;