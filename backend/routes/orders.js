const express = require('express');
const router = express.Router();

let orders = [];
let orderIdCounter = 1;

// Create new order
router.post('/', (req, res) => {
    const { tableNumber, items, totalAmount, customerPhone } = req.body;
    
    const newOrder = {
        id: `ORD${orderIdCounter.toString().padStart(6, '0')}`,
        tableNumber,
        items,
        totalAmount,
        customerPhone,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    orderIdCounter++;
    
    res.json({ success: true, order: newOrder });
});

// Get all orders
router.get('/', (req, res) => {
    res.json(orders);
});

// Update order status
router.put('/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        res.json({ success: true, order });
    } else {
        res.status(404).json({ success: false, error: 'Order not found' });
    }
});

module.exports = router;