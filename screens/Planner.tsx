
import React, { useState } from 'react';
import { Screen, MealType, Meal } from '../types';
import { shuffleMeal, generateFullPlan, getDishEnrichment, generateDishImage } from '../geminiService';
import BottomNav from '../components/BottomNav';
interface PlannerProps {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  onNavigate: (screen: Screen, mealId?: string) => void;
  onMealClick: (id: string) => void;
}

const Planner: React.FC<PlannerProps> = ({ meals, setMeals, onNavigate, onMealClick }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isShuffling, setIsShuffling] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [manualName, setManualName] = useState('');
  const [isUpdatingDish, setIsUpdatingDish] = useState(false);

  // Generate dynamic dates for the week starting from today
  const generateWeekDays = () => {
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        name: dayNames[date.getDay()],
        date: date.getDate(),
        index: i
      };
    });
  };

  const days = generateWeekDays();

  const handleShuffle = async (e: React.MouseEvent, mealId: string) => {
    e.stopPropagation();
    setIsShuffling(mealId);
    const mealToShuffle = meals.find(m => m.id === mealId);
    if (mealToShuffle) {
      const result = await shuffleMeal(mealToShuffle);
      setMeals(prev => prev.map(m => m.id === mealId ? { ...m, ...result } : m));
    }
    setIsShuffling(null);
  };

  const handleGeneratePlan = async () => {
    console.log("Starting AI Plan generation...");
    setIsGenerating(true);
    try {
      const newMeals = await generateFullPlan();
      console.log("Generated meals:", newMeals?.length);
      if (newMeals && newMeals.length > 0) {
        setMeals(newMeals);
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFlip = (mealId: string) => {
    setFlippedCards(prev => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  const handleEditClick = (e: React.MouseEvent, meal: Meal) => {
    e.stopPropagation();
    setEditingMealId(meal.id);
    setManualName(meal.name);
  };

  const handleSaveManualDish = async () => {
    if (!editingMealId || !manualName.trim()) return;

    setIsUpdatingDish(true);
    try {
      const enrichment = await getDishEnrichment(manualName);
      const imageUrl = await generateDishImage(manualName);

      setMeals(prev => prev.map(m => m.id === editingMealId ? {
        ...m,
        name: manualName,
        imageUrl,
        ...enrichment
      } : m));

      setEditingMealId(null);
      setManualName('');
    } catch (err) {
      console.error("Failed to update dish manually:", err);
    } finally {
      setIsUpdatingDish(false);
    }
  };

  const dayMeals = meals.filter(m => m.day === selectedDay);

  const sortedDayMeals = [...dayMeals].sort((a, b) => {
    const order = { 'Breakfast': 0, 'Lunch': 1, 'Dinner': 2 };
    return (order[a.type] ?? 0) - (order[b.type] ?? 0);
  });

  return (
    <div className="flex flex-col h-full bg-[#f8f6f6] pb-40">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl material-symbols-filled">restaurant_menu</span>
          <h2 className="text-lg font-bold">Swaadly Planner</h2>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-white"></span>
        </button>
      </div>

      {/* Horizontal Calendar */}
      <div className="flex overflow-x-auto px-4 py-4 gap-3 no-scrollbar border-b border-gray-100 bg-white">
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`flex flex-col items-center justify-center min-w-[56px] h-20 rounded-xl transition-all ${selectedDay === idx ? 'bg-primary text-white shadow-lg scale-105' : 'bg-gray-50 hover:bg-gray-100'}`}
          >
            <p className={`text-[11px] font-bold uppercase tracking-wider ${selectedDay === idx ? 'opacity-90' : 'text-gray-400'}`}>{day.name}</p>
            <p className="text-xl font-bold">{day.date}</p>
            {selectedDay === idx && <div className="mt-1 w-1 h-1 rounded-full bg-white"></div>}
          </button>
        ))}
      </div>

      <div className="px-4 pt-6 pb-2">
        <h3 className="text-xl font-bold text-gray-800">Today's Menu</h3>
        <p className="text-sm text-gray-500">All your meals in one place</p>
      </div>

      {/* Meal Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {sortedDayMeals.length > 0 ? sortedDayMeals.map((meal) => (
          <div key={meal.id} className="perspective-1000 h-[200px]">
            <div
              className={`relative w-full h-full transition-transform duration-500 preserve-3d cursor-pointer ${flippedCards[meal.id] ? '[transform:rotateY(180deg)]' : ''}`}
              onClick={() => toggleFlip(meal.id)}
            >
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden flex items-stretch justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-[2_2_0px] flex-col justify-between py-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary`}>
                        {meal.type}
                      </span>
                    </div>
                    <p className="text-lg font-bold leading-tight mt-1">{meal.name}</p>
                    <p className="text-gray-500 text-sm font-medium">{meal.cuisine}</p>
                  </div>
                  <div className="flex gap-1.5 mt-4">
                    <button
                      disabled={isShuffling === meal.id}
                      onClick={(e) => handleShuffle(e, meal.id)}
                      className="flex-1 flex items-center justify-center rounded-lg h-9 bg-gray-50 text-gray-700 gap-1.5 text-[11px] font-bold border border-gray-100 hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${isShuffling === meal.id ? 'animate-spin' : ''}`}>shuffle</span>
                      <span>Shuffle</span>
                    </button>
                    <button
                      onClick={(e) => handleEditClick(e, meal)}
                      className="flex-1 flex items-center justify-center rounded-lg h-9 bg-gray-50 text-gray-700 gap-1.5 text-[11px] font-bold border border-gray-100 hover:bg-gray-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMealClick(meal.id); }}
                      className="flex-[1.2] flex items-center justify-center rounded-lg h-9 bg-primary text-white gap-1.5 text-[11px] font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">restaurant_menu</span>
                      <span>Recipe</span>
                    </button>
                  </div>
                </div>
                <div
                  className="w-36 h-36 bg-center bg-cover rounded-xl flex-shrink-0 shadow-inner"
                  style={{ backgroundImage: `url("${meal.imageUrl}")` }}
                ></div>
              </div>

              <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-2xl bg-white p-5 shadow-inner border border-primary/20 flex flex-col z-0">
                <div className="flex justify-between items-center mb-3 mt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl material-symbols-filled">nutrition</span>
                    <h4 className="font-bold text-gray-800 text-[16px]">Nutritional Info</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEditClick(e, meal)}
                      className="h-8 px-3 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-700 text-[10px] font-bold hover:bg-gray-100 transition-all gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit_note</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMealClick(meal.id); }}
                      className="h-8 px-3 rounded-full bg-primary flex items-center justify-center border border-primary text-white text-[10px] font-bold hover:shadow-md transition-all gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">restaurant_menu</span>
                      <span>Recipe</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 flex-1 pb-1 px-1">
                  <div className="bg-orange-50/50 p-2 rounded-xl flex flex-col items-center justify-center border border-orange-100/50">
                    <p className="text-[9px] font-bold text-orange-400/80 uppercase tracking-widest mb-1 leading-none">Energy</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-black text-orange-600 leading-none">{meal.macros?.kcal ?? '--'}</span>
                      <span className="text-[10px] font-bold text-orange-400 leading-none lowercase">kcal</span>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 p-2 rounded-xl flex flex-col items-center justify-center border border-blue-100/50">
                    <p className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest mb-1 leading-none">Carbs</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-black text-blue-600 leading-none">{meal.macros?.carbs ?? '--'}</span>
                      <span className="text-[10px] font-bold text-blue-400 leading-none">g</span>
                    </div>
                  </div>
                  <div className="bg-green-50/50 p-2 rounded-xl flex flex-col items-center justify-center border border-green-100/50">
                    <p className="text-[9px] font-bold text-green-400/80 uppercase tracking-widest mb-1 leading-none">Protein</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-black text-green-600 leading-none">{meal.macros?.protein ?? '--'}</span>
                      <span className="text-[10px] font-bold text-green-400 leading-none">g</span>
                    </div>
                  </div>
                  <div className="bg-red-50/50 p-2 rounded-xl flex flex-col items-center justify-center border border-red-100/50">
                    <p className="text-[9px] font-bold text-red-400/80 uppercase tracking-widest mb-1 leading-none">Fats</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-black text-red-600 leading-none">{meal.macros?.fat ?? '--'}</span>
                      <span className="text-[10px] font-bold text-red-400 leading-none">g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-white">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-200">set_meal</span>
            <p className="font-medium">No meals planned for today.</p>
            <button
              onClick={handleGeneratePlan}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              Generate AI Plan
            </button>
          </div>
        )}

        {sortedDayMeals.length > 0 && (
          <div className="px-2 py-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                <p className="text-primary text-xs font-bold uppercase tracking-wider">Nutritional Insight</p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "Your protein intake today is excellent! For optimal energy, consider adding a fiber-rich snack around 4 PM."
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FAB - AI Generate All */}
      <div className="fixed bottom-32 right-6 z-40">
        <button
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className={`size-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform group ${isGenerating ? 'animate-pulse opacity-80' : ''}`}
        >
          <span className={`material-symbols-outlined text-3xl group-hover:rotate-45 transition-transform ${isGenerating ? 'animate-spin' : ''}`}>
            {isGenerating ? 'refresh' : 'auto_awesome'}
          </span>
          <span className="absolute -top-12 right-0 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {isGenerating ? 'Generating...' : 'Smart Fill'}
          </span>
        </button>
      </div>

      {/* Sticky Bottom Highlight & Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <div className="bg-primary/5 px-4 py-2 flex items-center justify-between border-t border-primary/10">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl material-symbols-filled">query_stats</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-primary leading-none">Day Total</p>
              <p className="text-sm font-bold">
                {dayMeals.reduce((acc, m) => acc + (m.macros?.kcal ?? 0), 0)} kcal • {dayMeals.reduce((acc, m) => acc + (m.macros?.protein ?? 0), 0)}g Protein
              </p>
            </div>
          </div>
          <button className="text-xs font-bold text-primary flex items-center gap-1">
            View Stats <span className="material-symbols-outlined text-xs">analytics</span>
          </button>
        </div>
        <BottomNav currentScreen={Screen.Planner} onNavigate={onNavigate} />
      </div>

      {/* Manual Edit Modal */}
      {editingMealId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-xl font-bold mb-1">Change Dish</h4>
            <p className="text-sm text-gray-500 mb-6">Type a new name, and AI will generate the image, macros, and recipe.</p>

            <div className="space-y-4">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Chicken Biryani"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveManualDish(); }}
                  className="w-full h-14 px-4 pr-12 rounded-xl bg-gray-50 border border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-lg"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">fastfood</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingMealId(null)}
                  className="flex-1 h-12 rounded-xl border border-gray-100 font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all outline-none"
                >
                  Cancel
                </button>
                <button
                  disabled={isUpdatingDish || !manualName.trim()}
                  onClick={handleSaveManualDish}
                  className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 outline-none"
                >
                  {isUpdatingDish ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      <span>Enriching...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                      <span>AI Smart Update</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
          <div className="size-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">refresh</span>
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">Creating Your Plan</h3>
          <p className="text-gray-500 font-medium text-sm">Gemini is curating a unique 7-day Indian menu just for you...</p>
          <div className="mt-8 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
