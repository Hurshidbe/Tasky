"use client";

import React, { useEffect, useState, useRef } from "react";
import * as Icons from "lucide-react";
import { 
  Layout, Plus, Folder, User as UserIcon, Loader2, Calendar, Search, X, 
  Camera, Save, LogOut, Briefcase, Info, ChevronLeft, ChevronDown, Mail
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// 100 Diverse Icons for Projects
const PROJECT_ICONS = [
  "Code", "Cpu", "Terminal", "Database", "Cloud", "Globe", "Smartphone", "Laptop", "Zap", "Activity",
  "Briefcase", "BarChart", "PieChart", "TrendingUp", "DollarSign", "Wallet", "CreditCard", "ShoppingBag", "Target", "Rocket",
  "Palette", "Music", "Camera", "Video", "PenTool", "Type", "Image", "Layers", "Framer", "Component",
  "Sun", "Moon", "Heart", "Star", "Coffee", "Beer", "Pizza", "Utensils", "GlassWater", "Settings",
  "Wrench", "Hammer", "Key", "Lock", "Bell", "Flag", "Map", "Compass", "Anchor", "MessageSquare",
  "Users", "User", "Share2", "Send", "Phone", "AtSign", "Hash", "Plane", "Car", "Bike",
  "Train", "Truck", "Ship", "Navigation", "MapPin", "CheckCircle", "Shield", "HardDrive", "Server", "Wifi",
  "Bluetooth", "Cast", "Airplay", "Headphones", "Speaker", "Mic", "Book", "BookOpen", "GraduationCap", "Library",
  "Lightbulb", "Brain", "Pen", "Eraser", "Scissors", "Trash2", "Archive", "FileText", "FileCode", "FolderOpen",
  "Clipboard", "List", "Check", "Filter", "Infinity"
];

interface User {
  _id: string;
  firstname: string;
  lastname?: string;
  username?: string;
  email: string;
  avatar?: string;
  profession?: string;
  about?: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  project_icon?: string;
  owner: User|string;
  collaborators?: User[];
  collobrators?: User[];
  createdAt: string;
}

type FilterType = "all" | "own" | "shared";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileClosing, setIsProfileClosing] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", project_icon: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    profession: "",
    about: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {
        console.error("Token decoding error", e);
      }
    }
    fetchProjects();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/profile");
      const data = res.data;
      setUserProfile(data);
      setProfileForm({
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        username: data.username || "",
        profession: data.profession || "",
        about: data.about || ""
      });
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  const fetchProjects = async () => {
  try {
    setLoading(true);

    const res = await api.get("/projects");

    const projectsData = Array.isArray(res.data)
      ? res.data
      : res.data?.data || [];

    setProjects(projectsData);

  } catch (err: any) {
    console.error("Project fetch error:", err);

    if (err.response?.status === 401) {
      router.push("/login");
    }
  } finally {
    setLoading(false);
  }
};

  const handleCreateProject = async (e: React.FormEvent) => {
  e.preventDefault();

  setCreateLoading(true);

  try {
    const res = await api.post("/projects", newProject);

    const createdProject =
      res.data?.data || res.data;

    setProjects(prev => [
      createdProject,
      ...prev
    ]);

    setIsModalOpen(false);

    setNewProject({
      name: "",
      description: "",
      project_icon: ""
    });

    setShowIconPicker(false);

  } catch (err: any) {
    alert(
      err.response?.data?.message ||
      "Project yaratishda xatolik"
    );
  } finally {
    setCreateLoading(false);
  }
};

  const closeProfile = () => {
    setIsProfileClosing(true);
    setTimeout(() => {
      setIsProfileOpen(false);
      setIsProfileClosing(false);
    }, 450); // Animation duration
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.patch("/profile", profileForm);
      setUserProfile(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append("photo", file);
    setUpdating(true);
    try {
      const res = await api.patch("/profile/update-avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUserProfile({ ...userProfile!, avatar: res.data.avatar });
    } catch (err) {
      alert("Avatar upload error");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

    const filteredProjects = projects.filter((project) => {
        const ownerId = typeof project.owner === 'object' ? project.owner?._id?.toString() : String(project.owner);
        const matchesFilter = 
          filter === "all" ||
          (filter === "own" && ownerId === currentUserId) ||
          (filter === "shared" && ownerId !== currentUserId);
        const matchesSearch = 
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

  // Helper to render dynamic icon
  const renderIcon = (iconName?: string, className?: string) => {
    const IconComponent = (Icons as any)[iconName || "Folder"] || Icons.Folder;
    return <IconComponent className={className} />;
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-slate-50 relative overflow-hidden flex flex-col">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-float-slow" />

      <nav className="border-b border-white/5 bg-black/10 backdrop-blur-md sticky top-0 z-40 py-2">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Layout className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Tasky</span>
          </div>

          <div className="flex items-center">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all active:scale-90 shadow-xl"
            >
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className={`container mx-auto px-6 py-12 transition-all duration-500 relative z-10 flex-grow ${isProfileOpen || isModalOpen ? 'blur-xl scale-[0.98] opacity-50' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Projects</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="bg-white/5 border border-white/10 pl-10 pr-9 h-11 rounded-xl w-60 outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/[0.08] transition-all font-medium text-sm text-slate-200 placeholder:text-slate-600"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-3 h-3 text-slate-500" />
                </button>
              )}
            </div>

             <div className="bg-white/5 border border-white/10 p-1 h-11 rounded-xl flex items-center shadow-inner">
              {(["all", "own", "shared"] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 h-full rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                    filter === type 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-100" 
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/95 text-white px-5 h-11 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-102 transition-all active:scale-[0.98] text-xs uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/5 animate-pulse rounded-[40px] border border-white/5" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project._id} href={`/board/${project._id}`} className="bg-[#0f172a]/20 backdrop-blur-md hover:bg-[#0f172a]/40 p-6 rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-300 group relative overflow-hidden flex flex-col h-full min-h-[220px] hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                <div className="absolute top-6 right-6 flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  {formatDate(project.createdAt)}
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {renderIcon(project.project_icon, "w-6 h-6 text-primary")}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-1.5 tracking-tight group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
                    {project.description || "No description provided."}
                  </p>
                </div>
                <div className="mt-6 flex justify-between items-center gap-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    {(project.collobrators?.length ? project.collobrators : (project.collaborators || [])).slice(0, 3).map((col) => {
                      if (!col) return null;
                      const isObj = typeof col === 'object';
                      const avatar = isObj ? col.avatar : undefined;
                      const firstname = isObj ? col.firstname : '';
                      const initial = firstname ? firstname[0] : '?';
                      const id = isObj ? col._id : String(col);
                      return (
                        <div key={id} className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden border border-white/5">
                          {avatar ? <img src={avatar} alt={firstname || "User"} className="h-full w-full object-cover" /> : <span className="text-[10px] font-bold">{initial}</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white/5 border border-white/5 px-3 py-1 rounded-xl">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Project Owner</p>
                    <p className="text-[10px] font-bold text-slate-200">{typeof project.owner === 'object' && project.owner._id === currentUserId ? "You" : (typeof project.owner === 'object' ? project.owner.firstname : "Owner")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/5 rounded-[48px] border-2 border-dashed border-white/10 cursor-pointer hover:bg-white/[0.08] transition-colors" onClick={() => setIsModalOpen(true)}>
            <Folder className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-200">{searchQuery ? `No results for "${searchQuery}"` : `No ${filter !== "all" ? filter : ""} projects found`}</h2>
          </div>
        )}
      </main>

      {/* Minimal Project Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-slate-900 w-full max-w-sm p-8 rounded-[40px] shadow-2xl relative border border-white/10 animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all group">
              <X className="w-4 h-4 text-slate-500 group-hover:rotate-90 transition-transform" />
            </button>
            
            <form onSubmit={handleCreateProject} className="space-y-6 flex flex-col items-center mt-2">
              {/* Smart Icon Selector */}
              <div className="relative flex flex-col items-center gap-4 w-full">
                <button 
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all border-2 ${
                    newProject.project_icon 
                      ? "bg-primary/20 border-primary/40 text-primary" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-primary/50"
                  }`}
                >
                  {newProject.project_icon ? (
                    renderIcon(newProject.project_icon, "w-8 h-8")
                  ) : (
                    <div className="flex flex-col items-center">
                      <Plus className="w-5 h-5 mb-0.5" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Set Icon</span>
                    </div>
                  )}
                </button>

                 {showIconPicker && (
                  <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[280px] bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-4 shadow-2xl z-10 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-7 gap-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                      {PROJECT_ICONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            setNewProject({ ...newProject, project_icon: iconName });
                            setShowIconPicker(false);
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-primary/20 ${
                            newProject.project_icon === iconName 
                              ? "bg-primary text-white" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {renderIcon(iconName, "w-4 h-4")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

               <div className="w-full space-y-3">
                <input
                  type="text" required value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-center placeholder:text-slate-600"
                  placeholder="Project Name"
                />
                <input
                  type="text" value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-6 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-400 text-xs text-center placeholder:text-slate-700"
                  placeholder="Short description (optional)"
                />
              </div>

              <button type="submit" disabled={createLoading} className="w-full bg-primary text-white font-black py-4 rounded-[22px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-70 text-sm uppercase tracking-widest mt-2">
                {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Liquid Modal - iPhone App Style Animation */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-500 ${isProfileClosing ? 'opacity-0' : 'opacity-100'}`} onClick={closeProfile} />
          
          <div className={`bg-[#0f172a]/95 backdrop-blur-3xl w-full max-w-[420px] rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/10 p-7 relative z-10 
            flex flex-col max-h-[90vh] overflow-hidden ${isProfileClosing ? 'iphone-modal-animation-exit' : 'iphone-modal-animation'}`}>
            <button onClick={closeProfile} className="absolute top-5 right-5 p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-all group">
              <X className="w-4 h-4 text-slate-500 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="overflow-y-auto no-scrollbar">
              <div className="flex flex-col items-center mb-5">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/5 shadow-2xl bg-slate-900 flex items-center justify-center transition-transform group-hover:scale-[1.02] duration-500 ring-2 ring-primary/5">
                    {userProfile?.avatar ? (
                       <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-slate-800" />
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-[-2px] right-[-2px] bg-primary text-white p-1.5 rounded-lg shadow-2xl hover:scale-110 transition-all cursor-pointer border-2 border-[#0f172a]"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                </div>
                <h2 className="text-lg font-black mt-4 tracking-tight text-white">{userProfile?.firstname} {userProfile?.lastname}</h2>
                <p className="text-primary font-bold text-xs mt-0.5">@{userProfile?.username}</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative group opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input type="email" value={userProfile?.email || ""} readOnly className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 outline-none font-bold text-slate-400 text-xs cursor-not-allowed" placeholder="Email" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">@</span>
                    <input type="text" value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-xs placeholder:text-slate-600" placeholder="Username" />
                  </div>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input type="text" value={profileForm.firstname} onChange={(e) => setProfileForm({ ...profileForm, firstname: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-xs placeholder:text-slate-600" placeholder="First Name" />
                  </div>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input type="text" value={profileForm.lastname} onChange={(e) => setProfileForm({ ...profileForm, lastname: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-xs placeholder:text-slate-600" placeholder="Last Name" />
                  </div>
                </div>

                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="text" value={profileForm.profession} onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-xs placeholder:text-slate-600" placeholder="Profession" />
                </div>

                <div className="relative">
                  <Info className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <textarea value={profileForm.about} onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-slate-200 text-xs resize-none placeholder:text-slate-600" placeholder="About you..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={updating} className="flex-1 bg-primary text-white font-black py-2.5 rounded-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-70 text-xs uppercase tracking-widest cursor-pointer">
                    {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                  <button type="button" onClick={handleLogout} className="px-5 bg-red-500/10 text-red-500 font-black py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
        
        .iphone-modal-animation {
          transform-origin: top right;
          animation: iphoneExpand 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .iphone-modal-animation-exit {
          transform-origin: top right;
          animation: iphoneCollapse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-float-slow {
          animation: floatSlow 15s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: floatReverse 20s ease-in-out infinite;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.15); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translate(0, 0) scale(1.15); }
          33% { transform: translate(-40px, 30px) scale(0.85); }
          66% { transform: translate(25px, -30px) scale(1.05); }
        }

        @keyframes iphoneExpand {
          0% {
            transform: scale(0) translate(20%, -20%);
            opacity: 0;
            filter: blur(10px);
          }
          100% {
            transform: scale(1) translate(0, 0);
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes iphoneCollapse {
          0% {
            transform: scale(1) translate(0, 0);
            opacity: 1;
            filter: blur(0);
          }
          100% {
            transform: scale(0) translate(20%, -20%);
            opacity: 0;
            filter: blur(10px);
          }
        }
      `}} />
    </div>
  );
}
