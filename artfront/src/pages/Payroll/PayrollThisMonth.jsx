// src/pages/Payroll/PayrollThisMonth.jsx
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Pagination from '../../components/Pagination';
import { format, parseISO } from 'date-fns';
import { updatePayrollStatus, updateLocalPayrollStatus } from '../../store/slices/payrollSlice';

const PayrollThisMonth = () => {
  const dispatch = useDispatch();
  const { payrollData } = useSelector(state => state.payroll);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const currentMonth = format(new Date(), 'MMMM yyyy');

  const filteredPayroll = useMemo(() => {
    return payrollData
      .filter(payroll => format(parseISO(payroll.month), 'MMMM yyyy') === currentMonth)
      .filter(payroll => 
        payroll.artist_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm, payrollData, currentMonth]);

  const totalPages = Math.ceil(filteredPayroll.length / itemsPerPage);
  const paginatedPayroll = filteredPayroll.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePay = (payrollId) => {
    dispatch(updateLocalPayrollStatus(payrollId));
    dispatch(updatePayrollStatus(payrollId))
      .unwrap()
      .then(() => {
        console.log('Paid successfully');
      })
      .catch((error) => {
        console.error('Failed to update payroll status:', error);
        // You might want to show an error message to the user here
      });
  };

  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search artists..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPayroll.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className='text-left'>
                <tr>
                  <th className="py-2 px-4 border-b">ARTIST NAME</th>
                  <th className="py-2 px-4 border-b">ITEMS DONE</th>
                  <th className="py-2 px-4 border-b">TOTAL EARNINGS ({currentMonth})</th>
                  <th className="py-2 px-4 border-b">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayroll.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{payroll.artist_name}</td>
                    <td className="py-2 px-4 border-b">{payroll.item_qty}</td>
                    <td className="py-2 px-4 border-b">KES. {payroll.total_earnings.toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">
                      {payroll.status === 'PAID' ? (
                        <span className="text-green-500">Paid</span>
                      ) : (
                        <button 
                          onClick={() => handlePay(payroll.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Pay Earnings
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-xl font-semibold text-gray-600">No payroll data available for this month.</p>
        </div>
      )}
    </div>
  );
};

export default PayrollThisMonth;