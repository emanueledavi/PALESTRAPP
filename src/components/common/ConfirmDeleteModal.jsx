// src/components/common/ConfirmDeleteModal.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react'; // Rimossa l'importazione di X

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 w-full max-w-xs text-center">
        <AlertTriangle size={64} className="mx-auto mb-4 text-yellow-500" />
        <h3 className="text-2xl font-bold text-white mb-3">Conferma Eliminazione</h3>
        <p className="text-gray-300 mb-6">
          {message || `Sei sicuro di voler eliminare "${itemName}"? Questa azione è irreversibile.`}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-500 transition-colors duration-200"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
