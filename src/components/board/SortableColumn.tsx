'use client';

import React, { useState, useCallback, memo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, Task } from '@/types/board';
import TaskCard from './TaskCard';

interface SortableColumnProps {
  card: Card;
  tasks: Task[];
  onAddTask: (cardId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteColumn: (cardId: string) => void;
  isOwner: boolean;
  isDraggingAnyTask?: boolean;
  isOver?: boolean;
  currentUserId?: string | null;
}

const getColumnColor = (title: string) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'];
  const index = title.charCodeAt(0) % colors.length;
  return colors[index];
};

const SortableColumn: React.FC<SortableColumnProps> = ({
  card,
  tasks,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onDeleteColumn,
  isOwner,
  isDraggingAnyTask = false,
  isOver = false,
  currentUserId,
}) => {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id: `col-drop-${card._id}` });
  const [isHovered, setIsHovered] = useState(false);

  // Ensure tasks are unique by _id to avoid duplicate React keys
  const uniqueTasks = Array.from(new Map(tasks.map(t => [t._id, t])).values());
  const taskIds = uniqueTasks.map(t => t._id);
  const columnColor = getColumnColor(card.title);

  const handleAddTask = useCallback(() => {
    onAddTask(card._id);
  }, [card._id, onAddTask]);

  return (
    <div
      style={{ width: 'var(--col-width)' }}
      className="shrink-0 max-h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={setDroppableNodeRef}
        className={`flex flex-col max-h-full rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 ease-out relative overflow-hidden
          ${isOver 
            ? 'border-[#0088ff] shadow-[0_0_20px_rgba(0,136,255,0.35),inset_0_0_15px_rgba(0,136,255,0.08)] bg-[#0c1524]/60 scale-[1.01]' 
            : 'bg-slate-950/20 border-white/10 hover:border-white/20 shadow-md shadow-black/10 hover:bg-slate-950/30'
          }`}
      >
        {/* Subtle inner radial neon light pulse overlay */}
        {isOver && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_65%,rgba(0,136,255,0.18)_0%,transparent_65%)] pointer-events-none rounded-2xl" />
        )}
        <div 
          style={{ padding: 'calc(8px * var(--board-zoom)) calc(12px * var(--board-zoom))' }}
          className="flex justify-between items-center border-b border-white/5"
        >
          <div className="flex items-center" style={{ gap: 'calc(10px * var(--board-zoom))' }}>
            <div 
              className="rounded-full shadow-[0_0_8px_currentColor]" 
              style={{ width: 'calc(8px * var(--board-zoom))', height: 'calc(8px * var(--board-zoom))', backgroundColor: columnColor, color: columnColor }} 
            />
            <h3 
              style={{ fontSize: 'var(--font-meta)' }}
              className="font-bold uppercase tracking-wider text-slate-200"
            >
              {card.title}
            </h3>
            <span 
              style={{ fontSize: 'calc(9px * var(--board-zoom))', padding: 'calc(2px * var(--board-zoom)) calc(6px * var(--board-zoom))' }}
              className="bg-white/5 rounded-md font-bold text-slate-500 border border-white/5"
            >
              {uniqueTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
            {isOwner && (
              <>
                <button
                  onClick={handleAddTask}
                  style={{ padding: 'calc(6px * var(--board-zoom))' }}
                  className="hover:bg-white/5 rounded-lg text-slate-500 hover:text-primary transition-all cursor-pointer"
                  title="Add task"
                >
                  <Plus style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} />
                </button>
                <button
                  onClick={() => onDeleteColumn(card._id)}
                  style={{ padding: 'calc(6px * var(--board-zoom))' }}
                  className="hover:bg-white/5 rounded-lg text-slate-500 hover:text-destructive transition-all cursor-pointer"
                  title="Delete column"
                >
                  <Trash2 style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} />
                </button>
              </>
            )}
          </div>
        </div>

        <div 
          className="flex-1 overflow-y-auto min-h-[100px] flex flex-col"
          style={{ padding: 'calc(6px * var(--board-zoom)) calc(10px * var(--board-zoom))', gap: 'calc(6px * var(--board-zoom))' }}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {uniqueTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                isOwner={isOwner}
                currentUserId={currentUserId}
              />
            ))}
          </SortableContext>
        </div>

        {isOwner && (
          <button
            onClick={handleAddTask}
            style={{ 
              margin: '0 calc(12px * var(--board-zoom)) calc(12px * var(--board-zoom)) calc(12px * var(--board-zoom))',
              padding: 'calc(8px * var(--board-zoom)) 0', 
              fontSize: 'var(--font-meta)' 
            }}
            className="border border-dashed border-white/5 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all font-semibold cursor-pointer"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(SortableColumn);