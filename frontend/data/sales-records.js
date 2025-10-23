// Sales Records Database (using localStorage for demo)
window.SalesDatabase = {
    // Initialize sales data
    init: function() {
        if (!localStorage.getItem('salesRecords')) {
            const initialData = {
                sales: [],
                dailySummary: {},
                products: {},
                payments: {}
            };
            localStorage.setItem('salesRecords', JSON.stringify(initialData));
        }
        return JSON.parse(localStorage.getItem('salesRecords'));
    },

    // Save a new sale
    saveSale: function(saleData) {
        const data = this.init();
        
        const saleRecord = {
            id: 'SALE_' + Date.now(),
            orderId: saleData.orderId,
            tableNumber: saleData.tableNumber,
            items: saleData.items,
            totalAmount: saleData.totalAmount,
            paymentMethod: saleData.paymentMethod,
            paymentStatus: saleData.paymentStatus,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            customerPhone: saleData.customerPhone || null,
            receiptNumber: saleData.receiptNumber || null
        };

        data.sales.unshift(saleRecord); // Add to beginning
        this.updateDailySummary(saleRecord);
        this.updateProductSales(saleRecord);
        this.updatePaymentMethods(saleRecord);
        
        localStorage.setItem('salesRecords', JSON.stringify(data));
        return saleRecord;
    },

    // Update daily summary
    updateDailySummary: function(sale) {
        const data = this.init();
        const today = new Date().toLocaleDateString();
        
        if (!data.dailySummary[today]) {
            data.dailySummary[today] = {
                date: today,
                totalSales: 0,
                totalOrders: 0,
                averageOrderValue: 0,
                paymentMethods: {}
            };
        }
        
        data.dailySummary[today].totalSales += sale.totalAmount;
        data.dailySummary[today].totalOrders += 1;
        data.dailySummary[today].averageOrderValue = 
            data.dailySummary[today].totalSales / data.dailySummary[today].totalOrders;
        
        // Track payment methods
        const method = sale.paymentMethod;
        if (!data.dailySummary[today].paymentMethods[method]) {
            data.dailySummary[today].paymentMethods[method] = 0;
        }
        data.dailySummary[today].paymentMethods[method] += sale.totalAmount;
        
        localStorage.setItem('salesRecords', JSON.stringify(data));
    },

    // Update product sales tracking
    updateProductSales: function(sale) {
        const data = this.init();
        
        sale.items.forEach(item => {
            if (!data.products[item.name]) {
                data.products[item.name] = {
                    name: item.name,
                    totalSold: 0,
                    totalRevenue: 0,
                    quantitySold: 0
                };
            }
            
            data.products[item.name].quantitySold += item.quantity;
            data.products[item.name].totalRevenue += item.price * item.quantity;
            data.products[item.name].totalSold += 1;
        });
        
        localStorage.setItem('salesRecords', JSON.stringify(data));
    },

    // Update payment methods tracking
    updatePaymentMethods: function(sale) {
        const data = this.init();
        const method = sale.paymentMethod;
        
        if (!data.payments[method]) {
            data.payments[method] = {
                method: method,
                totalAmount: 0,
                transactionCount: 0
            };
        }
        
        data.payments[method].totalAmount += sale.totalAmount;
        data.payments[method].transactionCount += 1;
        
        localStorage.setItem('salesRecords', JSON.stringify(data));
    },

    // Get all sales records
    getAllSales: function() {
        const data = this.init();
        return data.sales;
    },

    // Get daily reports
    getDailyReport: function(date = null) {
        const data = this.init();
        const targetDate = date || new Date().toLocaleDateString();
        return data.dailySummary[targetDate] || null;
    },

    // Get product analytics
    getProductAnalytics: function() {
        const data = this.init();
        return Object.values(data.products).sort((a, b) => b.totalRevenue - a.totalRevenue);
    },

    // Get payment analytics
    getPaymentAnalytics: function() {
        const data = this.init();
        return Object.values(data.payments);
    },

    // Get sales summary
    getSalesSummary: function() {
        const data = this.init();
        const sales = data.sales;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalOrders = sales.length;
        
        return {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            mostPopularProduct: this.getProductAnalytics()[0] || null
        };
    }
};