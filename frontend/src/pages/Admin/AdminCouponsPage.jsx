import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaTag, FaPercentage, FaDollarSign } from 'react-icons/fa';
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
            setCoupons(data.coupons);
        } catch (error) {
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
        
        try {
            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon._id}`, formData);
                toast.success('Coupon updated successfully');
            } else {
                await api.post('/coupons', formData);
                toast.success('Coupon created successfully');
            }
            fetchCoupons();
            setShowModal(false);
            resetForm();
        } catch (error) {
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
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    // Updated
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Discount</th>
                                <th>Min. Order</th>
                                <th>Min. Items</th>  {/* Add this column */}
                                <th>Valid Period</th>
                                <th>Uses</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        // Update the table body - add Min Items data
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon._id}>
                                    <td style={styles.couponCode}>{coupon.code}</td>
                                    <td>{coupon.description}</td>
                                    <td style={styles.discountCell}>{getDiscountDisplay(coupon)}</td>
                                    <td>${coupon.minimumOrder || 0}</td>
                                    <td>{coupon.minimumItems || 0} items</td>  {/* Add this line */}
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
                            <input
                                type="text"
                                name="code"
                                placeholder="Coupon Code (e.g., SAVE20)"
                                value={formData.code}
                                onChange={handleInputChange}
                                required
                                style={styles.input}
                            />
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                style={styles.textarea}
                            />
                            
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleInputChange}
                                style={styles.select}
                            >
                                <option value="percentage">Percentage Discount (%)</option>
                                <option value="fixed">Fixed Amount Discount ($)</option>
                            </select>
                            
                            <input
                                type="number"
                                name="discountValue"
                                placeholder={formData.discountType === 'percentage' ? 'Discount Percentage (e.g., 20)' : 'Discount Amount (e.g., 10)'}
                                value={formData.discountValue}
                                onChange={handleInputChange}
                                required
                                style={styles.input}
                            />
                            
                            <input
                                type="number"
                                name="minimumOrder"
                                placeholder="Minimum Order Amount (optional)"
                                value={formData.minimumOrder}
                                onChange={handleInputChange}
                                style={styles.input}
                            />


                            <input
                                    type="number"
                                    name="minimumItems"
                                    placeholder="Minimum Items Required (e.g., 3)"
                                    value={formData.minimumItems}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                />

                            
                            {formData.discountType === 'percentage' && (
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    placeholder="Maximum Discount Amount (optional)"
                                    value={formData.maxDiscount}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                />
                            )}
                            
                            <div style={styles.dateGroup}>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.dateInput}
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.dateInput}
                                />
                            </div>
                            
                            <input
                                type="number"
                                name="usageLimit"
                                placeholder="Usage Limit (optional)"
                                value={formData.usageLimit}
                                onChange={handleInputChange}
                                style={styles.input}
                            />
                            

                            //validation to ensure minimum items is set
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Minimum Items Required</label>
                                <input
                                    type="number"
                                    name="minimumItems"
                                    placeholder="e.g., 3 (customer must buy at least 3 items)"
                                    value={formData.minimumItems}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    min="0"
                                />
                                <small style={styles.hintText}>Leave 0 or empty for no minimum item requirement</small>
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
        minWidth: '800px',
    },
    couponCode: {
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: '1rem',
        color: '#6366f1',
    },
    discountCell: {
        fontWeight: 'bold',
        color: '#10b981',
    },
    dateCell: {
        fontSize: '0.8rem',
        lineHeight: '1.4',
    },
    toText: {
        fontSize: '0.7rem',
        color: '#999',
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '1rem',
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        minHeight: '80px',
        fontFamily: 'inherit',
    },
    select: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        backgroundColor: '#fff',
    },
    dateGroup: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    dateInput: {
        flex: 1,
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        fontSize: '1rem',
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