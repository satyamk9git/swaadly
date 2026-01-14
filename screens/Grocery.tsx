
import React, { useState } from 'react';
import { Screen, GroceryItem } from '../types';
import { GROCERY_ITEMS, INITIAL_MEALS } from '../constants';
import { syncGroceryList, classifyGroceryItem, consolidateGroceryList, parseZeptoItems } from '../geminiService';
import BottomNav from '../components/BottomNav';

interface GroceryProps {
  items: GroceryItem[];
  setItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  onNavigate: (screen: Screen) => void;
}

const Grocery: React.FC<GroceryProps> = ({ items, setItems, onNavigate }) => {
  const [listType, setListType] = useState<'personal' | 'shared'>('personal');
  const [isSyncing, setIsSyncing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState('');

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleAISync = async () => {
    setIsSyncing(true);
    const newItems = await syncGroceryList(INITIAL_MEALS);
    setItems(prev => [...prev, ...newItems]);
    setIsSyncing(false);
  };

  const handleManualAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && manualInput.trim()) {
      const newItem: GroceryItem = {
        id: `addon-${Date.now()}`,
        name: manualInput.trim(),
        quantity: "",
        category: "Add-on",
        checked: false,
        addedBy: "You"
      };
      setItems(prev => [newItem, ...prev]);
      setManualInput('');
    }
  };

  const handleOrderOnline = async () => {
    const uncheckedItems = items.filter(i => !i.checked);
    if (uncheckedItems.length === 0) {
      alert("No unchecked items to order!");
      return;
    }

    setIsOrdering(true);
    setAgentLog([]);
    setCurrentAction('Initializing Swaadly Agent...');

    await new Promise(r => setTimeout(r, 1000));
    setAgentLog(prev => [...prev, '⚡ Agent Connected: Swaadly-1.5-Pro']);

    await new Promise(r => setTimeout(r, 800));
    setCurrentAction(`Scanning ${uncheckedItems.length} items...`);

    for (const item of uncheckedItems) {
      setCurrentAction(`Finding ${item.name}...`);
      await new Promise(r => setTimeout(r, 1200));

      const quantityStr = item.quantity ? ` (${item.quantity})` : '';
      setAgentLog(prev => [...prev, `✅ Added: ${item.name}${quantityStr}`]);
      await new Promise(r => setTimeout(r, 500));
    }

    setCurrentAction('Finalizing Zepto Cart...');
    await new Promise(r => setTimeout(r, 1500));

    setIsOrdering(false);
    setShowOrderSuccess(true);
    setTimeout(() => setShowOrderSuccess(false), 4000);
  };

  const categories = Array.from(new Set(items.map(item => item.category)));
  const sortedCategories = (categories as string[])
    .filter(cat => cat !== 'Others')
    .sort((a, b) => {
      if (a === 'Add-on') return -1;
      if (b === 'Add-on') return 1;
      return a.localeCompare(b);
    });

  return (
    <div className="flex flex-col h-full bg-[#f8f7f6] pb-40 overflow-y-auto">
      <div className="sticky top-0 z-50 bg-[#f8f7f6]/90 backdrop-blur-md">
        <div className="flex items-center px-4 py-4 justify-between">
          <button onClick={() => onNavigate(Screen.Planner)} className="size-10 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <h2 className="text-lg font-bold flex-1 text-center font-outfit">Smart Grocery List</h2>
          <button className="size-10 flex items-center justify-center">
            <span className="material-symbols-outlined">group_add</span>
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="flex h-11 items-center rounded-xl bg-[#e6e0db] p-1">
            <button
              onClick={() => setListType('personal')}
              className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${listType === 'personal' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
            >
              Personal
            </button>
            <button
              onClick={() => setListType('shared')}
              className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${listType === 'shared' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
            >
              Shared Household
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-stretch rounded-xl h-12 shadow-sm bg-white overflow-hidden border border-gray-100">
          <div className="text-[#897261] flex items-center justify-center pl-4">
            <span className="material-symbols-outlined">add_circle</span>
          </div>
          <input
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={handleManualAdd}
            className="w-full focus:ring-0 border-none px-4 text-base placeholder:text-gray-400 font-medium"
            placeholder="Add ingredients manually..."
          />
        </div>
      </div>

      <div className="p-4">
        <div className={`flex flex-col gap-4 rounded-xl border border-primary-orange/20 bg-orange-500/5 p-4 transition-all ${isSyncing ? 'opacity-70 animate-pulse' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-orange text-sm">auto_awesome</span>
            <p className="text-primary-orange text-[10px] font-black uppercase tracking-wider">AI Smart Sync</p>
          </div>
          <p className="text-gray-500 text-xs font-medium">Instantly generate a consolidated shopping list from your weekly meal plan.</p>
          <button
            disabled={isSyncing}
            onClick={handleAISync}
            className="w-full bg-primary-orange text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSyncing ? 'Syncing...' : 'Sync from 7-Day Plan'}
          </button>
        </div>
      </div>

      {sortedCategories.map(cat => (
        <div key={cat} className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-orange text-sm">
                {cat === 'Add-on' ? 'list_alt' : cat === 'Vegetables' ? 'potted_plant' : cat === 'Grains & Atta' ? 'bakery_dining' : cat === 'Meat' ? 'set_meal' : 'layers'}
              </span>
              {cat}
            </h3>
          </div>
          <div className="px-4 space-y-2">
            {items.filter(i => i.category === cat).map(item => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-black/5 cursor-pointer hover:border-primary-orange/10 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center ${item.checked ? 'bg-primary-orange border-primary-orange' : 'border-gray-200'}`}>
                    {item.checked && <span className="material-symbols-outlined text-white text-[16px] material-symbols-filled">check</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${item.checked ? 'line-through text-gray-400 font-medium' : 'text-gray-800'}`}>{item.name}</span>
                    {item.quantity && <span className="text-[10px] text-gray-400 font-black uppercase mt-0.5">{item.quantity}</span>}
                  </div>
                </div>
                {item.addedBy && (
                  <div className="h-6 w-6 rounded-full overflow-hidden border-2 border-white ring-1 ring-gray-100 shadow-sm" title={`Added by ${item.addedBy}`}>
                    <img src={`https://picsum.photos/seed/${item.addedBy}/50/50`} alt="Added by" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50 px-4 pt-4 pb-20">
        <div className="flex gap-4 items-center mb-4">
          <button className="flex-1 bg-white border border-gray-200 h-14 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-wider text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-lg">share</span>
            Share
          </button>
          <button
            disabled={isOrdering}
            onClick={handleOrderOnline}
            className="flex-[2] bg-primary-orange text-white h-14 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isOrdering ? (
              <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
            )}
            {isOrdering ? 'Processing...' : 'Order Online'}
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <BottomNav currentScreen={Screen.Grocery} onNavigate={onNavigate} />
        </div>
      </div>

      {showOrderSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white rounded-full py-3 px-6 shadow-2xl border border-green-100 flex items-center gap-3">
            <div className="size-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px] material-symbols-filled">check</span>
            </div>
            <span className="text-gray-800 font-black text-xs uppercase tracking-tight">Successfully ordered {items.filter(i => !i.checked).length} items!</span>
          </div>
        </div>
      )}

      {isOrdering && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 text-left">
          <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-primary-orange p-8 text-white relative">
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse border border-white/20">
                  <span className="material-symbols-outlined text-white text-2xl">bolt</span>
                </div>
                <div className="text-left">
                  <h3 className="font-black text-xl uppercase tracking-tighter leading-none">Swaadly Agent</h3>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Autonomous Assistant</p>
                </div>
              </div>

              <div className="mt-6 bg-black/10 rounded-2xl p-4 border border-white/10">
                <p className="text-xs font-mono text-white/90 animate-pulse flex items-center gap-2">
                  <span className="size-1.5 bg-white rounded-full"></span>
                  {currentAction}
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#f8f7f6] max-h-[350px] overflow-y-auto space-y-3 text-left">
              {agentLog.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="flex justify-center">
                    <span className="material-symbols-outlined text-5xl text-gray-200 animate-spin">refresh</span>
                  </div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-center">Waking up Swaadly Agent...</p>
                </div>
              ) : (
                agentLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 animate-in slide-in-from-left-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="size-5 bg-green-500/10 rounded-full flex items-center justify-center mt-0.5 border border-green-500/20">
                      <span className="material-symbols-outlined text-green-500 text-[14px] font-bold">check</span>
                    </div>
                    <span className="text-xs text-gray-700 font-bold leading-tight">{log}</span>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-white border-t border-gray-100">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-orange animate-progress origin-left"></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Processing Cloud Sync</p>
                <p className="text-[10px] text-primary-orange font-black uppercase tracking-widest animate-pulse">Live</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-40"></div>
    </div>
  );
};

export default Grocery;
