import React, { useState, useMemo } from 'react'
import styles from './RecentVisitsList.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSync,
  faChevronDown,
  faChevronUp,
  faPlayCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons'

const RecentVisitsList = ({ visits = [], onRefresh, isLoading }) => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showOngoing, setShowOngoing] = useState(true)
  const [showCompleted, setShowCompleted] = useState(false)

  const normalizeDateTimeLocal = (value, bound) => {
    if (!value) return value

    // If a user typed/pasted date-only, convert to datetime-local range.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return bound === 'end' ? `${value}T23:59` : `${value}T00:00`
    }

    // If the user picked a date but left time at midnight, treat end as end-of-day.
    if (bound === 'end' && /^\d{4}-\d{2}-\d{2}T00:00$/.test(value)) {
      return value.replace('T00:00', 'T23:59')
    }

    return value
  }

  const { ongoingVisits, completedVisits } = useMemo(() => {
    const ongoing = []
    const completed = []

    visits.forEach(v => {
      if (v.status === 'COMPLETED') completed.push(v)
      else ongoing.push(v)
    })

    return { ongoingVisits: ongoing, completedVisits: completed }
  }, [visits])

  const getStatusBadge = (status) => {
    const map = {
      SCHEDULED: styles.statusScheduled,
      ONGOING: styles.statusOngoing,
      DIAGNOSED: styles.statusDiagnosed,
      PRESCRIBED: styles.statusPrescribed,
      NURSING: styles.statusNursing,
      PHARMACY: styles.statusPharmacy,
      COMPLETED: styles.statusCompleted,
      CANCELLED: styles.statusCancelled
    }

    return (
      <span className={map[status] || styles.statusDefault}>
        {status}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderVisit = (visit) => (
    <div key={visit.visit_id || visit.id} className={styles.visitItem}>
      <div className={styles.visitHeader}>
        <div className={styles.tokenBadge}>Token #{visit.token || '—'}</div>
        <div className={styles.visitTime}>
          {formatDate(visit.visit_date || visit.visitDate)}
        </div>
      </div>

      <div className={styles.visitDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Patient</span>
          <span className={styles.detailValue}>
            {visit.patient_name || visit.patientName}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Doctor</span>
          <span className={styles.detailValue}>
            {visit.doctor_name || visit.doctorName}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Type</span>
          <span className={styles.detailValue}>
            {visit.visit_type || visit.visitType}
          </span>
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
  )

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Recent Visits</h2>
          <p className={styles.subtitle}>Monitor visit flow</p>
        </div>

        <div className={styles.filterControls}>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className={styles.filterInput}
            placeholder="From Date"
          />

          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className={styles.filterInput}
            placeholder="To Date"
          />

          <button
            onClick={() => {
              const params = {};
              const normalizedFrom = normalizeDateTimeLocal(from, 'start');
              const normalizedTo = normalizeDateTimeLocal(to, 'end');

              // Only add params if they have actual values
              if (normalizedFrom) params.from = normalizedFrom;
              if (normalizedTo) params.to = normalizedTo;

              console.log('📅 Filter params:', params);
              onRefresh(params);
            }}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            <FontAwesomeIcon icon={faSync} spin={isLoading} />

          </button>
        </div>
      </div>

      {/* ONGOING */}
      <div className={styles.visitItem}>
        <div
          className={styles.visitHeader}
          style={{ cursor: 'pointer' }}
          onClick={() => setShowOngoing(!showOngoing)}
        >
          <div className={styles.tokenBadge}>
            <FontAwesomeIcon icon={faPlayCircle} /> Ongoing ({ongoingVisits.length})
          </div>

          <FontAwesomeIcon
            icon={showOngoing ? faChevronUp : faChevronDown}
          />
        </div>

        {showOngoing && (
          <div className={styles.visitsList}>
            {ongoingVisits.length === 0
              ? <p className={styles.emptyText}>No ongoing visits</p>
              : ongoingVisits.map(renderVisit)}
          </div>
        )}
      </div>

      {/* COMPLETED */}
      <div className={styles.visitItem}>
        <div
          className={styles.visitHeader}
          style={{ cursor: 'pointer' }}
          onClick={() => setShowCompleted(!showCompleted)}
        >
          <div className={styles.tokenBadge}>
            <FontAwesomeIcon icon={faCheckCircle} /> Completed ({completedVisits.length})
          </div>

          <FontAwesomeIcon
            icon={showCompleted ? faChevronUp : faChevronDown}
          />
        </div>

        {showCompleted && (
          <div className={styles.visitsList}>
            {completedVisits.length === 0
              ? <p className={styles.emptyText}>No completed visits</p>
              : completedVisits.map(renderVisit)}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentVisitsList
