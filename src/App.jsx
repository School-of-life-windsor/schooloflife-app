import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NoticeBoard from './components/NoticeBoard';
import ExpeditionMap from './components/ExpeditionMap';
import Logbook from './components/Logbook';
import UserManagement from './components/UserManagement';
import AuthPage from './components/AuthPage';
import SplashScreen from './components/SplashScreen';
import { supabase, isConfigured } from './lib/supabaseClient';

const initialMembersList = [];

const initialAnnouncements = [
  {
    id: 1,
    title: "School of Life Summer Session Registration Open",
    category: "General",
    date: "Jun 08, 2026",
    body: "Welcome to the School of Life! Our summer program runs from July 10 to August 22. This is an 18+ Brothers Only program focused on connecting with Allah's creation, building bonds of brotherhood, and learning Sunnah-centered skills. Ensure you register and secure your seat early, as seats are strictly limited."
  },
  {
    id: 2,
    title: "Gear list for Kayaking & Swimming sessions",
    category: "Gear Notice",
    date: "Jun 05, 2026",
    body: "Please ensure you have appropriate modest swimwear and quick-dry clothing for our water activities at Windsor lakes. Life jackets will be provided on-site. Pack extra towels and water bottles."
  },
  {
    id: 3,
    title: "Archery & Outdoor Cooking workshop safety guidelines",
    category: "Schedule Change",
    date: "Jun 02, 2026",
    body: "The outdoor cooking and archery workshop scheduled for July 18 will take place at our Oldcastle campgrounds. Please wear closed-toe boots. Safety briefings start promptly at 09:00 AM."
  }
];

const initialEvents = [
  {
    id: 1,
    title: "Expedition Launch & Campfire",
    date: "2026-07-10",
    time: "06:00 PM - 09:00 PM",
    location: "Oldcastle Campgrounds (3940 ON-3)",
    skills: ["Camp Safety", "Fire Building", "Leave No Trace"],
    attendance: { 1: true, 2: true, 3: true, 4: false }
  },
  {
    id: 2,
    title: "Water Skills: Kayaking & Swimming",
    date: "2026-07-25",
    time: "09:00 AM - 03:00 PM",
    location: "Windsor Waterfront Lakes",
    skills: ["Paddle Control", "Capsize Recovery", "Treading Water"],
    attendance: { 1: true, 2: false, 3: true, 4: true }
  },
  {
    id: 3,
    title: "Traditional Archery & Cooking Workshop",
    date: "2026-08-08",
    time: "10:00 AM - 04:00 PM",
    location: "Oldcastle Campgrounds Range",
    skills: ["Nocking Arrows", "Target Focus", "Wood Fire Heat Control"],
    attendance: { 1: false, 2: false, 3: false, 4: false }
  }
];

const initialBadgeData = {};

const initialSelfAttested = {};

export default function App() {
  // Authentication session state
  const [currentUser, setCurrentUser] = useState(null);
  
  // App views state
  const [activeView, setActiveView] = useState('Dashboard');
  const [role, setRole] = useState('COMMUNITY_MEMBER'); // Synced with currentUser's database role
  
  // Core database tables states
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [badgeData, setBadgeData] = useState({});
  const [selfAttested, setSelfAttested] = useState({});
  const [membersList, setMembersList] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch announcements, events, and profiles from Supabase/LocalStorage
  const loadDatabase = async () => {
    try {
      if (isConfigured) {
        // 1. Fetch announcements
        const { data: notices } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        if (notices) setAnnouncements(notices);

        // 2. Fetch events
        const { data: evts } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: true });
        if (evts) setEvents(evts);

        // 3. Fetch profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*');

        if (profiles) {
          setMembersList(profiles);

          // 4. Fetch badges
          const { data: badges } = await supabase
            .from('badge_data')
            .select('*');

          // 5. Fetch self_attested
          const { data: selfAtts } = await supabase
            .from('self_attested')
            .select('*');

          const newBadgeMap = {};
          const newSelfMap = {};

          profiles.forEach((p) => {
            const b = badges?.find((x) => x.profile_id === p.id) || {};
            newBadgeMap[p.id] = {
              'Swimming': b.swimming || [false, false, false],
              'Fishing': b.fishing || [false, false, false],
              'Kayaking': b.kayaking || [false, false, false],
              'Archery': b.archery || [false, false, false],
              'Cooking': b.cooking || [false, false, false],
              'Outdoorsmanship': b.outdoorsmanship || [false, false, false]
            };

            const s = selfAtts?.find((x) => x.profile_id === p.id) || {};
            newSelfMap[p.id] = s.skills || {
              'Outdoor Navigation': false,
              'Knot Tying Mastery': false,
              'Swimming Safety': false,
              'Camp Cooking Basics': false,
              'Camp Tool Maintenance': false,
              'Archery Target Practice': false
            };
          });

          setBadgeData(newBadgeMap);
          setSelfAttested(newSelfMap);
        }
      } else {
        // LocalStorage fallback setup
        if (!localStorage.getItem('sol_announcements')) {
          localStorage.setItem('sol_announcements', JSON.stringify(initialAnnouncements));
        }
        if (!localStorage.getItem('sol_events')) {
          localStorage.setItem('sol_events', JSON.stringify(initialEvents));
        }
        if (!localStorage.getItem('sol_badges')) {
          localStorage.setItem('sol_badges', JSON.stringify(initialBadgeData));
        }
        if (!localStorage.getItem('sol_self_attested')) {
          localStorage.setItem('sol_self_attested', JSON.stringify(initialSelfAttested));
        }
        
        setAnnouncements(JSON.parse(localStorage.getItem('sol_announcements')));
        setEvents(JSON.parse(localStorage.getItem('sol_events')));
        setBadgeData(JSON.parse(localStorage.getItem('sol_badges')));
        setSelfAttested(JSON.parse(localStorage.getItem('sol_self_attested')));
        
        // Fetch user listing
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const combined = [...initialMembersList];
        localUsers.forEach((lu) => {
          if (!combined.some((c) => c.memberId === lu.memberId)) {
            combined.push(lu);
          }
        });
        setMembersList(combined);
      }
    } catch (err) {
      console.error('Database load failed:', err);
    }
  };

  const fetchProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (data) {
        setCurrentUser(data);
        setRole(data.role);
      } else {
        console.warn('Profile not found for authenticated user');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, [currentUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await fetchProfile(session.user);
          }
        } else {
          // LocalStorage fallback session reload
          const sessionUser = JSON.parse(localStorage.getItem('sol_session') || 'null');
          if (sessionUser) {
            setCurrentUser(sessionUser);
            setRole(sessionUser.role);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        // Guarantee the splash screen dismisses
        setTimeout(() => {
          setIsInitializing(false);
        }, 800); // 800ms minimum display for smooth aesthetic transitions
      }
    };

    initializeAuth();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setCurrentUser(null);
          setRole('COMMUNITY_MEMBER');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Hook to handle login
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setRole(user.role);
    if (!isConfigured) {
      localStorage.setItem('sol_session', JSON.stringify(user));
    }
  };

  // Terminate session
  const handleLogout = async () => {
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem('sol_session');
      }
    } catch (err) {
      console.error(err);
    }
    setCurrentUser(null);
    setRole('COMMUNITY_MEMBER');
    setActiveView('Dashboard');
  };

  // Delete account callback
  const handleDeleteAccount = async (userId) => {
    const isSelf = userId === currentUser?.id || userId === currentUser?.memberId;
    try {
      if (isConfigured) {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        if (error) throw error;

        if (isSelf) {
          await supabase.auth.signOut();
        }
      } else {
        // LocalStorage mock deletion
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const updatedUsers = localUsers.filter(u => u.id !== userId && u.memberId !== userId);
        localStorage.setItem('sol_users', JSON.stringify(updatedUsers));
        
        const localBadges = JSON.parse(localStorage.getItem('sol_badges') || '{}');
        delete localBadges[userId];
        localStorage.setItem('sol_badges', JSON.stringify(localBadges));

        const localSelf = JSON.parse(localStorage.getItem('sol_self_attested') || '{}');
        delete localSelf[userId];
        localStorage.setItem('sol_self_attested', JSON.stringify(localSelf));

        if (isSelf) {
          localStorage.removeItem('sol_session');
        }
      }

      if (isSelf) {
        setCurrentUser(null);
        setRole('COMMUNITY_MEMBER');
        setActiveView('Dashboard');
        alert('Your account has been deleted.');
      } else {
        loadDatabase();
        alert('User account deleted successfully.');
      }
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Failed to delete account.');
    }
  };

  const handleUpdateAnnouncements = async (newAnnouncements) => {
    if (newAnnouncements.length > announcements.length) {
      const latest = newAnnouncements[0];
      try {
        if (isConfigured) {
          const { data, error } = await supabase
            .from('announcements')
            .insert([
              {
                title: latest.title,
                category: latest.category,
                date: latest.date,
                body: latest.body,
                visibility: latest.visibility || 'COMMUNITY_MEMBER',
                author_name: latest.author_name || 'School of Life',
                author_id: latest.author_id,
                author_username: latest.author_username,
                flagged: false,
                flagged_by: []
              }
            ])
            .select()
            .single();

          if (error) throw error;
          if (data) {
            setAnnouncements([data, ...announcements]);
            return;
          }
        } else {
          localStorage.setItem('sol_announcements', JSON.stringify(newAnnouncements));
          setAnnouncements(newAnnouncements);
        }
      } catch (e) {
        console.error('Announcements insert failed:', e);
        setAnnouncements(newAnnouncements);
      }
    } else {
      setAnnouncements(newAnnouncements);
      if (!isConfigured) {
        localStorage.setItem('sol_announcements', JSON.stringify(newAnnouncements));
      }
    }
  };

  const handleDeleteAnnouncement = async (noticeId) => {
    try {
      if (isConfigured) {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', noticeId);
        if (error) throw error;
      }
      
      const updated = announcements.filter(a => a.id !== noticeId);
      setAnnouncements(updated);
      
      if (!isConfigured) {
        localStorage.setItem('sol_announcements', JSON.stringify(updated));
      }
      alert('Announcement deleted successfully.');
    } catch (e) {
      console.error('Delete announcement failed:', e);
      alert('Failed to delete announcement.');
    }
  };

  const handleUpdateNotice = async (noticeId, updatedNoticeFields) => {
    const updatedAnnouncements = announcements.map(a => 
      a.id === noticeId ? { ...a, ...updatedNoticeFields } : a
    );
    setAnnouncements(updatedAnnouncements);

    try {
      if (isConfigured) {
        await supabase
          .from('announcements')
          .update(updatedNoticeFields)
          .eq('id', noticeId);
      } else {
        localStorage.setItem('sol_announcements', JSON.stringify(updatedAnnouncements));
      }
    } catch (e) {
      console.error('Notice update failed:', e);
    }
  };

  const handleUpdateEvents = async (newEvents) => {
    setEvents(newEvents);
    try {
      if (isConfigured) {
        // Compare to see if event was added or updated
        const isNew = newEvents.length > events.length;
        if (isNew) {
          const latest = newEvents[newEvents.length - 1];
          await supabase
            .from('events')
            .insert([
              {
                title: latest.title,
                date: latest.date,
                time: latest.time,
                location: latest.location,
                skills: latest.skills,
                attendance: latest.attendance,
                visibility: latest.visibility || 'COMMUNITY_MEMBER'
              }
            ]);
        } else {
          // Attendance update
          // Find changed event
          for (let ev of newEvents) {
            const oldEv = events.find(o => o.id === ev.id);
            if (JSON.stringify(ev.attendance) !== JSON.stringify(oldEv?.attendance)) {
              await supabase
                .from('events')
                .update({ attendance: ev.attendance })
                .eq('id', ev.id);
              break;
            }
          }
        }
      } else {
        localStorage.setItem('sol_events', JSON.stringify(newEvents));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateBadgeData = async (newBadgeData) => {
    setBadgeData(newBadgeData);
    try {
      if (isConfigured) {
        // Update user badge in Supabase
        const changedScoutId = Object.keys(newBadgeData).find(
          (id) => JSON.stringify(newBadgeData[id]) !== JSON.stringify(badgeData[id])
        );
        if (changedScoutId) {
          const b = newBadgeData[changedScoutId];
          await supabase
            .from('badge_data')
            .update({
              swimming: b['Swimming'],
              fishing: b['Fishing'],
              kayaking: b['Kayaking'],
              archery: b['Archery'],
              cooking: b['Cooking'],
              outdoorsmanship: b['Outdoorsmanship']
            })
            .eq('profile_id', changedScoutId);
        }
      } else {
        localStorage.setItem('sol_badges', JSON.stringify(newBadgeData));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSelfAttested = async (newSelfAttested) => {
    setSelfAttested(newSelfAttested);
    try {
      if (isConfigured) {
        const changedScoutId = Object.keys(newSelfAttested).find(
          (id) => JSON.stringify(newSelfAttested[id]) !== JSON.stringify(selfAttested[id])
        );
        if (changedScoutId) {
          await supabase
            .from('self_attested')
            .update({ skills: newSelfAttested[changedScoutId] })
            .eq('profile_id', changedScoutId);
        }
      } else {
        localStorage.setItem('sol_self_attested', JSON.stringify(newSelfAttested));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamically calculate rank based on completed badges
  const getCalculatedRank = (scoutId) => {
    const scoutBadges = badgeData[scoutId] || {};
    const completedBadgesCount = Object.keys(scoutBadges).filter((badgeName) => {
      const skills = scoutBadges[badgeName];
      return skills.every(Boolean); // all skills completed
    }).length;

    if (completedBadgesCount === 6) return 'Leader-Mentor';
    if (completedBadgesCount >= 4) return 'Star Explorer';
    if (completedBadgesCount >= 2) return 'First Class';
    return 'Tenderfoot';
  };

  const activeScoutId = currentUser?.id || currentUser?.memberId;
  const currentScoutRank = getCalculatedRank(activeScoutId);

  // Sync member ranks dynamically with calculated ranks
  const membersWithCalculatedRanks = membersList.map(m => ({
    ...m,
    rank: getCalculatedRank(m.id || m.memberId)
  }));

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return (
          <NoticeBoard
            announcements={announcements}
            setAnnouncements={handleUpdateAnnouncements}
            onUpdateNotice={handleUpdateNotice}
            onDeleteNotice={handleDeleteAnnouncement}
            role={role}
            currentUser={currentUser}
          />
        );
      case 'Events':
        return (
          <ExpeditionMap
            events={events}
            setEvents={handleUpdateEvents}
            members={membersWithCalculatedRanks}
            role={role}
            currentUser={currentUser}
          />
        );
      case 'Badges':
        return (
          <Logbook
            badgeData={badgeData}
            setBadgeData={handleUpdateBadgeData}
            selfAttested={selfAttested}
            setSelfAttested={handleUpdateSelfAttested}
            members={membersWithCalculatedRanks}
            role={role}
            currentUser={currentUser}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      case 'UserManagement':
        return role === 'ADMIN' ? (
          <UserManagement
            role={role}
            currentUser={currentUser}
            onDeleteAccount={handleDeleteAccount}
          />
        ) : (
          <NoticeBoard
            announcements={announcements}
            setAnnouncements={handleUpdateAnnouncements}
            onUpdateNotice={handleUpdateNotice}
            onDeleteNotice={handleDeleteAnnouncement}
            role={role}
            currentUser={currentUser}
          />
        );
      default:
        return (
          <NoticeBoard
            announcements={announcements}
            setAnnouncements={handleUpdateAnnouncements}
            onUpdateNotice={handleUpdateNotice}
            onDeleteNotice={handleDeleteAnnouncement}
            role={role}
            currentUser={currentUser}
          />
        );
    }
  };

  // Show splash screen during initialization
  if (isInitializing) {
    return <SplashScreen />;
  }

  // Redirect to AuthPage if user session is empty
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-canvas select-none">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        role={role}
        setRole={setRole}
        user={currentUser}
        calculatedRank={currentScoutRank}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto pb-24 lg:pb-12 flex flex-col justify-between">
        
        <div className="w-full">
          {/* Header Ribbon for Active Role */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-stone-100 p-4 border-2 border-stone-900 rounded-sm">
            <div className="flex items-center gap-2 text-stone-800">
              <span className="w-2.5 h-2.5 bg-forest rounded-full animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-wider">
                Active Status: {
                  role === 'ADMIN' ? 'Leader / Instructor (Admin)' :
                  role === 'VOLUNTEER' ? 'Leadership / Volunteer' :
                  role === 'CORE_MEMBER' ? 'Core Member' : 'Community Member'
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Zeffy Registration Link: Coming Soon!");
                }}
                className="lg:hidden px-3 py-1.5 text-[10px] font-black uppercase bg-campfire text-canvas rounded-sm hover:bg-opacity-90 transition-all trail-border trail-shadow-sm mr-2"
              >
                Buy Membership ($150.00)
              </a>
              {currentUser.role === 'ADMIN' && (
                <>
                  <span className="text-[10px] uppercase font-bold text-stone-500">Quick Switcher:</span>
                  <button
                    onClick={() => {
                      const rolesCycle = ['COMMUNITY_MEMBER', 'CORE_MEMBER', 'VOLUNTEER', 'ADMIN'];
                      const idx = rolesCycle.indexOf(role);
                      const nextRole = rolesCycle[(idx + 1) % rolesCycle.length];
                      setRole(nextRole);
                    }}
                    className="px-2.5 py-1 text-[10px] font-black uppercase bg-stone-900 text-canvas rounded-sm hover:bg-campfire transition-colors cursor-pointer border border-stone-800"
                  >
                    Cycle Role preview
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Active View Panel */}
          <div className="w-full font-sans">
            {renderContent()}
          </div>
        </div>

        {/* Footer with Location, Flyer Details & Google Maps Embed */}
        <footer className="mt-12 pt-8 border-t-4 border-stone-900 flex flex-col gap-6 w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-between bg-stone-800 text-canvas p-6 trail-border trail-shadow rounded-sm">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold block mb-1">
                  Windsor Ontario Canada Headquarters
                </span>
                <h3 className="text-xl font-display font-black text-campfire uppercase tracking-wide mb-3">
                  School of Life
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed font-semibold">
                  1320 Northwood St. Windsor ON N9E 1A4 <br />
                  Windsor Area, Ontario, Canada
                </p>
              </div>

              <div className="mt-6 border-t border-stone-700 pt-4 text-stone-400 text-xs">
                <span className="block font-bold">📆 Session: July 10 - August 22</span>
                <span className="block font-bold mt-1 text-campfire">🤝 18+ Brothers Only • Limited Seats</span>
              </div>
            </div>

            {/* Embedded Google Maps pin */}
            <div className="trail-border rounded-sm overflow-hidden h-[220px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3443.1046579966205!2d-82.95237762357789!3d42.22448634365562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883b29a82ed3ebc5%3A0x19fcc9bdfa98015b!2s3940%20ON-3%2C%20Oldcastle%2C%20ON%20N0R%201L0!5e1!3m2!1sen!2sca!4v1780976123207!5m2!1sen!2sca"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="School of Life Camp Location Map"
              ></iframe>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-stone-600 text-xs py-4">
            <span>© 2026 School of Life. Connect with Allah's Creation.</span>
            <span className="font-bold text-forest mt-2 sm:mt-0">Built for Brotherhood & Sunnah-Centered Skills</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
