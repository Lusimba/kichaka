// src/pages/Production/data.js

export const products = [
  { name: "Wooden Lion", sku: "WL-001" },
  { name: "Elephant Table", sku: "ET-002" },
  { name: "Giraffe Sculpture", sku: "GS-003" },
  { name: "Bear Armchair", sku: "BA-004" },
  { name: "Fox Bookends", sku: "FB-005" },
  { name: "Owl Figurine", sku: "OF-006" },
  { name: "Deer Wall Art", sku: "DWA-007" },
  { name: "Penguin Stool", sku: "PS-008" },
  { name: "Wolf Clock", sku: "WC-009" },
  { name: "Tiger Chest", sku: "TC-010" }
];


export const stages = [
  "Splitting/drawing",
  "Carving/cutting",
  "Sanding",
  "Painting",
  "Finishing",
  "Packaging"
];

export const artists = [
  "John Doe",
  "Jane Smith",
  "Bob Johnson",
  "Alice Williams",
  "Charlie Brown",
  "Diana Ross",
  "Edward Norton",
  "Fiona Apple"
];

export const tasks = [
  {
    id: 1,
    itemDetails: "Wooden Lion - Large",
    artist: "John Doe",
    estimatedTime: 20,
    quantity: 5,
    startDate: "2024-08-01",
    endDate: "2024-08-05",
    currentStage: 2,
    product: "Wooden Lion",
    rejectionCount: 1,
    rejectionHistory: [{ stage: 1, department: "Carpentry" }],
    status: "In Progress",
    notes: "Do it well"
  },
  {
    id: 2,
    itemDetails: "Elephant Table - Medium",
    artist: "Jane Smith",
    estimatedTime: 30,
    quantity: 5,
    startDate: "2024-08-03",
    endDate: "2024-08-10",
    currentStage: 1,
    product: "Elephant Table",
    rejectionCount: 2,
    rejectionHistory: [],
    status: "In Progress"
  },
  // Add more tasks here...
];

export const getTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tasks);
    }, 500);
  });
};

export const getTaskById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = tasks.find(task => task.id === parseInt(id));
      resolve(task);
    }, 300);
  });
};

export const getArtists = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(artists);
    }, 300);
  });
};