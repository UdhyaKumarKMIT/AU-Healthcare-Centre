import React, { useState } from 'react'
import styles from './RecentVisitsList.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'


const RecentVisitsList = ({ visits = [], onRefresh, isLoading }) => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: { className: styles.statusScheduled, label: 'Scheduled' },
      ONGOING: { className: styles.statusOngoing, label: 'Ongoing' },
      DIAGNOSED: { className: styles.statusDiagnosed, label: 'Diagnosed' },
      PRESCRIBED: { className: styles.statusPrescribed, label: 'Prescribed' },
      NURSING: { className: styles.statusNursing, label: 'Nursing' },
      PHARMACY: { className: styles.statusPharmacy, label: 'Pharmacy' },
      COMPLETED: { className: styles.statusCompleted, label: 'Completed' },
      CANCELLED: { className: styles.statusCancelled, label: 'Cancelled' }
    }

    const config = statusConfig[status] || { className: styles.statusDefault, label: status }
    return <span className={config.className}>{config.label}</span>
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (visits.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recent Visits</h2>
          <p className={styles.subtitle}>No visits yet</p>
        </div>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No recent visits to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
  <div>
    <h2 className={styles.title}>Recent Visits</h2>
    <p className={styles.subtitle}>Monitor visit flow</p>
  </div>

<div className={styles.filterControls}>
  <input
    type="datetime-local"
    value={from}
    onChange={e => setFrom(e.target.value)}
    className={styles.filterInput}
  />

  <input
    type="datetime-local"
    value={to}
    onChange={e => setTo(e.target.value)}
    className={styles.filterInput}
  />

  <button
    onClick={() => onRefresh({ from, to })}
    disabled={isLoading}
    className={styles.refreshButton}
  >
    <FontAwesomeIcon icon={faSync} spin={isLoading} />
    Filter
  </button>
</div>

</div>



      <div className={styles.visitsList}>
        {visits.map((visit) => (
          <div key={visit.visit_id || visit.id} className={styles.visitItem}>
            <div className={styles.visitHeader}>
              <div className={styles.tokenBadge}>Token #{visit.token || '—'}</div>
              <div className={styles.visitTime}>{formatDate(visit.visit_date || visit.visitDate)}</div>
            </div>

            <div className={styles.visitDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Patient:</span>
                <span className={styles.detailValue}>{visit.patient_name || visit.patientName}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Doctor:</span>
                <span className={styles.detailValue}>{visit.doctor_name || visit.doctorName}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Type:</span>
                <span className={styles.detailValue}>{visit.visit_type || visit.visitType}</span>
              </div>
            </div>

            <div className={styles.visitFooter}>
              <div className={styles.reason}>
                <strong>Reason:</strong> {visit.reason}
              </div>
              <div className={styles.status}>
                {getStatusBadge(visit.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentVisitsList
