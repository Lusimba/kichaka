// src/pages/Quality/data.js

export const defectiveItems = [
  {
    id: 1,
    product: "Wooden Lion Sculpture",
    referredDepartment: "Carving",
    artist: "John Doe",
    referredBy: "Alice Smith",
    estimatedCompletion: "2024-08-20",
    referralDate: "2024-08-15T10:30:00",
    status: "In Progress"
  },
  {
    id: 2,
    product: "Elephant Coffee Table",
    referredDepartment: "Finishing",
    artist: "Jane Smith",
    referredBy: "Bob Johnson",
    estimatedCompletion: "2024-08-22",
    referralDate: "2024-08-16T14:45:00",
    status: "In Progress"
  },
  {
    id: 3,
    product: "Giraffe Bookshelf",
    referredDepartment: "Painting",
    artist: "Mike Brown",
    referredBy: "Carol Davis",
    estimatedCompletion: "2024-08-21",
    referralDate: "2024-08-14T09:15:00",
    status: "Completed"
  },
  // Add more mock data as needed
];

export const getDefectiveItems = () => {
  return Promise.resolve(defectiveItems);
};