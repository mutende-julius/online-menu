console.log('🧪 Testing M-Pesa Connection (Basic Test)');
console.log('=========================================');

// Your M-Pesa credentials
const consumerKey = 'QA1O392jsqxI1U4EJ8Qt2OlUIdmDwvZsG5i3zW4S5X77JgaA';
const consumerSecret = 'vIYpZA11TVLp3AljsHMsHKIY0q2mGkGolQT1CKAF60qAAeflpMOVUCC87MWrOGgl';

console.log('🔐 Your Credentials:');
console.log('Consumer Key:', consumerKey);
console.log('Consumer Secret length:', consumerSecret.length);

console.log('\n📋 Test Parameters:');
console.log('Shortcode: 174379');
console.log('Passkey: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919');
console.log('Test Phone: 254708374149');
console.log('Test PIN: 123456');

console.log('\n🎯 What Should Happen:');
console.log('1. M-Pesa prompt sent to test phone');
console.log('2. Customer enters PIN: 123456');
console.log('3. Payment processes successfully');
console.log('4. Order confirmed automatically');

console.log('\n🚀 Next Steps:');
console.log('1. Install dependencies: npm install axios moment');
console.log('2. Run: node test-mpesa-simple.js');
console.log('3. Check test phone for M-Pesa prompt');

console.log('\n💡 If installation fails:');
console.log('1. Check internet connection');
console.log('2. Try: npm cache clean --force');
console.log('3. Then: npm install axios moment');