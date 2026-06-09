import React, { useState } from 'react';
import { ShieldAlert, Compass, UserPlus, LogIn, Lock } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabaseClient';

export default function AuthPage({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [waiverConsent, setWaiverConsent] = useState(false);
  
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info'); // 'info', 'success', 'error'
  const [isPendingScreen, setIsPendingScreen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setStatusMessage('Please enter your Username, Email, or Member ID.');
      setStatusType('error');
      return;
    }

    try {
      if (isConfigured) {
        // Query Supabase using username, email, or member_id
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`member_id.eq.${identifier.toUpperCase()},username.eq.${identifier},email.eq.${identifier}`)
          .maybeSingle();

        if (error || !data) {
          setStatusMessage('User not found. Please register below.');
          setStatusType('error');
          return;
        }

        // Validate password (only if it is set in the database, for legacy seeded accounts fallback)
        if (data.password && data.password !== loginPassword) {
          setStatusMessage('Incorrect password.');
          setStatusType('error');
          return;
        }

        if (data.status === 'PENDING') {
          setPendingUser(data);
          setIsPendingScreen(true);
          return;
        }

        if (data.status === 'DENIED') {
          setStatusMessage('Your registration request has been declined by the administrator.');
          setStatusType('error');
          return;
        }

        onLoginSuccess(data);
      } else {
        // LocalStorage fallback
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const defaultUsers = [
          { id: 1, name: 'Ayman Suh', role: 'ADMIN', status: 'APPROVED', memberId: 'SOL-2026-01', username: 'ayman', email: 'ayman@example.com' },
          { id: 2, name: 'Lucas Miller', role: 'COMMUNITY_MEMBER', status: 'APPROVED', memberId: 'SOL-2026-02', username: 'lucas', email: 'lucas@example.com' },
          { id: 3, name: 'Emma Watson', role: 'VOLUNTEER', status: 'APPROVED', memberId: 'SOL-2026-03', username: 'emma', email: 'emma@example.com' },
          { id: 4, name: 'Sophia Chen', role: 'CORE_MEMBER', status: 'APPROVED', memberId: 'SOL-2026-04', username: 'sophia', email: 'sophia@example.com' }
        ];

        const matchUser = [...localUsers, ...defaultUsers].find(
          (u) => 
            u.memberId?.toUpperCase() === identifier.toUpperCase() ||
            u.member_id?.toUpperCase() === identifier.toUpperCase() ||
            u.username === identifier ||
            u.email === identifier
        );

        if (!matchUser) {
          setStatusMessage('User not found. (Use SOL-2026-01 for Admin demo account)');
          setStatusType('error');
          return;
        }

        if (matchUser.password && matchUser.password !== loginPassword) {
          setStatusMessage('Incorrect password.');
          setStatusType('error');
          return;
        }

        if (matchUser.status === 'PENDING') {
          setPendingUser(matchUser);
          setIsPendingScreen(true);
          return;
        }

        if (matchUser.status === 'DENIED') {
          setStatusMessage('Your registration request has been declined by the administrator.');
          setStatusType('error');
          return;
        }

        onLoginSuccess(matchUser);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('An error occurred during login.');
      setStatusType('error');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const parsedAge = parseInt(age);

    if (!trimmedName || !trimmedUsername || !trimmedEmail || !trimmedPassword || !age) {
      setStatusMessage('All fields are required.');
      setStatusType('error');
      return;
    }

    if (isNaN(parsedAge) || parsedAge <= 0) {
      setStatusMessage('Please enter a valid age.');
      setStatusType('error');
      return;
    }

    if (!waiverConsent) {
      setStatusMessage('You must consent to the waiver of liability to register.');
      setStatusType('error');
      return;
    }

    // memberId will be auto-generated from username
    const generatedMemberId = `SOL-${trimmedUsername.toUpperCase()}`;

    try {
      if (isConfigured) {
        // 1. Check if username or email exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .or(`member_id.eq.${generatedMemberId},username.eq.${trimmedUsername},email.eq.${trimmedEmail}`)
          .maybeSingle();

        if (existing) {
          setStatusMessage('Username, Email, or Member ID is already registered.');
          setStatusType('error');
          return;
        }

        // 2. Insert profile
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert([
            {
              name: trimmedName,
              member_id: generatedMemberId,
              username: trimmedUsername,
              email: trimmedEmail,
              password: trimmedPassword,
              age: parsedAge,
              waiver_consent: waiverConsent,
              role: 'COMMUNITY_MEMBER',
              status: 'APPROVED'
            }
          ])
          .select()
          .single();

        if (profileErr || !newProfile) {
          throw new Error(profileErr?.message || 'Failed to create profile');
        }

        // 3. Insert empty badges row
        await supabase
          .from('badge_data')
          .insert([{ profile_id: newProfile.id }]);

        // 4. Insert empty self_attested row
        const defaultSelfSkills = {
          'Outdoor Navigation': false,
          'Knot Tying Mastery': false,
          'Swimming Safety': false,
          'Camp Cooking Basics': false,
          'Camp Tool Maintenance': false,
          'Archery Target Practice': false
        };
        await supabase
          .from('self_attested')
          .insert([{ profile_id: newProfile.id, skills: defaultSelfSkills }]);

        onLoginSuccess(newProfile);
      } else {
        // LocalStorage mock
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const defaultUsers = [
          { id: 1, name: 'Ayman Suh', role: 'ADMIN', status: 'APPROVED', memberId: 'SOL-2026-01', username: 'ayman', email: 'ayman@example.com' },
          { id: 2, name: 'Lucas Miller', role: 'COMMUNITY_MEMBER', status: 'APPROVED', memberId: 'SOL-2026-02', username: 'lucas', email: 'lucas@example.com' },
          { id: 3, name: 'Emma Watson', role: 'VOLUNTEER', status: 'APPROVED', memberId: 'SOL-2026-03', username: 'emma', email: 'emma@example.com' },
          { id: 4, name: 'Sophia Chen', role: 'CORE_MEMBER', status: 'APPROVED', memberId: 'SOL-2026-04', username: 'sophia', email: 'sophia@example.com' }
        ];

        const exists = [...localUsers, ...defaultUsers].some(
          (u) => 
            u.memberId?.toUpperCase() === generatedMemberId.toUpperCase() ||
            u.username?.toLowerCase() === trimmedUsername.toLowerCase() ||
            u.email?.toLowerCase() === trimmedEmail.toLowerCase()
        );

        if (exists) {
          setStatusMessage('Username, Email, or Member ID is already registered.');
          setStatusType('error');
          return;
        }

        const newUser = {
          id: Date.now(),
          name: trimmedName,
          memberId: generatedMemberId,
          member_id: generatedMemberId,
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword,
          age: parsedAge,
          waiver_consent: waiverConsent,
          role: 'COMMUNITY_MEMBER',
          status: 'APPROVED'
        };

        const updatedUsers = [...localUsers, newUser];
        localStorage.setItem('sol_users', JSON.stringify(updatedUsers));

        // Setup empty badge structure
        const localBadges = JSON.parse(localStorage.getItem('sol_badges') || '{}');
        localBadges[newUser.id] = {
          'Swimming': [false, false, false],
          'Fishing': [false, false, false],
          'Kayaking': [false, false, false],
          'Archery': [false, false, false],
          'Cooking': [false, false, false],
          'Outdoorsmanship': [false, false, false]
        };
        localStorage.setItem('sol_badges', JSON.stringify(localBadges));

        // Setup empty self-attestation structure
        const localSelfAttested = JSON.parse(localStorage.getItem('sol_self_attested') || '{}');
        localSelfAttested[newUser.id] = {
          'Outdoor Navigation': false,
          'Knot Tying Mastery': false,
          'Swimming Safety': false,
          'Camp Cooking Basics': false,
          'Camp Tool Maintenance': false,
          'Archery Target Practice': false
        };
        localStorage.setItem('sol_self_attested', JSON.stringify(localSelfAttested));

        onLoginSuccess(newUser);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to sign up. Make sure the database schema is run.');
      setStatusType('error');
    }
  };

  if (isPendingScreen) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-100 p-6 md:p-8 trail-border trail-shadow rounded-sm text-center flex flex-col gap-5">
          <div className="w-16 h-16 bg-amber-100 text-amber-950 border-2 border-amber-950 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h2 className="font-display font-black text-xl text-stone-900 uppercase">
              Registration Pending
            </h2>
            <p className="text-xs text-stone-500 font-bold uppercase mt-1">
              Member ID: {pendingUser?.member_id || pendingUser?.memberId}
            </p>
          </div>

          <p className="text-stone-750 text-sm leading-relaxed">
            Assalam alaikum, <span className="font-bold text-forest">{pendingUser?.name}</span>. Your registration request is waiting for Administrator approval.
          </p>

          <button
            onClick={() => {
              setIsPendingScreen(false);
              setPendingUser(null);
              setLoginIdentifier('');
              setLoginPassword('');
              setStatusMessage(null);
            }}
            className="w-full bg-stone-900 text-canvas py-2.5 text-sm font-bold uppercase trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer rounded-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="w-16 h-16 bg-forest text-canvas trail-border trail-shadow rounded-full flex items-center justify-center">
          <Compass className="w-9 h-9 text-campfire animate-spin-slow animate-spin-slow-duration" />
        </div>
        <h1 className="font-display font-black text-3xl text-forest uppercase tracking-wider mt-2">
          SCHOOL OF LIFE
        </h1>
        <p className="text-stone-600 text-xs font-bold uppercase tracking-widest">
          Brothers Only • Windsor Ontario Canada
        </p>
      </div>

      <div className="max-w-md w-full bg-stone-100 p-6 md:p-8 trail-border trail-shadow rounded-sm flex flex-col gap-6">
        {/* Toggle Headings */}
        <div className="flex border-b-2 border-stone-900">
          <button
            onClick={() => {
              setIsSignUp(false);
              setStatusMessage(null);
            }}
            className={`flex-1 pb-3 text-sm font-display font-black uppercase text-center cursor-pointer transition-all border-b-4 ${
              !isSignUp ? 'border-campfire text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setStatusMessage(null);
            }}
            className={`flex-1 pb-3 text-sm font-display font-black uppercase text-center cursor-pointer transition-all border-b-4 ${
              isSignUp ? 'border-campfire text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Register
          </button>
        </div>

        {statusMessage && (
          <div className={`p-3 trail-border text-xs font-bold rounded-sm flex items-center gap-2 ${
            statusType === 'error' ? 'bg-red-100 border-red-950 text-red-950' : 'bg-emerald-100 border-emerald-950 text-emerald-950'
          }`}>
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {isSignUp ? (
          // Sign Up Request Form
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="signup-name" className="text-xs font-bold uppercase text-stone-700">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Brother Ahmad"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="signup-username" className="text-xs font-bold uppercase text-stone-700">
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., ahmad"
                  className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="signup-age" className="text-xs font-bold uppercase text-stone-700">
                  Age
                </label>
                <input
                  id="signup-age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 25"
                  className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="signup-email" className="text-xs font-bold uppercase text-stone-700">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., ahmad@example.com"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="signup-password" className="text-xs font-bold uppercase text-stone-700">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
            </div>

            <div className="flex items-start gap-2.5 mt-2 bg-stone-55 p-3 trail-border rounded-sm">
              <input
                id="signup-waiver"
                type="checkbox"
                checked={waiverConsent}
                onChange={(e) => setWaiverConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 border-stone-400 rounded-sm cursor-pointer accent-forest focus:ring-campfire"
              />
              <label htmlFor="signup-waiver" className="text-[10px] text-stone-700 font-semibold leading-normal select-none cursor-pointer">
                I hereby consent to the <span className="font-bold text-campfire underline text-campfire-hover">School of Life Waiver & Release of Liability</span>, acknowledging the physical requirements and safety procedures of active wilderness programs.
              </label>
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="bg-campfire text-canvas py-2.5 font-display font-black uppercase tracking-wider mt-2 trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer rounded-sm flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Join the School of Life
            </button>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="login-id" className="text-xs font-bold uppercase text-stone-700">
                Username, Email, or Member ID
              </label>
              <input
                id="login-id"
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g., SOL-2026-01 or ayman"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="login-password" className="text-xs font-bold uppercase text-stone-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
              <span className="text-[10px] text-stone-500 font-semibold leading-normal">
                For legacy demo accounts (e.g. `SOL-2026-01`), you can leave the password blank.
              </span>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="bg-forest text-canvas py-2.5 font-display font-black uppercase tracking-wider mt-4 trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer rounded-sm flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" /> Join the School of Life
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center text-[10px] text-stone-500 font-semibold">
        <span>© 2026 School of Life Windsor. Connected to Supabase.</span>
      </div>
    </div>
  );
}
