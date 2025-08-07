// src/components/common/TabButton.jsx
import React from 'react';

// Tab Button Component
const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-300 transform ${
      isActive
        ? 'bg-teal-500 dark:bg-teal-600 text-white dark:text-white shadow-lg scale-105 border border-teal-400 dark:border-teal-500'
        : 'text-gray-300 dark:text-gray-600 hover:bg-gray-600 dark:hover:bg-gray-300 hover:text-white dark:hover:text-gray-900'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);

export default TabButton;
