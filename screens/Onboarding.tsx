
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [diet, setDiet] = useState('Veg');
  const [spice, setSpice] = useState(3);
  const [cuisines, setCuisines] = useState(['North Indian', 'Punjabi']);

  const toggleCuisine = (c: string) => {
    setCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  return (
    <div className="flex flex-col h-full bg-white pb-24 overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center justify-between">
        <button className="text-primary"><span className="material-symbols-outlined">arrow_back_ios</span></button>
        <h2 className="text-lg font-bold">Onboarding</h2>
        <div className="w-6"></div>
      </div>

      <div className="px-4 py-2">
        <div className="flex justify-between items-end mb-2">
          <p className="font-medium">Food Preferences</p>
          <p className="text-primary text-sm font-bold">Step 3 of 5</p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: '60%' }}></div>
        </div>
      </div>

      <div className="px-4 py-6 text-center">
        <h1 className="text-3xl font-bold">Tell us how you like your food!</h1>
        <p className="text-gray-500 mt-2">We'll use this to tailor your daily meal plans.</p>
      </div>

      <div className="px-4 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Dietary Preference</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Veg', color: 'bg-green-600', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGp2E0pNC8x2-qoTGyQg7S1Xq8w46NufKz3gwXED0XlaoVHLhJYrlWiTonArFvL4N39lxxYoGfU_4hzBN3pOECVkytv5titLOxqbjnigsk4PpHApBUwQvI482l3-CnfHUxFnZbuGebxzRFcC8KU0ItV1oKly67pyuzL-bm3hYEbclieZ8yJZwTTHge0pt-Otx8R9Pg58iwyUHAvVkohsOjbiVhkDK_b-upLZx6hbJ1kjMg7GRL7h11OckDV9dghYF4rQRfMzQbL-iA' },
              { label: 'Non-Veg', color: 'bg-red-600', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdKF8lVasbiJ4B2kKQTjPNcn4UsNLDKb-JalXIkfh_Jf3i6sp-3d7TpT8Te8uLjA61JugeG088MbpqQbLLB_O500pAIv-l85ZLEN4wt3WulB29y-Azpc4a3icS_3ngMcEjb7V-s09I8Fz6_mZjRp3ZPYGNLPJAtaLG9Y-eDtGAmYpM__PuiOGQmmsIKcRAGXe8rUV02BqHuUGTJK2DUh5cYejUxhN3OkPaURJc6m3ohr6cnzHEX15uIljAAhMY3VQMiyawE3_54cry' },
              { label: 'Eggitarian', color: 'bg-yellow-500', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW0IicrEC8640yVHkmmC3RlUQndLu0uCGo3yUotf3JaO3pk8pyPjnLRAKfbJHI30goOD09SDL4ATRvNtUCBr2rlXUc7kHUrOLMnhilGOT6jgX0fkfu4pOHrt0cZ9NpeDIqGAVfBy5B8A45l4_f32lXvMbihQ9Ias5veQDl1SiTJmu8ebCont9wD3t9JZymH_mE5dIcZzR0my-z0q_9Rg7IGV10BKoK3gR6LkqQJgU703noHjUeSqjztF0Qdy3pewlSgoxperUDSOrV' }
            ].map(item => (
              <div 
                key={item.label}
                onClick={() => setDiet(item.label)}
                className={`relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${diet === item.label ? 'border-primary' : 'border-transparent'}`}
                style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%), url("${item.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                </div>
                <p className="absolute bottom-3 left-3 text-white font-bold text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Spice Level</h3>
            <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs">Medium</span>
          </div>
          <input 
            type="range" 
            min="1" max="5" value={spice} 
            onChange={(e) => setSpice(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" 
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Mild</span>
            <span>Teekha</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Cuisine Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {['North Indian', 'South Indian', 'Punjabi', 'Chinese', 'Mughlai', 'Bengali'].map(c => (
              <button 
                key={c}
                onClick={() => toggleCuisine(c)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${cuisines.includes(c) ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-xl flex gap-3 items-start">
          <span className="material-symbols-outlined text-primary">groups</span>
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Tip:</strong> You can invite family members to sync preferences and plan household meals together later!
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-20">
        <button 
          onClick={onComplete}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
        >
          Set Preferences
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
