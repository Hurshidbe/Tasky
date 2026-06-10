"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Camera, Save, Loader2, LogOut, ChevronLeft, Briefcase, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    profession: "",
    about: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      const data = res.data;
      setUser(data);
      setFormData({
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        username: data.username || "",
        profession: data.profession || "",
        about: data.about || ""
      });
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.patch("/profile", formData);
      setUser(res.data);
      // Optional: show a small success indication instead of alert
    } catch (err: any) {
      alert(err.response?.data?.message || "Xatolik yuz berdi");
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
      setUser({ ...user, avatar: res.data.avatar });
    } catch (err) {
      alert("Avatar yuklashda xatolik");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden bg-slate-950 text-slate-50">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="max-w-3xl mx-auto z-10 relative">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-200 transition-all font-bold group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            Back
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-5 py-2.5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[48px] p-8 md:p-14 shadow-2xl border border-white/10">
          <div className="flex flex-col items-center mb-14">
            <div className="relative group">
              <div className="w-44 h-44 rounded-[44px] overflow-hidden border-4 border-white/5 shadow-2xl bg-slate-900 flex items-center justify-center transition-transform group-hover:scale-[1.02] duration-500 ring-8 ring-primary/5">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-20 h-20 text-slate-800" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-[-5px] right-[-5px] bg-primary text-white p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all cursor-pointer border-4 border-slate-950"
              >
                <Camera className="w-6 h-6" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <h1 className="text-4xl font-black mt-10 tracking-tight text-white">{user?.firstname} {user?.lastname}</h1>
            <p className="text-primary font-bold mt-2 text-lg">@{user?.username}</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-bold text-slate-200 placeholder:text-slate-600"
                  placeholder="Ism"
                />
              </div>
              
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-bold text-slate-200 placeholder:text-slate-600"
                  placeholder="Familiya"
                />
              </div>

              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-lg">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-bold text-slate-200 placeholder:text-slate-600"
                  placeholder="Username"
                />
              </div>

              <div className="relative">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-bold text-slate-200 placeholder:text-slate-600"
                  placeholder="Kasb / Lavozim"
                />
              </div>
            </div>

            <div className="relative">
              <Info className="absolute left-5 top-6 w-5 h-5 text-slate-600" />
              <textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-[32px] py-5 pl-14 pr-5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-bold text-slate-200 resize-none placeholder:text-slate-600"
                placeholder="O'zingiz haqingizda..."
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-primary text-white font-black py-5 rounded-[28px] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-70 text-xl"
              >
                {updating ? <Loader2 className="w-7 h-7 animate-spin" /> : <Save className="w-7 h-7" />}
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
