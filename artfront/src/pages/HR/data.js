// src/pages/HR/data.js
import { addMonths, differenceInMonths, parseISO, format, subMonths } from 'date-fns';

const currentDate = new Date();

export const artists = [
  { 
    id: 1, 
    name: 'John Doe',
    is_active: 'Active', 
    hireDate: '2024-01-15', 
    inactiveDates: [], 
    reactivationDates: [], 
    specialization: 'Wood Carving', 
    phone_number: '0185444856', 
    artPiecesProduced: 24, 
    frequentArtPieces: ['Wooden Lion', 'Carved Eagle', 'Forest Scene'] 
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    role: 'Artist', 
    department: 'Painting', 
    is_active: 'Active', 
    hireDate: '2022-05-20', 
    inactiveDates: ['2023-03-01', '2023-09-15'], 
    reactivationDates: ['2023-06-01', '2023-12-01'], 
    specialization: 'Oil Painting', 
    phone_number: '0185444856', 
    artPiecesProduced: 18, 
    frequentArtPieces: ['Landscape', 'Portrait', 'Still Life'] 
  },
  { 
    id: 3, 
    name: 'Mike Johnson', 
    role: 'Artist', 
    department: 'Sculptures', 
    is_active: 'Inactive', 
    hireDate: '2024-03-10', 
    inactiveDates: ['2024-07-01'], 
    reactivationDates: [], 
    specialization: 'Stone Carving', 
    phone_number: '0185444856', 
    artPiecesProduced: 15, 
    frequentArtPieces: ['Garden Statue', 'Abstract Form', 'Animal Figure'] 
  },
  { 
    id: 4, 
    name: 'Emily Brown', 
    role: 'Artist', 
    department: 'Painting', 
    is_active: 'Active', 
    hireDate: '2022-11-05', 
    inactiveDates: ['2023-04-01'], 
    reactivationDates: ['2023-08-01'], 
    specialization: 'Watercolor', 
    phone_number: '0185444856', 
    artPiecesProduced: 30, 
    frequentArtPieces: ['Floral', 'Seascape', 'Urban Sketch'] 
  },
  { 
    id: 5, 
    name: 'David Lee', 
    role: 'Artist', 
    department: 'Sculptures', 
    is_active: 'Active', 
    hireDate: '2023-02-28', 
    inactiveDates: [], 
    reactivationDates: [], 
    specialization: 'Metal Sculpting', 
    phone_number: '0185444856', 
    artPiecesProduced: 20, 
    frequentArtPieces: ['Modern Art', 'Kinetic Sculpture', 'Wall Piece'] 
  },
  { 
    id: 6, 
    name: 'Sarah Wilson', 
    role: 'Artist', 
    department: 'Painting', 
    is_active: 'Inactive', 
    hireDate: '2022-07-12', 
    inactiveDates: ['2024-01-01'], 
    reactivationDates: [], 
    specialization: 'Acrylic Painting', 
    phone_number: '0185444856', 
    artPiecesProduced: 22, 
    frequentArtPieces: ['Abstract', 'Pop Art', 'Minimalist'] 
  },
  { 
    id: 7, 
    name: 'Tom Harris', 
    role: 'Artist', 
    department: 'Sculptures', 
    is_active: 'Active', 
    hireDate: '2023-04-01', 
    inactiveDates: ['2023-10-01'], 
    reactivationDates: ['2024-02-01'], 
    specialization: 'Clay Modeling', 
    phone_number: '0185444856', 
    artPiecesProduced: 25, 
    frequentArtPieces: ['Pottery', 'Figurines', 'Decorative Tiles'] 
  },
  { 
    id: 8, 
    name: 'Lucy Chen', 
    role: 'Artist', 
    department: 'Painting', 
    is_active: 'Active', 
    hireDate: '2022-09-15', 
    inactiveDates: [], 
    reactivationDates: [], 
    specialization: 'Digital Art', 
    phone_number: '0185444856', 
    artPiecesProduced: 40, 
    frequentArtPieces: ['Character Design', 'Concept Art', 'Illustration'] 
  },
  { 
    id: 9, 
    name: 'Robert Taylor', 
    role: 'Artist', 
    department: 'Sculptures', 
    is_active: 'Active', 
    hireDate: '2023-01-20', 
    inactiveDates: ['2023-11-01'], 
    reactivationDates: ['2024-03-01'], 
    specialization: 'Glass Blowing', 
    phone_number: '0185444856', 
    artPiecesProduced: 28, 
    frequentArtPieces: ['Vases', 'Sculptures', 'Chandeliers'] 
  },
  { 
    id: 10, 
    name: 'Emma White', 
    role: 'Artist', 
    department: 'Painting', 
    is_active: 'Inactive', 
    hireDate: '2022-06-30', 
    inactiveDates: ['2024-02-01'], 
    reactivationDates: [], 
    specialization: 'Mural Painting', 
    phone_number: '0185444856', 
    artPiecesProduced: 12, 
    frequentArtPieces: ['Street Art', 'Wall Mural', 'Ceiling Fresco'] 
  },
  { 
    id: 11, 
    name: 'Michael Gray', 
    role: 'Artist', 
    department: 'Sculptures', 
    is_active: 'Active', 
    hireDate: '2023-03-05', 
    inactiveDates: ['2024-04-01'], 
    reactivationDates: ['2024-07-01'], 
    specialization: 'Ice Sculpting', 
    phone_number: '0185444856', 
    artPiecesProduced: 35, 
    frequentArtPieces: ['Ice Logo', 'Winter Scene', 'Event Centerpiece'] 
  },
  { 
    id: 12, 
    name: 'Olivia Green', 
    role: 'Artist', 
    department: 'Painting', 
    is_active: 'Active', 
    hireDate: '2022-10-10', 
    inactiveDates: ['2023-12-01'], 
    reactivationDates: ['2024-04-01'], 
    specialization: 'Portrait Painting', 
    phone_number: '0185444856', 
    artPiecesProduced: 20, 
    frequentArtPieces: ['Family Portrait', 'Self-Portrait', 'Pet Portrait'] 
  },
  { 
    id: 13, 
    name: 'Daniel Black', 
    role: 'Artist', 
    department: 'Sculptures', 
    is_active: 'Active', 
    hireDate: '2023-02-15', 
    inactiveDates: [], 
    reactivationDates: [], 
    specialization: 'Wire Sculpting', 
    phone_number: '0185444856', 
    artPiecesProduced: 30, 
    frequentArtPieces: ['Wire Tree', 'Abstract Form', 'Jewelry'] 
  },
  { 
    id: 14, 
    name: 'Sophia Rodriguez', 
    role: 'Artist', 
    department: 'Painting', 
    is_active: 'Inactive', 
    hireDate: '2022-08-22', 
    inactiveDates: ['2024-05-01'], 
    reactivationDates: [], 
    specialization: 'Mixed Media', 
    phone_number: '0185444856', 
    artPiecesProduced: 25, 
    frequentArtPieces: ['Collage', 'Assemblage', 'Textile Art'] 
  },
  { 
    id: 15, 
    name: 'William Turner', 
    role: 'Artist', 
    department: 'Sculptures', 
    is_active: 'Active', 
    hireDate: '2023-04-12', 
    inactiveDates: ['2024-06-01'], 
    reactivationDates: ['2024-08-01'], 
    specialization: 'Bronze Casting', 
    phone_number: '0185444856', 
    artPiecesProduced: 18, 
    frequentArtPieces: ['Figurative Sculpture', 'Architectural Element', 'Commemorative Plaque'] 
  }
];


export const staffMembers = [
  { id: 101, name: 'Alice Johnson', role: 'HR Manager', department: 'Human Resources', is_active: 'Active', hireDate: '2021-05-01', managementLevel: 'Manager', teamSize: 5 },
  { id: 102, name: 'Bob Williams', role: 'Accountant', department: 'Finance', is_active: 'Active', hireDate: '2022-01-15', managementLevel: 'Staff', teamSize: 0 },
  { id: 103, name: 'Carol Martinez', role: 'Marketing Specialist', department: 'Marketing', is_active: 'Active', hireDate: '2022-03-20', managementLevel: 'Staff', teamSize: 0 },
  { id: 104, name: 'David Thompson', role: 'IT Support', department: 'IT', is_active: 'Active', hireDate: '2021-11-10', managementLevel: 'Staff', teamSize: 0 },
  { id: 105, name: 'Eva Brown', role: 'Operations Manager', department: 'Operations', is_active: 'On Leave', hireDate: '2021-08-05', managementLevel: 'Manager', teamSize: 8 }
];

export const recentActivities = [
  { id: 1, message: 'New artist William Turner onboarded', time: '2 hours ago', icon: '👤' },
  { id: 2, message: 'Performance review completed for Jane Smith', time: '1 day ago', icon: '📋' },
  { id: 3, message: 'Leave request approved for Mike Johnson', time: '3 days ago', icon: '🏖️' },
  { id: 4, message: 'New project assigned to Emily Brown', time: '4 days ago', icon: '🎨' },
  { id: 5, message: 'Training session scheduled for all staff', time: '1 week ago', icon: '📚' }
];

export const getSpecializations = () => {
  const specializations = new Set(artists.map(artist => artist.specialization));
  return Array.from(specializations);
};

export const getOnLeaveInactiveCount = () => {
  return artists.filter(artist => artist.is_active === 'Inactive').length + 
         staffMembers.filter(staff => staff.is_active === 'On Leave').length;
};

export const getAllEmployees = () => [...artists, ...staffMembers];

export const getTimeSinceJoined = (hireDate) => {
  const months = differenceInMonths(currentDate, new Date(hireDate));
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years} years, ${remainingMonths} months`;
};

export const getEmployeeById = (id) => {
  return [...artists, ...staffMembers].find(emp => emp.id === id);
};

artists.bonusPercentage = 5

export const updateArtistBonus = (id, bonusPercentage) => {
  const artistIndex = artists.findIndex(artist => artist.id === id);
  if (artistIndex !== -1) {
    artists[artistIndex].bonusPercentage = bonusPercentage;
    return true;
  }
  return false;
};


export const getActiveArtistsPerMonth = () => {
  const endDate = new Date();
  const startDate = subMonths(endDate, 11); // Start 11 months ago to get 12 months of data
  const monthlyData = [];

  let currentMonth = startDate;
  while (currentMonth <= endDate) {
    const activeCount = artists.filter(artist => {
      const hireDate = parseISO(artist.hireDate);
      if (hireDate > currentMonth) return false;

      const isInactive = artist.inactiveDates.some(date => {
        const inactiveDate = parseISO(date);
        const reactivationDate = artist.reactivationDates.find(d => parseISO(d) > inactiveDate);
        return inactiveDate <= currentMonth && (!reactivationDate || parseISO(reactivationDate) > currentMonth);
      });

      return !isInactive;
    }).length;

    monthlyData.push({
      date: format(currentMonth, 'MMM yyyy'),
      activeCount
    });

    currentMonth = addMonths(currentMonth, 1);
  }

  return monthlyData;
};