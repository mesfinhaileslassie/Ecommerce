const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Not authorized' 
        });
    }
};

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin (for now, anyone with token)
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, price, category, countInStock, imageUrl } = req.body;
        
        const product = await Product.create({
            name,
            description,
            price,
            category,
            countInStock,
            imageUrl
        });
        
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        
        await product.deleteOne();
        
        res.json({
            success: true,
            message: 'Product removed'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

module.exports = router;


// ============================================
// CART ROUTES
// ============================================

// Get user's cart
app.get('/api/cart', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.userId }).populate('items.product');
        
        if (!cart) {
            // Create empty cart if doesn't exist
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
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add item to cart
app.post('/api/cart/add', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID required' });
        }
        
        // Get product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        // Check stock
        if (product.countInStock < (quantity || 1)) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }
        
        // Find or create cart
        let cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] });
        }
        
        // Check if product already in cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );
        
        if (existingItem) {
            // Update quantity
            existingItem.quantity += quantity || 1;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity || 1
            });
        }
        
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
        
        const item = cart.items.find(
            item => item.product.toString() === productId
        );
        
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not in cart' });
        }
        
        // Check stock
        const product = await Product.findById(productId);
        if (product && product.countInStock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }
        
        item.quantity = quantity;
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
        console.error('Update cart error:', error);
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
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Clear entire cart
app.delete('/api/cart/clear', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        
        res.json({
            success: true,
            message: 'Cart cleared',
            cart: { items: [], totalPrice: 0, itemCount: 0 }
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});





