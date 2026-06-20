import React from 'react';
import { Compass, Flame } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#141b15] flex flex-col items-center justify-center p-6 z-50 transition-opacity duration-500">
      {/* Background radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,120,44,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex flex-col items-center text-center gap-6 relative z-10 animate-fade-in">
        {/* Logo Container with rotating compass outer ring and pulsing flame center */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer Compass Ring - Rotating subtly */}
          <div className="absolute inset-0 rounded-full border border-stone-700 border-dashed animate-[spin_20s_linear_infinite]" />
          
          {/* Outer Border with double ring */}
          <div className="absolute inset-2 rounded-full border-2 border-stone-800" />
          
          {/* Inner Circle background */}
          <div className="w-20 h-20 bg-[#1a231b] border-2 border-[#c4782c] rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
            <img 
              src="/favicon.svg" 
              alt="School of Life Logo" 
              className="w-full h-full object-cover p-2.5 opacity-90"
              onError={(e) => {
                // Fallback icon if favicon isn't available
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback Icon */}
            <div className="hidden absolute inset-0 items-center justify-center text-[#c4782c]">
              <Compass className="w-10 h-10 animate-pulse" />
            </div>
          </div>
          
          {/* Small decorative campfire flame at the bottom right */}
          <div className="absolute bottom-1 right-1 bg-campfire p-1.5 rounded-full border border-stone-900 shadow-sm animate-bounce">
            <Flame className="w-3.5 h-3.5 text-canvas fill-current" />
          </div>
        </div>

        {/* Text Header */}
        <div className="flex flex-col gap-2 mt-2">
          <h1 className="font-display font-black text-3xl text-stone-100 uppercase tracking-widest leading-none">
            SCHOOL OF LIFE
          </h1>
          <div className="h-0.5 w-16 bg-campfire mx-auto rounded-full" />
          <p className="text-[10px] text-[#c4782c] font-black uppercase tracking-widest mt-1">
            Brothers Only • Windsor Ontario
          </p>
        </div>

        {/* Tagline */}
        <p className="text-stone-400 text-xs font-medium max-w-xs mt-1 leading-relaxed">
          Connecting with Allah's Creation.<br />
          Building Bonds of Brotherhood.
        </p>

        {/* Loading Spinner / Indicator */}
        <div className="flex flex-col items-center gap-2 mt-8">
          <div className="flex gap-1.5 items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#c4782c] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-forest animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-[#c4782c] animate-bounce" />
          </div>
          <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider mt-1">
            Setting Camp...
          </span>
        </div>
      </div>
    </div>
  );
}
