// src/store/slices/hrSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchArtists = createAsyncThunk(
  'hr/fetchArtists',
  async ({ page, searchTerm }, { rejectWithValue }) => {
    try {
      const url = `/api/auth/artists/list/?page=${page}${searchTerm ? `&search=${searchTerm}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const fetchStaffMembers = createAsyncThunk(
  'hr/fetchStaffMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/staff_members/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateStaffMember = createAsyncThunk(
  'hr/updateStaffMember',
  async ({ id, ...updateData }, { dispatch, rejectWithValue }) => {
    try {
      // Ensure role and status are lowercase
      if (updateData.role) {
        updateData.role = updateData.role.toLowerCase();
      }
      if (updateData.status) {
        updateData.status = updateData.status.toLowerCase();
      }
      const response = await api.patch(`/api/staff_members/${id}/`, updateData);
      await dispatch(fetchStaffMembers());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSpecializations = createAsyncThunk(
  'hr/fetchSpecializations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/specializations/list/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addArtist = createAsyncThunk(
  'hr/addArtist',
  async (artistData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/artists/', artistData);
      // Fetch the updated list of artists after adding a new one
      await dispatch(fetchArtists());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateArtist = createAsyncThunk(
  'hr/updateArtist',
  async ({ id, ...updateData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/auth/artists/${id}/`, updateData);
      await dispatch(fetchArtists());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addStaffMember = createAsyncThunk(
  'hr/addStaffMember',
  async (staffData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post( '/api/staff_members/', staffData );
      await dispatch(fetchStaffMembers());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addSpecialization = createAsyncThunk(
  'hr/addSpecialization',
  async (specializationData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/specializations/', specializationData);
      await dispatch(fetchSpecializations());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const hrSlice = createSlice({
  name: 'hr',
  initialState: {
    artists: [],
    staffMembers: [],
    specializations: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtists.fulfilled, (state, action) => {
        state.artists = action.payload;
        state.loading = false;
      })
      .addCase(fetchArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStaffMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase( fetchStaffMembers.fulfilled, ( state, action ) => {
        state.staffMembers = action.payload;
        state.loading = false;
      })
      .addCase(fetchStaffMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      } )
      
      // Update Staff Member
      .addCase(updateStaffMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaffMember.fulfilled, (state, action) => {
        const updatedStaffMember = action.payload;
        const index = state.staffMembers.results.findIndex(
          (member) => member.id === updatedStaffMember.id
        );
        if (index !== -1) {
          state.staffMembers.results[index] = updatedStaffMember;
        }
        state.loading = false;
      })
      .addCase(updateStaffMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSpecializations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecializations.fulfilled, (state, action) => {
        state.specializations = action.payload;
        state.loading = false;
      })
      .addCase(fetchSpecializations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addArtist.fulfilled, (state) => {
        state.loading = false;
        // We don't need to update the artists state here because fetchArtists will do it
      })
      .addCase(addArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      } )

      .addCase(updateArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      } )

      .addCase(updateArtist.fulfilled, (state) => {
        state.loading = false;
        // We don't need to update the artists state here because fetchArtists will do it
      })
      .addCase(updateArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      } )
      

      .addCase(addStaffMember.fulfilled, (state, action) => {
        state.staffMembers = action.payload;
      })
      .addCase(addSpecialization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSpecialization.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addSpecialization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
} );

export const selectStaffMembers = (state) => state.hr.staffMembers;
export const selectStaffMembersLoading = (state) => state.hr.loading;
export const selectStaffMembersError = (state) => state.hr.error;

export const selectSpecializations = (state) => state.hr.specializations;
export const selectSpecializationsLoading = (state) => state.hr.loading;
export const selectSpecializationsError = ( state ) => state.hr.error;


const selectHrState = state => state.hr;

export const selectArtists = createSelector(
  [selectHrState],
  (hrState) => hrState.artists.results || []
);

export default hrSlice.reducer;