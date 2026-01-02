// src/pages/admin/SuppliersManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { fetchInventory } from '../../store/slices/adminSlice';
import styles from './ReceptionistManagement.module.css';
import tableStyles from '../../components/Admin/ReceptionistTable.module.css';

const InventoryManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { inventory, inventoryLoading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchInventory({ status: statusFilter !== 'all' ? statusFilter : '', search: searchQuery }));
  }, [dispatch, statusFilter, searchQuery]);

  const inventoryStats = {
    total: inventory.length,
    inStock: inventory.filter(i => i.status === 'IN_STOCK').length,
    lowStock: inventory.filter(i => i.status === 'LOW_STOCK').length,
    outOfStock: inventory.filter(i => i.status === 'OUT_OF_STOCK').length
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (inventoryLoading) {
    return (
      <div className={styles.receptionistManagement}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.receptionistManagement}>
        <p>Error: {error}</p>
        <button onClick={() => dispatch(fetchInventory())}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.receptionistManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📦 Medicine Inventory</h1>
          <p className={styles.subtitle}>
            Manage medicine stock and suppliers
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => navigate('/admin/inventory/add')}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Medicine
        </button>
      </div>

      {/* Inventory Stats */}
      <section className={styles.statsSection}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '14px', color: '#718096', margin: '0 0 12px 0' }}>
              Total Medicines
            </h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1a365d', margin: 0 }}>
              {inventoryStats.total}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '14px', color: '#718096', margin: '0 0 12px 0' }}>
              In Stock
            </h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#38a169', margin: 0 }}>
              {inventoryStats.inStock}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '14px', color: '#718096', margin: '0 0 12px 0' }}>
              Low Stock
            </h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#ed8936', margin: 0 }}>
              {inventoryStats.lowStock}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '14px', color: '#718096', margin: '0 0 12px 0' }}>
              Out of Stock
            </h3>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#e53e3e', margin: 0 }}>
              {inventoryStats.outOfStock}
            </p>
          </div>
        </div>
      </section>

      {/* Alert for Low/Out of Stock */}
      {(inventoryStats.lowStock > 0 || inventoryStats.outOfStock > 0) && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ff9800', fontSize: '20px' }} />
          <div>
            <strong>Attention Required:</strong> {inventoryStats.lowStock} medicine{inventoryStats.lowStock !== 1 ? 's' : ''} running low
            {inventoryStats.outOfStock > 0 && `, ${inventoryStats.outOfStock} out of stock`}
          </div>
        </div>
      )}

      {/* Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filter}>
            <label className={styles.filterLabel}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          <button
            className={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* Inventory Table */}
      <section className={styles.tableSection}>
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.receptionistTable}>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Type</th>
                <th>Total Stock</th>
                <th>Batches</th>
                <th>Nearest Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.medicine_id} className={tableStyles.receptionistRow}>
                  <td>
                    <div className={tableStyles.receptionistInfo}>
                      <div className={tableStyles.avatar} style={{
                        background: item.status === 'OUT_OF_STOCK' ? '#e53e3e' :
                                   item.status === 'LOW_STOCK' ? '#ed8936' : '#38a169'
                      }}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={tableStyles.receptionistName}>{item.name}</div>
                        <div className={tableStyles.receptionistEmail}>
                          <span className={tableStyles.shiftBadge} style={{
                            background: '#e6f2ff',
                            color: '#1a365d'
                          }}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{item.type}</td>
                  <td>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: item.status === 'OUT_OF_STOCK' ? '#e53e3e' :
                             item.status === 'LOW_STOCK' ? '#ed8936' : '#2d3748'
                    }}>
                      {item.total_stock}
                    </span>
                  </td>
                  <td>{item.batch_count}</td>
                  <td>
                    {item.nearest_expiry 
                      ? new Date(item.nearest_expiry).toLocaleDateString() 
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={tableStyles.statusBadge} style={{
                      backgroundColor: 
                        item.status === 'IN_STOCK' ? '#d4edda' :
                        item.status === 'LOW_STOCK' ? '#fff3cd' : '#f8d7da',
                      color:
                        item.status === 'IN_STOCK' ? '#155724' :
                        item.status === 'LOW_STOCK' ? '#856404' : '#721c24'
                    }}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInventory.length === 0 && (
            <div className={tableStyles.emptyTable}>
              <p>No medicines found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InventoryManagement;