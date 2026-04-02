import { AppState, Project, Task, TeamMember, KPI, CashFlow, Budget, PnLMonth, Investment, CalendarEvent, ChatMessage } from './types';

// Default Projects (from Executive OS)
const DEFAULT_PROJECTS: Project[] = [
  {
    id: 1,
    icon: '🫘',
    name: 'غسيل الكلى — دمشق',
    code: 'P1',
    color: '#38bdf8',
    stage: 'إعادة تشغيل',
    priority: 1,
    progress: 15,
    horizon: '6-12 شهر',
    mission: 'توفير محاليل وخراطيش غسيل الكلى بجودة GMP',
    blocker: 'الترخيص النهائي من وزارة الصحة',
    nextAction: 'متابعة ملف الترخيص هذا الأسبوع'
  },
  {
    id: 2,
    icon: '🌍',
    name: 'غسيل الكلى — إقليمي',
    code: 'P2',
    color: '#60a5fa',
    stage: 'جاهز للانطلاق',
    priority: 2,
    progress: 8,
    horizon: '6-18 شهر',
    mission: 'التوسع في عُمان وأفريقيا بخبرة 10 سنوات',
    blocker: 'تنسيق التوقيت مع P1',
    nextAction: 'تحديد أول عميل عُماني'
  },
  {
    id: 3,
    icon: '🍼',
    name: 'بيورميل — أغذية أطفال',
    code: 'P3',
    color: '#fb923c',
    stage: 'أزمة توزيع',
    priority: 2,
    progress: 30,
    horizon: '3-6 أشهر',
    mission: 'تحويل بيورميل لعلامة تصديرية إقليمية',
    blocker: 'غياب قناة توزيع',
    nextAction: 'قائمة 20 موزع إقليمي'
  },
  {
    id: 4,
    icon: '🌽',
    name: 'توبيكس سناك — البرازيل',
    code: 'P4',
    color: '#f97316',
    stage: 'بحث موزعين',
    priority: 3,
    progress: 10,
    horizon: '6-9 أشهر',
    mission: 'اختراق السوق البرازيلي بسناك متميز',
    blocker: 'ANVISA + موزع محلي',
    nextAction: 'الغرفة التجارية العربية البرازيلية'
  },
  {
    id: 5,
    icon: '💎',
    name: 'Fortrace / BFP — فينتك',
    code: 'P5',
    color: '#c084fc',
    stage: 'بحث وتطوير',
    priority: 4,
    progress: 5,
    horizon: '24-36 شهر',
    mission: 'بديل مالي عالمي يتجاوز قيود POU',
    blocker: 'الإطار القانوني + المطور التقني',
    nextAction: 'Whitepaper أولي'
  },
  {
    id: 6,
    icon: '🌱',
    name: 'أسمدة وفوسفات — البرازيل',
    code: 'P6',
    color: '#4ade80',
    stage: 'قيد الدراسة',
    priority: 3,
    progress: 5,
    horizon: '12-18 شهر',
    mission: 'تصدير الفوسفات السوري للبرازيل',
    blocker: 'التحقق من الميزة التنافسية',
    nextAction: 'تحليل أسعار الفوسفات العالمي'
  }
];

// Default Tasks (from Executive OS)
const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    text: 'متابعة ملف الترخيص في وزارة الصحة',
    project: 'P1',
    priority: 1,
    due: '2026-04-02',
    done: false,
    assignee: 'أنا'
  },
  {
    id: 2,
    text: 'قائمة 20 موزع إقليمي لبيورميل',
    project: 'P3',
    priority: 1,
    due: '2026-04-05',
    done: false,
    assignee: 'أنا'
  },
  {
    id: 3,
    text: 'التواصل مع الغرفة التجارية العربية البرازيلية',
    project: 'P4',
    priority: 2,
    due: '2026-04-05',
    done: false,
    assignee: 'أنا'
  },
  {
    id: 4,
    text: 'تحليل أسعار الفوسفات العالمي',
    project: 'P6',
    priority: 2,
    due: '2026-04-05',
    done: false,
    assignee: 'أنا'
  },
  {
    id: 5,
    text: 'تحديد أول عميل عُماني محتمل',
    project: 'P2',
    priority: 2,
    due: '2026-04-09',
    done: false,
    assignee: 'أنا'
  },
  {
    id: 6,
    text: 'Whitepaper أولي لـ BFP/Fortrace',
    project: 'P5',
    priority: 3,
    due: '2026-05-02',
    done: false,
    assignee: 'أنا'
  }
];

// Default Team (from Executive OS)
const DEFAULT_TEAM: TeamMember[] = [
  {
    id: 1,
    name: 'أحمد الحسن',
    role: 'مدير الإنتاج',
    project: 'P1',
    avatar: 'أ',
    color: '#38bdf8',
    tasks: 3,
    done: 1
  },
  {
    id: 2,
    name: 'سارة نجم',
    role: 'مديرة التسويق',
    project: 'P3',
    avatar: 'س',
    color: '#fb923c',
    tasks: 4,
    done: 2
  },
  {
    id: 3,
    name: 'محمد كرمي',
    role: 'مندوب المبيعات',
    project: 'P4',
    avatar: 'م',
    color: '#4ade80',
    tasks: 2,
    done: 0
  }
];

// Default KPIs
const DEFAULT_KPIS: KPI[] = [
  {
    id: 1,
    name: 'معدل التوسع الشهري',
    project: 'P1',
    target: 25,
    current: 15,
    unit: '%',
    status: 'yellow'
  },
  {
    id: 2,
    name: 'هامش الربح الإجمالي',
    project: 'P3',
    target: 40,
    current: 38,
    unit: '%',
    status: 'green'
  },
  {
    id: 3,
    name: 'معدل إكمال المشاريع',
    project: 'ALL',
    target: 70,
    current: 45,
    unit: '%',
    status: 'yellow'
  }
];

// Default Cash Flow - Inflows (from Financial OS)
const DEFAULT_CASH_INFLOWS: CashFlow[] = [
  {
    id: 1,
    name: 'مبيعات خراطيش الكلى',
    project: 'P1',
    monthly: 45000,
    actual: 0,
    cat: 'إيرادات تشغيلية'
  },
  {
    id: 2,
    name: 'مبيعات محاليل الكلى',
    project: 'P1',
    monthly: 30000,
    actual: 0,
    cat: 'إيرادات تشغيلية'
  },
  {
    id: 3,
    name: 'مبيعات بيورميل',
    project: 'P3',
    monthly: 18000,
    actual: 12000,
    cat: 'إيرادات تشغيلية'
  },
  {
    id: 4,
    name: 'مبيعات توبيكس سناك',
    project: 'P4',
    monthly: 8000,
    actual: 0,
    cat: 'إيرادات تشغيلية'
  }
];

// Default Cash Flow - Outflows (from Financial OS)
const DEFAULT_CASH_OUTFLOWS: CashFlow[] = [
  {
    id: 1,
    name: 'تكاليف الإنتاج — كلى',
    project: 'P1',
    monthly: 22000,
    actual: 18000,
    cat: 'تكاليف تشغيلية'
  },
  {
    id: 2,
    name: 'تكاليف الإنتاج — بيورميل',
    project: 'P3',
    monthly: 9000,
    actual: 7500,
    cat: 'تكاليف تشغيلية'
  },
  {
    id: 3,
    name: 'الرواتب والأجور',
    project: 'ALL',
    monthly: 15000,
    actual: 15000,
    cat: 'تكاليف تشغيلية'
  },
  {
    id: 4,
    name: 'إيجارات ومرافق',
    project: 'ALL',
    monthly: 4500,
    actual: 4500,
    cat: 'تكاليف ثابتة'
  },
  {
    id: 5,
    name: 'تسويق وتوزيع',
    project: 'P3',
    monthly: 3000,
    actual: 1200,
    cat: 'تكاليف متغيرة'
  }
];

// Default Budgets (from Financial OS)
const DEFAULT_BUDGETS: Budget[] = [
  {
    id: 1,
    name: 'الميزانية التشغيلية',
    total: 200000,
    spent: 82200,
    year: 2026,
    project: 'ALL'
  },
  {
    id: 2,
    name: 'ميزانية التسويق',
    total: 25000,
    spent: 6200,
    year: 2026,
    project: 'P3+P4'
  },
  {
    id: 3,
    name: 'ميزانية البحث والتطوير',
    total: 30000,
    spent: 8000,
    year: 2026,
    project: 'P5'
  },
  {
    id: 4,
    name: 'ميزانية التوسع الإقليمي',
    total: 50000,
    spent: 0,
    year: 2026,
    project: 'P2'
  }
];

// Default P&L (from Financial OS)
const DEFAULT_PNL: PnLMonth[] = [
  {
    month: 'يناير',
    revenue: 12000,
    cogs: 7500,
    gross: 4500,
    opex: 8200,
    ebit: -3700
  },
  {
    month: 'فبراير',
    revenue: 14500,
    cogs: 8800,
    gross: 5700,
    opex: 8200,
    ebit: -2500
  },
  {
    month: 'مارس',
    revenue: 18000,
    cogs: 10200,
    gross: 7800,
    opex: 8200,
    ebit: -400
  },
  {
    month: 'أبريل',
    revenue: 22000,
    cogs: 12000,
    gross: 10000,
    opex: 8400,
    ebit: 1600
  },
  {
    month: 'مايو',
    revenue: 19000,
    cogs: 10800,
    gross: 8200,
    opex: 8400,
    ebit: -200
  }
];

// Default Investments (from Financial OS)
const DEFAULT_INVESTMENTS: Investment[] = [
  {
    id: 1,
    name: 'خط إنتاج الخراطيش',
    project: 'P1',
    invested: 120000,
    currentValue: 185000,
    roi: 54.2,
    status: 'ممتاز',
    risk: 'منخفض'
  },
  {
    id: 2,
    name: 'خط المحاليل',
    project: 'P1',
    invested: 65000,
    currentValue: 72000,
    roi: 10.8,
    status: 'جيد',
    risk: 'منخفض'
  },
  {
    id: 3,
    name: 'معدات بيورميل',
    project: 'P3',
    invested: 45000,
    currentValue: 41000,
    roi: -8.9,
    status: 'يحتاج مراجعة',
    risk: 'متوسط'
  },
  {
    id: 4,
    name: 'بحث Fortrace',
    project: 'P5',
    invested: 28000,
    currentValue: 28000,
    roi: 0,
    status: 'قيد التطوير',
    risk: 'عالٍ'
  }
];

// Default Calendar Events
const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: 'اجتماع مع وزارة الصحة',
    date: '2026-04-03',
    time: '10:00',
    duration: 60,
    project: 'P1',
    type: 'meeting',
    color: '#38bdf8'
  },
  {
    id: 2,
    title: 'جلسة تعمق على الاستراتيجية',
    date: '2026-04-05',
    time: '14:00',
    duration: 120,
    project: 'ALL',
    type: 'deep-work',
    color: '#8b5cf6'
  },
  {
    id: 3,
    title: 'مراجعة أسبوعية للمشاريع',
    date: '2026-04-07',
    time: '09:00',
    duration: 90,
    project: 'ALL',
    type: 'review',
    color: '#4ade80'
  }
];

// Default Chat History
const DEFAULT_CHAT_HISTORY: ChatMessage[] = [];

// Complete Default State
export const DEFAULT_STATE: AppState = {
  // Auth
  isLoggedIn: false,
  password: '',

  // UI
  currentPage: 'dashboard',
  sidebarOpen: true,

  // Data
  projects: DEFAULT_PROJECTS,
  tasks: DEFAULT_TASKS,
  team: DEFAULT_TEAM,
  kpis: DEFAULT_KPIS,
  chatHistory: DEFAULT_CHAT_HISTORY,
  calendarEvents: DEFAULT_CALENDAR_EVENTS,

  // Financial
  cashInflows: DEFAULT_CASH_INFLOWS,
  cashOutflows: DEFAULT_CASH_OUTFLOWS,
  budgets: DEFAULT_BUDGETS,
  pnl: DEFAULT_PNL,
  investments: DEFAULT_INVESTMENTS,
  assets: {
    current: [
      { name: 'النقد والمعادل', value: 42000 },
      { name: 'حسابات القبض', value: 18500 },
      { name: 'المخزون', value: 31000 }
    ],
    fixed: [
      { name: 'الآلات والمعدات', value: 185000 },
      { name: 'المباني والمنشآت', value: 320000 },
      { name: 'الأصول غير الملموسة', value: 45000 }
    ]
  },
  liabilities: {
    current: [
      { name: 'حسابات الدفع', value: 22000 },
      { name: 'قروض قصيرة الأجل', value: 35000 }
    ],
    longTerm: [
      { name: 'قروض بنكية طويلة الأجل', value: 180000 },
      { name: 'التزامات التأجير', value: 28000 }
    ]
  },

  // Settings
  apiKey: '',
  telegramToken: '',
  telegramChatId: '',
  userName: 'Executive'
};
