// Client configurations database
const fs = require('fs');
const path = require('path');

const CLIENTS_FILE = path.join(__dirname, '../data/clients.json');

// Default client configuration
const defaultClient = {
    id: 'default',
    businessName: 'Demo Restaurant',
    shortcode: '123456',
    passkey: 'demo-passkey',
    callbackURL: 'http://localhost:3000/api/callback',
    theme: {
        primaryColor: '#2c5530',
        secondaryColor: '#e67e22',
        logo: '/images/logo.png'
    },
    status: 'active'
};

// Get client configuration
const getClientConfig = (clientId = 'default') => {
    try {
        if (fs.existsSync(CLIENTS_FILE)) {
            const clientsData = fs.readFileSync(CLIENTS_FILE, 'utf8');
            const clients = JSON.parse(clientsData);
            return clients[clientId] || defaultClient;
        }
        return defaultClient;
    } catch (error) {
        console.error('Error loading client config:', error);
        return defaultClient;
    }
};

module.exports = {
    getClientConfig
};