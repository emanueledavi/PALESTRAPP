// src/components/palestra/ExerciseLibraryModal.jsx
import React, { useState, useRef } from 'react'; // Importa useRef
import { X, PlusCircle, BookOpen, Search, Trash2 } from 'lucide-react';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal'; // Importa il nuovo modale di conferma

const ExerciseLibraryModal = ({ isOpen, onClose, exerciseLibrary, setExerciseLibrary, openInfoModal, onAddExerciseToDay }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDetails, setNewExerciseDetails] = useState({
    explanation: '',
    machine: '',
    repetitions: '',
    recoveryTime: '',
  });

  // Aggiunto controllo difensivo per assicurarsi che exerciseLibrary sia sempre una Map
  const currentExerciseLibrary = exerciseLibrary instanceof Map ? exerciseLibrary : new Map();

  // Stato per gestire la posizione di swipe di ogni esercizio
  const [swipePositions, setSwipePositions] = useState({}); // { exerciseId: translateX }
  // Ref per memorizzare la posizione iniziale del tocco e la trasformazione corrente
  const touchStartRef = useRef({}); // { exerciseId: startX }
  const currentTransformRef = useRef({}); // { exerciseId: currentX }

  const SWIPE_THRESHOLD = -80; // Soglia in pixel per attivare l'eliminazione (swipe verso sinistra)

  // Stati per il modale di conferma
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalExerciseId, setConfirmModalExerciseId] = useState(null);
  const [confirmModalExerciseName, setConfirmModalExerciseName] = useState('');


  // Gestione eventi touch per swipe-to-delete
  const handleTouchStart = (e, exerciseId) => {
    touchStartRef.current[exerciseId] = e.touches[0].clientX;
    currentTransformRef.current[exerciseId] = swipePositions[exerciseId] || 0; // Inizia dalla posizione attuale
  };

  const handleTouchMove = (e, exerciseId) => {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartRef.current[exerciseId];
    let newTransformX = currentTransformRef.current[exerciseId] + deltaX;

    // Limita lo swipe: non può andare a destra oltre la posizione originale (0)
    // e non può andare troppo a sinistra (es. oltre -120px)
    newTransformX = Math.min(0, newTransformX);
    newTransformX = Math.max(SWIPE_THRESHOLD * 1.5, newTransformX); // Limita lo swipe a sinistra per non "perdere" l'elemento

    setSwipePositions(prev => ({
      ...prev,
      [exerciseId]: newTransformX
    }));
  };

  const handleTouchEnd = (e, exerciseId, exerciseName) => {
    const finalTransformX = swipePositions[exerciseId];

    if (finalTransformX <= SWIPE_THRESHOLD) {
      // Se lo swipe ha superato la soglia, apri il modale di conferma
      setConfirmModalExerciseId(exerciseId);
      setConfirmModalExerciseName(exerciseName);
      setIsConfirmModalOpen(true);
      // Non resettare la posizione qui, verrà gestita dopo la conferma/annullamento
    } else {
      // Altrimenti, fai tornare l'elemento alla sua posizione originale con un'animazione
      setSwipePositions(prev => ({
        ...prev,
        [exerciseId]: 0 // Torna a 0
      }));
    }
    // Pulisci i riferimenti al tocco
    delete touchStartRef.current[exerciseId];
    delete currentTransformRef.current[exerciseId];
  };


  // Filtra gli esercizi in base al termine di ricerca
  const filteredExercises = Array.from(currentExerciseLibrary.values()).filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewExercise = () => {
    if (newExerciseName.trim() === '') {
      openInfoModal("Errore", "Il nome del nuovo esercizio non può essere vuoto.", "error");
      return;
    }

    const newExercise = {
      id: Date.now().toString(),
      name: newExerciseName.trim(),
      explanation: newExerciseDetails.explanation.trim(),
      machine: newExerciseDetails.machine.trim(),
      repetitions: newExerciseDetails.repetitions.trim(),
      recoveryTime: newExerciseDetails.recoveryTime.trim(),
      sets: [], // Nuovi esercizi nella libreria iniziano senza serie
      personalBest: 0,
      totalVolume: 0,
    };

    setExerciseLibrary(prevLibrary => {
      const newLibrary = new Map(prevLibrary);
      if (Array.from(newLibrary.values()).some(ex => ex.name.toLowerCase() === newExercise.name.toLowerCase())) {
        openInfoModal("Attenzione", "Un esercizio con questo nome esiste già nella libreria.", "info");
        return prevLibrary;
      }
      newLibrary.set(newExercise.id, newExercise);
      return newLibrary;
    });

    openInfoModal("Successo!", `Esercizio '${newExercise.name}' aggiunto alla libreria.`, "success");
    setNewExerciseName('');
    setNewExerciseDetails({
      explanation: '',
      machine: '',
      repetitions: '',
      recoveryTime: '',
    });
  };

  const handleDeleteExercise = (exerciseId, exerciseName) => {
    setExerciseLibrary(prevLibrary => {
      const newLibrary = new Map(prevLibrary);
      newLibrary.delete(exerciseId);
      return newLibrary;
    });
    openInfoModal("Successo!", `Esercizio '${exerciseName}' eliminato dalla libreria.`, "success");
    // Resetta la posizione di swipe per l'elemento eliminato (anche se verrà rimosso dal DOM, è buona pratica)
    setSwipePositions(prev => {
      const newSwipePositions = { ...prev };
      delete newSwipePositions[exerciseId];
      return newSwipePositions;
    });
  };

  // Funzione chiamata dal modale di conferma quando l'utente conferma l'eliminazione
  const handleConfirmDelete = () => {
    if (confirmModalExerciseId) {
      handleDeleteExercise(confirmModalExerciseId, confirmModalExerciseName);
    }
    setIsConfirmModalOpen(false);
    setConfirmModalExerciseId(null);
    setConfirmModalExerciseName('');
  };

  // Funzione chiamata dal modale di conferma quando l'utente annulla l'eliminazione
  const handleCancelDelete = () => {
    // Riporta l'elemento alla posizione originale
    if (confirmModalExerciseId) {
      setSwipePositions(prev => ({
        ...prev,
        [confirmModalExerciseId]: 0
      }));
    }
    setIsConfirmModalOpen(false);
    setConfirmModalExerciseId(null);
    setConfirmModalExerciseName('');
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 w-full max-w-md h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-purple-300 flex items-center">
            <BookOpen size={24} className="mr-2" /> Libreria Esercizi
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sezione Aggiungi Nuovo Esercizio */}
        <div className="bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-600 mb-4">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">Aggiungi Nuovo Esercizio</h4>
          <input
            type="text"
            placeholder="Nome Esercizio"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          />
          <textarea
            placeholder="Spiegazione"
            value={newExerciseDetails.explanation}
            onChange={(e) => setNewExerciseDetails({ ...newExerciseDetails, explanation: e.target.value })}
            className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2 h-20 resize-none"
          />
          <input
            type="text"
            placeholder="Macchinario"
            value={newExerciseDetails.machine}
            onChange={(e) => setNewExerciseDetails({ ...newExerciseDetails, machine: e.target.value })}
            className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          />
          <input
            type="text"
            placeholder="Ripetizioni (es. 4x8)"
            value={newExerciseDetails.repetitions}
            onChange={(e) => setNewExerciseDetails({ ...newExerciseDetails, repetitions: e.target.value })}
            className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          />
          <input
            type="text"
            placeholder="Tempo di Recupero (es. 60s)"
            value={newExerciseDetails.recoveryTime}
            onChange={(e) => setNewExerciseDetails({ ...newExerciseDetails, recoveryTime: e.target.value })}
            className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
          />
          <button
            onClick={handleAddNewExercise}
            className="w-full p-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
          >
            <PlusCircle size={20} className="mr-2" /> Aggiungi alla Libreria
          </button>
        </div>

        {/* Sezione Cerca e Aggiungi Esistente */}
        <div className="flex items-center bg-gray-700 p-3 rounded-lg shadow-inner border border-gray-600 mb-4">
          <Search size={20} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Cerca esercizio nella libreria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Lista Esercizi Filtrati */}
        <div className="flex-grow overflow-y-auto space-y-3 p-2 bg-gray-700 rounded-lg border border-gray-600">
          {filteredExercises.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nessun esercizio trovato o nella libreria.</p>
          ) : (
            filteredExercises.map(exercise => (
              <div key={exercise.id} className="relative rounded-md overflow-hidden">
                {/* Area di eliminazione che appare con lo swipe */}
                <div
                  className="absolute inset-y-0 right-0 w-24 bg-red-600 flex items-center justify-end pr-4 text-white"
                  style={{ transform: `translateX(${Math.max(0, (swipePositions[exercise.id] || 0) + 80)}px)` }} // Mostra solo quando si trascina a sinistra
                >
                  <Trash2 size={24} />
                </div>
                {/* Contenuto dell'esercizio, trascinabile */}
                <div
                  className="relative z-10 bg-gray-600 p-3 rounded-md text-gray-200 transition-transform duration-200 ease-out"
                  style={{ transform: `translateX(${swipePositions[exercise.id] || 0}px)` }}
                  onTouchStart={(e) => handleTouchStart(e, exercise.id)}
                  onTouchMove={(e) => handleTouchMove(e, exercise.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, exercise.id, exercise.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <span className="font-semibold">{exercise.name}</span>
                      <p className="text-xs text-gray-400">{exercise.machine} - {exercise.repetitions}</p>
                    </div>
                    <button
                      onClick={() => onAddExerciseToDay(exercise.id)}
                      className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-200 text-sm flex items-center"
                    >
                      <PlusCircle size={16} className="mr-1" /> Aggiungi
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modale di Conferma Eliminazione */}
      {isConfirmModalOpen && (
        <ConfirmDeleteModal
          isOpen={isConfirmModalOpen}
          onClose={handleCancelDelete} // Se si chiude il modale senza confermare, è come annullare
          onConfirm={handleConfirmDelete}
          itemName={confirmModalExerciseName}
          message="Sei sicuro di voler eliminare questo esercizio dalla libreria? Questa azione è irreversibile."
        />
      )}
    </div>
  );
};

export default ExerciseLibraryModal;
