const express = require('express');
const router = express.Router();

// Simulate M-Pesa payment
router.post('/mpesa', (req, res) => {
    const { phone, amount, orderId } = req.body;
    
    // Simulate processing delay
    setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate for simulation
        
        if (success) {
            res.json({
                success: true,
                transactionId: `MP${Date.now()}`,
                message: 'Payment processed successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Payment failed. Please try again.'
            });
        }
    }, 3000);
});

module.exports = router;