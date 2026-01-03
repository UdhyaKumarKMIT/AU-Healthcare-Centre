// src/pages/labtech/LabTestReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faDownload, 
  faPrint,
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { fetchTestById, submitTestResults } from '../../store/slices/labTechSlice';
import html2pdf from 'html2pdf.js';
import styles from './LabTestReport.module.css';

const LabTestReport = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reportRef = useRef();
  
  const { currentTest, loading, error } = useSelector((state) => state.labTech);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    result: '',
    normal_range: ''
  });

  useEffect(() => {
    if (testId) {
      dispatch(fetchTestById(testId));
    }
  }, [dispatch, testId]);

  useEffect(() => {
    if (currentTest) {
      setFormData({
        result: currentTest.result || '',
        normal_range: currentTest.normalRange || ''
      });
      setEditMode(!currentTest.result);
    }
  }, [currentTest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await dispatch(submitTestResults({
      testId,
      results: formData
    }));
    
    if (!result.error) {
      setEditMode(false);
      alert('Test results submitted successfully!');
    }
  };

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: `Lab_Report_${currentTest?.patientRollNo || testId}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading test report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/labtech/tests')}>Back to Tests</button>
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div className={styles.errorContainer}>
        <p>Test not found</p>
        <button onClick={() => navigate('/labtech/tests')}>Back to Tests</button>
      </div>
    );
  }

  const isCompleted = currentTest.status === 'completed';

  return (
    <div className={styles.reportContainer}>
      {/* Action Buttons */}
      <div className={`${styles.actionBar} no-print`}>
        <button 
          className={styles.backBtn}
          onClick={() => navigate('/labtech/tests')}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Tests
        </button>
        
        <div className={styles.actionButtons}>
          {isCompleted && (
            <>
              <button 
                className={styles.printBtn}
                onClick={handlePrint}
              >
                <FontAwesomeIcon icon={faPrint} /> Print
              </button>
              <button 
                className={styles.downloadBtn}
                onClick={handleDownloadPDF}
              >
                <FontAwesomeIcon icon={faDownload} /> Download PDF
              </button>
            </>
          )}
          {!isCompleted && !editMode && (
            <button 
              className={styles.editBtn}
              onClick={() => setEditMode(true)}
            >
              Enter Results
            </button>
          )}
        </div>
      </div>

      {/* Lab Report */}
      <div className={styles.reportWrapper}>
        <div ref={reportRef} className={styles.report}>
          {/* Hospital Header */}
          <div className={styles.reportHeader}>
            <div className={styles.hospitalLogo}>
              <h1>MIT Health Centre</h1>
              <p>Laboratory Services</p>
            </div>
            <div className={styles.reportTitle}>
              <h2>LABORATORY REPORT</h2>
              <p className={styles.reportId}>Report ID: {testId.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Patient Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Patient Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Patient Name:</span>
                <span className={styles.infoValue}>{currentTest.patientName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Roll No:</span>
                <span className={styles.infoValue}>{currentTest.patientRollNo}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Age/Gender:</span>
                <span className={styles.infoValue}>
                  {currentTest.dob ? `${new Date().getFullYear() - new Date(currentTest.dob).getFullYear()} years` : 'N/A'} / {currentTest.gender || 'N/A'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Blood Group:</span>
                <span className={styles.infoValue}>{currentTest.bloodGroup || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phone:</span>
                <span className={styles.infoValue}>{currentTest.patientPhone || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Referred By:</span>
                <span className={styles.infoValue}>Dr. {currentTest.doctorName}</span>
              </div>
            </div>
          </div>

          {/* Test Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Test Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Test Name:</span>
                <span className={styles.infoValue}><strong>{currentTest.testName}</strong></span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Sample Collected:</span>
                <span className={styles.infoValue}>
                  {currentTest.orderedDate ? new Date(currentTest.orderedDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Report Date:</span>
                <span className={styles.infoValue}>
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Test Results</h3>
            
            {editMode ? (
              <form onSubmit={handleSubmit} className={styles.resultForm}>
                <div className={styles.formGroup}>
                  <label>Test Result *</label>
                  <textarea
                    value={formData.result}
                    onChange={(e) => setFormData({...formData, result: e.target.value})}
                    required
                    rows="6"
                    placeholder="Enter test results..."
                    className={styles.textarea}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Normal Range</label>
                  <input
                    type="text"
                    value={formData.normal_range}
                    onChange={(e) => setFormData({...formData, normal_range: e.target.value})}
                    placeholder="e.g., 70-100 mg/dL"
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={() => setEditMode(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} /> Submit Results
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.resultsTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Test Parameter</th>
                      <th>Result</th>
                      <th>Normal Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>{currentTest.testName}</strong></td>
                      <td className={styles.resultValue}>
                        {currentTest.result || 'Pending'}
                      </td>
                      <td>{currentTest.normalRange || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer - Only shown when completed */}
          {isCompleted && !editMode && (
            <div className={styles.reportFooter}>
              <div className={styles.signature}>
                <div className={styles.signatureLine}></div>
                <p><strong>Lab Technician</strong></p>
                <p className={styles.technicianName}>Lab Technician One</p>
                <p className={styles.reportDate}>
                  Report Generated: {new Date().toLocaleString()}
                </p>
              </div>
              
              <div className={styles.disclaimer}>
                <p><strong>Note:</strong> This is a computer-generated report and does not require a physical signature.</p>
                <p>For any queries, please contact MIT Health Centre Laboratory: +91-9876543210</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabTestReport;