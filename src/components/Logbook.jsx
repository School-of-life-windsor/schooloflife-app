import React, { useState } from 'react';
import { Trophy, Waves, Fish, Anchor, Target, Flame, Tent, Star, User, BookOpen, CheckCircle } from 'lucide-react';

export default function Logbook({ badgeData, setBadgeData, selfAttested, setSelfAttested, members, role, currentUser, onDeleteAccount }) {
  // Admin selects which scout to view/edit. Default is the current member.
  const [selectedScoutId, setSelectedScoutId] = useState(currentUser.id);

  const activeScout = members.find((m) => String(m.id) === String(selectedScoutId)) || currentUser;
  const scoutBadges = badgeData[activeScout.id] || {};
  const scoutSelfAttested = selfAttested[activeScout.id] || {};

  const badgeDefinitions = [
    {
      name: 'Swimming',
      icon: Waves,
      color: 'bg-sky-600 border-sky-950',
      textColor: 'text-sky-950',
      description: 'Master water safety, strokes, and treading water.',
      skills: ['Breathing Techniques', 'Front Crawl 50m', 'Treading Water']
    },
    {
      name: 'Fishing',
      icon: Fish,
      color: 'bg-emerald-600 border-emerald-950',
      textColor: 'text-emerald-950',
      description: 'Learn wilderness angling, casting, and catching methods.',
      skills: ['Baiting Hooks', 'Casting Line', 'Catch & Release']
    },
    {
      name: 'Kayaking',
      icon: Anchor,
      color: 'bg-cyan-700 border-cyan-950',
      textColor: 'text-cyan-950',
      description: 'Master paddle controls, strokes, and capsize safety.',
      skills: ['Paddle Control', 'Capsize Recovery', 'Dock Launching']
    },
    {
      name: 'Archery',
      icon: Target,
      color: 'bg-amber-600 border-amber-950',
      textColor: 'text-amber-950',
      description: 'Master traditional archery bows and focus drills.',
      skills: ['Nocking Arrows', 'Target Focus', 'Bow Draw Strength']
    },
    {
      name: 'Cooking',
      icon: Flame,
      color: 'bg-orange-500 border-orange-950',
      textColor: 'text-orange-950',
      description: 'Practice outdoor open fire cooking and recipe preparation.',
      skills: ['Wood Fire Heat Control', 'Knife Safety', 'Outdoor Stew Cooking']
    },
    {
      name: 'Outdoorsmanship',
      icon: Tent,
      color: 'bg-stone-700 border-stone-900',
      textColor: 'text-stone-950',
      description: 'Build tents, shelters, camp knots, and follow leave-no-trace.',
      skills: ['Shelter Building', 'Camp Knot Mastery', 'Leave No Trace Principles']
    }
  ];

  const handleToggleSkill = (scoutId, badgeName, skillIndex) => {
    const updatedScoutBadges = { ...badgeData[scoutId] };
    const updatedBadgeSkills = [...updatedScoutBadges[badgeName]];
    updatedBadgeSkills[skillIndex] = !updatedBadgeSkills[skillIndex];
    updatedScoutBadges[badgeName] = updatedBadgeSkills;

    setBadgeData({
      ...badgeData,
      [scoutId]: updatedScoutBadges
    });
  };

  const handleToggleSelfAttested = (scoutId, skillName) => {
    const updatedScoutSelfAttested = { ...selfAttested[scoutId] };
    updatedScoutSelfAttested[skillName] = !updatedScoutSelfAttested[skillName];
    
    setSelfAttested({
      ...selfAttested,
      [scoutId]: updatedScoutSelfAttested
    });
  };

  // Calculate ranks
  const getBadgeCompletionCount = (scoutId) => {
    const scoutBadgesState = badgeData[scoutId] || {};
    return Object.keys(scoutBadgesState).filter((badgeName) => {
      return scoutBadgesState[badgeName].every(Boolean);
    }).length;
  };

  const completedBadgesCount = getBadgeCompletionCount(activeScout.id);

  // Self attested calculation
  const selfAttestedCheckedCount = Object.values(scoutSelfAttested).filter(Boolean).length;
  const selfAttestedTotal = Object.keys(scoutSelfAttested).length;

  const getSelfAttestedRank = (count) => {
    if (count === 6) return 'Wilderness Guide';
    if (count >= 4) return 'Sunnah Pioneer';
    if (count >= 2) return 'Camp Companion';
    return 'Novice Pioneer';
  };

  const selfAttestedRank = getSelfAttestedRank(selfAttestedCheckedCount);

  return (
    <section className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b-4 border-stone-900 pb-3">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-forest" />
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight text-forest m-0">
              THE LOGBOOK
            </h1>
            <p className="text-stone-600 text-sm">
              Official merit badges, requirements tracking, and progress metrics.
            </p>
          </div>
        </div>

        {/* Scout Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="scout-select" className="text-xs font-black uppercase text-stone-900 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-campfire" /> Brother:
          </label>
          {role === 'ADMIN' ? (
            <select
              id="scout-select"
              value={selectedScoutId}
              onChange={(e) => setSelectedScoutId(e.target.value)}
              className="trail-border bg-canvas px-3 py-1.5 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.rank})
                </option>
              ))}
            </select>
          ) : (
            <span className="bg-stone-200 border-2 border-stone-800 text-stone-800 px-3 py-1 text-xs font-black uppercase rounded-sm">
              {currentUser.name}
            </span>
          )}
        </div>
      </div>

      {/* Scout Info Tag with Ranks */}
      <div className="bg-stone-800 text-canvas p-4 trail-border trail-shadow rounded-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-widest text-stone-400 font-bold uppercase">Logbook Record For</span>
          <h2 className="text-xl font-display font-black tracking-wide uppercase text-campfire">
            {activeScout.name}
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="text-[9px] tracking-widest text-stone-400 font-bold uppercase block">Official Rank</span>
            <span className="inline-block bg-forest px-2.5 py-1 text-xs font-extrabold uppercase trail-border rounded-sm mt-1">
              {activeScout.rank}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] tracking-widest text-stone-400 font-bold uppercase block">Self-Attested Rank</span>
            <span className="inline-block bg-campfire px-2.5 py-1 text-xs font-extrabold uppercase trail-border rounded-sm mt-1">
              {selfAttestedRank}
            </span>
          </div>
        </div>
      </div>

      {/* Rank Determination Guide */}
      <div className="bg-stone-100 p-5 trail-border rounded-sm">
        <div className="flex items-center gap-2 border-b border-stone-300 pb-2 mb-3">
          <BookOpen className="w-5 h-5 text-forest" />
          <h3 className="font-display font-black text-sm uppercase text-stone-900">
            How Ranks Are Determined
          </h3>
        </div>
        <p className="text-xs text-stone-600 mb-4 leading-relaxed font-semibold">
          Your rank status is evaluated dynamically as you acquire official course merit badges (checked off by instructors during camps). Self-attested skills show your personal independent growth.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-canvas p-2.5 trail-border rounded-sm flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-stone-500 uppercase">0-1 Badges</span>
            <span className="text-xs font-black text-stone-850 uppercase">Tenderfoot</span>
            <span className="text-[9px] font-bold text-stone-500 mt-1">Starting Rank</span>
          </div>
          <div className="bg-canvas p-2.5 trail-border rounded-sm flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-stone-500 uppercase">2-3 Badges</span>
            <span className="text-xs font-black text-stone-850 uppercase">First Class</span>
            <span className="text-[9px] font-bold text-forest mt-1">Active Scout</span>
          </div>
          <div className="bg-canvas p-2.5 trail-border rounded-sm flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-stone-500 uppercase">4-5 Badges</span>
            <span className="text-xs font-black text-stone-850 uppercase">Star Explorer</span>
            <span className="text-[9px] font-bold text-campfire mt-1">Advanced Scout</span>
          </div>
          <div className="bg-canvas p-2.5 trail-border rounded-sm flex flex-col gap-0.5">
            <span className="text-[10px] font-black text-stone-500 uppercase">6 Badges</span>
            <span className="text-xs font-black text-stone-850 uppercase">Leader-Mentor</span>
            <span className="text-[9px] font-bold text-forest mt-1">Eagle Level</span>
          </div>
        </div>
      </div>

      {/* Self-Attested Skills Ledger (Interactive for Members, Read-Only info for Admins) */}
      <div className="bg-[#EAE6DF] p-5 trail-border trail-shadow rounded-sm">
        <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-campfire" />
            <h3 className="text-base font-display font-extrabold uppercase text-stone-900">
              Self-Attested Skills Ledger
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-stone-700 uppercase">
              Attested: {selfAttestedCheckedCount} / {selfAttestedTotal} Skills
            </span>
          </div>
        </div>
        
        {role !== 'ADMIN' && activeScout.id === currentUser.id ? (
          <p className="text-xs text-stone-700 mb-4 font-semibold">
            Check off any skills you practice on your own outside of class. These self-attested skills demonstrate your independent initiative and help boost your **Self-Attested Rank**.
          </p>
        ) : (
          <p className="text-xs text-stone-700 mb-4 font-semibold">
            Viewing self-attested skills claimed independently by <span className="text-campfire underline">{activeScout.name}</span>. (Read-Only)
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.keys(scoutSelfAttested).map((skillName) => {
            const isChecked = scoutSelfAttested[skillName];
            const checkboxId = `self-skill-${skillName.replace(/\s+/g, '-').toLowerCase()}`;
            const isEditable = role !== 'ADMIN' && activeScout.id === currentUser.id;

            return (
              <button
                key={skillName}
                id={checkboxId}
                disabled={!isEditable}
                onClick={() => handleToggleSelfAttested(activeScout.id, skillName)}
                className={`flex items-center justify-between p-3 trail-border rounded-sm transition-all duration-100 ${
                  isEditable ? 'cursor-pointer hover:bg-stone-50' : 'cursor-default'
                } ${
                  isChecked
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-800 font-bold'
                    : 'bg-canvas text-stone-400 border-stone-300 font-medium'
                }`}
              >
                <span className="text-xs text-left truncate pr-2">{skillName}</span>
                <div className={`w-5 h-5 shrink-0 trail-border rounded-sm flex items-center justify-center ${
                  isChecked ? 'bg-forest text-canvas' : 'bg-stone-100'
                }`}>
                  {isChecked && <span className="text-[10px] font-black">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {badgeDefinitions.map((badge) => {
          const Icon = badge.icon;
          const skillsState = scoutBadges[badge.name] || [false, false, false];
          const completedCount = skillsState.filter(Boolean).length;
          const totalCount = skillsState.length;
          const isEarned = completedCount === totalCount;
          const progressPercentage = (completedCount / totalCount) * 100;

          return (
            <div
              key={badge.name}
              className={`bg-canvas p-5 trail-border trail-shadow rounded-sm transition-all duration-200 relative ${
                isEarned
                  ? 'hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]'
                  : 'grayscale opacity-75 contrast-75 bg-stone-100/50'
              }`}
            >
              {isEarned && (
                <div className="absolute top-3 right-3 bg-campfire text-canvas text-[9px] font-black tracking-wider px-2 py-0.5 trail-border rounded-sm flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-current" /> COMPLETED
                </div>
              )}

              <div className="flex gap-4">
                {/* Badge Icon circle */}
                <div className={`w-14 h-14 shrink-0 rounded-full trail-border flex items-center justify-center ${
                  isEarned ? badge.color : 'bg-stone-300 border-stone-500'
                }`}>
                  <Icon className={`w-7 h-7 ${isEarned ? 'text-canvas' : 'text-stone-600'}`} />
                </div>

                {/* Badge Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-display font-black text-stone-900">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-stone-600 font-medium mb-3">
                    {badge.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                    <span>Progress</span>
                    <span>
                      {completedCount} / {totalCount} Skills
                    </span>
                  </div>
                  <div className="w-full h-3 bg-stone-200 trail-border rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isEarned ? 'bg-forest' : 'bg-campfire'}`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Sub-skills check list */}
              <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-3 gap-2">
                {badge.skills.map((skill, index) => {
                  const done = skillsState[index] || false;
                  return (
                    <div
                      key={index}
                      className={`text-[10px] font-bold py-1 px-1.5 trail-border rounded-sm text-center truncate ${
                        done
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-800'
                          : 'bg-stone-50 text-stone-400 border-stone-300'
                      }`}
                      title={skill}
                    >
                      {skill} {done ? '✓' : '✗'}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Checklist Manager Panel */}
      {role === 'ADMIN' && (
        <div className="bg-stone-200 p-5 mt-4 trail-border trail-shadow rounded-sm">
          <div className="flex items-center gap-2 border-b-2 border-stone-900 pb-2 mb-4">
            <Trophy className="w-5 h-5 text-campfire" />
            <h3 className="text-lg font-display font-extrabold uppercase text-stone-900">
              Leader Endorsement Panel
            </h3>
          </div>
          <p className="text-xs text-stone-700 mb-4 font-semibold">
            Select a skill area below to check off specific requirements for <span className="text-campfire underline">{activeScout.name}</span>.
          </p>

          <div className="flex flex-col gap-4">
            {badgeDefinitions.map((badge) => {
              const skillsState = scoutBadges[badge.name] || [false, false, false];
              return (
                <div key={badge.name} className="bg-canvas p-4 trail-border rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-forest text-canvas trail-border rounded-full">
                      <badge.icon className="w-4 h-4" />
                    </div>
                    <span className="font-display font-extrabold text-sm uppercase text-stone-900">
                      {badge.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {badge.skills.map((skill, index) => {
                      const isDone = skillsState[index] || false;
                      const checkId = `skill-check-${badge.name}-${index}`;
                      return (
                        <button
                          key={index}
                          id={checkId}
                          onClick={() => handleToggleSkill(activeScout.id, badge.name, index)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 trail-border rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
                            isDone
                              ? 'bg-forest text-canvas shadow-[1px_1px_0px_0px_rgba(28,25,23,1)]'
                              : 'bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          <span className="text-xs">{isDone ? '✓' : '☐'}</span>
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Danger Zone: Delete Account */}
      {activeScout.id === currentUser.id && (
        <div className="bg-red-50 border-2 border-red-900 p-5 mt-6 rounded-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 trail-shadow">
          <div>
            <h3 className="font-display font-black text-red-900 text-base uppercase">
              Danger Zone
            </h3>
            <p className="text-xs text-red-800 font-semibold leading-relaxed mt-1">
              Delete your account and permanently remove all your merit badges, self-attested skills, and logbook entries from the portal. This action is irreversible.
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete your account? All your progress will be permanently erased. This cannot be undone.")) {
                onDeleteAccount(currentUser.id);
              }
            }}
            className="bg-red-700 text-canvas font-display font-black uppercase text-xs px-4 py-3 trail-border rounded-sm hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            Delete Account
          </button>
        </div>
      )}
    </section>
  );
}
