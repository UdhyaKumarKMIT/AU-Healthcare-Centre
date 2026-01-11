import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { verifySecretCode } from '../../store/slices/nurseSlice';
import styles from './NurseDashboard.module.css';

const SecretCodeInput = ({ value, onChange, onValidationChange }) => {
  const dispatch = useDispatch();
  const [isCodeValid, setIsCodeValid] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (value.length >= 4) {
      setIsValidating(true);
      const timer = setTimeout(async () => {
        const result = await dispatch(verifySecretCode(value));
        const valid = result.payload === true;
        setIsCodeValid(valid);
        onValidationChange(valid);
        
        if (valid) {
          toast.success('✓ Valid staff code', { autoClose: 2000 });
        } else {
          toast.error('✗ Invalid staff code', { autoClose: 2000 });
        }
        setIsValidating(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsCodeValid(null);
      onValidationChange(null);
    }
  }, [value, dispatch, onValidationChange]);

  return (
    <div className={styles.infoSection}>
      <h4>Secret Code</h4>
      <div className={styles.codeInputWrapper}>
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${styles.input} ${
            isCodeValid === true ? styles.inputValid : 
            isCodeValid === false ? styles.inputInvalid : ''
          }`}
          placeholder="Enter your secret code to confirm"
        />
        {isValidating && (
          <div className={styles.validatingSpinner}>
            <div className={styles.smallSpinner}></div>
          </div>
        )}
        {isCodeValid === true && (
          <FontAwesomeIcon icon={faCheck} className={styles.validIcon} />
        )}
        {isCodeValid === false && (
          <FontAwesomeIcon icon={faExclamationCircle} className={styles.invalidIcon} />
        )}
      </div>
    </div>
  );
};

export default SecretCodeInput;