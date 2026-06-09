import React, { useState, useEffect } from 'react';
import { ShieldAlert, Compass, UserPlus, LogIn, Lock } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabaseClient';

export default function AuthPage({ onLoginSuccess }) {
  // Check if we are redirected from a password recovery link
  const isRecoveryMode = window.location.hash.includes('type=recovery') || window.location.search.includes('recovery=true');
  
  const [viewState, setViewState] = useState(isRecoveryMode ? 'reset_password' : 'login'); // 'login', 'signup', 'forgot_password', 'reset_password'
  
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

  useEffect(() => {
    if (isRecoveryMode) {
      setViewState('reset_password');
    }
  }, [isRecoveryMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const identifier = loginIdentifier.trim();
    const trimmedPassword = loginPassword;

    if (!identifier) {
      setStatusMessage('Please enter your Username, Email, or Member ID.');
      setStatusType('error');
      return;
    }

    try {
      if (isConfigured) {
        let emailToAuthenticate = identifier;

        // If user logged in using username or member ID, resolve it to their email
        if (!identifier.includes('@')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .or(`member_id.eq.${identifier.toUpperCase()},username.eq.${identifier}`)
            .maybeSingle();

          if (profile && profile.email) {
            emailToAuthenticate = profile.email;
          } else {
            setStatusMessage('User profile not found. Verify your identifier or register below.');
            setStatusType('error');
            return;
          }
        }

        // Authenticate with Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: emailToAuthenticate,
          password: trimmedPassword
        });

        if (authErr) {
          setStatusMessage(authErr.message);
          setStatusType('error');
          return;
        }

        // Fetch matching database profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileErr || !profile) {
          setStatusMessage('Login succeeded, but profile record was not found.');
          setStatusType('error');
          return;
        }

        if (profile.status === 'DENIED') {
          setStatusMessage('Your registration request has been declined by the administrator.');
          setStatusType('error');
          await supabase.auth.signOut();
          return;
        }

        onLoginSuccess(profile);
      } else {
        // LocalStorage fallback
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const matchUser = localUsers.find(
          (u) => 
            u.memberId?.toUpperCase() === identifier.toUpperCase() ||
            u.username?.toLowerCase() === identifier.toLowerCase() ||
            u.email?.toLowerCase() === identifier.toLowerCase()
        );

        if (!matchUser) {
          setStatusMessage('User not found. (Register a new account to test locally)');
          setStatusType('error');
          return;
        }

        if (matchUser.password !== trimmedPassword) {
          setStatusMessage('Incorrect password.');
          setStatusType('error');
          return;
        }

        if (matchUser.status === 'DENIED') {
          setStatusMessage('Your registration request has been declined.');
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

    const generatedMemberId = `SOL-${trimmedUsername.toUpperCase()}`;

    try {
      if (isConfigured) {
        // 1. Check if username exists in profiles
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', trimmedUsername)
          .maybeSingle();

        if (existingUser) {
          setStatusMessage('Username is already taken.');
          setStatusType('error');
          return;
        }

        // 2. Sign up with Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: {
              name: trimmedName,
              username: trimmedUsername,
              age: parsedAge,
              waiver_consent: waiverConsent
            }
          }
        });

        if (authErr) {
          setStatusMessage(authErr.message);
          setStatusType('error');
          return;
        }

        if (!authData.user) {
          throw new Error('User creation failed.');
        }

        // Check if database contains any profiles. If count is 0, this first user becomes ADMIN.
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        
        const isFirstUser = count === 0;
        const initialRole = isFirstUser ? 'ADMIN' : 'COMMUNITY_MEMBER';

        // 3. Insert profile details into public.profiles
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: trimmedName,
              member_id: generatedMemberId,
              username: trimmedUsername,
              email: trimmedEmail,
              password: trimmedPassword, // saved for compatibility
              age: parsedAge,
              waiver_consent: waiverConsent,
              role: initialRole,
              status: 'APPROVED'
            }
          ])
          .select()
          .single();

        if (profileErr || !newProfile) {
          throw new Error(profileErr?.message || 'Failed to create profile row');
        }

        // 4. Create merit badges row
        await supabase
          .from('badge_data')
          .insert([{ profile_id: newProfile.id }]);

        // 5. Create self-attestation row
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

        // Check if session is already active (unverified signup redirection)
        if (authData.session) {
          onLoginSuccess(newProfile);
        } else {
          setStatusMessage('Registration successful! Please check your email for a verification link to confirm your account.');
          setStatusType('success');
          // Reset form fields
          setName('');
          setUsername('');
          setEmail('');
          setPassword('');
          setAge('');
          setWaverConsent(false);
          setViewState('login');
        }
      } else {
        // LocalStorage fallback
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const exists = localUsers.some(
          (u) => 
            u.username?.toLowerCase() === trimmedUsername.toLowerCase() ||
            u.email?.toLowerCase() === trimmedEmail.toLowerCase()
        );

        if (exists) {
          setStatusMessage('Username or Email is already registered.');
          setStatusType('error');
          return;
        }

        const isFirstUser = localUsers.length === 0;
        const initialRole = isFirstUser ? 'ADMIN' : 'COMMUNITY_MEMBER';

        const newUser = {
          id: Date.now().toString(),
          name: trimmedName,
          memberId: generatedMemberId,
          member_id: generatedMemberId,
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword,
          age: parsedAge,
          waiver_consent: waiverConsent,
          role: initialRole,
          status: 'APPROVED'
        };

        const updatedUsers = [...localUsers, newUser];
        localStorage.setItem('sol_users', JSON.stringify(updatedUsers));

        // Seed empty badges
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

        // Seed empty self attested
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
      setStatusMessage('Registration failed: ' + err.message);
      setStatusType('error');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatusMessage('Please enter your email address.');
      setStatusType('error');
      return;
    }

    try {
      if (isConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: window.location.origin + '?recovery=true'
        });

        if (error) {
          setStatusMessage(error.message);
          setStatusType('error');
          return;
        }

        setStatusMessage('Password reset email sent! Check your inbox for reset link.');
        setStatusType('success');
        setEmail('');
      } else {
        setStatusMessage('Password reset is not supported in local storage fallback mode.');
        setStatusType('error');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to send reset email.');
      setStatusType('error');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setStatusMessage('Please enter a new password.');
      setStatusType('error');
      return;
    }

    try {
      if (isConfigured) {
        const { error } = await supabase.auth.updateUser({ password: trimmedPassword });
        if (error) {
          setStatusMessage(error.message);
          setStatusType('error');
          return;
        }

        setStatusMessage('Password updated! You can now log in.');
        setStatusType('success');
        
        // Clean URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        setViewState('login');
        setPassword('');
      } else {
        setStatusMessage('Password reset is not supported in local storage fallback mode.');
        setStatusType('error');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to update password.');
      setStatusType('error');
    }
  };

  if (isPendingScreen) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-100 p-6 md:p-8 trail-border trail-shadow rounded-sm text-center flex flex-col gap-5">
          <div className="w-16 h-16 bg-amber-100 text-amber-900 border-2 border-amber-950 rounded-full flex items-center justify-center mx-auto shadow-sm">
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
          <Compass className="w-9 h-9 text-campfire animate-spin-slow" />
        </div>
        <h1 className="font-display font-black text-3xl text-forest uppercase tracking-wider mt-2">
          SCHOOL OF LIFE
        </h1>
        <p className="text-stone-600 text-xs font-bold uppercase tracking-widest">
          Brothers Only • Windsor Ontario Canada
        </p>
      </div>

      <div className="max-w-md w-full bg-stone-100 p-6 md:p-8 trail-border trail-shadow rounded-sm flex flex-col gap-6">
        
        {/* Toggle Headings (Hidden on recovery views) */}
        {viewState !== 'forgot_password' && viewState !== 'reset_password' && (
          <div className="flex border-b-2 border-stone-900">
            <button
              onClick={() => {
                setViewState('login');
                setStatusMessage(null);
              }}
              className={`flex-1 pb-3 text-sm font-display font-black uppercase text-center cursor-pointer transition-all border-b-4 ${
                viewState === 'login' ? 'border-campfire text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setViewState('signup');
                setStatusMessage(null);
              }}
              className={`flex-1 pb-3 text-sm font-display font-black uppercase text-center cursor-pointer transition-all border-b-4 ${
                viewState === 'signup' ? 'border-campfire text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {statusMessage && (
          <div className={`p-3 trail-border text-xs font-bold rounded-sm flex items-center gap-2 ${
            statusType === 'error' ? 'bg-red-100 border-red-950 text-red-950' : 'bg-emerald-100 border-emerald-950 text-emerald-950'
          }`}>
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {viewState === 'signup' && (
          // Sign Up Form
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

            <div className="flex items-start gap-2.5 mt-2 bg-stone-50 p-3 trail-border rounded-sm">
              <input
                id="signup-waiver"
                type="checkbox"
                checked={waiverConsent}
                onChange={(e) => setWaiverConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 border-stone-400 rounded-sm cursor-pointer accent-forest focus:ring-campfire"
              />
              <label htmlFor="signup-waiver" className="text-[10px] text-stone-700 font-semibold leading-normal select-none cursor-pointer">
                I hereby consent to the <span className="font-bold text-campfire underline">School of Life Waiver & Release of Liability</span>, acknowledging the physical requirements and safety procedures of active wilderness programs.
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
        )}

        {viewState === 'login' && (
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
                placeholder="e.g., ayman or ayman@example.com"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="text-xs font-bold uppercase text-stone-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setViewState('forgot_password');
                    setStatusMessage(null);
                  }}
                  className="text-right text-[10px] text-stone-500 font-bold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
              <span className="text-[10px] text-stone-550 font-semibold leading-normal">
                If using a seeded database account, you can leave the password blank.
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

        {viewState === 'forgot_password' && (
          // Forgot Password Form
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div className="border-b border-stone-300 pb-2">
              <h3 className="font-display font-black text-stone-900 uppercase text-lg">Reset Password</h3>
              <p className="text-[11px] text-stone-500 font-semibold leading-relaxed mt-1">
                Enter your email address below and we'll send you a secure link to reset your account password.
              </p>
            </div>
            
            <div className="flex flex-col gap-1">
              <label htmlFor="forgot-email" className="text-xs font-bold uppercase text-stone-700">
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., ahmad@example.com"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-campfire text-canvas py-2.5 font-display font-black uppercase tracking-wider trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer rounded-sm"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => {
                setViewState('login');
                setStatusMessage(null);
              }}
              className="text-center text-xs font-bold text-stone-600 hover:underline uppercase tracking-wide cursor-pointer mt-1"
            >
              ← Back to Login
            </button>
          </form>
        )}

        {viewState === 'reset_password' && (
          // Reset Password view (Redirect destination)
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="border-b border-stone-300 pb-2">
              <h3 className="font-display font-black text-stone-900 uppercase text-lg">Set New Password</h3>
              <p className="text-[11px] text-stone-500 font-semibold leading-relaxed mt-1">
                Set a strong, new password for your account to secure access.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="reset-password" className="text-xs font-bold uppercase text-stone-700">
                New Password
              </label>
              <input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-forest text-canvas py-2.5 font-display font-black uppercase tracking-wider trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer rounded-sm"
            >
              Update Password
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center text-[10px] text-stone-500 font-semibold">
        <span>© 2026 School of Life Windsor.</span>
      </div>
    </div>
  );
}
