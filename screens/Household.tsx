
import React from 'react';
import { Screen } from '../types';
import { FAMILY_MEMBERS } from '../constants';
import BottomNav from '../components/BottomNav';

interface HouseholdProps {
  onNavigate: (screen: Screen) => void;
}

const Household: React.FC<HouseholdProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-[#f8f6f6] pb-32 overflow-y-auto">
      <div className="sticky top-0 z-50 bg-[#f8f6f6]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <div className="flex size-12 items-center">
          <div className="size-10 rounded-full border-2 border-primary/20 bg-cover bg-center" style={{ backgroundImage: 'url("https://picsum.photos/seed/user/100/100")' }}></div>
        </div>
        <h2 className="text-xl font-bold flex-1 ml-3">My Household</h2>
        <button className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>

      <main className="max-w-md mx-auto w-full">
        <div className="px-4 pt-4 flex justify-between items-end">
          <h2 className="text-[22px] font-bold leading-tight">Family Members</h2>
          <span className="text-primary text-sm font-semibold">4 Members</span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          {FAMILY_MEMBERS.map(member => (
            <div key={member.name} className="flex flex-col gap-3 text-center p-4 bg-white rounded-xl shadow-sm border border-black/5">
              <div className="px-6">
                <div
                  className="w-full aspect-square rounded-full ring-4 ring-primary/10 bg-cover bg-center"
                  style={{ backgroundImage: `url("${member.avatar}")` }}
                ></div>
              </div>
              <div>
                <p className="text-base font-bold">{member.name}</p>
                <p className={`text-xs font-medium mt-1 ${member.restriction ? 'text-primary uppercase tracking-wider' : 'text-gray-500'}`}>
                  {member.restriction ? `NO ${member.restriction.toUpperCase()}` : member.tagline}
                </p>
              </div>
            </div>
          ))}

          <button className="flex flex-col items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl border-2 border-dashed border-primary/30 group active:scale-95 transition-transform">
            <div className="text-primary flex items-center justify-center rounded-full bg-primary/20 size-14 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <p className="text-primary text-sm font-bold">Invite Family</p>
          </button>
        </div>

        <div className="px-4 pt-4">
          <h2 className="text-[22px] font-bold">Household Vibe</h2>
          <p className="text-gray-500 text-sm mt-1">Overall cooking effort preference</p>
        </div>

        <div className="p-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <span className="material-symbols-outlined material-symbols-filled">local_fire_department</span>
                </div>
                <div>
                  <p className="text-lg font-bold">Medium Effort</p>
                  <p className="text-xs text-gray-500">Balancing flavor & time</p>
                </div>
              </div>
              <button className="text-primary flex items-center gap-1 font-bold text-sm">
                <span>Edit</span>
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
            </div>
            <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-primary w-[65%] rounded-full"></div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Quick & Easy</span>
              <span>Chef Mode</span>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 mb-24">
          <h2 className="text-lg font-bold mb-3">Sync Tastes</h2>
          <div className="space-y-2">
            {[
              { label: 'Cuisine Preferences', sub: 'Mostly North Indian, Marathi', icon: 'restaurant_menu', color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Dietary Restrictions', sub: '1 Alert: Mushrooms', icon: 'nutrition', color: 'text-emerald-500', bg: 'bg-emerald-50' }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-4 bg-white px-4 min-h-[64px] rounded-xl shadow-sm group cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`${item.color} ${item.bg} flex items-center justify-center rounded-lg size-10`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={`text-xs ${item.label.includes('Restriction') ? 'text-primary font-bold' : 'text-gray-500'}`}>{item.sub}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50">
        <BottomNav currentScreen={Screen.Household} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default Household;
