const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Cart = require('../models/Cart'); // Adjust path as needed

async function cleanupExpiredCarts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const result = await Cart.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        
        console.log(`[${new Date().toISOString()}] Cleaned up ${result.deletedCount} expired carts`);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

cleanupExpiredCarts();