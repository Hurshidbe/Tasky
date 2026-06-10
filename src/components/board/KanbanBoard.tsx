'use client';

import React, { useRef, memo } from 'react';
import { Plus, Minus, MousePointer } from 'lucide-react';
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from '@dnd-kit/core';
// Helper to strip prefixes from column IDs used by sortable and droppable hooks
function extractColumnId(id: string): string {
  // Remove "col-" or "col-drop-" prefixes if present
  return id.replace(/^col(?:-drop)?-/, "");
}
import { Card, Task } from '@/types/board';
import { LayoutGroup } from 'framer-motion';
import SortableColumn from './SortableColumn';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  cards: Card[];
  tasks: Task[];
  onAddColumn: () => void;
  onAddTask: (cardId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteColumn: (cardId: string) => void;
  onMoveTask: (taskId: string, fromCardId: string, toCardId: string, oldOrder: number, newOrder: number) => void;
  onReorderTasks: (cardId: string, reorderedTasks: Task[]) => void;
  onReorderCards: (reorderedCards: Card[]) => void;
  isOwner: boolean;
  isEmpty: boolean;
  currentUserId?: string | null;
}

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) return rectCollisions;
  return closestCorners(args);
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  cards,
  tasks,
  onAddColumn,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onDeleteColumn,
  onMoveTask,
  onReorderTasks,
  onReorderCards,
  isOwner,
  isEmpty,
  currentUserId,
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = React.useState<string | null>(null);
  const previousStateRef = useRef<{ cards: Card[]; tasks: Task[] } | null>(null);
  // Holds the column id that the pointer is currently over (including empty columns)
  const overColumnRef = useRef<string | null>(null);

  const [zoomLevel, setZoomLevel] = React.useState<number>(1.0);
  const mainRef = React.useRef<HTMLDivElement | null>(null);

  // Load zoomLevel from localStorage on mount
  React.useEffect(() => {
    const savedZoom = localStorage.getItem('tasky_board_zoom');
    if (savedZoom) {
      const parsed = parseFloat(savedZoom);
      if (!isNaN(parsed) && parsed >= 0.6 && parsed <= 1.4) {
        setZoomLevel(parsed);
      }
    }
  }, []);

  // Save zoomLevel to localStorage when changed
  const updateZoomLevel = React.useCallback((newZoom: number | ((prev: number) => number)) => {
    setZoomLevel((prev) => {
      const target = typeof newZoom === 'function' ? newZoom(prev) : newZoom;
      const clamped = Math.min(1.4, Math.max(0.6, Math.round(target * 100) / 100));
      localStorage.setItem('tasky_board_zoom', clamped.toString());
      return clamped;
    });
  }, []);

  // Set up wheel event listener for Ctrl + Scroll
  React.useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.05 : -0.05;
        updateZoomLevel(prev => prev + zoomDelta);
      }
    };

    mainEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      mainEl.removeEventListener('wheel', handleWheel);
    };
  }, [updateZoomLevel]);

  const boardStyles = {
    '--board-zoom': zoomLevel,
    '--col-width': `${320 * zoomLevel}px`,
    '--card-padding': `${10 * zoomLevel}px`,
    '--font-title': `${13 * zoomLevel}px`,
    '--font-desc': `${11 * zoomLevel}px`,
    '--font-meta': `${10 * zoomLevel}px`,
    '--avatar-size': `${20 * zoomLevel}px`,
    '--icon-size': `${14 * zoomLevel}px`,
    gap: `${12 * zoomLevel}px`,
  } as React.CSSProperties;

  const activeTask = tasks.find(t => t._id === activeId);

  const handleDragStart = (_event: DragStartEvent) => {
    const task = tasks.find(t => t._id === _event.active.id);
    if (task) {
      setActiveId(task._id);
      setHoveredColumnId(task.cardId);
      overColumnRef.current = task.cardId;
    } else {
      setActiveId(_event.active.id as string);
    }
    previousStateRef.current = { cards, tasks };
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setHoveredColumnId(null);
      overColumnRef.current = null;
      return;
    }

    const overId = over.id as string;
    const activeIdRaw = active.id as string;

    const isDraggingTask = tasks.some(t => t._id === activeIdRaw);
    if (!isDraggingTask) return;

    const colId = extractColumnId(overId);
    if (cards.some(c => c._id === colId)) {
      setHoveredColumnId(colId);
      overColumnRef.current = colId;
    } else {
      const overTask = tasks.find(t => t._id === overId);
      if (overTask) {
        setHoveredColumnId(overTask.cardId);
        overColumnRef.current = overTask.cardId;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setHoveredColumnId(null);
    if (!over) {
      overColumnRef.current = null;
      return;
    }

    const activeIdRaw = active.id as string;
    const overIdRaw = over.id as string;

    const isTask = tasks.some(t => t._id === activeIdRaw);
    const isCard = cards.some(c => c._id === activeIdRaw);

    // Debug logging
    console.log('DragEnd event', {
      activeId: active.id,
      overId: over.id,
      activeIdRaw,
      overIdRaw,
      isTask,
      isCard,
      sourceColId: isTask ? tasks.find(t => t._id === activeIdRaw)?.cardId : undefined,
      destColId: overColumnRef.current,
    });

    if (isTask) {
      const activeTaskData = tasks.find(t => t._id === activeIdRaw)!;
      const sourceColId = activeTaskData.cardId;
      const destColId = overColumnRef.current || sourceColId;

      const sourceTasks = tasks
        .filter(t => t.cardId === sourceColId)
        .sort((a, b) => (a.order || '').localeCompare(b.order || ''));
      const oldIndex = sourceTasks.findIndex(t => t._id === activeIdRaw);

      const destTasks = tasks
        .filter(t => t.cardId === destColId)
        .sort((a, b) => (a.order || '').localeCompare(b.order || ''));
      const overTask = tasks.find(t => t._id === overIdRaw);
      
      let newIndex: number;
      if (overTask) {
        newIndex = destTasks.findIndex(t => t._id === overTask._id);
        if (newIndex === -1) newIndex = destTasks.length;
      } else {
        newIndex = destTasks.length;
      }

      onMoveTask(activeIdRaw, sourceColId, destColId, oldIndex, newIndex);
    }
    overColumnRef.current = null;
  };

  const handleDragCancel = () => {
    overColumnRef.current = null;
    setHoveredColumnId(null);
    const previousState = previousStateRef.current;
    if (previousState) {
      previousState.tasks.forEach(t => {
        const updated = previousState.tasks.find(ut => ut._id === t._id);
        if (updated && updated.order !== t.order) {
          onReorderTasks(t.cardId, previousState.tasks.filter(t2 => t2.cardId === t.cardId));
        }
      });
    }
    setActiveId(null);
  };

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Plus className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-black text-slate-200 mb-2">Start building your project</h3>
          <p className="text-slate-500 font-medium mb-6 max-w-sm">Create your first column to organize your tasks and get started</p>
          {isOwner && (
            <button
              onClick={onAddColumn}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Create First Column
            </button>
          )}
        </div>
      </div>
    );
  }

  const isDraggingTask = !!activeId && tasks.some(t => t._id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main
        ref={mainRef}
        style={boardStyles}
        className="flex-1 overflow-x-auto overflow-y-hidden p-4 flex items-start bg-gradient-to-b from-black/10 to-transparent relative"
      >
        <LayoutGroup>
          {cards.map(card => {
            const cardTasks = tasks.filter(t => t.cardId === card._id).sort((a, b) => (a.order || '').localeCompare(b.order || ''));
            return (
              <SortableColumn
                key={card._id}
                card={card}
                tasks={cardTasks}
                onAddTask={onAddTask}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onDeleteColumn={onDeleteColumn}
                isOwner={isOwner}
                isDraggingAnyTask={isDraggingTask}
                isOver={isDraggingTask && hoveredColumnId === card._id}
                currentUserId={currentUserId}
              />
            );
          })}
        </LayoutGroup>

        {isOwner && (
          <button
            onClick={onAddColumn}
            style={{ width: 'var(--col-width)' }}
            className="shrink-0 h-40 border-2 border-dashed border-white/10 hover:border-primary/30 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-primary bg-slate-950/10 hover:bg-slate-950/20 backdrop-blur-md transition-all group shadow-md shadow-black/5 cursor-pointer"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all border border-white/5">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold text-[10px] uppercase tracking-[0.2em]">ADD COLUMN</span>
          </button>
        )}
      </main>

      {/* Floating Zoom Control Panel */}
      <div className="fixed bottom-6 right-6 z-40 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
        <button
          onClick={() => updateZoomLevel(prev => prev - 0.05)}
          disabled={zoomLevel <= 0.6}
          className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-full text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer active:scale-90"
          title="Zoom Out (-)"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => updateZoomLevel(1.0)}
          className="px-1.5 py-1 hover:bg-white/5 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer text-center min-w-[42px]"
          title="Reset Zoom (100%)"
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        <button
          onClick={() => updateZoomLevel(prev => prev + 0.05)}
          disabled={zoomLevel >= 1.4}
          className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-full text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer active:scale-90"
          title="Zoom In (+)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <DragOverlay>
        {activeId && activeTask ? (
          <div className="rotate-3 scale-105 shadow-2xl" style={boardStyles}>
            <TaskCard task={activeTask} onDelete={() => {}} onEdit={() => {}} isOwner={false} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default memo(KanbanBoard);