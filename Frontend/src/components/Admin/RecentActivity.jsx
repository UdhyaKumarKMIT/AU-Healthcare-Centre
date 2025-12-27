import React from 'react';
import { useSelector } from 'react-redux';
import styles from './RecentActivity.module.css';

const RecentActivity = () => {
  const { recentActivity = [] } = useSelector((state) => state.admin || {});

  const activities = recentActivity.length > 0 ? recentActivity : [
    {
      id: 1,
      type: 'patient_registered',
      user: 'Dr. Smith',
      description: 'New patient registered',
      time: '10:30 AM',
      date: 'Today',
    },
    {
      id: 2,
      type: 'appointment_scheduled',
      user: 'Reception',
      description: 'Appointment scheduled for John Doe',
      time: '09:15 AM',
      date: 'Today',
    },
    {
      id: 3,
      type: 'prescription_created',
      user: 'Dr. Johnson',
      description: 'Prescription created for visit #1234',
      time: 'Yesterday',
      date: '3:45 PM',
    },
    {
      id: 4,
      type: 'medicine_added',
      user: 'Pharmacy',
      description: 'New medicine added to inventory',
      time: 'Yesterday',
      date: '11:20 AM',
    },
    {
      id: 5,
      type: 'user_created',
      user: 'Admin',
      description: 'New receptionist account created',
      time: '2 days ago',
      date: '4:30 PM',
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'patient_registered':
        return '👤';
      case 'appointment_scheduled':
        return '📅';
      case 'prescription_created':
        return '💊';
      case 'medicine_added':
        return '🆕';
      case 'user_created':
        return '👨‍💼';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'patient_registered':
        return '#4299e1';
      case 'appointment_scheduled':
        return '#48bb78';
      case 'prescription_created':
        return '#9f7aea';
      case 'medicine_added':
        return '#ed8936';
      case 'user_created':
        return '#f56565';
      default:
        return '#718096';
    }
  };

  return (
    <div className={styles.recentActivity}>
      {activities.map((activity) => (
        <div key={activity.id} className={styles.activityItem}>
          <div 
            className={styles.activityIcon}
            style={{ backgroundColor: `${getActivityColor(activity.type)}15` }}
          >
            <span style={{ color: getActivityColor(activity.type) }}>
              {getActivityIcon(activity.type)}
            </span>
          </div>
          <div className={styles.activityContent}>
            <div className={styles.activityHeader}>
              <span className={styles.activityUser}>{activity.user}</span>
              <span className={styles.activityTime}>
                {activity.date} • {activity.time}
              </span>
            </div>
            <p className={styles.activityDescription}>{activity.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;