'use client';

import { Task, TaskCategory, TaskUrgency, TaskStatus } from '@/lib/tasks/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleDone: (task: Task) => void;
}

const categoryColors: Record<TaskCategory, string> = {
  Accounting: 'bg-purple-100 text-purple-800 border-purple-200',
  Marketing: 'bg-blue-100 text-blue-800 border-blue-200',
  Communications: 'bg-teal-100 text-teal-800 border-teal-200',
};

const urgencyColors: Record<TaskUrgency, string> = {
  Urgent: 'bg-rose-100 text-rose-800 border-rose-200',
  Today: 'bg-amber-100 text-amber-800 border-amber-200',
  'This week': 'bg-blue-100 text-blue-800 border-blue-200',
  'Low priority': 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusColors: Record<TaskStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  'In progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Waiting on someone': 'bg-purple-100 text-purple-800 border-purple-200',
  Done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export function TaskCard({ task, onEdit, onDelete, onToggleDone }: TaskCardProps) {
  const isDone = task.status === 'Done';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`bg-surface border border-line rounded-xl p-4 transition-all ${
        isDone ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-ink mb-1 ${isDone ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          {task.notes && (
            <p className="text-sm text-ink-soft line-clamp-2 mb-2">{task.notes}</p>
          )}
          
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${categoryColors[task.category]}`}>
              {task.category}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${urgencyColors[task.urgency]}`}>
              {task.urgency}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColors[task.status]}`}>
              {task.status}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.owner && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {task.owner}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onToggleDone(task)}
            className={`p-2 rounded-lg transition-colors ${
              isDone
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
            title={isDone ? 'Reopen' : 'Mark done'}
          >
            {isDone ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
