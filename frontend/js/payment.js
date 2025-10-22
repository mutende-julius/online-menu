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

// Rest of your payment.js code remains the same...
// [Keep all the other functions like showPaymentSuccess, setupPaymentModal, etc.]