import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateDoctorAvailability,
  selectDoctorsLoading
} from '../../store/slices/receptionistSlice';
import styles from './DoctorAvailabilityTable.module.css';

const DoctorAvailabilityTable = ({ doctors = [] }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectDoctorsLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (doctorId, newStatus) => {
    setUpdatingId(doctorId);
    await dispatch(updateDoctorAvailability({ doctorId, status: newStatus }));
    setUpdatingId(null);
  };

  const getStatusBadge = (status) => {
    if (status === 'AVAILABLE') {
      return <span className={styles.statusAvailable}>Available</span>;
    }
    return <span className={styles.statusUnavailable}>Unavailable</span>;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Doctor Availability</h2>
          <p className={styles.sectionSubtitle}>Update doctor availability status</p>
        </div>
        
        <div className={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            placeholder="Search by doctor name or specialization..."
          />
          {searchQuery && (
            <button 
              className={styles.clearSearch}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {filteredDoctors.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No doctors found matching "{searchQuery}"</p>
          <button 
            className={styles.clearButton}
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr key={doctor.id}>
                <td className={styles.doctorName}>
                  <strong>{doctor.name}</strong>
                </td>
                <td>{doctor.specialization}</td>
                <td>{getStatusBadge(doctor.status)}</td>
                <td>
                  <div className={styles.actionCell}>
                    <select
                      value={doctor.status}
                      onChange={(e) => handleStatusChange(doctor.id, e.target.value)}
                      disabled={updatingId === doctor.id || loading}
                      className={styles.statusSelect}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {searchQuery && filteredDoctors.length > 0 && (
        <div className={styles.searchInfo}>
          Found {filteredDoctors.length} doctor(s) matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default DoctorAvailabilityTable;