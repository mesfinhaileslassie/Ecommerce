const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); 

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    next();
});

// ============================================
// USER MODEL
// ============================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Helper functions
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================
// REVIEW MODEL
// ============================================
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ============================================
// PRODUCT MODEL
// ============================================
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    countInStock: { type: Number, default: 0 },
    imageUrl: { type: String, default: 'https://via.placeholder.com/300' },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    reviews: [reviewSchema],
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// ============================================
// CART MODEL
// ============================================
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: Number,
    imageUrl: String,
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Cart = mongoose.model('Cart', cartSchema);

// ============================================
// ORDER MODEL
// ============================================
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Credit Card', 'PayPal', 'Cash on Delivery'],
        default: 'Credit Card'
    },
    paymentResult: {
        id: String,
        status: String,
        updateTime: String,
        emailAddress: String
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date,
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);

// ============================================
// WISHLIST MODEL
// ============================================
const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: Number,
    imageUrl: String,
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [wishlistItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// ============================================
// ADDRESS MODEL
// ============================================
const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Address = mongoose.model('Address', addressSchema);

// ============================================
// PROTECT MIDDLEWARE
// ============================================
const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};

// Admin middleware
const admin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user && user.isAdmin) {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Admin access required' });
        }
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
};


// ============================================
// COUPON MODEL
// ============================================
const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minimumOrder: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// ============================================
// COUPON ROUTES
// ============================================

// Get all coupons (Admin only)
app.get('/api/coupons', protect, admin, async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get active coupons for customers
app.get('/api/coupons/active', async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
        res.json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create coupon (Admin only)
app.post('/api/coupons', protect, admin, async (req, res) => {
    try {
        const { code, description, discountType, discountValue, minimumOrder, maxDiscount, startDate, endDate, usageLimit } = req.body;
        
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }
        
        const coupon = new Coupon({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            minimumOrder: minimumOrder || 0,
            maxDiscount: maxDiscount || null,
            startDate,
            endDate,
            usageLimit: usageLimit || null
        });
        
        await coupon.save();
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Validate coupon
app.post('/api/coupons/validate', async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        
        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
        }
        
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }
        
        if (cartTotal < coupon.minimumOrder) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum order amount of $${coupon.minimumOrder} required` 
            });
        }
        
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }
        
        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount: discountAmount.toFixed(2),
                finalTotal: (cartTotal - discountAmount).toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Apply coupon to order
app.post('/api/coupons/apply', protect, async (req, res) => {
    try {
        const { code, orderId } = req.body;
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Coupon not found' });
        }
        
        coupon.usedCount += 1;
        await coupon.save();
        
        res.json({ success: true, message: 'Coupon applied successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update coupon (Admin only)
app.put('/api/coupons/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete coupon (Admin only)
app.delete('/api/coupons/:id', protect, admin, async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);



// ============================================
// TEST ROUTES
// ============================================
app.get('/', (req, res) => {
    res.send('✅ E-Commerce Server is running!');
});

app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API test route is working!' });
});

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all fields' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        
        const hashedPassword = await hashPassword(password);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        
        const token = generateToken(user._id);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const token = generateToken(user._id);
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Profile
app.get('/api/auth/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// PRODUCT ROUTES
// ============================================

// Get all products
// Get all products with search, filter, and sort
app.get('/api/products', async (req, res) => {
    try {
        const { 
            keyword, 
            category, 
            minPrice, 
            maxPrice, 
            rating,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 12
        } = req.query;
        
        // Build query object
        let query = {};
        
        // Search by keyword (name or description)
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }
        
        // Filter by category
        if (category && category !== 'All') {
            query.category = category;
        }
        
        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        
        // Filter by rating
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }
        
        // Build sort object
        let sortObject = {};
        switch(sortBy) {
            case 'price':
                sortObject.price = order === 'asc' ? 1 : -1;
                break;
            case 'rating':
                sortObject.rating = order === 'asc' ? 1 : -1;
                break;
            case 'name':
                sortObject.name = order === 'asc' ? 1 : -1;
                break;
            default:
                sortObject.createdAt = -1;
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Execute query
        const products = await Product.find(query)
            .sort(sortObject)
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Product.countDocuments(query);
        
        res.json({
            success: true,
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            filters: { keyword, category, minPrice, maxPrice, rating, sortBy, order }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get unique categories (for filter dropdown)
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get featured products
app.get('/api/products/featured', async (req, res) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).limit(8);
        res.json({ success: true, count: featuredProducts.length, products: featuredProducts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create product (Admin only)
app.post('/api/products', protect, admin, async (req, res) => {
    try {
        const { name, description, price, category, countInStock, imageUrl, isFeatured } = req.body;
        
        if (!name || !description || !price || !category) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        const product = new Product({
            name,
            slug,
            description,
            price,
            category,
            countInStock: countInStock || 0,
            imageUrl: imageUrl || 'https://via.placeholder.com/300',
            isFeatured: isFeatured || false
        });
        
        await product.save();
        
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update product (Admin only)
app.put('/api/products/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        if (req.body.name) {
            req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete product (Admin only)
app.delete('/api/products/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        
        res.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle featured status (Admin only)
app.put('/api/products/:id/featured', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        product.isFeatured = !product.isFeatured;
        await product.save();
        
        res.json({ 
            success: true, 
            message: `Product ${product.isFeatured ? 'added to' : 'removed from'} featured`, 
            product 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// REVIEW ROUTES
// ============================================

// Create product review
app.post('/api/products/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.userId.toString()
        );
        
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'Product already reviewed' });
        }
        
        const user = await User.findById(req.userId);
        
        const review = {
            user: req.userId,
            name: user.name,
            rating: Number(rating),
            comment,
        };
        
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        
        await product.save();
        
        res.status(201).json({ success: true, message: 'Review added', product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get product reviews
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, reviews: product.reviews, rating: product.rating, numReviews: product.numReviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// CART ROUTES
// ============================================

// Get user's cart
app.get('/api/cart', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.userId }).populate('items.product');
        
        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] });
            await cart.save();
        }
        
        res.json({
            success: true,
            cart: {
                _id: cart._id,
                items: cart.items,
                totalPrice: cart.totalPrice,
                itemCount: cart.items.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add item to cart
app.post('/api/cart/add', protect, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID required' });
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        if (product.countInStock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }
        
        let cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] });
        }
        
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );
        
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity
            });
        }
        
        let total = 0;
        for (const item of cart.items) {
            total += item.price * item.quantity;
        }
        cart.totalPrice = total;
        cart.updatedAt = Date.now();
        
        await cart.save();
        
        res.json({
            success: true,
            message: 'Item added to cart',
            cart: {
                items: cart.items,
                totalPrice: cart.totalPrice,
                itemCount: cart.items.length
            }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update cart item quantity
app.put('/api/cart/update/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Valid quantity required' });
        }
        
        const cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not in cart' });
        }
        
        const product = await Product.findById(productId);
        if (product && product.countInStock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }
        
        cart.items[itemIndex].quantity = quantity;
        
        let total = 0;
        for (const item of cart.items) {
            total += item.price * item.quantity;
        }
        cart.totalPrice = total;
        cart.updatedAt = Date.now();
        
        await cart.save();
        
        res.json({
            success: true,
            message: 'Cart updated',
            cart: {
                items: cart.items,
                totalPrice: cart.totalPrice,
                itemCount: cart.items.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove item from cart
app.delete('/api/cart/remove/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        
        const cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );
        
        let total = 0;
        for (const item of cart.items) {
            total += item.price * item.quantity;
        }
        cart.totalPrice = total;
        cart.updatedAt = Date.now();
        
        await cart.save();
        
        res.json({
            success: true,
            message: 'Item removed from cart',
            cart: {
                items: cart.items,
                totalPrice: cart.totalPrice,
                itemCount: cart.items.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Clear cart
app.delete('/api/cart/clear', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId });
        if (cart) {
            cart.items = [];
            cart.totalPrice = 0;
            cart.updatedAt = Date.now();
            await cart.save();
        }
        
        res.json({
            success: true,
            message: 'Cart cleared',
            cart: { items: [], totalPrice: 0, itemCount: 0 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ORDER ROUTES
// ============================================

// Create order from cart
app.post('/api/orders', protect, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;
        
        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Please provide shipping address and payment method' });
        }
        
        const cart = await Cart.findOne({ user: req.userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        
        for (const item of cart.items) {
            const product = await Product.findById(item.product);
            if (!product || product.countInStock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${item.name}` 
                });
            }
        }
        
        const order = new Order({
            user: req.userId,
            items: cart.items.map(item => ({
                product: item.product,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl
            })),
            totalPrice: cart.totalPrice,
            shippingAddress,
            paymentMethod
        });
        
        await order.save();
        
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: -item.quantity }
            });
        }
        
        cart.items = [];
        cart.totalPrice = 0;
        cart.updatedAt = Date.now();
        await cart.save();
        
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user's orders
app.get('/api/orders/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single order
app.get('/api/orders/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (order.user.toString() !== req.userId) {
            const user = await User.findById(req.userId);
            if (!user.isAdmin) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
        }
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status (Admin only)
app.put('/api/orders/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        order.status = status;
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        
        await order.save();
        
        res.json({ success: true, message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders (Admin only)
app.get('/api/orders', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// WISHLIST ROUTES
// ============================================

// Get user's wishlist
app.get('/api/wishlist', protect, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.userId }).populate('items.product');
        
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.userId, items: [] });
            await wishlist.save();
        }
        
        res.json({
            success: true,
            wishlist: {
                items: wishlist.items,
                itemCount: wishlist.items.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add to wishlist
app.post('/api/wishlist/add', protect, async (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID required' });
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        let wishlist = await Wishlist.findOne({ user: req.userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.userId, items: [] });
        }
        
        const exists = wishlist.items.find(
            item => item.product.toString() === productId
        );
        
        if (exists) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }
        
        wishlist.items.push({
            product: productId,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl
        });
        
        wishlist.updatedAt = Date.now();
        await wishlist.save();
        
        res.json({
            success: true,
            message: 'Added to wishlist',
            wishlist: {
                items: wishlist.items,
                itemCount: wishlist.items.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove from wishlist
app.delete('/api/wishlist/remove/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        
        const wishlist = await Wishlist.findOne({ user: req.userId });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }
        
        wishlist.items = wishlist.items.filter(
            item => item.product.toString() !== productId
        );
        
        wishlist.updatedAt = Date.now();
        await wishlist.save();
        
        res.json({
            success: true,
            message: 'Removed from wishlist',
            wishlist: {
                items: wishlist.items,
                itemCount: wishlist.items.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADDRESS ROUTES
// ============================================

// Get user's addresses
app.get('/api/addresses', protect, async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.userId }).sort({ isDefault: -1, createdAt: -1 });
        res.json({ success: true, addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add address
app.post('/api/addresses', protect, async (req, res) => {
    try {
        const { fullName, address, city, postalCode, country, phone, isDefault } = req.body;
        
        if (!fullName || !address || !city || !postalCode || !country || !phone) {
            return res.status(400).json({ success: false, message: 'Please provide all fields' });
        }
        
        if (isDefault) {
            await Address.updateMany(
                { user: req.userId },
                { $set: { isDefault: false } }
            );
        }
        
        const newAddress = new Address({
            user: req.userId,
            fullName,
            address,
            city,
            postalCode,
            country,
            phone,
            isDefault: isDefault || false
        });
        
        await newAddress.save();
        
        res.status(201).json({ success: true, message: 'Address added', address: newAddress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update address
app.put('/api/addresses/:id', protect, async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        
        if (address.user.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        const { fullName, address: street, city, postalCode, country, phone, isDefault } = req.body;
        
        if (isDefault) {
            await Address.updateMany(
                { user: req.userId, _id: { $ne: req.params.id } },
                { $set: { isDefault: false } }
            );
        }
        
        const updatedAddress = await Address.findByIdAndUpdate(
            req.params.id,
            { fullName, address: street, city, postalCode, country, phone, isDefault },
            { new: true }
        );
        
        res.json({ success: true, message: 'Address updated', address: updatedAddress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete address
app.delete('/api/addresses/:id', protect, async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        
        if (address.user.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        await address.deleteOne();
        
        res.json({ success: true, message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Set default address
app.put('/api/addresses/:id/default', protect, async (req, res) => {
    try {
        await Address.updateMany(
            { user: req.userId },
            { $set: { isDefault: false } }
        );
        
        const address = await Address.findByIdAndUpdate(
            req.params.id,
            { isDefault: true },
            { new: true }
        );
        
        res.json({ success: true, message: 'Default address set', address });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DASHBOARD STATS (Admin only)
// ============================================
app.get('/api/admin/stats', protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        const orders = await Order.find({});
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        
        const recentOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue
            },
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
    })
    .catch((error) => {
        console.error('❌ MongoDB Connection Failed:', error.message);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n=================================`);
    console.log(`🚀 E-COMMERCE SERVER RUNNING`);
    console.log(`=================================`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`\n🔐 AUTH:`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/auth/profile`);
    console.log(`\n📦 PRODUCTS:`);
    console.log(`   GET  /api/products`);
    console.log(`   GET  /api/products/featured`);
    console.log(`   GET  /api/products/:id`);
    console.log(`   POST /api/products (Admin)`);
    console.log(`   PUT  /api/products/:id (Admin)`);
    console.log(`   DELETE /api/products/:id (Admin)`);
    console.log(`   PUT  /api/products/:id/featured (Admin)`);
    console.log(`\n⭐ REVIEWS:`);
    console.log(`   POST /api/products/:id/reviews (Protected)`);
    console.log(`   GET  /api/products/:id/reviews`);
    console.log(`\n🛒 CART:`);
    console.log(`   GET  /api/cart`);
    console.log(`   POST /api/cart/add`);
    console.log(`   PUT  /api/cart/update/:id`);
    console.log(`   DELETE /api/cart/remove/:id`);
    console.log(`   DELETE /api/cart/clear`);
    console.log(`\n📋 ORDERS:`);
    console.log(`   POST /api/orders`);
    console.log(`   GET  /api/orders/myorders`);
    console.log(`   GET  /api/orders/:id`);
    console.log(`   GET  /api/orders (Admin)`);
    console.log(`   PUT  /api/orders/:id/status (Admin)`);
    console.log(`\n💖 WISHLIST:`);
    console.log(`   GET  /api/wishlist`);
    console.log(`   POST /api/wishlist/add`);
    console.log(`   DELETE /api/wishlist/remove/:id`);
    console.log(`\n📍 ADDRESSES:`);
    console.log(`   GET  /api/addresses`);
    console.log(`   POST /api/addresses`);
    console.log(`   PUT  /api/addresses/:id`);
    console.log(`   DELETE /api/addresses/:id`);
    console.log(`   PUT  /api/addresses/:id/default`);
    console.log(`\n📊 ADMIN:`);
    console.log(`   GET  /api/admin/stats`);
    console.log(`=================================\n`);
});