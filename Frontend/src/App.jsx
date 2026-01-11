import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext.jsx';

// ProtectedRoute for role-based access
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Login & Role Selection
import Login from './pages/Login/Login.jsx';
import SelectRole from './pages/Login/SelectRole.jsx';

// Pharmacist Pages
import Dashboard from './pages/Pharmacist/Dashboard.tsx';
import Profile from './pages/Pharmacist/Profile.tsx';
import PrescriptionDetailsPage from './pages/Pharmacist/PrescriptionDetailsPage.jsx';
import MedicinePage from './pages/Pharmacist/MedicinePage.jsx';
import AddMedicineStockPage from './pages/Pharmacist/AddMedicineStockPage.jsx';
import ExpiredStockPage from './pages/Pharmacist/ExpiredStock.jsx';
import PendingPrescriptions from './pages/Pharmacist/PendingPrescriptions.jsx';
import PastPrescriptions from './pages/Pharmacist/PastPrescriptions.jsx';

// Admin Layout & Pages
import AdminLayout from './components/Admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UserForm from './pages/admin/UserForm.jsx';
import DoctorManagement from './pages/admin/DoctorManagement.jsx';
import NursesManagement from './pages/admin/NursesManagement.jsx';
import ReceptionistManagement from './pages/admin/ReceptionistManagement.jsx';
import InventoryManagement from './pages/admin/InventoryManagement.jsx';
import VisitManagement from './pages/admin/VisitManagement.jsx';
import ScheduleVisit from './pages/admin/ScheduleVisit.jsx';
import LogsManagement from './pages/admin/LogsManagement.jsx';
import SettingsManagement from './pages/admin/SettingsManagement.jsx';
import PharmacistsManagement from './pages/admin/PharmacistsManagement.jsx';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import VisitDetails from './pages/doctor/VisitDetails.jsx';
import PrescriptionForm from './pages/doctor/PrescriptionForm.jsx';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard.jsx';
import RegisterPatientPage from './pages/receptionist/RegisterPatientPage.jsx';

// Student/Patient Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';

// Lab Tech Pages
import LabTechDashboard from './pages/labtech/LabTechDashboard';
import LabTestsManagement from './pages/labtech/LabTestsManagement';
import LabTestReport from './pages/labtech/LabTestReport';

// Nurse Pages
import NurseDashboard from './pages/Nurse/NurseDashboard.jsx';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SelectRole />} />
            <Route path="/login/:role" element={<Login />} />

            {/* Pharmacist Routes */}
            <Route element={<ProtectedRoute allowedRoles={['PHARMACIST']} />}>
              <Route path="/pharmacist/dashboard" element={<Dashboard />} />
              <Route path="/pharmacist/profile" element={<Profile />} />
              <Route path="/pharmacist/prescriptionsDetails" element={<PrescriptionDetailsPage />} />
              <Route path="/pharmacist/addMedicineStock/:name" element={<AddMedicineStockPage />} />
              <Route path="/pharmacist/medicineStock" element={<MedicinePage />} />
              <Route path="/pharmacist/medicine/add/:name" element={<Dashboard />} />
              <Route path="/pharmacist/expiredStock" element={<ExpiredStockPage />} />
              <Route path="/pharmacist/pendingPrescription" element={<PendingPrescriptions />} />
              <Route path="/pharmacist/pastPrescription" element={<PastPrescriptions />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users/add" element={<UserForm mode="add" />} />
                <Route path="/admin/users/:userId" element={<UserForm mode="view" />} />
                <Route path="/admin/users/:userId/edit" element={<UserForm mode="edit" />} />
                <Route path="/admin/doctors" element={<DoctorManagement />} />
                <Route path="/admin/nurses" element={<NursesManagement />} />
                <Route path="/admin/pharmacists" element={<PharmacistsManagement/>} />
                <Route path="/admin/receptionists" element={<ReceptionistManagement />} />
                <Route path="/admin/inventory" element={<InventoryManagement />} />
                <Route path="/admin/visits" element={<VisitManagement />} />
                <Route path="/admin/visits/new" element={<ScheduleVisit />} />
                <Route path="/admin/logs" element={<LogsManagement />} />
                <Route path="/admin/settings" element={<SettingsManagement />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Route>

            {/* Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/visit/:visitId" element={<VisitDetails />} />
              <Route path="/doctor/prescription/:visitId" element={<PrescriptionForm />} />
            </Route>

            {/* Receptionist Routes */}
            <Route element={<ProtectedRoute allowedRoles={['NURSE_RECEPTIONIST']} />}>
              <Route path="/reception" element={<ReceptionistDashboard />} />
              <Route path="/reception/dashboard" element={<ReceptionistDashboard />} />
              <Route path="/reception/register-patient" element={<RegisterPatientPage />} />
            </Route>

            {/* Nurse Routes */}
            <Route element={<ProtectedRoute allowedRoles={['NURSE_RECEPTIONIST']} />}>
              <Route path="/nurse" element={<NurseDashboard />} />
              <Route path="/nurse/dashboard" element={<NurseDashboard />} />
            </Route>

            {/* Patient/Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
              <Route path="/patient/dashboard" element={<StudentDashboard />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
            </Route>

            {/* Lab Technician Routes */}
            <Route element={<ProtectedRoute allowedRoles={['LAB_TECHNICIAN']} />}>
              <Route path="/labtech/dashboard" element={<LabTechDashboard />} />
              <Route path="/labtech/tests" element={<LabTestsManagement />} />
              <Route path="/labtech/tests/:testId" element={<LabTestReport />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

      </AuthProvider>
    </Provider>
  );
}

export default App;