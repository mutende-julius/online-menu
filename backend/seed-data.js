const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Sample data
const sampleData = {
    restaurants: [
        {
            id: 1,
            name: "Savanna Grill & Bar",
            description: "Authentic Kenyan Cuisine",
            contact_email: "info@savannagrill.com",
            phone_number: "+254712345678",
            address: "Nairobi, Kenya"
        }
    ],
    menuItems: [
        // Breakfast Items
        {
            restaurant_id: 1,
            name: "Kenyan Full Breakfast",
            description: "Eggs, sausage, bacon, baked beans, toast & fresh juice",
            price: 750,
            category: "breakfast",
            image_url: "breakfast.jpg",
            is_popular: 1
        },
        {
            restaurant_id: 1,
            name: "Mandazi & Chai",
            description: "Fresh homemade mandazi with spiced Kenyan tea",
            price: 180,
            category: "breakfast",
            image_url: "mandazi.jpg",
            is_popular: 0
        },
        
        // Main Dishes
        {
            restaurant_id: 1,
            name: "Ugali & Sukuma Wiki",
            description: "With your choice of beef, chicken or fish stew",
            price: 450,
            category: "main",
            image_url: "ugali-sukuma.jpg",
            is_popular: 1
        },
        {
            restaurant_id: 1,
            name: "Grilled Tilapia",
            description: "Whole tilapia grilled to perfection with vegetables",
            price: 950,
            category: "main",
            image_url: "tilapia.jpg",
            is_popular: 0
        },
        {
            restaurant_id: 1,
            name: "Chicken Biryani",
            description: "Aromatic rice with tender chicken and spices",
            price: 650,
            category: "main",
            image_url: "biryani.jpg",
            is_popular: 0
        },
        
        // Nyama Choma
        {
            restaurant_id: 1,
            name: "Nyama Choma Special",
            description: "1/2 kg grilled meat served with kachumbari & ugali",
            price: 1200,
            category: "nyama",
            image_url: "nyama-choma.jpg",
            is_popular: 1
        },
        
        // Drinks
        {
            restaurant_id: 1,
            name: "Fresh Fruit Juice",
            description: "Orange, passion, mango or pineapple",
            price: 220,
            category: "drinks",
            image_url: "juice.jpg",
            is_popular: 1
        }
    ]
};

// Insert data
db.serialize(() => {
    // Insert restaurant
    const restaurantStmt = db.prepare(`
        INSERT OR REPLACE INTO restaurants (id, name, description, contact_email, phone_number, address) 
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    sampleData.restaurants.forEach(restaurant => {
        restaurantStmt.run([
            restaurant.id,
            restaurant.name,
            restaurant.description,
            restaurant.contact_email,
            restaurant.phone_number,
            restaurant.address
        ]);
    });
    restaurantStmt.finalize();
    
    console.log('✅ Restaurant added to database');
    
    // Insert menu items
    const menuStmt = db.prepare(`
        INSERT OR REPLACE INTO menu_items 
        (restaurant_id, name, description, price, category, image_url, is_popular) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    sampleData.menuItems.forEach(item => {
        menuStmt.run([
            item.restaurant_id,
            item.name,
            item.description,
            item.price,
            item.category,
            item.image_url,
            item.is_popular
        ]);
    });
    
    menuStmt.finalize();
    console.log('✅ Menu items added to database');
    console.log(`✅ Added ${sampleData.menuItems.length} menu items`);
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('🎉 Database seeding completed!');
        console.log('🚀 Restart your backend server: npm run dev');
    }
});