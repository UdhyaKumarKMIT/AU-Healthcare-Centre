import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (getState) => {
  const token = getState().auth?.user?.token || localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Async Thunks
export const fetchNurseTasks = createAsyncThunk(
  'nurse/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/nurse/tasks`, {
        headers: getAuthHeaders(getState)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch tasks');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompletedNurseTasks = createAsyncThunk(
  'nurse/fetchCompletedTasks',
  async ({ from, to } = {}, { getState, rejectWithValue }) => {
    try {
      const url = new URL(`${API_BASE}/nurse/tasks`);
      url.searchParams.set('status', 'COMPLETED');
      if (from) url.searchParams.set('from', from);
      if (to) url.searchParams.set('to', to);

      const response = await fetch(url.toString(), {
        headers: getAuthHeaders(getState)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch completed tasks');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompletedNurseTasksToday = createAsyncThunk(
  'nurse/fetchCompletedTasksToday',
  async (_, { getState, rejectWithValue }) => {
    try {
      const url = new URL(`${API_BASE}/nurse/tasks`);
      url.searchParams.set('status', 'COMPLETED');

      const response = await fetch(url.toString(), {
        headers: getAuthHeaders(getState)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch completed tasks (today)');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTaskDetails = createAsyncThunk(
  'nurse/fetchTaskDetails',
  async (taskId, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/nurse/task/${taskId}/details`, {
        headers: getAuthHeaders(getState)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch task details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCompletedTaskDetails = createAsyncThunk(
  'nurse/fetchCompletedTaskDetails',
  async (taskId, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/nurse/task/${taskId}/completed-details`, {
        headers: getAuthHeaders(getState)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch completed task details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeTask = createAsyncThunk(
  'nurse/completeTask',
  async ({ taskId, payload }, { getState, rejectWithValue }) => {
    try {
      console.log('🔍 [REDUX THUNK] completeTask called');
      console.log('🔍 [REDUX THUNK] taskId:', taskId);
      console.log('🔍 [REDUX THUNK] payload:', payload);
      console.log('🔍 [REDUX THUNK] payload.secret_code:', payload.secret_code);

      const headers = getAuthHeaders(getState);
      console.log('🔍 [REDUX THUNK] headers:', headers);

      const bodyString = JSON.stringify(payload);
      console.log('🔍 [REDUX THUNK] body string:', bodyString);

      const response = await fetch(`${API_BASE}/nurse/task/${taskId}/complete`, {
        method: 'POST',
        headers: headers,
        body: bodyString
      });

      console.log('🔍 [REDUX THUNK] response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.log('❌ [REDUX THUNK] error response:', error);
        return rejectWithValue(error.message || 'Failed to complete task');
      }

      const data = await response.json();
      console.log('✅ [REDUX THUNK] success response:', data);
      return { ...data, taskId };
    } catch (error) {
      console.error('❌ [REDUX THUNK] exception:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAvailableStock = createAsyncThunk(
  'nurse/fetchStock',
  async (stockType = 'NURSE', { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/nurse/stock?stock_type=${stockType}`, {
        headers: getAuthHeaders(getState)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch stock');
      }

      const data = await response.json();
      return { stockType, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifySecretCode = createAsyncThunk(
  'nurse/verifyCode',
  async (secretCode, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/nurse/verify-code`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: JSON.stringify({ secret_code: secretCode })
      });

      if (!response.ok) {
        return rejectWithValue('Invalid code');
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial State
const initialState = {
  tasks: [],
  completedTasks: [],
  completedTasksToday: [],
  currentTask: null,
  completedTaskDetails: null,
  stock: {
    NURSE: [],
    DRESSING: []
  },
  loading: {
    tasks: false,
    completedTasks: false,
    completedTasksToday: false,
    taskDetails: false,
    completedTaskDetails: false,
    completeTask: false,
    stock: false,
    verifyCode: false
  },
  error: {
    tasks: null,
    completedTasks: null,
    completedTasksToday: null,
    taskDetails: null,
    completedTaskDetails: null,
    completeTask: null,
    stock: null,
    verifyCode: null
  },
  lastRefresh: null,
  codeVerified: false
};

// Slice
const nurseSlice = createSlice({
  name: 'nurse',
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
      state.error.taskDetails = null;
    },
    clearCompletedTaskDetails: (state) => {
      state.completedTaskDetails = null;
      state.error.completedTaskDetails = null;
    },
    clearTaskError: (state) => {
      state.error.completeTask = null;
    },
    clearStockError: (state) => {
      state.error.stock = null;
    },
    resetCodeVerification: (state) => {
      state.codeVerified = false;
      state.error.verifyCode = null;
    },
    clearAllErrors: (state) => {
      state.error = initialState.error;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchNurseTasks.pending, (state) => {
        state.loading.tasks = true;
        state.error.tasks = null;
      })
      .addCase(fetchNurseTasks.fulfilled, (state, action) => {
        state.loading.tasks = false;
        state.tasks = action.payload;
        state.lastRefresh = new Date().toISOString();
      })
      .addCase(fetchNurseTasks.rejected, (state, action) => {
        state.loading.tasks = false;
        state.error.tasks = action.payload;
      })

      // Fetch Completed Tasks (filtered)
      .addCase(fetchCompletedNurseTasks.pending, (state) => {
        state.loading.completedTasks = true;
        state.error.completedTasks = null;
      })
      .addCase(fetchCompletedNurseTasks.fulfilled, (state, action) => {
        state.loading.completedTasks = false;
        state.completedTasks = action.payload;
      })
      .addCase(fetchCompletedNurseTasks.rejected, (state, action) => {
        state.loading.completedTasks = false;
        state.error.completedTasks = action.payload;
      })

      // Fetch Completed Tasks Today (stat)
      .addCase(fetchCompletedNurseTasksToday.pending, (state) => {
        state.loading.completedTasksToday = true;
        state.error.completedTasksToday = null;
      })
      .addCase(fetchCompletedNurseTasksToday.fulfilled, (state, action) => {
        state.loading.completedTasksToday = false;
        state.completedTasksToday = action.payload;
      })
      .addCase(fetchCompletedNurseTasksToday.rejected, (state, action) => {
        state.loading.completedTasksToday = false;
        state.error.completedTasksToday = action.payload;
      })

      // Fetch Task Details
      .addCase(fetchTaskDetails.pending, (state) => {
        state.loading.taskDetails = true;
        state.error.taskDetails = null;
      })
      .addCase(fetchTaskDetails.fulfilled, (state, action) => {
        state.loading.taskDetails = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskDetails.rejected, (state, action) => {
        state.loading.taskDetails = false;
        state.error.taskDetails = action.payload;
      })

      // Fetch Completed Task Details
      .addCase(fetchCompletedTaskDetails.pending, (state) => {
        state.loading.completedTaskDetails = true;
        state.error.completedTaskDetails = null;
      })
      .addCase(fetchCompletedTaskDetails.fulfilled, (state, action) => {
        state.loading.completedTaskDetails = false;
        state.completedTaskDetails = action.payload;
      })
      .addCase(fetchCompletedTaskDetails.rejected, (state, action) => {
        state.loading.completedTaskDetails = false;
        state.error.completedTaskDetails = action.payload;
      })

      // Complete Task
      .addCase(completeTask.pending, (state) => {
        state.loading.completeTask = true;
        state.error.completeTask = null;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.loading.completeTask = false;
        state.currentTask = null;
        // Update task status in tasks array
        const taskIndex = state.tasks.findIndex(t => t.task_id === action.payload.taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].status = 'COMPLETED';
        }
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.loading.completeTask = false;
        state.error.completeTask = action.payload;
      })

      // Fetch Stock
      .addCase(fetchAvailableStock.pending, (state) => {
        state.loading.stock = true;
        state.error.stock = null;
      })
      .addCase(fetchAvailableStock.fulfilled, (state, action) => {
        state.loading.stock = false;
        state.stock[action.payload.stockType] = action.payload.data;
      })
      .addCase(fetchAvailableStock.rejected, (state, action) => {
        state.loading.stock = false;
        state.error.stock = action.payload;
      })

      // Verify Secret Code
      .addCase(verifySecretCode.pending, (state) => {
        state.loading.verifyCode = true;
        state.error.verifyCode = null;
      })
      .addCase(verifySecretCode.fulfilled, (state, action) => {
        state.loading.verifyCode = false;
        state.codeVerified = action.payload;
      })
      .addCase(verifySecretCode.rejected, (state, action) => {
        state.loading.verifyCode = false;
        state.error.verifyCode = action.payload;
        state.codeVerified = false;
      });
  }
});

// Actions
export const {
  clearCurrentTask,
  clearCompletedTaskDetails,
  clearTaskError,
  clearStockError,
  resetCodeVerification,
  clearAllErrors
} = nurseSlice.actions;

// Selectors
export const selectTasks = (state) => state.nurse.tasks;
export const selectPendingTasks = (state) =>
  state.nurse.tasks.filter(t => t.status !== 'COMPLETED');
export const selectCompletedTasks = (state) => state.nurse.completedTasks;
export const selectCompletedTasksToday = (state) => state.nurse.completedTasksToday;
export const selectCurrentTask = (state) => state.nurse.currentTask;
export const selectCompletedTaskDetails = (state) => state.nurse.completedTaskDetails;
export const selectNurseStock = (state) => state.nurse.stock.NURSE;
export const selectDressingStock = (state) => state.nurse.stock.DRESSING;
export const selectStock = (stockType) => (state) =>
  state.nurse.stock[stockType] || [];
export const selectLoading = (state) => state.nurse.loading;
export const selectError = (state) => state.nurse.error;
export const selectIsTasksLoading = (state) => state.nurse.loading.tasks;
export const selectIsCompletedTasksLoading = (state) => state.nurse.loading.completedTasks;
export const selectIsCompletedTasksTodayLoading = (state) => state.nurse.loading.completedTasksToday;
export const selectIsTaskDetailsLoading = (state) => state.nurse.loading.taskDetails;
export const selectIsCompletingTask = (state) => state.nurse.loading.completeTask;
export const selectIsStockLoading = (state) => state.nurse.loading.stock;
export const selectTasksError = (state) => state.nurse.error.tasks;
export const selectCompletedTasksError = (state) => state.nurse.error.completedTasks;
export const selectCompleteTaskError = (state) => state.nurse.error.completeTask;
export const selectLastRefresh = (state) => state.nurse.lastRefresh;
export const selectCodeVerified = (state) => state.nurse.codeVerified;

export default nurseSlice.reducer;