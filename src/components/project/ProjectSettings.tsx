import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { ProjectData } from '@/types/board';

interface ProjectSettingsProps {
  project: ProjectData;
  onBackgroundUpload: (file: File) => Promise<void>;
  backgroundLoading?: boolean;
  onAvatarUpload: (file: File) => Promise<void>;
  avatarLoading?: boolean;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  project,
  onBackgroundUpload,
  backgroundLoading = false,
  onAvatarUpload,
  avatarLoading = false,
}) => {
  const bgInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File, maxSizeMB: number) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload JPG, PNG, or WEBP image.');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image size must be under ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file, 5)) {
      onBackgroundUpload(file);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file, 2)) {
      onAvatarUpload(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Background Section */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h3 className="text-xl font-bold mb-4 text-slate-200">Project Background</h3>
        {project.background && (
          <div className="mb-4 rounded-xl overflow-hidden border border-white/20">
            <img src={project.background} alt="Background" className="w-full h-48 object-cover" />
          </div>
        )}
        <div className="flex items-center gap-4">
          <input type="file" ref={bgInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleBackgroundChange} />
          <button
            onClick={() => bgInputRef.current?.click()}
            disabled={backgroundLoading}
            className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition"
          >
            {backgroundLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload / Replace'}
          </button>
          {project.background && (
            <button
              onClick={() => onBackgroundUpload(new File([], ''))} // placeholder to trigger removal on backend if needed
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Avatar Section */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
          {project.owner.avatar ? (
            <img src={project.owner.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-xl">{project.owner.firstname?.[0] || '?'}</span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Owner Avatar</h3>
          <input type="file" ref={avatarInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} />
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarLoading}
            className="px-3 py-1 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition"
          >
            {avatarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload / Replace'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
