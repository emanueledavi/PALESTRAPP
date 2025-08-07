// src/components/dieta/DietaSection.jsx
import React, { useState, useEffect } from 'react';
import { Utensils, ChevronLeft, ChevronRight, Save, PlusCircle, X, Trash2 } from 'lucide-react';
import DietUtils from '../../data/dietIngredientsMap';
import { getDateKey, formatFullDate } from '../../utils/dateHelpers';

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
const units = ['g', 'kg', 'ml', 'l', 'cucchiaino', 'cucchiaio', 'tazza', 'unità'];

// Funzione per inizializzare un piano alimentare giornaliero vuoto
const getEmptyDailyDietPlan = () => ({
  colazione: [],
  spuntinoMattutino: [],
  pranzo: [],
  spuntinoPomeridiano: [],
  cena: [],
});

const DietaSection = ({ allDietDataMap, setAllDietDataMap, onOpenCalendarModal, openInfoModal }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMonthlyDietModalOpen, setIsMonthlyDietModalOpen] = useState(false);

  // Stato per il mese e l'anno visualizzati nel modale
  const [modalMonth, setModalMonth] = useState(new Date().getMonth());
  const [modalYear, setModalYear] = useState(new Date().getFullYear());

  // Stato temporaneo per l'editing nel modale (Map<dateKey, { dateObject: Date, dailyPlan: DailyDietPlanObject }>)
  const [editingMonthlyDietPlan, setEditingMonthlyDietPlan] = useState(new Map());

  // Effetto per aggiornare i giorni nel modale quando il mese o l'anno del modale cambiano
  useEffect(() => {
    if (!isMonthlyDietModalOpen) return;

    const firstDayOfMonth = new Date(modalYear, modalMonth, 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const newMonthData = new Map();
    let tempDate = new Date(firstDayOfMonth);
    const numberOfDaysInMonth = new Date(modalYear, modalMonth + 1, 0).getDate();

    for (let i = 0; i < numberOfDaysInMonth; i++) {
      const dateKey = getDateKey(tempDate);
      const existingDailyPlan = allDietDataMap.get(dateKey);
      newMonthData.set(dateKey, {
        dateObject: new Date(tempDate),
        dailyPlan: existingDailyPlan ? JSON.parse(JSON.stringify(existingDailyPlan)) : getEmptyDailyDietPlan()
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    setEditingMonthlyDietPlan(newMonthData);
    if (getDateKey(selectedDate).substring(0, 7) !== getDateKey(new Date(modalYear, modalMonth, 1)).substring(0, 7)) {
        setSelectedDate(new Date(modalYear, modalMonth, 1));
    }
  }, [modalMonth, modalYear, isMonthlyDietModalOpen, allDietDataMap, selectedDate]);

  // Gestisce il cambio di data (giorno precedente/successivo) nella vista principale
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

  // Funzione per aprire il modale e pre-caricare i dati del mese corrente
  const handleOpenMonthlyDietModal = () => {
    const today = new Date();
    setModalMonth(today.getMonth());
    setModalYear(today.getFullYear());
    setIsMonthlyDietModalOpen(true);
  };

  // Funzione per salvare i dati del modale nella mappa globale
  const handleSaveMonthlyDiet = () => {
    setAllDietDataMap(prevMap => {
      const newMap = new Map(prevMap);
      editingMonthlyDietPlan.forEach((dayData, dateKey) => {
        const isDailyPlanEmpty = mealTypes.every(mealType => dayData.dailyPlan[mealType].length === 0);
        if (isDailyPlanEmpty) {
          newMap.delete(dateKey);
        } else {
          newMap.set(dateKey, dayData.dailyPlan);
        }
      });
      return newMap;
    });
    setIsMonthlyDietModalOpen(false);
    openInfoModal("Successo!", "La dieta è stata salvata correttamente.", "success");
  };

  // Ottieni il piano alimentare per il giorno attualmente selezionato nella vista principale
  const currentDayDietPlan = allDietDataMap.get(getDateKey(selectedDate)) || getEmptyDailyDietPlan();

  // Funzioni per la navigazione mese nel modale
  const handlePrevMonthModal = () => {
    setModalMonth(prevMonth => {
      if (prevMonth === 0) {
        setModalYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  const handleNextMonthModal = () => {
    setModalMonth(prevMonth => {
      if (prevMonth === 11) {
        setModalYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-teal-300 mb-4 text-center">Il Tuo Piano Alimentare</h2>

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

      {/* Visualizzazione del Piano Alimentare del Giorno Selezionato */}
      <div className="bg-gray-700 p-5 rounded-2xl shadow-md border border-gray-600">
        <h3 className="text-xl font-semibold text-yellow-400 mb-3 flex items-center">
          <Utensils size={24} className="mr-2" /> Piano del Giorno
        </h3>
        {mealTypes.map(mealType => (
          <div key={mealType} className="mb-4 last:mb-0">
            <h4 className="text-lg font-semibold text-gray-200 mb-1 capitalize">{mealLabels[mealType]}</h4>
            {currentDayDietPlan[mealType] && currentDayDietPlan[mealType].length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                {currentDayDietPlan[mealType].map((item, idx) => (
                  <li key={idx}>{item.food} - {item.quantity} {item.unit}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm italic">Nessun alimento per {mealLabels[mealType].toLowerCase()}.</p>
            )}
          </div>
        ))}
        {Object.values(currentDayDietPlan).every(meal => meal.length === 0) && (
          <p className="text-gray-400 text-center py-4">Nessun piano alimentare per questo giorno.</p>
        )}
      </div>

      {/* Pulsante per aprire il modale di inserimento mensile */}
      <button
        onClick={handleOpenMonthlyDietModal}
        className="w-full mt-4 p-3 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-200 flex items-center justify-center"
      >
        <PlusCircle size={24} className="mr-2" /> Inserisci Dieta Mensile
      </button>

      {/* Consigli Generali (rimangono statici) */}
      <div className="bg-gray-700 p-5 rounded-2xl shadow-md border border-gray-600">
        <h3 className="text-xl font-semibold text-orange-400 mb-3">Consigli Alimentari</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-200">
          <li>Bevi almeno 2-3 litri d'acqua al giorno.</li>
          <li>Limita zuccheri raffinati e cibi processati.</li>
          <li>Assicurati un adeguato apporto di proteine.</li>
          <li>Varia le fonti di carboidrati complessi e grassi sani.</li>
        </ul>
      </div>

      {/* Modale Inserimento Dieta Mensile */}
      {isMonthlyDietModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 w-full max-w-md h-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-yellow-300">Inserisci Dieta Mensile</h3>
              <button
                onClick={() => setIsMonthlyDietModalOpen(false)}
                className="p-2 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigazione Mese nel Modale */}
            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-xl shadow-md border border-gray-600 mb-4">
              <button
                onClick={handlePrevMonthModal}
                className="p-2 rounded-full bg-gray-600 text-teal-400 hover:bg-gray-500 transition-colors duration-200"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-base font-semibold text-teal-400 text-center flex-grow mx-2">
                {monthNames[modalMonth]} {modalYear}
              </h3>
              <button
                onClick={handleNextMonthModal}
                className="p-2 rounded-full bg-gray-600 text-teal-400 hover:bg-gray-500 transition-colors duration-200"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Selezione Giorno */}
            <div className="mb-4">
              <label htmlFor="select-day" className="block text-gray-300 text-sm font-bold mb-2">Seleziona Giorno:</label>
              <select
                id="select-day"
                className="w-full p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onChange={(e) => {
                  const selectedDateKey = e.target.value;
                  const dayData = editingMonthlyDietPlan.get(selectedDateKey);
                  if (dayData && dayData.dateObject) {
                    setSelectedDate(new Date(dayData.dateObject));
                  }
                }}
                value={getDateKey(selectedDate)}
              >
                {Array.from(editingMonthlyDietPlan.keys()).map(dateKey => {
                  const dayData = editingMonthlyDietPlan.get(dateKey);
                  return (
                    <option key={dateKey} value={dateKey}>
                      {dayNames[dayData.dateObject.getDay()]}, {dayData.dateObject.getDate()} {monthNames[dayData.dateObject.getMonth()]}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selezione Pasto e Inserimento Alimento */}
            <div className="flex-grow overflow-y-auto space-y-4">
              {mealTypes.map(mealType => (
                <MealInputSection
                  key={mealType}
                  mealType={mealType}
                  mealLabel={mealLabels[mealType]}
                  currentDietPlan={editingMonthlyDietPlan.get(getDateKey(selectedDate))?.dailyPlan || getEmptyDailyDietPlan()}
                  setEditingMonthlyDietPlan={setEditingMonthlyDietPlan}
                  selectedDate={selectedDate}
                  units={units}
                  openInfoModal={openInfoModal}
                />
              ))}
            </div>

            {/* Pulsante Salva */}
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={handleSaveMonthlyDiet}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Save size={24} className="mr-2" /> Salva Dieta Mensile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente per la sezione di input di un singolo pasto
const MealInputSection = ({ mealType, mealLabel, currentDietPlan, setEditingMonthlyDietPlan, selectedDate, units, openInfoModal }) => {
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState(units[0]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Determina la categoria di suggerimenti in base al mealType
  const getSuggestionsCategory = (type) => {
    switch (type) {
      case 'colazione':
        return DietUtils.dietIngredientsMap.colazione;
      case 'spuntinoMattutino':
        return DietUtils.dietIngredientsMap.spuntinoMattutino;
      case 'spuntinoPomeridiano':
        return DietUtils.dietIngredientsMap.spuntinoPomeridiano;
      case 'pranzo':
        return DietUtils.dietIngredientsMap.pranzo;
      case 'cena':
        return DietUtils.dietIngredientsMap.cena;
      default:
        return {};
    }
  };

  // Gestisce il cambio dell'input dell'alimento e filtra i suggerimenti
  const handleFoodItemChange = (e) => {
    const value = e.target.value;
    setFoodItem(value);

    if (value.length > 0) {
      const normalizedValue = DietUtils.normalizeText(value);
      const categorySuggestions = getSuggestionsCategory(mealType);
      
      let suggestions = Object.keys(categorySuggestions).filter(key =>
        key.includes(normalizedValue)
      );

      // Logica per aggiungere ingredienti comuni specifici al tipo di pasto
      if (mealType === 'colazione' || mealType === 'spuntinoMattutino' || mealType === 'spuntinoPomeridiano') {
        const commonBreakfastSuggestions = Object.keys(DietUtils.dietIngredientsMap.common_breakfast_ingredients).filter(key =>
          key.includes(normalizedValue)
        );
        suggestions = Array.from(new Set([...suggestions, ...commonBreakfastSuggestions]));
      } else if (mealType === 'pranzo' || mealType === 'cena') {
        const commonSavorySuggestions = Object.keys(DietUtils.dietIngredientsMap.common_savory_ingredients).filter(key =>
          key.includes(normalizedValue)
        );
        suggestions = Array.from(new Set([...suggestions, ...commonSavorySuggestions]));
      }

      setFilteredSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Gestisce la selezione di un suggerimento dal menu a tendina
  const handleSelectSuggestion = (suggestion) => {
    setFoodItem(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddFoodItem = () => {
    if (foodItem.trim() === '' || quantity.trim() === '') {
      openInfoModal('Errore', 'Per favore, inserisci sia l\'alimento che la quantità.', 'error');
      return;
    }

    setEditingMonthlyDietPlan(prevMap => {
      const newMap = new Map(prevMap);
      const dateKey = getDateKey(selectedDate);
      const dayData = newMap.get(dateKey);

      const updatedMeal = [...dayData.dailyPlan[mealType], { food: foodItem.trim(), quantity: parseFloat(quantity), unit }];
      newMap.set(dateKey, { ...dayData, dailyPlan: { ...dayData.dailyPlan, [mealType]: updatedMeal } });
      return newMap;
    });

    setFoodItem('');
    setQuantity('');
  };

  const handleRemoveFoodItem = (indexToRemove) => {
    setEditingMonthlyDietPlan(prevMap => {
      const newMap = new Map(prevMap);
      const dateKey = getDateKey(selectedDate);
      const dayData = newMap.get(dateKey);

      const updatedMeal = dayData.dailyPlan[mealType].filter((_, index) => index !== indexToRemove);
      newMap.set(dateKey, { ...dayData, dailyPlan: { ...dayData.dailyPlan, [mealType]: updatedMeal } });
      return newMap;
    });
  };

  return (
    <div className="bg-gray-700 p-4 rounded-xl shadow-inner border border-gray-600">
      <h4 className="text-lg font-semibold text-yellow-400 mb-2 capitalize">{mealLabel}</h4>
      <div className="flex items-center space-x-2 mb-3 relative">
        <input
          type="text"
          placeholder="Alimento"
          value={foodItem}
          onChange={handleFoodItemChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          className="w-1/2 p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
        {/* Menu a tendina dei suggerimenti */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto w-full left-0 top-full mt-1">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 text-gray-100 hover:bg-gray-700 cursor-pointer"
                onMouseDown={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
              </li>
            ))}
          </ul>
        )}
        <input
          type="number"
          placeholder="Quantità"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-1/4 p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-1/4 p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
        >
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <button
          onClick={handleAddFoodItem}
          className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      {currentDietPlan[mealType] && currentDietPlan[mealType].length > 0 ? (
        <ul className="space-y-2">
          {currentDietPlan[mealType].map((item, idx) => (
            <li key={idx} className="flex items-center justify-between bg-gray-600 p-2 rounded-md text-gray-200">
              <span>{item.food} - {item.quantity} {item.unit}</span>
              <button
                onClick={() => handleRemoveFoodItem(idx)}
                className="ml-2 text-red-400 hover:text-red-600 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm italic">Nessun alimento aggiunto per questo pasto.</p>
      )}
    </div>
  );
};

export default DietaSection;
