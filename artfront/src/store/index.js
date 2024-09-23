import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productionReducer from './slices/productionSlice';
import inventoryReducer from './slices/inventorySlice';
import orderReducer from './slices/orderSlice';
import hrReducer from './slices/hrSlice';
import payrollReducer from './slices/payrollSlice';
import qualityReducer from './slices/qualitySlice';
import reportReducer from './slices/reportSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    production: productionReducer,
    inventory: inventoryReducer,
    orders: orderReducer,
    hr: hrReducer,
    payroll: payrollReducer,
    quality: qualityReducer,
    reports: reportReducer,
  },
});

export default store;