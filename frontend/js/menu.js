// Use window object to avoid conflicts
window.DigitalMenu = window.DigitalMenu || class {
    constructor() {
        this.menuItems = [];
        this.cart = [];
        this.currentTable = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('Initializing Digital Menu with Inventory...');
        try {
            await this.loadMenuWithInventory();
            this.setupEventListeners();
            this.renderMenu();
            console.log('Digital Menu with Inventory initialized successfully');
        } catch (error) {
            console.error('Error initializing menu:', error);
        }
    }

    async loadMenuWithInventory() {
        try {
            await this.loadMenuItems();
            
            // Filter menu based on inventory
            if (typeof InventorySystem !== 'undefined') {
                const inStockItems = InventorySystem.getInStockItems();
                this.menuItems = this.menuItems.filter(menuItem => 
                    inStockItems.some(stockItem => stockItem.id === menuItem.id)
                );
                console.log('Menu loaded with inventory:', this.menuItems.length, 'items in stock');
            } else {
                console.log('InventorySystem not available, showing all items');
            }
        } catch (error) {
            console.error('Error loading menu with inventory:', error);
        }
    }

    async loadMenuItems() {
        try {
            const response = await fetch('data/menu.json');
            if (!response.ok) throw new Error('Failed to load menu.json');
            
            const data = await response.json();
            this.menuItems = data.items || [];
            console.log('Menu items loaded:', this.menuItems.length);
        } catch (error) {
            console.error('Error loading menu:', error);
            // Fallback demo data
            this.menuItems = [
                {
                    id: 1,
                    name: "Kenyan Full Breakfast",
                    description: "Eggs, sausage, bacon, toast, coffee & juice",
                    price: 750,
                    category: "breakfast",
                    image: "breakfast.jpg",
                    popular: true
                },
                {
                    id: 2,
                    name: "Nyama Choma",
                    description: "Grilled meat served with ugali and kachumbari",
                    price: 1200,
                    category: "nyama",
                    image: "nyama-choma.jpg",
                    popular: true
                },
                {
                    id: 3,
                    name: "Fresh Juice",
                    description: "Seasonal fresh fruit juice",
                    price: 300,
                    category: "drinks",
                    image: "juice.jpg"
                }
            ];
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Table number input
        const tableInput = document.getElementById('tableInput');
        if (tableInput) {
            tableInput.addEventListener('input', (e) => {
                this.currentTable = e.target.value ? parseInt(e.target.value) : null;
                this.updateCheckoutButton();
            });
        }

        // Category filters
        const categoryButtons = document.querySelectorAll('.category-btn');
        if (categoryButtons.length > 0) {
            categoryButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.renderMenu(e.target.dataset.category);
                });
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.openPaymentModal();
            });
        }

        // Modal close buttons
        const closeButtons = document.querySelectorAll('.close, #closeSuccess');
        closeButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    const modals = document.querySelectorAll('.modal');
                    modals.forEach(modal => {
                        if (modal) modal.style.display = 'none';
                    });
                });
            }
        });

        // Close modal when clicking outside
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            }
        });

        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', (e) => {
                paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                
                const methodType = method.dataset.method;
                document.querySelectorAll('.payment-form').forEach(form => form.classList.remove('active'));
                document.getElementById(methodType + 'Form').classList.add('active');
            });
        });
    }

    renderMenu(category = 'all') {
        const menuContainer = document.getElementById('menuItems');
        if (!menuContainer) {
            console.error('Menu container not found');
            return;
        }

        const filteredItems = category === 'all' 
            ? this.menuItems 
            : this.menuItems.filter(item => item.category === category);

        if (filteredItems.length === 0) {
            menuContainer.innerHTML = '<div class="no-items">No items found in this category</div>';
            return;
        }

        menuContainer.innerHTML = filteredItems.map(item => {
            // Use relative path to images folder
            const imagePath = `images/${item.image}`;
            
            return `
            <div class="menu-item" data-category="${item.category}">
                <img src="${imagePath}" alt="${item.name}" class="item-image" 
                     onerror="this.style.display='none'; console.log('Image not found: ${imagePath}')">
                <div class="item-info">
                    <div class="item-name">
                        ${item.name}
                        ${item.popular ? '<span class="popular-badge">Popular</span>' : ''}
                    </div>
                    <div class="item-description">${item.description}</div>
                    <div class="item-price">Ksh ${item.price.toLocaleString()}</div>
                </div>
                <div class="item-actions">
                    <button class="quantity-btn" onclick="window.menuInstance.decreaseQuantity(${item.id})">-</button>
                    <span class="quantity-display" id="qty-${item.id}">0</span>
                    <button class="quantity-btn" onclick="window.menuInstance.increaseQuantity(${item.id})">+</button>
                </div>
            </div>
            `;
        }).join('');
    }

    increaseQuantity(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) {
            console.error('Item not found:', itemId);
            return;
        }

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

        if (!cartContainer || !totalAmount) {
            console.error('Cart elements not found');
            return;
        }

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
        if (!checkoutBtn) return;
        
        const isEnabled = this.currentTable && this.cart.length > 0;
        
        checkoutBtn.disabled = !isEnabled;
        checkoutBtn.textContent = isEnabled 
            ? `Pay Ksh ${document.getElementById('totalAmount')?.textContent || '0'} - Table ${this.currentTable}`
            : 'Proceed to Payment';
    }

    openPaymentModal() {
        if (!this.currentTable || this.cart.length === 0) {
            alert('Please enter table number and add items to cart');
            return;
        }

        // Show payment modal
        const paymentModal = document.getElementById('paymentModal');
        if (paymentModal) {
            paymentModal.style.display = 'block';
            this.updatePaymentSummary();
        }
    }

    updatePaymentSummary() {
        const paymentSummary = document.getElementById('paymentSummary');
        const paymentTotal = document.getElementById('paymentTotal');
        const mpesaAmount = document.getElementById('mpesaAmount');
        const cardAmount = document.getElementById('cardAmount');

        if (!paymentSummary || !paymentTotal) return;

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        paymentSummary.innerHTML = this.cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${item.name} x${item.quantity}</span>
                <span>Ksh ${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `).join('');

        paymentTotal.textContent = total.toLocaleString();
        if (mpesaAmount) mpesaAmount.textContent = total.toLocaleString();
        if (cardAmount) cardAmount.textContent = total.toLocaleString();
    }

    processPaymentSuccess() {
        const orderData = {
            tableNumber: this.currentTable,
            items: [...this.cart], // Copy array
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString(),
            orderId: 'ORD' + Date.now().toString().slice(-6)
        };

        console.log('Processing payment success:', orderData);

        // ✅ Reduce inventory for each sold item
        if (typeof InventorySystem !== 'undefined') {
            this.cart.forEach(item => {
                InventorySystem.reduceQuantity(item.id, item.quantity);
            });
            console.log('📦 Inventory updated for sold items');
        }

        // ✅ Save to shared orders for waiter dashboard
        if (typeof SharedOrders !== 'undefined') {
            SharedOrders.saveOrder({
                tableNumber: orderData.tableNumber,
                items: orderData.items,
                totalAmount: orderData.total,
                customerName: `Table ${orderData.tableNumber}`
            });
            console.log('✅ ORDER SENT TO WAITER DASHBOARD!');
        } else {
            console.log('⚠️ SharedOrders not available, but order completed');
        }

        // Show success modal
        const paymentModal = document.getElementById('paymentModal');
        const successModal = document.getElementById('successModal');
        
        if (paymentModal) paymentModal.style.display = 'none';
        
        if (successModal) {
            const successTable = document.getElementById('successTable');
            const successAmount = document.getElementById('successAmount');
            const orderId = document.getElementById('orderId');
            
            if (successTable) successTable.textContent = orderData.tableNumber;
            if (successAmount) successAmount.textContent = orderData.total.toLocaleString();
            if (orderId) orderId.textContent = orderData.orderId;
            
            successModal.style.display = 'block';
        }

        // Reset cart after successful payment
        this.cart = [];
        this.updateCartDisplay();
        
        console.log('Order placed successfully:', orderData);
    }

    // Backup method for payment processing
    completeOrder() {
        const orderData = {
            tableNumber: this.currentTable,
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString(),
            orderId: 'ORD' + Date.now().toString().slice(-6)
        };

        // ✅ Reduce inventory for each sold item
        if (typeof InventorySystem !== 'undefined') {
            this.cart.forEach(item => {
                InventorySystem.reduceQuantity(item.id, item.quantity);
            });
        }

        // ✅ Save to shared orders for waiter dashboard
        if (typeof SharedOrders !== 'undefined') {
            SharedOrders.saveOrder({
                tableNumber: orderData.tableNumber,
                items: orderData.items,
                totalAmount: orderData.total,
                customerName: `Table ${orderData.tableNumber}`
            });
            console.log('✅ ORDER SENT TO WAITER DASHBOARD!');
        }

        // Show success message
        alert(`Order placed successfully!\nTable: ${orderData.tableNumber}\nTotal: Ksh ${orderData.total.toLocaleString()}\nOrder ID: ${orderData.orderId}`);

        // Reset cart
        this.cart = [];
        this.updateCartDisplay();
        
        // Close payment modal if open
        const paymentModal = document.getElementById('paymentModal');
        if (paymentModal) paymentModal.style.display = 'none';
        
        console.log('Order completed:', orderData);
    }
};

// Initialize the menu when page loads
let menuInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing menu...');
    
    try {
        menuInstance = new window.DigitalMenu();
        window.menuInstance = menuInstance; // Make available globally
        console.log('✅ Menu instance created and available globally');
    } catch (error) {
        console.error('Failed to initialize menu:', error);
    }
});

// Fallback initialization for manual calls
window.initializeMenu = function() {
    if (!window.menuInstance) {
        window.menuInstance = new window.DigitalMenu();
    }
    return window.menuInstance;
};