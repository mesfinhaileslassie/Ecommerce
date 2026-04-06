const crypto = require('crypto');
const axios = require('axios');
const https = require('https');

class TelebirrService {
    constructor() {
        this.baseUrl = process.env.TELEBIRR_BASE_URL;
        this.fabricAppId = process.env.TELEBIRR_FABRIC_APP_ID;
        this.appSecret = process.env.TELEBIRR_APP_SECRET;
        this.merchantAppId = process.env.TELEBIRR_APP_ID;
        this.merchantCode = process.env.TELEBIRR_SHORT_CODE;
        this.notifyUrl = process.env.TELEBIRR_NOTIFY_URL;
        this.redirectUrl = process.env.TELEBIRR_RETURN_URL;
        this.webBaseUrl = process.env.FRONTEND_URL;
        this.mockMode = process.env.TELEBIRR_MOCK_MODE === 'true';
        this.initialized = false;
        
        if (this.baseUrl && this.fabricAppId && this.appSecret && this.merchantAppId && this.merchantCode) {
            this.initialized = true;
            console.log('✅ Telebirr service initialized');
            console.log(`   Base URL: ${this.baseUrl}`);
        } else {
            console.log('⚠️ Telebirr credentials missing');
            console.log('   Base URL:', this.baseUrl);
            console.log('   Fabric App ID:', this.fabricAppId);
            console.log('   Merchant App ID:', this.merchantAppId);
            console.log('   Merchant Code:', this.merchantCode);
        }
    }

    generateNonceStr() {
        return crypto.randomBytes(16).toString('hex');
    }

    generateTimeStamp() {
        return Date.now().toString();
    }

    generateMerchantOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `ORD${timestamp}${random}`;
    }

    // Step 1: Get Fabric Token
    async getFabricToken() {
        const url = `${this.baseUrl}/payment/v1/token`;
        const headers = {
            'Content-Type': 'application/json',
            'X-APP-Key': this.fabricAppId
        };
        const payload = {
            appSecret: this.appSecret
        };

        console.log('Getting Fabric Token from:', url);

        try {
            const agent = new https.Agent({ rejectUnauthorized: false });
            const response = await axios.post(url, payload, {
                headers: headers,
                httpsAgent: agent,
                timeout: 30000
            });

            console.log('Fabric Token response:', response.data);
            
            if (response.data && response.data.token) {
                return response.data.token;
            } else {
                throw new Error(response.data?.msg || 'Failed to get fabric token');
            }
        } catch (error) {
            console.error('Fabric token error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Telebirr');
        }
    }

    // Step 2: Create Order Request Object
    createRequestObject(title, amount, merchantOrderId) {
        const req = {
            nonce_str: this.generateNonceStr(),
            method: 'payment.preorder',
            timestamp: this.generateTimeStamp(),
            version: '1.0',
            biz_content: {
                notify_url: this.notifyUrl,
                appid: this.merchantAppId,
                merch_code: this.merchantCode,
                merch_order_id: merchantOrderId,
                trade_type: 'Checkout',
                title: title,
                total_amount: amount,
                trans_currency: 'ETB',
                timeout_express: '120m',
                business_type: 'BuyGoods',
                payee_identifier: this.merchantCode,
                payee_identifier_type: '04',
                payee_type: '5000',
                redirect_url: this.redirectUrl,
                callback_info: 'Payment from E-Shop'
            },
            sign_type: 'SHA256withRSA'
        };

        // Generate signature (simplified - in production use proper RSA signing)
        const sign = this.generateSign(req);
        req.sign = sign;

        return req;
    }

    // Generate signature (simplified - replace with proper RSA signing)
    generateSign(obj) {
        // Sort keys and create string to sign
        const sortedKeys = Object.keys(obj).sort();
        let stringToSign = '';
        
        for (const key of sortedKeys) {
            if (key !== 'sign' && obj[key] !== null && obj[key] !== undefined) {
                if (typeof obj[key] === 'object') {
                    stringToSign += `${key}=${JSON.stringify(obj[key])}&`;
                } else {
                    stringToSign += `${key}=${obj[key]}&`;
                }
            }
        }
        
        // Remove trailing &
        stringToSign = stringToSign.slice(0, -1);
        
        // Create HMAC-SHA256 signature (temporary - use RSA in production)
        const signature = crypto
            .createHmac('sha256', this.appSecret)
            .update(stringToSign)
            .digest('hex');
        
        return signature;
    }

    // Step 3: Request Create Order from Telebirr
    async requestCreateOrder(fabricToken, title, amount, merchantOrderId) {
        const url = `${this.baseUrl}/payment/v1/merchant/preOrder`;
        const headers = {
            'Content-Type': 'application/json',
            'X-APP-Key': this.fabricAppId,
            'Authorization': fabricToken
        };

        const requestObject = this.createRequestObject(title, amount, merchantOrderId);
        const payload = JSON.stringify(requestObject);

        console.log('Creating Telebirr order at:', url);
        console.log('Request payload:', payload);

        try {
            const agent = new https.Agent({ rejectUnauthorized: false });
            const response = await axios.post(url, payload, {
                headers: headers,
                httpsAgent: agent,
                timeout: 30000
            });

            console.log('Create order response:', response.data);
            
            if (response.data && response.data.biz_content && response.data.biz_content.prepay_id) {
                return response.data;
            } else {
                throw new Error(response.data?.msg || 'Failed to create order');
            }
        } catch (error) {
            console.error('Create order error:', error.response?.data || error.message);
            throw new Error('Failed to create Telebirr order');
        }
    }

    // Step 4: Build Raw Request URL for Payment
    buildRawRequest(prepayId, merchantOrderId) {
        const maps = {
            appid: this.merchantAppId,
            merch_code: this.merchantCode,
            nonce_str: this.generateNonceStr(),
            prepay_id: prepayId,
            timestamp: this.generateTimeStamp(),
            sign_type: 'SHA256WithRSA'
        };

        let rawRequest = '';
        for (const key in maps) {
            rawRequest += `${key}=${maps[key]}&`;
        }

        const sign = this.generateSign(maps);
        rawRequest += `sign=${sign}`;
        
        // Add version and trade_type
        rawRequest += `&version=1.0&trade_type=Checkout`;
        
        return `${this.webBaseUrl}/payment.html?${rawRequest}`;
    }

    // Main method to initiate payment
    async initiatePayment(orderId, amount, subject) {
        if (this.mockMode) {
            console.log('⚠️ Using mock Telebirr response for testing');
            return {
                success: true,
                toPayUrl: `${process.env.FRONTEND_URL}/orders?payment=test&orderId=${orderId}`,
                outTradeNo: `MOCK_${orderId}`,
                isMock: true
            };
        }

        if (!this.initialized) {
            throw new Error('Telebirr service not configured');
        }

        const merchantOrderId = this.generateMerchantOrderId();

        try {
            // Step 1: Get Fabric Token
            const fabricToken = await this.getFabricToken();
            
            // Step 2: Create Order
            const orderResult = await this.requestCreateOrder(fabricToken, subject, amount, merchantOrderId);
            const prepayId = orderResult.biz_content.prepay_id;
            
            // Step 3: Build Payment URL
            const paymentUrl = this.buildRawRequest(prepayId, merchantOrderId);
            
            // Step 4: Store merchantOrderId with the order
            // This will be updated in the database via the route
            
            return {
                success: true,
                toPayUrl: paymentUrl,
                outTradeNo: merchantOrderId,
                prepayId: prepayId
            };
        } catch (error) {
            console.error('Telebirr payment initiation error:', error);
            throw error;
        }
    }

    isAvailable() {
        return this.initialized || this.mockMode;
    }
}

module.exports = new TelebirrService();