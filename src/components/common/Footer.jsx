// src/components/common/Footer.jsx
import React from 'react';
import TabButton from './TabButton';
import { Dumbbell, Utensils, ShoppingCart, Settings } from 'lucide-react'; // Aggiunta Settings

const Footer = ({ activeTab, setActiveTab }) => {
  return (
    <footer className="bg-gray-900 p-4 shadow-lg z-40 dark:bg-gray-800"> {/* Aggiunta dark mode */}
      <nav className="flex justify-around">
        <TabButton
          icon={<Dumbbell size={24} />}
          label="Palestra"
          isActive={activeTab === 'palestra'}
          onClick={() => setActiveTab('palestra')}
        />
        <TabButton
          icon={<Utensils size={24} />}
          label="Dieta"
          isActive={activeTab === 'dieta'}
          onClick={() => setActiveTab('dieta')}
        />
        <TabButton
          icon={<ShoppingCart size={24} />}
          label="Spesa"
          isActive={activeTab === 'spesa'}
          onClick={() => setActiveTab('spesa')}
        />
        <TabButton
          icon={<Settings size={24} />}
          label="Impostazioni"
          isActive={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </nav>
    </footer>
  );
};

export default Footer;
