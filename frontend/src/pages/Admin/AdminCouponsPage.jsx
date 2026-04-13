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
            code: formData.code.toUpperCase(),
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
            <div className="coupons-center">
                <div className="spinner"></div>
                <p>Loading coupons...</p>
            </div>
        );
    }

    return (
        <div className="coupons-container">
            <div className="coupons-header">
                <h1 className="coupons-title">Manage Coupons</h1>
                <button onClick={() => setShowModal(true)} className="coupons-add-btn">
                    <FaPlus /> Create Coupon
                </button>
            </div>

            <div className="coupons-stats-container">
                <div className="coupons-stat-card">
                    <FaTag size={24} color="#6366f1" />
                    <div>
                        <h3>{coupons.length}</h3>
                        <p>Total Coupons</p>
                    </div>
                </div>
                <div className="coupons-stat-card">
                    <FaPercentage size={24} color="#10b981" />
                    <div>
                        <h3>{coupons.filter(c => c.discountType === 'percentage').length}</h3>
                        <p>Percentage Discounts</p>
                    </div>
                </div>
                <div className="coupons-stat-card">
                    <FaDollarSign size={24} color="#f59e0b" />
                    <div>
                        <h3>{coupons.filter(c => c.discountType === 'fixed').length}</h3>
                        <p>Fixed Discounts</p>
                    </div>
                </div>
                <div className="coupons-stat-card">
                    <FaBoxes size={24} color="#ef4444" />
                    <div>
                        <h3>{coupons.filter(c => (c.minimumItems || 0) > 0).length}</h3>
                        <p>Has Item Min</p>
                    </div>
                </div>
            </div>

            <div className="coupons-table-container">
                <table className="coupons-table">
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
                                <td className="coupons-code">{coupon.code}</td>
                                <td className="coupons-description-cell">{coupon.description}</td>
                                <td className="coupons-discount-cell">{getDiscountDisplay(coupon)}</td>
                                <td>${coupon.minimumOrder || 0}</td>
                                <td>
                                    <span className={`coupons-items-badge ${(coupon.minimumItems || 0) > 0 ? 'coupons-items-badge-active' : 'coupons-items-badge-inactive'}`}>
                                        <FaBoxes size={10} style={{ marginRight: '4px' }} />
                                        {coupon.minimumItems || 0} item{(coupon.minimumItems || 0) !== 1 ? 's' : ''}
                                    </span>
                                </td>
                                <td className="coupons-date-cell">
                                    {new Date(coupon.startDate).toLocaleDateString()}<br />
                                    <span className="coupons-to-text">to</span><br />
                                    {new Date(coupon.endDate).toLocaleDateString()}
                                </td>
                                <td>
                                    {coupon.usedCount || 0}
                                    {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                                        className={`coupons-status-btn ${coupon.isActive ? 'coupons-status-active' : 'coupons-status-inactive'}`}
                                    >
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(coupon)} className="coupons-edit-btn" title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(coupon._id)} className="coupons-delete-btn" title="Delete">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {coupons.length === 0 && (
                    <div className="coupons-empty-state">
                        <FaTag size={48} color="#ccc" />
                        <h3>No coupons yet</h3>
                        <p>Create your first coupon to start offering discounts!</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="coupons-modal">
                    <div className="coupons-modal-content">
                        <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                        <form onSubmit={handleSubmit} className="coupons-form">
                            <div className="coupons-form-group">
                                <label className="coupons-label">Coupon Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="e.g., SUMMER20"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    className="coupons-input"
                                />
                                <small className="coupons-hint">Code will be automatically converted to uppercase</small>
                            </div>
                            
                            <div className="coupons-form-group">
                                <label className="coupons-label">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Describe the coupon (e.g., 20% off summer sale)"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    className="coupons-textarea"
                                />
                            </div>
                            
                            <div className="coupons-form-row">
                                <div className="coupons-form-group">
                                    <label className="coupons-label">Discount Type</label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        className="coupons-select"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                
                                <div className="coupons-form-group">
                                    <label className="coupons-label">
                                        {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                                    </label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 10'}
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        required
                                        className="coupons-input"
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            <div className="coupons-form-row">
                                <div className="coupons-form-group">
                                    <label className="coupons-label">Minimum Order Amount</label>
                                    <input
                                        type="number"
                                        name="minimumOrder"
                                        placeholder="e.g., 50 (leave 0 for no minimum)"
                                        value={formData.minimumOrder}
                                        onChange={handleInputChange}
                                        className="coupons-input"
                                        step="0.01"
                                        min="0"
                                    />
                                    <small className="coupons-hint">Minimum cart total required</small>
                                </div>
                                
                                <div className="coupons-form-group">
                                    <label className="coupons-label">Minimum Items Required</label>
                                    <input
                                        type="number"
                                        name="minimumItems"
                                        placeholder="e.g., 3 (number of items in cart)"
                                        value={formData.minimumItems}
                                        onChange={handleInputChange}
                                        className="coupons-input"
                                        min="0"
                                        step="1"
                                    />
                                    <small className="coupons-hint">Minimum number of items in cart</small>
                                </div>
                            </div>
                            
                            {formData.discountType === 'percentage' && (
                                <div className="coupons-form-group">
                                    <label className="coupons-label">Maximum Discount Amount (Optional)</label>
                                    <input
                                        type="number"
                                        name="maxDiscount"
                                        placeholder="e.g., 100 (max discount amount)"
                                        value={formData.maxDiscount}
                                        onChange={handleInputChange}
                                        className="coupons-input"
                                        step="0.01"
                                        min="0"
                                    />
                                    <small className="coupons-hint">Limit the maximum discount for percentage coupons</small>
                                </div>
                            )}
                            
                            <div className="coupons-form-row">
                                <div className="coupons-form-group">
                                    <label className="coupons-label">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                        className="coupons-input"
                                    />
                                </div>
                                
                                <div className="coupons-form-group">
                                    <label className="coupons-label">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                        className="coupons-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="coupons-form-group">
                                <label className="coupons-label">Usage Limit (Optional)</label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    placeholder="e.g., 100 (maximum number of times coupon can be used)"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    className="coupons-input"
                                    min="1"
                                />
                                <small className="coupons-hint">Leave empty for unlimited uses</small>
                            </div>
                            
                            <div className="coupons-modal-buttons">
                                <button type="submit" className="coupons-save-btn">
                                    {editingCoupon ? 'Update' : 'Create'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="coupons-cancel-btn"
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

// Inject CSS Styles for Coupons Page
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    /* Coupons Page Styles - Dark Mode Compatible */
    .coupons-center {
        text-align: center;
        padding: 50px;
    }
    
    .coupons-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .coupons-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .coupons-title {
        font-size: 1.8rem;
        color: var(--text-primary, #333);
        margin: 0;
    }
    
    .coupons-add-btn {
        padding: 10px 20px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .coupons-stats-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .coupons-stat-card {
        background-color: var(--card-bg, #fff);
        padding: 20px;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .coupons-stat-card div h3 {
        color: var(--text-primary, #333);
        margin: 0 0 5px 0;
        font-size: 1.5rem;
    }
    
    .coupons-stat-card div p {
        color: var(--text-secondary, #666);
        margin: 0;
        font-size: 0.85rem;
    }
    
    .coupons-table-container {
        background-color: var(--card-bg, #fff);
        border-radius: 1rem;
        overflow: auto;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .coupons-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 900px;
    }
    
    .coupons-table th {
        background-color: var(--table-header-bg, #f9fafb);
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: var(--text-primary, #333);
        border-bottom: 1px solid var(--border-color, #e5e7eb);
    }
    
    .coupons-table td {
        padding: 12px;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        color: var(--text-primary, #333);
    }
    
    .coupons-code {
        font-weight: bold;
        font-family: monospace;
        font-size: 0.9rem;
        color: #6366f1;
    }
    
    .coupons-description-cell {
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .coupons-discount-cell {
        font-weight: bold;
        color: #10b981;
    }
    
    .coupons-date-cell {
        font-size: 0.75rem;
        line-height: 1.4;
    }
    
    .coupons-to-text {
        font-size: 0.65rem;
        color: var(--text-secondary, #999);
    }
    
    .coupons-items-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .coupons-items-badge-active {
        background-color: #dbeafe;
        color: #1e40af;
    }
    
    body.dark-mode .coupons-items-badge-active {
        background-color: #1e3a5f;
        color: #93c5fd;
    }
    
    .coupons-items-badge-inactive {
        background-color: #f3f4f6;
        color: #6b7280;
    }
    
    body.dark-mode .coupons-items-badge-inactive {
        background-color: #374151;
        color: #9ca3af;
    }
    
    .coupons-status-btn {
        padding: 4px 12px;
        border-radius: 20px;
        border: none;
        cursor: pointer;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .coupons-status-active {
        background-color: #d1fae5;
        color: #065f46;
    }
    
    body.dark-mode .coupons-status-active {
        background-color: #064e3b;
        color: #34d399;
    }
    
    .coupons-status-inactive {
        background-color: #fee2e2;
        color: #991b1b;
    }
    
    body.dark-mode .coupons-status-inactive {
        background-color: #7f1d1d;
        color: #fca5a5;
    }
    
    .coupons-edit-btn {
        padding: 6px 10px;
        background-color: #f59e0b;
        color: #fff;
        border: none;
        border-radius: 0.3rem;
        cursor: pointer;
        margin-right: 5px;
    }
    
    .coupons-delete-btn {
        padding: 6px 10px;
        background-color: #dc3545;
        color: #fff;
        border: none;
        border-radius: 0.3rem;
        cursor: pointer;
    }
    
    .coupons-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .coupons-modal-content {
        background-color: var(--card-bg, #fff);
        padding: 30px;
        border-radius: 1rem;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow: auto;
        border: 1px solid var(--border-color, #e5e7eb);
    }
    
    .coupons-modal-content h2 {
        color: var(--text-primary, #333);
        margin-bottom: 20px;
    }
    
    .coupons-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .coupons-form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .coupons-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }
    
    .coupons-label {
        font-weight: 500;
        font-size: 0.85rem;
        color: var(--text-primary, #555);
    }
    
    .coupons-input {
        padding: 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 0.9rem;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .coupons-textarea {
        padding: 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 0.9rem;
        min-height: 80px;
        font-family: inherit;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .coupons-select {
        padding: 10px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 0.5rem;
        font-size: 0.9rem;
        background-color: var(--input-bg, #fff);
        color: var(--text-primary, #333);
    }
    
    .coupons-hint {
        font-size: 0.7rem;
        color: var(--text-secondary, #999);
        margin-top: 2px;
    }
    
    .coupons-modal-buttons {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    
    .coupons-save-btn {
        flex: 1;
        padding: 10px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .coupons-cancel-btn {
        flex: 1;
        padding: 10px;
        background-color: #6c757d;
        color: #fff;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
    }
    
    .coupons-empty-state {
        text-align: center;
        padding: 60px;
        color: var(--text-secondary, #999);
    }
    
    .coupons-empty-state h3 {
        color: var(--text-primary, #333);
        margin-top: 15px;
    }
    
    @media (max-width: 768px) {
        .coupons-form-row {
            grid-template-columns: 1fr;
            gap: 10px;
        }
        
        .coupons-stats-container {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
    }
`;
document.head.appendChild(styleSheet);

export default AdminCouponsPage;