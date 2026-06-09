import React, { useState } from 'react';
import { Megaphone, Plus, MessageSquare, Ban, Flag, Trash2, ShieldAlert } from 'lucide-react';
import { ROLE_LEVELS } from '../lib/supabaseClient';

export default function NoticeBoard({ announcements, setAnnouncements, onUpdateNotice, onDeleteNotice, role, currentUser }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [visibility, setVisibility] = useState('COMMUNITY_MEMBER');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('sol_blocked_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const categories = ['Gear Notice', 'Schedule Change', 'Weather Alert', 'General', 'Achievement'];

  const getAllowedVisibilities = () => {
    const list = [
      { value: 'COMMUNITY_MEMBER', label: 'Community Member' }
    ];
    if (role === 'CORE_MEMBER' || role === 'VOLUNTEER' || role === 'ADMIN') {
      list.push({ value: 'CORE_MEMBER', label: 'Core Member' });
    }
    if (role === 'VOLUNTEER' || role === 'ADMIN') {
      list.push({ value: 'VOLUNTEER', label: 'Volunteer' });
    }
    if (role === 'ADMIN') {
      list.push({ value: 'ADMIN', label: 'Admin Only' });
    }
    return list;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: title.trim(),
      category,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      body: content.trim(),
      visibility,
      author_name: currentUser.name,
      author_id: currentUser.id || currentUser.memberId,
      author_username: currentUser.username,
      flagged: false,
      flagged_by: [],
      reactions: {},
      comments: [],
      pinned: false
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle('');
    setContent('');
    setCategory('General');
    setVisibility('COMMUNITY_MEMBER');
    setErrors({});
  };

  const handleToggleReaction = (noticeId, emoji) => {
    const notice = announcements.find((a) => a.id === noticeId);
    if (!notice) return;

    const currentReactions = notice.reactions || {};
    const userId = currentUser.id || currentUser.memberId;
    const userReactedList = currentReactions[emoji] || [];

    let updatedList;
    if (userReactedList.includes(userId)) {
      updatedList = userReactedList.filter((id) => id !== userId);
    } else {
      updatedList = [...userReactedList, userId];
    }

    const updatedReactions = {
      ...currentReactions,
      [emoji]: updatedList,
    };

    onUpdateNotice(noticeId, { reactions: updatedReactions });
  };

  const handleAddComment = (noticeId, commentText) => {
    if (!commentText.trim()) return;

    const notice = announcements.find((a) => a.id === noticeId);
    if (!notice) return;

    const currentComments = notice.comments || [];
    const newComment = {
      id: Date.now(),
      name: currentUser.name,
      author_id: currentUser.id || currentUser.memberId,
      author_username: currentUser.username,
      text: commentText.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      flagged: false,
      flagged_by: []
    };

    const updatedComments = [...currentComments, newComment];
    onUpdateNotice(noticeId, { comments: updatedComments });
  };

  const toggleCommentsExpanded = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleBlockUser = (targetUserId, targetUsername) => {
    const myId = currentUser.id || currentUser.memberId;
    if (targetUserId === myId || targetUsername === currentUser.username) {
      alert("You cannot block yourself!");
      return;
    }

    if (confirm(`Are you sure you want to block and mute ${targetUsername || 'this user'}? You will no longer see their announcements or comments.`)) {
      const updated = [...blockedUsers, targetUserId || targetUsername];
      setBlockedUsers(updated);
      localStorage.setItem('sol_blocked_users', JSON.stringify(updated));
      alert(`You have blocked ${targetUsername || 'this user'}.`);
    }
  };

  const handleFlagNotice = (noticeId) => {
    const notice = announcements.find((a) => a.id === noticeId);
    if (!notice) return;

    const myId = currentUser.id || currentUser.memberId;
    const currentFlaggedBy = notice.flagged_by || [];
    
    if (currentFlaggedBy.includes(myId)) {
      alert("You have already reported this notice. Administrators are reviewing it.");
      return;
    }

    const updatedFlaggedBy = [...currentFlaggedBy, myId];
    
    onUpdateNotice(noticeId, { 
      flagged: true, 
      flagged_by: updatedFlaggedBy 
    });

    alert("Thank you for your report. The administrators have been notified and will review this content within 24 hours. If found objectionable, it will be deleted immediately.");
  };

  const handleFlagComment = (noticeId, commentId) => {
    const notice = announcements.find((a) => a.id === noticeId);
    if (!notice) return;

    const myId = currentUser.id || currentUser.memberId;
    const updatedComments = (notice.comments || []).map((c) => {
      if (c.id === commentId) {
        const commentFlaggedBy = c.flagged_by || [];
        if (commentFlaggedBy.includes(myId)) {
          alert("You have already reported this reply. Administrators are reviewing it.");
          return c;
        }
        return {
          ...c,
          flagged: true,
          flagged_by: [...commentFlaggedBy, myId]
        };
      }
      return c;
    });

    onUpdateNotice(noticeId, { comments: updatedComments });
    
    alert("Thank you for your report. The administrators have been notified and will review this content within 24 hours. If found objectionable, it will be deleted immediately.");
  };

  const handleDeleteComment = (noticeId, commentId) => {
    if (!confirm("Are you sure you want to permanently delete this reply?")) return;
    
    const notice = announcements.find((a) => a.id === noticeId);
    if (!notice) return;

    const updatedComments = (notice.comments || []).filter((c) => c.id !== commentId);
    onUpdateNotice(noticeId, { comments: updatedComments });
    alert("Reply deleted successfully.");
  };

  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'Gear Notice':
        return 'bg-amber-100 text-amber-900 border-amber-900';
      case 'Schedule Change':
        return 'bg-sky-100 text-sky-900 border-sky-900';
      case 'Weather Alert':
        return 'bg-red-100 text-red-900 border-red-900';
      case 'Achievement':
        return 'bg-emerald-100 text-emerald-900 border-emerald-900';
      default:
        return 'bg-stone-200 text-stone-900 border-stone-900';
    }
  };

  const userRoleLevel = ROLE_LEVELS[role] || 1;
  const filteredAnnouncements = announcements.filter((item) => {
    const itemVisibility = item.visibility || 'COMMUNITY_MEMBER';
    const itemLevel = ROLE_LEVELS[itemVisibility] || 1;
    if (userRoleLevel < itemLevel) return false;

    // Filter out posts if author is blocked
    const authorId = item.author_id;
    const authorUsername = item.author_username;
    if (blockedUsers.includes(authorId) || (authorUsername && blockedUsers.includes(authorUsername))) {
      return false;
    }
    return true;
  });

  return (
    <section className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-3 border-b-4 border-stone-900 pb-3">
        <Megaphone className="w-8 h-8 text-forest" />
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-forest m-0">
            THE NOTICE BOARD
          </h1>
          <p className="text-stone-600 text-sm">
            Official announcements, member notices, and safety briefings.
          </p>
        </div>
      </div>

      {/* Notice / Announcement Creator Form (Available for all roles to interact with) */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#EAE6DF] p-5 trail-border trail-shadow rounded-sm flex flex-col gap-4"
      >
        <div className="flex items-center gap-2 border-b-2 border-stone-900 pb-2">
          <Plus className="w-5 h-5 text-campfire" />
          <h3 className="text-lg font-display font-extrabold uppercase text-stone-900">
            Post New Notice / Update
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 flex flex-col gap-1">
            <label htmlFor="announcement-title" className="text-xs font-bold uppercase text-stone-700">
              Announcement Title
            </label>
            <input
              id="announcement-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Camp Packing List Update"
              className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
            />
            {errors.title && <span className="text-xs text-campfire font-bold">{errors.title}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="announcement-category" className="text-xs font-bold uppercase text-stone-700">
              Category
            </label>
            <select
              id="announcement-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="announcement-visibility" className="text-xs font-bold uppercase text-stone-700">
              Visibility clearance
            </label>
            <select
              id="announcement-visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm"
            >
              {getAllowedVisibilities().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="announcement-content" className="text-xs font-bold uppercase text-stone-700">
            Content
          </label>
          <textarea
            id="announcement-content"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide detailed instructions, links, or briefings..."
            className="trail-border bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-campfire rounded-sm resize-none"
          />
          {errors.content && <span className="text-xs text-campfire font-bold">{errors.content}</span>}
        </div>

        <button
          id="announcement-submit"
          type="submit"
          className="bg-campfire text-canvas py-2 px-4 text-sm font-bold uppercase trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(28,25,23,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 cursor-pointer self-end rounded-sm"
        >
          Post Update
        </button>
      </form>

      {/* Feed List */}
      <div className="flex flex-col gap-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-stone-100 p-8 text-center trail-border rounded-sm">
            <MessageSquare className="w-12 h-12 text-stone-400 mx-auto mb-2" />
            <p className="font-bold text-stone-700">No announcements posted yet.</p>
            <p className="text-stone-500 text-sm">Post one above using leadership controls!</p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <article
              key={item.id}
              className={`p-6 trail-border trail-shadow rounded-sm relative hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all duration-200 ${
                item.flagged ? 'bg-red-50/30 border-red-400 shadow-[6px_6px_0px_0px_rgba(185,28,28,1)]' : 'bg-canvas'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-stone-200 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 border rounded-full ${getCategoryStyles(item.category)}`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 border border-stone-400 bg-stone-100 text-stone-750 rounded-full">
                    Visibility: {item.visibility ? item.visibility.replace('_', ' ') : 'COMMUNITY MEMBER'}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {item.date}
                  </span>
                  <span className="text-xs text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded-sm border border-stone-250">
                    By: {item.author_name || 'School of Life'} {item.author_username && `(@${item.author_username})`}
                  </span>
                  
                  {item.flagged && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider bg-red-100 text-red-700 px-2 py-0.5 border border-red-300 rounded-sm animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" /> Flagged for Review
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* UGC controls for announcement */}
                  {item.author_id !== (currentUser.id || currentUser.memberId) && (
                    <>
                      <button
                        onClick={() => handleBlockUser(item.author_id, item.author_username || item.author_name)}
                        title="Block User"
                        className="flex items-center gap-1 px-2 py-1 text-xs font-bold border border-stone-300 bg-stone-50 text-stone-600 hover:bg-red-50 hover:text-red-600 rounded-sm transition-all cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Block</span>
                      </button>
                      <button
                        onClick={() => handleFlagNotice(item.id)}
                        title="Report Content"
                        className={`flex items-center gap-1 px-2 py-1 text-xs font-bold border rounded-sm transition-all cursor-pointer ${
                          item.flagged_by?.includes(currentUser.id || currentUser.memberId)
                            ? 'bg-campfire/10 border-campfire text-campfire'
                            : 'bg-stone-50 border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-campfire'
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Report</span>
                      </button>
                    </>
                  )}

                  {role === 'ADMIN' && (
                    <button
                      onClick={() => onDeleteNotice && onDeleteNotice(item.id)}
                      title="Delete Announcement"
                      className="flex items-center gap-1 px-2 py-1 text-xs font-bold border border-red-900 bg-red-50 text-red-950 hover:bg-red-100 rounded-sm transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                </div>
              </div>
              
              <h2 className="text-xl font-display font-black text-stone-900 mb-2 leading-snug">
                {item.title}
              </h2>
              
              <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line mb-4">
                {item.body}
              </p>

              {/* Reactions & Comments Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4 mt-2">
                <div className="flex items-center gap-2">
                  {['👍', '❤️', '🔥', '👏'].map((emoji) => {
                    const reactList = item.reactions?.[emoji] || [];
                    const hasReacted = reactList.includes(currentUser.id || currentUser.memberId);
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(item.id, emoji)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border rounded-sm transition-all cursor-pointer ${
                          hasReacted
                            ? 'bg-campfire/15 border-campfire text-campfire shadow-sm'
                            : 'bg-stone-50 border-stone-300 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{reactList.length}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => toggleCommentsExpanded(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold border border-stone-900 bg-stone-100 text-stone-900 trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer rounded-sm"
                >
                  <MessageSquare className="w-4 h-4 text-forest" />
                  <span>Replies ({item.comments?.length || 0})</span>
                </button>
              </div>

              {/* Collapsible Comments Section */}
              {expandedComments[item.id] && (
                <div className="mt-4 pt-4 border-t-2 border-dashed border-stone-350 flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                    Replies ({item.comments?.length || 0})
                  </h4>
                  
                  {/* Comments List */}
                  {(!item.comments || item.comments.length === 0) ? (
                    <p className="text-xs text-stone-500 italic pl-1">No replies yet. Be the first to reply!</p>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {item.comments
                        .filter((comment) => {
                          const commenterId = comment.author_id;
                          const commenterUsername = comment.author_username;
                          if (blockedUsers.includes(commenterId) || (commenterUsername && blockedUsers.includes(commenterUsername))) {
                            return false;
                          }
                          return true;
                        })
                        .map((comment) => (
                          <div key={comment.id} className={`p-3 trail-border rounded-sm text-xs flex flex-col gap-1 ${comment.flagged ? 'bg-red-50/50 border-red-300' : 'bg-stone-55'}`}>
                            <div className="flex items-center justify-between text-stone-500 font-bold mb-1">
                              <span className="text-forest uppercase tracking-wide">
                                {comment.name} {comment.author_username && `(@${comment.author_username})`}
                                {comment.flagged && (
                                  <span className="ml-2 text-[9px] uppercase font-black text-red-700 bg-red-100 px-1.5 py-0.5 border border-red-200 rounded-sm inline-flex items-center gap-0.5">
                                    <ShieldAlert className="w-2.5 h-2.5" /> Flagged
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-stone-400 font-medium">{comment.date}</span>
                                
                                {comment.author_id !== (currentUser.id || currentUser.memberId) && (
                                  <>
                                    <button
                                      onClick={() => handleBlockUser(comment.author_id, comment.author_username || comment.name)}
                                      title="Block User"
                                      className="text-stone-400 hover:text-red-650 transition-colors p-0.5 cursor-pointer border-none bg-transparent"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleFlagComment(item.id, comment.id)}
                                      title="Report Reply"
                                      className={`transition-colors p-0.5 cursor-pointer border-none bg-transparent ${
                                        comment.flagged_by?.includes(currentUser.id || currentUser.memberId)
                                          ? 'text-campfire'
                                          : 'text-stone-400 hover:text-campfire'
                                      }`}
                                    >
                                      <Flag className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                                
                                {role === 'ADMIN' && (
                                  <button
                                    onClick={() => handleDeleteComment(item.id, comment.id)}
                                    title="Delete Reply"
                                    className="text-stone-400 hover:text-red-750 transition-colors p-0.5 cursor-pointer border-none bg-transparent"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-stone-850 font-medium whitespace-pre-wrap">{comment.text}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Add Comment Input Form */}
                  <div className="flex gap-2 items-stretch mt-1">
                    <input
                      type="text"
                      placeholder="Write a reply... (Press Enter to post)"
                      id={`comment-input-${item.id}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(item.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 trail-border bg-stone-50 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-campfire rounded-sm"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`comment-input-${item.id}`);
                        if (input && input.value.trim()) {
                          handleAddComment(item.id, input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-forest text-canvas px-4 text-xs font-bold uppercase trail-border trail-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none cursor-pointer rounded-sm"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
