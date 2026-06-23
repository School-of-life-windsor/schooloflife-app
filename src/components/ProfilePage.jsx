import React, { useState } from 'react';
import { User, Shield, Key, Eye, HelpCircle, FileText, AlertTriangle, LogOut, ChevronDown, Check, Edit2, Users, ChevronRight, ArrowLeft, Bell } from 'lucide-react';

export default function ProfilePage({
  role,
  setRole,
  currentUser,
  onUpdateCurrentUser,
  onDeleteAccount,
  onLogout,
  setActiveView
}) {
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Settings form states
  const [name, setName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [age, setAge] = useState(currentUser.age || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Accordions on main profile screen
  const [showRolePreview, setShowRolePreview] = useState(false);
  const [showTOS, setShowTOS] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);

  // Notification state
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'default'
  );

  const calculatedRank = currentUser.rank || 'Tenderfoot';

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This device does not support push notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      alert("Notification alerts enabled successfully!");
    } else {
      alert("Notification permissions denied.");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setIsSaving(false);
      return;
    }

    try {
      const fieldsToUpdate = {
        name,
        username,
        age: age ? parseInt(age, 10) : null,
        email
      };

      if (password) {
        fieldsToUpdate.password = password;
      }

      await onUpdateCurrentUser(fieldsToUpdate);
      setMessage({ type: 'success', text: 'Account settings saved successfully!' });
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowAccountSettings(false), 800);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update settings. Please check your inputs.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    const userId = currentUser.id || currentUser.memberId || currentUser.member_id;
    onDeleteAccount(userId);
  };

  const handleToggleWaiver = async () => {
    try {
      const newConsent = !currentUser.waiver_consent;
      await onUpdateCurrentUser({ waiver_consent: newConsent });
      setMessage({
        type: 'success',
        text: newConsent ? 'Waiver signed successfully!' : 'Waiver consent withdrawn.'
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update waiver consent.' });
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // Sub-View: Account Settings Page
  // ════════════════════════════════════════════════════════════════════════
  if (showAccountSettings) {
    return (
      <section className="flex flex-col gap-6 w-full max-w-xl mx-auto pb-24 animate-fade-in">
        {/* Sub-Header */}
        <div className="flex items-center gap-3 border-b-4 border-stone-900 pb-3">
          <button
            onClick={() => {
              setShowAccountSettings(false);
              setMessage({ type: '', text: '' });
            }}
            className="p-1 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-stone-900" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tight text-forest m-0 uppercase">
              Account Settings
            </h1>
            <p className="text-stone-600 text-xs font-semibold">
              Edit your name, login identifiers, contact email, and credentials.
            </p>
          </div>
        </div>

        {message.text && (
          <div
            className={`p-3 trail-border rounded-sm text-xs font-bold uppercase ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-800 text-emerald-950'
                : 'bg-red-50 border-red-900 text-red-950'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="bg-stone-100 p-6 trail-border trail-shadow rounded-sm flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-canvas border-2 border-stone-900 p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-canvas border-2 border-stone-900 p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                className="w-full bg-canvas border-2 border-stone-900 p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Member ID (Static)</label>
              <input
                type="text"
                disabled
                value={currentUser.member_id || currentUser.memberId || ''}
                className="w-full bg-stone-200 border-2 border-stone-300 p-2 text-xs font-bold rounded-sm text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-canvas border-2 border-stone-900 p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
            />
          </div>

          <div className="border-t border-stone-300 pt-4 mt-2">
            <h4 className="font-display font-extrabold text-xs uppercase text-stone-850 mb-3 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-campfire" /> Reset Password
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase font-black text-stone-600 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-canvas border-2 border-stone-900 p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-black text-stone-600 mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-canvas border-2 border-stone-900 p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={() => {
                setShowAccountSettings(false);
                setMessage({ type: '', text: '' });
              }}
              className="bg-stone-300 text-stone-750 px-4 py-2 text-xs font-black uppercase rounded-sm cursor-pointer hover:bg-stone-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-campfire text-canvas px-5 py-2 text-xs font-black uppercase trail-border rounded-sm cursor-pointer hover:shadow-sm transition-all"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* Delete Account (Unified Compliance Section) */}
        <div className="bg-red-55/60 border-2 border-red-900/40 rounded-sm p-5 mt-4 flex flex-col gap-3 trail-shadow">
          <div className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-display font-extrabold uppercase m-0">
              Delete Account
            </h3>
          </div>
          <p className="text-xs text-red-950 font-bold leading-relaxed m-0">
            Deleting your account will permanently wipe your profile record, merit badge achievements, and self-attested growth logs. This action is irreversible.
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you absolutely certain you want to permanently delete your School of Life account? All badges, progress, and account access will be erased immediately. This cannot be undone.")) {
                handleDelete();
              }
            }}
            className="w-fit bg-red-700 text-canvas px-4 py-2 text-xs font-black uppercase rounded-sm hover:bg-red-800 transition-colors cursor-pointer border border-red-900 trail-shadow-sm active:translate-y-[1px] active:shadow-none"
          >
            Permanently Delete Account
          </button>
        </div>
      </section>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // Main Profile Screen
  // ════════════════════════════════════════════════════════════════════════
  return (
    <section className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-24 animate-fade-in">
      {/* Title */}
      <div className="flex items-center gap-3 border-b-4 border-stone-900 pb-3">
        <User className="w-8 h-8 text-forest shrink-0" />
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-forest m-0 uppercase">
            My Profile
          </h1>
          <p className="text-stone-600 text-sm">
            Manage your brotherhood credentials, clearances, and security configurations.
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-3 trail-border rounded-sm text-xs font-bold uppercase bg-emerald-50 border-emerald-800 text-emerald-950`}
        >
          {message.text}
        </div>
      )}

      {/* Membership Details Card */}
      <div className="bg-gradient-to-br from-stone-850 to-stone-900 text-canvas p-6 trail-border trail-shadow rounded-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-campfire/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-forest/20 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-4 z-10">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest text-stone-400 uppercase font-black">School of Life</span>
            <span className="font-display font-black text-sm text-campfire tracking-wide uppercase">Brotherhood Membership</span>
          </div>
          <Shield className="w-6 h-6 text-campfire shrink-0" />
        </div>

        <div className="my-6 z-10">
          <h4 className="font-display font-extrabold text-lg tracking-wide uppercase text-canvas">
            {currentUser.name}
          </h4>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-stone-300">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Member ID</span>
              <span className="font-mono font-bold text-stone-100">{currentUser.member_id || currentUser.memberId}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Clearance Level</span>
              <span className="font-mono font-bold text-stone-100">
                {role === 'ADMIN' ? 'Admin' :
                 role === 'VOLUNTEER' ? 'Volunteer' :
                 role === 'CORE_MEMBER' ? 'Core Member' : 'Community Member'}
              </span>
            </div>
            <div className="col-span-2 mt-1">
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Email Address</span>
              <span className="font-mono truncate block text-stone-100">{currentUser.email || 'No email bound'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 border-t border-stone-700/60 pt-4 z-10">
          <span className="text-xs font-bold text-stone-400">Calculated Rank:</span>
          <span className="bg-stone-700 px-3 py-1 rounded-sm text-xs font-black uppercase text-canvas border border-stone-600">
            {calculatedRank}
          </span>
        </div>
      </div>

      {/* Account Settings Sub-Page Tab Row */}
      <button
        onClick={() => setShowAccountSettings(true)}
        className="flex items-center justify-between w-full p-4 bg-stone-100 hover:bg-stone-200 transition-all trail-border trail-shadow rounded-sm cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px]"
      >
        <div className="flex items-center gap-2.5">
          <Key className="w-5 h-5 text-forest shrink-0" />
          <span className="font-display font-black uppercase text-stone-900 text-sm">Account Details & Password Settings</span>
        </div>
        <ChevronRight className="w-5 h-5 text-stone-700 shrink-0" />
      </button>

      {/* Notifications Toggle row */}
      <div className="flex items-center justify-between p-4 bg-[#EAE6DF] trail-border trail-shadow rounded-sm">
        <div className="flex items-center gap-2.5 pr-2">
          <Bell className="w-5 h-5 text-forest shrink-0" />
          <div className="text-left">
            <span className="font-display font-black uppercase text-stone-900 text-sm block">Device Push Alerts</span>
            <span className="text-[10px] text-stone-600 font-bold block leading-tight">
              Get notified immediately when new board notices or events are posted
            </span>
          </div>
        </div>
        <button
          onClick={requestNotificationPermission}
          className={`px-3 py-1.5 text-xs font-black uppercase rounded-sm border-2 border-stone-900 cursor-pointer transition-colors shadow-sm ${
            notificationPermission === 'granted'
              ? 'bg-forest text-canvas border-forest'
              : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
          }`}
        >
          {notificationPermission === 'granted' ? 'Alerts Enabled' : 'Enable Alerts'}
        </button>
      </div>

      {/* Admin Action Switchers */}
      {currentUser.role === 'ADMIN' && (
        <div className="bg-stone-200 trail-border trail-shadow rounded-sm overflow-hidden flex flex-col">
          {/* Quick User Management Directory Switcher */}
          <div className="bg-stone-900 text-canvas p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-stone-800">
            <div>
              <h4 className="font-display font-black text-sm uppercase text-campfire m-0">
                Admin Directory Clearance
              </h4>
              <p className="text-[11px] text-stone-300 font-semibold m-0">
                Manage members, roles, approvals, and verify credentials.
              </p>
            </div>
            <button
              onClick={() => setActiveView('UserManagement')}
              className="bg-campfire text-canvas px-4 py-2 text-xs font-black uppercase rounded-sm hover:bg-orange-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5 trail-border"
            >
              <Users className="w-4 h-4" /> Open User Directory
            </button>
          </div>

          {/* Relocated Role Preview Toggle */}
          <button
            onClick={() => setShowRolePreview(!showRolePreview)}
            className="w-full flex items-center justify-between p-3.5 cursor-pointer hover:bg-stone-300/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-stone-700 shrink-0" />
              <span className="text-xs uppercase font-black text-stone-800 tracking-wider">
                Simulate Custom Role Preview Clearances
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-700 transition-transform duration-200 ${showRolePreview ? 'rotate-180' : ''}`} />
          </button>
          
          {showRolePreview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 pb-4 bg-stone-200">
              <button
                onClick={() => setRole('COMMUNITY_MEMBER')}
                className={`text-[10px] text-center py-2 font-black uppercase transition-all border rounded-sm truncate ${
                  role === 'COMMUNITY_MEMBER' || role === 'MEMBER'
                    ? 'bg-forest text-canvas border-forest shadow-sm'
                    : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Community Member
              </button>
              <button
                onClick={() => setRole('CORE_MEMBER')}
                className={`text-[10px] text-center py-2 font-black uppercase transition-all border rounded-sm truncate ${
                  role === 'CORE_MEMBER'
                    ? 'bg-forest text-canvas border-forest shadow-sm'
                    : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Core Member
              </button>
              <button
                onClick={() => setRole('VOLUNTEER')}
                className={`text-[10px] text-center py-2 font-black uppercase transition-all border rounded-sm truncate ${
                  role === 'VOLUNTEER'
                    ? 'bg-forest text-canvas border-forest shadow-sm'
                    : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Volunteer Clearance
              </button>
              <button
                onClick={() => setRole('ADMIN')}
                className={`text-[10px] text-center py-2 font-black uppercase transition-all border rounded-sm truncate ${
                  role === 'ADMIN'
                    ? 'bg-campfire text-canvas border-campfire shadow-sm'
                    : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Admin Authority
              </button>
            </div>
          )}
        </div>
      )}

      {/* Accordions: TOS & Waiver */}
      <div className="flex flex-col gap-4">
        
        {/* Terms of Service Accordion */}
        <div className="bg-[#EAE6DF] trail-border trail-shadow rounded-sm overflow-hidden">
          <button
            onClick={() => setShowTOS(!showTOS)}
            className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-stone-200/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-forest shrink-0" />
              <span className="text-xs sm:text-sm font-display font-extrabold uppercase text-stone-900">
                Terms of Service & Rules of Conduct (TOC)
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-650 transition-transform duration-200 ${showTOS ? 'rotate-180' : ''}`} />
          </button>

          {showTOS && (
            <div className="px-4 pb-4 border-t border-stone-350 pt-3">
              <div className="max-h-[180px] overflow-y-auto text-xs text-stone-700 leading-relaxed pr-2 font-medium bg-canvas/30 p-3 rounded-sm border border-stone-300">
                <p className="font-bold mb-2 uppercase text-forest">1. BROTHERHOOD PROTOCOL</p>
                <p className="mb-3">
                  All School of Life activities require absolute respect, discipline, and adherence to Islamic etiquette. Members must support one another and maintain safety standards during outdoor camps.
                </p>
                <p className="font-bold mb-2 uppercase text-forest">2. SECURITY & ACCESS</p>
                <p className="mb-3">
                  Passwords and member IDs are personal and must not be shared. Ranks are assigned solely based on vetted merit badge completions verified by certified program leaders.
                </p>
                <p className="font-bold mb-2 uppercase text-forest">3. CANCEL & REGISTRATION RULES</p>
                <p className="">
                  Programs have strict seating capacities. Failure to attend booked sessions without notice may result in suspension of membership status.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Waiver Consent Framework Accordion */}
        <div className="bg-[#EAE6DF] trail-border trail-shadow rounded-sm overflow-hidden">
          <button
            onClick={() => setShowWaiver(!showWaiver)}
            className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-stone-200/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-forest shrink-0" />
              <span className="text-xs sm:text-sm font-display font-extrabold uppercase text-stone-900">
                Liability Waiver Framework
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-650 transition-transform duration-200 ${showWaiver ? 'rotate-180' : ''}`} />
          </button>

          {showWaiver && (
            <div className="px-4 pb-4 border-t border-stone-350 pt-3 flex flex-col gap-3">
              <div className="text-xs text-stone-700 leading-relaxed font-semibold bg-canvas/30 p-3 rounded-sm border border-stone-300">
                <p className="mb-2">
                  This framework accommodates liability agreements and waiver signatures required for outdoor expeditions (swimming, kayaking, archery).
                </p>
                <p className="text-stone-500 text-[11px]">
                  Status: <span className="font-black text-stone-700">{currentUser.waiver_consent ? '✅ EXECUTED & SIGNED' : '⚠️ SIGNATURE REQUIRED'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 mt-1 bg-canvas p-3 border border-stone-300 rounded-sm">
                <button
                  type="button"
                  onClick={handleToggleWaiver}
                  className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                    currentUser.waiver_consent ? 'bg-forest border-forest text-canvas' : 'border-stone-900 bg-canvas'
                  }`}
                >
                  {currentUser.waiver_consent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <span className="text-[11px] font-bold text-stone-800 select-none">
                  I consent to the terms of the outdoor liability release waiver.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-2 w-full bg-stone-900 text-canvas py-3.5 font-display font-black uppercase tracking-wider trail-border trail-shadow hover:bg-campfire hover:text-canvas transition-colors cursor-pointer rounded-sm mt-4"
      >
        <LogOut className="w-5 h-5" /> Log Out / Terminate Session
      </button>

    </section>
  );
}
