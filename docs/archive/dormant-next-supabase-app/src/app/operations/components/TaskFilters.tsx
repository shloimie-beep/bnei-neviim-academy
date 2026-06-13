'use client';

import { TaskFilters as TaskFiltersType, TaskCategory, TaskUrgency, TaskStatus, CATEGORIES, URGENCIES, STATUSES } from '@/lib/tasks/types';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const updateFilter = <K extends keyof TaskFiltersType>(key: K, value: TaskFiltersType[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const categoryTabs: (TaskCategory | 'All')[] = ['All', ...CATEGORIES];
  const urgencyOptions: (TaskUrgency | 'All urgency')[] = ['All urgency', ...URGENCIES];
  const statusOptions: (TaskStatus | 'All statuses')[] = ['All statuses', ...STATUSES];

  return (
    <div className="space-y-3 mb-4">
      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categoryTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => updateFilter('category', cat)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filters.category === cat
                ? 'bg-ink text-white'
                : 'bg-surface text-ink-soft hover:bg-gold-soft'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full px-4 py-2.5 pl-10 bg-surface border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Urgency and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={filters.urgency}
          onChange={(e) => updateFilter('urgency', e.target.value as TaskUrgency | 'All urgency')}
          className="w-full sm:w-auto px-3 py-2 bg-surface border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {urgencyOptions.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value as TaskStatus | 'All statuses')}
          className="w-full sm:w-auto px-3 py-2 bg-surface border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
