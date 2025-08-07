// src/components/palestra/AddExerciseModal.jsx
import React, { useState, useEffect } from 'react';
import { Dumbbell, X } from 'lucide-react';

const AddExerciseModal = ({ isOpen, onClose, onSave, openInfoModal }) => {
  const [newExerciseData, setNewExerciseData] = useState({
    name: '',
    explanation: '',
    machine: '',
    repetitions: '', // e.g., "4x8"
    recoveryTime: '', // e.g., "60s"
  });

  // Resetta i dati del form quando il modale si apre o si chiude
  // Questo assicura che il form sia pulito ogni volta che viene aperto per un nuovo esercizio
  useEffect(() => {
    if (!isOpen) {
      setNewExerciseData({
        name: '',
        explanation: '',
        machine: '',
        repetitions: '',
        recoveryTime: '',
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    if (newExerciseData.name.trim() === '') {
      openInfoModal("Errore", "Il nome dell'esercizio non può essere vuoto!", "error");
      return;
    }
    onSave(newExerciseData);
    onClose(); // Chiudi il modale dopo il salvataggio
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-teal-300 flex items-center">
            <Dumbbell size={24} className="mr-2" /> Aggiungi Nuovo Esercizio
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Nome Esercizio"
          value={newExerciseData.name}
          onChange={(e) => setNewExerciseData({ ...newExerciseData, name: e.target.value })}
          className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <textarea
          placeholder="Spiegazione"
          value={newExerciseData.explanation}
          onChange={(e) => setNewExerciseData({ ...newExerciseData, explanation: e.target.value })}
          className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none"
        />
        <input
          type="text"
          placeholder="Macchinario"
          value={newExerciseData.machine}
          onChange={(e) => setNewExerciseData({ ...newExerciseData, machine: e.target.value })}
          className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="text"
          placeholder="Ripetizioni (es. 4x8)"
          value={newExerciseData.repetitions}
          onChange={(e) => setNewExerciseData({ ...newExerciseData, repetitions: e.target.value })}
          className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="text"
          placeholder="Tempo di Recupero (es. 60s)"
          value={newExerciseData.recoveryTime}
          onChange={(e) => setNewExerciseData({ ...newExerciseData, recoveryTime: e.target.value })}
          className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
          >
            Salva Esercizio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExerciseModal;
