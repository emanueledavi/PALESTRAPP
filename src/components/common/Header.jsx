// src/components/common/Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md z-40 relative">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-teal-300">PalestrApp</h1>
        {/* Qui in futuro potresti aggiungere altri elementi dell'header */}
      </div>
    </header>
  );
};

export default Header;
