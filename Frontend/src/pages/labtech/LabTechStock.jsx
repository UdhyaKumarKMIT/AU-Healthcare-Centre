import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Header from '../../components/Header/Header';
import LabTechSidebar from '../../components/labtech/LabTechSidebar';

import {
    fetchAvailableLabtechStock,
    fetchPendingLabtechVerificationStock,
    verifyLabtechSubStock
} from '../../store/slices/labTechSlice';

import styles from './LabTechDashboard.module.css';
import tableStyles from '../../components/Admin/ReceptionistTable.module.css';
import pageStyles from './LabTechStock.module.css';

const PANEL = {
    AVAILABLE: 'AVAILABLE',
    PENDING: 'PENDING'
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString();
};

const LabTechStock = () => {
    const dispatch = useDispatch();

    const {
        availableStock,
        pendingStock,
        stockLoading,
        pendingStockLoading,
        verifyStockLoading,
        error
    } = useSelector((state) => state.labTech || {});

    const [panel, setPanel] = useState(PANEL.AVAILABLE);
    const [secretCode, setSecretCode] = useState('');
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [verifySubStockId, setVerifySubStockId] = useState(null);

    const pendingRows = useMemo(() => {
        const groups = Array.isArray(pendingStock) ? pendingStock : [];
        const rows = [];
        for (const g of groups) {
            const batches = Array.isArray(g?.batches) ? g.batches : [];
            for (const b of batches) {
                rows.push({
                    medicine_id: g.medicine_id,
                    medicine_name: g.medicine_name,
                    medicine_type: g.medicine_type,
                    sub_stock_id: b.sub_stock_id,
                    batch_no: b.batch_no,
                    expiry: b.expiry,
                    quantity: b.quantity
                });
            }
        }
        return rows;
    }, [pendingStock]);

    const refreshAll = () => {
        dispatch(fetchAvailableLabtechStock());
        dispatch(fetchPendingLabtechVerificationStock());
    };

    useEffect(() => {
        refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const openVerifyModal = (sub_stock_id) => {
        setVerifySubStockId(sub_stock_id);
        setSecretCode('');
        setVerifyModalOpen(true);
    };

    const closeVerifyModal = () => {
        setVerifyModalOpen(false);
        setVerifySubStockId(null);
        setSecretCode('');
    };

    const confirmVerify = async () => {
        const code = secretCode.trim();
        if (!verifySubStockId) return;
        if (!code) {
            toast.error('Please enter your secret code to verify stock');
            return;
        }

        const result = await dispatch(verifyLabtechSubStock({ sub_stock_id: verifySubStockId, secret_code: code }));
        if (verifyLabtechSubStock.fulfilled.match(result)) {
            toast.success('Stock verified successfully');
            closeVerifyModal();
            refreshAll();
        } else {
            toast.error(result.payload || 'Failed to verify stock');
        }
    };

    const isLoading = stockLoading || pendingStockLoading;

    return (
        <div className={styles.labTechDashboard}>
            <Header title="MIT Health Centre" subtitle="Lab Stock" showLogout userRole="Lab Technician" />

            <div className={styles.mainContainer}>
                <LabTechSidebar />

                <main className={styles.mainContent}>
                    <div className={styles.dashboardHeader}>
                        <div className={styles.headerLeft}>
                            <h1>Stock Verification</h1>
                            <p>Verify newly issued stock before usage</p>
                        </div>
                    </div>

                    <div className={pageStyles.controls}>
                        <div className={pageStyles.panelToggle}>
                            <button
                                type="button"
                                className={`${pageStyles.toggleBtn} ${panel === PANEL.AVAILABLE ? pageStyles.active : ''}`}
                                onClick={() => setPanel(PANEL.AVAILABLE)}
                            >
                                Available ({Array.isArray(availableStock) ? availableStock.length : 0})
                            </button>
                            <button
                                type="button"
                                className={`${pageStyles.toggleBtn} ${panel === PANEL.PENDING ? pageStyles.active : ''}`}
                                onClick={() => setPanel(PANEL.PENDING)}
                            >
                                Pending ({pendingRows.length})
                            </button>
                        </div>
                    </div>

                    {error && <p className={pageStyles.errorText}>Error: {error}</p>}

                    {isLoading ? (
                        <p>Loading stock…</p>
                    ) : panel === PANEL.AVAILABLE ? (
                        <section>
                            <div className={tableStyles.tableContainer}>
                                <table className={tableStyles.receptionistTable}>
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Type</th>
                                            <th>Batch</th>
                                            <th>Expiry</th>
                                            <th>Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Array.isArray(availableStock) ? availableStock : []).map((row) => (
                                            <tr key={row.sub_stock_id} className={tableStyles.receptionistRow}>
                                                <td>{row.medicine_name || 'N/A'}</td>
                                                <td>{row.medicine_type || 'N/A'}</td>
                                                <td>{row.batch_no || 'N/A'}</td>
                                                <td>{formatDate(row.expiry)}</td>
                                                <td>{row.quantity ?? 0}</td>
                                            </tr>
                                        ))}
                                        {(!availableStock || availableStock.length === 0) && (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center' }}>
                                                    No verified stock available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ) : (
                        <section>
                            <div className={tableStyles.tableContainer}>
                                <table className={tableStyles.receptionistTable}>
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Type</th>
                                            <th>Batch</th>
                                            <th>Expiry</th>
                                            <th>Qty</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRows.map((row) => (
                                            <tr key={row.sub_stock_id} className={tableStyles.receptionistRow}>
                                                <td>{row.medicine_name || 'N/A'}</td>
                                                <td>{row.medicine_type || 'N/A'}</td>
                                                <td>{row.batch_no || 'N/A'}</td>
                                                <td>{formatDate(row.expiry)}</td>
                                                <td>{row.quantity ?? 0}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={pageStyles.verifyBtn}
                                                        disabled={verifyStockLoading}
                                                        onClick={() => openVerifyModal(row.sub_stock_id)}
                                                    >
                                                        {verifyStockLoading ? 'Verifying…' : 'Verify'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingRows.length === 0 && (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: 'center' }}>
                                                    No pending stock to verify
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {verifyModalOpen && (
                        <div className={pageStyles.modalOverlay} onClick={closeVerifyModal}>
                            <div className={pageStyles.modalBox} onClick={(e) => e.stopPropagation()}>
                                <div className={pageStyles.modalHeader}>
                                    <h3 className={pageStyles.modalTitle}>Verify Stock</h3>
                                    <button type="button" className={pageStyles.modalClose} onClick={closeVerifyModal}>
                                        ×
                                    </button>
                                </div>

                                <div className={pageStyles.modalBody}>
                                    <label className={pageStyles.modalLabel} htmlFor="labtech-secret-code-modal">
                                        Secret Code
                                    </label>
                                    <input
                                        id="labtech-secret-code-modal"
                                        className={pageStyles.modalInput}
                                        type="password"
                                        value={secretCode}
                                        onChange={(e) => setSecretCode(e.target.value)}
                                        placeholder="Enter secret code"
                                        autoComplete="off"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                confirmVerify();
                                            }
                                        }}
                                    />
                                </div>

                                <div className={pageStyles.modalActions}>
                                    <button type="button" className={pageStyles.modalCancelBtn} onClick={closeVerifyModal}>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className={pageStyles.modalConfirmBtn}
                                        onClick={confirmVerify}
                                        disabled={!secretCode || !secretCode.trim() || verifyStockLoading}
                                    >
                                        {verifyStockLoading ? 'Verifying…' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default LabTechStock;
