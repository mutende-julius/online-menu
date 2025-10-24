// Inventory Management System
window.InventorySystem = {
    init: function() {
        if (!localStorage.getItem('restaurantInventory')) {
            const initialInventory = {
                items: [
                    { id: 1, name: "Kenyan Full Breakfast", quantity: 20, category: "breakfast" },
                    { id: 2, name: "Nyama Choma Platter", quantity: 15, category: "nyama" },
                    { id: 3, name: "Ugali with Beef", quantity: 25, category: "main" },
                    { id: 4, name: "Ugali with Matumbo", quantity: 18, category: "main" },
                    { id: 5, name: "Mukimo", quantity: 22, category: "main" },
                    { id: 6, name: "Rice with Ndegu", quantity: 20, category: "main" },
                    { id: 7, name: "Fresh Orange Juice", quantity: 30, category: "drinks" },
                    { id: 8, name: "Bottled Water", quantity: 50, category: "drinks" },
                    { id: 9, name: "Soda Selection", quantity: 40, category: "drinks" },
                    { id: 10, name: "Kenyan Tea", quantity: 35, category: "drinks" },
                    { id: 11, name: "Coffee", quantity: 25, category: "drinks" }
                ],
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('restaurantInventory', JSON.stringify(initialInventory));
        }
        return JSON.parse(localStorage.getItem('restaurantInventory'));
    },

    // Reduce quantity when item is sold
    reduceQuantity: function(itemId, quantity = 1) {
        const data = this.init();
        const item = data.items.find(i => i.id === itemId);
        
        if (item && item.quantity >= quantity) {
            item.quantity -= quantity;
            item.lastSold = new Date().toISOString();
            localStorage.setItem('restaurantInventory', JSON.stringify(data));
            console.log(`📦 Inventory updated: ${item.name} -${quantity}, Remaining: ${item.quantity}`);
            return true;
        }
        return false;
    },

    // Add quantity (for restocking)
    addQuantity: function(itemId, quantity) {
        const data = this.init();
        const item = data.items.find(i => i.id === itemId);
        
        if (item) {
            item.quantity += quantity;
            item.lastRestocked = new Date().toISOString();
            localStorage.setItem('restaurantInventory', JSON.stringify(data));
            console.log(`📦 Restocked: ${item.name} +${quantity}, Total: ${item.quantity}`);
            return true;
        }
        return false;
    },

    // Get all inventory items
    getAllItems: function() {
        const data = this.init();
        return data.items;
    },

    // Get items that are in stock (quantity > 0)
    getInStockItems: function() {
        const data = this.init();
        return data.items.filter(item => item.quantity > 0);
    },

    // Update item quantity
    updateQuantity: function(itemId, newQuantity) {
        const data = this.init();
        const item = data.items.find(i => i.id === itemId);
        
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('restaurantInventory', JSON.stringify(data));
            return true;
        }
        return false;
    }
};