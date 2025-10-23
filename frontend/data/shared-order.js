// Shared Orders Database (connects customer and waiter)
window.SharedOrders = {
    // Initialize orders data
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

    // Save a new order from customer
    saveOrder: function(orderData) {
        const data = this.init();
        
        const order = {
            id: 'ORD' + data.nextOrderId.toString().padStart(6, '0'),
            tableNumber: orderData.tableNumber,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            status: 'pending', // pending, preparing, ready, completed
            customerName: orderData.customerName || `Table ${orderData.tableNumber}`,
            createdAt: new Date().toISOString(),
            createdAtFormatted: new Date().toLocaleTimeString()
        };

        data.orders.unshift(order); // Add to beginning
        data.nextOrderId++;
        
        localStorage.setItem('sharedOrders', JSON.stringify(data));
        console.log('Order saved to shared database:', order);
        return order;
    },

    // Get all orders for waiter dashboard
    getAllOrders: function() {
        const data = this.init();
        return data.orders;
    },

    // Update order status (waiter actions)
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
    },

    // Complete/remove order
    completeOrder: function(orderId) {
        const data = this.init();
        data.orders = data.orders.filter(order => order.id !== orderId);
        localStorage.setItem('sharedOrders', JSON.stringify(data));
        console.log('Order completed/removed:', orderId);
    },

    // Get orders by status
    getOrdersByStatus: function(status) {
        const data = this.init();
        if (status === 'all') return data.orders;
        return data.orders.filter(order => order.status === status);
    },

    // Clear all orders (for testing)
    clearAllOrders: function() {
        const initialData = {
            orders: [],
            nextOrderId: 1
        };
        localStorage.setItem('sharedOrders', JSON.stringify(initialData));
        console.log('All orders cleared');
    }
};