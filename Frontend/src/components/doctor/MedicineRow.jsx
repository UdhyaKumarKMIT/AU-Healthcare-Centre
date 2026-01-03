import React, { useState, useEffect } from 'react'
import styles from './MedicineRow.module.css'

const MedicineRow = ({
  index,
  medicine,
  suggestions = [],
  showSuggestions,
  nurses = [],
  onChange,
  onSearch,
  onSelectMedicine,
  onRemove,
  onFocus,
  onBlur,
}) => {
  const [localSearch, setLocalSearch] = useState(medicine.name || '')

  useEffect(() => {
    setLocalSearch(medicine.name || '')
  }, [medicine.name])

  const isInjection = medicine.type === 'Injection'
  const isDrip = medicine.type === 'DRIP'
  const isInjectable = isInjection || isDrip

  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearch(value)
    onChange({ name: value })
    onSearch(value)
  }

  const handleSelectSuggestion = (suggestion) => {
    setLocalSearch(suggestion.name)
    onSelectMedicine(suggestion)
  }

  const handleWhenToTakeChange = (value) => {
    onChange({ whenToTake: value })
  }

  const handleTimingChange = (time) => {
    onChange({
      timing: {
        ...medicine.timing,
        [time]: !medicine.timing[time],
      },
    })
  }

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value) || 1
    onChange({ duration: value })
  }

  return (
    <div className={styles.medicineRow}>
      <div className={styles.rowHeader}>
        <span className={styles.medicineNumber}>Medicine #{index}</span>
        <button className={styles.removeBtn} onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className={styles.rowContent}>
        {/* Medicine Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Medicine Name *</label>
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              onFocus={onFocus}
              onBlur={onBlur}
              className={styles.searchInput}
              placeholder="Search medicine..."
            />
            {showSuggestions && localSearch && suggestions.length > 0 && (
              <div className={styles.suggestionsDropdown}>
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className={styles.suggestionItem}
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    <span className={styles.suggestionName}>{s.name}</span>
                    <span className={styles.suggestionType}>{s.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Medicine Type */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Medicine Type</label>
          <div className={styles.typeDisplay}>
            {medicine.type || 'Select medicine'}
          </div>
        </div>

        {/* INJECTION-SPECIFIC FIELDS */}
        {isInjection && (
          <>
            {/* Nurse Selection */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Assigned Nurse *</label>
              <select
                value={medicine.nurse_id || ''}
                onChange={(e) => onChange({ nurse_id: e.target.value })}
                className={styles.selectInput}
              >
                <option value="">Select Nurse</option>
                {nurses.map((n) => (
                  <option key={n.nurse_id} value={n.nurse_id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Administration Route */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Administration Route *</label>
              <select
                value={medicine.route || ''}
                onChange={(e) => onChange({ route: e.target.value })}
                className={styles.selectInput}
              >
                <option value="">Select Route</option>
                <option value="IV">IV (Intravenous)</option>
                <option value="IM">IM (Intramuscular)</option>
                <option value="SC">SC (Subcutaneous)</option>
              </select>
            </div>

            {/* Duration */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Duration (days) *</label>
              <div className={styles.durationInput}>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={medicine.duration}
                  onChange={handleDurationChange}
                  className={styles.numberInput}
                />
                <span className={styles.durationLabel}>days</span>
              </div>
            </div>
          </>
        )}

        {/* DRIP-SPECIFIC FIELDS */}
        {isDrip && (
          <>
            {/* Nurse Selection */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Assigned Nurse *</label>
              <select
                value={medicine.nurse_id || ''}
                onChange={(e) => onChange({ nurse_id: e.target.value })}
                className={styles.selectInput}
              >
                <option value="">Select Nurse</option>
                {nurses.map((n) => (
                  <option key={n.nurse_id} value={n.nurse_id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Administration Route */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Administration Route *</label>
              <select
                value={medicine.route || ''}
                onChange={(e) => onChange({ route: e.target.value })}
                className={styles.selectInput}
              >
                <option value="">Select Route</option>
                <option value="IV">IV (Intravenous)</option>
              </select>
            </div>

            {/* Infusion Duration */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Infusion Duration (mins) *
              </label>
              <input
                type="number"
                min="5"
                value={medicine.infusionDuration || ''}
                onChange={(e) =>
                  onChange({ infusionDuration: parseInt(e.target.value) })
                }
                className={styles.numberInput}
                placeholder="e.g., 30"
              />
            </div>

            {/* Duration */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Duration (days) *</label>
              <div className={styles.durationInput}>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={medicine.duration}
                  onChange={handleDurationChange}
                  className={styles.numberInput}
                />
                <span className={styles.durationLabel}>days</span>
              </div>
            </div>
          </>
        )}

        {/* OTHER MEDICINE TYPES (Tablets, Syrups, etc.) */}
        {!isInjectable && (
          <>
            {/* When to Take */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>When to Take</label>
              <div className={styles.radioGroup}>
                {['Before Food', 'After Food', 'With Food'].map((v) => (
                  <label key={v} className={styles.radioOption}>
                    <input
                      type="radio"
                      name={`whenToTake-${index}`}
                      checked={medicine.whenToTake === v}
                      onChange={() => handleWhenToTakeChange(v)}
                    />
                    <span>{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Timing */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Timing</label>
              <div className={styles.checkboxGroup}>
                {['morning', 'afternoon', 'night'].map((t) => (
                  <label key={t} className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      checked={medicine.timing?.[t]}
                      onChange={() => handleTimingChange(t)}
                    />
                    <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Duration (days) *</label>
              <div className={styles.durationInput}>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={medicine.duration}
                  onChange={handleDurationChange}
                  className={styles.numberInput}
                />
                <span className={styles.durationLabel}>days</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MedicineRow