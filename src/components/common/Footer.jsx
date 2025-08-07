import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faDumbbell, faAppleWhole, faShoppingCart, faCog } from '@fortawesome/free-solid-svg-icons';

// Questo componente rappresenta la barra di navigazione inferiore.
// Gestisce la visualizzazione delle icone e l'interazione con l'utente
// per cambiare la sezione attiva dell'app.
const Footer = ({ activeTab, onTabChange }) => {
    // Definizione dei tab di navigazione con icone e etichette.
    const tabs = [
        { name: 'palestra', icon: faDumbbell, label: 'Palestra' },
        { name: 'dieta', icon: faAppleWhole, label: 'Dieta' },
        { name: 'spesa', icon: faShoppingCart, label: 'Spesa' },
        { name: 'settings', icon: faCog, label: 'Impostazioni' },
    ];

    return (
        <footer className="bg-gray-900 border-t border-gray-700 shadow-lg z-50">
            <nav className="flex justify-around items-center h-16 w-full">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.name;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => onTabChange(tab.name)}
                            className={`flex flex-col items-center justify-center p-2 text-sm font-medium transition-all duration-200
                                ${isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-300'}`}
                        >
                            <FontAwesomeIcon icon={tab.icon} className="text-xl mb-1" />
                            <span className={`text-xs ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </footer>
    );
};

export default Footer;
