import { Task, TaskCategory, TaskUrgency, TaskStatus, CATEGORIES, URGENCIES, STATUSES } from './types';

const STORAGE_KEY = 'bna-operations-tasks';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getSampleTasks(): Task[] {
  const today = getToday();
  return [
    {
      id: generateId(),
      title: 'Review tuition/accounting follow-ups',
      notes: 'Check pending payments and send reminders to parents',
      category: 'Accounting',
      urgency: 'This week',
      status: 'Pending',
      dueDate: null,
      owner: null,
      createdAt: today,
      updatedAt: today,
    },
    {
      id: generateId(),
      title: 'Prepare parent communications update',
      notes: 'Draft weekly update email for parents about upcoming events',
      category: 'Communications',
      urgency: 'Today',
      status: 'Pending',
      dueDate: today,
      owner: null,
      createdAt: today,
      updatedAt: today,
    },
    {
      id: generateId(),
      title: 'Draft next marketing message',
      notes: 'Create social media post for the upcoming open house',
      category: 'Marketing',
      urgency: 'Low priority',
      status: 'In progress',
      dueDate: null,
      owner: null,
      createdAt: today,
      updatedAt: today,
    },
  ];
}

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const sampleTasks = getSampleTasks();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTasks));
    return sampleTasks;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const today = getToday();
  const newTask: Task = {
    ...taskData,
    id: generateId(),
    createdAt: today,
    updatedAt: today,
  };
  
  const tasks = getTasks();
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  const today = getToday();
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: today,
  };
  
  saveTasks(tasks);
  return tasks[index];
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  
  if (filtered.length === tasks.length) return false;
  
  saveTasks(filtered);
  return true;
}

export function markTaskDone(id: string): Task | null {
  return updateTask(id, { status: 'Done' });
}

export function reopenTask(id: string): Task | null {
  return updateTask(id, { status: 'Pending' });
}

export { CATEGORIES, URGENCIES, STATUSES };
export type { Task, TaskCategory, TaskUrgency, TaskStatus };
