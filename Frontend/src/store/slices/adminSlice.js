// src/store/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const initialState = {
  stats: {
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    todayVisits: 0,
    newPatientsToday: 0,
  },
  patientOverview: {
    demographics: {},
    visitTrends: [],
  },
  users: [],
  doctors: [],
  receptionists: [],
  visits: [],
  userStats: {
    active: 0,
    inactive: 0,
    pending: 0,
    suspended: 0,
    byRole: {}
  },
  loading: false,
  usersLoading: false,
  doctorsLoading: false,
  receptionistsLoading: false,
  visitsLoading: false,
  error: null,
  successMessage: null,
  nurses: [],
pharmacists: [],
inventory: [],
systemLogs: [],
nursesLoading: false,
pharmacistsLoading: false,
inventoryLoading: false,
logsLoading: false,

};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch stats');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch patient overview');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to create doctor');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new receptionist (uses createUser endpoint with role: 'RECEPTIONIST')
export const createReceptionist = createAsyncThunk(
  'admin/createReceptionist',
  async (receptionistData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...receptionistData, role: 'RECEPTIONIST' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create receptionist');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user status
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user status');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch doctors');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch receptionists');
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
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch visits');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchNurses = createAsyncThunk(
  'admin/fetchNurses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/nurses`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error((await res.json()).message);
      return (await res.json()).data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchPharmacists = createAsyncThunk(
  'admin/fetchPharmacists',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/pharmacists`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error((await res.json()).message);
      return (await res.json()).data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchInventory = createAsyncThunk(
  'admin/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/inventory`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error((await res.json()).message);
      return (await res.json()).data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchSystemLogs = createAsyncThunk(
  'admin/fetchSystemLogs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/logs`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error((await res.json()).message);
      return (await res.json()).data;
    } catch (e) {
      return rejectWithValue(e.message);
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

        const stats = { active: 0, inactive: 0, pending: 0, suspended: 0, byRole: {} };
        action.payload.forEach(user => {
          const status = user.status || 'active';
          stats[status]++;
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
          const oldStatus = state.users[idx].status || 'active';
          state.users[idx].status = status;
          state.userStats[oldStatus]--;
          state.userStats[status]++;
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