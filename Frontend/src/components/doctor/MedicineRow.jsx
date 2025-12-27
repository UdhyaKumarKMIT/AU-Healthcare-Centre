import React, { useState } from 'react';
import styles from './MedicineRow.module.css';

const MedicineRow = ({
  index,
  medicine,
  suggestions = [],
  showSuggestions,
  onChange,
  onSearch,
  onSelectMedicine,
  onRemove,
  onFocus,
  onBlur,
}) => {
  const [localSearch, setLocalSearch] = useState(medicine.name);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onChange({ name: value });
    onSearch(value);
  };

  const handleSelectSuggestion = (suggestion) => {
    setLocalSearch(suggestion.name);
    onSelectMedicine(suggestion);
  };

  const handleWhenToTakeChange = (value) => {
    onChange({ whenToTake: value });
  };

  const handleTimingChange = (time) => {
    onChange({
      timing: {
        ...medicine.timing,
        [time]: !medicine.timing[time],
      },
    });
  };

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    onChange({ duration: value });
  };

  return (
    <div className={styles.medicineRow}>
      <div className={styles.rowHeader}>
        <span className={styles.medicineNumber}>Medicine #{index}</span>
        <button className={styles.removeBtn} onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className={styles.rowContent}>
        {/* Medicine Name with Search */}
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
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={styles.suggestionItem}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <span className={styles.suggestionName}>{suggestion.name}</span>
                    <span className={styles.suggestionType}>{suggestion.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Medicine Type (Auto-filled) */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Medicine Type</label>
          <div className={styles.typeDisplay}>
            {medicine.type || 'Select medicine'}
          </div>
        </div>

        {/* When to Take */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>When to Take</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name={`whenToTake-${index}`}
                value="Before Food"
                checked={medicine.whenToTake === 'Before Food'}
                onChange={() => handleWhenToTakeChange('Before Food')}
              />
              <span>Before Food</span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name={`whenToTake-${index}`}
                value="After Food"
                checked={medicine.whenToTake === 'After Food'}
                onChange={() => handleWhenToTakeChange('After Food')}
              />
              <span>After Food</span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name={`whenToTake-${index}`}
                value="With Food"
                checked={medicine.whenToTake === 'With Food'}
                onChange={() => handleWhenToTakeChange('With Food')}
              />
              <span>With Food</span>
            </label>
          </div>
        </div>

        {/* Timing */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Timing</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={medicine.timing.morning}
                onChange={() => handleTimingChange('morning')}
              />
              <span>Morning</span>
            </label>
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={medicine.timing.afternoon}
                onChange={() => handleTimingChange('afternoon')}
              />
              <span>Afternoon</span>
            </label>
            <label className={styles.checkboxOption}>
              <input
                type="checkbox"
                checked={medicine.timing.night}
                onChange={() => handleTimingChange('night')}
              />
              <span>Night</span>
            </label>
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
      </div>
    </div>
  );
};

export default MedicineRow;