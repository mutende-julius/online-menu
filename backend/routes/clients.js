const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const CLIENTS_FILE = path.join(__dirname, '../data/clients.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Ensure clients file exists
if (!fs.existsSync(CLIENTS_FILE)) {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify({}));
}

// Get all clients
router.get('/', (req, res) => {
    try {
        if (!fs.existsSync(CLIENTS_FILE)) {
            return res.json({ success: true, clients: {} });
        }
        
        const clientsData = fs.readFileSync(CLIENTS_FILE, 'utf8');
        const clients = JSON.parse(clientsData);
        res.json({ success: true, clients });
    } catch (error) {
        console.error('Error reading clients:', error);
        res.status(500).json({ success: false, error: 'Failed to read clients' });
    }
});

// Add new client
router.post('/', (req, res) => {
    try {
        const { clientId, businessName, shortcode, passkey, primaryColor, contactPhone, contactEmail } = req.body;
        
        let clients = {};
        if (fs.existsSync(CLIENTS_FILE)) {
            const clientsData = fs.readFileSync(CLIENTS_FILE, 'utf8');
            clients = JSON.parse(clientsData);
        }
        
        clients[clientId] = {
            id: clientId,
            businessName,
            shortcode,
            passkey,
            theme: { primaryColor: primaryColor || '#2c5530' },
            contact: { phone: contactPhone, email: contactEmail },
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
        
        res.json({ 
            success: true, 
            clientId,
            message: 'Client configuration saved successfully' 
        });
    } catch (error) {
        console.error('Error saving client:', error);
        res.status(500).json({ success: false, error: 'Failed to save client' });
    }
});

// Get specific client
router.get('/:clientId', (req, res) => {
    try {
        const { clientId } = req.params;
        
        if (!fs.existsSync(CLIENTS_FILE)) {
            return res.status(404).json({ success: false, error: 'Client not found' });
        }
        
        const clientsData = fs.readFileSync(CLIENTS_FILE, 'utf8');
        const clients = JSON.parse(clientsData);
        
        const client = clients[clientId];
        if (client) {
            res.json({ success: true, client });
        } else {
            res.status(404).json({ success: false, error: 'Client not found' });
        }
    } catch (error) {
        console.error('Error reading client:', error);
        res.status(500).json({ success: false, error: 'Failed to read client' });
    }
});

module.exports = router;