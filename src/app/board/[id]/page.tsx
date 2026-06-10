"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import * as Icons from "lucide-react";
import { Loader2, AlertCircle, Plus, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, Task, ProjectData, UserProfile, ActivityEvent } from "@/types/board";
import BoardHeader from "@/components/board/BoardHeader";
import Sidebar from "@/components/board/Sidebar";
import KanbanBoard from "@/components/board/KanbanBoard";
import ActivityPanel from "@/components/board/ActivityPanel";
import InviteDialog from "@/components/board/InviteDialog";
import EditTaskDialog from "@/components/board/EditTaskDialog";
import AddTaskDialog from "@/components/board/AddTaskDialog";
import { toast } from 'react-hot-toast';
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

const renderIcon = (iconName?: string, className?: string) => {
  const IconComponent = (Icons as any)[iconName || "Folder"] || Icons.Folder;
  return <IconComponent className={className} />;
};

const isLucideIcon = (iconName: string) => {
  return iconName in Icons;
};

const formatJoinDate = (dateString?: string) => {
  if (!dateString) return 'Qo‘shilgan: --/--/----';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `Qo‘shilgan: ${day}/${month}/${year}`;
  } catch (e) {
    return 'Qo‘shilgan: --/--/----';
  }
};

export default function BoardPage() {
  const { id: projectId } = useParams();
  const router = useRouter();

  const [cards, setCards] = useState<Card[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [loadedBackground, setLoadedBackground] = useState<string | null>(null);

  useEffect(() => {
    if (project?.background) {
      const img = new Image();
      img.src = project.background;
      img.onload = () => {
        setLoadedBackground(project.background || null);
      };
    } else {
      setLoadedBackground(null);
    }
  }, [project?.background]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  const [activeTab, setActiveTab] = useState<'board' | 'activity' | 'collaborators' | 'settings'>('board');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projIcon, setProjIcon] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
      setProjName(project.name || "");
      setProjDesc(project.description || "");
      setProjIcon(project.project_icon || "");
    }
  }, [project]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [activeCardIdForNewTask, setActiveCardIdForNewTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const previousStateRef = useRef<{ cards: Card[]; tasks: Task[] } | null>(null);
  const movingRef = useRef<boolean>(false);

  const isOwner = project?.owner?._id?.toString() === currentUserId;

  const fetchBoard = useCallback((s: Socket) => {
    s.emit("getBoard", { projectId }, (res: any) => {
      if (res.success) {
        const { cards, tasks, project, activities: fetchedActivities } = res.data;
        const sortedCards = cards.sort((a: Card, b: Card) => a.order - b.order);
        const sortedTasks = tasks.sort((a: Task, b: Task) => (a.order || '').localeCompare(b.order || ''));

        setCards(sortedCards);
        setTasks(sortedTasks);
        setProject(project);
        setError(null);

        if (fetchedActivities) {
          setActivities(fetchedActivities.sort((a: ActivityEvent, b: ActivityEvent) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        }
      } else {
        setError(res.error || "Failed to load board data");
      }
      setLoading(false);
    });
  }, [projectId]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.userId);
    } catch (e) {
      console.error("Token decode error", e);
    }

    const projId = typeof projectId === "string" ? projectId : Array.isArray(projectId) ? projectId[0] : "";

    const newSocket = io("http://localhost:3000", { auth: { token } });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinProject", { projectId: projId });
      fetchBoard(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      setError("Connection error: " + err.message);
      setLoading(false);
    });

    newSocket.on("cardCreated", () => fetchBoard(newSocket));
    newSocket.on("cardUpdated", () => fetchBoard(newSocket));
    newSocket.on("cardRemoved", () => fetchBoard(newSocket));
    newSocket.on("taskCreated", () => fetchBoard(newSocket));
    newSocket.on("taskUpdated", (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      fetchBoard(newSocket);
    });
    newSocket.on("taskRemoved", () => fetchBoard(newSocket));
    newSocket.on("taskMoved", (data: {
      fromColumnId: string;
      toColumnId: string;
      updatedSourceColumnTasks: Task[];
      updatedTargetColumnTasks: Task[];
    }) => {
      setTasks(prev => {
        const otherTasks = prev.filter(t => t.cardId !== data.fromColumnId && t.cardId !== data.toColumnId);
        return [...otherTasks, ...(data.updatedSourceColumnTasks || []), ...(data.updatedTargetColumnTasks || [])];
      });
    });
    newSocket.on("cardReordered", () => fetchBoard(newSocket));

    newSocket.on("activitiesUpdated", (data: { activities: ActivityEvent[] }) => {
      setActivities(data.activities.sort((a: ActivityEvent, b: ActivityEvent) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("cardCreated");
      newSocket.off("cardUpdated");
      newSocket.off("cardRemoved");
      newSocket.off("taskCreated");
      newSocket.off("taskUpdated");
      newSocket.off("taskRemoved");
      newSocket.off("taskMoved");
      newSocket.off("cardReordered");
      newSocket.off("activitiesUpdated");
      newSocket.disconnect();
    };
  }, [projectId, router, fetchBoard]);

  const handleAddColumn = () => {
    const title = prompt("Enter column name:");
    if (title && socket) {
      previousStateRef.current = { cards: [...cards], tasks: [...tasks] };
      socket.emit("createCard", { projectId, title }, (response: any) => {
        if (!response.success && previousStateRef.current) {
          setCards(previousStateRef.current.cards);
          setTasks(previousStateRef.current.tasks);
        }
      });
    }
  };

  const handleDeleteColumn = (cardId: string) => {
    if (confirm("Are you sure you want to delete this column?") && socket) {
      previousStateRef.current = { cards: [...cards], tasks: [...tasks] };
      socket.emit("removeCard", { id: cardId }, (response: any) => {
        if (!response.success && previousStateRef.current) {
          setCards(previousStateRef.current.cards);
          setTasks(previousStateRef.current.tasks);
        }
      });
    }
  };

  const handleAddTask = (cardId: string) => {
    setActiveCardIdForNewTask(cardId);
    setIsAddTaskDialogOpen(true);
  };

  const handleSaveNewTask = async (name: string, description: string, assignedTo?: string | null) => {
    if (socket && activeCardIdForNewTask) {
      previousStateRef.current = { cards: [...cards], tasks: [...tasks] };
      socket.emit("createTask", { projectId, cardId: activeCardIdForNewTask, name, description, assignedTo }, (response: any) => {
        if (!response.success && previousStateRef.current) {
          setCards(previousStateRef.current.cards);
          setTasks(previousStateRef.current.tasks);
        }
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?") && socket) {
      previousStateRef.current = { cards: [...cards], tasks: [...tasks] };
      socket.emit("removeTask", { id: taskId }, (response: any) => {
        if (!response.success && previousStateRef.current) {
          setCards(previousStateRef.current.cards);
          setTasks(previousStateRef.current.tasks);
        }
      });
    }
  };

  const handleRemoveCollaborator = (collaboratorId: string, collaboratorName: string) => {
    if (confirm(`Haqiqatan ham ${collaboratorName}ni loyihadan o‘chirmoqchimisiz?`) && socket) {
      socket.emit("removeCollaborator", { projectId, collaboratorId }, (response: any) => {
        if (response && (response.success || !response.error)) {
          toast.success("Hamkor loyihadan muvaffaqiyatli o‘chirildi");
          fetchBoard(socket);
        } else {
          toast.error(response?.error || "Hamkorni o‘chirishda xatolik yuz berdi");
        }
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleSaveTask = async (taskId: string, updates: any) => {
    if (socket) {
      socket.emit("updateTask", { id: taskId, ...updates });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...updates } : t));
    }
  };

  const handleMoveTask = useCallback(
    (
      taskId: string,
      fromCardId: string,
      toCardId: string,
      oldOrder: number,
      newOrder: number
    ) => {

      // Bir joyga tashlangan bo'lsa qaytish
      if (
        fromCardId === toCardId &&
        oldOrder === newOrder
      ) {
        return;
      }

      // Parallel move larni bloklash
      if (movingRef.current) return;

      movingRef.current = true;

      previousStateRef.current = {
        cards: [...cards],
        tasks: [...tasks]
      };

      setTasks(prev => {
        const task = prev.find(t => t._id === taskId);
        if (!task) return prev;

        const otherTasks = prev.filter(t => t.cardId !== fromCardId && t.cardId !== toCardId);

        const srcTasks = prev
          .filter(t => t.cardId === fromCardId && t._id !== taskId)
          .sort((a, b) => (a.order || '').localeCompare(b.order || ''));

        const destTasks = prev
          .filter(t => t.cardId === toCardId && t._id !== taskId)
          .sort((a, b) => (a.order || '').localeCompare(b.order || ''));

        const updatedTask = { ...task, cardId: toCardId };
        // Splice at target index
        destTasks.splice(newOrder, 0, updatedTask);

        // Assign clean temporary visual ordering keys
        srcTasks.forEach((t, idx) => { t.order = `temp-${idx}`; });
        destTasks.forEach((t, idx) => { t.order = `temp-${idx}`; });

        return [...otherTasks, ...srcTasks, ...destTasks];
      });

      // backend update
      if (socket) {

        console.log("Moving task", {
          taskId,
          fromCardId,
          toCardId,
          oldOrder,
          newOrder
        });

        socket.emit(
          "moveTask",
          {
            taskId,
            fromColumnId: fromCardId,
            toColumnId: toCardId,
            newIndex: newOrder
          },

          (response: any) => {

            console.log(
              "moveTask response",
              response
            );

            movingRef.current = false;

            if (
              !response?.success &&
              previousStateRef.current
            ) {

              setCards(
                previousStateRef.current.cards
              );

              setTasks(
                previousStateRef.current.tasks
              );
            }
          }
        );

      } else {
        movingRef.current = false;
      }

    },
    [cards, tasks, socket]
  );

  const handleReorderTasks = useCallback(
    (cardId: string, reorderedTasks: Task[]) => {

      previousStateRef.current = {
        cards: [...cards],
        tasks: [...tasks]
      };

      // Optimistic update
      setTasks(prev => {
        const otherTasks = prev.filter(
          t => t.cardId !== cardId
        );

        const updatedTasks = reorderedTasks.map(
          (t, index) => ({
            ...t,
            order: String(index)
          })
        );

        return [
          ...otherTasks,
          ...updatedTasks
        ];
      });

      if (socket && reorderedTasks.length > 1) {

        const oldTasks = tasks
          .filter(t => t.cardId === cardId)
          .sort((a, b) => (a.order || '').localeCompare(b.order || ''));

        // Haqiqatan qaysi task joyi o'zgarganini topish
        const movedTask = reorderedTasks.find(
          (task, index) =>
            task._id !== oldTasks[index]?._id
        );

        if (!movedTask) return;

        const oldIndex = oldTasks.findIndex(
          t => t._id === movedTask._id
        );

        const newIndex = reorderedTasks.findIndex(
          t => t._id === movedTask._id
        );

        if (oldIndex !== newIndex) {

          socket.emit(
            "reorderTasks",
            {
              taskId: movedTask._id,
              cardId,
              oldOrder: oldIndex,
              newOrder: newIndex
            },

            (response: any) => {

              if (
                !response?.success &&
                previousStateRef.current
              ) {

                setCards(
                  previousStateRef.current.cards
                );

                setTasks(
                  previousStateRef.current.tasks
                );
              }
            }
          );
        }
      }

    },
    [cards, tasks, socket]
  );


  const handleReorderCards = useCallback(
    (reorderedCards: Card[]) => {

      previousStateRef.current = {
        cards: [...cards],
        tasks: [...tasks]
      };

      const updatedCards = reorderedCards.map(
        (card, index) => ({
          ...card,
          order: index
        })
      );

      setCards(updatedCards);

      if (socket) {

        socket.emit(
          "reorderCards",
          {
            cards: updatedCards.map(card => ({
              cardId: card._id,
              newOrder: card.order
            }))
          },

          (response: any) => {

            if (
              !response?.success &&
              previousStateRef.current
            ) {

              setCards(
                previousStateRef.current.cards
              );

              setTasks(
                previousStateRef.current.tasks
              );
            }
          }
        );
      }

    },
    [cards, tasks, socket]
  );

  const handleBackgroundUpload = async (file: File) => {
    if (!projectId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan oshmasligi lozim!");
      return;
    }

    setBackgroundLoading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await api.post(
        `/projects/${projectId}/background`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      if (res.data?.success && res.data?.background) {
        setProject(prev =>
          prev
            ? {
              ...prev,
              background: res.data.background
            }
            : null
        );
        toast.success("Fon rasmi muvaffaqiyatli yuklandi!");

        // Emitting socket event to trigger real-time background refetch for other board users
        if (socket) {
          socket.emit("reorderCards", { projectId, cardIds: [] });
        }
      }

    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Fon rasmini yuklashda xatolik yuz berdi"
      );

    } finally {
      setBackgroundLoading(false);
    }
  };

  const handleInvite = async (emailOrUsername: string, message: string) => {
    try {
      await api.post("/projects/invite-collaborator", { projectId, emailOrUsername, message });
      alert("Invitation sent!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error sending invite");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) {
      alert("Project name cannot be empty");
      return;
    }
    setSettingsLoading(true);
    try {
      const res = await api.patch(`/projects/${projectId}`, {
        name: projName,
        description: projDesc,
        project_icon: projIcon
      });
      if (res.data) {
        setProject(prev => prev ? { ...prev, name: projName, description: projDesc, project_icon: projIcon } : null);
        alert("Settings saved successfully!");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? All columns, tasks, and history will be permanently deleted! This action cannot be undone.")) {
      return;
    }
    const projectNameConfirmation = prompt(`Type "${project?.name}" to confirm deletion:`);
    if (projectNameConfirmation !== project?.name) {
      alert("Project name did not match. Deletion cancelled.");
      return;
    }
    setSettingsLoading(true);
    try {
      await api.delete(`/projects/${projectId}`);
      alert("Project deleted successfully.");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete project");
      setSettingsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-xl font-bold">{error || "Project not found"}</h1>
        <Link href="/dashboard" className="text-primary hover:underline font-bold uppercase tracking-widest text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden text-slate-50 font-sans relative transition-colors duration-300">
      {/* 1. Base gradient background (bottom-most layer) */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-950 via-[#0b0f19] to-black" />

      {/* 2. Realtime Background Image & Tuned Soft Overlay */}
      {loadedBackground && (
        <>
          <div
            className="fixed inset-0 z-0 transition-all duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${loadedBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          />
          {/* Soft Dark Overlay with subtle 1px blur for premium depth */}
          <div className="fixed inset-0 z-0 bg-black/40 backdrop-blur-[1px] transition-all duration-1000" />
        </>
      )}

      <BoardHeader
        project={project}
        isOwner={isOwner}
        onInviteClick={() => setIsInviteDialogOpen(true)}
        onSettingsClick={() => setActiveTab("settings")}
        onBackgroundUpload={handleBackgroundUpload}
        backgroundLoading={backgroundLoading}
        onMenuClick={() => setIsMobileDrawerOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isOwner={isOwner} className="hidden md:flex" />

        {activeTab === "board" && (
          <KanbanBoard
            cards={cards}
            tasks={tasks}
            onAddColumn={handleAddColumn}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onDeleteColumn={handleDeleteColumn}
            onMoveTask={handleMoveTask}
            onReorderTasks={handleReorderTasks}
            onReorderCards={handleReorderCards}
            isOwner={isOwner}
            isEmpty={cards.length === 0}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === "activity" && <ActivityPanel activities={activities} tasks={tasks} cards={cards} collaborators={project.collaborators || []} />}

        {activeTab === "collaborators" && (
          <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
            <div className="max-w-xl w-full bg-slate-900/30 backdrop-blur-xl border border-white/15 rounded-3xl p-7 md:p-8 space-y-6 shadow-2xl shadow-black/40 select-none animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">Team Members</h2>

              <div className="group bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border border-white/10 hover:border-primary/30 rounded-2xl p-4 transition-all duration-500 flex flex-col gap-3 overflow-hidden cursor-default shadow-md shadow-black/10 hover:shadow-[0_8px_32px_rgba(0,136,255,0.12)] relative">
                {/* Initial state: Avatar and Basic Info */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 group-hover:w-12 group-hover:h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center transition-all duration-500 border border-primary/20 group-hover:border-primary/40 shrink-0">
                    {project.owner.avatar ? (
                      <img src={project.owner.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-primary text-sm">{project.owner.firstname?.[0] || '?'}</span>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-100 group-hover:text-white transition-colors leading-tight">
                      {project.owner.firstname} {project.owner.lastname || ""}
                    </p>
                    <p className="text-[11px] text-primary font-bold mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>Project Owner</span>
                      <span className="text-primary/40">•</span>
                      <span className="text-slate-400 group-hover:text-slate-300 transition-colors font-semibold">{formatJoinDate(project.owner.createdAt || project.createdAt)}</span>
                    </p>
                  </div>
                </div>

                {/* Hidden Info: Fades and slides in on hover */}
                <div className="max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-500 ease-out overflow-hidden">
                  <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs text-slate-400 animate-in fade-in slide-in-from-top-2 duration-300">
                    {project.owner.username && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0">Username</span>
                        <span className="text-primary font-bold">@{project.owner.username}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0">Fullname</span>
                      <span className="text-slate-200 group-hover:text-white transition-colors font-semibold">{project.owner.firstname} {project.owner.lastname || ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0">Profession</span>
                      <span className="text-slate-200 group-hover:text-white transition-colors font-semibold">{project.owner.profession || "Senior Project Owner"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0 mt-0.5">Bio</span>
                      <span className="text-slate-100 leading-relaxed font-semibold italic">{project.owner.about || "Loyiha yaratuvchisi va boshqaruvchisi."}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(project.collaborators || []).map((collab: import('@/types/board').UserProfile) => {
                if (!collab) return null;
                const isObj = typeof collab === 'object';
                const avatar = isObj ? collab.avatar : undefined;
                const firstname = isObj ? collab.firstname : '';
                const initial = firstname ? firstname[0] : '?';
                const id = isObj ? collab._id : String(collab);
                return (
                  <div key={id} className="group bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border border-white/10 hover:border-primary/30 rounded-2xl p-4 transition-all duration-500 flex flex-col gap-3 overflow-hidden cursor-default shadow-md shadow-black/10 hover:shadow-[0_8px_32px_rgba(0,136,255,0.12)] relative">
                    {/* Initial state: Avatar and Basic Info */}
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 group-hover:w-12 group-hover:h-12 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center transition-all duration-500 border border-white/5 group-hover:border-primary/30 shrink-0">
                        {avatar ? (
                          <img src={avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-slate-400 group-hover:text-primary transition-colors text-sm">{initial}</span>
                        )}
                      </div>

                    <div>
                      <p className="font-bold text-slate-100 group-hover:text-white transition-colors leading-tight">
                        {collab.firstname} {collab.lastname || ""}
                      </p>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{collab.profession || "Collaborator"}</span>
                        <span className="text-slate-600">•</span>
                        <span>{formatJoinDate(collab.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Hidden Info: Fades and slides in on hover */}
                  <div className="max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-500 ease-out overflow-hidden">
                    <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs text-slate-400 animate-in fade-in slide-in-from-top-2 duration-300">
                      {collab.username && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0">Username</span>
                          <span className="text-primary font-bold">@{collab.username}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0">Fullname</span>
                        <span className="text-slate-200 group-hover:text-white transition-colors font-semibold">{collab.firstname} {collab.lastname || ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0">Profession</span>
                        <span className="text-slate-200 group-hover:text-white transition-colors font-semibold">{collab.profession || "Collaborator"}</span>
                      </div>
                      <div className="flex items-start gap-2 pr-24">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0 mt-0.5">Bio</span>
                        <span className="text-slate-100 leading-relaxed font-semibold italic">{collab.about || "Building cool things on Tasky!"}</span>
                      </div>

                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCollaborator(id, collab.firstname);
                          }}
                          className="absolute bottom-0 right-0 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/35 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-md shadow-red-950/20"
                          title="Remove Collaborator"
                        >
                          <Icons.UserMinus className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}

              {isOwner && (
                <button
                  onClick={() => setIsInviteDialogOpen(true)}
                  className="w-full py-3 bg-primary/90 hover:bg-primary text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-[0_0_20px_rgba(0,136,255,0.4)] border border-primary/30 active:scale-[0.98]"
                >
                  + Invite Member
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && isOwner && (
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div className="max-w-2xl w-full space-y-6">
              <h2 className="text-2xl font-black mb-6">Project Settings</h2>

              {/* General Settings */}
              <form onSubmit={handleSaveSettings} className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/5 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">General</h3>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 font-medium text-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Description</label>
                  <textarea
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 font-medium text-slate-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {settingsLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Appearance Settings */}
              <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/5 p-6 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Appearance</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Icon Picker */}
                  <div className="space-y-4 flex flex-col items-center md:items-start relative">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Project Icon</label>

                    <div className="relative" ref={iconPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="w-24 h-24 rounded-full border-2 border-white/40 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-white/80 hover:bg-white/5 outline-none relative shadow-lg"
                      >
                        {projIcon ? (
                          isLucideIcon(projIcon) ? (
                            renderIcon(projIcon, "w-8 h-8 text-white")
                          ) : (
                            <span className="text-3xl">{projIcon}</span>
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Plus className="w-5 h-5 text-white mb-0.5" />
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">Set Icon</span>
                          </div>
                        )}
                      </button>

                      {showIconPicker && (
                        <div className="absolute top-[105px] left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-80 bg-[#162031]/95 backdrop-blur-xl border border-white/10 rounded-[28px] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-7 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar scrollbar-thin scrollbar-thumb-white/10">
                            {PROJECT_ICONS.map((iconName) => (
                              <button
                                key={iconName}
                                type="button"
                                onClick={async () => {
                                  setProjIcon(iconName);
                                  setShowIconPicker(false);
                                  try {
                                    await api.patch(`/projects/${projectId}`, { project_icon: iconName });
                                    setProject(prev => prev ? { ...prev, project_icon: iconName } : null);
                                  } catch (err: any) {
                                    console.error(err);
                                  }
                                }}
                                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-white/10 cursor-pointer ${projIcon === iconName
                                    ? "bg-primary text-white"
                                    : "text-slate-400 hover:text-slate-200"
                                  }`}
                              >
                                {renderIcon(iconName, "w-4 h-4")}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Background Uploader */}
                  <div className="space-y-4 flex flex-col items-center md:items-start">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Background Image</label>
                    <div className="flex flex-col gap-3 w-full max-w-[240px]">
                      {project.background && (
                        <div className="w-full h-16 rounded-xl overflow-hidden border border-white/10 relative group shadow-lg">
                          <img src={project.background} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Current Background</span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-center md:justify-start">
                        <input
                          type="file"
                          id="settings-bg-upload"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBackgroundUpload(file);
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="settings-bg-upload"
                          className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl py-2.5 px-4 font-bold text-xs uppercase tracking-widest cursor-pointer transition-all disabled:opacity-50 shadow-md"
                        >
                          {backgroundLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Upload Background
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/[0.01] border border-red-500/10 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">Danger Zone</h3>
                    <p className="text-xs text-slate-500 font-medium">Delete this project, all columns, tasks, and historical data. This cannot be undone.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    disabled={settingsLoading}
                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl cursor-pointer transition-all font-bold text-xs uppercase tracking-widest shrink-0 disabled:opacity-50"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <InviteDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onInvite={handleInvite}
        projectName={project.name}
      />

      <EditTaskDialog
        isOpen={isEditTaskDialogOpen}
        onClose={() => {
          setIsEditTaskDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        collaborators={project ? [project.owner, ...(project.collaborators || [])] : []}
      />

      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onClose={() => {
          setIsAddTaskDialogOpen(false);
          setActiveCardIdForNewTask(null);
        }}
        onAdd={handleSaveNewTask}
        collaborators={project ? [project.owner, ...(project.collaborators || [])] : []}
      />

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-white/10 p-4 flex flex-col z-10 animate-slide-in-left shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pl-1 pr-1">
              <span className="text-lg font-black tracking-tight text-white">Menu</span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isOwner={isOwner}
              onCloseMobile={() => setIsMobileDrawerOpen(false)}
              className="flex-1 !border-none !bg-transparent !p-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}