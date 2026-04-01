import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice';
import { FaEdit, FaTrash, FaPlus, FaStar, FaRegStar, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AdminProductsPage = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.products);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
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
        
        // Update image preview when image URL changes
        if (name === 'imageUrl') {
            setImagePreview(value);
        }
    };

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, imageUrl: url });
        setImagePreview(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', formData);
                toast.success('Product created successfully');
            }
            dispatch(fetchProducts());
            setShowModal(false);
            resetForm();
        } catch (error) {
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
    };

    // Get placeholder image based on category
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

    // Get product image with fallback
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
                                <td style={styles.priceCell}>${product.price.toFixed(2)}</td>
                                <td>
                                    <span style={{
                                        ...styles.stockBadge,
                                        backgroundColor: product.countInStock > 0 ? '#d4edda' : '#f8d7da',
                                        color: product.countInStock > 0 ? '#155724' : '#721c24',
                                    }}>
                                        {product.countInStock}
                                    </span>
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
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
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
                            <input
                                type="number"
                                name="price"
                                placeholder="Price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                style={styles.input}
                            />
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                style={styles.input}
                            >
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Books">Books</option>
                                <option value="Home">Home</option>
                                <option value="Sports">Sports</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                type="number"
                                name="countInStock"
                                placeholder="Stock Quantity"
                                value={formData.countInStock}
                                onChange={handleInputChange}
                                required
                                style={styles.input}
                            />
                            
                            {/* Image URL Input with Preview */}
                            <div style={styles.imageInputContainer}>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    placeholder="Image URL (optional - leave empty for auto-generated)"
                                    value={formData.imageUrl}
                                    onChange={handleImageUrlChange}
                                    style={styles.input}
                                />
                                {imagePreview && (
                                    <div style={styles.imagePreviewContainer}>
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            style={styles.imagePreview}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                document.getElementById('previewError').style.display = 'block';
                                            }}
                                        />
                                        <div id="previewError" style={{ display: 'none', color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                                            Invalid image URL
                                        </div>
                                    </div>
                                )}
                                <p style={styles.imageHint}>
                                    <FaImage /> Leave empty for auto-generated images based on category
                                </p>
                            </div>
                            
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
        maxWidth: '1200px',
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
        color: '#333',
        margin: 0,
    },
    addBtn: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
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
        minWidth: '800px',
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
    stockBadge: {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
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
        padding: '6px 12px',
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginRight: '5px',
    },
    deleteBtn: {
        padding: '6px 12px',
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
        borderRadius: '5px',
        fontSize: '16px',
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px',
        minHeight: '100px',
        fontFamily: 'inherit',
    },
    imageInputContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    imagePreviewContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '5px',
    },
    imagePreview: {
        maxWidth: '100%',
        maxHeight: '150px',
        borderRadius: '5px',
        objectFit: 'contain',
    },
    imageHint: {
        fontSize: '12px',
        color: '#6c757d',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginTop: '5px',
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

export default AdminProductsPage;