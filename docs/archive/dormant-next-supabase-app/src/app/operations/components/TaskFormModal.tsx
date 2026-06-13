'use client';

import { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskUrgency, TaskStatus, CATEGORIES, URGENCIES, STATUSES } from '@/lib/tasks/types';

interface TaskFormModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const emptyTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  notes: '',
  category: 'Accounting',
  urgency: 'This week',
  status: 'Pending',
  dueDate: null,
  owner: '',
};

export function TaskFormModal({ task, isOpen, onClose, onSave }: TaskFormModalProps) {
  const [formData, setFormData] = useState(emptyTask);
  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        notes: task.notes,
        category: task.category,
        urgency: task.urgency,
        status: task.status,
        dueDate: task.dueDate,
        owner: task.owner || '',
      });
    } else {
      setFormData(emptyTask);
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      owner: formData.owner || null,
    });
    onClose();
  };

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-2xl border border-line w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Task title..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none"
              placeholder="Add details..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateField('category', cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.category === cat
                      ? 'bg-ink text-white'
                      : 'bg-bg border border-line text-ink-soft hover:bg-gold-soft'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Urgency *</label>
            <div className="grid grid-cols-2 gap-2">
              {URGENCIES.map((urg) => (
                <button
                  key={urg}
                  type="button"
                  onClick={() => updateField('urgency', urg)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.urgency === urg
                      ? 'bg-ink text-white'
                      : 'bg-bg border border-line text-ink-soft hover:bg-gold-soft'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-bg border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Due Date (optional)</label>
            <input
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => updateField('dueDate', e.target.value || null)}
              className="w-full px-3 py-2 bg-bg border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Owner (optional)</label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => updateField('owner', e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Who is responsible?"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-bg border border-line rounded-lg text-sm font-medium text-ink-soft hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
