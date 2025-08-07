// src/components/common/InfoModal.jsx
import React from 'react';
import { X, CheckCircle, Info } from 'lucide-react';

const InfoModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  let iconComponent;
  let iconColorClass;

  switch (type) {
    case 'success':
      iconComponent = <CheckCircle size={64} className="mx-auto mb-4" />;
      iconColorClass = 'text-green-500';
      break;
    case 'error':
      iconComponent = <X size={64} className="mx-auto mb-4" />;
      iconColorClass = 'text-red-500';
      break;
    case 'info':
    default:
      iconComponent = <Info size={64} className="mx-auto mb-4" />;
      iconColorClass = 'text-blue-500';
      break;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 w-full max-w-xs text-center">
        <div className={iconColorClass}>
          {iconComponent}
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-200"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
