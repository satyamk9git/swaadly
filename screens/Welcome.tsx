import React, { useState } from 'react';

interface WelcomeProps {
  onContinue: () => void;
}

type AuthView = 'welcome' | 'google' | 'mobile';

const Welcome: React.FC<WelcomeProps> = ({ onContinue }) => {
  const [view, setView] = useState<AuthView>('welcome');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOtp) {
      setShowOtp(true);
    } else {
      onContinue();
    }
  };

  const renderWelcome = () => (
    <>
      <div className="relative w-full h-[45vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBu9LuGS8Xj7L79qhsXWqHKe7qw7YQg3iDc0-3scGuEEneszcSbKPbVmucFgBXYEKjIRmAObmmBl-r_WfqDkWo7ZOKiJiZOTZT9K4b6aJF22x-UgiXjlPVFt93owX7WqBgGaNUo9BZ4WeEJZU-ABrLjT-xmjK86bkNQph8_1BJZMdYMVRLXq8xNqxDdZKQJM8hQRsRwFpCCaCPtxREaY5Dvy3JaBp9K7HGJkOl16Xc90mmryzW64LSBAm4QcGfngVXYy6ozjRs8QKke")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fdf8f1]"></div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center justify-center bg-white/90 p-3 rounded-full shadow-lg border border-primary/20">
          <span className="material-symbols-outlined text-primary text-3xl">restaurant</span>
        </div>
      </div>

      <div className="flex flex-col px-6 -mt-8 relative z-10 text-center">
        <h1 className="text-[#181111] tracking-tight text-[36px] font-bold leading-tight">
          Namaste! <br />
          <span className="text-primary">Ready to plan?</span>
        </h1>
        <p className="text-[#4e3d3d] text-base font-normal leading-relaxed pt-4 px-2">
          Discover regional flavors and organize your household kitchen together.
          <span className="font-semibold text-orange-500 ml-1">Let's get cooking.</span>
        </p>
      </div>

      <div className="mt-8 px-6 space-y-4">
        <button
          onClick={() => setView('mobile')}
          className="w-full flex items-center justify-center rounded-xl h-14 bg-primary text-white text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined mr-2">phone_iphone</span>
          Continue with Mobile
        </button>

        <div className="flex items-center py-2">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">Or connect with</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button
          onClick={() => setView('google')}
          className="w-full flex items-center justify-center gap-3 h-12 bg-white text-[#181111] border border-gray-200 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
      </div>
    </>
  );

  const renderGoogleLogin = () => (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-12">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-12 h-12" alt="Google Logo" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Sign in</h2>
        <p className="text-gray-600 text-center mb-8">to continue to Swaadly</p>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={onContinue}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">U</div>
              <div>
                <p className="font-semibold text-sm">User Name</p>
                <p className="text-xs text-gray-500">user@gmail.com</p>
              </div>
            </div>
          </div>
          <button onClick={() => setView('welcome')} className="w-full text-center text-primary font-semibold text-sm pt-4 hover:underline">
            Use another account
          </button>
        </div>
      </div>
      <button onClick={() => setView('welcome')} className="mt-8 text-gray-500 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Go back
      </button>
    </div>
  );

  const renderMobileLogin = () => (
    <div className="flex flex-col h-full px-6 pt-12">
      <h2 className="text-3xl font-bold mb-2">
        {showOtp ? 'Enter code' : 'Enter mobile number'}
      </h2>
      <p className="text-gray-500 mb-8">
        {showOtp ? `Enter the 6-digit code sent to +91 ${phoneNumber}` : "We'll send a code to verify your phone"}
      </p>

      <form onSubmit={handleMobileSubmit} className="space-y-6">
        {!showOtp ? (
          <div className="flex items-center border-b-2 border-primary py-2">
            <span className="text-xl font-semibold mr-3">+91</span>
            <input
              autoFocus
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full text-2xl font-semibold bg-transparent border-none outline-none focus:ring-0 placeholder-gray-300"
            />
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <input
                key={i}
                autoFocus={i === 1}
                type="text"
                maxLength={1}
                className="w-full aspect-square text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
                value={otp[i - 1] || ''}
                readOnly
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={(!showOtp && phoneNumber.length < 10)}
          className={`w-full h-14 rounded-xl font-bold text-lg transition-all ${(!showOtp && phoneNumber.length < 10) ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90'}`}
        >
          {showOtp ? 'Verify & Continue' : 'Send OTP'}
        </button>
      </form>

      {showOtp && (
        <button
          className="mt-6 text-center text-primary font-semibold"
          onClick={() => {
            setShowOtp(false);
            setOtp('');
          }}
        >
          Resend Code
        </button>
      )}

      <button onClick={() => setView('welcome')} className="mt-auto mb-8 text-gray-500 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm">logout</span>
        Cancel
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#fdf8f1] overflow-y-auto">
      {view === 'welcome' && renderWelcome()}
      {view === 'google' && renderGoogleLogin()}
      {view === 'mobile' && renderMobileLogin()}

      {view === 'welcome' && (
        <div className="mt-auto px-6 pb-8 text-center pt-8">
          <p className="text-xs text-gray-400">
            By continuing, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      )}
    </div>
  );
};

export default Welcome;
