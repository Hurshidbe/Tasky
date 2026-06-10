'use client';

import React, { useRef, useState, useEffect, memo } from 'react';
import { ChevronLeft, Users, Calendar, X, Menu } from 'lucide-react';
import Link from 'next/link';
import { ProjectData } from '@/types/board';
import { toast } from 'react-hot-toast';

interface BoardHeaderProps {
  project: ProjectData;
  isOwner: boolean;
  onInviteClick: () => void;
  onBackgroundUpload: (file: File) => Promise<void>;
  backgroundLoading?: boolean;
  onSettingsClick?: () => void;
  onMenuClick?: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
  project,
  isOwner,
  onInviteClick,
  onBackgroundUpload,
  backgroundLoading = false,
  onSettingsClick,
  onMenuClick,
}) => {
  const bgInputRef = useRef<HTMLInputElement>(null);
  const descContainerRef = useRef<HTMLDivElement>(null);
  const [isCollabPanelOpen, setIsCollabPanelOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Iltimos, JPG, PNG yoki WEBP formatidagi rasm yuklang.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Rasm hajmi 5MB dan kichik bo‘lishi lozim.');
        return;
      }
      onBackgroundUpload(file);
    }
  };

  const formatCreatedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `Yaratilgan: ${day}-${month}, ${year}`;
    } catch (e) {
      return 'Yaratilgan: Noma’lum';
    }
  };

  const isPlaceholder = !project.description?.trim();
  const descText = project.description?.trim() || "Loyiha uchun description mavjud emas";

  useEffect(() => {
    const checkOverflow = () => {
      if (descContainerRef.current) {
        const { scrollWidth, clientWidth } = descContainerRef.current;
        setIsOverflowing(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [descText]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .marquee-mask {
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 25s linear infinite;
        }
      `}} />
      <header className="border-b border-white/10 bg-slate-900/30 backdrop-blur-md px-4 py-2.5 flex justify-between items-center z-30 shrink-0 shadow-lg shadow-black/10">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-300 hover:text-white cursor-pointer active:scale-95 shadow-sm">
            <ChevronLeft className="w-4.5 h-4.5" />
          </Link>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 md:hidden text-slate-300 hover:text-white cursor-pointer active:scale-95 shadow-sm"
              title="Menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          )}
          <h1 className="text-lg md:text-xl font-black tracking-tight truncate max-w-[120px] sm:max-w-[200px] text-white">{project.name}</h1>
        </div>

        {/* Middle Area: Description & Creation Date */}
        <div className="flex-1 hidden md:flex items-center justify-between mx-6 gap-6 min-w-0">
          {/* Box 1: Description marquee/static text */}
          <div className="flex-1 min-w-0 max-w-[500px]">
            <div
              ref={descContainerRef}
              className={`overflow-hidden relative w-full py-1 text-slate-400 hover:text-slate-200 transition-colors duration-300 text-xs font-medium tracking-wide flex items-center ${isOverflowing ? 'marquee-mask' : ''
                }`}
            >
              {isOverflowing ? (
                <div className="inline-block animate-marquee hover:[animation-play-state:paused] cursor-default whitespace-nowrap">
                  <span className="inline-block pr-12">{descText}</span>
                  <span className="inline-block pr-12">{descText}</span>
                </div>
              ) : (
                <span className={isPlaceholder ? "text-slate-500/80 italic font-normal" : "text-slate-400"}>
                  {descText}
                </span>
              )}
            </div>
          </div>

          {/* Box 2: Created at badge */}
          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-3.5 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-400 shrink-0 shadow-inner select-none hover:bg-white/[0.04] hover:border-white/10 transition-all">
            <Calendar className="w-3.5 h-3.5 text-primary/80" />
            <span>{formatCreatedDate(project.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Invisible elements preserved to support controller upload lifecycle */}
          {isOwner && (
            <input
              type="file"
              ref={bgInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBackgroundChange}
            />
          )}

          <button
            onClick={() => setIsCollabPanelOpen(!isCollabPanelOpen)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl hover:bg-white/10 transition-all font-medium text-xs shadow-sm shadow-black/5"
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="text-slate-300">{(project.collaborators?.length || 0) + 1}</span>
          </button>

          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 shadow-md">
            {project.owner.avatar ? (
              <img src={project.owner.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary/60 text-sm">
                {project.owner.firstname?.[0] || '?'}
              </div>
            )}
          </div>

          {isCollabPanelOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-72 bg-[#0f172a]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Members</h3>
                <button onClick={() => setIsCollabPanelOpen(false)} className="p-1 hover:bg-white/5 rounded-full">
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                    {project.owner.avatar ? (
                      <img src={project.owner.avatar} className="w-full h-full object-cover" alt={project.owner.firstname} />
                    ) : (
                      <span className="font-bold text-primary text-sm">{project.owner.firstname?.[0] || '?'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-white">{project.owner.firstname} {project.owner.lastname}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Owner</p>
                  </div>
                </div>

                {(project.collaborators || []).map((c: import('@/types/board').UserProfile) => {
                  if (!c) return null;
                  const isObj = typeof c === 'object';
                  const avatar = isObj ? c.avatar : undefined;
                  const firstname = isObj ? c.firstname : '';
                  const lastname = isObj ? c.lastname : '';
                  const profession = isObj ? c.profession : '';
                  const initial = firstname ? firstname[0] : '?';
                  const id = isObj ? c._id : String(c);
                  return (
                    <div key={id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt={firstname} /> : <span className="font-bold text-slate-400 text-sm">{initial}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-slate-200">{firstname} {lastname}</p>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">
                          {profession || (id === project.owner._id ? 'Owner' : 'Collaborator')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isOwner && (
                <button
                  onClick={onInviteClick}
                  className="w-full mt-4 py-2.5 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-primary/90 transition-all"
                >
                  + Invite Member
                </button>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default memo(BoardHeader);