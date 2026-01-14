import React, { useState, useEffect } from 'react';
import { Screen, Meal, GroceryItem } from '../types';
import { getRecipeDetails, scaleIngredients } from '../geminiService';

interface RecipeDetailProps {
  mealId: string | null;
  meals: Meal[];
  setGroceryItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  onBack: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ mealId, meals, setGroceryItems, onBack }) => {
  const [mealData, setMealData] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [servings, setServings] = useState(0);
  const [spiceLevel, setSpiceLevel] = useState('');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [isCooking, setIsCooking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Initial load
  useEffect(() => {
    const baseMeal = meals.find(m => m.id === mealId) || meals[0];
    setMealData(baseMeal);
    setCheckedIngredients(new Set()); // Reset on meal change

    // Initialize servings and spice
    if (baseMeal.serves) {
      const num = parseInt(baseMeal.serves.match(/\d+/)?.[0] || '4');
      setServings(num);
    } else {
      setServings(4);
    }
    setSpiceLevel(baseMeal.spice || 'Medium');

    const fetchDetails = async () => {
      console.log("Fetching recipe for:", baseMeal.name);
      setIsLoading(true);
      try {
        const details = await getRecipeDetails(baseMeal.name);

        console.log("Fetched details:", details);
        setMealData(prev => {
          const updated = prev ? { ...prev, ...details } : details as Meal;
          if (details.serves && !prev?.serves) {
            const num = parseInt(details.serves.match(/\d+/)?.[0] || '4');
            setServings(num);
          }
          if (details.spice && !prev?.spice) setSpiceLevel(details.spice);
          return updated;
        });
      } catch (error) {
        console.error("Recipe fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [mealId]);

  // Scaling logic
  useEffect(() => {
    if (!mealData || isLoading || !mealData.ingredients) return;

    const timer = setTimeout(async () => {
      setIsScaling(true);
      try {
        const newIngredients = await scaleIngredients(mealData.name, servings, spiceLevel);
        if (newIngredients.length > 0) {
          setMealData(prev => prev ? { ...prev, ingredients: newIngredients } : null);
        }
      } catch (error) {
        console.error("Scaling failed:", error);
      } finally {
        setIsScaling(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [servings, spiceLevel]);

  const cycleSpice = () => {
    const levels = ['Mild', 'Medium', 'Hot'];
    const currentIndex = levels.indexOf(spiceLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    setSpiceLevel(levels[nextIndex]);
  };

  const toggleIngredient = (idx: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(idx)) newChecked.delete(idx);
    else newChecked.add(idx);
    setCheckedIngredients(newChecked);
  };

  const handleAddToList = () => {
    if (!mealData || !mealData.ingredients) return;

    const uncheckedItems: GroceryItem[] = mealData.ingredients
      .filter((_, idx) => !checkedIngredients.has(idx))
      .map((ingredientStr, idx) => {
        // Robust regex for "1 tsp Salt", "1/2 cup Water", "Salt to taste"
        const regex = /^([\d\/\s\-\.]+)?\s*(tsp|teaspoon|tspn|tbsp|tablespoon|tbspn|g|kg|cup|cups|piece|pieces|pcs|to taste)?\s*(.*)$/i;
        const match = ingredientStr.match(regex);

        let quantity = "";
        let name = ingredientStr;

        if (match) {
          const val = (match[1] || "").trim();
          const unit = (match[2] || "").trim();
          const rest = (match[3] || "").trim();

          if (rest) {
            name = rest;
            quantity = `${val} ${unit}`.trim();
          } else if (unit.toLowerCase() === 'to taste') {
            name = val;
            quantity = "to taste";
          }
        }

        // Helper for Title Case
        const toTitleCase = (str: string) =>
          str.replace(/\b\w/g, char => char.toUpperCase());

        return {
          id: `recipe-${mealData.id}-${Date.now()}-${idx}`,
          name: toTitleCase(name),
          quantity: quantity,
          category: 'Essentials',
          checked: false
        };
      });

    if (uncheckedItems.length > 0) {
      setGroceryItems(prev => [...prev, ...uncheckedItems]);
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const speakStep = (stepIndex: number) => {
    if (!mealData || !mealData.instructions) return;
    window.speechSynthesis.cancel();
    if (!isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(mealData.instructions[stepIndex]);
    utterance.rate = 0.9;
    utterance.pitch = 1.1; // Friendly tone
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isCooking) {
      speakStep(currentStep);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [isCooking, currentStep, isSpeaking]);

  if (!mealData) return null;

  return (
    <div className="flex flex-col h-full bg-white pb-32 overflow-y-auto">
      <div className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100">
        <button onClick={onBack} className="size-12 flex items-center">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center truncate px-4">{mealData.name}</h2>
        <button className="size-12 flex items-center justify-end text-primary">
          <span className="material-symbols-outlined material-symbols-filled">favorite</span>
        </button>
      </div>

      <div className="relative">
        <div
          className="w-full min-h-[320px] bg-center bg-cover flex flex-col justify-end p-6 text-white relative"
          style={{ backgroundImage: `url("${mealData.imageUrl}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="relative">
            <span className="bg-saffron text-[10px] font-bold px-2 py-1 rounded-full text-black mb-2 inline-block uppercase tracking-wider">Chef's Selection</span>
            <h1 className="text-3xl font-bold leading-tight">{mealData.name}</h1>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">local_fire_department</span>
              AI Suggested regional variation
            </p>
          </div>
        </div>
        <button
          onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(mealData.name + ' recipe shorts')}`, '_blank')}
          className="absolute bottom-[-28px] right-6 flex items-center justify-center rounded-full h-14 w-14 bg-primary text-white shadow-lg border-4 border-white active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl material-symbols-filled">play_arrow</span>
        </button>
      </div>

      <div className="h-8"></div>

      <div className="flex gap-3 px-4">
        {/* Time Card */}
        <div className="flex-1 flex flex-col gap-1 rounded-xl p-3 border-b-4 border-saffron bg-gray-50">
          <div className="flex items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-base material-symbols-filled">timer</span>
            <p className="text-[9px] font-bold uppercase tracking-wider">Time</p>
          </div>
          <p className="text-sm font-bold truncate">{mealData.time || '--'}</p>
        </div>

        {/* Interactive Spice Card */}
        <button
          onClick={cycleSpice}
          className="flex-1 flex flex-col gap-1 rounded-xl p-3 border-b-4 border-primary bg-gray-50 active:scale-95 transition-transform text-left"
        >
          <div className="flex items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-base material-symbols-filled">local_fire_department</span>
            <p className="text-[9px] font-bold uppercase tracking-wider">Spice</p>
          </div>
          <div className="flex items-center justify-between group">
            <p className="text-sm font-bold truncate">{spiceLevel || '--'}</p>
            <span className="material-symbols-outlined text-xs text-primary/40 group-hover:text-primary">swap_horiz</span>
          </div>
        </button>

        {/* Interactive Servings Card */}
        <div className="flex-1 flex flex-col gap-1 rounded-xl p-3 border-b-4 border-green-500 bg-gray-50">
          <div className="flex items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-base material-symbols-filled">restaurant</span>
            <p className="text-[9px] font-bold uppercase tracking-wider">Serves</p>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="size-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center active:bg-green-500 active:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xs">remove</span>
            </button>
            <p className="text-sm font-bold">{servings}</p>
            <button
              onClick={() => setServings(servings + 1)}
              className="size-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center active:bg-green-500 active:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xs">add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-[68px] bg-white z-40 border-b border-gray-100 mt-6">
        <div className="flex px-4 justify-between">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 flex flex-col items-center pt-4 pb-[13px] border-b-[3px] font-bold text-sm transition-all ${activeTab === 'ingredients' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
          >
            Ingredients
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex-1 flex flex-col items-center pt-4 pb-[13px] border-b-[3px] font-bold text-sm transition-all ${activeTab === 'instructions' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
          >
            Instructions
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin text-primary">
              <span className="material-symbols-outlined text-4xl">refresh</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Generating AI Recipe...</p>
          </div>
        ) : activeTab === 'ingredients' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">What you'll need</h3>
                {isScaling && (
                  <span className="text-[10px] text-primary animate-pulse font-bold uppercase">AI Scaling...</span>
                )}
              </div>
              <button
                onClick={handleAddToList}
                className="text-primary text-xs font-bold flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                Add to list
              </button>
            </div>
            <div className="space-y-3">
              {(mealData.ingredients || []).map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={checkedIngredients.has(idx)}
                    onChange={() => toggleIngredient(idx)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Step-by-step Guide</h3>
            <div className="space-y-6">
              {(mealData.instructions || []).map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 size-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-5 rounded-2xl bg-saffron/10 border border-saffron/20 flex items-start gap-4">
          <div className="bg-saffron/20 p-2 rounded-lg">
            <span className="material-symbols-outlined text-saffron text-xl">lightbulb</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-tight text-saffron-700 mb-1">Chef's Secret Tip</p>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              "{mealData.tip || "For an authentic flavor, ensure you use fresh ingredients and adjust spices to your liking."}"
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 pb-8 flex gap-3 z-50">
        <button
          onClick={() => {
            setIsCooking(true);
            setCurrentStep(0);
          }}
          className="flex-1 h-14 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/30 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">skillet</span>
          Start Interactive Cooking
        </button>
        <button className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <span className="material-symbols-outlined">share</span>
        </button>
      </div>
      {/* Interactive Cooking Overlay (Teleprompter) */}
      {isCooking && mealData.instructions && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col pt-safe animate-in fade-in transition-all">
          <div className="flex items-center justify-between p-6 text-white bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
            <button
              onClick={() => setIsCooking(false)}
              className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">Step {currentStep + 1} of {mealData.instructions.length}</p>
              <p className="text-xs font-bold text-white/60 truncate max-w-[200px]">{mealData.name}</p>
            </div>
            <button
              onClick={() => setIsSpeaking(!isSpeaking)}
              className={`size-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform ${isSpeaking ? 'bg-primary text-white' : 'bg-white/10 text-white/40'}`}
            >
              <span className="material-symbols-outlined">{isSpeaking ? 'volume_up' : 'volume_off'}</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 text-center pb-20">
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <span className="inline-flex py-1.5 px-3 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Instruction</span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.2] teleprompter-shadow">
                {mealData.instructions[currentStep]}
              </h2>
            </div>
          </div>

          <div className="p-8 grid grid-cols-2 gap-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="h-16 rounded-2xl border-2 border-white/20 bg-white/5 text-white font-black flex items-center justify-center gap-3 active:bg-white/10 disabled:opacity-20 transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              PREV
            </button>
            <button
              onClick={() => {
                if (currentStep < mealData.instructions.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  setIsCooking(false);
                }
              }}
              className="h-16 rounded-2xl bg-primary text-white font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 active:scale-95 transition-transform"
            >
              {currentStep < mealData.instructions.length - 1 ? 'NEXT' : 'FINISH'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[110] transition-all duration-500 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3 bg-gradient-to-r from-saffron to-primary text-white px-6 py-3 rounded-full shadow-2xl shadow-primary/40 border border-white/20 whitespace-nowrap">
          <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm font-bold">check</span>
          </div>
          <span className="font-bold text-sm">Added to Grocery List!</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
