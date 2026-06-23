import React from 'react';
import { Compass, Flame, TreePine, Users, Award } from 'lucide-react';

export default function SplashScreen({ fadingOut }) {
  return (
    <div className={`fixed inset-0 bg-[#141b15] flex flex-col items-center justify-center p-6 z-50 ${fadingOut ? 'animate-fade-out' : ''}`}>
      {/* Background radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,120,44,0.08)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Subtle forest texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(30,63,32,0.15)_0%,transparent_60%)] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex flex-col items-center text-center gap-5 relative z-10">
        {/* Logo Container with rotating compass outer ring */}
        <div className="relative w-24 h-24 flex items-center justify-center animate-fade-in">
          {/* Outer Compass Ring - Rotating subtly */}
          <div className="absolute inset-0 rounded-full border border-stone-700 border-dashed animate-[spin_20s_linear_infinite]" />
          
          {/* Outer Border with double ring */}
          <div className="absolute inset-2 rounded-full border-2 border-stone-800" />
          
          {/* Inner Circle background */}
          <div className="w-18 h-18 bg-[#1a231b] border-2 border-[#c4782c] rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
            <img 
              src="/logo.png" 
              alt="School of Life Logo" 
              className="w-full h-full object-cover p-2 opacity-90"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback Icon */}
            <div className="hidden absolute inset-0 items-center justify-center text-[#c4782c]">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          
          {/* Small decorative campfire flame at the bottom right */}
          <div className="absolute bottom-0.5 right-0.5 bg-campfire p-1 rounded-full border border-stone-900 shadow-sm animate-bounce">
            <Flame className="w-3 h-3 text-canvas fill-current" />
          </div>
        </div>

        {/* Text Header */}
        <div className="flex flex-col gap-1.5 animate-fade-in-delay-1">
          <h1 className="font-display font-black text-2xl text-stone-100 uppercase tracking-widest leading-none">
            SCHOOL OF LIFE
          </h1>
          <div className="h-0.5 w-12 bg-campfire mx-auto rounded-full" />
          <p className="text-[10px] text-[#c4782c] font-black uppercase tracking-widest">
            Brothers Only • Windsor Ontario
          </p>
        </div>

        {/* Tagline */}
        <p className="text-stone-400 text-xs font-medium max-w-[240px] leading-relaxed animate-fade-in-delay-2">
          Connecting with Allah's Creation.<br />
          Building Bonds of Brotherhood.
        </p>

        {/* Program Description Card */}
        <div className="max-w-[280px] bg-[#1a231b]/60 border border-stone-700/50 backdrop-blur-sm px-5 py-4 rounded-xl animate-fade-in-delay-3">
          <span className="text-campfire text-[9px] font-black uppercase tracking-widest block mb-2">Our Program</span>
          <p className="text-stone-400 text-[11px] leading-relaxed font-medium">
            A Sunnah-centered outdoor skills program for brothers 18+. 
            Train in archery, kayaking, survival skills, and physical discipline 
            — building resilience through nature and deep brotherhood.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-forest/30 border border-forest/40 rounded-full text-[9px] text-stone-300 font-bold">
              <TreePine className="w-2.5 h-2.5" /> Outdoor Skills
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-campfire/20 border border-campfire/30 rounded-full text-[9px] text-stone-300 font-bold">
              <Users className="w-2.5 h-2.5" /> Brotherhood
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#c4782c]/20 border border-[#c4782c]/30 rounded-full text-[9px] text-stone-300 font-bold">
              <Award className="w-2.5 h-2.5" /> Earn Badges
            </span>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-2 mt-2 animate-fade-in-delay-4">
          <div className="flex gap-1.5 items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4782c] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4782c] animate-bounce" />
          </div>
          <span className="text-[8px] text-stone-600 font-bold uppercase tracking-wider">
            Setting Camp...
          </span>
        </div>
      </div>
    </div>
  );
}
