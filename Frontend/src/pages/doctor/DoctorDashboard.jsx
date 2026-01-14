// src/pages/doctor/DoctorDashboard.jsx - WITH REAL MEDICINE API

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchPatientQueue,
  fetchPatientHistory,
  clearPatientHistory,
} from "../../store/slices/queueSlice";
import { updateVisitStatus } from "../../store/slices/doctorsSlice";
import PatientQueue from "../../components/doctor/PatientQueue";
import DiagnosisSummary from "../../components/doctor/DiagnosisSummary";
import MedicineRow from "../../components/doctor/MedicineRow";
import PatientHistoryModal from "../../components/doctor/PatientHistoryModal";
import Header from "../../components/Header/Header";
import { toast } from 'react-toastify';
import styles from "./DoctorDashboard.module.css";

const API_BASE = "http://localhost:5000";

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const doctorId = user?.user_id || user?.doctor_id;

  // Redux state
  const {
    patients,
    loading,
    error,
    lastFetched,
    patientHistory,
    historyLoading,
    historyError,
  } = useSelector((state) => state.queue);
  const { updateLoading } = useSelector((state) => state.doctors || {});

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [diagnosisSaved, setDiagnosisSaved] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState({
    diagnosis_name: '',
    diagnosis_code: '',
    complaints: '',
    remarks: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [nurses, setNurses] = useState([]); // For nurse assignments
  const [todayVisitsCount, setTodayVisitsCount] = useState(0); // Today's visits count
  const [nurseTaskTypes, setNurseTaskTypes] = useState([]); // Available nurse task types
  const [nurseTasks, setNurseTasks] = useState([]); // Nurse tasks to be created
  const [medicines, setMedicines] = useState([
    {
      medicineId: null,
      name: "",
      type: "",
      nurse_id: "",
      route: "",
      infusionDuration: null,
      whenToTake: "After Food",
      timing: { morning: false, afternoon: false, night: false },
      duration: 1,
    },
  ]);
  const [medicineSearchResults, setMedicineSearchResults] = useState([]);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState(null);

  // Load patients from Redux on mount
  useEffect(() => {
    if (doctorId) {
      dispatch(fetchPatientQueue(doctorId));

      // Fetch today's visits count
      fetchTodayVisitsCount();

      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchPatientQueue(doctorId));
        fetchTodayVisitsCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [dispatch, doctorId]);

  // Fetc

  const fetchTodayVisitsCount = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const response = await fetch(
        `${API_BASE}/api/doctor/visits/today?doctor_id=${doctorId}&date=${today}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTodayVisitsCount(data.count || 0);
      } else {
        console.error("Failed to fetch today's visits count");
        setTodayVisitsCount(0);
      }
    } catch (error) {
      console.error("Error fetching today's visits count:", error);
      setTodayVisitsCount(0);
    }
  };

  // Fetch nurses on mount
  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {

    try {
      const url = `${API_BASE}/api/doctor/nurses`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setNurses(data.nurses || []);
      } else {
        const errorText = await response.text();
        console.error("❌ DEBUG: Failed to fetch nurses");
        console.error("❌ DEBUG: Error response:", errorText);
        setNurses([]);
      }
    } catch (error) {
      console.error("❌ DEBUG: Error fetching nurses:", error);
      console.error("❌ DEBUG: Error stack:", error.stack);
      setNurses([]);
    }
  };

  const fetchNurseTaskTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/doctor/nurse-task-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNurseTaskTypes(data.data || []);
      } else {
        console.error("❌ Failed to fetch nurse task types");
        setNurseTaskTypes([]);
      }
    } catch (error) {
      console.error("❌ Error fetching nurse task types:", error);
      setNurseTaskTypes([]);
    }
  };

  // Sync selected patient with Redux state
  useEffect(() => {
    if (selectedPatient) {
      const updatedPatient = patients.find(
        (p) => p.visitId === selectedPatient.visitId
      );
      if (updatedPatient && updatedPatient.status !== selectedPatient.status) {
        setSelectedPatient(updatedPatient);
      }
    }
  }, [patients, selectedPatient]);

  const handleStatusUpdate = async (visitId, newStatus) => {
    try {
      await dispatch(
        updateVisitStatus({ visitId, status: newStatus })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error('Failed to update visit status');
    }
  };

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);

    // Check if patient is already diagnosed - fetch existing diagnoses
    if (patient.status === "DIAGNOSED" || patient.status === "PRESCRIBED" || patient.status === "PHARMACY" || patient.status === "COMPLETED") {
      await fetchExistingDiagnoses(patient.visitId);
      setShowDiagnosisForm(false); // Hide form if patient already diagnosed
    } else {
      // Reset for new diagnosis
      setDiagnoses([]);
      setDiagnosisSaved(false);
      setShowDiagnosisForm(true); // Show form for new diagnosis
    }

    // Auto-update status to IN_PROGRESS if SCHEDULED
    if (patient.status === "SCHEDULED") {
      await handleStatusUpdate(patient.visitId, "ONGOING");
    }
  };

  const fetchExistingDiagnoses = async (visitId) => {
    try {
      const response = await fetch(`${API_BASE}/api/doctor/visit/${visitId}/diagnoses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch diagnoses");

      const result = await response.json();

      if (result.diagnoses && result.diagnoses.length > 0) {
        setDiagnoses(result.diagnoses);
        setDiagnosisSaved(true); // Mark as already saved
      } else {
        setDiagnoses([]);
        setDiagnosisSaved(false);
      }
    } catch (error) {
      console.error("❌ Error fetching existing diagnoses:", error);
      setDiagnoses([]);
      setDiagnosisSaved(false);
    }
  };

  const handleViewHistory = async (patientId) => {
    setShowHistoryModal(true);
    await dispatch(fetchPatientHistory(patientId));
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
    dispatch(clearPatientHistory());
  };

  const addDiagnosis = () => {
    if (!currentDiagnosis.diagnosis_name.trim()) {
      toast.error('Please enter diagnosis name');
      return;
    }
    
    if (editingId) {
      // Update existing diagnosis
      setDiagnoses(diagnoses.map(d => 
        d.id === editingId 
          ? { ...currentDiagnosis, id: editingId, createdAt: d.createdAt }
          : d
      ));
      setEditingId(null);
    } else {
      // Add new diagnosis
      const newDiagnosis = {
        ...currentDiagnosis,
        id: Date.now(), // Temporary ID for frontend
        createdAt: new Date().toISOString()
      };
      setDiagnoses([...diagnoses, newDiagnosis]);
    }
    
    setCurrentDiagnosis({
      diagnosis_name: '',
      diagnosis_code: '',
      complaints: '',
      remarks: ''
    });
    
    // Hide form after adding diagnosis
    setShowDiagnosisForm(false);
  };

  const removeDiagnosis = (id) => {
    setDiagnoses(diagnoses.filter(d => d.id !== id));
    // If currently editing this diagnosis, clear the form
    if (editingId === id) {
      setEditingId(null);
      setCurrentDiagnosis({
        diagnosis_name: '',
        diagnosis_code: '',
        complaints: '',
        remarks: ''
      });
    }
  };

  const editDiagnosis = (id) => {
    const diagnosis = diagnoses.find(d => d.id === id);
    if (diagnosis) {
      setCurrentDiagnosis({
        diagnosis_name: diagnosis.diagnosis_name,
        diagnosis_code: diagnosis.diagnosis_code,
        complaints: diagnosis.complaints,
        remarks: diagnosis.remarks
      });
      setEditingId(id);
      setShowDiagnosisForm(true); // Show form when editing
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCurrentDiagnosis({
      diagnosis_name: '',
      diagnosis_code: '',
      complaints: '',
      remarks: ''
    });
    setShowDiagnosisForm(false); // Hide form when canceling edit
  };

  const saveDiagnoses = async () => {
    if (diagnoses.length === 0) {
      toast.error('Please add at least one diagnosis');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/doctor/diagnoses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visit_id: selectedPatient.visitId,
          doctor_id: doctorId,
          diagnoses: diagnoses.map(d => ({
            diagnosis_code: d.diagnosis_code || null,
            diagnosis_name: d.diagnosis_name,
            complaints: d.complaints || null,
            remarks: d.remarks || null,
          }))
        }),
      });

      if (!response.ok) throw new Error("Failed to save diagnoses");

      const result = await response.json();

      // Update status to DIAGNOSED
      await handleStatusUpdate(selectedPatient.visitId, "DIAGNOSED");

      toast.success(`${diagnoses.length} diagnosis(es) saved successfully!`);
      
      // Mark as saved and clear form (keep diagnoses for display in summary)
      setDiagnosisSaved(true);
      setCurrentDiagnosis({
        diagnosis_name: '',
        diagnosis_code: '',
        complaints: '',
        remarks: ''
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving diagnoses:", error);
      toast.error("Failed to save diagnoses: " + error.message);
    }
  };

  const savePrescription = async () => {
    try {
      // Validation
      const hasEmptyMedicine = medicines.some(
        (m) => !m.medicineId || !m.duration
      );

      // Check injectable-specific requirements
      const hasInvalidInjectable = medicines.some((m) => {
        const isInjectable = m.type === "Injection" || m.type === "DRIP";
        if (isInjectable) {
          return !m.nurse_id || !m.route;
        }
        return false;
      });

      // Check DRIP-specific requirements
      const hasInvalidDrip = medicines.some((m) => {
        if (m.type === "DRIP") {
          return !m.infusionDuration || m.infusionDuration < 5;
        }
        return false;
      });

      // Check non-injectable timing requirements
      const hasNoTiming = medicines.some((m) => {
        const isInjectable = m.type === "Injection" || m.type === "DRIP";
        if (!isInjectable) {
          return !m.timing.morning && !m.timing.afternoon && !m.timing.night;
        }
        return false;
      });

      if (hasEmptyMedicine) {
        toast.error('Please fill all required medicine fields');
        return;
      }

      if (hasInvalidInjectable) {
        toast.error('Please assign nurse and route for all injections/drips');
        return;
      }

      if (hasInvalidDrip) {
        toast.error('Please set infusion duration (minimum 5 mins) for all drips');
        return;
      }

      if (hasNoTiming) {
        toast.error('Please select at least one timing for non-injectable medicines');
        return;
      }

      // Transform medicines for the new API
      const transformed = medicines.map((m) => {
        const isInjectable = m.type === "Injection" || m.type === "DRIP";

        const baseData = {
          medicine_id: m.medicineId,
          duration_days: Number(m.duration),
        };

        if (isInjectable) {
          // For injections and drips (will create nurse tasks)
          return {
            ...baseData,
            nurse_id: m.nurse_id,
            route: m.route,
            infusion_duration:
              m.type === "DRIP" ? Number(m.infusionDuration) : null,
          };
        } else {
          // For other medicines (regular prescription)
          return {
            ...baseData,
            food:
              m.whenToTake === "Before Food"
                ? "BEFORE"
                : m.whenToTake === "With Food"
                ? "WITH"
                : "AFTER",
            morning: m.timing.morning,
            afternoon: m.timing.afternoon,
            night: m.timing.night,
          };
        }
      });

      // Use the new endpoint that handles both prescriptions and nurse tasks
      const prescriptionResponse = await fetch(
        `${API_BASE}/api/doctor/prescription-with-tasks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visit_id: selectedPatient.visitId,
            doctor_id: doctorId,
            medicines: transformed,
          }),
        }
      );

      if (!prescriptionResponse.ok) {
        const errorData = await prescriptionResponse.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            errorData?.error ||
            "Failed to save prescription"
        );
      }

      const result = await prescriptionResponse.json();

      // Save nurse tasks if any
      if (nurseTasks.length > 0) {
        for (const task of nurseTasks) {
          try {
            const taskResponse = await fetch(`${API_BASE}/api/doctor/nurse-task`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                visit_id: selectedPatient.visitId,
                doctor_id: doctorId,
                task_type_id: task.task_type_id,
                instructions: task.instructions || ""
              }),
            });
          } catch (error) {
            // Nurse task creation failed
          }
        }
      }

      // Show success message with nurse task info
      const nurseTaskMsg =
        result.data.nurse_tasks_created > 0 || nurseTasks.length > 0
          ? ` ${result.data.nurse_tasks_created + nurseTasks.length} nurse task(s) created.`
          : "";

      toast.success(`Visit completed successfully!${nurseTaskMsg}`);

      // Update status to COMPLETED
      await handleStatusUpdate(selectedPatient.visitId, "COMPLETED");

      // Reset state
      setShowPrescriptionModal(false);
      setSelectedPatient(null);
      setDiagnoses([]);
      setDiagnosisSaved(false);
      setCurrentDiagnosis({
        diagnosis_name: '',
        diagnosis_code: '',
        complaints: '',
        remarks: ''
      });
      setEditingId(null);
      setNurseTasks([]); // Clear nurse tasks
      setMedicines([
        {
          medicineId: null,
          name: "",
          type: "",
          nurse_id: "",
          route: "",
          infusionDuration: null,
          whenToTake: "After Food",
          timing: { morning: false, afternoon: false, night: false },
          duration: 1,
        },
      ]);

      // Reload queue and update visit counts
      dispatch(fetchPatientQueue(doctorId));
      await fetchTodayVisitsCount();
    } catch (error) {
      console.error("Error:", error);
      toast.error('Failed to save prescription: ' + error.message);
    }
  };

  const handleSelectMedicine = (index, medicine) => {
    const newMeds = [...medicines];
    newMeds[index] = {
      ...newMeds[index],
      medicineId: medicine.id,
      name: medicine.name,
      type: medicine.type,
      available_stock: medicine.available_stock,
      stock_details: medicine.stock_details
    };
    setMedicines(newMeds);
    setMedicineSearchResults([]);
  };

  const handleMedicineSearch = async (query) => {
    if (!query || query.length < 2) {
      setMedicineSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/doctor/medicines?search=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Backend returns { success: true, data: [...] }
        setMedicineSearchResults(data.data || []);
      } else {
        setMedicineSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching medicines:', error);
      setMedicineSearchResults([]);
    }
  };

  const waitingCount = patients.filter(
    (p) => p.status === "SCHEDULED"
  ).length;

    if (loading && patients.length === 0) {
      return (
        <div className={styles.dashboard}>
          <Header />
          <main className={styles.mainContent}>
            <div style={{ textAlign: "center", padding: "50px" }}>
              <p>Loading patient queue...</p>
            </div>
          </main>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.dashboard}>
          <Header />
          <main className={styles.mainContent}>
            <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
              <p>Error loading patients: {error}</p>
              <button onClick={() => dispatch(fetchPatientQueue(doctorId))}>
                Retry
              </button>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className={styles.dashboard}>
        <Header />

        <main className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.doctorInfo}>
                <h1 className={styles.doctorName}>
                  Dr. {user.name || user.email}
                </h1>
                <p className={styles.specialization}>Doctor Dashboard</p>
                {lastFetched && (
                  <p style={{ fontSize: "12px", color: "#64748b" }}>
                    Last updated: {new Date(lastFetched).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <strong>{todayVisitsCount}</strong> Today's Visits
                </div>
                <div className={styles.statItem}>
                  <strong>{waitingCount}</strong> Waiting
                </div>
              </div>
            </div>

            {updateLoading && (
              <div
                style={{
                  position: "fixed",
                  bottom: "20px",
                  right: "20px",
                  background: "#3b82f6",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                }}
              >
                Updating visit status...
              </div>
            )}

            <div className={styles.content}>
              <div className={styles.queueSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Patient Queue</h2>
                  <span className={styles.queueCount}>
                    {patients.length} patients
                  </span>
                </div>
                <PatientQueue
                  patients={patients}
                  loading={loading}
                  onPatientSelect={handlePatientSelect}
                  onPatientClick={(id) => {
                    const patient = patients.find((p) => p.visitId === id);
                    if (patient) handlePatientSelect(patient);
                  }}
                  selectedPatient={selectedPatient}
                  onStatusUpdate={handleStatusUpdate}
                  onViewHistory={handleViewHistory}
                />
              </div>

              <div className={styles.diagnosisSection}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Diagnosis & Treatment</h2>
                </div>

                {/* Patient Information - Moved to top */}
                {selectedPatient && (
                  <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a237e", margin: 0 }}>
                        Patient Information
                      </h3>
                      <span style={{
                        background: selectedPatient.patientType === 'STUDENT' ? '#dbeafe' : selectedPatient.patientType === 'PERMANENT_STAFF' ? '#dcfce7' : '#fef3c7',
                        color: selectedPatient.patientType === 'STUDENT' ? '#1e3a8a' : selectedPatient.patientType === 'PERMANENT_STAFF' ? '#14532d' : '#78350f',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {selectedPatient.patientType?.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                      <div>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, display: "block", marginBottom: "4px" }}>FULL NAME</span>
                        <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>{selectedPatient.patientName}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, display: "block", marginBottom: "4px" }}>AGE / DOB</span>
                        <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>
                          {selectedPatient.age} years
                          {selectedPatient.patientDob && (
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 400, marginLeft: "6px" }}>
                              ({new Date(selectedPatient.patientDob).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, display: "block", marginBottom: "4px" }}>GENDER</span>
                        <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>{selectedPatient.gender}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, display: "block", marginBottom: "4px" }}>BLOOD GROUP</span>
                        <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>{selectedPatient.bloodGroup || 'N/A'}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, display: "block", marginBottom: "4px" }}>VISIT TYPE</span>
                        <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>{selectedPatient.visitType}</div>
                      </div>
                      {selectedPatient.patientAllergies && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, display: "block", marginBottom: "4px" }}>⚠️ ALLERGIES</span>
                          <div style={{ 
                            fontSize: "14px", 
                            color: "#ef4444", 
                            fontWeight: 600,
                            background: "#fef2f2",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #fecaca"
                          }}>
                            {selectedPatient.patientAllergies}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vitals Section */}
                    {selectedPatient.vitals && (
                      <div style={{ marginTop: "20px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#1a237e", marginBottom: "12px" }}>
                          Vital Signs
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                          {selectedPatient.vitals.temperature && (
                            <div style={{ background: "#fef3c7", padding: "12px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                              <div style={{ fontSize: "11px", color: "#92400e", fontWeight: 600, marginBottom: "4px" }}>TEMPERATURE</div>
                              <div style={{ fontSize: "20px", fontWeight: 700, color: "#78350f" }}>{selectedPatient.vitals.temperature}°F</div>
                            </div>
                          )}
                          {(selectedPatient.vitals.bp_systolic || selectedPatient.vitals.bp_diastolic) && (
                            <div style={{ background: "#fecaca", padding: "12px", borderRadius: "8px", border: "1px solid #fca5a5" }}>
                              <div style={{ fontSize: "11px", color: "#7f1d1d", fontWeight: 600, marginBottom: "4px" }}>BLOOD PRESSURE</div>
                              <div style={{ fontSize: "20px", fontWeight: 700, color: "#7f1d1d" }}>{selectedPatient.vitals.bp_systolic}/{selectedPatient.vitals.bp_diastolic}</div>
                              <div style={{ fontSize: "10px", color: "#991b1b" }}>mmHg</div>
                            </div>
                          )}
                          {selectedPatient.vitals.heart_rate && (
                            <div style={{ background: "#fecdd3", padding: "12px", borderRadius: "8px", border: "1px solid #fda4af" }}>
                              <div style={{ fontSize: "11px", color: "#881337", fontWeight: 600, marginBottom: "4px" }}>HEART RATE</div>
                              <div style={{ fontSize: "20px", fontWeight: 700, color: "#881337" }}>{selectedPatient.vitals.heart_rate}</div>
                              <div style={{ fontSize: "10px", color: "#9f1239" }}>bpm</div>
                            </div>
                          )}
                          {selectedPatient.vitals.spo2 && (
                            <div style={{ background: "#dbeafe", padding: "12px", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                              <div style={{ fontSize: "11px", color: "#1e3a8a", fontWeight: 600, marginBottom: "4px" }}>SpO2</div>
                              <div style={{ fontSize: "20px", fontWeight: 700, color: "#1e3a8a" }}>{selectedPatient.vitals.spo2}%</div>
                            </div>
                          )}
                          {selectedPatient.vitals.cbg && (
                            <div style={{ background: "#e0e7ff", padding: "12px", borderRadius: "8px", border: "1px solid #c7d2fe" }}>
                              <div style={{ fontSize: "11px", color: "#3730a3", fontWeight: 600, marginBottom: "4px" }}>BLOOD SUGAR</div>
                              <div style={{ fontSize: "20px", fontWeight: 700, color: "#3730a3" }}>{selectedPatient.vitals.cbg}</div>
                              <div style={{ fontSize: "10px", color: "#4338ca" }}>mg/dL</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedPatient && !diagnosisSaved && (
                  <div
                    style={{
                      padding: "24px",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        background: "#f0f9ff",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        border: "1px solid #bae6fd",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#0c4a6e",
                          margin: 0,
                        }}
                      >
                        <strong>Patient:</strong> {selectedPatient.patientName}{" "}
                        |<strong> Status:</strong>{" "}
                        <span
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            marginLeft: "4px",
                          }}
                        >
                          {selectedPatient.status}
                        </span>
                      </p>
                    </div>

                    {/* Add Diagnosis Button - shown when form is hidden and diagnoses exist */}
                    {!showDiagnosisForm && diagnoses.length > 0 && (
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                        <button
                          onClick={() => setShowDiagnosisForm(true)}
                          style={{
                            padding: "10px 20px",
                            background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          + Add Diagnosis
                        </button>
                      </div>
                    )}

                    {/* Diagnosis Form - shown based on state */}
                    {showDiagnosisForm && (
                      <>
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#1a237e",
                            marginBottom: "16px",
                          }}
                        >
                          {editingId ? 'Edit Diagnosis' : 'Add Diagnosis'}
                        </h3>
                        <div style={{ marginBottom: "16px" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: 600,
                              marginBottom: "6px",
                            }}
                          >
                            Patient Complaints *
                          </label>
                          <textarea
                        value={currentDiagnosis.complaints}
                        onChange={(e) => setCurrentDiagnosis({...currentDiagnosis, complaints: e.target.value})}
                        placeholder="What symptoms/complaints did the patient report?"
                        rows="3"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "14px",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: 600,
                          marginBottom: "6px",
                        }}
                      >
                        Diagnosis Name *
                      </label>
                      <input
                        type="text"
                        value={currentDiagnosis.diagnosis_name}
                        onChange={(e) => setCurrentDiagnosis({...currentDiagnosis, diagnosis_name: e.target.value})}
                        placeholder="e.g., Common Cold, Fever"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: 600,
                          marginBottom: "6px",
                        }}
                      >
                        Diagnosis Code
                      </label>
                      <input
                        type="text"
                        value={currentDiagnosis.diagnosis_code}
                        onChange={(e) => setCurrentDiagnosis({...currentDiagnosis, diagnosis_code: e.target.value})}
                        placeholder="e.g., J00, R50.9"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: 600,
                          marginBottom: "6px",
                        }}
                      >
                        Doctor's Remarks
                      </label>
                      <textarea
                        value={currentDiagnosis.remarks}
                        onChange={(e) => setCurrentDiagnosis({...currentDiagnosis, remarks: e.target.value})}
                        placeholder="Additional notes, observations, treatment plan..."
                        rows="4"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "14px",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={addDiagnosis}
                        style={{
                          padding: "12px 24px",
                          background: editingId 
                            ? "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                            : "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          flex: 1
                        }}
                      >
                        {editingId ? '✏️ Update Diagnosis' : '+ Add Diagnosis'}
                      </button>
                      {editingId && (
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: "12px 24px",
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            flex: 1
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    </>
                    )}
                    
                    {/* Show added diagnoses */}
                    {diagnoses.length > 0 && (
                      <div style={{ marginTop: showDiagnosisForm ? "20px" : "0" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "#1e293b" }}>Added Diagnoses ({diagnoses.length})</h4>
                        {diagnoses.map((diag, index) => (
                          <div key={diag.id} style={{
                            background: editingId === diag.id ? "#fef3c7" : "#f8fafc",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "8px",
                            border: editingId === diag.id ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                            position: "relative"
                          }}>
                            <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => editDiagnosis(diag.id)}
                                disabled={editingId && editingId !== diag.id}
                                style={{
                                  background: "#3b82f6",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                  cursor: editingId && editingId !== diag.id ? "not-allowed" : "pointer",
                                  opacity: editingId && editingId !== diag.id ? 0.5 : 1
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeDiagnosis(diag.id)}
                                disabled={editingId === diag.id}
                                style={{
                                  background: editingId === diag.id ? "#9ca3af" : "#ef4444",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                  cursor: editingId === diag.id ? "not-allowed" : "pointer"
                                }}
                              >
                                Remove
                              </button>
                            </div>
                            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                              <strong>#{index + 1}: {diag.diagnosis_name}</strong>
                              {diag.diagnosis_code && <span style={{ marginLeft: "8px", color: "#64748b" }}>({diag.diagnosis_code})</span>}
                            </div>
                            {diag.complaints && (
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                <strong>Complaints:</strong> {diag.complaints}
                              </div>
                            )}
                            {diag.remarks && (
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                <strong>Remarks:</strong> {diag.remarks}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Save All button below the cards */}
                        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
                          <button
                            onClick={saveDiagnoses}
                            disabled={updateLoading}
                            style={{
                              padding: "12px 32px",
                              background: updateLoading
                                ? "#cbd5e1"
                                : "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: 600,
                              cursor: updateLoading ? "not-allowed" : "pointer",
                              minWidth: "200px",
                            }}
                          >
                            {updateLoading ? "Saving..." : `💾 Save All (${diagnoses.length})`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}  

                <DiagnosisSummary
                  patient={selectedPatient}
                  diagnoses={diagnoses}
                  onProceedToPrescription={() => {
                    setShowPrescriptionModal(true);
                    fetchNurseTaskTypes();
                  }}
                />

                {/* Refer to Other Hospital */}
                {selectedPatient && diagnosisSaved && diagnoses.length > 0 && (
                  <div style={{ padding: "24px", borderTop: "1px solid #e2e8f0" }}>
                    <button
                      onClick={async () => {
                        const referralReason = prompt("Enter referral reason (e.g., specialized treatment required, advanced care needed):");
                        
                        if (!referralReason) {
                          return;
                        }

                        const confirmed = window.confirm(
                          `Are you sure you want to refer ${selectedPatient.patientName} to another hospital?\n\nThis will complete the visit without prescription.`
                        );

                        if (!confirmed) return;

                        try {
                          // Complete visit with referral note
                          const response = await fetch(
                            `${API_BASE}/api/doctor/visit/${selectedPatient.visitId}/complete`,
                            {
                              method: "PATCH",
                              headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                status: "COMPLETED",
                                remarks: `REFERRED TO OTHER HOSPITAL: ${referralReason}`,
                              }),
                            }
                          );

                          if (!response.ok) throw new Error("Failed to complete referral");

                          toast.success(`Patient referred successfully. Reason: ${referralReason}`);

                          // Reset and refresh
                          setSelectedPatient(null);
                          setDiagnoses([]);
                          setDiagnosisSaved(false);
                          setCurrentDiagnosis({
                            diagnosis_name: '',
                            diagnosis_code: '',
                            complaints: '',
                            remarks: ''
                          });
                          setEditingId(null);
                          dispatch(fetchPatientQueue(doctorId));
                          await fetchTodayVisitsCount();
                        } catch (error) {
                          console.error("Error referring patient:", error);
                          toast.error('Failed to complete referral. Please try again.');
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>🏥</span>
                      Refer to Other Hospital (Can't Handle)
                    </button>
                    <p style={{ 
                      fontSize: "12px", 
                      color: "#64748b", 
                      marginTop: "8px", 
                      textAlign: "center",
                      fontStyle: "italic" 
                    }}>
                      Use this when patient requires specialized treatment not available here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Prescription Modal */}
        {showPrescriptionModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "32px",
                borderRadius: "12px",
                width: "90%",
                maxWidth: "1200px",
                maxHeight: "90vh",
                overflow: "auto",
              }}
            >
              <h2 style={{ marginBottom: "24px", color: "#1a237e" }}>
                Create Prescription for {selectedPatient.patientName}
              </h2>

              {/* MANUAL DEBUG BUTTON */}
              {medicines.map((med, i) => {
                return (
                  <MedicineRow
                    key={i}
                    index={i + 1}
                    medicine={med}
                    suggestions={
                      activeMedicineIndex === i ? medicineSearchResults : []
                    }
                    showSuggestions={activeMedicineIndex === i}
                    nurses={nurses}
                    onChange={(updates) => {
                      const newMeds = [...medicines];
                      newMeds[i] = { ...newMeds[i], ...updates };
                      setMedicines(newMeds);
                    }}
                    onSearch={handleMedicineSearch}
                    onSelectMedicine={(medicine) =>
                      handleSelectMedicine(i, medicine)
                    }
                    onRemove={() => {
                      if (medicines.length > 1) {
                        setMedicines(medicines.filter((_, idx) => idx !== i));
                      } else {
                        toast.error('At least one medicine is required');
                      }
                    }}
                    onFocus={() => setActiveMedicineIndex(i)}
                    onBlur={() =>
                      setTimeout(() => setActiveMedicineIndex(null), 200)
                    }
                  />
                );
              })}

              <button
                onClick={() =>
                  setMedicines([
                    ...medicines,
                    {
                      medicineId: null,
                      name: "",
                      type: "",
                      nurse_id: "",
                      route: "",
                      infusionDuration: null,
                      whenToTake: "After Food",
                      timing: {
                        morning: false,
                        afternoon: false,
                        night: false,
                      },
                      duration: 1,
                    },
                  ])
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#f8fafc",
                  border: "2px dashed #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: "16px",
                  color: "#1a237e",
                }}
              >
                + Add Medicine
              </button>

              {/* Nurse Tasks Section */}
              <div style={{ marginTop: "32px", padding: "24px", background: "#f1f5f9", borderRadius: "8px" }}>
                <h3 style={{ color: "#1a237e", marginBottom: "16px", fontSize: "16px", fontWeight: 600 }}>
                  Nurse Tasks
                </h3>
                
                {nurseTasks.map((task, idx) => (
                  <div key={idx} style={{ 
                    background: "white", 
                    padding: "16px", 
                    borderRadius: "8px", 
                    marginBottom: "12px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: "#1a237e" }}>
                          {nurseTaskTypes.find(t => t.task_type_id === task.task_type_id)?.task_name || 'Unknown Task'}
                        </strong>
                        {task.instructions && (
                          <p style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: "14px" }}>
                            {task.instructions}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setNurseTasks(nurseTasks.filter((_, i) => i !== idx))}
                        style={{
                          padding: "6px 12px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                          marginLeft: "12px"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ 
                  background: "white", 
                  padding: "16px", 
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                        Task Type
                      </label>
                      <select
                        id="nurseTaskType"
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "#1e293b"
                        }}
                      >
                        <option value="">Select a task...</option>
                        {nurseTaskTypes.map(taskType => (
                          <option key={taskType.task_type_id} value={taskType.task_type_id}>
                            {taskType.task_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                        Instructions
                      </label>
                      <input
                        type="text"
                        id="nurseTaskInstructions"
                        placeholder="Enter instructions..."
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "#1e293b"
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const taskTypeSelect = document.getElementById('nurseTaskType');
                        const instructionsInput = document.getElementById('nurseTaskInstructions');
                        const task_type_id = taskTypeSelect.value;
                        const instructions = instructionsInput.value;

                        if (!task_type_id) {
                          toast.error('Please select a task type');
                          return;
                        }

                        setNurseTasks([...nurseTasks, { task_type_id, instructions }]);
                        taskTypeSelect.value = '';
                        instructionsInput.value = '';
                      }}
                      style={{
                        marginTop: "28px",
                        padding: "10px 20px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      Add Task
                    </button>
                  </div>
                </div>
                
                {nurseTaskTypes.length === 0 && (
                  <p style={{ color: "#64748b", fontSize: "14px", fontStyle: "italic", marginTop: "12px" }}>
                    No task types available. Please populate the nurse_task_master table.
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  onClick={savePrescription}
                  disabled={updateLoading}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: updateLoading
                      ? "#cbd5e1"
                      : "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: updateLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {updateLoading
                    ? "Saving..."
                    : "Save Prescription & Complete Visit"}
                </button>
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patient History Modal */}
        {showHistoryModal && (
          <PatientHistoryModal
            history={patientHistory}
            loading={historyLoading}
            error={historyError}
            onClose={handleCloseHistory}
          />
        )}
      </div>
    );
  };

export default DoctorDashboard;
