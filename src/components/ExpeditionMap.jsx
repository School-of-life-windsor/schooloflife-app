import React, { useState } from 'react';
import { Map, Calendar, Clock, MapPin, CheckSquare, Users, Plus, X, Award } from 'lucide-react';
import { ROLE_LEVELS } from '../lib/supabaseClient';

export default function ExpeditionMap({ events, setEvents, members, role, currentUser }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [visibility, setVisibility] = useState('COMMUNITY_MEMBER');
  const [errors, setErrors] = useState({});

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!date) newErrors.date = 'Date is required';
    if (!time) newErrors.time = 'Time is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!skills.trim()) newErrors.skills = 'At least one skill is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const defaultAttendance = {};
    members.forEach((m) => {
      defaultAttendance[m.id] = false;
    });

    const newEvent = {
      id: Date.now(),
      title: title.trim(),
      date,
      time,
      location: location.trim(),
      skills: skillsArray,
      attendance: defaultAttendance,
      visibility
    };

    setEvents([...events, newEvent]);
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setSkills('');
    setVisibility('COMMUNITY_MEMBER');
    setErrors({});
    setIsModalOpen(false);
  };

  const toggleAttendance = (eventId, memberId) => {
    setEvents(
      events.map((evt) => {
        if (evt.id === eventId) {
          return {
            ...evt,
            attendance: {
              ...evt.attendance,
              [memberId]: !evt.attendance[memberId],
            },
          };
        }
        return evt;
      })
    );
  };

  const userRoleLevel = ROLE_LEVELS[role] || 1;
  const filteredEvents = events.filter((event) => {
    const eventVisibility = event.visibility || 'COMMUNITY_MEMBER';
    const eventLevel = ROLE_LEVELS[eventVisibility] || 1;
    return userRoleLevel >= eventLevel;
  });

  return (
    <section className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b-4 border-stone-900 pb-3">
        <div className="flex items-center gap-3">
          <Map className="w-8 h-8 text-forest" />
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight text-forest m-0">
              EXPEDITION MAP
            </h1>
            <p className="text-stone-600 text-sm">
              Upcoming camps, excursions, workshops, and required training modules.
            </p>
          </div>
        </div>

        {role === 'ADMIN' && (
          <button
            id="add-event-btn"
            onClick={() => setIsModalOpen(true)}
            className="bg-campfire text-canvas py-2 px-4 text-xs font-bold uppercase trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(28,25,23,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 cursor-pointer flex items-center gap-1.5 rounded-sm"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        )}
      </div>

      {/* Events Timeline */}
      <div className="relative border-l-4 border-stone-900 ml-4 md:ml-6 pl-6 md:pl-8 py-2 flex flex-col gap-8">
        {filteredEvents.length === 0 ? (
          <div className="bg-stone-100 p-8 text-center trail-border rounded-sm -ml-10">
            <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-2" />
            <p className="font-bold text-stone-700">No events scheduled.</p>
            {role === 'ADMIN' && <p className="text-stone-500 text-sm">Click "Add Event" to schedule the first one.</p>}
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const hasAttended = event.attendance?.[currentUser.id] || false;
            
            return (
              <div key={event.id} className="relative">
                {/* Timeline Node Badge */}
                <div className="absolute -left-[45px] md:-left-[53px] top-1.5 bg-forest text-canvas trail-border w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-sm z-10">
                  {index + 1}
                </div>

                {/* Event Card */}
                <div className="bg-canvas p-5 md:p-6 trail-border trail-shadow rounded-sm flex flex-col gap-5 hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all">
                  {/* Header info */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-stone-100 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-display font-black text-stone-900">
                          {event.title}
                        </h2>
                        <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 bg-stone-200 text-stone-750 border border-stone-450 rounded-sm">
                          Visibility: {event.visibility ? event.visibility.replace('_', ' ') : 'COMMUNITY MEMBER'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-stone-600 text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-campfire" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-campfire" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-campfire" />
                          {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Member Attendance indicator */}
                    {role !== 'ADMIN' && (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 trail-border rounded-sm text-xs font-bold uppercase ${
                        hasAttended 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-950' 
                          : 'bg-stone-100 text-stone-500 border-stone-300'
                      }`}>
                        <CheckSquare className={`w-4 h-4 ${hasAttended ? 'text-emerald-700' : 'text-stone-400'}`} />
                        <span>{hasAttended ? 'Attended' : 'Not Attended'}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills checklist */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider mb-2 flex items-center gap-1">
                      <Award className="w-4 h-4 text-forest" /> SKILLS TO LEARN
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {event.skills.map((skill, i) => (
                        <span key={i} className="bg-stone-100 text-stone-800 text-xs font-bold px-3 py-1 trail-border rounded-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Admin Attendance controls */}
                  {role === 'ADMIN' && (
                    <div className="bg-stone-100 p-4 trail-border rounded-sm">
                      <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider mb-3 flex items-center gap-1 border-b border-stone-300 pb-1.5">
                        <Users className="w-4 h-4 text-campfire" /> MEMBER ATTENDANCE ROSTER
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {members.map((member) => {
                          const attended = event.attendance?.[member.id] || false;
                          const inputId = `att-toggle-${event.id}-${member.id}`;
                          return (
                            <div key={member.id} className="flex items-center justify-between p-2 bg-canvas trail-border rounded-sm">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-stone-900">{member.name}</span>
                                <span className="text-[10px] uppercase font-bold text-stone-500">{member.rank}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase ${attended ? 'text-emerald-800' : 'text-stone-400'}`}>
                                  {attended ? 'Attended' : 'Absent'}
                                </span>
                                <button
                                  id={inputId}
                                  onClick={() => toggleAttendance(event.id, member.id)}
                                  className={`w-6 h-6 trail-border rounded-sm flex items-center justify-center transition-all ${
                                    attended
                                      ? 'bg-emerald-600 border-stone-900 text-canvas shadow-[1px_1px_0px_0px_rgba(28,25,23,1)]'
                                      : 'bg-canvas hover:bg-stone-50'
                                  }`}
                                >
                                  {attended && <span className="text-xs font-black">✓</span>}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-canvas trail-border trail-shadow rounded-sm max-w-lg w-full p-6 relative flex flex-col gap-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-stone-600 hover:text-stone-950 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 border-b-2 border-stone-900 pb-2">
              <Calendar className="w-6 h-6 text-campfire" />
              <h3 className="text-xl font-display font-black text-stone-900 uppercase">
                Schedule New Expedition
              </h3>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="event-title" className="text-xs font-bold uppercase text-stone-700">
                  Event Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Wilderness Navigation Excursion"
                  className="trail-border bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                />
                {errors.title && <span className="text-xs text-campfire font-bold">{errors.title}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="event-date" className="text-xs font-bold uppercase text-stone-700">
                    Date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="trail-border bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                  />
                  {errors.date && <span className="text-xs text-campfire font-bold">{errors.date}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="event-time" className="text-xs font-bold uppercase text-stone-700">
                    Time
                  </label>
                  <input
                    id="event-time"
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g., 09:00 AM - 04:00 PM"
                    className="trail-border bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                  />
                  {errors.time && <span className="text-xs text-campfire font-bold">{errors.time}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="event-location" className="text-xs font-bold uppercase text-stone-700">
                  Location
                </label>
                <input
                  id="event-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Redwood State Park Campgrounds"
                  className="trail-border bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                />
                {errors.location && <span className="text-xs text-campfire font-bold">{errors.location}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="event-skills" className="text-xs font-bold uppercase text-stone-700">
                    Skills to Learn (comma-separated)
                  </label>
                  <input
                    id="event-skills"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., Compass Reading, Topo Mapping"
                    className="trail-border bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                  />
                  {errors.skills && <span className="text-xs text-campfire font-bold">{errors.skills}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="event-visibility" className="text-xs font-bold uppercase text-stone-700">
                    Required Role Visibility
                  </label>
                  <select
                    id="event-visibility"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="trail-border bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
                  >
                    <option value="COMMUNITY_MEMBER">Community Member</option>
                    <option value="CORE_MEMBER">Core Member</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="ADMIN">Admin Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold uppercase border-2 border-stone-900 bg-stone-200 text-stone-900 trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer rounded-sm"
                >
                  Cancel
                </button>
                <button
                  id="event-submit"
                  type="submit"
                  className="px-4 py-2 text-sm font-bold uppercase bg-campfire text-canvas trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer rounded-sm"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
