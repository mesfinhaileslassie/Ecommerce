import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice';
import { FaEdit, FaTrash, FaPlus, FaStar, FaRegStar, FaImage, FaBoxes, FaTimes, FaUpload, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Predefined size options
const SIZE_OPTIONS = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '28', '30', '32', '34', '36', '38', '40', '42', '44', '46',
    '6', '7', '8', '9', '10', '11', '12', '13', '14',
    'One Size', 'Free Size'
];

const AdminProductsPage = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.products);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [hasSizes, setHasSizes] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [newSize, setNewSize] = useState({ size: '', price: '', countInStock: '' });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        countInStock: '',
        imageUrl: '',
        isFeatured: false,
    });

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        
        if (name === 'imageUrl') {
            setImagePreview(value);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', file);
        
        setUploadingImage(true);
        
        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.success) {
                const imageUrl = response.data.imageUrl;
                setFormData(prev => ({ ...prev, imageUrl: imageUrl }));
                setImagePreview(imageUrl);
                toast.success('Image uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const addSize = () => {
        if (!newSize.size) {
            toast.error('Please select a size');
            return;
        }
        if (!newSize.price) {
            toast.error('Please enter a price');
            return;
        }
        
        if (sizes.some(s => s.size === newSize.size)) {
            toast.error('This size already exists');
            return;
        }
        
        setSizes([...sizes, { 
            size: newSize.size, 
            price: parseFloat(newSize.price), 
            countInStock: parseInt(newSize.countInStock) || 0 
        }]);
        setNewSize({ size: '', price: '', countInStock: '' });
        toast.success('Size added');
    };

    const removeSize = (index) => {
        setSizes(sizes.filter((_, i) => i !== index));
        toast.success('Size removed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (hasSizes && sizes.length === 0) {
            toast.error('Please add at least one size variant');
            return;
        }
        
        if (!hasSizes && (!formData.price || formData.price <= 0)) {
            toast.error('Please enter a valid price');
            return;
        }
        
        const productData = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            imageUrl: formData.imageUrl || '',
            isFeatured: formData.isFeatured,
            hasSizes: hasSizes,
        };
        
        if (!hasSizes) {
            productData.price = parseFloat(formData.price);
            productData.countInStock = parseInt(formData.countInStock) || 0;
        }
        
        if (hasSizes) {
            productData.sizes = sizes;
        }
        
        console.log('Saving product:', productData);
        
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, productData);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', productData);
                toast.success('Product created successfully');
            }
            dispatch(fetchProducts());
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            countInStock: product.countInStock,
            imageUrl: product.imageUrl || '',
            isFeatured: product.isFeatured || false,
        });
        setImagePreview(product.imageUrl || '');
        setHasSizes(product.hasSizes || false);
        setSizes(product.sizes || []);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const result = await dispatch(deleteProduct(id));
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Product deleted successfully');
                }
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    const toggleFeatured = async (id, currentStatus) => {
        try {
            const { data } = await api.put(`/products/${id}/featured`);
            toast.success(data.message);
            dispatch(fetchProducts());
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update featured status');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Electronics',
            countInStock: '',
            imageUrl: '',
            isFeatured: false,
        });
        setImagePreview('');
        setHasSizes(false);
        setSizes([]);
        setNewSize({ size: '', price: '', countInStock: '' });
    };

    const getPlaceholderImage = (category) => {
        const categoryImages = {
            'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=50&h=50&fit=crop',
            'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=50&h=50&fit=crop',
            'Books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=50&h=50&fit=crop',
            'Home': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=50&h=50&fit=crop',
            'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=50&h=50&fit=crop',
        };
        return categoryImages[category] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=50&h=50&fit=crop';
    };

    const getProductImage = (product) => {
        if (product.imageUrl && product.imageUrl !== 'https://via.placeholder.com/300') {
            return product.imageUrl;
        }
        return getPlaceholderImage(product.category);
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <div className="spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Manage Products</h1>
                <button onClick={() => setShowModal(true)} style={styles.addBtn}>
                    <FaPlus /> Add Product
                </button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Sizes</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <img 
                                        src={getProductImage(product)} 
                                        alt={product.name}
                                        style={styles.productImage}
                                        onError={(e) => {
                                            e.target.src = getPlaceholderImage(product.category);
                                        }}
                                    />
                                </td>
                                <td style={styles.productName}>{product.name}</td>
                                <td><span style={styles.categoryBadge}>{product.category}</span></td>
                                <td style={styles.priceCell}>
                                    {product.hasSizes ? (
                                        <span style={styles.variantPrice}>Varies by size</span>
                                    ) : (
                                        `$${product.price.toFixed(2)}`
                                    )}
                                </td>
                                <td>
                                    <span style={{
                                        ...styles.stockBadge,
                                        backgroundColor: product.countInStock > 0 ? '#d4edda' : '#f8d7da',
                                        color: product.countInStock > 0 ? '#155724' : '#721c24',
                                    }}>
                                        {product.hasSizes ? 'Varies' : product.countInStock}
                                    </span>
                                </td>
                                <td>
                                    {product.hasSizes && product.sizes?.length > 0 ? (
                                        <span style={styles.sizesBadge}>
                                            <FaBoxes /> {product.sizes.length} sizes
                                        </span>
                                    ) : (
                                        <span style={styles.noSizesBadge}>No sizes</span>
                                    )}
                                </td>
                                <td>
                                    <button 
                                        onClick={() => toggleFeatured(product._id, product.isFeatured)}
                                        style={{
                                            ...styles.featuredBtn,
                                            backgroundColor: product.isFeatured ? '#ffc107' : '#6c757d',
                                        }}
                                        title={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                                    >
                                        {product.isFeatured ? <FaStar /> : <FaRegStar />}
                                        <span style={{ marginLeft: '5px' }}>
                                            {product.isFeatured ? 'Featured' : 'Not Featured'}
                                        </span>
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(product)} style={styles.editBtn} title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} style={styles.deleteBtn} title="Delete">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setShowModal(false)} style={styles.modalCloseBtn}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Product Name"
                                value={formData.name}
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
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                style={styles.select}
                            >
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Books">Books</option>
                                <option value="Home">Home</option>
                                <option value="Sports">Sports</option>
                                <option value="Other">Other</option>
                            </select>
                            
                            {/* Has Sizes Checkbox */}
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={hasSizes}
                                    onChange={(e) => setHasSizes(e.target.checked)}
                                    style={styles.checkbox}
                                />
                                <span>This product has different sizes/variants</span>
                            </label>
                            
                            {/* Price Field - Disabled when hasSizes is true */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Base Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required={!hasSizes}
                                    disabled={hasSizes}
                                    style={{
                                        ...styles.input,
                                        ...(hasSizes && styles.disabledInput)
                                    }}
                                    step="0.01"
                                />
                                {hasSizes && (
                                    <small style={styles.hintText}>Price will be set per size below</small>
                                )}
                            </div>
                            
                            {/* Stock Field - Disabled when hasSizes is true */}
                            {!hasSizes && (
                                <input
                                    type="number"
                                    name="countInStock"
                                    placeholder="Stock Quantity"
                                    value={formData.countInStock}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.input}
                                />
                            )}
                            
                            {/* Image Upload Section */}
                            <div style={styles.imageUploadSection}>
                                <label style={styles.label}>Product Image</label>
                                <div style={styles.imageUploadContainer}>
                                    {imagePreview ? (
                                        <div style={styles.imagePreviewWrapper}>
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                style={styles.imagePreview}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview('');
                                                    setFormData(prev => ({ ...prev, imageUrl: '' }));
                                                }}
                                                style={styles.removeImageBtn}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={styles.uploadArea}>
                                            <FaImage size={40} color="#999" />
                                            <p>Click or drag to upload image</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={styles.fileInput}
                                                disabled={uploadingImage}
                                            />
                                            {uploadingImage && <FaSpinner style={styles.uploadSpinner} />}
                                        </div>
                                    )}
                                </div>
                                <small style={styles.hintText}>Upload JPG, PNG, or GIF (Max 5MB)</small>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    placeholder="Or enter image URL"
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                />
                            </div>
                            
                            {/* Size Management Section */}
                            {hasSizes && (
                                <div style={styles.sizesSection}>
                                    <h4 style={styles.sizesTitle}>Size Variants</h4>
                                    {sizes.length > 0 && (
                                        <div style={styles.sizesList}>
                                            {sizes.map((size, index) => (
                                                <div key={index} style={styles.sizeItem}>
                                                    <span style={styles.sizeName}>{size.size}</span>
                                                    <span style={styles.sizePrice}>${size.price.toFixed(2)}</span>
                                                    <span style={styles.sizeStock}>Stock: {size.countInStock}</span>
                                                    <button 
                                                        onClick={() => removeSize(index)} 
                                                        style={styles.removeSizeBtn}
                                                        title="Remove size"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div style={styles.addSizeForm}>
                                        <select
                                            value={newSize.size}
                                            onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                                            style={styles.sizeSelect}
                                        >
                                            <option value="">Select Size</option>
                                            {SIZE_OPTIONS.map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={newSize.price}
                                            onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                                            style={styles.sizeInput}
                                            step="0.01"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={newSize.countInStock}
                                            onChange={(e) => setNewSize({ ...newSize, countInStock: e.target.value })}
                                            style={styles.sizeInput}
                                        />
                                        <button type="button" onClick={addSize} style={styles.addSizeBtn}>
                                            <FaPlus /> Add
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                    style={styles.checkbox}
                                />
                                <span>Feature this product (show on homepage)</span>
                            </label>
                            
                            <div style={styles.modalButtons}>
                                <button type="submit" style={styles.saveBtn}>
                                    {editingProduct ? 'Update' : 'Create'}
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
        margin: 0,
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
        fontSize: '14px',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '900px',
    },
    productImage: {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '5px',
    },
    productName: {
        fontWeight: '500',
    },
    categoryBadge: {
        display: 'inline-block',
        padding: '4px 8px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#495057',
    },
    priceCell: {
        fontWeight: 'bold',
        color: '#28a745',
    },
    variantPrice: {
        fontSize: '12px',
        color: '#6c757d',
        fontStyle: 'italic',
    },
    stockBadge: {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
    },
    sizesBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 8px',
        backgroundColor: '#dbeafe',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#1e40af',
    },
    noSizesBadge: {
        display: 'inline-block',
        padding: '4px 8px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6b7280',
    },
    featuredBtn: {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        fontSize: '12px',
        color: '#fff',
        transition: 'all 0.3s',
    },
    editBtn: {
        padding: '6px 10px',
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginRight: '5px',
    },
    deleteBtn: {
        padding: '6px 10px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
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
        borderRadius: '8px',
        width: '90%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    modalCloseBtn: {
        background: 'none',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        color: '#999',
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
    label: {
        fontWeight: '500',
        fontSize: '0.85rem',
        color: '#555',
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
    },
    disabledInput: {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
        cursor: 'not-allowed',
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        minHeight: '100px',
        fontFamily: 'inherit',
    },
    select: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        backgroundColor: '#fff',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    hintText: {
        fontSize: '11px',
        color: '#6c757d',
        marginTop: '2px',
    },
    // Image Upload Styles
    imageUploadSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    imageUploadContainer: {
        width: '100%',
        minHeight: '150px',
    },
    uploadArea: {
        border: '2px dashed #ddd',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s',
        backgroundColor: '#f8f9fa',
    },
    fileInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer',
    },
    uploadSpinner: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '24px',
        color: '#6366f1',
        animation: 'spin 1s linear infinite',
    },
    imagePreviewWrapper: {
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        maxWidth: '200px',
        margin: '0 auto',
    },
    imagePreview: {
        width: '100%',
        height: 'auto',
        maxHeight: '150px',
        objectFit: 'contain',
        borderRadius: '8px',
        border: '1px solid #ddd',
    },
    removeImageBtn: {
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sizesSection: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
    },
    sizesTitle: {
        marginBottom: '10px',
        fontSize: '14px',
        color: '#495057',
    },
    sizesList: {
        marginBottom: '15px',
        maxHeight: '200px',
        overflow: 'auto',
    },
    sizeItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '8px',
        backgroundColor: '#fff',
        borderRadius: '5px',
        marginBottom: '8px',
        border: '1px solid #e9ecef',
    },
    sizeName: {
        fontWeight: 'bold',
        minWidth: '60px',
    },
    sizePrice: {
        color: '#28a745',
        fontWeight: '500',
        minWidth: '80px',
    },
    sizeStock: {
        color: '#6c757d',
        fontSize: '12px',
        flex: 1,
    },
    removeSizeBtn: {
        background: 'none',
        border: 'none',
        color: '#dc3545',
        cursor: 'pointer',
        padding: '5px',
    },
    addSizeForm: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    sizeSelect: {
        flex: 1,
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        minWidth: '100px',
        backgroundColor: '#fff',
    },
    sizeInput: {
        flex: 1,
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '14px',
        minWidth: '100px',
    },
    addSizeBtn: {
        padding: '8px 16px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
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
    center: {
        textAlign: 'center',
        padding: '50px',
    },
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .upload-area:hover {
        border-color: #6366f1;
        background-color: #f0f0ff;
    }
`;
document.head.appendChild(styleSheet);

export default AdminProductsPage;