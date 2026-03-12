import React, { useState } from 'react';
import styles from './NurseDashboard.module.css';

const StockView = ({
  availableStock,
  pendingStock,
  stockType,
  onStockTypeChange,
  secretCode,
  onSecretCodeChange,
  onVerify
}) => {
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifySubStockId, setVerifySubStockId] = useState(null);

  const openVerifyModal = (subStockId) => {
    setVerifySubStockId(subStockId);
    onSecretCodeChange?.('');
    setVerifyModalOpen(true);
  };

  const closeVerifyModal = () => {
    setVerifyModalOpen(false);
    setVerifySubStockId(null);
    onSecretCodeChange?.('');
  };

  const confirmVerify = async () => {
    if (!verifySubStockId) return;
    if (!secretCode || !secretCode.trim()) return;

    const ok = await onVerify?.(verifySubStockId);
    if (ok) {
      closeVerifyModal();
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>Stock</h3>
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

      {(() => {
        const verifiedRows = (Array.isArray(availableStock) ? availableStock : []).map((s) => ({
          sub_stock_id: s.sub_stock_id,
          medicine_name: s.medicine_name,
          medicine_type: s.medicine_type,
          batch_no: s.batch_no,
          expiry: s.expiry,
          quantity: s.quantity,
          verification: 'done'
        }));

        const waitingRows = (Array.isArray(pendingStock) ? pendingStock : []).flatMap((med) =>
          (med.batches || []).map((batch) => ({
            sub_stock_id: batch.sub_stock_id,
            medicine_name: med.medicine_name,
            medicine_type: med.medicine_type,
            batch_no: batch.batch_no,
            expiry: batch.expiry,
            quantity: batch.quantity,
            verification: 'waiting'
          }))
        );

        const rows = [...waitingRows, ...verifiedRows];

        if (rows.length === 0) {
          return (
            <div className={styles.emptyState}>
              <p>No stock available</p>
            </div>
          );
        }

        return (
          <div className={styles.stockTable}>
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Type</th>
                  <th>Batch No</th>
                  <th>Expiry</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.sub_stock_id}>
                    <td>{row.medicine_name}</td>
                    <td>{row.medicine_type}</td>
                    <td>{row.batch_no}</td>
                    <td>{row.expiry ? new Date(row.expiry).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={styles.quantityBadge}>{row.quantity}</span>
                    </td>
                    <td>
                      {row.verification === 'done' ? (
                        'Verified'
                      ) : (
                        <button
                          type="button"
                          className={styles.filterBtn}
                          onClick={() => openVerifyModal(row.sub_stock_id)}
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {verifyModalOpen && (
        <div className={styles.modalOverlay} onClick={closeVerifyModal}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Verify Stock</h2>
              <button type="button" className={styles.closeButton} onClick={closeVerifyModal}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.modalLabel} htmlFor="nurse-stock-secret-code">
                Secret Code
              </label>
              <input
                id="nurse-stock-secret-code"
                className={styles.modalInput}
                type="password"
                placeholder="Enter secret code"
                value={secretCode}
                onChange={(e) => onSecretCodeChange(e.target.value)}
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmVerify();
                  }
                }}
              />
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelButton} onClick={closeVerifyModal}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.completeButton}
                onClick={confirmVerify}
                disabled={!secretCode || !secretCode.trim()}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockView;