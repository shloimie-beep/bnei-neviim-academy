'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task, TaskFilters, TaskCategory, TaskUrgency, TaskStatus } from '@/lib/tasks/types';
import { getTasks, createTask, updateTask, deleteTask, saveTasks } from '@/lib/tasks/store';
import { SummaryCards } from './SummaryCards';
import { TaskFilters as TaskFiltersComponent } from './TaskFilters';
import { TaskCard } from './TaskCard';
import { TaskFormModal } from './TaskFormModal';

export function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    category: 'All',
    urgency: 'All urgency',
    status: 'All statuses',
    search: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load tasks on mount
  useEffect(() => {
    const loadedTasks = getTasks();
    setTasks(loadedTasks);
    setIsLoaded(true);
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Category filter
      if (filters.category !== 'All' && task.category !== filters.category) {
        return false;
      }

      // Urgency filter
      if (filters.urgency !== 'All urgency' && task.urgency !== filters.urgency) {
        return false;
      }

      // Status filter
      if (filters.status !== 'All statuses' && task.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesNotes = task.notes.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // Sort: Pending first, then by urgency, then by due date
  const sortedTasks = useMemo(() => {
    const urgencyOrder: Record<TaskUrgency, number> = {
      Urgent: 0,
      Today: 1,
      'This week': 2,
      'Low priority': 3,
    };

    return [...filteredTasks].sort((a, b) => {
      // Done tasks at the bottom
      if (a.status === 'Done' && b.status !== 'Done') return 1;
      if (a.status !== 'Done' && b.status === 'Done') return -1;

      // Then by urgency
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;

      // Then by due date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      return 0;
    });
  }, [filteredTasks]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = createTask(taskData);
    setTasks(getTasks());
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setTasks(getTasks());
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
      setTasks(getTasks());
    }
  };

  const handleToggleDone = (task: Task) => {
    const newStatus = task.status === 'Done' ? 'Pending' : 'Done';
    updateTask(task.id, { status: newStatus });
    setTasks(getTasks());
  };

  const openAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-ink-soft">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-line">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-ink">BNA Operations</h1>
              <p className="text-xs text-ink-soft">Simple task control for the academy</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Summary Cards */}
        <SummaryCards tasks={tasks} />

        {/* Filters */}
        <TaskFiltersComponent filters={filters} onChange={setFilters} />

        {/* Task Count */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-ink-soft">
            {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
          </span>
          {filters.category !== 'All' || filters.urgency !== 'All urgency' || filters.status !== 'All statuses' || filters.search ? (
            <button
              onClick={() => setFilters({ category: 'All', urgency: 'All urgency', status: 'All statuses', search: '' })}
              className="text-sm text-gold hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-soft flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-ink-soft mb-2">No tasks found</p>
              <button
                onClick={openAddModal}
                className="text-gold hover:underline text-sm"
              >
                Add your first task
              </button>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onToggleDone={handleToggleDone}
              />
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      <TaskFormModal
        task={editingTask}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingTask ? handleEditTask : handleAddTask}
      />
    </div>
  );
}
