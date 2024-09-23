import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchDefectiveItems = createAsyncThunk(
  'quality/fetchDefectiveItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/quality/defective-items/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const qualitySlice = createSlice({
  name: 'quality',
  initialState: {
    defectiveItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDefectiveItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDefectiveItems.fulfilled, (state, action) => {
        state.defectiveItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchDefectiveItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default qualitySlice.reducer;