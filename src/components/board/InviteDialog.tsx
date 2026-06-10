'use client';

import React, { useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';

interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (emailOrUsername: string, message: string) => Promise<void>;
  projectName: string;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ isOpen, onClose, onInvite, projectName }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) return;

    setLoading(true);
    try {
      await onInvite(emailOrUsername, message);
      setEmailOrUsername('');
      setMessage('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0f172a] w-full max-w-sm p-6 rounded-2xl shadow-2xl relative border border-white/10 animate-in zoom-in duration-300 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        <h2 className="text-xl font-bold mb-4 tracking-tight text-slate-200">Invite to {projectName}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-200 text-sm placeholder-slate-500"
              placeholder="Email or Username"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-300 text-sm placeholder-slate-500 resize-none"
              placeholder="Message (Optional)"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-70 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteDialog;
