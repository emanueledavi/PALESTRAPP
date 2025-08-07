import React, { useState, useEffect } from 'react';
import { Utensils, ChevronLeft, ChevronRight, Save, PlusCircle, X, Trash2, Info } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where, addDoc, getDocs, deleteDoc } from 'firebase/firestore';

// =====================================================================================================================
// FILE MOCK PER RENDERE L'APP AUTONOMA E FUNZIONANTE
// Ho creato questi file in modo che il tuo codice non dia errori di importazione.
// Puoi sostituirli con i tuoi file originali se li hai.
// =====================================================================================================================

// MOCK: dateHelpers.js
const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatFullDate = (date) => {
    const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const dayOfWeek = dayNames[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
};

// MOCK: DietUtils.js
const DietUtils = {
    dietIngredientsMap: {
        colazione: {
            'latte': { calories: 60, protein: 3, carbs: 5, fats: 3 },
            'yogurt greco': { calories: 100, protein: 10, carbs: 5, fats: 2 },
            'fiocchi d\'avena': { calories: 389, protein: 17, carbs: 66, fats: 7 },
            'uova': { calories: 155, protein: 13, carbs: 1, fats: 11 },
        },
        pranzo: {
            'pollo': { calories: 165, protein: 31, carbs: 0, fats: 4 },
            'riso basmati': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
            'tonno': { calories: 184, protein: 29, carbs: 0, fats: 6 },
            'insalata mista': { calories: 15, protein: 1, carbs: 3, fats: 0 },
        },
        cena: {
            'salmone': { calories: 208, protein: 20, carbs: 0, fats: 13 },
            'patate dolci': { calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
            'lenticchie': { calories: 116, protein: 9, carbs: 20, fats: 0.4 },
            'carne di manzo': { calories: 250, protein: 26, carbs: 0, fats: 17 },
        },
        spuntinoMattutino: {
            'mela': { calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
            'mandorle': { calories: 579, protein: 21, carbs: 22, fats: 50 },
        },
        spuntinoPomeridiano: {
            'banana': { calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
            'noci': { calories: 654, protein: 15, carbs: 14, fats: 65 },
        },
        common_breakfast_ingredients: {
            'frutta fresca': { calories: 50, protein: 0, carbs: 12, fats: 0 },
            'marmellata': { calories: 240, protein: 0, carbs: 64, fats: 0 },
        },
        common_savory_ingredients: {
            'olio d\'oliva': { calories: 884, protein: 0, carbs: 0, fats: 100 },
            'sale': { calories: 0, protein: 0, carbs: 0, fats: 0 },
            'pepe': { calories: 0, protein: 0, carbs: 0, fats: 0 },
        }
    },
    normalizeText: (text) => text.toLowerCase().trim(),
};

// =====================================================================================================================
// FINE FILE MOCK
// =====================================================================================================================


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

    // Funzione per salvare il piano alimentare del giorno corrente
    const handleSaveCurrentDayDiet = () => {
        const dateKey = getDateKey(selectedDate);
        const dailyPlan = allDietDataMap.get(dateKey) || getEmptyDailyDietPlan();

        // Qui andrà la logica per salvare il piano del giorno su Firestore
        console.log(`Saving diet plan for ${dateKey}:`, dailyPlan);
        openInfoModal("Successo!", `Il piano alimentare per il ${formatFullDate(selectedDate)} è stato salvato (simulato).`, "success");
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
        <div className="space-y-6 text-gray-100 p-4 font-inter">
            <h2 className="text-3xl font-extrabold text-teal-300 mb-6 text-center">Il Tuo Piano Alimentare</h2>

            {/* Navigazione Data */}
            <div className="flex justify-between items-center bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-700 mb-4">
                <button
                    onClick={handlePrevDay}
                    className="p-2 rounded-full bg-gray-700 text-teal-400 hover:bg-gray-600 transition-all duration-200"
                >
                    <ChevronLeft size={24} />
                </button>
                <h3
                    className="text-lg font-semibold text-teal-400 text-center flex-grow mx-2 cursor-pointer"
                    onClick={() => onOpenCalendarModal(selectedDate)}
                >
                    {formatFullDate(selectedDate)}
                </h3>
                <button
                    onClick={handleNextDay}
                    className="p-2 rounded-full bg-gray-700 text-teal-400 hover:bg-gray-600 transition-all duration-200"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Visualizzazione del Piano Alimentare del Giorno Selezionato */}
            <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
                    <Utensils size={28} className="mr-3" /> Piano del Giorno
                </h3>
                {mealTypes.map(mealType => (
                    <div key={mealType} className="mb-5 last:mb-0">
                        <h4 className="text-xl font-semibold text-gray-200 mb-2 capitalize border-b border-gray-600 pb-1">{mealLabels[mealType]}</h4>
                        {currentDayDietPlan[mealType] && currentDayDietPlan[mealType].length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 text-gray-300 text-base pl-4">
                                {currentDayDietPlan[mealType].map((item, idx) => (
                                    <li key={idx}>{item.food.charAt(0).toUpperCase() + item.food.slice(1)} - {item.quantity} {item.unit}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-sm italic">Nessun alimento per {mealLabels[mealType].toLowerCase()}.</p>
                        )}
                    </div>
                ))}
                {Object.values(currentDayDietPlan).every(meal => meal.length === 0) && (
                    <p className="text-gray-400 text-center py-6 text-base">Nessun piano alimentare per questo giorno.</p>
                )}
            </div>

            {/* Pulsante per salvare il piano alimentare del giorno corrente */}
            <button
                onClick={handleSaveCurrentDayDiet}
                className="w-full mt-4 p-4 bg-green-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center transform hover:scale-105 active:scale-95"
            >
                <Save size={24} className="mr-2" /> Salva Piano del Giorno
            </button>

            {/* Pulsante per aprire il modale di inserimento mensile */}
            <button
                onClick={handleOpenMonthlyDietModal}
                className="w-full mt-4 p-4 bg-yellow-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-yellow-700 transition-all duration-200 flex items-center justify-center transform hover:scale-105 active:scale-95"
            >
                <PlusCircle size={24} className="mr-2" /> Inserisci Dieta Mensile
            </button>

            {/* Consigli Generali */}
            <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold text-orange-400 mb-4">Consigli Alimentari</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-200 text-base pl-4">
                    <li>Bevi almeno 2-3 litri d'acqua al giorno.</li>
                    <li>Limita zuccheri raffinati e cibi processati.</li>
                    <li>Assicurati un adeguato apporto di proteine.</li>
                    <li>Varia le fonti di carboidrati complessi e grassi sani.</li>
                </ul>
            </div>

            {/* Modale Inserimento Dieta Mensile */}
            {isMonthlyDietModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6">
                    <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl border border-gray-700 w-full max-w-md h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                            <h3 className="text-2xl font-bold text-yellow-300">Inserisci Dieta Mensile</h3>
                            <button
                                onClick={() => setIsMonthlyDietModalOpen(false)}
                                className="p-2 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 transition-all duration-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigazione Mese nel Modale */}
                        <div className="flex justify-between items-center bg-gray-800 p-3 rounded-2xl shadow-md border border-gray-700 mb-4">
                            <button
                                onClick={handlePrevMonthModal}
                                className="p-2 rounded-full bg-gray-700 text-teal-400 hover:bg-gray-600 transition-all duration-200"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <h3 className="text-lg font-semibold text-teal-400 text-center flex-grow mx-2">
                                {monthNames[modalMonth]} {modalYear}
                            </h3>
                            <button
                                onClick={handleNextMonthModal}
                                className="p-2 rounded-full bg-gray-700 text-teal-400 hover:bg-gray-600 transition-all duration-200"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Selezione Giorno */}
                        <div className="mb-4">
                            <label htmlFor="select-day" className="block text-gray-300 text-sm font-bold mb-2">Seleziona Giorno:</label>
                            <select
                                id="select-day"
                                className="w-full p-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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

                        {/* Sezione per lo scorrimento del contenuto del modale */}
                        <div className="flex-1 overflow-y-auto space-y-4">
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

                        {/* Pulsante Salva nel Modale */}
                        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                            <button
                                onClick={handleSaveMonthlyDiet}
                                className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition-all duration-200 flex items-center justify-center transform hover:scale-105 active:scale-95"
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
        <div className="bg-gray-800 p-4 rounded-2xl shadow-inner border border-gray-700">
            <h4 className="text-xl font-semibold text-yellow-400 mb-2 capitalize">{mealLabel}</h4>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3 relative">
                <input
                    type="text"
                    placeholder="Alimento"
                    value={foodItem}
                    onChange={handleFoodItemChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                    className="w-full sm:w-1/2 p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                {/* Menu a tendina dei suggerimenti */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto w-full sm:w-1/2 left-0 top-full mt-1">
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
                    className="w-full sm:w-1/4 p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full sm:w-1/4 p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <button
                    onClick={handleAddFoodItem}
                    className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200 flex-shrink-0"
                >
                    <PlusCircle size={20} />
                </button>
            </div>
            {currentDietPlan[mealType] && currentDietPlan[mealType].length > 0 ? (
                <ul className="space-y-2 mt-4">
                    {currentDietPlan[mealType].map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-700 p-3 rounded-xl text-gray-200 shadow-sm">
                            <span className="text-base">{item.food.charAt(0).toUpperCase() + item.food.slice(1)} - {item.quantity} {item.unit}</span>
                            <button
                                onClick={() => handleRemoveFoodItem(idx)}
                                className="ml-2 p-1 text-red-400 hover:text-red-500 transition-all duration-200"
                            >
                                <Trash2 size={20} />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400 text-sm italic mt-2">Nessun alimento aggiunto per questo pasto.</p>
            )}
        </div>
    );
};


// Componente Modale per mostrare messaggi
const InfoModal = ({ title, message, type, onClose }) => {
    const icon = type === 'success' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        {icon}
                        <h3 className="text-xl font-bold ml-2 text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <p className="text-gray-300 mb-4">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente principale dell'applicazione
function App() {
    const [allDietDataMap, setAllDietDataMap] = useState(new Map());
    const [infoModal, setInfoModal] = useState({ isOpen: false, title: '', message: '', type: '' });
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);

    // Funzione per aprire il modale di informazione
    const openInfoModal = (title, message, type) => {
        setInfoModal({ isOpen: true, title, message, type });
    };

    // Funzione per chiudere il modale di informazione
    const closeInfoModal = () => {
        setInfoModal({ isOpen: false, title: '', message: '', type: '' });
    };
    
    // Funzione placeholder per il modale del calendario, non implementata
    const onOpenCalendarModal = (date) => {
        console.log(`Apertura modale calendario per il: ${formatFullDate(date)}`);
        openInfoModal("Apertura Calendario", "Questa funzione aprirà il calendario in un'implementazione futura.", "info");
    };

    // Logica di inizializzazione e autenticazione di Firebase
    useEffect(() => {
        // Le variabili globali __app_id, __firebase_config, __initial_auth_token
        // sono fornite dall'ambiente Canvas. Le usiamo qui.
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);
        
        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                console.log("Utente autenticato:", user.uid);
            } else {
                console.log("Nessun utente autenticato. Tentativo di accesso anonimo...");
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(firebaseAuth, initialAuthToken);
                    } else {
                        await signInAnonymously(firebaseAuth);
                    }
                } catch (error) {
                    console.error("Errore durante l'autenticazione anonima:", error);
                }
            }
            setIsAuthReady(true);
        });

        // Pulizia del listener
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex justify-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <DietaSection
                    allDietDataMap={allDietDataMap}
                    setAllDietDataMap={setAllDietDataMap}
                    onOpenCalendarModal={onOpenCalendarModal}
                    openInfoModal={openInfoModal}
                />
                {infoModal.isOpen && <InfoModal {...infoModal} onClose={closeInfoModal} />}
            </div>
        </div>
    );
}

export default App;
