import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faUserCheck,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons'
import styles from './ReceptionistStats.module.css'

const ReceptionistStats = ({ stats = {}, title = 'Receptionist Statistics', labels = {} }) => {
  const { total = 0, active = 0, visitsToday = 0, onDuty = 0, inactive = 0, avgPatientsPerDay = 0 } = stats

  const roleType = title.split(' ')[0] || 'Receptionist'
  
  const statsCards = [
    { title: `Total ${roleType}s`, value: total, icon: faUsers },
    { title: `Active ${roleType}s`, value: active, icon: faUserCheck },
    { title: labels.onDuty || 'Total Visits Today', value: onDuty || visitsToday, icon: faClipboardList }
  ]

  return (
    <div className={styles.statsContainer}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.statsGrid}>
        {statsCards.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FontAwesomeIcon icon={s.icon} />
              </div>
              <h4 className={styles.statTitle}>{s.title}</h4>
            </div>
            <div className={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReceptionistStats
