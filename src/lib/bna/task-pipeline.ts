/**
 * BNA Task Pipeline System
 * 
 * Inspired by Holy Flow AI OS - adapted for BNA Operations
 * 
 * Pipeline Stages:
 * - inbox: Raw capture from rambles/Telegram
 * - triage: Classified and prioritized
 * - planned: Broken into actionable steps
 * - in_progress: Currently being worked
 * - waiting: Blocked (needs external input)
 * - review: Completed, needs verification
 * - done: Finished
 * 
 * Ramble Protocol:
 * - Capture raw text/voice
 * - Parse for tasks, facts, decisions
 * - Auto-classify into pipeline
 * - Present for operator confirmation
 */

export type TaskStage = 
  | 'inbox'      // Raw capture
  | 'triage'     // Classified, needs prioritization
  | 'planned'    // Steps defined
  | 'in_progress'// Active work
  | 'waiting'    // Blocked/external dependency
  | 'review'     // Done, needs verification
  | 'done';      // Complete

export type TaskCategory =
  | 'accounting'
  | 'marketing'
  | 'communications'
  | 'operations'
  | 'parent_onboarding'
  | 'student_coaching'
  | 'ghl_crm'
  | 'billing'
  | 'legal_compliance'
  | 'facilities'
  | 'staffing';

export type TaskUrgency = 'urgent' | 'today' | 'this_week' | 'low';

export interface TaskStep {
  id: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  stage: TaskStage;
  category: TaskCategory;
  urgency: TaskUrgency;
  due_date: string | null;
  steps: TaskStep[];
  
  // Source tracking
  source: 'manual' | 'ramble' | 'telegram' | 'ghl_webhook' | 'green_invoice';
  source_context?: string;  // Original ramble text or message
  
  // AI classification
  ai_parsed?: {
    original_text: string;
    confidence: number;
    suggested_category: TaskCategory;
    suggested_urgency: TaskUrgency;
    extracted_steps: string[];
    entities: {
      people?: string[];
      dates?: string[];
      amounts?: string[];
      contacts?: string[];
    };
  };
  
  // Metadata
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  created_by: string;
  assigned_to: string | null;
  
  // Relations
  parent_task_id?: string;  // For subtasks
  related_contact_id?: string;  // GHL contact
  related_signup_id?: string;   // BNA signup
}

export interface PipelineStats {
  inbox: number;
  triage: number;
  planned: number;
  in_progress: number;
  waiting: number;
  review: number;
  done: number;
}

// Stage display config
export const STAGE_CONFIG: Record<TaskStage, { label: string; color: string; description: string }> = {
  inbox: { 
    label: 'Inbox', 
    color: '#8b5cf6', 
    description: 'Raw captures from rambles, Telegram, or quick adds' 
  },
  triage: { 
    label: 'Triage', 
    color: '#f59e0b', 
    description: 'Classified, needs priority and category assignment' 
  },
  planned: { 
    label: 'Planned', 
    color: '#3b82f6', 
    description: 'Broken into steps, ready to start' 
  },
  in_progress: { 
    label: 'In Progress', 
    color: '#06b6d4', 
    description: 'Currently being worked' 
  },
  waiting: { 
    label: 'Waiting', 
    color: '#6b7280', 
    description: 'Blocked - needs external input or dependency' 
  },
  review: { 
    label: 'Review', 
    color: '#ec4899', 
    description: 'Completed, needs verification' 
  },
  done: { 
    label: 'Done', 
    color: '#10b981', 
    description: 'Finished and verified' 
  },
};

// Category display config
export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; icon: string }> = {
  accounting: { label: 'Accounting', color: '#7c3aed', icon: '💰' },
  marketing: { label: 'Marketing', color: '#2563eb', icon: '📢' },
  communications: { label: 'Communications', color: '#0d9488', icon: '💬' },
  operations: { label: 'Operations', color: '#ea580c', icon: '⚙️' },
  parent_onboarding: { label: 'Parent Onboarding', color: '#db2777', icon: '👨‍👩‍👧‍👦' },
  student_coaching: { label: 'Student Coaching', color: '#059669', icon: '🎓' },
  ghl_crm: { label: 'GHL/CRM', color: '#7c2d12', icon: '🗄️' },
  billing: { label: 'Billing', color: '#16a34a', icon: '💳' },
  legal_compliance: { label: 'Legal/Compliance', color: '#dc2626', icon: '⚖️' },
  facilities: { label: 'Facilities', color: '#854d0e', icon: '🏢' },
  staffing: { label: 'Staffing', color: '#0891b2', icon: '👥' },
};

// Urgency config
export const URGENCY_CONFIG: Record<TaskUrgency, { label: string; color: string; badge: string }> = {
  urgent: { label: 'Urgent', color: '#dc2626', badge: '🔴' },
  today: { label: 'Today', color: '#d97706', badge: '🟡' },
  this_week: { label: 'This Week', color: '#2563eb', badge: '🔵' },
  low: { label: 'Low', color: '#64748b', badge: '⚪' },
};

// Ramble parsing keywords
export const RAMBLE_KEYWORDS = {
  // Task indicators
  task_signals: [
    'need to', 'should', 'must', 'have to', 'gotta', 'let\'s', 
    'we need', 'i need', 'todo', 'to do', 'task', 'action item'
  ],
  
  // Urgency indicators
  urgent_signals: [
    'asap', 'urgent', 'emergency', 'critical', 'right now', 
    'immediately', 'today', 'deadline', 'overdue'
  ],
  
  // Category indicators
  category_signals: {
    accounting: ['invoice', 'payment', 'bill', 'receipt', 'budget', 'expense', 'money', 'cost'],
    marketing: ['ad', 'campaign', 'facebook', 'website', 'landing page', 'promo', 'flyer'],
    communications: ['email', 'call', 'message', 'notify', 'tell', 'contact'],
    parent_onboarding: ['parent', 'onboard', 'new family', 'intake', 'registration'],
    student_coaching: ['student', 'boy', 'coaching', 'session', 'behavior', 'middos'],
    ghl_crm: ['ghl', 'contact', 'crm', 'pipeline', 'follow up', 'tag'],
    billing: ['charge', 'collect', 'payment', 'green invoice', 'cash', 'billing'],
  },
  
  // Step indicators
  step_signals: [
    'first', 'then', 'next', 'after that', 'finally', 'step 1', 'step 2',
    '1.', '2.', '3.', '- ', '• '
  ],
};

/**
 * Parse a ramble into structured task data
 */
export function parseRamble(text: string): Partial<Task> {
  const lowerText = text.toLowerCase();
  
  // Detect urgency
  let urgency: TaskUrgency = 'low';
  if (RAMBLE_KEYWORDS.urgent_signals.some(s => lowerText.includes(s))) {
    urgency = 'urgent';
  } else if (lowerText.includes('today') || lowerText.includes('tomorrow')) {
    urgency = 'today';
  } else if (lowerText.includes('this week')) {
    urgency = 'this_week';
  }
  
  // Detect category
  let category: TaskCategory = 'operations';
  let maxScore = 0;
  
  for (const [cat, keywords] of Object.entries(RAMBLE_KEYWORDS.category_signals)) {
    const score = keywords.filter(k => lowerText.includes(k)).length;
    if (score > maxScore) {
      maxScore = score;
      category = cat as TaskCategory;
    }
  }
  
  // Extract steps from numbered lists or step indicators
  const steps: string[] = [];
  const lines = text.split(/\n|(?:,\s*(?=then|next|after))/i);
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (RAMBLE_KEYWORDS.step_signals.some(s => trimmed.toLowerCase().includes(s))) {
      steps.push(trimmed.replace(/^[-•\d.)\s]+/, '').trim());
    }
  }
  
  // Extract title (first sentence or first 10 words)
  const title = text.split(/[.!?]/)[0].slice(0, 80) || 'New Task';
  
  return {
    title,
    notes: text,
    stage: 'inbox',
    category,
    urgency,
    steps: steps.map((s, i) => ({
      id: `step-${i}`,
      description: s,
      completed: false,
      order: i,
    })),
    source: 'ramble',
    source_context: text,
    ai_parsed: {
      original_text: text,
      confidence: maxScore > 0 ? 0.7 + (maxScore * 0.1) : 0.5,
      suggested_category: category,
      suggested_urgency: urgency,
      extracted_steps: steps,
      entities: extractEntities(text),
    },
  };
}

function extractEntities(text: string): { people?: string[]; dates?: string[]; amounts?: string[]; contacts?: string[] } {
  const entities: { people?: string[]; dates?: string[]; amounts?: string[]; contacts?: string[] } = {};
  
  // Extract names (capitalized words that look like names)
  const nameMatches = text.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g);
  if (nameMatches) entities.people = [...new Set(nameMatches)];
  
  // Extract dates
  const dateMatches = text.match(/\b\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}\b|\b(?:today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday)\b/gi);
  if (dateMatches) entities.dates = [...new Set(dateMatches)];
  
  // Extract amounts (shekels, dollars, numbers with currency)
  const amountMatches = text.match(/\b\d+[\s,]*\d*\s*(?:₪|shekel|shekels|USD|\$|NIS)\b|\b(?:₪|\$)\s*\d+[\s,]*\d*\b/gi);
  if (amountMatches) entities.amounts = [...new Set(amountMatches)];
  
  // Extract emails
  const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
  if (emailMatches) entities.contacts = [...new Set(emailMatches)];
  
  return entities;
}

/**
 * Generate next actions based on current pipeline state
 */
export function suggestNextActions(stats: PipelineStats): string[] {
  const suggestions: string[] = [];
  
  if (stats.inbox > 5) {
    suggestions.push(`📥 You have ${stats.inbox} items in inbox - time to triage`);
  }
  
  if (stats.triage > 3) {
    suggestions.push(`🔍 ${stats.triage} tasks need categorization and prioritization`);
  }
  
  if (stats.in_progress > 5) {
    suggestions.push(`⚠️ You have ${stats.in_progress} tasks in progress - consider focusing or moving some to waiting`);
  }
  
  if (stats.waiting > 0) {
    suggestions.push(`⏳ ${stats.waiting} tasks are blocked - check if dependencies are resolved`);
  }
  
  if (stats.inbox === 0 && stats.triage === 0 && stats.planned === 0) {
    suggestions.push('✅ Pipeline clear! Ready for new rambles or strategic planning');
  }
  
  return suggestions;
}

/**
 * Format task for Telegram display
 */
export function formatTaskForTelegram(task: Task): string {
  const stage = STAGE_CONFIG[task.stage];
  const category = CATEGORY_CONFIG[task.category];
  const urgency = URGENCY_CONFIG[task.urgency];
  
  let text = `${urgency.badge} *${task.title}*\n`;
  text += `${category.icon} ${category.label} | ${stage.label}\n`;
  
  if (task.notes) {
    text += `\n${task.notes.slice(0, 200)}${task.notes.length > 200 ? '...' : ''}\n`;
  }
  
  if (task.steps.length > 0) {
    const completed = task.steps.filter(s => s.completed).length;
    text += `\n📋 Steps: ${completed}/${task.steps.length} done`;
  }
  
  if (task.due_date) {
    text += `\n📅 Due: ${task.due_date}`;
  }
  
  return text;
}
