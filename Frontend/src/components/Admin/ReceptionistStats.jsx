import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faUserCheck,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons'
import styles from './ReceptionistStats.module.css'

const ReceptionistStats = ({ stats = {} }) => {
  const { total = 0, active = 0, visitsToday = 0 } = stats

  const statsCards = [
    { title: 'Total Receptionists', value: total, icon: faUsers },
    { title: 'Active Receptionists', value: active, icon: faUserCheck },
    { title: 'Total Visits Today', value: visitsToday, icon: faClipboardList }
  ]

  return (
    <div className={styles.statsContainer}>
      <h3 className={styles.sectionTitle}>Receptionist Statistics</h3>
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
