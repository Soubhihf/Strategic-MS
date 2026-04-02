export interface Project {
  id: number;
  icon: string;
  name: string;
  code: string;
  color: string;
  stage: string;
  priority: number;
  progress: number;
  horizon: string;
  mission: string;
  blocker: string;
  nextAction: string;
}

export interface Task {
  id: number;
  text: string;
  project: string;
  priority: number;
  due: string;
  done: boolean;
  assignee: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  project: string;
  avatar: string;
  color: string;
  tasks: number;
  done: number;
}

export interface KPI {
  id: number;
  name: string;
  project: string;
  target: number;
  current: number;
  unit: string;
  status: 'green' | 'yellow' | 'red';
}

export interface CashFlow {
  id: number;
  name: string;
  project: string;
  monthly: number;
  actual: number;
  cat: string;
}

export interface Budget {
  id: number;
  name: string;
  total: number;
  spent: number;
  year: number;
  project: string;
}

export interface PnLMonth {
  month: string;
  revenue: number;
  cogs: number;
  gross: number;
  opex: number;
  ebit: number;
}

export interface Investment {
  id: number;
  name: string;
  project: string;
  invested: number;
  currentValue: number;
  roi: number;
  status: string;
  risk: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number;
  project: string;
  type: 'meeting' | 'deep-work' | 'review' | 'call' | 'personal';
  color: string;
}

export interface AppState {
  // Auth
  isLoggedIn: boolean;
  password: string;
  // UI
  currentPage: string;
  sidebarOpen: boolean;
  // Data
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  kpis: KPI[];
  chatHistory: ChatMessage[];
  calendarEvents: CalendarEvent[];
  // Financial
  cashInflows: CashFlow[];
  cashOutflows: CashFlow[];
  budgets: Budget[];
  pnl: PnLMonth[];
  investments: Investment[];
  assets: {
    current: Array<{ name: string; value: number }>;
    fixed: Array<{ name: string; value: number }>;
  };
  liabilities: {
    current: Array<{ name: string; value: number }>;
    longTerm: Array<{ name: string; value: number }>;
  };
  // Settings
  apiKey: string;
  telegramToken: string;
  telegramChatId: string;
  userName: string;
}
