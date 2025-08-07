// src/components/settings/SettingsSection.jsx
import React, { useState, useEffect } from 'react';
import { Moon, Bell, Globe, Info, Sun } from 'lucide-react'; // Importa nuove icone

const SettingsSection = () => {
  // Stati per le impostazioni
  const [darkMode, setDarkMode] = useState(() => {
    // Legge l'impostazione dal localStorage o usa il default del sistema
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('Italiano');

  // Effetto per applicare/rimuovere la classe 'dark' al tag html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    // In un'app reale, qui si caricherebbero i file di localizzazione
  };

  return (
    <div className="space-y-6 p-4 bg-gray-700 dark:bg-gray-50 rounded-2xl shadow-md border border-gray-600 dark:border-gray-300">
      <h2 className="text-2xl font-bold text-teal-300 dark:text-teal-600 text-center">Impostazioni</h2>
      <p className="text-gray-300 dark:text-gray-700 text-center">
        Personalizza la tua esperienza con l'app.
      </p>

      <div className="mt-6 space-y-4">
        {/* Impostazione Modalità Scura */}
        <div className="bg-gray-800 dark:bg-white p-4 rounded-lg border border-gray-600 dark:border-gray-300 flex items-center justify-between">
          <div className="flex items-center">
            {darkMode ? <Moon size={24} className="text-yellow-400 dark:text-yellow-600 mr-3" /> : <Sun size={24} className="text-orange-400 dark:text-orange-600 mr-3" />}
            <h3 className="text-lg font-semibold text-white dark:text-gray-900">Modalità Scura</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={darkMode}
              onChange={handleToggleDarkMode}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {/* Impostazione Notifiche */}
        <div className="bg-gray-800 dark:bg-white p-4 rounded-lg border border-gray-600 dark:border-gray-300 flex items-center justify-between">
          <div className="flex items-center">
            <Bell size={24} className="text-blue-400 dark:text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-white dark:text-gray-900">Notifiche</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={notificationsEnabled}
              onChange={handleToggleNotifications}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Impostazione Lingua */}
        <div className="bg-gray-800 dark:bg-white p-4 rounded-lg border border-gray-600 dark:border-gray-300 flex items-center justify-between">
          <div className="flex items-center">
            <Globe size={24} className="text-green-400 dark:text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-white dark:text-gray-900">Lingua</h3>
          </div>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="p-2 bg-gray-900 dark:bg-gray-200 text-gray-100 dark:text-gray-900 border border-gray-700 dark:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-700"
          >
            <option value="Italiano">Italiano</option>
            <option value="English">English</option>
            <option value="Español">Español</option>
          </select>
        </div>

        {/* Sezione Informazioni sull'App */}
        <div className="bg-gray-800 dark:bg-white p-4 rounded-lg border border-gray-600 dark:border-gray-300">
          <div className="flex items-center mb-2">
            <Info size={24} className="text-purple-400 dark:text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-white dark:text-gray-900">Informazioni sull'App</h3>
          </div>
          <p className="text-gray-400 dark:text-gray-700 text-sm">Versione: 1.0.1</p>
          <p className="text-gray-400 dark:text-gray-700 text-sm">Sviluppato da: Lele</p>
          <p className="text-gray-400 dark:text-gray-700 text-sm mt-2">
            Questa è un'applicazione per la gestione del fitness personale.
            Ti aiuta a tenere traccia dei tuoi allenamenti, della dieta e della lista della spesa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
