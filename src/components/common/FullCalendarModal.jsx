// src/components/common/FullCalendarModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Dumbbell, Coffee, Utensils, ShoppingBag, ArrowLeft } from 'lucide-react';
import { getDateKey } from '../../utils/dateHelpers';

const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const mealTypes = ['colazione', 'spuntinoMattutino', 'pranzo', 'spuntinoPomeridiano', 'cena'];
const mealLabels = {
  colazione: 'Colazione',
  spuntinoMattutino: 'Spuntino Mattutino',
  pranzo: 'Pranzo',
  spuntinoPomeridiano: 'Spuntino Pomeridiano',
  cena: 'Cena',
};

const formatFullDate = (date) => { // Questa funzione non è più necessaria qui, ma la lascio per completezza se usata altrove
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('it-IT', options);
};

const FullCalendarModal = ({ allWorkoutDataMap, dailyDietData, dailyShoppingData, onClose, initialDate }) => {
  // Calcola l'inizio della settimana basandosi sulla data iniziale passata
  const getMondayOfWeek = (date) => {
    const dayOfWeek = date.getDay(); // 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Se Domenica (0), sottrai 6 per Lunedì precedente
    const monday = new Date(date);
    monday.setDate(date.getDate() - daysToSubtract);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMondayOfWeek(initialDate || new Date()));

  // Aggiorna currentWeekStart se initialDate cambia (es. se il modale viene riaperto con una nuova data)
  useEffect(() => {
    setCurrentWeekStart(getMondayOfWeek(initialDate || new Date()));
  }, [initialDate]);

  // Chiave del giorno odierno per evidenziazione
  const todayKey = getDateKey(new Date());

  const generateWeekDays = (startDate) => {
    const weekDays = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const dateKey = getDateKey(currentDate);
      const workoutData = allWorkoutDataMap.get(dateKey) || { exercises: [], isRestDay: false, restDayNote: '' };
      const dietPlan = dailyDietData.get(dateKey);
      const shoppingList = dailyShoppingData.get(dateKey);

      weekDays.push({
        dateObject: new Date(currentDate),
        dateKey: dateKey,
        dayName: dayNames[currentDate.getDay()],
        fullDateFormatted: formatFullDate(currentDate),
        workout: workoutData,
        diet: dietPlan,
        shopping: shoppingList,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return weekDays;
  };

  const weekDays = generateWeekDays(currentWeekStart);

  const handlePrevWeek = () => {
    setCurrentWeekStart(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  // Stato per la visualizzazione dei dettagli del giorno
  const [selectedDayDetailKey, setSelectedDayDetailKey] = useState(null);

  // Trova il giorno completo dalla weekDays per la visualizzazione dettagliata
  const selectedDayData = weekDays.find(day => day.dateKey === selectedDayDetailKey);

  // Formatta le date di inizio e fine settimana per l'intestazione
  const weekStartFormatted = `${weekDays[0].dateObject.getDate()} ${monthNames[weekDays[0].dateObject.getMonth()]}`;
  const weekEndFormatted = `${weekDays[6].dateObject.getDate()} ${monthNames[weekDays[6].dateObject.getMonth()]}`;


  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 w-full max-w-md h-full max-h-[90vh] flex flex-col">
        {/* Header Modale */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-teal-300">
            {selectedDayDetailKey ? 'Dettagli Giorno' : 'Calendario Settimanale'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenuto Condizionale: Dettagli Giorno o Calendario Settimanale */}
        {selectedDayDetailKey && selectedDayData ? (
          // Vista Dettagli Giorno
          <div className="flex-grow flex flex-col">
            <button
              onClick={() => setSelectedDayDetailKey(null)} // Torna alla vista settimanale
              className="flex items-center text-teal-400 hover:text-teal-300 mb-4 self-start"
            >
              <ArrowLeft size={20} className="mr-2" /> Torna al Calendario
            </button>
            <h3 className="text-xl font-semibold text-teal-400 mb-4 text-center">
              {selectedDayData.dayName}, {selectedDayData.dateObject.getDate()} {monthNames[selectedDayData.dateObject.getMonth()]} {selectedDayData.dateObject.getFullYear()}
            </h3>

            {/* Dettagli Allenamento */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center">
                <Dumbbell size={20} className="mr-2" /> Allenamento
              </h4>
              {selectedDayData.workout.isRestDay ? (
                <>
                  <p className="text-gray-300 flex items-center mb-2"><Coffee size={18} className="mr-2 text-gray-400" /> Giorno di Riposo</p>
                  {selectedDayData.workout.restDayNote && (
                    <p className="text-gray-400 text-sm italic">Nota: {selectedDayData.workout.restDayNote}</p>
                  )}
                </>
              ) : selectedDayData.workout.exercises.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {selectedDayData.workout.exercises.map((exercise, idx) => (
                    <li key={idx}>
                      {exercise.name} - {exercise.repetitions} - {exercise.recoveryTime}
                      {exercise.sets && exercise.sets.length > 0 && (
                        <span className="text-xs text-gray-400 ml-2">({exercise.sets.length} serie)</span>
                      )}
                      {exercise.personalBest > 0 && (
                        <span className="text-xs text-yellow-400 ml-2">PB: {exercise.personalBest}kg</span>
                      )}
                      {exercise.totalVolume > 0 && (
                        <span className="text-xs text-green-400 ml-2">Vol: {exercise.totalVolume}kg</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Nessun allenamento registrato.</p>
              )}
            </div>

            {/* Dettagli Dieta */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center">
                <Utensils size={20} className="mr-2" /> Dieta
              </h4>
              {selectedDayData.diet && mealTypes.some(mealType => selectedDayData.diet[mealType] && selectedDayData.diet[mealType].length > 0) ? (
                mealTypes.map(mealType => (
                  <div key={mealType} className="mb-2 last:mb-0">
                    <p className="text-gray-200 font-medium capitalize">{mealLabels[mealType]}:</p>
                    <ul className="list-disc list-inside ml-4 text-gray-300 text-sm">
                      {selectedDayData.diet[mealType].map((item, idx) => (
                        <li key={idx}>{item.food} - {item.quantity} {item.unit}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Nessun piano alimentare registrato.</p>
              )}
            </div>

            {/* Dettagli Spesa */}
            <div className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600">
              <h4 className="text-lg font-semibold text-purple-400 mb-2 flex items-center">
                <ShoppingBag size={20} className="mr-2" /> Spesa
              </h4>
              {selectedDayData.shopping && selectedDayData.shopping.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {selectedDayData.shopping.map((item) => (
                    <li key={item.id} className={`${item.completed ? 'line-through text-gray-400' : ''}`}>
                      {item.text} {item.completed && '(Completato)'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Nessuna lista della spesa registrata.</p>
              )}
            </div>
          </div>
        ) : (
          // Vista Calendario Settimanale
          <>
            {/* Navigazione Settimana */}
            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-xl shadow-md border border-gray-600 mb-4">
              <button
                onClick={handlePrevWeek}
                className="p-2 rounded-full bg-gray-600 text-teal-400 hover:bg-gray-500 transition-colors duration-200"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-base font-semibold text-teal-400 text-center flex-grow mx-2">
                Settimana dal {weekStartFormatted} al {weekEndFormatted}
              </h3>
              <button
                onClick={handleNextWeek}
                className="p-2 rounded-full bg-gray-600 text-teal-400 hover:bg-gray-500 transition-colors duration-200"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Lista dei giorni della settimana */}
            <div className="flex-grow overflow-y-auto space-y-3 pb-4">
              {weekDays.map((day, index) => (
                <div
                  key={day.dateKey}
                  onClick={() => setSelectedDayDetailKey(day.dateKey)}
                  className={`p-4 rounded-lg shadow-md border cursor-pointer transition-all duration-200 ${
                    day.dateKey === todayKey ? 'bg-teal-800 border-teal-400 ring-2 ring-teal-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <h4 className={`text-lg font-semibold mb-2 ${day.dateKey === todayKey ? 'text-white' : 'text-teal-300'}`}>
                    {day.dayName.toUpperCase()} {day.dateObject.getDate()} {monthNames[day.dateObject.getMonth()].toUpperCase()}
                  </h4>
                  <div className="flex flex-col space-y-1 text-gray-200 text-sm">
                    {/* Informazioni Esercizi */}
                    <div className="flex items-center">
                      {day.workout.isRestDay ? (
                        <>
                          <Coffee size={18} className="text-gray-400 mr-2" />
                          <span>Giorno di Riposo {day.workout.restDayNote && `(${day.workout.restDayNote})`}</span>
                        </>
                      ) : (
                        day.workout.exercises.length > 0 ? (
                          <>
                            <Dumbbell size={18} className="text-teal-400 mr-2" />
                            <span>{day.workout.exercises.length} Esercizi</span>
                          </>
                        ) : (
                          <>
                            <Dumbbell size={18} className="text-gray-500 mr-2" />
                            <span>Nessun Esercizio</span>
                          </>
                        )
                      )}
                    </div>
                    {/* Informazioni Dieta */}
                    <div className="flex items-center">
                      <Utensils size={18} className={`${day.diet && mealTypes.some(mealType => day.diet[mealType] && day.diet[mealType].length > 0) ? 'text-yellow-400' : 'text-gray-500'} mr-2`} />
                      <span>{day.diet && mealTypes.some(mealType => day.diet[mealType] && day.diet[mealType].length > 0) ? 'Piano Alimentare Presente' : 'Nessun Piano Alimentare'}</span>
                    </div>
                    {/* Informazioni Spesa */}
                    <div className="flex items-center">
                      <ShoppingBag size={18} className={`${day.shopping && day.shopping.length > 0 ? 'text-purple-400' : 'text-gray-500'} mr-2`} />
                      <span>{day.shopping && day.shopping.length > 0 ? 'Lista Spesa Presente' : 'Nessuna Lista Spesa'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FullCalendarModal;
