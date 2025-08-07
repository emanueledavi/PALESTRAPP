// src/components/spesa/SpesaSection.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, ChevronLeft, ChevronRight, ListPlus } from 'lucide-react';
import DietUtils from '../../data/dietIngredientsMap';
import { getDateKey, formatFullDate } from '../../utils/dateHelpers';

// Spesa Section Component
const SpesaSection = ({ allShoppingDataMap, setAllShoppingDataMap, allDietDataMap, openInfoModal }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentShoppingList, setCurrentShoppingList] = useState([]);
  const [newItem, setNewItem] = useState('');

  // Carica la lista della spesa per la data selezionata quando la data o la mappa cambiano
  useEffect(() => {
    const dateKey = getDateKey(selectedDate);
    const savedList = allShoppingDataMap.get(dateKey);
    setCurrentShoppingList(savedList || []);
  }, [selectedDate, allShoppingDataMap]);

  // Funzione per aggiornare la mappa centrale della spesa
  const updateShoppingMap = (updatedList) => {
    const dateKey = getDateKey(selectedDate);
    setAllShoppingDataMap(prevMap => {
      const newMap = new Map(prevMap);
      if (updatedList.length === 0) {
        newMap.delete(dateKey);
      } else {
        newMap.set(dateKey, updatedList);
      }
      return newMap;
    });
  };

  // Gestisce il cambio di data (giorno precedente/successivo)
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

  // Funzione per aggiungere un nuovo articolo alla lista della spesa
  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      const updatedList = [...currentShoppingList, { id: Date.now(), text: newItem.trim(), completed: false }];
      setCurrentShoppingList(updatedList);
      updateShoppingMap(updatedList);
      setNewItem('');
    }
  };

  // Funzione per cambiare lo stato di completamento di un articolo
  const handleToggleComplete = (id) => {
    const updatedList = currentShoppingList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setCurrentShoppingList(updatedList);
    updateShoppingMap(updatedList);
  };

  // Funzione per eliminare un articolo dalla lista della spesa
  const handleDeleteItem = (id) => {
    const updatedList = currentShoppingList.filter(item => item.id !== id);
    setCurrentShoppingList(updatedList);
    updateShoppingMap(updatedList);
  };

  // NUOVA FUNZIONE: Genera la lista della spesa dalla dieta del giorno selezionato
  const handleGenerateShoppingList = () => {
    const dateKey = getDateKey(selectedDate);
    const dietPlanForDay = allDietDataMap.get(dateKey);

    if (!dietPlanForDay || Object.values(dietPlanForDay).every(meal => meal.length === 0)) {
      openInfoModal("Attenzione", "Nessun piano alimentare trovato per questo giorno. Inserisci prima la dieta!", "info");
      return;
    }

    const generatedIngredients = new Set(); // Usa un Set per evitare duplicati

    // Itera su ogni tipo di pasto (colazione, pranzo, cena, ecc.)
    Object.values(dietPlanForDay).forEach(mealItems => {
      // mealItems è un array di { food, quantity, unit }
      mealItems.forEach(item => {
        const ingredients = DietUtils.getIngredientsForFood(item.food);
        ingredients.forEach(ingredient => {
          generatedIngredients.add(ingredient);
        });
      });
    });

    const newShoppingListItems = Array.from(generatedIngredients).map(ingredient => ({
      id: Date.now() + Math.random(),
      text: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
      completed: false
    }));

    // Combina con la lista esistente, evitando duplicati con un Set temporaneo
    const combinedList = new Set(currentShoppingList.map(item => item.text.toLowerCase()));
    const finalShoppingList = [...currentShoppingList];

    newShoppingListItems.forEach(newItem => {
      if (!combinedList.has(newItem.text.toLowerCase())) {
        finalShoppingList.push(newItem);
        combinedList.add(newItem.text.toLowerCase());
      }
    });

    setCurrentShoppingList(finalShoppingList);
    updateShoppingMap(finalShoppingList);
    openInfoModal("Successo!", "Lista della spesa generata dalla dieta!", "success");
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-teal-300 mb-4 text-center">La Tua Lista della Spesa</h2>

      {/* Navigazione Data */}
      <div className="flex justify-between items-center bg-gray-700 p-3 rounded-xl shadow-md border border-gray-600 mb-4">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-full bg-gray-600 text-teal-400 hover:bg-gray-500 transition-colors duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-base font-semibold text-teal-400 text-center flex-grow mx-2">
          {formatFullDate(selectedDate)}
        </h3>
        <button
          onClick={handleNextDay}
          className="p-2 rounded-full bg-gray-600 text-teal-400 hover:bg-gray-500 transition-colors duration-200"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Pulsante per generare la lista */}
      <button
        onClick={handleGenerateShoppingList}
        className="w-full p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
      >
        <ListPlus size={24} className="mr-2" /> Genera Lista da Dieta
      </button>

      {/* Input per Nuovo Articolo */}
      <div className="flex bg-gray-700 p-4 rounded-2xl shadow-md border border-gray-600">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Aggiungi nuovo articolo..."
          className="flex-grow p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleAddItem}
          className="ml-3 p-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
        >
          <PlusCircle size={24} />
        </button>
      </div>

      {/* Lista Articoli */}
      <div className="bg-gray-700 p-5 rounded-2xl shadow-md border border-gray-600 min-h-[200px]">
        <h3 className="text-xl font-semibold text-purple-400 mb-3">Articoli</h3>
        {currentShoppingList.length === 0 ? (
          <p className="text-gray-400 text-center py-4">La lista della spesa è vuota per questo giorno!</p>
        ) : (
          <ul className="space-y-3">
            {currentShoppingList.map(item => (
              <li
                key={item.id}
                className="flex items-center bg-gray-600 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-500 transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleComplete(item.id)}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className={`flex-grow ml-3 text-gray-200 ${item.completed ? 'line-through text-gray-400' : ''}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="ml-4 text-red-400 hover:text-red-600 transition-colors duration-200"
                >
                  <Trash2 size={20} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Consigli per la Spesa (Nuovo Blocco) */}
      <div className="bg-gray-700 p-5 rounded-2xl shadow-md border border-gray-600">
        <h3 className="text-xl font-semibold text-orange-400 mb-3">Consigli per la Spesa</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-200">
          <li>Controlla il frigorifero prima di fare la lista.</li>
          <li>Organizza la lista per categorie di prodotti.</li>
          <li>Non fare la spesa a stomaco vuoto.</li>
          <li>Acquista prodotti di stagione per freschezza e risparmio.</li>
        </ul>
      </div>
    </div>
  );
};

export default SpesaSection;
