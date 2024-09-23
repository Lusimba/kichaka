import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-xl text-gray-600 mb-8">Sorry, you don't have permission to access this page.</p>
        <Link 
          to="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;