// src/index.js (o main.jsx se lo hai rinominato)
import React from 'react';
import ReactDOM from 'react-dom/client'; // Importa da 'react-dom/client' per React 18+
import './index.css'; // Assicurati che questo percorso sia corretto
import App from './App'; // Assicurati che questo percorso sia corretto

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);