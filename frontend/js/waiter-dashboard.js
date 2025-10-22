class WaiterDashboard {
    constructor() {
        this.orders = [];
        this.socket = null;
        this.currentFilter = 'all';
        this.currentOrderId = null;
        this.init();
    }

    init() {
        this.connectSocket();
        this.loadOrders();
        this.setupEventListeners();
        this.updateStatistics();
    }

    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus(false);
        });

        this.socket.on('new_order', (order) => {
            console.log('New order received:', order);
            this.addNewOrder(order);
            this.showNewOrderNotification(order);
        });

        this.socket.on('order_updated', (data) => {
            console.log('Order updated:', data);
            this.updateOrderStatus(data.id, data.status);
        });
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        if (connected) {
            statusElement.textContent = '● Connected';
            statusElement.className = 'status-connected';
        } else {
            statusElement.textContent = '● Disconnected';
            statusElement.className = 'status-disconnected';
        }
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders');
            this.orders = await response.json();
            this.renderOrders();
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.status;
                this.renderOrders();
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadOrders();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('orderModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Status update buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('status-btn')) {
                const status = e.target.dataset.status;
                this.updateOrderStatus(this.currentOrderId, status);
                this.closeModal();
            }
        });
    }

    addNewOrder(order) {
        // Check if order already exists
        const existingIndex = this.orders.findIndex(o => o.id === order.id);
        if (existingIndex === -1) {
            this.orders.unshift(order);
        } else {
            this.orders[existingIndex] = order;
        }
        this.renderOrders();
        this.updateStatistics();
    }

    updateOrderStatus(orderId, newStatus) {
        fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update local order
                const orderIndex = this.orders.findIndex(order => order.id === orderId);
                if (orderIndex !== -1) {
                    this.orders[orderIndex].status = newStatus;
                    this.renderOrders();
                    this.updateStatistics();
                }
            }
        })
        .catch(error => {
            console.error('Error updating order status:', error);
        });
    }

    renderOrders() {
        const ordersGrid = document.getElementById('ordersGrid');
        const filteredOrders = this.filterOrders();

        if (filteredOrders.length === 0) {
            ordersGrid.innerHTML = `
                <div class="no-orders">
                    <div class="no-orders-icon">📋</div>
                    <h3>No Orders</h3>
                    <p>No orders match the current filter</p>
                </div>
            `;
            return;
        }

        ordersGrid.innerHTML = filteredOrders.map(order => this.createOrderCard(order)).join('');
        
        // Add click listeners to order cards
        document.querySelectorAll('.order-card').forEach(card => {
            card.addEventListener('click', () => {
                const orderId = parseInt(card.dataset.orderId);
                this.openOrderModal(orderId);
            });
        });

        // Update order count
        document.getElementById('orderCount').textContent = `Orders: ${filteredOrders.length}`;
    }

    filterOrders() {
        if (this.currentFilter === 'all') {
            return this.orders;
        }
        return this.orders.filter(order => order.status === this.currentFilter);
    }

    createOrderCard(order) {
        const items = order.items.slice(0, 3); // Show first 3 items
        const moreItems = order.items.length > 3 ? `+${order.items.length - 3} more` : '';

        return `
            <div class="order-card ${order.status}" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-id">${order.order_id}</div>
                    <div class="order-status status-${order.status}">
                        ${this.getStatusText(order.status)}
                    </div>
                </div>
                
                <div class="order-info">
                    <div class="info-row">
                        <span class="label">Table:</span>
                        <span class="value">${order.table_number}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Total:</span>
                        <span class="value">Ksh ${order.total_amount.toLocaleString()}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Time:</span>
                        <span class="value">${this.formatTime(order.created_at)}</span>
                    </div>
                </div>

                <div class="order-items">
                    ${items.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">x${item.quantity}</span>
                            <span class="item-price">Ksh ${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                    ${moreItems ? `<div class="more-items">${moreItems}</div>` : ''}
                </div>

                <div class="order-actions">
                    <button class="action-btn preparing-btn" onclick="event.stopPropagation(); dashboard.updateOrderStatus(${order.id}, 'preparing')">
                        👨‍🍳 Preparing
                    </button>
                    <button class="action-btn ready-btn" onclick="event.stopPropagation(); dashboard.updateOrderStatus(${order.id}, 'ready')">
                        ✅ Ready
                    </button>
                    <button class="action-btn completed-btn" onclick="event.stopPropagation(); dashboard.updateOrderStatus(${order.id}, 'completed')">
                        📦 Completed
                    </button>
                </div>
            </div>
        `;
    }

    openOrderModal(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        this.currentOrderId = orderId;

        // Populate modal
        document.getElementById('modalOrderId').textContent = order.order_id;
        document.getElementById('modalTableNumber').textContent = order.table_number;
        document.getElementById('modalStatus').textContent = this.getStatusText(order.status);
        document.getElementById('modalStatus').className = `status-${order.status}`;
        document.getElementById('modalTotal').textContent = `Ksh ${order.total_amount.toLocaleString()}`;
        document.getElementById('modalTime').textContent = this.formatTime(order.created_at);

        // Populate items
        const itemsContainer = document.getElementById('modalItems');
        itemsContainer.innerHTML = order.items.map(item => `
            <div class="modal-item">
                <div class="item-info">
                    <strong>${item.name}</strong>
                    <div class="item-details">Qty: ${item.quantity} × Ksh ${item.price}</div>
                </div>
                <div class="item-total">Ksh ${(item.price * item.quantity).toLocaleString()}</div>
            </div>
        `).join('');

        // Show modal
        document.getElementById('orderModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('orderModal').style.display = 'none';
        this.currentOrderId = null;
    }

    updateStatistics() {
        const pendingCount = this.orders.filter(o => o.status === 'pending').length;
        const preparingCount = this.orders.filter(o => o.status === 'preparing').length;
        const readyCount = this.orders.filter(o => o.status === 'ready').length;
        
        const todayRevenue = this.orders
            .filter(o => o.status === 'completed')
            .reduce((sum, order) => sum + order.total_amount, 0);

        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('preparingCount').textContent = preparingCount;
        document.getElementById('readyCount').textContent = readyCount;
        document.getElementById('todayRevenue').textContent = `Ksh ${todayRevenue.toLocaleString()}`;
    }

    showNewOrderNotification(order) {
        // Create notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order Received!', {
                body: `Table ${order.table_number} - Ksh ${order.total_amount.toLocaleString()}`,
                icon: '/favicon.ico'
            });
        }

        // Visual notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <strong>📋 New Order!</strong><br>
            Table ${order.table_number} - Ksh ${order.total_amount.toLocaleString()}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '⏳ Pending',
            'preparing': '👨‍🍳 Preparing',
            'ready': '✅ Ready',
            'completed': '📦 Completed'
        };
        return statusMap[status] || status;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
}

// Request notification permission
if ('Notification' in window) {
    Notification.requestPermission();
}

// Initialize dashboard when page loads
const dashboard = new WaiterDashboard();