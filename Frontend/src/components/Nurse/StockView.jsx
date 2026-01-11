import styles from './NurseDashboard.module.css';

const StockView = ({ availableStock, stockType, onStockTypeChange }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>Available Stock</h3>
        <div className={styles.stockFilters}>
          <button 
            onClick={() => onStockTypeChange('NURSE')} 
            className={styles.filterBtn}
            style={stockType === 'NURSE' ? { background: '#e2e8f0', color: '#1a237e' } : {}}
          >
            Nurse Stock
          </button>
          <button 
            onClick={() => onStockTypeChange('DRESSING')} 
            className={styles.filterBtn}
            style={stockType === 'DRESSING' ? { background: '#e2e8f0', color: '#1a237e' } : {}}
          >
            Dressing Stock
          </button>
        </div>
      </div>
      {availableStock.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No stock available</p>
        </div>
      ) : (
        <div className={styles.stockTable}>
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Type</th>
                <th>Batch No</th>
                <th>Expiry</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {availableStock.map((stock) => (
                <tr key={stock.sub_stock_id}>
                  <td>{stock.medicine_name}</td>
                  <td>{stock.medicine_type}</td>
                  <td>{stock.batch_no}</td>
                  <td>{new Date(stock.expiry).toLocaleDateString()}</td>
                  <td>
                    <span className={styles.quantityBadge}>{stock.quantity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockView;