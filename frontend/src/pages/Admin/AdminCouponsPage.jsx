import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaTag, FaPercentage, FaDollarSign, FaBoxes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminCouponsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minimumOrder: '',
        minimumItems: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
    });

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchCoupons();
        }
    }, [user]);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');
            console.log('Fetched coupons:', data.coupons);
            setCoupons(data.coupons);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            toast.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate dates
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast.error('End date must be after start date');
            return;
        }
        
        // Validate minimum items
        const minimumItemsNum = parseInt(formData.minimumItems) || 0;
        if (minimumItemsNum < 0) {
            toast.error('Minimum items cannot be negative');
            return;
        }
        
        const couponData = {
            code: formData.code,
            description: formData.description,
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            minimumOrder: parseFloat(formData.minimumOrder) || 0,
            minimumItems: minimumItemsNum,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
            startDate: formData.startDate,
            endDate: formData.endDate,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        };
        
        console.log('Sending coupon data:', couponData);
        
        try {
            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon._id}`, couponData);
                toast.success('Coupon updated successfully');
            } else {
                await api.post('/coupons', couponData);
                toast.success('Coupon created successfully');
            }
            fetchCoupons();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving coupon:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await api.delete(`/coupons/${id}`);
                toast.success('Coupon deleted successfully');
                fetchCoupons();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minimumOrder: coupon.minimumOrder || '',
            minimumItems: coupon.minimumItems || '',
            maxDiscount: coupon.maxDiscount || '',
            startDate: coupon.startDate.split('T')[0],
            endDate: coupon.endDate.split('T')[0],
            usageLimit: coupon.usageLimit || '',
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            minimumOrder: '',
            minimumItems: '',
            maxDiscount: '',
            startDate: '',
            endDate: '',
            usageLimit: '',
        });
    };

    const toggleCouponStatus = async (id, currentStatus) => {
        try {
            await api.put(`/coupons/${id}`, { isActive: !currentStatus });
            toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getDiscountDisplay = (coupon) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}% OFF`;
        }
        return `$${coupon.discountValue} OFF`;
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <div className="spinner"></div>
                <p>Loading coupons...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Manage Coupons</h1>
                <button onClick={() => setShowModal(true)} style={styles.addBtn}>
                    <FaPlus /> Create Coupon
                </button>
            </div>

            <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                    <FaTag size={24} color="#6366f1" />
                    <div>
                        <h3>{coupons.length}</h3>
                        <p>Total Coupons</p>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <FaPercentage size={24} color="#10b981" />
                    <div>
                        <h3>{coupons.filter(c => c.discountType === 'percentage').length}</h3>
                        <p>Percentage Discounts</p>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <FaDollarSign size={24} color="#f59e0b" />
                    <div>
                        <h3>{coupons.filter(c => c.discountType === 'fixed').length}</h3>
                        <p>Fixed Discounts</p>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <FaBoxes size={24} color="#ef4444" />
                    <div>
                        <h3>{coupons.filter(c => (c.minimumItems || 0) > 0).length}</h3>
                        <p>Has Item Min</p>
                    </div>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Discount</th>
                            <th>Min. Order</th>
                            <th>Min. Items</th>
                            <th>Valid Period</th>
                            <th>Uses</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon._id}>
                                <td style={styles.couponCode}>{coupon.code}</td>
                                <td style={styles.descriptionCell}>{coupon.description}</td>
                                <td style={styles.discountCell}>{getDiscountDisplay(coupon)}</td>
                                <td>${coupon.minimumOrder || 0}</td>
                                <td>
                                    <span style={{
                                        ...styles.itemsBadge,
                                        backgroundColor: (coupon.minimumItems || 0) > 0 ? '#dbeafe' : '#f3f4f6',
                                        color: (coupon.minimumItems || 0) > 0 ? '#1e40af' : '#6b7280',
                                    }}>
                                        <FaBoxes size={10} style={{ marginRight: '4px' }} />
                                        {coupon.minimumItems || 0} item{(coupon.minimumItems || 0) !== 1 ? 's' : ''}
                                    </span>
                                </td>
                                <td style={styles.dateCell}>
                                    {new Date(coupon.startDate).toLocaleDateString()}<br />
                                    <span style={styles.toText}>to</span><br />
                                    {new Date(coupon.endDate).toLocaleDateString()}
                                </td>
                                <td>
                                    {coupon.usedCount || 0}
                                    {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                                        style={{
                                            ...styles.statusBtn,
                                            backgroundColor: coupon.isActive ? '#d1fae5' : '#fee2e2',
                                            color: coupon.isActive ? '#065f46' : '#991b1b',
                                        }}
                                    >
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(coupon)} style={styles.editBtn} title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(coupon._id)} style={styles.deleteBtn} title="Delete">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {coupons.length === 0 && (
                    <div style={styles.emptyState}>
                        <FaTag size={48} color="#ccc" />
                        <h3>No coupons yet</h3>
                        <p>Create your first coupon to start offering discounts!</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Coupon Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="e.g., SUMMER20"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                />
                                <small style={styles.hint}>Code will be automatically converted to uppercase</small>
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Describe the coupon (e.g., 20% off summer sale)"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.textarea}
                                />
                            </div>
                            
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Discount Type</label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        style={styles.select}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                                    </label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 10'}
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Minimum Order Amount</label>
                                    <input
                                        type="number"
                                        name="minimumOrder"
                                        placeholder="e.g., 50 (leave 0 for no minimum)"
                                        value={formData.minimumOrder}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        step="0.01"
                                        min="0"
                                    />
                                    <small style={styles.hint}>Minimum cart total required</small>
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Minimum Items Required</label>
                                    <input
                                        type="number"
                                        name="minimumItems"
                                        placeholder="e.g., 3 (number of items in cart)"
                                        value={formData.minimumItems}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        min="0"
                                        step="1"
                                    />
                                    <small style={styles.hint}>Minimum number of items in cart</small>
                                </div>
                            </div>
                            
                            {formData.discountType === 'percentage' && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Maximum Discount Amount (Optional)</label>
                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        placeholder="e.g., 100 (max discount amount)"
                                        value={formData.maxDiscount}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        step="0.01"
                                        min="0"
                                    />
                                    <small style={styles.hint}>Limit the maximum discount for percentage coupons</small>
                                </div>
                            )}
                            
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Usage Limit (Optional)</label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    placeholder="e.g., 100 (maximum number of times coupon can be used)"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    min="1"
                                />
                                <small style={styles.hint}>Leave empty for unlimited uses</small>
                            </div>
                            
                            <div style={styles.modalButtons}>
                                <button type="submit" style={styles.saveBtn}>
                                    {editingCoupon ? 'Update' : 'Create'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    title: {
        fontSize: '1.8rem',
        color: '#333',
    },
    addBtn: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '1rem',
        overflow: 'auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '900px',
    },
    couponCode: {
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        color: '#6366f1',
    },
    descriptionCell: {
        maxWidth: '200px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    discountCell: {
        fontWeight: 'bold',
        color: '#10b981',
    },
    dateCell: {
        fontSize: '0.75rem',
        lineHeight: '1.4',
    },
    toText: {
        fontSize: '0.65rem',
        color: '#999',
    },
    itemsBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
    },
    statusBtn: {
        padding: '4px 12px',
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '500',
    },
    editBtn: {
        padding: '6px 10px',
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '0.3rem',
        cursor: 'pointer',
        marginRight: '5px',
    },
    deleteBtn: {
        padding: '6px 10px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '0.3rem',
        cursor: 'pointer',
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
        borderRadius: '1rem',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
    },
    label: {
        fontWeight: '500',
        fontSize: '0.85rem',
        color: '#555',
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        minHeight: '80px',
        fontFamily: 'inherit',
    },
    select: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        backgroundColor: '#fff',
    },
    hint: {
        fontSize: '0.7rem',
        color: '#999',
        marginTop: '2px',
    },
    modalButtons: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
    },
    saveBtn: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    cancelBtn: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px',
        color: '#999',
    },
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

export default AdminCouponsPage;