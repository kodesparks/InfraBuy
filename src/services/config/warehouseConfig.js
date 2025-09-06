// Warehouse locations for different product categories
export const WAREHOUSE_LOCATIONS = {
  cement: {
    name: 'Hyderabad Cement Warehouse',
    location: {
      latitude: 17.3850, // Hyderabad coordinates
      longitude: 78.4867,
    },
    address: 'Hyderabad, Telangana, India',
    ratePerKm: 8, // ₹8 per km for cement
  },
  steel: {
    name: 'Mumbai Steel Warehouse',
    location: {
      latitude: 19.0760, // Mumbai coordinates
      longitude: 72.8777,
    },
    address: 'Mumbai, Maharashtra, India',
    ratePerKm: 12, // ₹12 per km for steel
  },
  concrete: {
    name: 'Delhi Concrete Warehouse',
    location: {
      latitude: 28.7041, // Delhi coordinates
      longitude: 77.1025,
    },
    address: 'Delhi, India',
    ratePerKm: 15, // ₹15 per km for concrete
  },
};

// Product category mapping
export const PRODUCT_CATEGORY_MAPPING = {
  'Cement': 'cement',
  'Steel': 'steel',
  'Concrete Mix': 'concrete',
};

// Base prices for products (will be updated dynamically from backend later)
export const BASE_PRODUCT_PRICES = {
  cement: {
    'UltraTech Cement': 420,
    'ACC Cement': 395,
    'Ambuja Cement': 380,
    'JSW Cement': 410,
  },
  steel: {
    'TATA TISCON 550SD': 8500,
    'JSW Steel': 8200,
    'SAIL Steel': 8000,
  },
  concrete: {
    'Ready Mix Concrete': 4500,
    'Precast Concrete': 3800,
  },
};
