// src/pages/admin/SuppliersManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory } from '../../store/slices/adminSlice';
import styles from './StaffManagement.module.css';

const InventoryManagement = () => {
  const dispatch = useDispatch();
  const { inventory, inventoryLoading, error } = useSelector((state) => state.admin);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchInventory({ status: statusFilter, search: searchQuery }));
  }, [dispatch, statusFilter, searchQuery]);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = inventory.filter(i => i.status === 'LOW_STOCK').length;
  const outOfStockCount = inventory.filter(i => i.status === 'OUT_OF_STOCK').length;

  return (
    <div className={styles.staffManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📦 Medicine Inventory</h1>
          <p className={styles.subtitle}>
            Manage medicine stock and suppliers
          </p>
        </div>
        <button className={styles.addButton}>+ Add Medicine</button>
      </div>

      {error && (
        <div className={styles.errorAlert}>✗ {error}</div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Medicines</h3>
          <p className={styles.statValue}>{inventory.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Low Stock</h3>
          <p className={styles.statValue} style={{ color: '#ff9800' }}>
            {lowStockCount}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Out of Stock</h3>
          <p className={styles.statValue} style={{ color: '#f44336' }}>
            {outOfStockCount}
          </p>
        </div>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

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
      </div>

      {inventoryLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading inventory...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Type</th>
                <th>Total Stock</th>
                <th>Batches</th>
                <th>Nearest Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.medicine_id}>
                  <td>{item.name}</td>
                  <td>
                    <span className={styles.typeBadge}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.total_stock}</td>
                  <td>{item.batch_count}</td>
                  <td>
                    {item.nearest_expiry 
                      ? new Date(item.nearest_expiry).toLocaleDateString() 
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      item.status === 'IN_STOCK' ? styles.active :
                      item.status === 'LOW_STOCK' ? styles.pending :
                      styles.inactive
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.viewBtn}>View</button>
                      <button className={styles.editBtn}>Restock</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInventory.length === 0 && (
            <div className={styles.emptyState}>
              <p>No medicines found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;