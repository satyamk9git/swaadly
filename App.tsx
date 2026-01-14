
import React, { useState, useEffect } from 'react';
import './index.css';
import { Screen, Meal, GroceryItem } from './types';
import { INITIAL_MEALS, GROCERY_ITEMS } from './constants';
import Welcome from './screens/Welcome';
import Onboarding from './screens/Onboarding';
import Planner from './screens/Planner';
import Grocery from './screens/Grocery';
import Household from './screens/Household';
import RecipeDetail from './screens/RecipeDetail';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Welcome);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(GROCERY_ITEMS);

  // Simple state management for demo purposes
  const navigateTo = (screen: Screen, mealId: string | null = null) => {
    if (mealId) setSelectedMealId(mealId);
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Welcome:
        return <Welcome onContinue={() => navigateTo(Screen.Onboarding)} />;
      case Screen.Onboarding:
        return <Onboarding onComplete={() => navigateTo(Screen.Planner)} />;
      case Screen.Planner:
        return <Planner
          meals={meals}
          setMeals={setMeals}
          onNavigate={navigateTo}
          onMealClick={(id) => navigateTo(Screen.Recipe, id)}
        />;
      case Screen.Grocery:
        return <Grocery
          items={groceryItems}
          setItems={setGroceryItems}
          onNavigate={navigateTo}
        />;
      case Screen.Household:
        return <Household onNavigate={navigateTo} />;
      case Screen.Recipe:
        return <RecipeDetail
          mealId={selectedMealId}
          meals={meals}
          setGroceryItems={setGroceryItems}
          onBack={() => navigateTo(Screen.Planner)}
        />;
      default:
        return <Welcome onContinue={() => navigateTo(Screen.Onboarding)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[480px] bg-white shadow-2xl min-h-screen relative overflow-x-hidden flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
