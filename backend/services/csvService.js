const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { Parser } = require('json2csv');

class CSVService {
    // Export products to CSV
    static exportProductsToCSV(products) {
        const fields = [
            'name', 'description', 'price', 'category', 'countInStock',
            'imageUrl', 'rating', 'isFeatured', 'hasSizes', 'sizes'
        ];
        
        const opts = { fields };
        const parser = new Parser(opts);
        
        // Format products for CSV
        const formattedProducts = products.map(product => ({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            countInStock: product.countInStock,
            imageUrl: product.imageUrl,
            rating: product.rating,
            isFeatured: product.isFeatured ? 'Yes' : 'No',
            hasSizes: product.hasSizes ? 'Yes' : 'No',
            sizes: product.hasSizes ? JSON.stringify(product.sizes) : ''
        }));
        
        return parser.parse(formattedProducts);
    }
    
    // Export orders to CSV
    static exportOrdersToCSV(orders) {
        const fields = [
            'orderId', 'customerName', 'customerEmail', 'totalPrice', 
            'status', 'paymentMethod', 'paymentStatus', 'orderDate',
            'items', 'shippingAddress'
        ];
        
        const opts = { fields };
        const parser = new Parser(opts);
        
        const formattedOrders = orders.map(order => ({
            orderId: order._id,
            customerName: order.user?.name || 'Guest',
            customerEmail: order.user?.email || 'N/A',
            totalPrice: order.totalPrice,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderDate: new Date(order.createdAt).toLocaleString(),
            items: order.items.map(i => `${i.name} x${i.quantity}`).join('; '),
            shippingAddress: `${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.country}`
        }));
        
        return parser.parse(formattedOrders);
    }
    
    // Parse CSV to products
    static parseProductsCSV(csvData) {
        return new Promise((resolve, reject) => {
            const products = [];
            
            csv.parseString(csvData, { headers: true })
                .on('data', (row) => {
                    const product = {
                        name: row.name,
                        description: row.description,
                        price: parseFloat(row.price),
                        category: row.category,
                        countInStock: parseInt(row.countInStock) || 0,
                        imageUrl: row.imageUrl || 'https://via.placeholder.com/300',
                        rating: parseFloat(row.rating) || 0,
                        isFeatured: row.isFeatured === 'Yes',
                        hasSizes: row.hasSizes === 'Yes',
                        sizes: row.sizes ? JSON.parse(row.sizes) : []
                    };
                    products.push(product);
                })
                .on('end', () => resolve(products))
                .on('error', (error) => reject(error));
        });
    }
}

module.exports = CSVService;