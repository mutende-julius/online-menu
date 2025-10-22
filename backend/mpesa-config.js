const { getClientConfig } = require('./config/clients');

module.exports = {
    getMpesaConfig: () => {
        const client = getClientConfig();
        return {
            shortcode: client.shortcode,
            passkey: client.passkey,
            callbackURL: client.callbackURL,
            // Your existing sandbox credentials for development
            consumerKey: process.env.MPESA_CONSUMER_KEY,
            consumerSecret: process.env.MPESA_CONSUMER_SECRET
        };
    }
};