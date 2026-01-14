
import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: Screen.Planner, label: 'Planner', icon: 'calendar_month' },
    { id: Screen.Grocery, label: 'Grocery', icon: 'shopping_basket' },
    { id: Screen.Recipe, label: 'Recipes', icon: 'menu_book' },
    { id: Screen.Household, label: 'Household', icon: 'house' },
    { id: Screen.Welcome, label: 'Settings', icon: 'more_horiz' }
  ];

  return (
    <nav className="flex justify-around items-center py-2 px-2 bg-white/95 backdrop-blur-lg border-t border-gray-100">
      {navItems.map(item => (
        <button 
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center gap-1 py-1 text-center w-16 transition-all ${currentScreen === item.id ? 'text-primary' : 'text-gray-400 opacity-60'}`}
        >
          <span className={`material-symbols-outlined ${currentScreen === item.id ? 'material-symbols-filled' : ''}`}>{item.icon}</span>
          <p className="text-[10px] font-bold">{item.label}</p>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
