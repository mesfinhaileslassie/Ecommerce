const getWelcomeEmail = (name) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to E-Shop</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .feature { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛍️ Welcome to E-Shop!</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>Thank you for registering with E-Shop! We're excited to have you as part of our community.</p>
                    
                    <div class="feature">
                        <h3>✨ What you can do:</h3>
                        <ul>
                            <li>🛒 Shop thousands of products</li>
                            <li>💖 Save items to your wishlist</li>
                            <li>📦 Track your orders in real-time</li>
                            <li>⭐ Write product reviews</li>
                            <li>🎁 Get exclusive discounts</li>
                        </ul>
                    </div>
                    
                    <p>Start exploring our collection and discover amazing deals!</p>
                    <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping →</a>
                    
                    <div class="feature">
                        <h3>🎉 Get 10% OFF Your First Order</h3>
                        <p>Use coupon code: <strong>WELCOME10</strong> at checkout</p>
                    </div>
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

module.exports = getWelcomeEmail;