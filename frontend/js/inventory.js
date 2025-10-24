// Inventory Management System
window.InventorySystem = {
    init: function() {
        if (!localStorage.getItem('restaurantInventory')) {
            const initialInventory = {
                items: [
                    { id: 1, name: "Kenyan Full Breakfast", quantity: 20, category: "breakfast", price: 750 },
                    { id: 2, name: "Nyama Choma Platter", quantity: 15, category: "nyama", price: 1200 },
                    { id: 3, name: "Ugali with Beef", quantity: 25, category: "main", price: 450 },
                    { id: 4, name: "Ugali with Matumbo", quantity: 18, category: "main", price: 400 },
                    { id: 5, name: "Mukimo", quantity: 22, category: "main", price: 350 },
                    { id: 6, name: "Rice with Ndegu", quantity: 20, category: "main", price: 380 },
                    { id: 7, name: "Fresh Orange Juice", quantity: 30, category: "drinks", price: 200 },
                    { id: 8, name: "Bottled Water", quantity: 50, category: "drinks", price: 80 },
                    { id: 9, name: "Soda Selection", quantity: 40, category: "drinks", price: 120 },
                    { id: 10, name: "Kenyan Tea", quantity: 35, category: "drinks", price: 100 },
                    { id: 11, name: "Coffee", quantity: 25, category: "drinks", price: 150 }
                ],
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('restaurantInventory', JSON.stringify(initialInventory));
        }
        return JSON.parse(localStorage.getItem('restaurantInventory'));
    },

    getAllItems: function() {
        const data = this.init();
        return data.items;
    },

    getInStockItems: function() {
        const data = this.init();
        return data.items.filter(item => item.quantity > 0);
    },

    reduceQuantity: function(itemId, quantity = 1) {
        const data = this.init();
        const item = data.items.find(i => i.id === itemId);
        
        if (item && item.quantity >= quantity) {
            item.quantity -= quantity;
            item.lastSold = new Date().toISOString();
            localStorage.setItem('restaurantInventory', JSON.stringify(data));
            return true;
        }
        return false;
    },

    addQuantity: function(itemId, quantity) {
        const data = this.init();
        const item = data.items.find(i => i.id === itemId);
        
        if (item) {
            item.quantity += quantity;
            item.lastRestocked = new Date().toISOString();
            localStorage.setItem('restaurantInventory', JSON.stringify(data));
            return true;
        }
        return false;
    },

    updateQuantity: function(itemId, newQuantity) {
        const data = this.init();
        const item = data.items.find(i => i.id === itemId);
        
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('restaurantInventory', JSON.stringify(data));
            return true;
        }
        return false;
    },

    getStats: function() {
        const items = this.getAllItems();
        return {
            total: items.length,
            inStock: items.filter(item => item.quantity > 5).length,
            lowStock: items.filter(item => item.quantity > 0 && item.quantity <= 5).length,
            outOfStock: items.filter(item => item.quantity === 0).length
        };
    },

    bulkRestock: function() {
        const data = this.init();
        data.items.forEach(item => {
            if (item.quantity < 10) {
                item.quantity += 20;
                item.lastRestocked = new Date().toISOString();
            }
        });
        localStorage.setItem('restaurantInventory', JSON.stringify(data));
        return true;
    }
};