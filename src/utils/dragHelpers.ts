import { Card, Task } from '@/types/board';

export const reorderArray = <T extends { order: string | number }>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  return result.map((item, index) => ({ ...item, order: index }));
};

export const findCardByTaskId = (cards: Card[], taskId: string) => {
  return cards.find((card) => card.tasks?.some((task) => task._id === taskId));
};

export const findTaskById = (tasks: Task[], taskId: string) => {
  return tasks.find((task) => task._id === taskId);
};

export const getTasksByCardId = (tasks: Task[], cardId: string) => {
  return tasks.filter((task) => task.cardId === cardId).sort((a, b) => (a.order || '').localeCompare(b.order || ''));
};

export const calculateTaskStats = (tasks: Task[], cards: Card[]) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const inProgress = cards.find((c) => c.title.toLowerCase().includes('progress'))?.tasks?.length || 0;
  const todo = cards.find((c) => c.title.toLowerCase().includes('todo'))?.tasks?.length || 0;

  return { total, completed, inProgress, todo };
};

export const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'medium':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export const getPriorityLabel = (priority?: string) => {
  return (priority || 'medium').charAt(0).toUpperCase() + (priority || 'medium').slice(1);
};
