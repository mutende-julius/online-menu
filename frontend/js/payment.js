// Real M-Pesa Integration
async function processRealMpesaPayment(phoneNumber, amount, orderId) {
    try {
        const confirmBtn = document.getElementById('confirmMpesa');
        const originalText = confirmBtn.innerHTML;
        
        // Show processing state
        confirmBtn.innerHTML = '📱 Sending M-Pesa Prompt...';
        confirmBtn.disabled = true;

        // Call backend to initiate STK Push
        const response = await fetch('/api/mpesa/stk-push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber,
                amount: amount,
                orderId: orderId
            })
        });

        const result = await response.json();

        if (result.success) {
            // STK Push initiated successfully
            confirmBtn.innerHTML = '✅ M-Pesa Prompt Sent!';
            
            // Show instruction to user
            showMpesaInstructions(phoneNumber, amount, result.checkoutRequestID);
            
        } else {
            // STK Push failed
            confirmBtn.innerHTML = '❌ Failed to Send Prompt';
            alert('Failed to send M-Pesa prompt: ' + result.error);
            
            setTimeout(() => {
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }, 3000);
        }

    } catch (error) {
        console.error('M-Pesa payment error:', error);
        alert('Network error. Please check your connection and try again.');
        
        const confirmBtn = document.getElementById('confirmMpesa');
        confirmBtn.innerHTML = '📱 Pay with M-Pesa';
        confirmBtn.disabled = false;
    }
}

function showMpesaInstructions(phoneNumber, amount, checkoutRequestID) {
    const paymentModal = document.getElementById('paymentModal');
    
    paymentModal.querySelector('.modal-body').innerHTML = `
        <div class="mpesa-instructions">
            <div class="instruction-icon">📱</div>
            <h3>Check Your Phone</h3>
            <p>We've sent an M-Pesa prompt to <strong>${phoneNumber}</strong></p>
            
            <div class="instruction-steps">
                <div class="step">
                    <span class="step-number">1</span>
                    <span class="step-text">Check your phone for the M-Pesa prompt</span>
                </div>
                <div class="step">
                    <span class="step-number">2</span>
                    <span class="step-text">Enter your M-Pesa PIN</span>
                </div>
                <div class="step">
                    <span class="step-number">3</span>
                    <span class="step-text">Wait for confirmation</span>
                </div>
            </div>
            
            <div class="payment-details">
                <p><strong>Amount:</strong> Ksh ${amount.toLocaleString()}</p>
                <p><strong>Paybill:</strong> 174379</p>
                <p><strong>Account:</strong> ${checkoutRequestID}</p>
            </div>
            
            <div class="waiting-animation">
                <div class="loading-spinner"></div>
                <p>Waiting for payment confirmation...</p>
            </div>
            
            <button id="checkPaymentStatus" class="confirm-btn">Check Payment Status</button>
            <button id="cancelPayment" class="cancel-btn">Cancel Payment</button>
        </div>
    `;

    // Add event listeners
    document.getElementById('checkPaymentStatus').addEventListener('click', () => {
        checkMpesaPaymentStatus(checkoutRequestID);
    });
    
    document.getElementById('cancelPayment').addEventListener('click', () => {
        paymentModal.querySelector('.modal-body').innerHTML = getOriginalPaymentForm();
        setupPaymentEventListeners();
    });

    // Start polling for payment status
    startPaymentPolling(checkoutRequestID);
}

function startPaymentPolling(checkoutRequestID) {
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/mpesa/payment-status/${checkoutRequestID}`);
            const result = await response.json();
            
            if (result.success && result.result.ResultCode === 0) {
                // Payment successful
                clearInterval(pollInterval);
                showPaymentSuccess(result.result);
            } else if (result.success && result.result.ResultCode !== 0) {
                // Payment failed or still processing
                console.log('Payment status:', result.result.ResultDesc);
            }
        } catch (error) {
            console.error('Error polling payment status:', error);
        }
    }, 5000); // Check every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
        clearInterval(pollInterval);
    }, 300000);
}

async function checkMpesaPaymentStatus(checkoutRequestID) {
    try {
        const response = await fetch(`/api/mpesa/payment-status/${checkoutRequestID}`);
        const result = await response.json();
        
        if (result.success) {
            if (result.result.ResultCode === 0) {
                showPaymentSuccess(result.result);
            } else {
                alert('Payment status: ' + result.result.ResultDesc);
            }
        } else {
            alert('Error checking payment status');
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        alert('Network error checking payment status');
    }
}

function showPaymentSuccess(paymentResult) {
    const paymentModal = document.getElementById('paymentModal');
    
    paymentModal.querySelector('.modal-body').innerHTML = `
        <div class="payment-success">
            <div class="success-icon">✅</div>
            <h3>Payment Successful!</h3>
            <div class="success-details">
                <p><strong>Amount:</strong> Ksh ${paymentResult.Amount}</p>
                <p><strong>Receipt:</strong> ${paymentResult.MpesaReceiptNumber}</p>
                <p><strong>Phone:</strong> ${paymentResult.PhoneNumber}</p>
                <p><strong>Time:</strong> ${paymentResult.TransactionDate}</p>
            </div>
            <button id="completeOrder" class="confirm-btn">Complete Order</button>
        </div>
    `;
    
    document.getElementById('completeOrder').addEventListener('click', () => {
        paymentModal.style.display = 'none';
        if (typeof menu !== 'undefined' && menu.processPaymentSuccess) {
            menu.processPaymentSuccess();
        }
    });
}

// Update the main M-Pesa payment handler
document.getElementById('confirmMpesa').addEventListener('click', function() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!phoneNumber || phoneNumber.length !== 10 || !phoneNumber.startsWith('07')) {
        alert('Please enter a valid M-Pesa phone number (10 digits starting with 07)');
        return;
    }

    const amount = parseInt(document.getElementById('paymentTotal').textContent.replace(/,/g, ''));
    const orderId = 'ORD' + Date.now().toString().slice(-8);
    
    // Store order temporarily before payment
    const orderData = {
        tableNumber: menu.currentTable,
        items: menu.cart,
        total: amount,
        payment_method: 'mpesa',
        order_id: orderId
    };
    
    // Process real M-Pesa payment
    processRealMpesaPayment(phoneNumber, amount, orderId);
});