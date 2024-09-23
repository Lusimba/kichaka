// src/store/slices/productionSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTasks = createAsyncThunk(
  'production/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/production-tasks/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'production/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/production-tasks/', taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchRejectionHistories = createAsyncThunk(
  'production/fetchRejectionHistories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/rejection-history/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createRejectionHistory = createAsyncThunk(
  'production/createRejectionHistory',
  async (rejectionData, { rejectWithValue }) => {
    try {
      const response = await api.post( '/api/rejection-history/', rejectionData );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSingleTask = createAsyncThunk(
  'production/fetchSingleTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/production-tasks/${taskId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTaskStage = createAsyncThunk(
  'production/updateTaskStage',
  async ({ taskId, newStage, newStatus, accepted, incrementRejection, decrementRejection }, { rejectWithValue }) => {
    try {
      const updateData = {};
      if (newStage !== undefined) updateData.current_stage = newStage;
      if (newStatus !== undefined) updateData.status = newStatus;
      if (accepted !== undefined) updateData.accepted = accepted;
      if (incrementRejection) updateData.increment_rejection = true;
      if (decrementRejection) updateData.decrement_rejection = true;

      const response = await api.patch(`/api/production-tasks/${taskId}/`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const markDefectFixed = createAsyncThunk(
  'production/markDefectFixed',
  async (rejectionHistoryId, { rejectWithValue }) => {
    try {
      console.log('Marking defect as fixed, rejection history ID:', rejectionHistoryId);
      const response = await api.post(`/api/rejection-history/${rejectionHistoryId}/mark_defect_fixed/`);
      console.log('Response from marking defect as fixed:', response.data);
      
      // Fetch updated rejection histories after marking as fixed
      // dispatch(fetchRejectionHistories());

      return response.data;
    } catch (error) {
      console.error('Error marking defect as fixed:', error);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const reassignArtist = createAsyncThunk(
  'production/reassignArtist',
  async ({ taskId, newArtistId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/production-tasks/${taskId}/reassign_artist/`, { new_artist_id: newArtistId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const productionSlice = createSlice({
  name: 'production',
  initialState: {
    tasks: { results: [], count: 0 },
    rejectionHistories: [],
    singleTask: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.results.push(action.payload);
        state.tasks.count += 1;
      })
      .addCase(fetchRejectionHistories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRejectionHistories.fulfilled, (state, action) => {
        state.rejectionHistories = action.payload;
        state.loading = false;
      })
      .addCase(fetchRejectionHistories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRejectionHistory.fulfilled, (state, action) => {
        state.rejectionHistories.results.push(action.payload);
        state.rejectionHistories.count += 1;
      })
      .addCase(fetchSingleTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSingleTask.fulfilled, (state, action) => {
        state.singleTask = action.payload;
        state.loading = false;
      })
      .addCase(fetchSingleTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTaskStage.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaskStage.fulfilled, (state, action) => {
        state.singleTask = action.payload;
        if (state.tasks.results) {
          const taskIndex = state.tasks.results.findIndex(task => task.id === action.payload.id);
          if (taskIndex !== -1) {
            state.tasks.results[taskIndex] = action.payload;
          }
        }
        state.loading = false;
      })
      .addCase(updateTaskStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markDefectFixed.pending, (state) => {
        state.loading = true;
      })
      .addCase(markDefectFixed.fulfilled, (state, action) => {
        state.loading = false;
        // Update the rejection history item in the state
        const updatedIndex = state.rejectionHistories.results.findIndex(item => item.id === action.payload.id);
        if (updatedIndex !== -1) {
          state.rejectionHistories.results[updatedIndex] = action.payload;
        }
      })
      .addCase(markDefectFixed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(reassignArtist.pending, (state) => {
        state.loading = true;
      })
      .addCase(reassignArtist.fulfilled, (state, action) => {
        state.singleTask = action.payload;
        if (state.tasks.results) {
          const taskIndex = state.tasks.results.findIndex(task => task.id === action.payload.id);
          if (taskIndex !== -1) {
            state.tasks.results[taskIndex] = action.payload;
          }
        }
        state.loading = false;
      })
      .addCase(reassignArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Memoized Selectors
const selectProductionState = (state) => state.production;

export const selectTasks = createSelector(
  [selectProductionState],
  (productionState) => productionState.tasks
);

export const selectRejectionHistories = createSelector(
  [selectProductionState],
  (productionState) => productionState.rejectionHistories
);

export const selectSingleTask = createSelector(
  [selectProductionState],
  (productionState) => productionState.singleTask
);

export const selectLoading = createSelector(
  [selectProductionState],
  (productionState) => productionState.loading
);

export const selectError = createSelector(
  [selectProductionState],
  (productionState) => productionState.error
);

export default productionSlice.reducer;