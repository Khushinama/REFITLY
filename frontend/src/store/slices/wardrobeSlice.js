import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wardrobeService from '../../services/wardrobeService';

const initialState = {
  items: [],
  itemCount: 0,
  loading: false,
  error: null,
};

// Thunks
export const fetchWardrobe = createAsyncThunk(
  'wardrobe/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await wardrobeService.fetchWardrobeItems();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch items');
    }
  }
);

export const addItem = createAsyncThunk(
  'wardrobe/add',
  async (formData, { rejectWithValue }) => {
    try {
      return await wardrobeService.addWardrobeItem(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item');
    }
  }
);

export const updateItem = createAsyncThunk(
  'wardrobe/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await wardrobeService.updateWardrobeItem(id, formData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'wardrobe/delete',
  async (id, { rejectWithValue }) => {
    try {
      await wardrobeService.deleteWardrobeItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete item');
    }
  }
);

const wardrobeSlice = createSlice({
  name: 'wardrobe',
  initialState,
  reducers: {
    clearWardrobeError: (state) => {
      state.error = null;
    },
    resetWardrobe: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.loading = false;
      state.error = null;
    },
    addOptimisticItem: (state, action) => {
      // Avoid duplicates if somehow called twice
      if (!state.items.find(i => i._id === action.payload._id)) {
        state.items.unshift(action.payload);
        state.itemCount += 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchWardrobe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWardrobe.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.itemCount = action.payload.length;
      })
      .addCase(fetchWardrobe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Item
      .addCase(addItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the optimistic item if it exists
        state.items = state.items.filter(item => !item.isOptimistic);
        state.items.unshift(action.payload.item);
        state.itemCount = state.items.length;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Rollback: remove optimistic item on failure
        state.items = state.items.filter(item => !item.isOptimistic);
        state.itemCount = state.items.length;
      })
      // Update Item
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload.item._id);
        if (index !== -1) {
          state.items[index] = action.payload.item;
        }
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Item
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
        state.itemCount -= 1;
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWardrobeError, resetWardrobe, addOptimisticItem } = wardrobeSlice.actions;
export default wardrobeSlice.reducer;
