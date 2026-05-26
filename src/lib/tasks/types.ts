export type TaskCategory = 'Accounting' | 'Marketing' | 'Communications';
export type TaskUrgency = 'Urgent' | 'Today' | 'This week' | 'Low priority';
export type TaskStatus = 'Pending' | 'In progress' | 'Waiting on someone' | 'Done';

export interface Task {
  id: string;
  title: string;
  notes: string;
  category: TaskCategory;
  urgency: TaskUrgency;
  status: TaskStatus;
  dueDate: string | null;
  owner: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  category: TaskCategory | 'All';
  urgency: TaskUrgency | 'All urgency';
  status: TaskStatus | 'All statuses';
  search: string;
}

export const CATEGORIES: TaskCategory[] = ['Accounting', 'Marketing', 'Communications'];

export const URGENCIES: TaskUrgency[] = ['Urgent', 'Today', 'This week', 'Low priority'];

export const STATUSES: TaskStatus[] = ['Pending', 'In progress', 'Waiting on someone', 'Done'];
