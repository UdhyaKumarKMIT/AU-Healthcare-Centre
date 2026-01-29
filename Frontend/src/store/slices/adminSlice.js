// src/store/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const initialState = {
  stats: {
    totalUsers: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    totalNurses: 0,
    totalPharmacists: 0,
    totalAdministrators: 0,
    totalPatients: 0,
    todayVisits: 0,
    newPatientsToday: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    roleDistribution: {}
  },
  patientOverview: {
    demographics: {},
    visitTrends: [],
    patientTypes: {}
  },
  users: [],
  doctors: [],
  receptionists: [],
  nurses: [],
  pharmacists: [],
  visits: [],
  inventory: [],
  systemLogs: [],
  userStats: {
    active: 0,
    inactive: 0,
    byRole: {}
  },
  loading: false,
  usersLoading: false,
  doctorsLoading: false,
  receptionistsLoading: false,
  nursesLoading: false,
  pharmacistsLoading: false,
  visitsLoading: false,
  inventoryLoading: false,
  logsLoading: false,
  error: null,
  successMessage: null,
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to safely parse JSON error responses
const parseErrorResponse = async (response) => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      return error.message || error.error || 'An error occurred';
    } else {
      // If response is not JSON, read as text
      const text = await response.text();
      return text || `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (e) {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
};

// Fetch admin dashboard statistics
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch patient overview and demographics
export const fetchPatientOverview = createAsyncThunk(
  'admin/fetchPatientOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/patient-overview`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch users with optional filters
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.role && params.role !== 'all') queryParams.append('role', params.role);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      
      const url = `${API_BASE}/api/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new user
export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new doctor (uses createUser endpoint with role: 'DOCTOR')
export const createDoctor = createAsyncThunk(
  'admin/createDoctor',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...doctorData, role: 'DOCTOR' })
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new receptionist (uses createUser endpoint with role: 'NURSE_RECEPTIONIST')
export const createReceptionist = createAsyncThunk(
  'admin/createReceptionist',
  async (receptionistData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...receptionistData, role: 'NURSE_RECEPTIONIST' })
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new nurse (uses createUser endpoint with role: 'NURSE_RECEPTIONIST')
export const createNurse = createAsyncThunk(
  'admin/createNurse',
  async (nurseData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...nurseData, role: 'NURSE_RECEPTIONIST' })
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new pharmacist (uses createUser endpoint with role: 'PHARMACIST')
export const createPharmacist = createAsyncThunk(
  'admin/createPharmacist',
  async (pharmacistData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...pharmacistData, role: 'PHARMACIST' })
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user status (now only supports ACTIVE/INACTIVE)
export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reason })
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { userId, status, reason };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all doctors
export const fetchDoctors = createAsyncThunk(
  'admin/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/doctors`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all receptionists
export const fetchReceptionists = createAsyncThunk(
  'admin/fetchReceptionists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/receptionists`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all nurses
export const fetchNurses = createAsyncThunk(
  'admin/fetchNurses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/nurses`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all pharmacists
export const fetchPharmacists = createAsyncThunk(
  'admin/fetchPharmacists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/pharmacists`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all visits
export const fetchVisits = createAsyncThunk(
  'admin/fetchVisits',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      
      const url = `${API_BASE}/api/admin/visits${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch medicine inventory
export const fetchInventory = createAsyncThunk(
  'admin/fetchInventory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      
      const url = `${API_BASE}/api/admin/inventory${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch system audit logs
export const fetchSystemLogs = createAsyncThunk(
  'admin/fetchSystemLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.action && params.action !== 'all') queryParams.append('action', params.action);
      
      const url = `${API_BASE}/api/admin/logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminStats: (state) => {
      state.stats = initialState.stats;
      state.patientOverview = initialState.patientOverview;
      state.users = initialState.users;
      state.userStats = initialState.userStats;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Patient Overview
      .addCase(fetchPatientOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.patientOverview = action.payload;
      })
      .addCase(fetchPatientOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;

        // Calculate user stats
        const stats = { active: 0, inactive: 0, byRole: {} };
        action.payload.forEach(user => {
          const status = (user.status || 'ACTIVE').toLowerCase();
          if (status === 'active') stats.active++;
          if (status === 'inactive') stats.inactive++;
          
          if (user.role) {
            const role = user.role.toLowerCase();
            stats.byRole[role] = (stats.byRole[role] || 0) + 1;
          }
        });
        state.userStats = stats;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users.unshift(action.payload);
        state.successMessage = 'User created successfully';

        const role = action.payload.role.toLowerCase();
        state.userStats.byRole[role] = (state.userStats.byRole[role] || 0) + 1;
        state.userStats.active += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Create Doctor
      .addCase(createDoctor.pending, (state) => {
        state.doctorsLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createDoctor.fulfilled, (state) => {
        state.doctorsLoading = false;
        state.successMessage = 'Doctor created successfully';
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.doctorsLoading = false;
        state.error = action.payload;
      })

      // Create Receptionist
      .addCase(createReceptionist.pending, (state) => {
        state.receptionistsLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createReceptionist.fulfilled, (state) => {
        state.receptionistsLoading = false;
        state.successMessage = 'Receptionist created successfully';
      })
      .addCase(createReceptionist.rejected, (state, action) => {
        state.receptionistsLoading = false;
        state.error = action.payload;
      })

      // Create Nurse
      .addCase(createNurse.pending, (state) => {
        state.nursesLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createNurse.fulfilled, (state) => {
        state.nursesLoading = false;
        state.successMessage = 'Nurse created successfully';
      })
      .addCase(createNurse.rejected, (state, action) => {
        state.nursesLoading = false;
        state.error = action.payload;
      })

      // Create Pharmacist
      .addCase(createPharmacist.pending, (state) => {
        state.pharmacistsLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPharmacist.fulfilled, (state) => {
        state.pharmacistsLoading = false;
        state.successMessage = 'Pharmacist created successfully';
      })
      .addCase(createPharmacist.rejected, (state, action) => {
        state.pharmacistsLoading = false;
        state.error = action.payload;
      })

      // Update User Status
      .addCase(updateUserStatus.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.usersLoading = false;
        const { userId, status } = action.payload;
        const idx = state.users.findIndex(u => u.user_id === userId);
        if (idx !== -1) {
          const oldStatus = (state.users[idx].status || 'ACTIVE').toLowerCase();
          state.users[idx].status = status.toUpperCase();
          
          if (oldStatus === 'active') state.userStats.active--;
          if (oldStatus === 'inactive') state.userStats.inactive--;
          
          if (status.toLowerCase() === 'active') state.userStats.active++;
          if (status.toLowerCase() === 'inactive') state.userStats.inactive++;
        }
        state.successMessage = 'User status updated successfully';
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        const deletedUser = state.users.find(u => u.user_id === action.payload);
        if (deletedUser) {
          const status = (deletedUser.status || 'ACTIVE').toLowerCase();
          if (status === 'active') state.userStats.active--;
          if (status === 'inactive') state.userStats.inactive--;
          
          const role = deletedUser.role.toLowerCase();
          if (state.userStats.byRole[role]) {
            state.userStats.byRole[role]--;
          }
        }
        state.users = state.users.filter(u => u.user_id !== action.payload);
        state.successMessage = 'User deleted successfully';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // Fetch Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.doctorsLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.doctorsLoading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.doctorsLoading = false;
        state.error = action.payload;
      })

      // Fetch Receptionists
      .addCase(fetchReceptionists.pending, (state) => {
        state.receptionistsLoading = true;
        state.error = null;
      })
      .addCase(fetchReceptionists.fulfilled, (state, action) => {
        state.receptionistsLoading = false;
        state.receptionists = action.payload;
      })
      .addCase(fetchReceptionists.rejected, (state, action) => {
        state.receptionistsLoading = false;
        state.error = action.payload;
      })

      // Fetch Nurses
      .addCase(fetchNurses.pending, (state) => {
        state.nursesLoading = true;
        state.error = null;
      })
      .addCase(fetchNurses.fulfilled, (state, action) => {
        state.nursesLoading = false;
        state.nurses = action.payload;
      })
      .addCase(fetchNurses.rejected, (state, action) => {
        state.nursesLoading = false;
        state.error = action.payload;
      })

      // Fetch Pharmacists
      .addCase(fetchPharmacists.pending, (state) => {
        state.pharmacistsLoading = true;
        state.error = null;
      })
      .addCase(fetchPharmacists.fulfilled, (state, action) => {
        state.pharmacistsLoading = false;
        state.pharmacists = action.payload;
      })
      .addCase(fetchPharmacists.rejected, (state, action) => {
        state.pharmacistsLoading = false;
        state.error = action.payload;
      })

      // Fetch Visits
      .addCase(fetchVisits.pending, (state) => {
        state.visitsLoading = true;
        state.error = null;
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.visitsLoading = false;
        state.visits = action.payload;
      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.visitsLoading = false;
        state.error = action.payload;
      })

      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.inventoryLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventoryLoading = false;
        state.inventory = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.inventoryLoading = false;
        state.error = action.payload;
      })

      // Fetch System Logs
      .addCase(fetchSystemLogs.pending, (state) => {
        state.logsLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.systemLogs = action.payload;
      })
      .addCase(fetchSystemLogs.rejected, (state, action) => {
        state.logsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminStats, clearError, clearSuccessMessage } = adminSlice.actions;
export default adminSlice.reducer;