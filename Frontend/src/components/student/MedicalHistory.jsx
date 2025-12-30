// src/components/student/MedicalHistory.jsx - NO EMOJIS, FONTAWESOME ONLY

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faFileMedical,
  faPrescription,
  faFlask,
  faHeartbeat,
  faCalendarAlt,
  faUserMd,
  faClipboardList,
  faThermometerHalf,
  faTint,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./MedicalHistory.module.css";

const MedicalHistory = () => {
  const { visits, prescriptions, labTests, vitals, medicalHistory, loading } =
    useSelector((state) => state.students);

  const [activeSection, setActiveSection] = useState("visits");

  // ---- GROUP VISITS ----
  const groupedVisits =
    visits?.reduce((acc, visit) => {
      if (!acc[visit.visit_id]) {
        acc[visit.visit_id] = { ...visit, diagnoses: [] };
      }

      if (visit.diagnosis_name) {
        acc[visit.visit_id].diagnoses.push({
          diagnosis_name: visit.diagnosis_name,
          diagnosis_notes: visit.diagnosis_notes,
        });
      }

      return acc;
    }, {}) || {};

  const visitList = Object.values(groupedVisits);

  // ---- GROUP PRESCRIPTIONS ----
  const groupedPrescriptions =
    prescriptions?.reduce((acc, item) => {
      if (!acc[item.prescription_id]) {
        acc[item.prescription_id] = {
          prescription_id: item.prescription_id,
          created_at: item.created_at,
          prescription_status: item.prescription_status,
          doctor_name: item.doctor_name,
          specialization: item.specialization,
          medicines: [],
        };
      }

      acc[item.prescription_id].medicines.push({
        med_name: item.med_name,
        med_type: item.med_type,
        morning: item.morning,
        afternoon: item.afternoon,
        night: item.night,
        total_days: item.total_days,
        food: item.food,
      });

      return acc;
    }, {}) || {};

  const prescriptionList = Object.values(groupedPrescriptions);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading medical records...</p>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      {/* SECTION NAV */}
      <div className={styles.sectionNav}>
        {[
          ["visits", "Visits", faFileMedical, visits],
          ["prescriptions", "Prescriptions", faPrescription, prescriptions],
          ["labs", "Lab Tests", faFlask, labTests],
          ["vitals", "Vitals", faHeartbeat, vitals],
          ["conditions", "Conditions", faClipboardList, medicalHistory],
        ].map(([key, label, icon, data]) => (
          <button
            key={key}
            className={`${styles.sectionButton} ${
              activeSection === key ? styles.active : ""
            }`}
            onClick={() => setActiveSection(key)}
          >
            <FontAwesomeIcon icon={icon} />
            <span>
              {label} ({data?.length || 0})
            </span>
          </button>
        ))}
      </div>

      {/* ================= VISITS ================= */}
      {activeSection === "visits" && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFileMedical} /> Visit History
          </h2>

          {visitList.length === 0 ? (
            <div className={styles.emptyState}>No visit records found</div>
          ) : (
            <div className={styles.cardGrid}>
              {visitList.map((visit) => (
                <div key={visit.visit_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(visit.visit_date)}
                    </span>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[visit.status?.toLowerCase()]
                      }`}
                    >
                      {visit.status}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <p>
                      <b>Doctor:</b> {visit.doctor_name}
                    </p>
                    <p>
                      <b>Visit Type:</b> {visit.visit_type}
                    </p>
                    <p>
                      <b>Reason:</b> {visit.reason}
                    </p>

                    {visit.diagnoses.length > 0 && (
                      <div className={styles.diagnosisBox}>
                        <p className={styles.diagnosisLabel}>Diagnosis</p>
                        {visit.diagnoses.map((d, i) => (
                          <div key={i}>
                            <p>{d.diagnosis_name}</p>
                            {d.diagnosis_notes && (
                              <p className={styles.diagnosisNotes}>
                                {d.diagnosis_notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PRESCRIPTIONS ================= */}
      {activeSection === "prescriptions" && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faPrescription} /> Prescriptions
          </h2>

          {prescriptionList.length === 0 ? (
            <div className={styles.emptyState}>No prescription records</div>
          ) : (
            <div className={styles.cardGrid}>
              {prescriptionList.map((p) => (
                <div key={p.prescription_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span>{formatDate(p.created_at)}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <p>
                      <b>Doctor:</b> {p.doctor_name}
                    </p>

                    {p.medicines.map((m, i) => (
                      <div key={i} className={styles.medicationBox}>
                        <p>{m.med_name}</p>
                        <p>{m.med_type}</p>
                        <p>Morning: {m.morning ? "Yes" : "No"}</p>
                        <p>Afternoon: {m.afternoon ? "Yes" : "No"}</p>
                        <p>Night: {m.night ? "Yes" : "No"}</p>
                        <p>Days: {m.total_days}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Lab Tests Section */}
      {activeSection === "labs" && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faFlask} /> Lab Test Results
          </h2>

          {!labTests || labTests.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No lab test records found</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {labTests.map((test) => (
                <div key={test.lab_test_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(test.ordered_date)}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.testName}>{test.test_name}</h3>

                    <div className={styles.resultBox}>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Result:</span>
                        <span className={styles.resultValue}>
                          {test.result || "Pending"}
                        </span>
                      </div>
                      {test.normal_range && (
                        <div className={styles.resultRow}>
                          <span className={styles.resultLabel}>
                            Normal Range:
                          </span>
                          <span className={styles.normalRange}>
                            {test.normal_range}
                          </span>
                        </div>
                      )}
                    </div>

                    {test.doctor_name && (
                      <div className={styles.infoRow}>
                        <FontAwesomeIcon
                          icon={faUserMd}
                          className={styles.icon}
                        />
                        <span>Ordered by Dr. {test.doctor_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vitals Section */}
      {activeSection === "vitals" && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faHeartbeat} /> Vital Signs History
          </h2>

          {!vitals || vitals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No vital signs records found</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {vitals.map((vital) => (
                <div key={vital.vitals_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardDate}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(vital.visit_date)}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.vitalsGrid}>
                      <div className={styles.vitalItem}>
                        <FontAwesomeIcon
                          icon={faThermometerHalf}
                          className={styles.vitalIcon}
                        />
                        <div>
                          <p className={styles.vitalLabel}>Temperature</p>
                          <p className={styles.vitalValue}>
                            {vital.temperature}°F
                          </p>
                        </div>
                      </div>

                      <div className={styles.vitalItem}>
                        <FontAwesomeIcon
                          icon={faHeartbeat}
                          className={styles.vitalIcon}
                        />
                        <div>
                          <p className={styles.vitalLabel}>Heart Rate</p>
                          <p className={styles.vitalValue}>
                            {vital.heart_rate} bpm
                          </p>
                        </div>
                      </div>

                      <div className={styles.vitalItem}>
                        <FontAwesomeIcon
                          icon={faStethoscope}
                          className={styles.vitalIcon}
                        />
                        <div>
                          <p className={styles.vitalLabel}>Blood Pressure</p>
                          <p className={styles.vitalValue}>
                            {vital.bp_systolic}/{vital.bp_diastolic} mmHg
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Medical Conditions Section */}
      {activeSection === "conditions" && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faClipboardList} /> Medical Conditions
          </h2>

          {!medicalHistory || medicalHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No medical conditions recorded</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {medicalHistory.map((condition) => (
                <div key={condition.history_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.conditionName}>
                      {condition.condition_name}
                    </h3>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[condition.status?.toLowerCase()]
                      }`}
                    >
                      {condition.status}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <p className={styles.label}>Since:</p>
                      <p className={styles.value}>
                        {formatDate(condition.since_date)}
                      </p>
                    </div>

                    {condition.notes && (
                      <div className={styles.notesBox}>
                        <p className={styles.notesLabel}>Notes:</p>
                        <p className={styles.notesText}>{condition.notes}</p>
                      </div>
                    )}

                    <p className={styles.recordedDate}>
                      Recorded on {formatDate(condition.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
