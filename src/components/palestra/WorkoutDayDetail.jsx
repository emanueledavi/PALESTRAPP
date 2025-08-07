// src/components/palestra/WorkoutDayDetail.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Dumbbell, Coffee, LayoutTemplate } from 'lucide-react';

const WorkoutDayDetail = ({
  day,
  updateDayData,
  onOpenAddExerciseModal,
  openInfoModal,
  exerciseLibrary,
  onApplyTemplate,
  workoutTemplates, // Riceve i template per la selezione
  currentDateKey,
}) => {
  const [exercisesWithSets, setExercisesWithSets] = useState(day.exercises);
  const [restDayNote, setRestDayNote] = useState(day.restDayNote || '');

  const [newSetInput, setNewSetInput] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    setExercisesWithSets(day.exercises);
    setRestDayNote(day.restDayNote || '');
    setNewSetInput({});
  }, [day]);

  const handleAddSet = (exerciseId) => {
    const kg = parseFloat(newSetInput[exerciseId]?.kg);
    const reps = parseFloat(newSetInput[exerciseId]?.reps);

    if (!isNaN(kg) && !isNaN(reps) && kg > 0 && reps > 0) {
      setExercisesWithSets(prevExercises => {
        const updatedExercises = prevExercises.map(ex => {
          if (ex.id === exerciseId) {
            const newSet = `${kg}kg x ${reps} reps`;
            const updatedSets = [...ex.sets, newSet];
            
            const currentSetVolume = kg * reps;
            let updatedTotalVolume = (ex.totalVolume || 0) + currentSetVolume; // Cambiato da const a let
            
            let updatedPersonalBest = ex.personalBest || 0;
            if (kg > updatedPersonalBest) {
                updatedPersonalBest = kg;
            }

            return {
              ...ex,
              sets: updatedSets,
              totalVolume: updatedTotalVolume,
              personalBest: updatedPersonalBest,
            };
          }
          return ex;
        });
        updateDayData({ ...day, exercises: updatedExercises, isRestDay: day.isRestDay, restDayNote: restDayNote });
        openInfoModal("Successo!", "Serie aggiunta e volume/PB aggiornati.", "success");
        return updatedExercises;
      });
      setNewSetInput(prev => ({ ...prev, [exerciseId]: { kg: '', reps: '' } }));
    } else {
      openInfoModal("Errore", "Inserisci valori validi per Kg e Ripetizioni.", "error");
    }
  };

  const handleRemoveSet = (exerciseId, setIndex) => {
    setExercisesWithSets(prevExercises => {
      const updatedExercises = prevExercises.map(ex => {
        if (ex.id === exerciseId) {
          const removedSetString = ex.sets[setIndex];
          const [kgStr, repsStr] = removedSetString.split('kg x ');
          const removedKg = parseFloat(kgStr);
          const removedReps = parseFloat(repsStr.replace(' reps', ''));

          const updatedSets = ex.sets.filter((_, idx) => idx !== setIndex);
          
          let updatedTotalVolume = (ex.totalVolume || 0) - (removedKg * removedReps); // Cambiato da const a let
          if (updatedTotalVolume < 0) updatedTotalVolume = 0;

          return { ...ex, sets: updatedSets, totalVolume: updatedTotalVolume };
        }
        return ex;
      });
      updateDayData({ ...day, exercises: updatedExercises, isRestDay: day.isRestDay, restDayNote: restDayNote });
      openInfoModal("Successo!", "Serie rimossa.", "success");
      return updatedExercises;
    });
  };

  const handleSetInputChange = (exerciseId, field, value) => {
    setNewSetInput(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const handleRemoveExercise = (exerciseId) => {
    setExercisesWithSets(prevExercises => {
      const updatedExercises = prevExercises.filter(ex => ex.id !== exerciseId);
      updateDayData({ ...day, exercises: updatedExercises, isRestDay: day.isRestDay, restDayNote: restDayNote });
      openInfoModal("Successo!", "Esercizio eliminato con successo.", "success");
      return updatedExercises;
    });
  };

  const handleToggleRestDay = () => {
    const newRestDayStatus = !day.isRestDay;
    updateDayData({
      ...day,
      isRestDay: newRestDayStatus,
      exercises: newRestDayStatus ? [] : exercisesWithSets,
      restDayNote: newRestDayStatus ? restDayNote : day.restDayNote || '',
    });
    if (newRestDayStatus) {
      openInfoModal("Info", "Giorno impostato come giorno di riposo.", "info");
    } else {
      openInfoModal("Info", "Giorno rimosso dal giorno di riposo.", "info");
    }
  };

  const handleApplySelectedTemplate = () => {
    const safeWorkoutTemplates = workoutTemplates instanceof Map ? workoutTemplates : new Map(); // Assicurati che sia una Map
    if (selectedTemplate && onApplyTemplate && safeWorkoutTemplates.has(selectedTemplate)) {
      onApplyTemplate(selectedTemplate);
      setSelectedTemplate('');
    } else if (!selectedTemplate) {
      openInfoModal("Attenzione", "Seleziona un template per applicarlo.", "info");
    } else {
      openInfoModal("Errore", "Template selezionato non trovato.", "error");
    }
  };

  // Aggiunto un controllo difensivo per workoutTemplates
  const safeWorkoutTemplates = workoutTemplates instanceof Map ? workoutTemplates : new Map();

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-teal-300 dark:text-teal-600 flex-grow text-center">
          {day.fullDate} - Dettaglio Allenamento
        </h2>
      </div>

      <button
        onClick={handleToggleRestDay}
        className={`w-full p-3 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center ${
          day.isRestDay ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        <Coffee size={24} className="mr-2" />
        {day.isRestDay ? 'Togli Giorno di Riposo' : 'Imposta come Giorno di Riposo'}
      </button>

      {day.isRestDay ? (
        <div className="bg-gray-700 dark:bg-gray-100 p-5 rounded-2xl shadow-md border border-gray-600 dark:border-gray-300 text-center py-10">
          <Coffee size={48} className="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 dark:text-gray-700 text-xl font-semibold">Giorno di Riposo</p>
          <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">Goditi il tuo relax e recupera le energie!</p>
          <textarea
            placeholder="Aggiungi una nota per il giorno di riposo (es. Yoga, Massaggio)"
            value={restDayNote}
            onChange={(e) => {
              setRestDayNote(e.target.value);
              updateDayData({ ...day, isRestDay: true, exercises: [], restDayNote: e.target.value });
            }}
            className="w-full p-3 mt-4 bg-gray-800 dark:bg-white text-gray-100 dark:text-gray-900 border border-gray-600 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      ) : (
        <>
          {safeWorkoutTemplates.size > 0 && (
            <div className="flex items-center space-x-2 mt-6 mb-4">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="flex-grow p-3 bg-gray-800 dark:bg-white text-gray-100 dark:text-gray-900 border border-gray-600 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-700"
              >
                <option value="">Seleziona un Template</option>
                {Array.from(safeWorkoutTemplates.keys()).map(templateName => (
                  <option key={templateName} value={templateName}>{templateName}</option>
                ))}
              </select>
              <button
                onClick={handleApplySelectedTemplate}
                className="p-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 flex items-center justify-center"
              >
                <LayoutTemplate size={20} /> Applica
              </button>
            </div>
          )}

          <button
            onClick={onOpenAddExerciseModal}
            className="w-full p-3 bg-teal-600 dark:bg-teal-700 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center mt-6"
          >
            <PlusCircle size={24} className="mr-2" /> Aggiungi Esercizio
          </button>

          <div className="space-y-4 mt-6">
            {exercisesWithSets.length === 0 ? (
              <div className="bg-gray-700 dark:bg-gray-100 p-5 rounded-2xl shadow-md border border-gray-600 dark:border-gray-300 text-center py-10">
                <Dumbbell size={48} className="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 dark:text-gray-700 text-xl font-semibold">Nessun Esercizio per Oggi</p>
                <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">Clicca "Aggiungi Esercizio" per iniziare!</p>
              </div>
            ) : (
              exercisesWithSets.map((exercise) => (
                <div key={exercise.id} className="bg-gray-700 dark:bg-gray-100 p-5 rounded-2xl shadow-md border border-gray-600 dark:border-gray-300">
                  <h3 className="text-xl font-semibold text-teal-400 dark:text-teal-600 mb-2">{exercise.name}</h3>
                  <p className="text-gray-300 dark:text-gray-700 mb-1 text-sm">Spiegazione: {exercise.explanation}</p>
                  <p className="text-gray-300 dark:text-gray-700 mb-1 text-sm">Macchinario: {exercise.machine}</p>
                  <p className="text-gray-300 dark:text-gray-700 mb-1 text-sm">Ripetizioni: {exercise.repetitions}</p>
                  <p className="text-gray-300 dark:text-gray-700 mb-3 text-sm">Recupero: {exercise.recoveryTime}</p>
                  {exercise.personalBest > 0 && (
                    <p className="text-yellow-400 dark:text-yellow-600 mb-3 text-sm font-semibold">Record Personale (PB): {exercise.personalBest}kg</p>
                  )}
                  {exercise.totalVolume > 0 && (
                    <p className="text-green-400 dark:text-green-600 mb-3 text-sm font-semibold">Volume Totale: {exercise.totalVolume}kg</p>
                  )}

                  <div className="flex items-center mb-3 space-x-2">
                    <input
                      type="number"
                      placeholder="Kg"
                      value={newSetInput[exercise.id]?.kg || ''}
                      onChange={(e) => handleSetInputChange(exercise.id, 'kg', e.target.value)}
                      className="w-1/2 p-3 bg-gray-800 dark:bg-white text-gray-100 dark:text-gray-900 border border-gray-600 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={newSetInput[exercise.id]?.reps || ''}
                      onChange={(e) => handleSetInputChange(exercise.id, 'reps', e.target.value)}
                      className="w-1/2 p-3 bg-gray-800 dark:bg-white text-gray-100 dark:text-gray-900 border border-gray-600 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => handleAddSet(exercise.id)}
                      className="ml-3 p-3 bg-teal-600 dark:bg-teal-700 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>

                  <div className="mt-4 border-t border-gray-600 dark:border-gray-300 pt-3">
                      <p className="text-gray-400 dark:text-gray-700 text-sm mb-2">Serie Registrate:</p>
                      {exercise.sets.length > 0 ? (
                        <ul className="space-y-2">
                          {exercise.sets.map((set, setIdx) => (
                            <li key={setIdx} className="flex items-center justify-between bg-gray-600 dark:bg-gray-200 p-2 rounded-md text-gray-200 dark:text-gray-800">
                              <span>{set}</span>
                              <button
                                onClick={() => handleRemoveSet(exercise.id, setIdx)}
                                className="ml-2 text-red-400 dark:text-red-600 hover:text-red-600 transition-colors duration-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-600 text-sm italic">Nessuna serie registrata per questo esercizio.</p>
                      )}
                    </div>

                  <button
                    onClick={() => handleRemoveExercise(exercise.id)}
                    className="w-full mt-4 p-3 bg-red-600 dark:bg-red-700 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Trash2 size={24} className="mr-2" /> Elimina Esercizio
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkoutDayDetail;
