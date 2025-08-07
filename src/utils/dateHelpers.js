// src/utils/dateHelpers.js

// Helper per ottenere una chiave unica per il giorno (YYYY-MM-DD)
export const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formatta la data per la visualizzazione (es. "Lunedì, 1 Gennaio 2024")
export const formatFullDate = (date) => {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('it-IT', options);
};
