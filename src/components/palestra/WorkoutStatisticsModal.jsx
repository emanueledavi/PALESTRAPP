// src/components/palestra/WorkoutStatisticsModal.jsx
import React from 'react';
import { X, TrendingUp, BarChart2 } from 'lucide-react';
// import { getDateKey } from '../../utils/dateHelpers'; // Rimosso: non utilizzato

const WorkoutStatisticsModal = ({ isOpen, onClose, allWorkoutDataMap }) => {
  if (!isOpen) return null;

  // Calcola le statistiche
  const totalWorkouts = allWorkoutDataMap.size;
  let totalExercises = 0;
  let totalVolume = 0;
  const personalBests = new Map(); // Map<exerciseName, maxKg>

  allWorkoutDataMap.forEach(dayData => {
    dayData.exercises.forEach(exercise => {
      totalExercises++;
      totalVolume += exercise.totalVolume || 0;

      // Aggiorna i personal bests
      if (exercise.personalBest && exercise.personalBest > (personalBests.get(exercise.name) || 0)) {
        personalBests.set(exercise.name, exercise.personalBest);
      }
    });
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 dark:bg-gray-100 p-6 rounded-2xl shadow-lg border border-gray-700 dark:border-gray-300 w-full max-w-md h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700 dark:border-gray-300">
          <h3 className="text-xl font-bold text-purple-300 dark:text-purple-600 flex items-center">
            <TrendingUp size={24} className="mr-2" /> Statistiche Allenamento
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 dark:bg-gray-200 text-gray-400 dark:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 text-gray-100 dark:text-gray-800">
          <div className="bg-gray-700 dark:bg-white p-4 rounded-lg shadow-inner border border-gray-600 dark:border-gray-300">
            <h4 className="text-lg font-semibold text-teal-400 dark:text-teal-600 mb-2">Riepilogo Generale</h4>
            <p>Allenamenti totali registrati: <span className="font-bold">{totalWorkouts}</span></p>
            <p>Esercizi totali eseguiti: <span className="font-bold">{totalExercises}</span></p>
            <p>Volume totale sollevato: <span className="font-bold">{totalVolume.toFixed(2)} kg</span></p>
          </div>

          <div className="bg-gray-700 dark:bg-white p-4 rounded-lg shadow-inner border border-gray-600 dark:border-gray-300">
            <h4 className="text-lg font-semibold text-blue-400 dark:text-blue-600 mb-2">Record Personali (PB)</h4>
            {personalBests.size === 0 ? (
              <p className="text-gray-400 dark:text-gray-700 italic">Nessun record personale registrato ancora.</p>
            ) : (
              <ul className="space-y-2">
                {Array.from(personalBests).map(([exerciseName, pb]) => (
                  <li key={exerciseName} className="flex justify-between items-center bg-gray-600 dark:bg-gray-200 p-2 rounded-md">
                    <span className="font-medium">{exerciseName}:</span>
                    <span className="font-bold text-yellow-400 dark:text-yellow-600">{pb} kg</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Puoi aggiungere grafici o altre statistiche qui */}
          <div className="bg-gray-700 dark:bg-white p-4 rounded-lg shadow-inner border border-gray-600 dark:border-gray-300">
            <h4 className="text-lg font-semibold text-orange-400 dark:text-orange-600 mb-2">Andamento del Volume (Esempio)</h4>
            <p className="text-gray-400 dark:text-gray-700 italic">
              Qui potresti visualizzare un grafico dell'andamento del volume nel tempo.
            </p>
            <div className="flex justify-center items-center h-32 bg-gray-600 dark:bg-gray-200 rounded-md mt-4">
              <BarChart2 size={48} className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutStatisticsModal;
