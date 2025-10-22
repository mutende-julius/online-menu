const https = require('https');

console.log('🧪 Testing Your "Julius" M-Pesa App');
console.log('===================================');

// Your Julius app credentials (use the ones from your Julius app)
const consumerKey = 'QA1O392jsqxI1U4EJ8Qt2OlUIdmDwvZsG5i3zW4S5X77JgaA';
const consumerSecret = 'vIYpZA11TVLp3AljsHMsHKIY0q2mGkGolQT1CKAF60qAAeflpMOVUCC87MWrOGgl';

console.log('App Name: Julius');
console.log('Consumer Key:', consumerKey);
console.log('Testing authentication...');

const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

const options = {
  hostname: 'sandbox.safaricom.co.ke',
  port: 443,
  path: '/oauth/v1/generate?grant_type=client_credentials',
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`
  },
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode, res.statusMessage);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.access_token) {
        console.log('✅ SUCCESS! Your "Julius" app credentials work!');
        console.log('Access Token:', result.access_token);
        console.log('\n🎉 Your app is properly configured!');
        console.log('💡 Now we just need to:');
        console.log('   1. Whitelist your IP in Authorization section');
        console.log('   2. Get Lipa Na M-Pesa credentials');
      } else {
        console.log('❌ Authentication failed:', result);
      }
    } catch (e) {
      console.log('❌ Parse error:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request error:', error.message);
});

req.end();