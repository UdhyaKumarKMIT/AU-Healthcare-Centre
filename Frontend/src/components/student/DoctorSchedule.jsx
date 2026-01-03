// src/components/student/DoctorSchedule.jsx - CLICKABLE WITH DOCTORS LIST

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableDoctors } from '../../store/slices/studentsSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faSpinner,
  faInfoCircle,
  faUserMd,
  faPhone,
  faCheckCircle,
  faCalendarAlt,
  faChevronRight,
  faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import styles from './DoctorSchedule.module.css';

const DoctorSchedule = () => {
  const dispatch = useDispatch();
  const { availableDoctors, loading } = useSelector(state => state.students);
  const [selectedDay, setSelectedDay] = useState(null);

  // Days of the week
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  // Specialist schedule mapped by day
  const specialistSchedule = {
    'MONDAY': [
      { id: 1, designation: 'ENT', timing: '4:00 PM - 6:00 PM', color: '#3b82f6', description: 'Ear, Nose, and Throat Specialist' },
      { id: 7, designation: 'PHYSIOTHERAPIST', timing: '2:00 PM - 6:00 PM', color: '#14b8a6', description: 'Physical Therapy and Rehabilitation' }
    ],
    'TUESDAY': [
      { id: 2, designation: 'ORTHO', timing: '3:30 PM - 5:30 PM', color: '#10b981', description: 'Orthopedic Specialist' },
      { id: 7, designation: 'PHYSIOTHERAPIST', timing: '2:00 PM - 6:00 PM', color: '#14b8a6', description: 'Physical Therapy and Rehabilitation' }
    ],
    'WEDNESDAY': [
      { id: 3, designation: 'DIABETOLOGIST', timing: '4:00 PM - 6:00 PM', color: '#f59e0b', description: 'Diabetes and Endocrine Specialist' },
      { id: 7, designation: 'PHYSIOTHERAPIST', timing: '2:00 PM - 6:00 PM', color: '#14b8a6', description: 'Physical Therapy and Rehabilitation' }
    ],
    'THURSDAY': [
      { id: 4, designation: 'SKIN', timing: '4:00 PM - 6:00 PM', color: '#ec4899', description: 'Dermatology Specialist' },
      { id: 5, designation: 'DENTIST', timing: '4:00 PM - 6:00 PM', color: '#8b5cf6', description: 'Dental Care Specialist' },
      { id: 7, designation: 'PHYSIOTHERAPIST', timing: '2:00 PM - 6:00 PM', color: '#14b8a6', description: 'Physical Therapy and Rehabilitation' }
    ],
    'FRIDAY': [
      { id: 6, designation: 'EYE', timing: '4:00 PM - 6:00 PM', color: '#06b6d4', description: 'Ophthalmology Specialist' },
      { id: 7, designation: 'PHYSIOTHERAPIST', timing: '2:00 PM - 6:00 PM', color: '#14b8a6', description: 'Physical Therapy and Rehabilitation' }
    ],
    'SATURDAY': [],
    'SUNDAY': []
  };

  useEffect(() => {
    dispatch(fetchAvailableDoctors());
    // Set current day as default selected
    setSelectedDay(getCurrentDay());
  }, [dispatch]);

  // Get current day
  const getCurrentDay = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  };

  const currentDay = getCurrentDay();

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const selectedDaySchedule = specialistSchedule[selectedDay] || [];

  // Get doctors that match the selected day's specializations
  const getMatchingDoctors = () => {
    if (!selectedDay || selectedDaySchedule.length === 0) {
      return availableDoctors;
    }
    
    const daySpecializations = selectedDaySchedule.map(s => s.designation.toUpperCase());
    const matchingDoctors = availableDoctors.filter(doc => 
      daySpecializations.some(spec => 
        doc.specialization.toUpperCase().includes(spec) || 
        spec.includes(doc.specialization.toUpperCase())
      )
    );
    
    return matchingDoctors.length > 0 ? matchingDoctors : availableDoctors;
  };

  const displayDoctors = getMatchingDoctors();

  return (
    <div className={styles.scheduleContainer}>
      {/* Info Card */}
      <div className={styles.infoCard}>
        <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
        <div>
          <h3 className={styles.infoTitle}>Specialist Doctor Schedule & Available Doctors</h3>
          <p className={styles.infoText}>
            Click on any day to view specialist schedule and available doctors for that day.
          </p>
        </div>
      </div>

      {/* Weekly Day Selector */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faCalendarAlt} className={styles.sectionIcon} />
          Select a Day
        </h3>
        
        <div className={styles.daySelector}>
          {daysOfWeek.map(day => {
            const doctorCount = (specialistSchedule[day] || []).length;
            const isToday = day === currentDay;
            const isSelected = day === selectedDay;
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`${styles.dayButton} ${isSelected ? styles.selectedDay : ''} ${isToday ? styles.todayButton : ''}`}
              >
                <div className={styles.dayButtonContent}>
                  <span className={styles.dayButtonName}>{day.substring(0, 3)}</span>
                  {isToday && <span className={styles.todayIndicator}>Today</span>}
                  <span className={styles.doctorCount}>
                    {doctorCount} {doctorCount === 1 ? 'specialist' : 'specialists'}
                  </span>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className={styles.dayButtonIcon} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Content */}
      {selectedDay && (
        <>
          {/* Specialist Schedule for Selected Day */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faStethoscope} className={styles.sectionIcon} />
              Specialist Schedule - {selectedDay}
              {selectedDay === currentDay && (
                <span className={styles.todayTag}>Today</span>
              )}
            </h3>
            
            {selectedDaySchedule.length > 0 ? (
              <div className={styles.scheduleCards}>
                {selectedDaySchedule.map(doctor => (
                  <div key={doctor.id} className={styles.scheduleCard}>
                    <div 
                      className={styles.scheduleCardHeader}
                      style={{ backgroundColor: doctor.color }}
                    >
                      <h4 className={styles.specialistName}>{doctor.designation}</h4>
                    </div>
                    <div className={styles.scheduleCardBody}>
                      <p className={styles.specialistDescription}>{doctor.description}</p>
                      <div className={styles.timingInfo}>
                        <FontAwesomeIcon icon={faClock} className={styles.clockIcon} />
                        <span className={styles.timingText}>{doctor.timing}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noSchedule}>
                <p>No specialist doctors scheduled for {selectedDay}</p>
              </div>
            )}
          </div>

          {/* Available Doctors for Selected Day */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faUserMd} className={styles.sectionIcon} />
              Available Doctors - {selectedDay}
            </h3>
            
            {loading ? (
              <div className={styles.loadingContainer}>
                <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
                <p>Loading available doctors...</p>
              </div>
            ) : displayDoctors.length > 0 ? (
              <>
                <p className={styles.doctorListHint}>
                  {selectedDaySchedule.length > 0 
                    ? `Showing doctors matching ${selectedDay}'s specialties and all available doctors`
                    : 'Showing all available doctors'}
                </p>
                <div className={styles.doctorsGrid}>
                  {displayDoctors.map(doctor => (
                    <div key={doctor.doctor_id} className={styles.doctorCard}>
                      <div className={styles.doctorAvatar}>
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.doctorInfo}>
                        <h4 className={styles.doctorName}>Dr. {doctor.name}</h4>
                        <p className={styles.doctorSpec}>{doctor.specialization}</p>
                        {doctor.phone && (
                          <p className={styles.doctorPhone}>
                            <FontAwesomeIcon icon={faPhone} /> {doctor.phone}
                          </p>
                        )}
                        <span className={styles.availableBadge}>
                          <FontAwesomeIcon icon={faCheckCircle} /> Available Now
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>No doctors available at the moment</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorSchedule;