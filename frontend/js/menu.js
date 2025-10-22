class DigitalMenu {
    constructor() {
        this.menuItems = [];
        this.cart = [];
        this.currentTable = null;
        this.init();
    }

    async init() {
        await this.loadMenuItems();
        this.setupEventListeners();
        this.renderMenu();
    }

    async loadMenuItems() {
        try {
            const response = await fetch('data/menu.json');
            const data = await response.json();
            this.menuItems = data.items;
        } catch (error) {
            console.error('Error loading menu:', error);
            // Fallback demo data
            this.menuItems = [
                {
                    id: 1,
                    name: "Demo Item",
                    description: "This is a sample menu item",
                    price: 500,
                    category: "main",
                    image: "breakfast.jpg"
                }
            ];
        }
    }

    setupEventListeners() {
        // Table number input
        document.getElementById('tableInput').addEventListener('input', (e) => {
            this.currentTable = e.target.value ? parseInt(e.target.value) : null;
            this.updateCheckoutButton();
        });

        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderMenu(e.target.dataset.category);
            });
        });

        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.openPaymentModal();
        });
    }

    renderMenu(category = 'all') {
        const menuContainer = document.getElementById('menuItems');
        const filteredItems = category === 'all' 
            ? this.menuItems 
            : this.menuItems.filter(item => item.category === category);

        menuContainer.innerHTML = filteredItems.map(item => {
            // Use absolute path to images folder
            const imagePath = `images/${item.image}`;
            
            return `
            <div class="menu-item" data-category="${item.category}">
                <img src="${imagePath}" alt="${item.name}" class="item-image" 
                     onerror="console.log('Image failed to load: ${imagePath}')">
                <div class="item-info">
                    <div class="item-name">
                        ${item.name}
                        ${item.popular ? '<span class="popular-badge">Popular</span>' : ''}
                    </div>
                    <div class="item-description">${item.description}</div>
                    <div class="item-price">Ksh ${item.price.toLocaleString()}</div>
                </div>
                <div class="item-actions">
                    <button class="quantity-btn" onclick="menu.decreaseQuantity(${item.id})">-</button>
                    <span class="quantity-display" id="qty-${item.id}">0</span>
                    <button class="quantity-btn" onclick="menu.increaseQuantity(${item.id})">+</button>
                </div>
            </div>
            `;
        }).join('');
    }

    increaseQuantity(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        const cartItem = this.cart.find(i => i.id === itemId);

        if (cartItem) {
            cartItem.quantity++;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }

        this.updateCartDisplay();
    }

    decreaseQuantity(itemId) {
        const cartItemIndex = this.cart.findIndex(i => i.id === itemId);
        
        if (cartItemIndex !== -1) {
            if (this.cart[cartItemIndex].quantity > 1) {
                this.cart[cartItemIndex].quantity--;
            } else {
                this.cart.splice(cartItemIndex, 1);
            }
            this.updateCartDisplay();
        }
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cartItems');
        const totalAmount = document.getElementById('totalAmount');

        // Update quantity displays on menu items
        this.menuItems.forEach(item => {
            const qtyDisplay = document.getElementById(`qty-${item.id}`);
            if (qtyDisplay) {
                const cartItem = this.cart.find(i => i.id === item.id);
                qtyDisplay.textContent = cartItem ? cartItem.quantity : '0';
            }
        });

        // Update cart items list
        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
            totalAmount.textContent = '0';
        } else {
            cartContainer.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-details">
                            <span class="cart-item-quantity">Qty: ${item.quantity}</span>
                            <span class="cart-item-unit-price">Ksh ${item.price} each</span>
                        </div>
                    </div>
                    <div class="cart-item-price">Ksh ${(item.price * item.quantity).toLocaleString()}</div>
                </div>
            `).join('');

            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            totalAmount.textContent = total.toLocaleString();
        }

        this.updateCheckoutButton();
    }

    updateCheckoutButton() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        const isEnabled = this.currentTable && this.cart.length > 0;
        
        checkoutBtn.disabled = !isEnabled;
        checkoutBtn.textContent = isEnabled 
            ? `Pay Ksh ${document.getElementById('totalAmount').textContent} - Table ${this.currentTable}`
            : 'Proceed to Payment';
    }

    openPaymentModal() {
        if (!this.currentTable || this.cart.length === 0) {
            alert('Please enter table number and add items to cart');
            return;
        }

        // Show payment modal
        const paymentModal = document.getElementById('paymentModal');
        paymentModal.style.display = 'block';

        // Update payment summary
        this.updatePaymentSummary();
    }

    updatePaymentSummary() {
        const paymentSummary = document.getElementById('paymentSummary');
        const paymentTotal = document.getElementById('paymentTotal');
        const mpesaAmount = document.getElementById('mpesaAmount');
        const cardAmount = document.getElementById('cardAmount');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        paymentSummary.innerHTML = this.cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${item.name} x${item.quantity}</span>
                <span>Ksh ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `).join('');

        paymentTotal.textContent = total.toLocaleString();
        mpesaAmount.textContent = total.toLocaleString();
        cardAmount.textContent = total.toLocaleString();
    }

    processPaymentSuccess() {
        const orderData = {
            tableNumber: this.currentTable,
            items: this.cart,
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString(),
            orderId: 'ORD' + Date.now().toString().slice(-6)
        };

        console.log('Processing payment success:', orderData);

        // Show success modal
        document.getElementById('paymentModal').style.display = 'none';
        const successModal = document.getElementById('successModal');
        
        document.getElementById('successTable').textContent = orderData.tableNumber;
        document.getElementById('successAmount').textContent = orderData.total.toLocaleString();
        document.getElementById('orderId').textContent = orderData.orderId;
        
        successModal.style.display = 'block';

        // Reset cart after successful payment
        this.cart = [];
        this.updateCartDisplay();
        
        console.log('Order placed successfully:', orderData);
    }

    // Backup method for payment processing
    completeOrder() {
        const orderData = {
            tableNumber: this.currentTable,
            items: this.cart,
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString(),
            orderId: 'ORD' + Date.now().toString().slice(-6)
        };

        // Show success message
        alert(`Order placed successfully!\nTable: ${orderData.tableNumber}\nTotal: Ksh ${orderData.total.toLocaleString()}\nOrder ID: ${orderData.orderId}`);

        // Reset cart
        this.cart = [];
        this.updateCartDisplay();
        
        // Close payment modal if open
        document.getElementById('paymentModal').style.display = 'none';
        
        console.log('Order completed:', orderData);
    }
}

// Initialize the menu when page loads
const menu = new DigitalMenu();

// Make menu globally available for button clicks
window.menu = menu;

// Backup global functions for payment processing
window.processMpesaPayment = function() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!phoneNumber || phoneNumber.length !== 10 || !phoneNumber.startsWith('07')) {
        alert('Please enter a valid M-Pesa phone number (10 digits starting with 07)');
        return;
    }

    console.log('Processing M-Pesa payment for:', phoneNumber);
    
    // Show processing state
    const confirmBtn = document.getElementById('confirmMpesa');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '⏳ Processing M-Pesa...';
    confirmBtn.disabled = true;

    // Simulate processing
    setTimeout(() => {
        confirmBtn.innerHTML = '✅ Payment Successful!';
        
        setTimeout(() => {
            if (menu && menu.processPaymentSuccess) {
                menu.processPaymentSuccess();
            } else {
                menu.completeOrder();
            }
            
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            document.getElementById('phoneNumber').value = '';
        }, 1500);
    }, 3000);
};

window.processCardPayment = function() {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    
    if (!cardNumber || !expiryDate || !cvv) {
        alert('Please fill in all card details');
        return;
    }

    console.log('Processing card payment');
    
    // Show processing state
    const confirmBtn = document.getElementById('confirmCard');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '⏳ Processing Card...';
    confirmBtn.disabled = true;

    // Simulate processing
    setTimeout(() => {
        confirmBtn.innerHTML = '✅ Payment Successful!';
        
        setTimeout(() => {
            if (menu && menu.processPaymentSuccess) {
                menu.processPaymentSuccess();
            } else {
                menu.completeOrder();
            }
            
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
            document.getElementById('cardNumber').value = '';
            document.getElementById('expiryDate').value = '';
            document.getElementById('cvv').value = '';
        }, 1500);
    }, 3000);
};

// Emergency fallback - direct button handlers
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the page to fully load
    setTimeout(() => {
        const confirmMpesaBtn = document.getElementById('confirmMpesa');
        const confirmCardBtn = document.getElementById('confirmCard');
        
        if (confirmMpesaBtn) {
            confirmMpesaBtn.addEventListener('click', window.processMpesaPayment);
        }
        
        if (confirmCardBtn) {
            confirmCardBtn.addEventListener('click', window.processCardPayment);
        }
        
        console.log('Payment buttons initialized');
    }, 1000);
});