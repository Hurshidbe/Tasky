'use client';

import { create } from 'zustand';
import { Card, Task, ProjectData, ActivityEvent } from '@/types/board';

interface BoardStore {
  cards: Card[];
  tasks: Task[];
  project: ProjectData | null;
  activities: ActivityEvent[];
  loading: boolean;
  error: string | null;

  setBoard: (cards: Card[], tasks: Task[], project: ProjectData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  moveTask: (taskId: string, sourceCardId: string, destinationCardId: string, newOrder: number) => void;
  moveCard: (cardId: string, newOrder: number) => void;

  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;

  addCard: (card: Card) => void;
  deleteCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;

  addActivity: (activity: ActivityEvent) => void;
  setActivities: (activities: ActivityEvent[]) => void;

  reset: () => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  cards: [],
  tasks: [],
  project: null,
  activities: [],
  loading: true,
  error: null,

  setBoard: (cards, tasks, project) => set({ cards, tasks, project, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  moveTask: (taskId, sourceCardId, destinationCardId, newOrder) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task._id === taskId
          ? { ...task, cardId: destinationCardId, order: String(newOrder) }
          : task.cardId === destinationCardId && parseFloat(task.order || '0') >= newOrder
          ? { ...task, order: String(parseFloat(task.order || '0') + 1) }
          : task
      ),
    })),

  moveCard: (cardId, newOrder) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card._id === cardId
          ? { ...card, order: newOrder }
          : card.order >= newOrder && card._id !== cardId
          ? { ...card, order: card.order + 1 }
          : card
      ),
    })),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  deleteTask: (taskId) => set((state) => ({ tasks: state.tasks.filter((t) => t._id !== taskId) })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task._id === taskId ? { ...task, ...updates } : task)),
    })),

  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
  deleteCard: (cardId) => set((state) => ({ cards: state.cards.filter((c) => c._id !== cardId) })),
  updateCard: (cardId, updates) =>
    set((state) => ({
      cards: state.cards.map((card) => (card._id === cardId ? { ...card, ...updates } : card)),
    })),

  addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities] })),
  setActivities: (activities) => set({ activities }),

  reset: () =>
    set({ cards: [], tasks: [], project: null, activities: [], loading: true, error: null }),
}));
