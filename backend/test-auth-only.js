const https = require('https');

console.log('🧪 Testing M-Pesa Authentication Only');
console.log('=====================================');

const consumerKey = 'QA1O392jsqxI1U4EJ8Qt2OlUIdmDwvZsG5i3zW4S5X77JgaA';
const consumerSecret = 'vIYpZA11TVLp3AljsHMsHKIY0q2mGkGolQT1CKAF60qAAeflpMOVUCC87MWrOGgl';

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

console.log('🔐 Testing authentication...');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.access_token) {
        console.log('✅ AUTHENTICATION SUCCESS!');
        console.log('Access Token:', result.access_token);
        console.log('Expires In:', result.expires_in, 'seconds');
        console.log('\n🎉 Your credentials are correct!');
        console.log('💡 The issue is IP whitelisting.');
      } else {
        console.log('❌ Authentication failed:', result);
      }
    } catch (e) {
      console.log('❌ Parse error:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request error:', error.message);
});

req.end();