'use client';

import { Task } from '@/lib/tasks/types';

interface SummaryCardsProps {
  tasks: Task[];
}

export function SummaryCards({ tasks }: SummaryCardsProps) {
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const urgentCount = tasks.filter(t => t.urgency === 'Urgent' && t.status !== 'Done').length;
  const dueTodayCount = tasks.filter(t => {
    if (t.status === 'Done') return false;
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate === today || t.urgency === 'Today';
  }).length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  const cards = [
    { label: 'Pending', count: pendingCount, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { label: 'Urgent', count: urgentCount, color: 'bg-rose-100 text-rose-800 border-rose-200' },
    { label: 'Due Today', count: dueTodayCount, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { label: 'Done', count: doneCount, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-2 sm:p-3 text-center ${card.color}`}
        >
          <div className="text-xl sm:text-2xl font-bold">{card.count}</div>
          <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide mt-0.5">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
