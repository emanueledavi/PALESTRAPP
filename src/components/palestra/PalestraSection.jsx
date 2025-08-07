// src/components/palestra/PalestraSection.jsx
import React, { useState } from 'react';
import WorkoutDayDetail from './WorkoutDayDetail';
import { ChevronLeft, ChevronRight, LayoutTemplate, BookOpen, BarChart2 } from 'lucide-react'; // Nuove icone
import { getDateKey, formatFullDate } from '../../utils/dateHelpers';

const PalestraSection = ({
  allWorkoutDataMap,
  setAllWorkoutDataMap,
  onOpenAddExerciseModal,
  onOpenCalendarModal,
  openInfoModal,
  workoutTemplates,
  setWorkoutTemplates,
  exerciseLibrary,
  setExerciseLibrary,
  setIsWorkoutTemplateModalOpen,
  setIsExerciseLibraryModalOpen,
  setIsWorkoutStatisticsModalOpen,
  exerciseModalDateKey, // Riceve exerciseModalDateKey
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Ottieni i dati per il giorno selezionato dalla mappa globale
  const currentDayData = allWorkoutDataMap.get(getDateKey(selectedDate)) || {
    exercises: [],
    isRestDay: false,
    restDayNote: '', // Inizializza la nota per il giorno di riposo
  };

  // Funzione per aggiornare i dati di un giorno specifico nella mappa globale
  const updateDayData = (updatedData) => {
    setAllWorkoutDataMap(prevMap => {
      const newMap = new Map(prevMap);
      const dateKey = getDateKey(selectedDate);
      
      // Logica aggiornata per la gestione del giorno di riposo
      if (updatedData.isRestDay) {
        // Se è un giorno di riposo, lo impostiamo sempre nella mappa.
        // Non lo eliminiamo, anche se non ci sono esercizi o note.
        newMap.set(dateKey, updatedData);
      } else {
        // Se NON è un giorno di riposo, verifichiamo se è completamente vuoto.
        const isEmptyDay = updatedData.exercises.length === 0 && !updatedData.restDayNote;
        if (isEmptyDay) {
          // Se non è un giorno di riposo E non ha esercizi E non ha note, allora lo eliminiamo.
          newMap.delete(dateKey);
        } else {
          // Altrimenti, impostiamo/aggiorniamo i dati del giorno.
          newMap.set(dateKey, updatedData);
        }
      }
      return newMap;
    });
  };

  const handlePrevDay = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  // Funzione per applicare un template al giorno corrente
  const handleApplyTemplate = (templateName) => {
    const template = workoutTemplates.get(templateName);
    if (template) {
      setAllWorkoutDataMap(prevMap => {
        const newMap = new Map(prevMap);
        const dateKey = getDateKey(selectedDate);
        const currentDayWorkout = newMap.get(dateKey) || { exercises: [], isRestDay: false, restDayNote: '' };
        
        // Aggiungi gli esercizi del template, creando nuove istanze con ID univoci
        const exercisesFromTemplate = template.map(ex => ({
          ...ex,
          id: Date.now().toString() + Math.random().toString(), // Nuovo ID per ogni istanza
          sets: [], // Le serie ripartono da zero per il nuovo giorno
          personalBest: ex.personalBest || 0, // Mantieni il PB del template o inizializza
          totalVolume: 0, // Il volume riparte da zero
        }));

        newMap.set(dateKey, {
          ...currentDayWorkout,
          exercises: [...currentDayWorkout.exercises, ...exercisesFromTemplate],
          isRestDay: false, // Se applichi un template, non è un giorno di riposo
          restDayNote: '',
        });
        return newMap;
      });
      openInfoModal("Successo!", `Template '${templateName}' applicato al giorno.`, "success");
    } else {
      openInfoModal("Errore", `Template '${templateName}' non trovato.`, "error");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-teal-300 mb-4 text-center">Il Tuo Allenamento</h2>

      {/* Navigazione Data */}
      <div className="flex justify-between items-center bg-gray-700 p-3 rounded-xl shadow-md border border-gray-600 mb-4">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-full bg-gray-600 text-teal-400 hover:bg-gray-500 transition-colors duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <h3
          className="text-base font-semibold text-teal-400 text-center flex-grow mx-2 cursor-pointer"
          onClick={() => onOpenCalendarModal(selectedDate)}
        >
          {formatFullDate(selectedDate)}
        </h3>
        <button
          onClick={handleNextDay}
          className="p-2 rounded-full bg-gray-600 text-teal-400 hover:bg-gray-500 transition-colors duration-200"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Pulsanti per le nuove funzionalità */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setIsWorkoutTemplateModalOpen(true)}
          className="p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center text-sm"
        >
          <LayoutTemplate size={20} className="mr-2" /> Gestisci Template
        </button>
        <button
          onClick={() => setIsExerciseLibraryModalOpen(true)}
          className="p-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center text-sm"
        >
          <BookOpen size={20} className="mr-2" /> Libreria Esercizi
        </button>
        <button
          onClick={() => setIsWorkoutStatisticsModalOpen(true)}
          className="col-span-2 p-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center text-sm"
        >
          <BarChart2 size={20} className="mr-2" /> Visualizza Statistiche
        </button>
      </div>

      {/* Dettaglio del giorno di allenamento */}
      <WorkoutDayDetail
        day={{ ...currentDayData, fullDate: formatFullDate(selectedDate) }}
        updateDayData={updateDayData}
        onOpenAddExerciseModal={() => onOpenAddExerciseModal(getDateKey(selectedDate))}
        openInfoModal={openInfoModal}
        exerciseLibrary={exerciseLibrary} // Passa la libreria a WorkoutDayDetail
        onApplyTemplate={handleApplyTemplate} // Passa la funzione per applicare template
        workoutTemplates={workoutTemplates} // Passa i template per la selezione
        currentDateKey={getDateKey(selectedDate)} // Passa la chiave della data corrente
      />

      {/* Consigli Generali (rimangono statici) */}
      <div className="bg-gray-700 p-5 rounded-2xl shadow-md border border-gray-600">
        <h3 className="text-xl font-semibold text-orange-400 mb-3">Consigli per l'Allenamento</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-200">
          <li>Riscaldamento di 5-10 minuti prima di ogni sessione.</li>
          <li>Mantieni una forma corretta per prevenire inforturi.</li>
          <li>Idratati adeguatamente durante e dopo l'allenamento.</li>
          <li>Ascolta il tuo corpo e concediti giorni di riposo.</li>
        </ul>
      </div>
    </div>
  );
};

export default PalestraSection;
