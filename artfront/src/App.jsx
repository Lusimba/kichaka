import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthState } from './store/slices/authSlice';

import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components
const NewTask = lazy(() => import('./pages/Production/NewTask'));
const ProductionTracking = lazy(() => import('./pages/Production/ProductionTracking'));
const ProductionDetails = lazy(() => import('./pages/Production/ProductionDetails'));
const OrderList = lazy(() => import('./pages/Orders/OrderList'));
const OrderDetail = lazy(() => import('./pages/Orders/OrderDetail'));
const NewOrder = lazy(() => import('./pages/Orders/NewOrder'));
const InventoryDashboard = lazy(() => import('./pages/Inventory/InventoryDashboard'));
const HRDashboard = lazy(() => import('./pages/HR/HRDashboard'));
const ArtistDetail = lazy(() => import('./pages/HR/ArtistDetail'));
const StaffMemberDetail = lazy(() => import('./pages/HR/StaffMemberDetail'));
const PayrollDashboard = lazy(() => import('./pages/Payroll/PayrollDashboard'));
const DefectTracking = lazy(() => import('./pages/Quality/DefectTracking'));
const ReportsDashboard = lazy(() => import('./pages/Reports/ReportsDashboard'));
const SignUp = lazy(() => import('./pages/Auth/SignUp'));
const SignIn = lazy(() => import('./pages/Auth/SignIn'));

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size={100} /></div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);
  
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner size={100} />}>
        <Routes>
          {/* Auth routes outside of Layout */}
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          
          {/* All other routes inside Layout and protected */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              {/* Production routes */}
              <Route index element={<ProductionTracking />} />
              <Route path="production/:id" element={<ProductionDetails />} />
              <Route path="new-task" element={<NewTask />} />

              {/* Orders routes */}
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="orders/new" element={<NewOrder />} />
              
              {/* Inventory routes */}
              <Route path="inventory" element={<InventoryDashboard />} />

              {/* HR routes */}
              <Route path="hr" element={<HRDashboard />} />
              <Route path="hr/artist/:id" element={<ArtistDetail />} />
              <Route path="hr/staff/:id" element={<StaffMemberDetail />} />

              {/* Payroll routes */}
              <Route path="payroll" element={<PayrollDashboard />} />

              {/* Quality routes */}
              <Route path="quality" element={<DefectTracking />} />

              {/* Reports routes */}
              <Route path="reports" element={<ReportsDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;