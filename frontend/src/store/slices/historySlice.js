import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import historyService from '../../services/historyService';
import { showToast } from './toastSlice';

const initialState = {
  historyOutfits: [],
  calendarHistory: {},
  loading: false,
  calendarLoading: false,
  error: null,
};

export const fetchHistory = createAsyncThunk(
  'history/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await historyService.fetchHistory();
      return res.data; // Array of formatted history entries
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const fetchCalendarHistory = createAsyncThunk(
  'history/fetchCalendarHistory',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const res = await historyService.fetchCalendarHistory(month, year);
      return res.data; // Grouped object: { "YYYY-MM-DD": [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch calendar history');
    }
  }
);

export const wearOutfit = createAsyncThunk(
  'history/wearOutfit',
  async ({ outfitId, outfit, event, notes, style, mood, season, reasons }, { dispatch, rejectWithValue }) => {
    try {
      const res = await historyService.wearOutfit({ outfitId, outfit, event, notes, style, mood, season, reasons });
      if (res.alreadyWorn) {
        // Already added today, just return payload
        return res;
      } else {
        // New wear, show toast!
        dispatch(showToast({ message: 'Added to Outfit History', type: 'success' }));
        return res;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark outfit as worn');
    }
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    clearHistoryError: (state) => {
      state.error = null;
    },
    resetHistory: (state) => {
      state.historyOutfits = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchHistory
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.historyOutfits = action.payload || [];
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchCalendarHistory
      .addCase(fetchCalendarHistory.pending, (state) => {
        state.calendarLoading = true;
        state.error = null;
      })
      .addCase(fetchCalendarHistory.fulfilled, (state, action) => {
        state.calendarLoading = false;
        state.calendarHistory = action.payload || {};
      })
      .addCase(fetchCalendarHistory.rejected, (state, action) => {
        state.calendarLoading = false;
        state.error = action.payload;
      })
      // wearOutfit
      .addCase(wearOutfit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(wearOutfit.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          // Add new history entry to the start of list
          state.historyOutfits.unshift(action.payload.data);
          
          // Add dynamically to calendarHistory grouped by local date key
          const newEntry = action.payload.data;
          if (newEntry.wornDate) {
            const dateKey = newEntry.wornDate.split('T')[0];
            if (!state.calendarHistory[dateKey]) {
              state.calendarHistory[dateKey] = [];
            }
            if (!state.calendarHistory[dateKey].some(item => item._id === newEntry._id)) {
              state.calendarHistory[dateKey].push(newEntry);
            }
          }
        }
      })
      .addCase(wearOutfit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearHistoryError, resetHistory } = historySlice.actions;
export default historySlice.reducer;
