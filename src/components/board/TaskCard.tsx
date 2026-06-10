'use client';

import React, { forwardRef, memo } from 'react';
import { Trash2, GripVertical, Lock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/board';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  isOwner: boolean;
  isOverlay?: boolean;
  currentUserId?: string | null;
}



const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ task, onDelete, onEdit, isOwner, isOverlay = false, currentUserId }, ref) => {
  const assignedUserId = task.assignedTo?._id;
  const canDrag = isOwner || !assignedUserId || assignedUserId === currentUserId;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task._id,
    disabled: !canDrag
  });

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: 'var(--card-padding)',
  };

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      style={combinedStyle}
      layoutId={task._id}
      layout={!isDragging && !isOverlay ? true : false}
      transition={{
        type: "spring",
        stiffness: 90,   // Premium smooth float
        damping: 18,     // Fluid motion
        mass: 1.2        // Weighty inertia for flight feel
      }}
      {...attributes}
      className="bg-[#1e293b]/40 backdrop-blur-sm rounded-xl border border-white/5 hover:border-primary/30 transition-all group relative shadow-sm hover:shadow-md"
    >
      <div className="flex items-start" style={{ gap: 'calc(8px * var(--board-zoom))' }}>
        <div
          {...listeners}
          style={{ padding: 'calc(4px * var(--board-zoom))', marginTop: 'calc(2px * var(--board-zoom))' }}
          className={`rounded transition-colors ${
            canDrag 
              ? 'text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing' 
              : 'text-slate-700 cursor-not-allowed'
          }`}
          title={canDrag ? "Drag to reorder" : "Faqat biriktirilgan xodim ushbu vazifani sura oladi"}
        >
          {canDrag ? (
            <GripVertical style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} />
          ) : (
            <Lock style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} className="opacity-50" />
          )}
        </div>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => isOwner && onEdit(task)}>
          <p 
            style={{ fontSize: 'var(--font-title)' }}
            className="font-semibold text-slate-200 line-clamp-2 leading-tight"
          >
            {task.name}
          </p>
          
          {task.description && (
            <p 
              style={{ fontSize: 'var(--font-desc)', marginTop: 'calc(4px * var(--board-zoom))' }}
              className="text-slate-500 break-words whitespace-pre-wrap"
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center flex-wrap" style={{ marginTop: 'calc(8px * var(--board-zoom))', gap: 'calc(8px * var(--board-zoom))' }}>
            {task.assignedTo && (
              <div className="flex items-center" style={{ gap: 'calc(6px * var(--board-zoom))' }}>
                {!isOverlay && (
                  <div 
                    style={{ width: 'var(--avatar-size)', height: 'var(--avatar-size)' }}
                    className="rounded-full overflow-hidden bg-slate-800 border border-white/5 shrink-0"
                  >
                    {task.assignedTo.avatar ? (
                      <img src={task.assignedTo.avatar} alt={task.assignedTo.firstname} className="w-full h-full object-cover" />
                    ) : (
                      <span 
                        style={{ fontSize: 'calc(9px * var(--board-zoom))' }}
                        className="font-bold text-slate-400 flex items-center justify-center h-full"
                      >
                        {task.assignedTo.firstname?.[0] || '?'}
                      </span>
                    )}
                  </div>
                )}
                <span 
                  style={{ fontSize: 'var(--font-meta)' }}
                  className="text-slate-500 font-medium"
                >
                  {task.assignedTo.firstname}
                </span>
              </div>
            )}
          </div>
        </div>

        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            style={{ padding: 'calc(6px * var(--board-zoom))' }}
            className="opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 rounded-lg transition-all cursor-pointer"
          >
            <Trash2 style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} />
          </button>
        )}
      </div>
    </motion.div>
  );
});

TaskCard.displayName = 'TaskCard';

export default memo(TaskCard);