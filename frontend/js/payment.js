// SHARED ORDERS DATABASE FALLBACK - Add this at the VERY TOP of payment.js
if (typeof SharedOrders === 'undefined') {
    console.log('🔄 Creating SharedOrders fallback...');
    window.SharedOrders = {
        init: function() {
            if (!localStorage.getItem('sharedOrders')) {
                const initialData = {
                    orders: [],
                    nextOrderId: 1
                };
                localStorage.setItem('sharedOrders', JSON.stringify(initialData));
            }
            return JSON.parse(localStorage.getItem('sharedOrders'));
        },

        saveOrder: function(orderData) {
            const data = this.init();
            
            const order = {
                id: 'ORD' + data.nextOrderId.toString().padStart(6, '0'),
                tableNumber: orderData.tableNumber,
                items: orderData.items,
                totalAmount: orderData.totalAmount,
                status: 'pending',
                customerName: orderData.customerName || `Table ${orderData.tableNumber}`,
                createdAt: new Date().toISOString(),
                createdAtFormatted: new Date().toLocaleTimeString()
            };

            data.orders.unshift(order);
            data.nextOrderId++;
            
            localStorage.setItem('sharedOrders', JSON.stringify(data));
            console.log('🎯 ORDER SAVED TO WAITER DASHBOARD:', order);
            return order;
        },

        getAllOrders: function() {
            const data = this.init();
            return data.orders;
        },

        updateOrderStatus: function(orderId, newStatus) {
            const data = this.init();
            const order = data.orders.find(o => o.id === orderId);
            
            if (order) {
                order.status = newStatus;
                order.updatedAt = new Date().toISOString();
                localStorage.setItem('sharedOrders', JSON.stringify(data));
                console.log('Order status updated:', orderId, '->', newStatus);
                return true;
            }
            return false;
        }
    };
    console.log('✅ SharedOrders fallback created!');
} else {
    console.log('✅ SharedOrders already available!');
}

// Sales recording function
function recordSale(orderData, paymentMethod, customerPhone = null) {
    const saleData = {
        orderId: orderData.orderId,
        tableNumber: orderData.tableNumber,
        items: orderData.items,
        totalAmount: orderData.total,
        paymentMethod: paymentMethod,
        paymentStatus: 'completed',
        customerPhone: customerPhone,
        receiptNumber: 'RCPT' + Date.now().toString().slice(-6)
    };
    
    console.log('💰 Sale recorded:', saleData);
    return saleData;
}

// Global payment functions
window.processMpesaPayment = function() {
    const phoneInput = document.getElementById('phoneNumber');
    if (!phoneInput) {
        console.error('Phone number input not found');
        return;
    }
    
    const phoneNumber = phoneInput.value;
    
    if (!phoneNumber || phoneNumber.length !== 10 || !phoneNumber.startsWith('07')) {
        alert('Please enter a valid M-Pesa phone number (10 digits starting with 07)');
        return;
    }

    console.log('Processing M-Pesa payment for:', phoneNumber);
    
    // Show processing state
    const confirmBtn = document.getElementById('confirmMpesa');
    if (!confirmBtn) return;
    
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '⏳ Processing M-Pesa...';
    confirmBtn.disabled = true;

    // Record sale and save to shared orders
    if (window.menuInstance) {
        const orderData = {
            orderId: 'ORD' + Date.now().toString().slice(-6),
            tableNumber: window.menuInstance.currentTable,
            items: window.menuInstance.cart,
            total: window.menuInstance.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        // Save to sales
        recordSale(orderData, 'M-Pesa', phoneNumber);
        
        // ✅ CRITICAL: Save to shared orders for waiter dashboard
        if (typeof SharedOrders !== 'undefined') {
            SharedOrders.saveOrder({
                tableNumber: orderData.tableNumber,
                items: orderData.items,
                totalAmount: orderData.total,
                customerName: `Table ${orderData.tableNumber}`
            });
            console.log('✅ ORDER SENT TO WAITER DASHBOARD FROM M-PESA!');
        } else {
            console.error('❌ SharedOrders not available!');
        }
    }

    // Simulate processing
    setTimeout(() => {
        confirmBtn.innerHTML = '✅ Payment Successful!';
        
        setTimeout(() => {
            if (window.menuInstance && window.menuInstance.processPaymentSuccess) {
                window.menuInstance.processPaymentSuccess();
            } else if (window.menuInstance) {
                window.menuInstance.completeOrder();
            }
            
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            if (phoneInput) phoneInput.value = '';
        }, 1500);
    }, 3000);
};

window.processCardPayment = function() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    
    if (!cardNumber || !expiryDate || !cvv) {
        console.error('Card input elements not found');
        return;
    }
    
    if (!cardNumber.value || !expiryDate.value || !cvv.value) {
        alert('Please fill in all card details');
        return;
    }

    console.log('Processing card payment');
    
    // Record sale and save to shared orders
    if (window.menuInstance) {
        const orderData = {
            orderId: 'ORD' + Date.now().toString().slice(-6),
            tableNumber: window.menuInstance.currentTable,
            items: window.menuInstance.cart,
            total: window.menuInstance.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        // Save to sales
        recordSale(orderData, 'Card');
        
        // ✅ CRITICAL: Save to shared orders for waiter dashboard
        if (typeof SharedOrders !== 'undefined') {
            SharedOrders.saveOrder({
                tableNumber: orderData.tableNumber,
                items: orderData.items,
                totalAmount: orderData.total,
                customerName: `Table ${orderData.tableNumber}`
            });
            console.log('✅ ORDER SENT TO WAITER DASHBOARD FROM CARD!');
        } else {
            console.error('❌ SharedOrders not available!');
        }
    }

    // Show processing state
    const confirmBtn = document.getElementById('confirmCard');
    if (!confirmBtn) return;
    
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '⏳ Processing Card...';
    confirmBtn.disabled = true;

    // Simulate processing
    setTimeout(() => {
        confirmBtn.innerHTML = '✅ Payment Successful!';
        
        setTimeout(() => {
            if (window.menuInstance && window.menuInstance.processPaymentSuccess) {
                window.menuInstance.processPaymentSuccess();
            } else if (window.menuInstance) {
                window.menuInstance.completeOrder();
            }
            
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            cardNumber.value = '';
            expiryDate.value = '';
            cvv.value = '';
        }, 1500);
    }, 3000);
};

// Initialize payment system
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment system initializing...');
    
    // Test if SharedOrders is available
    if (typeof SharedOrders !== 'undefined') {
        console.log('✅ SharedOrders is available');
    } else {
        console.error('❌ SharedOrders is NOT available');
    }
    
    // Setup payment buttons
    setTimeout(() => {
        const confirmMpesaBtn = document.getElementById('confirmMpesa');
        const confirmCardBtn = document.getElementById('confirmCard');
        const closeSuccessBtn = document.getElementById('closeSuccess');
        
        if (confirmMpesaBtn) {
            confirmMpesaBtn.addEventListener('click', window.processMpesaPayment);
        }
        
        if (confirmCardBtn) {
            confirmCardBtn.addEventListener('click', window.processCardPayment);
        }
        
        if (closeSuccessBtn) {
            closeSuccessBtn.addEventListener('click', () => {
                const successModal = document.getElementById('successModal');
                if (successModal) successModal.style.display = 'none';
            });
        }
        
        console.log('Payment buttons initialized');
    }, 500);
});