// src/App.jsx
import React, { useState, useEffect } from 'react';
// import TabButton from './components/common/TabButton';
import Footer from './components/common/Footer'; // <--- IMPORTAZIONE AGGIUNTA
import PalestraSection from './components/palestra/PalestraSection';
import DietaSection from './components/dieta/DietaSection';
import SpesaSection from './components/spesa/SpesaSection';
import FullCalendarModal from './components/common/FullCalendarModal';
import AddExerciseModal from './components/palestra/AddExerciseModal';
import InfoModal from './components/common/InfoModal';
import WorkoutTemplateModal from './components/palestra/WorkoutTemplateModal';
import ExerciseLibraryModal from './components/palestra/ExerciseLibraryModal';
import WorkoutStatisticsModal from './components/palestra/WorkoutStatisticsModal';
import SettingsSection from './components/settings/SettingsSection';
import { CalendarDays } from 'lucide-react';
import { getDateKey } from './utils/dateHelpers';

const App = () => {
  const [activeTab, setActiveTab] = useState('palestra');
  
  // DEBUG: Log dell'activeTab ogni volta che cambia
  useEffect(() => {
    console.log("Active Tab changed to:", activeTab);
  }, [activeTab]);

  // Stato per il modale del calendario
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarInitialDate, setCalendarInitialDate] = useState(new Date());

  // Stato per il modale di aggiunta esercizio
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [exerciseModalDateKey, setExerciseModalDateKey] = useState(null);

  // Stato per il modale informativo generico
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTitle, setInfoModalTitle] = useState('');
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [infoModalType, setInfoModalType] = useState('info');

  // Nuovi stati per le funzionalità avanzate della palestra
  const [isWorkoutTemplateModalOpen, setIsWorkoutTemplateModalOpen] = useState(false);
  const [isExerciseLibraryModalOpen, setIsExerciseLibraryModalOpen] = useState(false);
  const [isWorkoutStatisticsModalOpen, setIsWorkoutStatisticsModalOpen] = useState(false);

  // Stato centralizzato per tutti i dati degli allenamenti (Map<dateKey, {exercises: [], isRestDay: boolean, restDayNote: string}>)
  const [allWorkoutDataMap, setAllWorkoutDataMap] = useState(new Map());
  // Stato centralizzato per tutti i dati della dieta (Map<dateKey, DailyDietPlanObject>)
  const [allDietDataMap, setAllDietDataMap] = useState(new Map());
  // Stato centralizzato per tutti i dati della spesa (Map<dateKey, Array<{id, text, completed}>>)
  const [allShoppingDataMap, setAllShoppingDataMap] = useState(new Map());

  // Stato per i template di allenamento (Map<templateName, Array<exercise>>)
  const [workoutTemplates, setWorkoutTemplates] = useState(new Map());
  // Stato per la libreria di esercizi (Map<exerciseId, exerciseObject>)
  const [exerciseLibrary, setExerciseLibrary] = useState(() => {
    // Popola la libreria con alcuni esercizi di esempio all'avvio
    const initialLibrary = new Map();
    const exercises = [
      { id: 'ex1', name: 'Panca Piana', explanation: 'Esercizio fondamentale per il petto.', machine: 'Bilanciere', repetitions: '4x8', recoveryTime: '90s', sets: [], personalBest: 0, totalVolume: 0 },
      { id: 'ex2', name: 'Squat', explanation: 'Esercizio fondamentale per le gambe.', machine: 'Bilanciere', repetitions: '3x10', recoveryTime: '120s', sets: [], personalBest: 0, totalVolume: 0 },
      { id: 'ex3', name: 'Trazioni', explanation: 'Esercizio per la schiena.', machine: 'Corpo Libero', repetitions: '3xMax', recoveryTime: '60s', sets: [], personalBest: 0, totalVolume: 0 },
      { id: 'ex4', name: 'Military Press', explanation: 'Esercizio per le spalle.', machine: 'Bilanciere', repetitions: '4x6', recoveryTime: '90s', sets: [], personalBest: 0, totalVolume: 0 },
      { id: 'ex5', name: 'Curl Bicipiti', explanation: 'Esercizio di isolamento per i bicipiti.', machine: 'Manubri', repetitions: '3x12', recoveryTime: '60s', sets: [], personalBest: 0, totalVolume: 0 },
    ];
    exercises.forEach(ex => initialLibrary.set(ex.id, ex));
    return initialLibrary;
  });

  // Funzione per aprire il modale del calendario con una data specifica
  const handleOpenCalendarModal = (date) => {
    setCalendarInitialDate(date);
    setIsCalendarModalOpen(true);
  };

  // Funzione per aprire il modale di aggiunta esercizio
  const handleOpenAddExerciseModal = (dateKey) => {
    const formattedDateKey = getDateKey(new Date(dateKey)); 
    setExerciseModalDateKey(formattedDateKey);
    setIsAddExerciseModalOpen(true);
  };

  // Funzione per salvare il nuovo esercizio (chiamata dal modale)
  const handleSaveNewExercise = (newExerciseData) => {
    const newExercise = {
      id: Date.now().toString(),
      name: newExerciseData.name.trim(),
      explanation: newExerciseData.explanation.trim(),
      machine: newExerciseData.machine.trim(),
      repetitions: newExerciseData.repetitions.trim(),
      recoveryTime: newExerciseData.recoveryTime.trim(),
      sets: [],
      personalBest: 0,
      totalVolume: 0,
    };

    setAllWorkoutDataMap(prevMap => {
      const newMap = new Map(prevMap);
      const currentDayWorkout = newMap.get(exerciseModalDateKey) || { exercises: [], isRestDay: false, restDayNote: '' };
      const updatedExercises = [...currentDayWorkout.exercises, newExercise];
      newMap.set(exerciseModalDateKey, { ...currentDayWorkout, exercises: updatedExercises });
      return newMap;
    });

    setExerciseLibrary(prevLibrary => {
      const newLibrary = new Map(prevLibrary);
      if (!newLibrary.has(newExercise.id)) {
        newLibrary.set(newExercise.id, newExercise);
      }
      return newLibrary;
    });

    setIsAddExerciseModalOpen(false);
    setExerciseModalDateKey(null);
    openInfoModal("Successo!", "Esercizio aggiunto con successo.", "success");
  };

  // Funzione per aprire il modale informativo generico
  const openInfoModal = (title, message, type = 'info') => {
    setInfoModalTitle(title);
    setInfoModalMessage(message);
    setInfoModalType(type);
    setIsInfoModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'palestra':
        return <PalestraSection
          allWorkoutDataMap={allWorkoutDataMap}
          setAllWorkoutDataMap={setAllWorkoutDataMap}
          onOpenAddExerciseModal={handleOpenAddExerciseModal}
          onOpenCalendarModal={handleOpenCalendarModal}
          openInfoModal={openInfoModal}
          workoutTemplates={workoutTemplates}
          setWorkoutTemplates={setWorkoutTemplates}
          exerciseLibrary={exerciseLibrary}
          setExerciseLibrary={setExerciseLibrary}
          setIsWorkoutTemplateModalOpen={setIsWorkoutTemplateModalOpen}
          setIsExerciseLibraryModalOpen={setIsExerciseLibraryModalOpen}
          setIsWorkoutStatisticsModalOpen={setIsWorkoutStatisticsModalOpen}
          exerciseModalDateKey={exerciseModalDateKey}
        />;
      case 'dieta':
        return <DietaSection
          allDietDataMap={allDietDataMap}
          setAllDietDataMap={setAllDietDataMap}
          onOpenCalendarModal={handleOpenCalendarModal}
          openInfoModal={openInfoModal}
        />;
      case 'spesa':
        return <SpesaSection
          allShoppingDataMap={allShoppingDataMap}
          setAllShoppingDataMap={setAllShoppingDataMap}
          allDietDataMap={allDietDataMap}
          openInfoModal={openInfoModal}
        />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <PalestraSection
          allWorkoutDataMap={allWorkoutDataMap}
          setAllWorkoutDataMap={setAllWorkoutDataMap}
          onOpenAddExerciseModal={handleOpenAddExerciseModal}
          onOpenCalendarModal={handleOpenCalendarModal}
          openInfoModal={openInfoModal}
          setWorkoutTemplates={setWorkoutTemplates}
          exerciseLibrary={exerciseLibrary}
          setExerciseLibrary={setExerciseLibrary}
          setIsWorkoutTemplateModalOpen={setIsWorkoutTemplateModalOpen}
          setIsExerciseLibraryModalOpen={setIsExerciseLibraryModalOpen}
          setIsWorkoutStatisticsModalOpen={setIsWorkoutStatisticsModalOpen}
          exerciseModalDateKey={exerciseModalDateKey}
        />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-inter antialiased p-4 sm:p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-3xl shadow-2xl shadow-teal-500/30 flex flex-col h-[calc(100vh-32px)] sm:h-[calc(100vh-48px)] border border-gray-700">
        <header className="flex-none bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-4 rounded-t-2xl shadow-lg shadow-teal-500/20">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-wide text-center flex-grow">La Mia Palestra Web</h1>
            <button
              onClick={() => handleOpenCalendarModal(new Date())}
              className="p-2 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-colors duration-200 ml-4"
              aria-label="Apri Calendario"
            >
              <CalendarDays size={20} />
            </button>
          </div>
        </header>

        <main className="flex-grow p-4 overflow-y-auto bg-gray-800 text-gray-100 pb-24">
          {renderContent()}
        </main>

        {/* La barra di navigazione in linea è stata rimossa per fare spazio al componente Footer. */}
        {/* Usa il componente `Footer` con le prop `activeTab` e `onTabChange` corrette */}
        <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Modale Calendario */}
      {isCalendarModalOpen && (
        <FullCalendarModal
          initialDate={calendarInitialDate}
          allWorkoutDataMap={allWorkoutDataMap}
          dailyDietData={allDietDataMap}
          dailyShoppingData={allShoppingDataMap}
          onClose={() => setIsCalendarModalOpen(false)}
        />
      )}

      {/* Modale Aggiungi Esercizio */}
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        onClose={() => setIsAddExerciseModalOpen(false)}
        onSave={handleSaveNewExercise}
        openInfoModal={openInfoModal}
      />

      {/* Modale Gestione Template Allenamento */}
      {isWorkoutTemplateModalOpen && (
        <WorkoutTemplateModal
          isOpen={isWorkoutTemplateModalOpen}
          onClose={() => setIsWorkoutTemplateModalOpen(false)}
          workoutTemplates={workoutTemplates}
          setWorkoutTemplates={setWorkoutTemplates}
          openInfoModal={openInfoModal}
          exerciseLibrary={exerciseLibrary}
          // Corretto: ho pulito la funzione inline
          onAddExerciseToDay={(exerciseId) => {
            const exerciseToAdd = exerciseLibrary.get(exerciseId);
            if (exerciseToAdd) {
              setAllWorkoutDataMap(prevMap => {
                const newMap = new Map(prevMap);
                const currentDayWorkout = newMap.get(exerciseModalDateKey) || { exercises: [], isRestDay: false, restDayNote: '' };
                const updatedExercises = [...currentDayWorkout.exercises, { ...exerciseToAdd, id: Date.now().toString() + Math.random().toString(), sets: [] }];
                newMap.set(exerciseModalDateKey, { ...currentDayWorkout, exercises: updatedExercises });
                return newMap;
              });
              openInfoModal("Successo!", `Esercizio '${exerciseToAdd.name}' aggiunto al giorno.`, "success");
              setIsWorkoutTemplateModalOpen(false); // Chiudi la modale del template
            }
          }}
        />
      )}

      {/* Modale Libreria Esercizi */}
      {isExerciseLibraryModalOpen && (
        <ExerciseLibraryModal
          isOpen={isExerciseLibraryModalOpen}
          onClose={() => setIsExerciseLibraryModalOpen(false)}
          exerciseLibrary={exerciseLibrary}
          setExerciseLibrary={setExerciseLibrary}
          openInfoModal={openInfoModal}
          // Corretto: ho pulito la funzione inline
          onAddExerciseToDay={(exerciseId) => {
            const exerciseToAdd = exerciseLibrary.get(exerciseId);
            if (exerciseToAdd) {
              setAllWorkoutDataMap(prevMap => {
                const newMap = new Map(prevMap);
                const currentDayWorkout = newMap.get(exerciseModalDateKey) || { exercises: [], isRestDay: false, restDayNote: '' };
                const updatedExercises = [...currentDayWorkout.exercises, { ...exerciseToAdd, id: Date.now().toString() + Math.random().toString(), sets: [] }];
                newMap.set(exerciseModalDateKey, { ...currentDayWorkout, exercises: updatedExercises });
                return newMap;
              });
              openInfoModal("Successo!", `Esercizio '${exerciseToAdd.name}' aggiunto al giorno.`, "success");
              setIsExerciseLibraryModalOpen(false); // Chiudi la modale della libreria
            }
          }}
        />
      )}

      {/* Modale Statistiche Allenamento */}
      {isWorkoutStatisticsModalOpen && (
        <WorkoutStatisticsModal
          isOpen={isWorkoutStatisticsModalOpen}
          onClose={() => setIsWorkoutStatisticsModalOpen(false)}
          allWorkoutDataMap={allWorkoutDataMap}
        />
      )}

      {/* Modale Informativo Generico */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={infoModalTitle}
        message={infoModalMessage}
        type={infoModalType}
      />
    </div>
  );
};

export default App;
