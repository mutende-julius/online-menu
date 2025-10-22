const express = require('express');
const router = express.Router();

// Sample menu data
const menuItems = [
    {
        id: 1,
        name: "Kenyan Full Breakfast",
        description: "Eggs, sausage, bacon, baked beans, toast & coffee",
        price: 750,
        category: "breakfast",
        image: "/images/breakfast.jpg"
    },
    {
        id: 2,
        name: "Nyama Choma",
        description: "Grilled meat served with ugali and kachumbari",
        price: 1200,
        category: "nyama",
        image: "/images/nyama.jpg"
    },
    {
        id: 3,
        name: "Chicken Burger",
        description: "Crispy chicken burger with fries",
        price: 850,
        category: "main",
        image: "/images/burger.jpg"
    },
    {
        id: 4,
        name: "Fresh Juice",
        description: "Seasonal fresh fruit juice",
        price: 300,
        category: "drinks",
        image: "/images/juice.jpg"
    }
];

// Get all menu items
router.get('/', (req, res) => {
    res.json(menuItems);
});

// Get menu items by category
router.get('/category/:category', (req, res) => {
    const category = req.params.category;
    const filteredItems = menuItems.filter(item => 
        category === 'all' ? true : item.category === category
    );
    res.json(filteredItems);
});

module.exports = router;