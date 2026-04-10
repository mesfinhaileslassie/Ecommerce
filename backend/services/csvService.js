const { Parser } = require('json2csv');

class CSVService {
    static exportProductsToCSV(products) {
        const fields = ['name', 'description', 'price', 'category', 'countInStock', 'imageUrl', 'rating', 'isFeatured', 'hasSizes', 'sizes'];
        const opts = { fields };
        const parser = new Parser(opts);
        
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
            sizes: product.hasSizes && product.sizes ? product.sizes.map(s => `${s.size}:${s.price}:${s.countInStock}`).join('|') : ''
        }));
        
        return parser.parse(formattedProducts);
    }
    
    static parseProductsCSV(csvData) {
        return new Promise((resolve, reject) => {
            const products = [];
            const lines = csvData.trim().split('\n');
            const headers = lines[0].split(',');
            
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                const product = {};
                
                for (let j = 0; j < headers.length; j++) {
                    let value = values[j] || '';
                    const header = headers[j].trim();
                    
                    if (header === 'price') value = parseFloat(value) || 0;
                    else if (header === 'countInStock') value = parseInt(value) || 0;
                    else if (header === 'rating') value = parseFloat(value) || 0;
                    else if (header === 'isFeatured') value = value === 'Yes';
                    else if (header === 'hasSizes') value = value === 'Yes';
                    else if (header === 'sizes' && value) {
                        // Parse sizes format: "size:S,price:159.99,stock:10|size:M,price:159.99,stock:15"
                        const sizes = [];
                        const sizeParts = value.split('|');
                        for (const part of sizeParts) {
                            const sizeData = {};
                            const attrs = part.split(',');
                            for (const attr of attrs) {
                                const [key, val] = attr.split(':');
                                if (key === 'size') sizeData.size = val;
                                else if (key === 'price') sizeData.price = parseFloat(val);
                                else if (key === 'stock') sizeData.countInStock = parseInt(val);
                            }
                            if (sizeData.size && sizeData.price) {
                                sizes.push(sizeData);
                            }
                        }
                        value = sizes;
                    }
                    
                    product[header] = value;
                }
                products.push(product);
            }
            resolve(products);
        });
    }
    
    // Helper function to parse CSV line with quoted fields
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }
    
    static exportOrdersToCSV(orders) {
        const fields = ['orderId', 'customerName', 'customerEmail', 'totalPrice', 'status', 'paymentMethod', 'paymentStatus', 'orderDate', 'items', 'shippingAddress'];
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
}

module.exports = CSVService;