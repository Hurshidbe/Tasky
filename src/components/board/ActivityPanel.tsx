'use client';

import React, { useState, useMemo, memo } from 'react';
import { ActivityEvent, Card, Task, UserProfile } from '@/types/board';
import { Clock } from 'lucide-react';

interface ActivityPanelProps {
  activities: ActivityEvent[];
  tasks: Task[];
  cards: Card[];
  collaborators: UserProfile[];
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ activities, tasks, cards, collaborators }) => {
  const [displayCount, setDisplayCount] = useState(20);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const activeUsers = useMemo(() => {
    const userMap = new Map<string, string>();
    activities.forEach(act => {
      if (act.userId && act.userName) {
        userMap.set(act.userId, act.userName);
      }
    });
    return Array.from(userMap.entries()).map(([id, name]) => ({ id, name }));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // 1. User Filter
      if (selectedUser !== 'all' && activity.userId !== selectedUser) {
        return false;
      }

      // 2. Date Filter
      if (activity.createdAt) {
        const activityTime = new Date(activity.createdAt).getTime();

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (activityTime < start.getTime()) return false;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (activityTime > end.getTime()) return false;
        }
      }

      return true;
    });
  }, [activities, selectedUser, startDate, endDate]);

  const displayedActivities = useMemo(() => filteredActivities.slice(0, displayCount), [filteredActivities, displayCount]);
  const hasMore = filteredActivities.length > displayCount;

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    } catch {
      return '--/--/----, --:--';
    }
  };

  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'task_created':
        return { color: 'bg-emerald-500', icon: '✨' };
      case 'task_moved':
        return { color: 'bg-amber-500', icon: '➡️' };
      case 'task_updated':
        return { color: 'bg-blue-500', icon: '✏️' };
      case 'task_deleted':
        return { color: 'bg-red-500', icon: '🗑️' };
      case 'task_reordered':
        return { color: 'bg-violet-500', icon: '↕️' };
      case 'column_created':
        return { color: 'bg-sky-500', icon: '📋' };
      case 'column_deleted':
        return { color: 'bg-red-500', icon: '🗑️' };
      case 'column_renamed':
        return { color: 'bg-indigo-500', icon: '✏️' };
      case 'collaborator_invited':
        return { color: 'bg-purple-500', icon: '✉️' };
      case 'collaborator_joined':
        return { color: 'bg-emerald-500', icon: '👋' };
      case 'project_updated':
        return { color: 'bg-slate-500', icon: '⚙️' };
      case 'background_updated':
        return { color: 'bg-pink-500', icon: '🖼️' };
      default:
        return { color: 'bg-slate-500', icon: '📌' };
    }
  };

  const getActivityMessage = (activity: ActivityEvent) => {
    const taskName = activity.taskName || tasks.find(t => t._id === activity.taskId)?.name;
    const fromCardName = activity.fromCard ? cards.find(c => c._id === activity.fromCard)?.title || 'Unknown Column' : '';
    const toCardName = activity.toCard ? cards.find(c => c._id === activity.toCard)?.title || 'Unknown Column' : '';

    switch (activity.type) {
      case 'task_created':
        return `created task "${taskName || 'Unknown'}"`;
      case 'task_moved':
        return `moved "${taskName || 'Unknown'}" ${fromCardName ? `from ${fromCardName}` : ''} → ${toCardName || 'Unknown'}`;
      case 'task_updated':
        return `updated task "${taskName || 'Unknown'}"`;
      case 'task_deleted':
        return `deleted task "${taskName || 'Unknown'}"`;
      case 'task_reordered':
        return `reordered tasks in "${toCardName || 'column'}"`;
      case 'column_created':
        return `created column "${activity.data?.title || 'Untitled'}"`;
      case 'column_deleted':
        return `deleted column "${activity.data?.title || 'Untitled'}"`;
      case 'column_renamed':
        return `renamed column "${activity.data?.oldTitle || ''}" → "${activity.data?.newTitle || 'Untitled'}"`;
      case 'collaborator_invited':
        return `invited ${activity.data?.email || 'someone'} to the project`;
      case 'collaborator_joined':
        return `joined the project`;
      case 'project_updated':
        return `updated project settings`;
      case 'background_updated':
        return `updated project background`;
      default:
        return 'made an update';
    }
  };

  const getUserName = (activity: ActivityEvent) => {
    if (activity.userName) return activity.userName;
    if (activity.userId) {
      const user = collaborators.find(c => c._id === activity.userId) ||
        (activity.userId === 'owner' ? { firstname: 'Owner', lastname: '' } : null);
      return user ? `${user.firstname} ${user.lastname}`.trim() : 'Unknown';
    }
    return 'Unknown User';
  };

  const getUserAvatar = (activity: ActivityEvent) => {
    return activity.userAvatar;
  };

  return (
    <div className="flex-1 border-l border-white/5 bg-black/20 backdrop-blur-3xl flex flex-col p-4 overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Activity</h3>
          <div className="text-[10px] text-slate-600">
            {filteredActivities.length !== activities.length ? `${filteredActivities.length} of ${activities.length} events` : `${activities.length} events`}
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-5 space-y-3.5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>Filter Activities</span>
            </h4>

            {(selectedUser !== 'all' || startDate || endDate) && (
              <button
                onClick={() => {
                  setSelectedUser('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Member Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 pl-1">Member</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer"
              >
                <option value="all" className="bg-[#0b0f19] text-slate-300">All Members</option>
                {activeUsers.map((user) => (
                  <option key={user.id} value={user.id} className="bg-[#0b0f19] text-slate-300">
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 pl-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all [color-scheme:dark]"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-600 pl-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {displayedActivities.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">
                {activities.length === 0 ? "No activity yet" : "No matching activities found"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
            <div className="space-y-3">
              {displayedActivities.map((activity, index) => {
                const config = getActivityConfig(activity.type);
                const userName = getUserName(activity);
                const userAvatar = getUserAvatar(activity);
                const isLast = index === displayedActivities.length - 1;

                return (
                  <div key={activity._id || index} className="relative pl-6">
                    {!isLast && (
                      <div className="absolute left-2.5 top-7 bottom-0 w-px bg-gradient-to-b from-primary/30 to-transparent" />
                    )}

                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center" style={{ backgroundColor: config.color }}>
                      <span className="text-[10px] leading-none">{config.icon}</span>
                    </div>

                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:border-primary/30 transition-all">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                          {userAvatar ? (
                            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">
                              {userName[0]?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-slate-300 leading-tight">
                            <span className="text-primary font-semibold">{userName}</span>{' '}
                            <span className="text-slate-400">{getActivityMessage(activity)}</span>
                          </p>
                          <p className="text-[10px] text-slate-600 mt-1">
                            {formatTimestamp(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setDisplayCount(prev => prev + 20)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-primary border border-white/10 rounded-xl hover:border-primary/30 transition-all"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ActivityPanel);