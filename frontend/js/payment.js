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
    
    // Save to sales database
    if (typeof SalesDatabase !== 'undefined') {
        SalesDatabase.saveSale(saleData);
        console.log('Sale recorded:', saleData);
    } else {
        // Fallback: Store in localStorage directly
        console.log('SalesDatabase not available, sale data:', saleData);
    }
    
    return saleData;
}

// Demo M-Pesa Integration (No backend required)
async function processRealMpesaPayment(phoneNumber, amount, orderId) {
    try {
        const confirmBtn = document.getElementById('confirmMpesa');
        if (!confirmBtn) {
            console.error('Confirm M-Pesa button not found');
            return;
        }
        
        const originalText = confirmBtn.innerHTML;
        
        // Show processing state
        confirmBtn.innerHTML = '📱 Sending M-Pesa Prompt...';
        confirmBtn.disabled = true;

        // SIMULATE API CALL - Remove this in production
        console.log('DEMO MODE: Simulating M-Pesa payment');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate successful response
        const demoResponse = {
            success: true,
            checkoutRequestID: 'DEMO_' + Date.now(),
            message: 'Demo mode - Payment simulated successfully'
        };

        if (demoResponse.success) {
            // STK Push initiated successfully
            confirmBtn.innerHTML = '✅ M-Pesa Prompt Sent!';
            
            // Show instruction to user
            showMpesaInstructions(phoneNumber, amount, demoResponse.checkoutRequestID);
            
        } else {
            // STK Push failed
            confirmBtn.innerHTML = '❌ Failed to Send Prompt';
            alert('Failed to send M-Pesa prompt: ' + (demoResponse.error || 'Unknown error'));
            
            setTimeout(() => {
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }, 3000);
        }

    } catch (error) {
        console.error('M-Pesa payment error:', error);
        
        // Fallback to simple success for demo
        const confirmBtn = document.getElementById('confirmMpesa');
        if (confirmBtn) {
            confirmBtn.innerHTML = '✅ Payment Successful (Demo)';
            
            setTimeout(() => {
                if (window.menuInstance && window.menuInstance.processPaymentSuccess) {
                    window.menuInstance.processPaymentSuccess();
                }
                confirmBtn.innerHTML = '📱 Pay with M-Pesa';
                confirmBtn.disabled = false;
            }, 2000);
        }
    }
}

function showMpesaInstructions(phoneNumber, amount, checkoutRequestID) {
    const paymentModal = document.getElementById('paymentModal');
    if (!paymentModal) {
        console.error('Payment modal not found');
        return;
    }
    
    const modalBody = paymentModal.querySelector('.modal-body');
    if (!modalBody) {
        console.error('Modal body not found');
        return;
    }
    
    modalBody.innerHTML = `
        <div class="mpesa-instructions">
            <div class="instruction-icon">📱</div>
            <h3>DEMO MODE - Check Your Phone</h3>
            <p>📢 <strong>This is a demonstration</strong> - No real payment will be processed</p>
            <p>In a real scenario, an M-Pesa prompt would be sent to <strong>${phoneNumber}</strong></p>
            
            <div class="instruction-steps">
                <div class="step">
                    <span class="step-number">1</span>
                    <span class="step-text"><strong>Demo:</strong> Check your phone for the M-Pesa prompt</span>
                </div>
                <div class="step">
                    <span class="step-number">2</span>
                    <span class="step-text"><strong>Demo:</strong> Enter your M-Pesa PIN</span>
                </div>
                <div class="step">
                    <span class="step-number">3</span>
                    <span class="step-text"><strong>Demo:</strong> Wait for confirmation</span>
                </div>
            </div>
            
            <div class="payment-details">
                <p><strong>Amount:</strong> Ksh ${amount.toLocaleString()}</p>
                <p><strong>Paybill:</strong> 174379 (Demo)</p>
                <p><strong>Account:</strong> ${checkoutRequestID}</p>
            </div>
            
            <div class="demo-notice" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>🔄 Demo Mode Active</strong><br>
                This is a simulation. No real M-Pesa transaction will occur.
            </div>
            
            <button id="simulateSuccess" class="confirm-btn" style="background: #28a745;">✅ Simulate Successful Payment</button>
            <button id="simulateFailure" class="cancel-btn" style="background: #dc3545;">❌ Simulate Failed Payment</button>
            <button id="cancelPayment" class="cancel-btn">← Back to Payment</button>
        </div>
    `;

    // Add event listeners with null checks
    const simulateSuccessBtn = document.getElementById('simulateSuccess');
    if (simulateSuccessBtn) {
        simulateSuccessBtn.addEventListener('click', () => {
            simulatePaymentSuccess(phoneNumber, amount, checkoutRequestID);
        });
    }
    
    const simulateFailureBtn = document.getElementById('simulateFailure');
    if (simulateFailureBtn) {
        simulateFailureBtn.addEventListener('click', () => {
            simulatePaymentFailure();
        });
    }
    
    const cancelBtn = document.getElementById('cancelPayment');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            // Reset to original payment form
            setupPaymentModal();
        });
    }
}

function simulatePaymentSuccess(phoneNumber, amount, checkoutRequestID) {
    // Record the sale before showing success
    if (window.menuInstance) {
        const orderData = {
            orderId: 'ORD' + Date.now().toString().slice(-6),
            tableNumber: window.menuInstance.currentTable,
            items: window.menuInstance.cart,
            total: amount
        };
        
        recordSale(orderData, 'M-Pesa', phoneNumber);
    }
    
    const paymentResult = {
        Amount: amount,
        MpesaReceiptNumber: 'DEMO' + Date.now().toString().slice(-8),
        PhoneNumber: phoneNumber,
        TransactionDate: new Date().toLocaleString()
    };
    
    showPaymentSuccess(paymentResult);
}

function simulatePaymentFailure() {
    alert('❌ Payment Failed\n\nIn a real scenario, this could happen due to:\n• Insufficient funds\n• Wrong PIN\n• Network issues\n• Transaction cancelled');
    
    // Reset payment form
    setupPaymentModal();
}

function startPaymentPolling(checkoutRequestID) {
    console.log('DEMO: Payment polling started for:', checkoutRequestID);
    // In demo mode, we don't need real polling
}

async function checkMpesaPaymentStatus(checkoutRequestID) {
    console.log('DEMO: Checking payment status for:', checkoutRequestID);
    // In demo mode, simulate success after user action
    alert('Demo: Payment status check would happen here');
}

// Setup payment modal with proper event listeners
function setupPaymentModal() {
    const confirmMpesaBtn = document.getElementById('confirmMpesa');
    const confirmCardBtn = document.getElementById('confirmCard');
    
    if (confirmMpesaBtn) {
        // Remove existing listeners and add new one
        confirmMpesaBtn.replaceWith(confirmMpesaBtn.cloneNode(true));
        document.getElementById('confirmMpesa').addEventListener('click', handleMpesaPayment);
    }
    
    if (confirmCardBtn) {
        confirmCardBtn.replaceWith(confirmCardBtn.cloneNode(true));
        document.getElementById('confirmCard').addEventListener('click', handleCardPayment);
    }
}

// Main M-Pesa payment handler
function handleMpesaPayment() {
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

    const paymentTotalEl = document.getElementById('paymentTotal');
    if (!paymentTotalEl) {
        console.error('Payment total element not found');
        return;
    }
    
    const amount = parseInt(paymentTotalEl.textContent.replace(/,/g, '')) || 0;
    const orderId = 'ORD' + Date.now().toString().slice(-8);
    
    // Store order temporarily before payment
    const orderData = {
        tableNumber: window.menuInstance?.currentTable || 1,
        items: window.menuInstance?.cart || [],
        total: amount,
        payment_method: 'mpesa',
        order_id: orderId
    };
    
    // Process real M-Pesa payment
    processRealMpesaPayment(phoneNumber, amount, orderId);
}

// Card payment handler
function handleCardPayment() {
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

    const paymentTotalEl = document.getElementById('paymentTotal');
    if (!paymentTotalEl) {
        console.error('Payment total element not found');
        return;
    }
    
    const amount = parseInt(paymentTotalEl.textContent.replace(/,/g, '')) || 0;
    const orderId = 'ORD' + Date.now().toString().slice(-8);
    
    // Record card sale
    if (window.menuInstance) {
        const orderData = {
            orderId: orderId,
            tableNumber: window.menuInstance.currentTable,
            items: window.menuInstance.cart,
            total: amount
        };
        
        recordSale(orderData, 'Card');
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
            }
            
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            cardNumber.value = '';
            expiryDate.value = '';
            cvv.value = '';
        }, 1500);
    }, 3000);
}

function showPaymentSuccess(paymentResult) {
    const paymentModal = document.getElementById('paymentModal');
    if (!paymentModal) return;
    
    const modalBody = paymentModal.querySelector('.modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="payment-success">
            <div class="success-icon">✅</div>
            <h3>Payment Successful!</h3>
            <div class="success-details">
                <p><strong>Amount:</strong> Ksh ${paymentResult.Amount || 'N/A'}</p>
                <p><strong>Receipt:</strong> ${paymentResult.MpesaReceiptNumber || 'N/A'}</p>
                <p><strong>Phone:</strong> ${paymentResult.PhoneNumber || 'N/A'}</p>
                <p><strong>Time:</strong> ${paymentResult.TransactionDate || 'N/A'}</p>
            </div>
            <button id="completeOrder" class="confirm-btn">Complete Order</button>
        </div>
    `;
    
    const completeBtn = document.getElementById('completeOrder');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            paymentModal.style.display = 'none';
            // Check if menu object exists before calling
            if (typeof window.menuInstance !== 'undefined' && window.menuInstance.processPaymentSuccess) {
                window.menuInstance.processPaymentSuccess();
            }
        });
    }
}

// Update the existing payment functions to record sales
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

    // Record sale
    if (window.menuInstance) {
        const orderData = {
            orderId: 'ORD' + Date.now().toString().slice(-6),
            tableNumber: window.menuInstance.currentTable,
            items: window.menuInstance.cart,
            total: window.menuInstance.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        recordSale(orderData, 'M-Pesa', phoneNumber);
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
    
    // Record sale
    if (window.menuInstance) {
        const orderData = {
            orderId: 'ORD' + Date.now().toString().slice(-6),
            tableNumber: window.menuInstance.currentTable,
            items: window.menuInstance.cart,
            total: window.menuInstance.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        recordSale(orderData, 'Card');
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

// Initialize payment system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment system initializing...');
    
    // Wait a bit for other scripts to load
    setTimeout(() => {
        setupPaymentModal();
        console.log('Payment buttons initialized with sales tracking');
    }, 100);
});

// Fallback for manual initialization
window.initializePaymentSystem = setupPaymentModal;