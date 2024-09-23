// src/pages/Orders/data.js

export const orders = [
  {
    id: 1,
    customerName: 'John Doe',
    orderDate: '2024-08-09',
    status: 'New',
    totalAmount: 1250,
    items: [
      { 
        product: 'Wooden Lion', 
        quantity: 1, 
        price: 500, 
        description: 'A majestic wooden lion sculpture',
        category: 'Sculptures',
        sku: 'SCULIO001'
      },
      { 
        product: 'Fox Bookshelf', 
        quantity: 2, 
        price: 180, 
        description: 'Pair of fox-shaped bookends',
        category: 'Furniture',
        sku: 'FURFOX016'
      },
      { 
        product: 'Owl Clock', 
        quantity: 1, 
        price: 390, 
        description: 'Detailed wooden owl figurine',
        category: 'Clocks',
        sku: 'CLOOWL012'
      }
    ]
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    orderDate: '2024-08-08',
    status: 'In Progress',
    totalAmount: 950,
    items: [
      { 
        product: 'Elephant Table', 
        quantity: 1, 
        price: 750, 
        description: 'A unique elephant-shaped coffee table',
        category: 'Furniture',
        sku: 'FURELE002'
      },
      { 
        product: 'Giraffe Sculpture', 
        quantity: 1, 
        price: 200, 
        description: 'Small giraffe sculpture for desk',
        category: 'Sculptures',
        sku: 'SCUGIR003'
      }
    ]
  },
  {
    id: 3,
    customerName: 'Bob Johnson',
    orderDate: '2024-08-07',
    status: 'Completed',
    totalAmount: 1200,
    items: [
      { 
        product: 'Bear Armchair', 
        quantity: 1, 
        price: 1200, 
        description: 'Comfortable armchair with bear design',
        category: 'Furniture',
        sku: 'FURBEA013'
      }
    ]
  },
  // Add more orders here...
];


export const getOrders = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(orders);
    }, 500);
  });
};

export const getOrderById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = orders.find(order => order.id === parseInt(id));
      resolve(order);
    }, 300);
  });
};

export const products = [
  { sku: 'SCULIO001', name: 'Wooden Lion' },
  { sku: 'FURELE002', name: 'Elephant Table' },
  { sku: 'SCUGIR003', name: 'Giraffe Sculpture' },
  { sku: 'FURBEA013', name: 'Bear Armchair' },
  { sku: 'FURFOX016', name: 'Fox Bookshelf' },
  { sku: 'CLOOWL012', name: 'Owl Clock' },
  // Add more products here...
];

export const getProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(products);
    }, 300); // Simulate a 300ms delay
  });
};