const getOrderConfirmationEmail = (order, user) => {
    // Convert ObjectId to string safely
    const orderId = order._id?.toString() || order._id;
    const orderIdShort = orderId.slice(-8);
    
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <img src="${item.imageUrl || 'https://via.placeholder.com/50'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation - E-Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .order-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #f3f4f6; padding: 10px; text-align: left; }
                .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 10px; border-top: 2px solid #eee; }
                .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Order Confirmed!</h1>
                    <p>Order #${orderIdShort}</p>
                </div>
                <div class="content">
                    <h2>Hello ${user.name},</h2>
                    <p>Thank you for your order! Your order has been successfully placed and will be processed soon.</p>
                    
                    <div class="order-details">
                        <p><strong>📅 Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>💳 Payment Method:</strong> ${order.paymentMethod}</p>
                        <p><strong>📍 Shipping Address:</strong><br>
                        ${order.shippingAddress.fullName}<br>
                        ${order.shippingAddress.address}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                        ${order.shippingAddress.country}<br>
                        Phone: ${order.shippingAddress.phone}
                        </p>
                        <p><strong>📦 Order Status:</strong> ${order.status}</p>
                    </div>
                    
                    <h3>Order Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        <p>Subtotal: $${order.totalPrice.toFixed(2)}</p>
                        <p>Shipping: Free</p>
                        <p><strong>Total: $${order.totalPrice.toFixed(2)}</strong></p>
                    </div>
                    
                    <p>You can track your order status in your account dashboard.</p>
                    <a href="${process.env.FRONTEND_URL}/orders" class="button">Track Your Order →</a>
                </div>
                <div class="footer">
                    <p>E-Shop | Your One-Stop Online Store</p>
                    <p>Need help? Contact us at support@eshop.com</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = getOrderConfirmationEmail;