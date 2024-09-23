// src / store / slices / inventorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchInventoryData = createAsyncThunk(
  'inventory/fetchInventoryData',
  async (params, { rejectWithValue }) => {
    try {
      const { page, searchTerm } = params;
      const url = `/api/items/?page=${page}${searchTerm ? `&search=${searchTerm}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'inventory/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      let allCategories = [];
      let nextUrl = '/api/categories/';

      while (nextUrl) {
        const response = await api.get(nextUrl);
        allCategories = [...allCategories, ...response.data.results];
        nextUrl = response.data.next;
      }

      return {
        count: allCategories.length,
        next: null,
        previous: null,
        results: allCategories
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const fetchLowStockItems = createAsyncThunk(
  'inventory/fetchLowStockItems',
  async (params, { rejectWithValue }) => {
    try {
      const { page, searchTerm } = params;
      const url = `/api/items/low_stock/?page=${page}${searchTerm ? `&search=${searchTerm}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const addCategory = createAsyncThunk(
  'inventory/addCategory',
  async (categoryData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/categories/', categoryData);
      dispatch( fetchCategories() );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const addItem = createAsyncThunk(
  'inventory/addItem',
  async (itemData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/api/items/', itemData);

      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Immediately dispatch fetch actions after successful item addition
      dispatch(fetchInventoryData({ page: 1, searchTerm: '' }));
      dispatch(fetchLowStockItems({ page: 1, searchTerm: '' }));
      
      return response.data;
    } catch (error) {
      console.error('Error in addItem:', error);
      
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue('No response received from server');
      } else {
        return rejectWithValue(error.message || 'An unexpected error occurred - Failed to add item');
      }
    }
  }
);

export const batchUpdateStock = createAsyncThunk(
  'inventory/batchUpdateStock',
  async (updatedStocks, { dispatch, rejectWithValue }) => {
    try {
      const stocksArray = Object.entries(updatedStocks).map(([id, stock]) => ({ [id]: stock }));
      const response = await api.post( '/api/items/batch_update_stock/', { items: stocksArray } );
      dispatch( fetchCategories() );
      dispatch( fetchInventoryData() );
      dispatch( fetchLowStockItems() );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update stocks');
    }
  }
);

export const updateSingleStock = createAsyncThunk(
  'inventory/updateSingleStock',
  async ({ itemId, newStock }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post( `/api/items/${ itemId }/update_stock/`, { stock: newStock } );
      
      // Immediately dispatch fetch actions after successful item addition
      dispatch(fetchInventoryData({ page: 1, searchTerm: '' }));
      dispatch(fetchLowStockItems({ page: 1, searchTerm: '' }));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update stock');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: {
      results: [],
      count: 0
    },
    categories: {
      count: 0,
      next: null,
      previous: null,
      results: []
    },
    selectedCategory: null,
    lowStockItems: {
      results: [],
      count: 0
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.results.push(action.payload);
        state.categories.count += 1;
        state.loading = false;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.items.results.push(action.payload);
        state.items.count += 1;
        state.loading = false;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLowStockItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockItems.fulfilled, (state, action) => {
        state.lowStockItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchLowStockItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInventoryData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryData.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchInventoryData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(batchUpdateStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchUpdateStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(batchUpdateStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSingleStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSingleStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateSingleStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedCategory } = inventorySlice.actions;

export default inventorySlice.reducer;