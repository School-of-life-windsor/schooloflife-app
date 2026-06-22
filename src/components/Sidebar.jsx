import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Trophy, Shield, Users, LogOut, ChevronDown, Eye } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, role, setRole, user, calculatedRank, onLogout }) {
  const [showRolePreview, setShowRolePreview] = useState(false);

  const menuItems = [
    { id: 'Dashboard', label: 'Notice Board', icon: LayoutDashboard, shortLabel: 'Board' },
    { id: 'Events', label: 'Expedition Map', icon: Calendar, shortLabel: 'Map' },
    { id: 'Badges', label: 'Logbook', icon: Trophy, shortLabel: 'Log' },
  ];

  // Admins can see the User Directory panel
  if (role === 'ADMIN') {
    menuItems.push({ id: 'UserManagement', label: 'User Directory', icon: Users, shortLabel: 'Users' });
  }

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
  };

  return (
    <aside className="w-full lg:w-76 shrink-0 flex flex-col justify-between bg-stone-100 lg:bg-transparent lg:h-screen lg:sticky lg:top-0 lg:p-6 border-b-2 lg:border-b-0 lg:border-r-2 border-stone-900 z-40">
      {/* Top Brand & Controls */}
      <div className="flex flex-col lg:gap-5">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* Mobile Header — with safe-area padding for Dynamic Island */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="lg:hidden mobile-header-safe bg-forest">
          <div className="flex items-center gap-2 px-4 py-2.5 text-canvas">
            <img src="/favicon.svg" alt="School of Life Logo" className="w-6 h-6 rounded-full object-cover border border-stone-600 bg-canvas" />
            <span className="font-display font-black text-xs tracking-wider uppercase">School of Life</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* Desktop Header — original trail-guide style */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex items-center justify-between gap-3 bg-forest text-canvas p-3.5 trail-border trail-shadow rounded-sm">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="School of Life Logo" className="w-8 h-8 rounded-full object-cover border border-stone-900 bg-canvas" />
            <span className="font-display font-black text-sm tracking-wider uppercase">School of Life</span>
          </div>
        </div>

        {/* Role Selector — collapsible on all viewports */}
        {user.role === 'ADMIN' && (
          <div className="bg-stone-200 trail-border rounded-sm overflow-hidden mx-4 mt-3 lg:mx-0 lg:mt-5">
            <button
              onClick={() => setShowRolePreview(!showRolePreview)}
              className="w-full flex items-center justify-between p-2 cursor-pointer hover:bg-stone-300/50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-stone-500" />
                <span className="text-[9px] uppercase font-black text-stone-500 tracking-wider">Preview Role Clearance</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-stone-500 transition-transform duration-200 ${showRolePreview ? 'rotate-180' : ''}`} />
            </button>
            
            {showRolePreview && (
              <div className="grid grid-cols-2 gap-1.5 px-2 pb-2">
                <button
                  id="role-member-toggle"
                  onClick={() => setRole('COMMUNITY_MEMBER')}
                  className={`text-[9px] text-center py-1 font-black uppercase transition-all border rounded-sm truncate ${
                    role === 'COMMUNITY_MEMBER' || role === 'MEMBER'
                      ? 'bg-forest text-canvas border-forest shadow-sm'
                      : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                  }`}
                  title="Community Member"
                >
                  Community
                </button>
                <button
                  id="role-core-toggle"
                  onClick={() => setRole('CORE_MEMBER')}
                  className={`text-[9px] text-center py-1 font-black uppercase transition-all border rounded-sm truncate ${
                    role === 'CORE_MEMBER'
                      ? 'bg-forest text-canvas border-forest shadow-sm'
                      : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                  }`}
                  title="Core Member"
                >
                  Core
                </button>
                <button
                  id="role-volunteer-toggle"
                  onClick={() => setRole('VOLUNTEER')}
                  className={`text-[9px] text-center py-1 font-black uppercase transition-all border rounded-sm truncate ${
                    role === 'VOLUNTEER'
                      ? 'bg-forest text-canvas border-forest shadow-sm'
                      : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                  }`}
                  title="Volunteer"
                >
                  Volunteer
                </button>
                <button
                  id="role-admin-toggle"
                  onClick={() => setRole('ADMIN')}
                  className={`text-[9px] text-center py-1 font-black uppercase transition-all border rounded-sm truncate ${
                    role === 'ADMIN'
                      ? 'bg-campfire text-canvas border-campfire shadow-sm'
                      : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                  }`}
                  title="Admin"
                >
                  Admin
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu (Hidden on Mobile, shown on Desktop) */}
        <nav className="hidden lg:flex flex-col gap-3 mt-4 px-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id.toLowerCase()}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 px-4 py-3 text-left font-bold font-display trail-border cursor-pointer transition-all duration-100 rounded-sm ${
                  isActive
                    ? 'bg-campfire text-canvas trail-shadow translate-x-[-2px] translate-y-[-2px]'
                    : 'bg-stone-100 hover:bg-stone-200 hover:translate-x-[1px] hover:translate-y-[1px]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Digital Membership Card & Zeffy Purchase Button (Desktop Viewport) */}
      <div className="hidden lg:flex flex-col gap-4 mt-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 text-canvas p-5 trail-border trail-shadow rounded-sm">
          {/* Card Accent Lines */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-campfire/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-forest/20 rounded-full blur-xl"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] tracking-widest text-stone-400 uppercase font-bold">School of Life</span>
              <span className="font-display font-extrabold text-sm text-campfire tracking-wide">BROTHERHOOD</span>
            </div>
            <Shield className="w-6 h-6 text-campfire" />
          </div>

          <div className="mt-6">
            <h4 className="font-display font-extrabold text-base tracking-wide uppercase">{user.name}</h4>
            <div className="flex justify-between items-center mt-2 text-stone-400 text-xs font-semibold">
              <span>ID: {user.member_id || user.memberId}</span>
              <span className="bg-stone-700/80 px-2 py-0.5 rounded-sm text-canvas border border-stone-600">
                Rank: {calculatedRank}
              </span>
            </div>
          </div>
        </div>

        {/* Zeffy Buy Membership Button */}
        <a
          id="zeffy-registration-btn"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Zeffy Registration Link: Coming Soon! (Purchase Link will be linked here)");
          }}
          className="bg-campfire text-canvas text-center py-3 px-4 font-display font-black uppercase tracking-wider trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(28,25,23,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 rounded-sm cursor-pointer"
        >
          Register via Zeffy
          <span className="block text-[10px] text-stone-200 font-bold mt-0.5">MEMBERSHIP: $150.00</span>
        </a>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full bg-stone-300 text-stone-700 py-2.5 text-xs font-bold uppercase border-2 border-stone-850 hover:bg-stone-200 transition-colors cursor-pointer rounded-sm"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* iOS-Native Tab Bar (Mobile Viewport)                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 ios-tab-bar px-2 pt-1.5 flex items-start justify-around z-50">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-mobile-${item.id.toLowerCase()}`}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[56px] transition-colors duration-150 ${
                isActive
                  ? 'text-forest'
                  : 'text-stone-400 active:text-stone-600'
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.shortLabel}
              </span>
            </button>
          );
        })}
        
        {/* Logout Tab Item */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[56px] text-stone-400 active:text-stone-600 transition-colors duration-150"
        >
          <LogOut className="w-[22px] h-[22px]" strokeWidth={1.8} />
          <span className="text-[10px] font-medium leading-tight">Exit</span>
        </button>
      </div>
    </aside>
  );
}
