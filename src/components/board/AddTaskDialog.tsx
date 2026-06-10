'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, ChevronDown, Check } from 'lucide-react';

import { UserProfile } from '@/types/board';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, description: string, assignedTo?: string | null) => Promise<void>;
  collaborators: UserProfile[];
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ isOpen, onClose, onAdd, collaborators }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Reset inputs when opened
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setAssignedTo('');
      setDropdownOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedUser = collaborators.find(user => user._id === assignedTo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onAdd(name, description, assignedTo || null);
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0f172a] w-full max-w-sm p-6 rounded-2xl shadow-2xl relative border border-white/10 animate-in zoom-in duration-300 text-slate-200">
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>

        <h2 className="text-xl font-bold mb-4 tracking-tight text-slate-200">Create Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Task Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-200 text-sm placeholder-slate-600"
              placeholder="Task name"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-300 resize-none text-sm placeholder-slate-600"
              placeholder="Task description..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assignee</label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-200 text-xs flex items-center justify-between cursor-pointer min-h-[42px]"
            >
              {selectedUser ? (
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-5.5 h-5.5 rounded-full overflow-hidden bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400">
                        {selectedUser.firstname?.[0] || '?'}
                      </span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-slate-200">{selectedUser.firstname} {selectedUser.lastname || ''}</p>
                    <p className="text-[9px] text-slate-500 font-semibold">{selectedUser.profession || (selectedUser._id === collaborators[0]?._id ? 'Project Owner' : 'Collaborator')}</p>
                  </div>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">Unassigned</span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Dropdown List */}
            {dropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 max-h-[160px] overflow-y-auto custom-scrollbar space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setAssignedTo('');
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    assignedTo === '' ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>Unassigned</span>
                  {assignedTo === '' && (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                </button>
                {collaborators.map((user) => {
                  const isOwner = user._id === collaborators[0]?._id;
                  const roleOrProfession = user.profession || (isOwner ? 'Project Owner' : 'Collaborator');
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => {
                        setAssignedTo(user._id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left py-1.5 px-2 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
                        assignedTo === user._id ? 'bg-primary/20 text-white' : 'hover:bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="w-5.5 h-5.5 rounded-full overflow-hidden bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400">
                            {user.firstname?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <div className="leading-tight min-w-0 text-left">
                        <p className="text-xs font-bold truncate">{user.firstname} {user.lastname || ''}</p>
                        <p className="text-[9px] text-slate-500 truncate font-semibold">{roleOrProfession}</p>
                      </div>
                      {assignedTo === user._id && (
                        <Check className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 text-slate-300 font-semibold py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-sm cursor-pointer">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskDialog;
