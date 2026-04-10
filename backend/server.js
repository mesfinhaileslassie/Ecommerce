const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); 
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendEmail } = require('./config/email');
const getWelcomeEmail = require('./templates/welcomeEmail');
const getOrderConfirmationEmail = require('./templates/orderConfirmationEmail');
const getOrderStatusUpdateEmail = require('./templates/orderStatusUpdateEmail');

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

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// USER MODEL
// ============================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    googleId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    recentlyViewed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
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
// SIZE VARIANT SCHEMA
// ============================================
const sizeVariantSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 
               '28', '30', '32', '34', '36', '38', '40', '42', '44', '46',
               '6', '7', '8', '9', '10', '11', '12', '13', '14',
               'One Size', 'Free Size', 'Small', 'Medium', 'Large', 'Extra Large',
               'X', 'XL', 'XXL', 'XXXL', 'S/M', 'M/L', 'L/XL', 'OS', 'ONESIZE']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    }
});

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
    hasSizes: { type: Boolean, default: false },
    sizes: [sizeVariantSchema],
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// ============================================
// CART ITEM SCHEMA
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
    },
    size: { type: String, default: null }
});

// ============================================
// CART MODEL
// ============================================
const expirationDays = parseInt(process.env.CART_EXPIRATION_DAYS) || 3;

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
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
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
        enum: ['Credit Card', 'PayPal', 'Cash on Delivery', 'CBE Birr', 'Telebirr', 'Mobile Banking'],
        default: 'Cash on Delivery'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        default: null
    },
    paymentDetails: {
        accountNumber: { type: String, default: null },
        phoneNumber: { type: String, default: null },
        referenceNumber: { type: String, default: null },
        outTradeNo: { type: String, default: null },
        paidAt: { type: Date, default: null }
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
    isArchived: {
        type: Boolean,
        default: false
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
// COUPON MODEL
// ============================================
const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minimumOrder: { type: Number, default: 0 },
    minimumItems: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Coupon = mongoose.model('Coupon', couponSchema);

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
            return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login instead.' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }
        
        const hashedPassword = await hashPassword(password);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        
        // Send welcome email
        try {
            const welcomeHtml = getWelcomeEmail(name);
            await sendEmail(email, 'Welcome to E-Shop! 🎉', welcomeHtml);
            console.log(`Welcome email sent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }
        
        const token = generateToken(user._id);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                isAdmin: user.isAdmin,
                avatar: user.avatar,
                createdAt: user.createdAt 
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
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
            user: { 
                _id: user._id, 
                name: user.name, 
                email: user.email, 
                isAdmin: user.isAdmin,
                avatar: user.avatar,
                createdAt: user.createdAt 
            }
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

// Update user profile
app.put('/api/auth/profile', protect, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        console.log('Profile update request for user:', user.email);
        console.log('Is Google user:', !!user.googleId);
        
        if (name) user.name = name;
        if (email) user.email = email;
        
        if (newPassword) {
            if (user.googleId && !currentPassword) {
                if (newPassword.length < 6) {
                    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
                }
                user.password = await hashPassword(newPassword);
                console.log('Google user set password for first time');
            } 
            else if (!user.googleId) {
                if (!currentPassword) {
                    return res.status(401).json({ success: false, message: 'Current password is required to change password' });
                }
                
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
                }
                
                if (newPassword.length < 6) {
                    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
                }
                
                user.password = await hashPassword(newPassword);
                console.log('Regular user updated password');
            }
            else {
                return res.status(400).json({ success: false, message: 'Current password required to change password' });
            }
        }
        
        await user.save();
        
        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar,
            googleId: user.googleId,
            createdAt: user.createdAt
        };
        
        console.log('Profile updated successfully for:', user.email);
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload avatar
app.post('/api/auth/avatar', protect, async (req, res) => {
    try {
        const { avatar } = req.body;
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.avatar = avatar;
        await user.save();
        
        res.json({
            success: true,
            message: 'Avatar updated successfully',
            avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GOOGLE AUTH ROUTE
// ============================================
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: 'No token provided' });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email not provided by Google' });
        }

        console.log(`🔐 Google login attempt for: ${email}`);

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await hashPassword(randomPassword);

            user = new User({
                name: name || email.split('@')[0],
                email: email,
                password: hashedPassword,
                avatar: picture || '',
                googleId: googleId,
                isAdmin: false,
            });
            await user.save();
            console.log(`✅ New user created via Google: ${email}`);
        } else {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
            if (picture && !user.avatar) {
                user.avatar = picture;
                await user.save();
            }
            console.log(`✅ Existing user logged in via Google: ${email}`);
        }

        const appToken = generateToken(user._id);

        res.json({
            success: true,
            message: 'Google login successful',
            token: appToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                avatar: user.avatar,
                googleId: user.googleId,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.error('❌ Google token verification failed:', error);
        res.status(401).json({ success: false, message: 'Google authentication failed' });
    }
});

// ============================================
// PRODUCT ROUTES
// ============================================

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
        
        let query = {};
        
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }
        
        if (category && category !== 'All') {
            query.category = category;
        }
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }
        
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
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
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

// Get categories
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
        const { name, description, price, category, countInStock, imageUrl, isFeatured, hasSizes, sizes } = req.body;
        
        if (!name || !description || !category) {
            return res.status(400).json({ success: false, message: 'Missing required fields: name, description, category' });
        }
        
        if (!hasSizes && (!price || price === 0)) {
            return res.status(400).json({ success: false, message: 'Price is required for products without sizes' });
        }
        
        if (hasSizes && (!sizes || sizes.length === 0)) {
            return res.status(400).json({ success: false, message: 'At least one size variant is required' });
        }
        
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        const productData = {
            name,
            slug,
            description,
            category,
            imageUrl: imageUrl || 'https://via.placeholder.com/300',
            isFeatured: isFeatured || false,
            hasSizes: hasSizes || false,
            sizes: sizes || []
        };
        
        if (hasSizes) {
            productData.price = 0;
            productData.countInStock = 0;
        } else {
            productData.price = price;
            productData.countInStock = countInStock || 0;
        }
        
        const product = new Product(productData);
        await product.save();
        
        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('Create product error:', error);
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
        
        const { name, hasSizes, sizes, price, countInStock } = req.body;
        
        if (hasSizes && (!sizes || sizes.length === 0)) {
            return res.status(400).json({ success: false, message: 'At least one size variant is required' });
        }
        
        if (!hasSizes && (!price || price === 0)) {
            return res.status(400).json({ success: false, message: 'Price is required for products without sizes' });
        }
        
        if (name) {
            req.body.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        
        if (hasSizes) {
            req.body.price = 0;
            req.body.countInStock = 0;
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error('Update product error:', error);
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
// PRODUCT RECOMMENDATIONS
// ============================================

// Get similar products
app.get('/api/products/similar/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        const similarProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);
        
        res.json({
            success: true,
            products: similarProducts,
            count: similarProducts.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get top rated products
app.get('/api/products/top-rated', async (req, res) => {
    try {
        const topRated = await Product.find({ rating: { $gt: 0 } })
            .sort({ rating: -1, numReviews: -1 })
            .limit(8);
        
        res.json({
            success: true,
            products: topRated,
            count: topRated.length
        });
    } catch (error) {
        console.error('Top rated error:', error);
        res.json({ success: true, products: [], count: 0 });
    }
});

// Get best selling products
app.get('/api/products/best-sellers', async (req, res) => {
    try {
        const bestSellers = await Product.find({ isFeatured: true }).limit(8);
        res.json({ success: true, products: bestSellers, count: bestSellers.length });
    } catch (error) {
        console.error('Best sellers error:', error);
        res.json({ success: true, products: [], count: 0 });
    }
});

// Track recently viewed products
app.post('/api/products/recently-viewed', protect, async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.userId);
        
        let recentlyViewed = user.recentlyViewed || [];
        recentlyViewed = recentlyViewed.filter(id => id.toString() !== productId);
        recentlyViewed.unshift(productId);
        recentlyViewed = recentlyViewed.slice(0, 10);
        
        user.recentlyViewed = recentlyViewed;
        await user.save();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get recently viewed products
app.get('/api/products/recently-viewed', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const recentlyViewedIds = user.recentlyViewed || [];
        
        if (recentlyViewedIds.length === 0) {
            return res.json({ success: true, products: [], count: 0 });
        }
        
        const products = await Product.find({ _id: { $in: recentlyViewedIds } });
        const orderedProducts = recentlyViewedIds.map(id => 
            products.find(p => p._id.toString() === id.toString())
        ).filter(p => p);
        
        res.json({ success: true, products: orderedProducts, count: orderedProducts.length });
    } catch (error) {
        console.error('Recently viewed error:', error);
        res.json({ success: true, products: [], count: 0 });
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
            cart = new Cart({ 
                user: req.userId, 
                items: [],
                expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            });
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
        const { productId, quantity = 1, size = null } = req.body;
        
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID required' });
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        let finalPrice = product.price;
        let currentStock = product.countInStock;
        
        if (size && product.hasSizes) {
            const sizeVariant = product.sizes.find(s => s.size === size);
            if (!sizeVariant) {
                return res.status(400).json({ success: false, message: 'Invalid size selected' });
            }
            finalPrice = sizeVariant.price;
            currentStock = sizeVariant.countInStock;
        }
        
        if (currentStock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }
        
        let cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] });
        }
        
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId && item.size === size
        );
        
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                name: product.name,
                price: finalPrice,
                imageUrl: product.imageUrl,
                quantity: quantity,
                size: size
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

// Cart cleanup route
app.delete('/api/cart/cleanup', async (req, res) => {
    try {
        const result = await Cart.deleteMany({ expiresAt: { $lt: new Date() } });
        console.log(`🧹 Cleaned up ${result.deletedCount} expired carts`);
        res.json({ success: true, message: `Cleaned up ${result.deletedCount} expired carts`, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get cart expiration info
app.get('/api/cart/expiration', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId });
        
        if (!cart) {
            return res.json({ success: true, hasCart: false, expiresAt: null });
        }
        
        const now = new Date();
        const expiresAt = new Date(cart.expiresAt);
        const hoursRemaining = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60)));
        const daysRemaining = Math.floor(hoursRemaining / 24);
        
        res.json({
            success: true,
            hasCart: true,
            expiresAt: cart.expiresAt,
            daysRemaining: daysRemaining,
            hoursRemaining: hoursRemaining,
            isExpired: now > expiresAt
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
        
        // Send order confirmation email
        try {
            const user = await User.findById(req.userId);
            if (user && user.email) {
                // Convert ObjectId to string safely
                const orderIdString = order._id.toString();
                const orderIdShort = orderIdString.slice(-8);
                const orderHtml = getOrderConfirmationEmail(order, user);
                await sendEmail(user.email, `Order Confirmation #${orderIdShort} 🛍️`, orderHtml);
                console.log(`Order confirmation email sent to ${user.email}`);
            }
        } catch (emailError) {
            console.error('Failed to send order confirmation:', emailError.message);
        }
        
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Order creation error:', error);
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
        
        const oldStatus = order.status;
        order.status = status;
        
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        
        await order.save();
        
        // Send status update email
        try {
            const user = await User.findById(order.user);
            if (user && user.email) {
                const statusHtml = getOrderStatusUpdateEmail(order, user, oldStatus, status);
                await sendEmail(user.email, `Order Status Update - ${status} 📦`, statusHtml);
                console.log(`Status update email sent to ${user.email}`);
            }
        } catch (emailError) {
            console.error('Failed to send status update:', emailError.message);
        }
        
        res.json({ success: true, message: 'Order status updated', order });
    } catch (error) {
        console.error('Update order status error:', error);
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



// Get all orders with pagination (Admin only)
app.get('/api/orders/admin', protect, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const search = req.query.search;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const quickFilter = req.query.quickFilter;
        
        let query = {};
        
        if (status && status !== 'All') {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { _id: { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'user.email': { $regex: search, $options: 'i' } }
            ];
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        if (quickFilter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.createdAt = { $gte: today };
        } else if (quickFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            query.createdAt = { $gte: weekAgo };
        } else if (quickFilter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            query.createdAt = { $gte: monthAgo };
        } else if (quickFilter === 'pending') {
            query.status = 'Pending';
        }
        
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Order.countDocuments(query);
        
        res.json({
            success: true,
            orders,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});



// ============================================
// ORDER ARCHIVE ROUTES
// ============================================

// Archive/unarchive an order
app.put('/api/orders/:id/archive', protect, async (req, res) => {
    try {
        const { archive } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (order.user.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        order.isArchived = archive;
        await order.save();
        
        res.json({
            success: true,
            message: archive ? 'Order archived' : 'Order restored',
            isArchived: order.isArchived
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user's orders with archive filter
app.get('/api/orders/myorders', protect, async (req, res) => {
    try {
        const { showArchived = 'false' } = req.query;
        let query = { user: req.userId };
        
        if (showArchived === 'false') {
            query.isArchived = false;
        }
        
        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Archive all completed orders
app.post('/api/orders/archive-all', protect, async (req, res) => {
    try {
        const result = await Order.updateMany(
            { 
                user: req.userId,
                status: { $in: ['Delivered', 'Cancelled'] },
                isArchived: false
            },
            { $set: { isArchived: true } }
        );
        
        res.json({
            success: true,
            message: `${result.modifiedCount} orders archived`,
            archivedCount: result.modifiedCount
        });
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
        
        const exists = wishlist.items.find(item => item.product.toString() === productId);
        
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
        
        wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
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
            await Address.updateMany({ user: req.userId }, { $set: { isDefault: false } });
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
        await Address.updateMany({ user: req.userId }, { $set: { isDefault: false } });
        const address = await Address.findByIdAndUpdate(req.params.id, { isDefault: true }, { new: true });
        res.json({ success: true, message: 'Default address set', address });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
        const { 
            code, description, discountType, discountValue, 
            minimumOrder, minimumItems, maxDiscount, 
            startDate, endDate, usageLimit 
        } = req.body;
        
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }
        
        const coupon = new Coupon({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue: Number(discountValue),
            minimumOrder: Number(minimumOrder) || 0,
            minimumItems: Number(minimumItems) || 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            startDate,
            endDate,
            usageLimit: usageLimit ? Number(usageLimit) : null
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
        const { code, cartTotal, cartItemsCount } = req.body;
        
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
        
        if (coupon.minimumItems && coupon.minimumItems > 0) {
            if (cartItemsCount < coupon.minimumItems) {
                return res.status(400).json({ 
                    success: false, 
                    message: `This coupon requires ${coupon.minimumItems} or more items in your cart. You have ${cartItemsCount} item(s).` 
                });
            }
        }
        
        if (coupon.minimumOrder && coupon.minimumOrder > 0) {
            if (cartTotal < coupon.minimumOrder) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Minimum order amount of $${coupon.minimumOrder} required.` 
                });
            }
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
        
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }
        
        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount: discountAmount.toFixed(2),
                finalTotal: (cartTotal - discountAmount).toFixed(2),
                minimumItems: coupon.minimumItems,
                minimumOrder: coupon.minimumOrder
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

// ============================================
// TELEBIRR PAYMENT ROUTES
// ============================================

const telebirrService = require('./services/telebirrService');

// Initiate Telebirr payment
app.post('/api/telebirr/initiate', protect, async (req, res) => {
    try {
        const { orderId, amount, subject } = req.body;

        if (!telebirrService.isAvailable()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Telebirr service not configured. Please check credentials.' 
            });
        }

        const result = await telebirrService.initiatePayment(
            orderId,
            amount,
            subject,
            `${process.env.TELEBIRR_RETURN_URL}`,
            `${process.env.TELEBIRR_NOTIFY_URL}`
        );

        await Order.findByIdAndUpdate(orderId, {
            'paymentDetails.outTradeNo': result.outTradeNo
        });

        res.json({
            success: true,
            toPayUrl: result.toPayUrl,
            outTradeNo: result.outTradeNo,
            message: 'Payment initiated successfully'
        });
    } catch (error) {
        console.error('Telebirr initiation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Telebirr payment notification webhook
app.post('/api/telebirr/notify', async (req, res) => {
    try {
        const notification = req.body;
        console.log('Telebirr notification received:', notification);
        
        if (notification.resultCode === '0' || notification.code === '0') {
            const { outTradeNo, tradeNo } = notification;
            
            await Order.findOneAndUpdate(
                { 'paymentDetails.outTradeNo': outTradeNo },
                { 
                    paymentStatus: 'paid',
                    isPaid: true,
                    paidAt: new Date(),
                    transactionId: tradeNo,
                    'paymentDetails.referenceNumber': tradeNo
                }
            );
            
            console.log(`✅ Payment confirmed for order: ${outTradeNo}`);
        }

        res.json({ code: 0, message: 'success' });
    } catch (error) {
        console.error('Telebirr notification error:', error);
        res.status(500).json({ code: 1, message: error.message });
    }
});

// Telebirr return URL (after payment)
app.get('/api/telebirr/return', async (req, res) => {
    const { outTradeNo, tradeNo, resultCode } = req.query;
    
    console.log('Telebirr return:', { outTradeNo, tradeNo, resultCode });
    
    if (resultCode === '0') {
        await Order.findOneAndUpdate(
            { 'paymentDetails.outTradeNo': outTradeNo },
            { 
                paymentStatus: 'paid',
                isPaid: true,
                paidAt: new Date(),
                transactionId: tradeNo
            }
        );
    }
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders?payment=${resultCode === '0' ? 'success' : 'failed'}`);
});

// ============================================
// IMAGE UPLOAD ROUTES
// ============================================

// Upload single image
app.post('/api/upload', protect, admin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload multiple images
app.post('/api/upload-multiple', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        
        const imageUrls = req.files.map(file => {
            return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        });
        
        res.json({
            success: true,
            message: 'Images uploaded successfully',
            imageUrls: imageUrls
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// SITEMAP GENERATION
// ============================================

const sitemapService = require('./services/sitemapService');

app.get('/api/generate-sitemap', async (req, res) => {
    try {
        const products = await Product.find({});
        const categories = await Product.distinct('category');
        const sitemap = sitemapService.generateSitemap(products, categories);
        
        res.json({
            success: true,
            message: 'Sitemap generated successfully',
            sitemapUrl: '/sitemap.xml'
        });
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
// CRON JOB FOR CART CLEANUP
// ============================================
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
    console.log('Running cart cleanup...');
    const result = await Cart.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Cleaned up ${result.deletedCount} expired carts`);
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
    console.log(`\n📧 EMAIL NOTIFICATIONS:`);
    console.log(`   ✅ Welcome emails on registration`);
    console.log(`   ✅ Order confirmation emails`);
    console.log(`   ✅ Order status update emails`);
    console.log(`=================================\n`);
});