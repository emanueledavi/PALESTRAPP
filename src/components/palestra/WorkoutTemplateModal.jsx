// src/components/palestra/WorkoutTemplateModal.jsx
import React, { useState } from 'react';
import { X, PlusCircle, Save, Trash2, LayoutTemplate, Edit } from 'lucide-react';

const WorkoutTemplateModal = ({ isOpen, onClose, workoutTemplates, setWorkoutTemplates, openInfoModal, exerciseLibrary }) => {
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [editingTemplateName, setEditingTemplateName] = useState(null); // Stato per il nome del template in modifica
  // Rimosso: [editingTemplateExercises, setEditingTemplateExercises] = useState([]); // Stato per gli esercizi del template in modifica

  if (!isOpen) return null;

  const handleAddTemplate = () => {
    if (newTemplateName.trim() === '') {
      openInfoModal("Errore", "Il nome del template non può essere vuoto.", "error");
      return;
    }
    if (selectedExercises.length === 0) {
      openInfoModal("Attenzione", "Seleziona almeno un esercizio per il template.", "info");
      return;
    }

    setWorkoutTemplates(prevTemplates => {
      const newTemplates = new Map(prevTemplates);
      if (newTemplates.has(newTemplateName.trim())) {
        openInfoModal("Attenzione", "Un template con questo nome esiste già.", "info");
        return prevTemplates;
      }
      // Crea copie profonde degli esercizi per evitare riferimenti diretti
      const exercisesToSave = selectedExercises.map(exId => {
        const exercise = exerciseLibrary.get(exId);
        return exercise ? { ...exercise, id: Date.now().toString() + Math.random().toString(), sets: [] } : null;
      }).filter(Boolean); // Filtra eventuali null se un esercizio non è stato trovato

      newTemplates.set(newTemplateName.trim(), exercisesToSave);
      return newTemplates;
    });
    openInfoModal("Successo!", `Template '${newTemplateName}' salvato.`, "success");
    setNewTemplateName('');
    setSelectedExercises([]);
  };

  const handleDeleteTemplate = (templateName) => {
    setWorkoutTemplates(prevTemplates => {
      const newTemplates = new Map(prevTemplates);
      newTemplates.delete(templateName);
      return newTemplates;
    });
    openInfoModal("Successo!", `Template '${templateName}' eliminato.`, "success");
    // Se si sta modificando il template eliminato, resetta lo stato di modifica
    if (editingTemplateName === templateName) {
      setEditingTemplateName(null);
      // setEditingTemplateExercises([]); // Rimosso
    }
  };

  const handleEditTemplate = (templateName) => {
    setEditingTemplateName(templateName);
    const templateExercises = workoutTemplates.get(templateName) || [];
    // Imposta gli esercizi del template in modifica come ID per la selezione
    setSelectedExercises(templateExercises.map(ex => ex.id));
    // setEditingTemplateExercises(templateExercises); // Rimosso
    setNewTemplateName(templateName); // Prepopola il nome nel campo di input
  };

  const handleSaveEditedTemplate = () => {
    if (newTemplateName.trim() === '') {
      openInfoModal("Errore", "Il nome del template non può essere vuoto.", "error");
      return;
    }
    if (selectedExercises.length === 0) {
      openInfoModal("Attenzione", "Seleziona almeno un esercizio per il template.", "info");
      return;
    }

    setWorkoutTemplates(prevTemplates => {
      const newTemplates = new Map(prevTemplates);
      // Se il nome è cambiato e il nuovo nome esiste già, o se il nome è lo stesso ma è un altro template
      if (newTemplateName.trim() !== editingTemplateName && newTemplates.has(newTemplateName.trim())) {
        openInfoModal("Attenzione", "Un template con il nuovo nome esiste già.", "info");
        return prevTemplates;
      }

      // Elimina il vecchio template se il nome è cambiato
      if (editingTemplateName && editingTemplateName !== newTemplateName.trim()) {
        newTemplates.delete(editingTemplateName);
      }
      
      const exercisesToSave = selectedExercises.map(exId => {
        const exercise = exerciseLibrary.get(exId);
        return exercise ? { ...exercise, id: Date.now().toString() + Math.random().toString(), sets: [] } : null;
      }).filter(Boolean);

      newTemplates.set(newTemplateName.trim(), exercisesToSave);
      return newTemplates;
    });
    openInfoModal("Successo!", `Template '${newTemplateName}' aggiornato.`, "success");
    setEditingTemplateName(null);
    // setEditingTemplateExercises([]); // Rimosso
    setNewTemplateName('');
    setSelectedExercises([]);
  };

  const handleCancelEdit = () => {
    setEditingTemplateName(null);
    // setEditingTemplateExercises([]); // Rimosso
    setNewTemplateName('');
    setSelectedExercises([]);
  };

  const handleExerciseSelectionChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedExercises(value);
  };

  // Assicurati che exerciseLibrary sia una Map valida
  const safeExerciseLibrary = exerciseLibrary instanceof Map ? exerciseLibrary : new Map();
  const availableExercises = Array.from(safeExerciseLibrary.values());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 dark:bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-700 dark:border-gray-300 w-full max-w-md h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700 dark:border-gray-300">
          <h3 className="text-xl font-bold text-purple-300 dark:text-purple-600 flex items-center">
            <LayoutTemplate size={24} className="mr-2" /> Gestione Template Allenamento
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 dark:bg-gray-200 text-gray-400 dark:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form per Aggiungere/Modificare Template */}
        <div className="bg-gray-700 dark:bg-white p-4 rounded-lg shadow-inner border border-gray-600 dark:border-gray-300 mb-4">
          <h4 className="text-lg font-semibold text-purple-400 dark:text-purple-600 mb-3">
            {editingTemplateName ? `Modifica Template: ${editingTemplateName}` : 'Crea Nuovo Template'}
          </h4>
          <input
            type="text"
            placeholder="Nome Template"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            className="w-full p-3 bg-gray-900 dark:bg-gray-200 text-gray-100 dark:text-gray-900 border border-gray-700 dark:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          />
          <select
            multiple
            value={selectedExercises}
            onChange={handleExerciseSelectionChange}
            className="w-full p-3 bg-gray-900 dark:bg-gray-200 text-gray-100 dark:text-gray-900 border border-gray-700 dark:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 overflow-y-auto mb-3"
          >
            {availableExercises.length === 0 ? (
              <option disabled>Nessun esercizio disponibile nella libreria.</option>
            ) : (
              availableExercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} ({exercise.machine})
                </option>
              ))
            )}
          </select>
          
          {editingTemplateName ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEditedTemplate}
                className="flex-grow p-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Save size={20} className="mr-2" /> Salva Modifiche
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-grow p-3 bg-gray-600 dark:bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
              >
                <X size={20} className="mr-2" /> Annulla
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddTemplate}
              className="w-full p-3 bg-purple-600 dark:bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
            >
              <PlusCircle size={20} className="mr-2" /> Salva Nuovo Template
            </button>
          )}
        </div>

        {/* Lista Template Esistenti */}
        <div className="flex-grow overflow-y-auto space-y-3 p-2 bg-gray-700 dark:bg-gray-50 rounded-lg border border-gray-600 dark:border-gray-300">
          {workoutTemplates.size === 0 ? (
            <p className="text-gray-400 dark:text-gray-700 text-center py-4">Nessun template salvato.</p>
          ) : (
            Array.from(workoutTemplates.keys()).map(templateName => (
              <div key={templateName} className="bg-gray-600 dark:bg-gray-200 p-3 rounded-md text-gray-200 dark:text-gray-800 flex items-center justify-between">
                <span className="font-semibold">{templateName}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTemplate(templateName)}
                    className="p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(templateName)}
                    className="p-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTemplateModal;
