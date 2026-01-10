import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills } from '@fortawesome/free-solid-svg-icons';
import styles from './NurseDashboard.module.css';

const StockSelection = ({ 
  availableStock, 
  selectedMedications, 
  onToggleSelection, 
  onUpdateQuantity 
}) => {
  return (
    <div className={styles.infoSection}>
      <h4>
        <FontAwesomeIcon icon={faPills} /> Select Stock Used
      </h4>
      {availableStock.length === 0 ? (
        <p className={styles.noStock}>No stock available</p>
      ) : (
        <div className={styles.stockSelection}>
          {availableStock.map((stock) => {
            const isSelected = selectedMedications.some(
              m => m.medicine_id === stock.medicine_id && m.batch_no === stock.batch_no
            );
            const selectedMed = selectedMedications.find(
              m => m.medicine_id === stock.medicine_id && m.batch_no === stock.batch_no
            );
            
            return (
              <div key={stock.sub_stock_id} className={styles.stockItem}>
                <label className={styles.stockLabel}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(stock, 1)}
                  />
                  <div className={styles.stockInfo}>
                    <strong>{stock.medicine_name}</strong>
                    <span className={styles.stockMeta}>
                      Batch: {stock.batch_no} | Available: {stock.quantity}
                    </span>
                  </div>
                </label>
                {isSelected && (
                  <input
                    type="number"
                    min="1"
                    max={stock.quantity}
                    value={selectedMed?.quantity || 1}
                    onChange={(e) => onUpdateQuantity(
                      stock.medicine_id,
                      stock.batch_no,
                      e.target.value
                    )}
                    className={styles.quantityInput}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockSelection;
