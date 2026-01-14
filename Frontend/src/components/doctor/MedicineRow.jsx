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

  const isInjection = medicine.type === 'Injection' || medicine.type === 'INJECTION'
  const isDrip = medicine.type === 'DRIP'
  const isInjectable = isInjection || isDrip
  const isOthers = medicine.name === 'Others' || medicine.is_external

  // Clear food timing fields when medicine type changes to injectable
  useEffect(() => {
    if (isInjectable && (medicine.whenToTake || medicine.timing?.morning || medicine.timing?.afternoon || medicine.timing?.night)) {
      onChange({
        whenToTake: '',
        timing: { morning: false, afternoon: false, night: false }
      })
    }
  }, [isInjectable])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearch(value)
    
    // Check if user typed "Others" - mark as external
    if (value.toLowerCase() === 'others') {
      onChange({ 
        name: value,
        is_external: true,
        medicineId: 'EXTERNAL', // Placeholder - backend will use Others medicine
        type: 'External'
      })
    } else {
      onChange({ name: value })
    }
    onSearch(value)
  }

  const handleSelectSuggestion = (suggestion) => {
    setLocalSearch(suggestion.name)
    const isInjectionType = suggestion.type === 'Injection' || suggestion.type === 'DRIP'
    
    // Clear external flag and food timing for injections when selecting from dropdown
    onSelectMedicine({
      ...suggestion,
      is_external: false,
      custom_name: '',
      // Clear food timing fields for injections
      ...(isInjectionType && {
        whenToTake: '',
        timing: { morning: false, afternoon: false, night: false }
      })
    })
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div>
                        <span className={styles.suggestionName}>{s.name}</span>
                        <span className={styles.suggestionType}>{s.type}</span>
                      </div>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: s.available_stock > 0 ? (s.available_stock < 10 ? '#fef3c7' : '#dcfce7') : '#fee2e2',
                        color: s.available_stock > 0 ? (s.available_stock < 10 ? '#92400e' : '#14532d') : '#991b1b'
                      }}>
                        Stock: {s.available_stock || 0}
                      </span>
                    </div>
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
            {medicine.is_external ? '⚠️ External Medicine' : (medicine.type || 'Select medicine')}
            {medicine.type && !medicine.is_external && medicine.available_stock !== undefined && (
              <span style={{
                marginLeft: '12px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                background: medicine.available_stock > 0 
                  ? (medicine.available_stock < 10 ? '#fef3c7' : '#dcfce7') 
                  : '#fee2e2',
                color: medicine.available_stock > 0 
                  ? (medicine.available_stock < 10 ? '#92400e' : '#14532d') 
                  : '#991b1b'
              }}>
                Stock: {medicine.available_stock}
              </span>
            )}
          </div>
        </div>

        {/* External Medicine Checkbox */}
        <div className={styles.fieldGroup}>
          <label className={styles.checkboxLabel} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={medicine.is_external || false}
              onChange={(e) => {
                const isExternal = e.target.checked
                onChange({
                  is_external: isExternal,
                  name: isExternal ? 'Others' : '',
                  medicineId: isExternal ? 'EXTERNAL' : null,
                  type: isExternal ? 'External' : '',
                  custom_name: isExternal ? medicine.custom_name : ''
                })
                if (isExternal) {
                  setLocalSearch('Others')
                } else {
                  setLocalSearch('')
                }
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Medicine not in pharmacy stock (External)
            </span>
          </label>
        </div>

        {/* Custom Medicine Name Input (shown when external) */}
        {medicine.is_external && (
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Medicine Name *
            </label>
            <input
              type="text"
              value={medicine.custom_name || ''}
              onChange={(e) => onChange({ custom_name: e.target.value })}
              className={styles.searchInput}
              placeholder="Enter exact medicine name"
            />
            <small style={{ 
              fontSize: '11px',
              color: '#666',
              display: 'block',
              marginTop: '4px'
            }}>
              This medicine will be purchased externally by the patient
            </small>
          </div>
        )}

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
                {['Before Food', 'After Food', 'With Food', 'Empty Stomach'].map((v) => (
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