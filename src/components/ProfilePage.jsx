import React, { useState } from 'react';
import { User, Shield, Key, Eye, HelpCircle, FileText, AlertTriangle, LogOut, ChevronDown, Check, Edit2, Users } from 'lucide-react';

export default function ProfilePage({
  role,
  setRole,
  currentUser,
  onUpdateCurrentUser,
  onDeleteAccount,
  onLogout,
  setActiveView
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [age, setAge] = useState(currentUser.age || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Accordion states
  const [showRolePreview, setShowRolePreview] = useState(false);
  const [showTOS, setShowTOS] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const calculatedRank = currentUser.rank || 'Tenderfoot';

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await onUpdateCurrentUser({
        name,
        username,
        age: age ? parseInt(age, 10) : null
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
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

  const handleDelete = () => {
    const userId = currentUser.id || currentUser.memberId || currentUser.member_id;
    onDeleteAccount(userId);
  };

  return (
    <section className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-20 animate-fade-in">
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
          className={`p-3 trail-border rounded-sm text-xs font-bold uppercase ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-800 text-emerald-950'
              : 'bg-red-50 border-red-900 text-red-950'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Grid: Profile Card + Edit Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Membership Details Card */}
        <div className="bg-gradient-to-br from-stone-800 to-stone-900 text-canvas p-6 trail-border trail-shadow rounded-sm relative overflow-hidden flex flex-col justify-between h-fit min-h-[220px]">
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
                <span className="font-mono font-bold text-stone-105">{currentUser.member_id || currentUser.memberId}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Clearance Level</span>
                <span className="font-mono font-bold text-stone-105">
                  {role === 'ADMIN' ? 'Admin' :
                   role === 'VOLUNTEER' ? 'Volunteer' :
                   role === 'CORE_MEMBER' ? 'Core Member' : 'Community Member'}
                </span>
              </div>
              <div className="col-span-2 mt-1">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Email Address</span>
                <span className="font-mono truncate block text-stone-105">{currentUser.email || 'No email bound'}</span>
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

        {/* Account Details Settings form */}
        <div className="bg-stone-100 p-6 trail-border trail-shadow rounded-sm">
          <div className="flex items-center justify-between border-b border-stone-300 pb-2 mb-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-forest shrink-0" />
              <h3 className="text-base font-display font-extrabold uppercase text-stone-900 m-0">
                Account Details
              </h3>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 bg-stone-900 text-canvas px-2.5 py-1 text-[10px] font-black uppercase rounded-sm cursor-pointer hover:bg-campfire transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="flex flex-col gap-3">
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

              <div>
                <label className="block text-[10px] uppercase font-black text-stone-600 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full bg-canvas border-2 border-stone-900 p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(currentUser.name || '');
                    setUsername(currentUser.username || '');
                    setAge(currentUser.age || '');
                  }}
                  className="bg-stone-300 text-stone-750 px-3 py-1.5 text-xs font-black uppercase rounded-sm cursor-pointer hover:bg-stone-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-campfire text-canvas px-4 py-1.5 text-xs font-black uppercase trail-border rounded-sm cursor-pointer hover:shadow-sm transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3.5">
              <div className="border-b border-stone-200 pb-2">
                <span className="block text-[9px] uppercase font-bold text-stone-500">Name</span>
                <span className="text-sm font-bold text-stone-850">{currentUser.name || 'Not Specified'}</span>
              </div>
              <div className="border-b border-stone-200 pb-2">
                <span className="block text-[9px] uppercase font-bold text-stone-500">Username</span>
                <span className="text-sm font-bold text-stone-850">{currentUser.username || 'Not Specified'}</span>
              </div>
              <div className="border-b border-stone-200 pb-2">
                <span className="block text-[9px] uppercase font-bold text-stone-500">Age</span>
                <span className="text-sm font-bold text-stone-850">{currentUser.age ? `${currentUser.age} years old` : 'Not Specified'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Action Buttons & Role Preview Section */}
      {currentUser.role === 'ADMIN' && (
        <div className="bg-stone-200 trail-border rounded-sm overflow-hidden flex flex-col">
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
              <Eye className="w-4 h-4 text-stone-600 shrink-0" />
              <span className="text-xs uppercase font-black text-stone-700 tracking-wider">
                Simulate Custom Role Preview Clearances
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-600 transition-transform duration-200 ${showRolePreview ? 'rotate-180' : ''}`} />
          </button>
          
          {showRolePreview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 pb-4 bg-stone-200">
              <button
                onClick={() => setRole('COMMUNITY_MEMBER')}
                className={`text-[10px] text-center py-2 font-black uppercase transition-all border rounded-sm ${
                  role === 'COMMUNITY_MEMBER' || role === 'MEMBER'
                    ? 'bg-forest text-canvas border-forest shadow-sm'
                    : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Community Member
              </button>
              <button
                onClick={() => setRole('CORE_MEMBER')}
                className={`text-[10px] text-center py-2 font-black uppercase transition-all border rounded-sm ${
                  role === 'CORE_MEMBER'
                    ? 'bg-forest text-canvas border-forest shadow-sm'
                    : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Core Member
              </button>
              <button
                onClick={() => setRole('VOLUNTEER')}
                className={`text-[10px] text-center py-2 font-black uppercase transition-all border rounded-sm ${
                  role === 'VOLUNTEER'
                    ? 'bg-forest text-canvas border-forest shadow-sm'
                    : 'bg-canvas text-stone-600 border-stone-300 hover:bg-stone-50'
                }`}
              >
                Volunteer Clearance
              </button>
              <button
                onClick={() => setRole('ADMIN')}
                className={`text-[10px] text-center py-2 font-black uppercase transition-all border rounded-sm ${
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

      {/* Accordion List: TOS + Waiver + Delete Account */}
      <div className="flex flex-col gap-4">
        
        {/* Terms of Service Accordion */}
        <div className="bg-[#EAE6DF] trail-border rounded-sm overflow-hidden">
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
            <div className="px-4 pb-4 border-t border-stone-300 pt-3">
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
        <div className="bg-[#EAE6DF] trail-border rounded-sm overflow-hidden">
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
            <div className="px-4 pb-4 border-t border-stone-300 pt-3 flex flex-col gap-3">
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

        {/* Delete Account Accordion (Apple App Store Requirement) */}
        <div className="bg-red-50/50 border-2 border-red-900/30 rounded-sm overflow-hidden">
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
              <span className="text-xs sm:text-sm font-display font-extrabold uppercase text-red-900">
                Delete Account (Apple Requirements)
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-red-700 transition-transform duration-200 ${showDeleteConfirm ? 'rotate-180' : ''}`} />
          </button>

          {showDeleteConfirm && (
            <div className="px-4 pb-4 border-t border-red-900/20 pt-3">
              <p className="text-xs text-red-950 font-bold leading-relaxed mb-3">
                Deleting your account will permanently wipe your profile record, merit badges, and self-attested growth ledger. This action is compliance-required and cannot be undone.
              </p>
              
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you absolutely sure you want to permanently delete your School of Life account? This will log you out immediately and purge your records.")) {
                    handleDelete();
                  }
                }}
                className="bg-red-700 text-canvas px-4 py-2 text-xs font-black uppercase rounded-sm hover:bg-red-800 transition-colors cursor-pointer border border-red-900 trail-shadow-sm active:translate-y-[1px] active:shadow-none"
              >
                Permanently Delete Account
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-2 w-full bg-stone-900 text-canvas py-3 font-display font-black uppercase tracking-wider trail-border trail-shadow hover:bg-campfire hover:text-canvas transition-colors cursor-pointer rounded-sm mt-4"
      >
        <LogOut className="w-5 h-5" /> Log Out / Terminate Session
      </button>

    </section>
  );
}
