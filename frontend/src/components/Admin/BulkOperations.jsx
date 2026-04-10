import React, { useState } from 'react';
import api from '../../services/api';
import { FaDownload, FaUpload, FaFileExcel, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BulkOperations = ({ onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [exportType, setExportType] = useState('products');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [orderStatus, setOrderStatus] = useState('All');

    const handleExport = async () => {
        setLoading(true);
        try {
            let url = '';
            if (exportType === 'products') {
                url = '/admin/export-products';
            } else {
                url = `/admin/export-orders?status=${orderStatus}`;
                if (dateRange.start) url += `&startDate=${dateRange.start}`;
                if (dateRange.end) url += `&endDate=${dateRange.end}`;
            }
            
            const response = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${exportType}_${Date.now()}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
            toast.success(`${exportType} exported successfully`);
            setShowModal(false);
        } catch (error) {
            toast.error('Export failed');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        setLoading(true);
        try {
            const { data } = await api.post('/admin/import-products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImportResult(data);
            toast.success(data.message);
            if (onComplete) onComplete();
        } catch (error) {
            toast.error('Import failed');
        } finally {
            setLoading(false);
            setSelectedFile(null);
        }
    };

    const downloadTemplate = () => {
        const template = `name,description,price,category,countInStock,imageUrl,rating,isFeatured,hasSizes,sizes
Sample Product,Sample description,19.99,Electronics,100,,0,No,No,
T-Shirt,Comfortable cotton t-shirt,24.99,Clothing,50,,0,Yes,No,
`;
        const blob = new Blob([template], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'product_import_template.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div style={styles.container}>
            <div style={styles.buttonGroup}>
                <button onClick={() => { setExportType('products'); setShowModal(true); }} style={styles.exportBtn}>
                    <FaDownload /> Export Products
                </button>
                <button onClick={() => { setExportType('orders'); setShowModal(true); }} style={styles.exportBtn}>
                    <FaFileExcel /> Export Orders
                </button>
                <label style={styles.importBtn}>
                    <FaUpload /> Import Products
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                </label>
                {selectedFile && (
                    <button onClick={handleImport} style={styles.processBtn} disabled={loading}>
                        {loading ? <FaSpinner style={styles.spinner} /> : <FaCheck />}
                        Process {selectedFile.name}
                    </button>
                )}
            </div>
            
            <button onClick={downloadTemplate} style={styles.templateBtn}>
                Download Template CSV
            </button>

            {importResult && (
                <div style={styles.resultCard}>
                    <h4>Import Results</h4>
                    <p>✅ New: {importResult.imported}</p>
                    <p>🔄 Updated: {importResult.updated}</p>
                    <p>❌ Failed: {importResult.errors.length}</p>
                    {importResult.errors.length > 0 && (
                        <details>
                            <summary>Error Details</summary>
                            {importResult.errors.map((err, i) => (
                                <div key={i} style={styles.errorItem}>
                                    {err.name}: {err.error}
                                </div>
                            ))}
                        </details>
                    )}
                </div>
            )}

            {showModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h3>Export {exportType}</h3>
                        
                        {exportType === 'orders' && (
                            <>
                                <div style={styles.formGroup}>
                                    <label>Date Range (Optional)</label>
                                    <div style={styles.dateRange}>
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                            style={styles.input}
                                        />
                                        <span>to</span>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label>Order Status</label>
                                    <select
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="All">All Orders</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </>
                        )}
                        
                        <div style={styles.modalButtons}>
                            <button onClick={handleExport} style={styles.confirmBtn} disabled={loading}>
                                {loading ? <FaSpinner style={styles.spinner} /> : 'Export'}
                            </button>
                            <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '20px',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    exportBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    importBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    processBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#f59e0b',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    templateBtn: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
    },
    resultCard: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '15px',
        width: '100%',
    },
    errorItem: {
        fontSize: '12px',
        color: '#dc3545',
        marginTop: '5px',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    dateRange: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '5px',
    },
    select: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '5px',
    },
    modalButtons: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
    },
    confirmBtn: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    cancelBtn: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default BulkOperations;