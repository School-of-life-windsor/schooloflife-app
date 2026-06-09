import React, { useState, useEffect } from 'react';
import { Users, Check, X, ShieldAlert } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabaseClient';

export default function UserManagement({ role, currentUser, onDeleteAccount }) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const roles = [
    { value: 'COMMUNITY_MEMBER', label: 'Community Member' },
    { value: 'CORE_MEMBER', label: 'Core Member' },
    { value: 'VOLUNTEER', label: 'Leadership/Volunteer' },
    { value: 'ADMIN', label: 'Administrator / Leader' }
  ];

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (isConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsersList(data || []);
      } else {
        // Fallback LocalStorage (Cleaned from mock users)
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const combined = localUsers.map((lu) => ({
          id: lu.id,
          name: lu.name,
          memberId: lu.memberId,
          member_id: lu.memberId, // match Supabase snake_case key
          username: lu.username,
          email: lu.email,
          age: lu.age,
          role: lu.role,
          status: lu.status
        }));
        setUsersList(combined);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not load user profiles from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      if (isConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ status: newStatus })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // LocalStorage mock
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const updated = localUsers.map((u) => {
          if (u.id === userId || u.memberId === userId) {
            return { ...u, status: newStatus };
          }
          return u;
        });
        localStorage.setItem('sol_users', JSON.stringify(updated));
      }
      
      // Update UI list state
      setUsersList(usersList.map((u) => {
        if (u.id === userId) {
          return { ...u, status: newStatus };
        }
        return u;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      if (isConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // LocalStorage mock
        const localUsers = JSON.parse(localStorage.getItem('sol_users') || '[]');
        const updated = localUsers.map((u) => {
          if (u.id === userId || u.memberId === userId) {
            return { ...u, role: newRole };
          }
          return u;
        });
        localStorage.setItem('sol_users', JSON.stringify(updated));
      }

      setUsersList(usersList.map((u) => {
        if (u.id === userId) {
          return { ...u, role: newRole };
        }
        return u;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to update role.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-900 border-emerald-900';
      case 'DENIED': return 'bg-red-100 text-red-900 border-red-900';
      default: return 'bg-amber-100 text-amber-900 border-amber-900 animate-pulse';
    }
  };

  return (
    <section className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-3 border-b-4 border-stone-900 pb-3">
        <Users className="w-8 h-8 text-forest" />
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-forest m-0">
            USER DIRECTORY
          </h1>
          <p className="text-stone-600 text-sm">
            Manage registered members, clearance levels, and review signup details.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border-2 border-red-950 p-4 rounded-sm text-xs font-bold text-red-950 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-canvas border-2 border-stone-900 rounded-sm overflow-hidden trail-shadow">
        <div className="p-4 bg-stone-100 border-b-2 border-stone-900 flex justify-between items-center">
          <span className="text-xs font-black uppercase text-stone-900 tracking-wider">
            Roster ({usersList.length} total)
          </span>
          <button
            onClick={fetchUsers}
            className="px-2.5 py-1 text-[10px] font-black uppercase bg-stone-900 text-canvas border border-stone-850 rounded-sm cursor-pointer hover:bg-stone-850"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-500 font-bold uppercase text-sm animate-pulse">
            Querying profiles from database...
          </div>
        ) : usersList.length === 0 ? (
          <div className="p-8 text-center text-stone-500 font-bold uppercase text-sm">
            No registered users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-200 border-b border-stone-900 text-[10px] font-black uppercase text-stone-750">
                  <th className="p-3">Brother Info</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Member ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned Role Tier</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {usersList.map((user) => {
                  const mId = user.member_id || user.memberId;
                  const isSelf = user.id === currentUser.id || mId === currentUser.memberId;
                  
                  return (
                    <tr key={user.id} className="hover:bg-stone-50/50 transition-colors text-sm">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900 flex items-center gap-1">
                            {user.name} 
                            {isSelf && <span className="bg-stone-800 text-canvas text-[8px] px-1.5 py-0.5 rounded-sm">You</span>}
                          </span>
                          {user.username && (
                            <span className="text-[10px] text-stone-500 font-semibold">@{user.username}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-stone-650">
                        {user.email || 'N/A'}
                      </td>
                      <td className="p-3 font-semibold text-stone-650">
                        {user.age || 'N/A'}
                      </td>
                      <td className="p-3 font-mono text-xs font-bold text-stone-650">
                        {mId}
                      </td>
                      <td className="p-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getStatusStyle(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {isSelf ? (
                          <span className="text-xs text-stone-500 font-bold uppercase">
                            {user.role.replace('_', ' ')}
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="bg-canvas border border-stone-300 text-xs font-bold uppercase py-1 px-2 focus:outline-none focus:ring-1 focus:ring-campfire rounded-sm cursor-pointer"
                          >
                            {roles.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {!isSelf && (
                          <div className="flex justify-end gap-1.5">
                            {user.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                                className="bg-emerald-600 text-canvas p-1.5 trail-border rounded-sm hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                                title="Approve Member"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {user.status !== 'DENIED' && (
                              <button
                                onClick={() => handleUpdateStatus(user.id, 'DENIED')}
                                className="bg-red-600 text-canvas p-1.5 trail-border rounded-sm hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                                title="Decline Member"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${user.name}'s account? This action is permanent and cannot be undone.`)) {
                                  onDeleteAccount(user.id);
                                }
                              }}
                              className="bg-stone-900 text-canvas p-1.5 trail-border rounded-sm hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                              title="Delete Member Account"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
