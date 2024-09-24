// src/store/slices/payrollSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPayrollData = createAsyncThunk(
  'payroll/fetchPayrollData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/payroll/current_month_payroll/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePayrollStatus = createAsyncThunk(
  'payroll/updatePayrollStatus',
  async (payrollId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/payroll/${payrollId}/`, { status: 'PAID' });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const generateMonthlyPayroll = createAsyncThunk(
  'payroll/generateMonthlyPayroll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/payroll/generate_monthly_payroll/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMonthlyCompletionStats = createAsyncThunk(
  'payroll/fetchMonthlyCompletionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/payroll/monthly_completion_stats/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const generateBonuses = createAsyncThunk(
  'payroll/generateBonuses',
  async ({ year, percentage }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/payroll/generate_bonuses/', { year, percentage });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAnnualArtistStats = createAsyncThunk(
  'payroll/fetchAnnualArtistStats',
  async (year, { getState, rejectWithValue }) => {
    const { payroll } = getState();
    
    // Check if data for the year is already fetched
    if (payroll.fetchedYears.includes(year)) {
      return { year, data: payroll.annualArtistStats[year] };
    }

    try {
      const response = await api.get(`/api/payroll/annual_artist_stats/?year=${year}`);
      return { year, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  },
  {
    condition: (year, { getState }) => {
      const { payroll } = getState();
      // Prevent multiple simultaneous requests for the same year
      if (payroll.loadingYears[year]) {
        return false;
      }
    }
  }
);


export const payBonuses = createAsyncThunk(
  'payroll/payBonuses',
  async ({ year, artistIds }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post( '/api/payroll/pay_bonuses/', { year, artist_ids: artistIds } );
      dispatch(fetchAnnualArtistStats(year));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    payrollData: [],
    loading: false,
    error: null,
    generatingPayroll: false,
    generationSuccess: false,
    generationError: null,
    monthlyCompletionStats: [],
    monthlyStatsLoading: false,
    monthlyStatsError: null,
    annualArtistStats: {},
    loadingYears: {},  
    payingBonuses: false,
    payBonusesError: null,
    lastBonusPaymentResult: null,
    fetchedYears: [],
  },
  reducers: {
    updateLocalPayrollStatus: (state, action) => {
      const index = state.payrollData.findIndex(payroll => payroll.id === action.payload);
      if (index !== -1) {
        state.payrollData[index].status = 'PAID';
      }
    },
    resetGenerationStatus: (state) => {
      state.generationSuccess = false;
      state.generationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrollData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPayrollData.fulfilled, (state, action) => {
        state.payrollData = action.payload;
        state.loading = false;
      })
      .addCase(fetchPayrollData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePayrollStatus.fulfilled, (state, action) => {
        const index = state.payrollData.findIndex(payroll => payroll.id === action.payload.id);
        if (index !== -1) {
          state.payrollData[index] = action.payload;
        }
      })
      .addCase(generateMonthlyPayroll.pending, (state) => {
        state.generatingPayroll = true;
        state.generationSuccess = false;
        state.generationError = null;
      })
      .addCase(generateMonthlyPayroll.fulfilled, (state) => {
        state.generatingPayroll = false;
        state.generationSuccess = true;
      })
      .addCase(generateMonthlyPayroll.rejected, (state, action) => {
        state.generatingPayroll = false;
        state.generationError = action.payload;
      } )
      
      .addCase(fetchMonthlyCompletionStats.pending, (state) => {
        state.monthlyStatsLoading = true;
      })
      .addCase(fetchMonthlyCompletionStats.fulfilled, (state, action) => {
        state.monthlyCompletionStats = action.payload;
        state.monthlyStatsLoading = false;
      })
      .addCase(fetchMonthlyCompletionStats.rejected, (state, action) => {
        state.monthlyStatsLoading = false;
        state.monthlyStatsError = action.payload;
      })
      
      .addCase(fetchAnnualArtistStats.pending, (state, action) => {
        state.loadingYears[action.meta.arg] = true;
      })
      .addCase(fetchAnnualArtistStats.fulfilled, (state, action) => {
        state.loadingYears[action.payload.year] = false;
        state.annualArtistStats[action.payload.year] = action.payload.data;
        if (!state.fetchedYears.includes(action.payload.year)) {
          state.fetchedYears.push(action.payload.year);
        }
      })
      .addCase(fetchAnnualArtistStats.rejected, (state, action) => {
        state.loadingYears[action.meta.arg] = false;
        state.error = action.payload;
      })
      
      .addCase(generateBonuses.pending, (state) => {
        state.generatingBonuses = true;
        state.generationBonusesError = null;
      })
      .addCase(generateBonuses.fulfilled, (state) => {
        state.generatingBonuses = false;
      })
      .addCase(generateBonuses.rejected, (state, action) => {
        state.generatingBonuses = false;
        state.generationBonusesError = action.payload;
      })
      
      .addCase(payBonuses.pending, (state) => {
        state.payingBonuses = true;
        state.payBonusesError = null;
      })
      .addCase(payBonuses.fulfilled, (state, action) => {
        state.payingBonuses = false;
        // Remove the year from fetchedYears to force a refresh
        state.fetchedYears = state.fetchedYears.filter(year => year !== action.meta.arg.year);
      })
      .addCase(payBonuses.rejected, (state, action) => {
        state.payingBonuses = false;
        state.payBonusesError = action.payload;
      });
  },
});

export const { updateLocalPayrollStatus, resetGenerationStatus } = payrollSlice.actions;
export default payrollSlice.reducer;