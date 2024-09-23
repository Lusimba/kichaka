// src/store/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/?page=${page}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch customers for suggestions
export const fetchCustomers = createAsyncThunk(
  'orders/fetchCustomers',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/customers/?search=${searchTerm}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch inventory items for suggestions
export const fetchInventoryItems = createAsyncThunk(
  'orders/fetchInventoryItems',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/items/?search=${searchTerm}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create a new customer
export const createCustomer = createAsyncThunk(
  'orders/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/customers/', customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/orders/', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createOrderItem = createAsyncThunk(
  'orders/createOrderItem',
  async (orderItemData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/order-items/', orderItemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/details/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrderItem = createAsyncThunk(
  'orders/updateOrderItem',
  async ({ itemId, ...updateData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/order-items/${itemId}/`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeOrderItem = createAsyncThunk(
  'orders/removeOrderItem',
  async ({ orderId, itemId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/remove_item/`, {
        item_id: itemId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/orders/${orderId}/update_status/`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/orders/${orderId}/`);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete order');
    }
  }
);


const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    customers: [],
    inventoryItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrderItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrderItem.fulfilled, (state, action) => {
        state.orders = action.payload;
        console.log('Order item created:', action.payload);
        state.loading = false;
      })
      .addCase(createOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      } )
      

      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
        state.loading = false;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Inventory Items
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.inventoryItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers = action.payload;
        state.loading = false;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      } )

      // Order Details Page
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderItem.fulfilled, (state, action) => {
        // Update the item in the current order
        if (state.currentOrder) {
          const updatedItem = action.payload;
          const itemIndex = state.currentOrder.items.findIndex(item => item.id === updatedItem.id);
          if (itemIndex !== -1) {
            state.currentOrder.items[itemIndex] = updatedItem;
          }
        }
      })
      .addCase(removeOrderItem.fulfilled, (state, action) => {
        // Remove the item from the current order
        if (state.currentOrder) {
          const removedItemId = action.payload.itemId;
          state.currentOrder.items = state.currentOrder.items.filter(item => item.id !== removedItemId);
        }
      })
      
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        if (state.currentOrder) {
          state.currentOrder.status = action.payload.new_status;
        }
        state.loading = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      } )
    
    
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(order => order.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = orderSlice.actions;

export default orderSlice.reducer;