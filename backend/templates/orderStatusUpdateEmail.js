const getOrderStatusUpdateEmail = (order, user, oldStatus, newStatus) => {
    // Convert ObjectId to string safely
    const orderId = order._id?.toString() || order._id;
    const orderIdShort = orderId.slice(-8);
    
    const statusMessages = {
        Processing: {
            title: "📦 Your order is being processed",
            message: "We're preparing your items for shipment. You'll receive another email when your order ships."
        },
        Shipped: {
            title: "🚚 Your order has been shipped!",
            message: "Great news! Your order is on its way. You can track your package using the tracking number below."
        },
        Delivered: {
            title: "✅ Your order has been delivered",
            message: "Your order has been successfully delivered. We hope you enjoy your purchase!"
        },
        Cancelled: {
            title: "❌ Your order has been cancelled",
            message: "Your order has been cancelled as requested. If you have any questions, please contact support."
        }
    };

    const statusInfo = statusMessages[newStatus] || {
        title: `Order Status Updated to ${newStatus}`,
        message: `Your order status has been updated to ${newStatus}.`
    };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Status Update - E-Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .status-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
                .status-old { background: #e5e7eb; color: #666; }
                .status-new { background: #10b981; color: white; margin-left: 10px; }
                .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${statusInfo.title}</h1>
                </div>
                <div class="content">
                    <h2>Hello ${user.name},</h2>
                    <p>${statusInfo.message}</p>
                    
                    <div class="status-box">
                        <strong>Status Update:</strong><br>
                        <span class="status-badge status-old">${oldStatus}</span>
                        <span style="font-size: 20px;"> → </span>
                        <span class="status-badge status-new">${newStatus}</span>
                    </div>
                    
                    <p><strong>Order ID:</strong> #${orderIdShort}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    
                    <a href="${process.env.FRONTEND_URL}/orders" class="button">View Order Details →</a>
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

module.exports = getOrderStatusUpdateEmail;