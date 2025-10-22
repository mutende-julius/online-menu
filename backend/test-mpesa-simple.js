const axios = require('axios');
const moment = require('moment');

// Your M-Pesa credentials
const consumerKey = 'QA1O392jsqxI1U4EJ8Qt2OlUIdmDwvZsG5i3zW4S5X77JgaA';
const consumerSecret = 'vIYpZA11TVLp3AljsHMsHKIY0q2mGkGolQT1CKAF60qAAeflpMOVUCC87MWrOGgl';
const shortCode = '174379';
const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

async function testMpesaSimple() {
    try {
        console.log('🧪 Testing M-Pesa STK Push (Simple Test)...');
        console.log('==========================================');
        
        // Step 1: Get Access Token
        console.log('1. Getting access token...');
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        
        const tokenResponse = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: { 'Authorization': `Basic ${auth}` },
                timeout: 15000
            }
        );
        
        const accessToken = tokenResponse.data.access_token;
        console.log('✅ Access token obtained!');
        
        // Step 2: Prepare STK Push
        console.log('2. Preparing STK Push request...');
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        
        const testPhone = '254708374149'; // Sandbox test number
        const testAmount = 1; // 1 KSH
        const orderId = 'TEST' + Date.now();
        
        const requestData = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: testAmount,
            PartyA: testPhone,
            PartyB: shortCode,
            PhoneNumber: testPhone,
            CallBackURL: 'https://example.com/callback', // Dummy URL for now
            AccountReference: orderId,
            TransactionDesc: 'Food Order Test'
        };
        
        console.log('📱 Sending STK Push to:', testPhone);
        console.log('💰 Amount: Ksh', testAmount);
        console.log('📋 Order ID:', orderId);
        
        // Step 3: Send STK Push
        const stkResponse = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            requestData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );
        
        console.log('\n🎉 SUCCESS! M-Pesa STK Push Initiated!');
        console.log('=====================================');
        console.log('Response Code:', stkResponse.data.ResponseCode);
        console.log('Checkout Request ID:', stkResponse.data.CheckoutRequestID);
        console.log('Customer Message:', stkResponse.data.CustomerMessage);
        console.log('Merchant Request ID:', stkResponse.data.MerchantRequestID);
        console.log('Response Description:', stkResponse.data.ResponseDescription);
        
        console.log('\n📱 NEXT STEPS:');
        console.log('1. Check the test phone (254708374149) for M-Pesa prompt');
        console.log('2. Enter PIN: 123456 (common test PIN)');
        console.log('3. Payment should process successfully');
        console.log('4. You\'ll see "Success" message on phone');
        
    } catch (error) {
        console.log('\n❌ TEST FAILED:');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('No response received. Check your internet connection.');
            console.log('Error:', error.message);
        } else {
            console.log('Error:', error.message);
        }
        
        console.log('\n💡 TROUBLESHOOTING:');
        console.log('1. Check internet connection');
        console.log('2. Verify credentials are correct');
        console.log('3. Ensure your IP is whitelisted in Daraja portal');
        console.log('4. Try again in a few minutes');
    }
}

// Run the test
testMpesaSimple();
