'use client';
import React, { useState, useEffect } from 'react';

// TYPES
interface Project { id: string; name: string; description: string; progress: number; stage: string; blocker?: string; }
interface Task { id: string; title: string; quadrant: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'done'; assignee?: string; }
interface TeamMember { id: string; name: string; role: string; project: string; performance: number; }
interface CalendarEvent { id: string; title: string; date: string; startTime: string; duration: number; projectId?: string; type: string; }
interface KPI { id: string; name: string; current: number; target: number; unit: string; }
interface CashFlow { id: string; type: 'inflow' | 'outflow'; description: string; amount: number; date: string; }
interface BudgetItem { id: string; name: string; allocated: number; spent: number; category: string; }
interface Investment { id: string; name: string; amount: number; roi: number; date: string; }
interface PLRecord { id: string; month: string; revenue: number; cogs: number; opex: number; }
interface AppState {
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  events: CalendarEvent[];
  kpis: KPI[];
  cashFlows: CashFlow[];
  budgets: BudgetItem[];
  investments: Investment[];
  plRecords: PLRecord[];
  assets: { current: number; fixed: number };
  liabilities: { current: number; longTerm: number };
  equity: number;
}

// UTILITIES
const fmt = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
};

const pct = (a: number, b: number): number => (b === 0 ? 0 : Math.round((a / b) * 100));
const totalInflow = (flows: CashFlow[]): number => flows.filter(f => f.type === 'inflow').reduce((sum, f) => sum + f.amount, 0);
const totalOutflow = (flows: CashFlow[]): number => flows.filter(f => f.type === 'outflow').reduce((sum, f) => sum + f.amount, 0);
const netCF = (flows: CashFlow[]): number => totalInflow(flows) - totalOutflow(flows);
const totalAssets = (state: AppState): number => state.assets.current + state.assets.fixed;
const totalLiab = (state: AppState): number => state.liabilities.current + state.liabilities.longTerm;

const defaultState: AppState = {
  projects: [
    { id: '1', name: 'تطوير المنتج', description: 'تطوير النسخة الجديدة من المنتج', progress: 65, stage: 'متقدم', blocker: 'الموارد' },
    { id: '2', name: 'توسع السوق', description: 'دخول أسواق جديدة', progress: 40, stage: 'التخطيط' },
  ],
  tasks: [
    { id: '1', title: 'مراجعة الميزانية Q2', quadrant: 'urgent-important', assignee: 'أحمد' },
    { id: '2', title: 'اجتماع مع الفريق', quadrant: 'urgent-important', assignee: 'سارة' },
    { id: '3', title: 'تحديث الوثائق', quadrant: 'not-urgent-important' },
  ],
  team: [
    { id: '1', name: 'أحمد محمد', role: 'مدير المشروع', project: 'تطوير المنتج', performance: 92 },
    { id: '2', name: 'سارة علي', role: 'مديرة مالية', project: 'إدارة المالية', performance: 88 },
  ],
  events: [],
  kpis: [
    { id: '1', name: 'إيرادات الشهر', current: 150000, target: 200000, unit: 'ر.س' },
    { id: '2', name: 'رضا العملاء', current: 4.2, target: 4.8, unit: 'من 5' },
  ],
  cashFlows: [
    { id: '1', type: 'inflow', description: 'مبيعات', amount: 50000, date: '2026-04-01' },
    { id: '2', type: 'outflow', description: 'الرواتب', amount: 30000, date: '2026-04-01' },
  ],
  budgets: [
    { id: '1', name: 'التسويق', allocated: 100000, spent: 65000, category: 'تسويق' },
    { id: '2', name: 'التكنولوجيا', allocated: 200000, spent: 150000, category: 'تكنولوجيا' },
  ],
  investments: [
    { id: '1', name: 'صندوق A', amount: 50000, roi: 15.5, date: '2025-01-01' },
  ],
  plRecords: [
    { id: '1', month: 'مارس 2026', revenue: 200000, cogs: 80000, opex: 60000 },
  ],
  assets: { current: 300000, fixed: 500000 },
  liabilities: { current: 100000, longTerm: 200000 },
  equity: 500000,
};

export default function Executive() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [state, setState] = useState<AppState>(defaultState);
  const [hasChanged, setHasChanged] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showCashFlowModal, setShowCashFlowModal] = useState(false);
  const [showPLModal, setShowPLModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('exec-os-v2');
    const loggedIn = localStorage.getItem('exec-os-logged-in');
    if (saved) try { setState(JSON.parse(saved)); } catch (e) { }
    if (loggedIn === 'true') setIsLoggedIn(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('exec-os-v2', JSON.stringify(state));
      setHasChanged(false);
    }
  }, [state, isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'soubhi' && password === '123456789') {
      setIsLoggedIn(true);
      localStorage.setItem('exec-os-logged-in', 'true');
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('بيانات الدخول غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('exec-os-logged-in');
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(updater);
    setHasChanged(true);
  };

  const handleAddProject = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', progress: 0, stage: '', blocker: '' });
    setShowProjectModal(true);
  };

  const handleSaveProject = () => {
    if (!formData.name.trim()) return;
    if (editingId) {
      updateState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === editingId ? { ...p, ...formData } : p) }));
    } else {
      updateState(prev => ({ ...prev, projects: [...prev.projects, { id: Date.now().toString(), ...formData } as Project] }));
    }
    setShowProjectModal(false);
    setFormData({});
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      updateState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    }
  };

  const handleAddTask = () => {
    setEditingId(null);
    setFormData({ title: '', quadrant: 'not-urgent-important', assignee: '' });
    setShowTaskModal(true);
  };

  const handleSaveTask = () => {
    if (!formData.title.trim()) return;
    if (editingId) {
      updateState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === editingId ? { ...t, ...formData } : t) }));
    } else {
      updateState(prev => ({ ...prev, tasks: [...prev.tasks, { id: Date.now().toString(), ...formData } as Task] }));
    }
    setShowTaskModal(false);
    setFormData({});
  };

  const handleToggleTask = (id: string, currentQuadrant: string) => {
    const newQuadrant = currentQuadrant === 'done' ? 'not-urgent-important' : 'done';
    updateState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, quadrant: newQuadrant as any } : t) }));
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('حذف المهمة؟')) {
      updateState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    }
  };

  // Keep handleDeleteTask accessible for task cards
  void handleDeleteTask;

  const handleAddEvent = () => {
    setEditingId(null);
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], startTime: '09:00', duration: 60, projectId: '', type: 'اجتماع' });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!formData.title.trim() || !formData.date || !formData.startTime) return;
    if (editingId) {
      updateState(prev => ({ ...prev, events: prev.events.map(e => e.id === editingId ? { ...e, ...formData } : e) }));
    } else {
      updateState(prev => ({ ...prev, events: [...prev.events, { id: Date.now().toString(), ...formData } as CalendarEvent] }));
    }
    setShowEventModal(false);
    setFormData({});
  };

  const handleDeleteEvent = (id: string) => {
    updateState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
  };

  const handleAddTeamMember = () => {
    setEditingId(null);
    setFormData({ name: '', role: '', project: '', performance: 80 });
    setShowTeamModal(true);
  };

  const handleSaveTeamMember = () => {
    if (!formData.name.trim() || !formData.role.trim()) return;
    if (editingId) {
      updateState(prev => ({ ...prev, team: prev.team.map(m => m.id === editingId ? { ...m, ...formData } : m) }));
    } else {
      updateState(prev => ({ ...prev, team: [...prev.team, { id: Date.now().toString(), ...formData } as TeamMember] }));
    }
    setShowTeamModal(false);
    setFormData({});
  };

  const handleDeleteTeamMember = (id: string) => {
    updateState(prev => ({ ...prev, team: prev.team.filter(m => m.id !== id) }));
  };

  const handleAddKPI = () => {
    setEditingId(null);
    setFormData({ name: '', current: 0, target: 0, unit: '' });
    setShowKPIModal(true);
  };

  const handleSaveKPI = () => {
    if (!formData.name.trim()) return;
    if (editingId) {
      updateState(prev => ({ ...prev, kpis: prev.kpis.map(k => k.id === editingId ? { ...k, ...formData } : k) }));
    } else {
      updateState(prev => ({ ...prev, kpis: [...prev.kpis, { id: Date.now().toString(), ...formData } as KPI] }));
    }
    setShowKPIModal(false);
    setFormData({});
  };

  const handleDeleteKPI = (id: string) => {
    updateState(prev => ({ ...prev, kpis: prev.kpis.filter(k => k.id !== id) }));
  };

  const handleAddBudget = () => {
    setEditingId(null);
    setFormData({ name: '', allocated: 0, spent: 0, category: '' });
    setShowBudgetModal(true);
  };

  const handleSaveBudget = () => {
    if (!formData.name.trim()) return;
    if (editingId) {
      updateState(prev => ({ ...prev, budgets: prev.budgets.map(b => b.id === editingId ? { ...b, ...formData } : b) }));
    } else {
      updateState(prev => ({ ...prev, budgets: [...prev.budgets, { id: Date.now().toString(), ...formData } as BudgetItem] }));
    }
    setShowBudgetModal(false);
    setFormData({});
  };

  const handleDeleteBudget = (id: string) => {
    updateState(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
  };

  const handleAddInvestment = () => {
    setEditingId(null);
    setFormData({ name: '', amount: 0, roi: 0, date: new Date().toISOString().split('T')[0] });
    setShowInvestmentModal(true);
  };

  const handleSaveInvestment = () => {
    if (!formData.name.trim()) return;
    if (editingId) {
      updateState(prev => ({ ...prev, investments: prev.investments.map(i => i.id === editingId ? { ...i, ...formData } : i) }));
    } else {
      updateState(prev => ({ ...prev, investments: [...prev.investments, { id: Date.now().toString(), ...formData } as Investment] }));
    }
    setShowInvestmentModal(false);
    setFormData({});
  };

  const handleDeleteInvestment = (id: string) => {
    updateState(prev => ({ ...prev, investments: prev.investments.filter(i => i.id !== id) }));
  };

  const handleAddCashFlow = () => {
    setEditingId(null);
    setFormData({ type: 'inflow', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });
    setShowCashFlowModal(true);
  };

  const handleSaveCashFlow = () => {
    if (!formData.description.trim() || formData.amount === 0) return;
    if (editingId) {
      updateState(prev => ({ ...prev, cashFlows: prev.cashFlows.map(c => c.id === editingId ? { ...c, ...formData } : c) }));
    } else {
      updateState(prev => ({ ...prev, cashFlows: [...prev.cashFlows, { id: Date.now().toString(), ...formData } as CashFlow] }));
    }
    setShowCashFlowModal(false);
    setFormData({});
  };

  const handleDeleteCashFlow = (id: string) => {
    updateState(prev => ({ ...prev, cashFlows: prev.cashFlows.filter(c => c.id !== id) }));
  };

  const handleAddPL = () => {
    setEditingId(null);
    setFormData({ month: '', revenue: 0, cogs: 0, opex: 0 });
    setShowPLModal(true);
  };

  const handleSavePL = () => {
    if (!formData.month.trim()) return;
    if (editingId) {
      updateState(prev => ({ ...prev, plRecords: prev.plRecords.map(p => p.id === editingId ? { ...p, ...formData } : p) }));
    } else {
      updateState(prev => ({ ...prev, plRecords: [...prev.plRecords, { id: Date.now().toString(), ...formData } as PLRecord] }));
    }
    setShowPLModal(false);
    setFormData({});
  };

  const handleDeletePL = (id: string) => {
    updateState(prev => ({ ...prev, plRecords: prev.plRecords.filter(p => p.id !== id) }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#04070f]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚡</div>
          <p className="text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#04070f]">
        <div className="glass-card w-full max-w-md mx-4 p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">⚡</div>
            <h1 className="text-3xl font-bold mb-2">Executive OS</h1>
            <p className="text-slate-400">المنظومة التنفيذية الموحدة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="soubhi" className="apple-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" className="apple-input" />
            </div>
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button type="submit" className="apple-btn w-full">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#04070f] overflow-hidden">
      <div className={`fixed md:relative z-30 h-full transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="glass-card h-full rounded-none border-l border-r-0 overflow-y-auto p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-1"><span>⚡</span> Executive OS</h2>
            <p className="text-xs text-slate-500">المنظومة التنفيذية</p>
          </div>
          <nav className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">الرئيسية</p>
              <div className="space-y-1">
                <div onClick={() => setCurrentPage('dashboard')} className={`sidebar-item ${currentPage === 'dashboard' ? 'active' : ''}`}><span>📊</span><span>لوحة القيادة</span></div>
                <div onClick={() => setCurrentPage('coach')} className={`sidebar-item ${currentPage === 'coach' ? 'active' : ''}`}><span>🤖</span><span>المستشار التنفيذي</span></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">المشاريع والمهام</p>
              <div className="space-y-1">
                <div onClick={() => setCurrentPage('projects')} className={`sidebar-item ${currentPage === 'projects' ? 'active' : ''}`}><span>📋</span><span>المشاريع</span></div>
                <div onClick={() => setCurrentPage('tasks')} className={`sidebar-item ${currentPage === 'tasks' ? 'active' : ''}`}><span>✅</span><span>إدارة المهام</span><span className="ml-auto text-xs bg-blue-500/30 px-2 py-0.5 rounded">{state.tasks.filter(t => t.quadrant !== 'done').length}</span></div>
                <div onClick={() => setCurrentPage('team')} className={`sidebar-item ${currentPage === 'team' ? 'active' : ''}`}><span>👥</span><span>الفريق</span></div>
                <div onClick={() => setCurrentPage('calendar')} className={`sidebar-item ${currentPage === 'calendar' ? 'active' : ''}`}><span>📅</span><span>التقويم</span></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">التحليل والتخطيط</p>
              <div className="space-y-1">
                <div onClick={() => setCurrentPage('kpis')} className={`sidebar-item ${currentPage === 'kpis' ? 'active' : ''}`}><span>📈</span><span>KPIs</span></div>
                <div onClick={() => setCurrentPage('mindmaps')} className={`sidebar-item ${currentPage === 'mindmaps' ? 'active' : ''}`}><span>🧠</span><span>خرائط ذهنية</span></div>
                <div onClick={() => setCurrentPage('feasibility')} className={`sidebar-item ${currentPage === 'feasibility' ? 'active' : ''}`}><span>🎯</span><span>دراسة الجدوى</span></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">الإدارة المالية</p>
              <div className="space-y-1">
                <div onClick={() => setCurrentPage('cashflow')} className={`sidebar-item ${currentPage === 'cashflow' ? 'active' : ''}`}><span>💰</span><span>التدفق النقدي</span></div>
                <div onClick={() => setCurrentPage('budget')} className={`sidebar-item ${currentPage === 'budget' ? 'active' : ''}`}><span>💳</span><span>الميزانية</span></div>
                <div onClick={() => setCurrentPage('pl')} className={`sidebar-item ${currentPage === 'pl' ? 'active' : ''}`}><span>📊</span><span>الأرباح والخسائر</span></div>
                <div onClick={() => setCurrentPage('balancesheet')} className={`sidebar-item ${currentPage === 'balancesheet' ? 'active' : ''}`}><span>📉</span><span>الميزانية العمومية</span></div>
                <div onClick={() => setCurrentPage('ratios')} className={`sidebar-item ${currentPage === 'ratios' ? 'active' : ''}`}><span>🔢</span><span>النسب المالية</span></div>
                <div onClick={() => setCurrentPage('investments')} className={`sidebar-item ${currentPage === 'investments' ? 'active' : ''}`}><span>🔄</span><span>الاستثمارات</span></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">التواصل والوثائق</p>
              <div className="space-y-1">
                <div onClick={() => setCurrentPage('communications')} className={`sidebar-item ${currentPage === 'communications' ? 'active' : ''}`}><span>📱</span><span>مركز التواصل</span></div>
                <div onClick={() => setCurrentPage('documents')} className={`sidebar-item ${currentPage === 'documents' ? 'active' : ''}`}><span>📄</span><span>مولّد الوثائق</span></div>
              </div>
            </div>
            <div><div onClick={() => setCurrentPage('settings')} className={`sidebar-item ${currentPage === 'settings' ? 'active' : ''}`}><span>⚙️</span><span>الإعدادات</span></div></div>
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="glass-card rounded-none border-b border-t-0 border-l-0 border-r-0 px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden apple-btn-secondary px-3">{sidebarOpen ? '✕' : '☰'}</button>
            <div><h1 className="text-xl font-bold flex items-center gap-2"><span>⚡</span> Executive OS</h1><p className="text-xs text-slate-500">المنظومة التنفيذية الموحدة</p></div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            {hasChanged && <div className="text-xs text-yellow-400 flex items-center gap-1"><span className="animate-pulse">💾</span> جاري الحفظ...</div>}
            <button onClick={() => setCurrentPage('settings')} className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30">👤</button>
            <button onClick={handleLogout} className="apple-btn-secondary px-3 lg:px-4 py-2 text-sm">خروج</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <div className="space-y-6 animate-fadeUp">
                <div><h2 className="text-2xl font-bold mb-4">لوحة القيادة</h2></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">المشاريع النشطة</p><p className="text-3xl font-bold">{state.projects.length}</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">المهام العاجلة</p><p className="text-3xl font-bold text-red-400">{state.tasks.filter(t => t.quadrant.includes('urgent') && t.quadrant !== 'done').length}</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">المهام المكتملة</p><p className="text-3xl font-bold text-green-400">{state.tasks.filter(t => t.quadrant === 'done').length}</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">متوسط التقدم</p><p className="text-3xl font-bold text-blue-400">{state.projects.length > 0 ? Math.round(state.projects.reduce((sum, p) => sum + p.progress, 0) / state.projects.length) : 0}%</p></div>
                </div>
                <div className="stat-card-large"><h3 className="text-lg font-semibold mb-4">حالة المشاريع</h3><div className="space-y-3">{state.projects.map(project => (<div key={project.id} className="flex items-center gap-3"><div className="flex-1 min-w-0"><div className="flex justify-between mb-1"><span className="font-medium truncate">{project.name}</span><span className="text-sm text-slate-400">{project.progress}%</span></div><div className="progress-bar"><div className="progress-fill" style={{width: `${project.progress}%`}} /></div></div></div>))}</div></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="stat-card-large"><h3 className="text-lg font-semibold mb-4">🚨 المهام العاجلة</h3><div className="space-y-2 max-h-64 overflow-y-auto">{state.tasks.filter(t => t.quadrant === 'urgent-important').map(task => (<div key={task.id} className="flex items-center gap-2 p-2 bg-red-500/10 rounded border border-red-500/20"><span className="text-red-400">●</span><span className="flex-1">{task.title}</span><span className="text-xs text-slate-400">{task.assignee}</span></div>))}{state.tasks.filter(t => t.quadrant === 'urgent-important').length === 0 && <p className="text-slate-500 text-sm">لا توجد مهام عاجلة</p>}</div></div>
                  <div className="stat-card-large"><h3 className="text-lg font-semibold mb-4">💰 الملخص المالي</h3><div className="space-y-3"><div className="flex justify-between items-center p-3 bg-green-500/10 rounded border border-green-500/20"><span>صافي التدفق النقدي</span><span className="font-bold text-green-400">{fmt(netCF(state.cashFlows))} ر.س</span></div><div className="flex justify-between items-center p-3 bg-blue-500/10 rounded border border-blue-500/20"><span>إجمالي الأصول</span><span className="font-bold text-blue-400">{fmt(totalAssets(state))} ر.س</span></div><div className="flex justify-between items-center p-3 bg-purple-500/10 rounded border border-purple-500/20"><span>هامش EBIT</span><span className="font-bold text-purple-400">{state.plRecords.length > 0 ? pct(state.plRecords[state.plRecords.length - 1].revenue - state.plRecords[state.plRecords.length - 1].cogs - state.plRecords[state.plRecords.length - 1].opex, state.plRecords[state.plRecords.length - 1].revenue) : 0}%</span></div></div></div>
                </div>
                <div className="stat-card-large border-l-4 border-l-yellow-400"><p className="text-sm text-slate-400 mb-2">💡 نصيحة اليوم</p><p className="text-base leading-relaxed">ركز على المهام العاجلة والمهمة. استخدم مصفوفة أيزنهاور للتمييز بين الأولويات الفعلية وتخصيص الموارد بكفاءة.</p></div>
              </div>
            )}

            {currentPage === 'coach' && (
              <div className="space-y-4 animate-fadeUp max-w-2xl">
                <div><h2 className="text-2xl font-bold mb-2">🤖 المستشار التنفيذي</h2><p className="text-slate-400">استشر الذكاء الاصطناعي بشأن مشاريعك وأمورك المالية</p></div>
                <div className="stat-card-large space-y-4"><div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3"><div className="flex justify-end"><div className="bg-blue-600/30 rounded-lg p-3 max-w-xs"><p className="text-sm">مرحبا! أنا المستشار التنفيذي. كيف يمكنني مساعدتك؟</p><p className="text-xs text-slate-400 mt-2">الآن</p></div></div></div><div className="space-y-2"><div className="flex gap-2 flex-wrap"><button className="apple-btn-secondary px-3 py-1.5 text-sm rounded">📊 تحليل الأداء</button><button className="apple-btn-secondary px-3 py-1.5 text-sm rounded">💡 اقتراحات</button><button className="apple-btn-secondary px-3 py-1.5 text-sm rounded">📈 توقعات</button></div></div><div className="flex gap-2"><input type="text" placeholder="اسأل المستشار..." className="apple-input flex-1" /><button className="apple-btn px-4">إرسال</button></div></div>
              </div>
            )}

            {currentPage === 'projects' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">📋 المشاريع</h2><button onClick={handleAddProject} className="apple-btn px-4">+ مشروع جديد</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{state.projects.map(project => (<div key={project.id} className="stat-card-large"><div className="flex items-start justify-between mb-3"><h3 className="font-semibold">{project.name}</h3><button onClick={() => handleDeleteProject(project.id)} className="text-red-400 hover:text-red-300">✕</button></div><p className="text-sm text-slate-400 mb-3">{project.description}</p><div className="space-y-2"><div className="flex justify-between text-sm"><span>التقدم</span><span>{project.progress}%</span></div><div className="progress-bar"><div className="progress-fill" style={{width: `${project.progress}%`}} /></div><div className="flex justify-between text-xs text-slate-400 pt-2"><span>المرحلة: {project.stage}</span>{project.blocker && <span className="text-yellow-400">⚠️ {project.blocker}</span>}</div></div></div>))}</div>
              </div>
            )}

            {currentPage === 'tasks' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">✅ إدارة المهام</h2><button onClick={handleAddTask} className="apple-btn px-4">+ مهمة جديدة</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="stat-card-large border-t-4 border-t-red-500"><h3 className="font-semibold mb-3 text-red-400">العاجلة والمهمة</h3><div className="space-y-2">{state.tasks.filter(t => t.quadrant === 'urgent-important').map(task => (<div key={task.id} className="p-2 bg-red-500/10 rounded border border-red-500/20 cursor-pointer hover:bg-red-500/20" onClick={() => handleToggleTask(task.id, task.quadrant)}><p className="text-sm">{task.title}</p><p className="text-xs text-slate-400 mt-1">{task.assignee}</p></div>))}{state.tasks.filter(t => t.quadrant === 'urgent-important').length === 0 && <p className="text-slate-500 text-sm">لا توجد مهام</p>}</div></div>
                  <div className="stat-card-large border-t-4 border-t-blue-500"><h3 className="font-semibold mb-3 text-blue-400">المهمة فقط</h3><div className="space-y-2">{state.tasks.filter(t => t.quadrant === 'not-urgent-important').map(task => (<div key={task.id} className="p-2 bg-blue-500/10 rounded border border-blue-500/20 cursor-pointer hover:bg-blue-500/20" onClick={() => handleToggleTask(task.id, task.quadrant)}><p className="text-sm">{task.title}</p><p className="text-xs text-slate-400 mt-1">{task.assignee}</p></div>))}{state.tasks.filter(t => t.quadrant === 'not-urgent-important').length === 0 && <p className="text-slate-500 text-sm">لا توجد مهام</p>}</div></div>
                  <div className="stat-card-large border-t-4 border-t-yellow-500"><h3 className="font-semibold mb-3 text-yellow-400">العاجلة فقط</h3><div className="space-y-2">{state.tasks.filter(t => t.quadrant === 'urgent-not-important').map(task => (<div key={task.id} className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20" onClick={() => handleToggleTask(task.id, task.quadrant)}><p className="text-sm">{task.title}</p><p className="text-xs text-slate-400 mt-1">{task.assignee}</p></div>))}{state.tasks.filter(t => t.quadrant === 'urgent-not-important').length === 0 && <p className="text-slate-500 text-sm">لا توجد مهام</p>}</div></div>
                  <div className="stat-card-large border-t-4 border-t-green-500"><h3 className="font-semibold mb-3 text-green-400">مكتملة</h3><div className="space-y-2">{state.tasks.filter(t => t.quadrant === 'done').map(task => (<div key={task.id} className="p-2 bg-green-500/10 rounded border border-green-500/20 cursor-pointer hover:bg-green-500/20 line-through opacity-70" onClick={() => handleToggleTask(task.id, task.quadrant)}><p className="text-sm">{task.title}</p><p className="text-xs text-slate-400 mt-1">{task.assignee}</p></div>))}{state.tasks.filter(t => t.quadrant === 'done').length === 0 && <p className="text-slate-500 text-sm">لا توجد مهام</p>}</div></div>
                </div>
              </div>
            )}

            {currentPage === 'team' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">👥 الفريق</h2><button onClick={handleAddTeamMember} className="apple-btn px-4">+ عضو جديد</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{state.team.map(member => (<div key={member.id} className="stat-card-large"><div className="flex items-start justify-between mb-4"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-blue-500/30 flex items-center justify-center text-lg">👤</div><div><h3 className="font-semibold">{member.name}</h3><p className="text-sm text-slate-400">{member.role}</p></div></div><button onClick={() => handleDeleteTeamMember(member.id)} className="text-red-400 hover:text-red-300">✕</button></div><div className="space-y-2"><div className="flex justify-between text-sm"><span>الأداء</span><span>{member.performance}%</span></div><div className="progress-bar"><div className={`progress-fill ${member.performance >= 90 ? 'success' : ''}`} style={{width: `${member.performance}%`}} /></div><p className="text-xs text-slate-400 pt-2">المشروع: {member.project}</p></div></div>))}</div>
              </div>
            )}

            {currentPage === 'calendar' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">📅 التقويم</h2><button onClick={handleAddEvent} className="apple-btn px-4">+ حدث جديد</button></div>
                <div className="stat-card-large"><div className="overflow-x-auto"><table><thead><tr><th>التاريخ</th><th>الوقت</th><th>العنوان</th><th>المشروع</th><th>النوع</th><th></th></tr></thead><tbody>{state.events.map(event => (<tr key={event.id}><td>{event.date}</td><td>{event.startTime}</td><td>{event.title}</td><td>{event.projectId || '-'}</td><td>{event.type}</td><td><button onClick={() => handleDeleteEvent(event.id)} className="text-red-400 hover:text-red-300">✕</button></td></tr>))}</tbody></table>{state.events.length === 0 && <p className="text-slate-400 text-sm p-4">لا توجد أحداث</p>}</div></div>
              </div>
            )}

            {currentPage === 'kpis' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">📈 KPIs</h2><button onClick={handleAddKPI} className="apple-btn px-4">+ KPI جديد</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{state.kpis.map(kpi => (<div key={kpi.id} className="stat-card-large"><div className="flex items-start justify-between mb-3"><h3 className="font-semibold">{kpi.name}</h3><button onClick={() => handleDeleteKPI(kpi.id)} className="text-red-400 hover:text-red-300">✕</button></div><div className="space-y-3"><div className="flex justify-between items-center"><span className="text-slate-400">الحالي: {kpi.current} {kpi.unit}</span><span className="text-slate-400">الهدف: {kpi.target} {kpi.unit}</span></div><div className="progress-bar"><div className={`progress-fill ${pct(kpi.current, kpi.target) >= 100 ? 'success' : ''}`} style={{width: `${Math.min(pct(kpi.current, kpi.target), 100)}%`}} /></div><p className="text-sm font-semibold text-blue-400">{pct(kpi.current, kpi.target)}%</p></div></div>))}</div>
              </div>
            )}

            {currentPage === 'mindmaps' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">🧠 خرائط ذهنية</h2>
                <div className="grid md:grid-cols-2 gap-4">{state.projects.map(project => (<div key={project.id} className="stat-card-large"><h3 className="font-semibold mb-4">{project.name}</h3><div className="space-y-3"><div className="p-3 bg-blue-500/10 rounded border border-blue-500/20"><p className="text-xs text-slate-400 mb-1">الرسالة</p><p className="text-sm">{project.description}</p></div><div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/20"><p className="text-xs text-slate-400 mb-1">المعيقات</p><p className="text-sm">{project.blocker || 'لا توجد معيقات حالياً'}</p></div><div className="p-3 bg-green-500/10 rounded border border-green-500/20"><p className="text-xs text-slate-400 mb-1">الخطوة التالية</p><p className="text-sm">زيادة التقدم إلى {Math.min(project.progress + 10, 100)}%</p></div><div className="p-3 bg-purple-500/10 rounded border border-purple-500/20"><p className="text-xs text-slate-400 mb-1">التقدم</p><div className="progress-bar mt-2"><div className="progress-fill" style={{width: `${project.progress}%`}} /></div><p className="text-sm font-semibold mt-2">{project.progress}%</p></div></div></div>))}</div>
              </div>
            )}

            {currentPage === 'feasibility' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">🎯 دراسة الجدوى</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="stat-card-large"><h3 className="font-semibold mb-4">💹 حاسبة التعادل</h3><div className="space-y-3"><div><label className="text-sm text-slate-400 block mb-1">التكاليف الثابتة</label><input type="number" placeholder="50000" className="apple-input" /></div><div><label className="text-sm text-slate-400 block mb-1">سعر البيع المتوسط</label><input type="number" placeholder="1000" className="apple-input" /></div><div><label className="text-sm text-slate-400 block mb-1">التكلفة المتغيرة</label><input type="number" placeholder="500" className="apple-input" /></div><button className="apple-btn w-full">حساب</button></div></div>
                  <div className="stat-card-large"><h3 className="font-semibold mb-4">📊 تحليل SWOT</h3><div className="space-y-2 text-sm"><div className="p-2 bg-green-500/10 rounded border border-green-500/20"><p className="font-semibold text-green-400 mb-1">القوة</p><p className="text-slate-300">فريق متخصص ومتجربة</p></div><div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20"><p className="font-semibold text-yellow-400 mb-1">الضعف</p><p className="text-slate-300">محدودية الموارد</p></div><div className="p-2 bg-blue-500/10 rounded border border-blue-500/20"><p className="font-semibold text-blue-400 mb-1">الفرص</p><p className="text-slate-300">توسع السوق والشراكات</p></div><div className="p-2 bg-red-500/10 rounded border border-red-500/20"><p className="font-semibold text-red-400 mb-1">التهديدات</p><p className="text-slate-300">المنافسة المتزايدة</p></div></div></div>
                </div>
              </div>
            )}

            {currentPage === 'cashflow' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">💰 التدفق النقدي</h2><button onClick={handleAddCashFlow} className="apple-btn px-4">+ تدفق جديد</button></div>
                <div className="grid md:grid-cols-3 gap-4"><div className="stat-card"><p className="text-slate-400 text-sm mb-2">الوارد</p><p className="text-2xl font-bold text-green-400">{fmt(totalInflow(state.cashFlows))}</p></div><div className="stat-card"><p className="text-slate-400 text-sm mb-2">الصادر</p><p className="text-2xl font-bold text-red-400">{fmt(totalOutflow(state.cashFlows))}</p></div><div className="stat-card"><p className="text-slate-400 text-sm mb-2">الصافي</p><p className={`text-2xl font-bold ${netCF(state.cashFlows) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(netCF(state.cashFlows))}</p></div></div>
                <div className="stat-card-large overflow-x-auto"><table><thead><tr><th>النوع</th><th>الوصف</th><th>المبلغ</th><th>التاريخ</th><th></th></tr></thead><tbody>{state.cashFlows.map(flow => (<tr key={flow.id}><td><span className={`badge-${flow.type === 'inflow' ? 'success' : 'danger'}`}>{flow.type === 'inflow' ? 'وارد' : 'صادر'}</span></td><td>{flow.description}</td><td className="font-semibold">{fmt(flow.amount)}</td><td>{flow.date}</td><td><button onClick={() => handleDeleteCashFlow(flow.id)} className="text-red-400 hover:text-red-300">✕</button></td></tr>))}</tbody></table></div>
              </div>
            )}

            {currentPage === 'budget' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">💳 الميزانية</h2><button onClick={handleAddBudget} className="apple-btn px-4">+ ميزانية جديدة</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{state.budgets.map(budget => (<div key={budget.id} className="stat-card-large"><div className="flex items-start justify-between mb-3"><div><h3 className="font-semibold">{budget.name}</h3><p className="text-xs text-slate-400">{budget.category}</p></div><button onClick={() => handleDeleteBudget(budget.id)} className="text-red-400 hover:text-red-300">✕</button></div><div className="space-y-2"><div className="flex justify-between text-sm"><span>{fmt(budget.spent)} / {fmt(budget.allocated)}</span><span>{pct(budget.spent, budget.allocated)}%</span></div><div className="progress-bar"><div className={`progress-fill ${pct(budget.spent, budget.allocated) <= 80 ? 'success' : pct(budget.spent, budget.allocated) <= 95 ? 'warning' : 'danger'}`} style={{width: `${Math.min(pct(budget.spent, budget.allocated), 100)}%`}} /></div><p className="text-xs text-slate-400 pt-2">متبقي: {fmt(budget.allocated - budget.spent)}</p></div></div>))}</div>
              </div>
            )}

            {currentPage === 'pl' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">📊 الأرباح والخسائر</h2><button onClick={handleAddPL} className="apple-btn px-4">+ سجل جديد</button></div>
                <div className="stat-card-large overflow-x-auto"><table><thead><tr><th>الشهر</th><th>الإيرادات</th><th>تكلفة البضاعة</th><th>الهامش الإجمالي</th><th>مصاريف التشغيل</th><th>EBIT</th><th>هامش EBIT</th><th></th></tr></thead><tbody>{state.plRecords.map(record => {const grossMargin = record.revenue - record.cogs; const ebit = grossMargin - record.opex; const ebitMargin = pct(ebit, record.revenue); return (<tr key={record.id}><td>{record.month}</td><td>{fmt(record.revenue)}</td><td>{fmt(record.cogs)}</td><td>{fmt(grossMargin)}</td><td>{fmt(record.opex)}</td><td className="font-semibold">{fmt(ebit)}</td><td className="font-semibold text-blue-400">{ebitMargin}%</td><td><button onClick={() => handleDeletePL(record.id)} className="text-red-400 hover:text-red-300">✕</button></td></tr>);})}</tbody></table></div>
              </div>
            )}

            {currentPage === 'balancesheet' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">📉 الميزانية العمومية</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="stat-card-large"><h3 className="font-semibold mb-4 text-blue-400">الأصول</h3><div className="space-y-3"><div className="p-3 bg-blue-500/10 rounded border border-blue-500/20"><p className="text-sm text-slate-400 mb-1">الأصول المتداولة</p><p className="text-xl font-bold">{fmt(state.assets.current)}</p></div><div className="p-3 bg-blue-500/10 rounded border border-blue-500/20"><p className="text-sm text-slate-400 mb-1">الأصول الثابتة</p><p className="text-xl font-bold">{fmt(state.assets.fixed)}</p></div><div className="p-3 bg-blue-600/20 rounded border border-blue-600/40"><p className="text-sm text-slate-400 mb-1">إجمالي الأصول</p><p className="text-2xl font-bold">{fmt(totalAssets(state))}</p></div></div></div>
                  <div className="stat-card-large"><h3 className="font-semibold mb-4 text-red-400">الالتزامات</h3><div className="space-y-3"><div className="p-3 bg-red-500/10 rounded border border-red-500/20"><p className="text-sm text-slate-400 mb-1">الالتزامات المتداولة</p><p className="text-xl font-bold">{fmt(state.liabilities.current)}</p></div><div className="p-3 bg-red-500/10 rounded border border-red-500/20"><p className="text-sm text-slate-400 mb-1">الالتزامات طويلة الأجل</p><p className="text-xl font-bold">{fmt(state.liabilities.longTerm)}</p></div><div className="p-3 bg-red-600/20 rounded border border-red-600/40"><p className="text-sm text-slate-400 mb-1">إجمالي الالتزامات</p><p className="text-2xl font-bold">{fmt(totalLiab(state))}</p></div></div></div>
                  <div className="stat-card-large"><h3 className="font-semibold mb-4 text-green-400">حقوق الملكية</h3><div className="space-y-3"><div className="p-3 bg-green-500/10 rounded border border-green-500/20"><p className="text-sm text-slate-400 mb-1">حقوق الملكية</p><p className="text-xl font-bold">{fmt(state.equity)}</p></div><div className="p-3 bg-green-600/20 rounded border border-green-600/40"><p className="text-sm text-slate-400 mb-1">الإجمالي</p><p className="text-lg font-bold">{fmt(totalAssets(state))} = {fmt(totalLiab(state) + state.equity)}</p></div></div></div>
                </div>
              </div>
            )}

            {currentPage === 'ratios' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">🔢 النسب المالية</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">نسبة السيولة</p><p className="text-3xl font-bold text-blue-400">{(state.assets.current / (state.liabilities.current || 1)).toFixed(2)}</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">نسبة الرافعة</p><p className="text-3xl font-bold text-purple-400">{(totalLiab(state) / (state.equity || 1)).toFixed(2)}</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">العائد على الأصول</p><p className="text-3xl font-bold text-green-400">{state.plRecords.length > 0 ? pct(state.plRecords[state.plRecords.length - 1].revenue - state.plRecords[state.plRecords.length - 1].cogs - state.plRecords[state.plRecords.length - 1].opex, totalAssets(state)) : 0}%</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">العائد على حقوق الملكية</p><p className="text-3xl font-bold text-yellow-400">{state.plRecords.length > 0 ? pct(state.plRecords[state.plRecords.length - 1].revenue - state.plRecords[state.plRecords.length - 1].cogs - state.plRecords[state.plRecords.length - 1].opex, state.equity || 1) : 0}%</p></div>
                </div>
              </div>
            )}

            {currentPage === 'investments' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">🔄 الاستثمارات</h2><button onClick={handleAddInvestment} className="apple-btn px-4">+ استثمار جديد</button></div>
                <div className="stat-card-large overflow-x-auto"><table><thead><tr><th>الاسم</th><th>المبلغ</th><th>العائد على الاستثمار</th><th>التاريخ</th><th>الربح/الخسارة</th><th></th></tr></thead><tbody>{state.investments.map(inv => {const profitLoss = (inv.amount * inv.roi) / 100; return (<tr key={inv.id}><td>{inv.name}</td><td>{fmt(inv.amount)}</td><td className="font-semibold text-green-400">{inv.roi}%</td><td>{inv.date}</td><td className="font-semibold text-green-400">{fmt(profitLoss)}</td><td><button onClick={() => handleDeleteInvestment(inv.id)} className="text-red-400 hover:text-red-300">✕</button></td></tr>);})}</tbody></table></div>
              </div>
            )}

            {currentPage === 'communications' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">📱 مركز التواصل</h2>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">إنشاء رسالة</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">المستقبل</label><input type="text" placeholder="رقم التلجرام أو البريد الإلكتروني" className="apple-input" /></div><div><label className="block text-sm font-medium mb-2">النص</label><textarea placeholder="اكتب رسالتك هنا..." className="apple-input min-h-32" /></div><div className="flex gap-2"><button className="apple-btn flex-1">📱 إرسال عبر التلجرام</button><button className="apple-btn-secondary flex-1">🤖 AI Drafting</button></div></div></div>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">قوالب التلجرام</h3><div className="space-y-2"><button className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">📝 تقرير يومي</button><button className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">📊 إحصائيات الأداء</button><button className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">⚠️ تنبيه عاجل</button></div></div>
              </div>
            )}

            {currentPage === 'documents' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">📄 مولّد الوثائق</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[{name: 'خطة المشروع', emoji: '📋', desc: 'خطة تفصيلية للمشروع'}, {name: 'تقرير الأداء', emoji: '📊', desc: 'تقرير شامل للأداء'}, {name: 'الميزانية', emoji: '💰', desc: 'مستند الميزانية'}, {name: 'اتفاقية', emoji: '📜', desc: 'نموذج اتفاقية'}, {name: 'عرض سعر', emoji: '💼', desc: 'عرض سعر للعملاء'}, {name: 'دراسة جدوى', emoji: '🎯', desc: 'دراسة جدوى المشروع'}].map((doc, idx) => (<div key={idx} className="stat-card-large"><div className="text-3xl mb-2">{doc.emoji}</div><h3 className="font-semibold mb-2">{doc.name}</h3><p className="text-sm text-slate-400 mb-4">{doc.desc}</p><button className="apple-btn w-full">إنشاء 🤖</button></div>))}</div>
              </div>
            )}

            {currentPage === 'settings' && (
              <div className="space-y-6 animate-fadeUp max-w-2xl">
                <h2 className="text-2xl font-bold">⚙️ الإعدادات</h2>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">حساب المستخدم</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">اسم المستخدم</label><input type="text" defaultValue="soubhi" className="apple-input" disabled /></div><div><label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label><input type="password" placeholder="••••••••••" className="apple-input" /></div><button className="apple-btn">تحديث كلمة المرور</button></div></div>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">🔑 إعدادات API</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">مفتاح API</label><p className="text-sm text-slate-400 mb-2">تم حفظ مفتاح API في متغيرات البيئة (Vercel)</p><input type="password" value="••••••••••••••••" className="apple-input" disabled /></div></div></div>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">📱 إعدادات التلجرام</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">رمز بوت التلجرام</label><input type="password" placeholder="123456:ABCdefGHIjklmnoPQRstuvWXYZ" className="apple-input" /></div><div><label className="block text-sm font-medium mb-2">معرف الدردشة</label><input type="text" placeholder="1234567890" className="apple-input" /></div><button className="apple-btn-secondary">اختبار الاتصال</button></div></div>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">💾 إدارة البيانات</h3><div className="space-y-2"><button className="w-full apple-btn-secondary text-right">⬇️ استخراج البيانات</button><button className="w-full apple-btn-secondary text-right">🔄 استيراد البيانات</button><button className="w-full apple-btn-danger text-right">🗑️ حذف جميع البيانات</button></div></div>
                <button onClick={handleLogout} className="w-full apple-btn-danger py-3">تسجيل الخروج</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showProjectModal && (<div className="modal-backdrop" onClick={() => setShowProjectModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير المشروع' : 'مشروع جديد'}</h3><div className="space-y-4"><input type="text" placeholder="اسم المشروع" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="apple-input" /><textarea placeholder="وصف المشروع" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="apple-input min-h-24" /><div><label className="text-sm mb-2 block">التقدم (%)</label><input type="range" min="0" max="100" value={formData.progress || 0} onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})} className="w-full" /><p className="text-sm text-slate-400 mt-1">{formData.progress}%</p></div><input type="text" placeholder="المرحلة" value={formData.stage || ''} onChange={(e) => setFormData({...formData, stage: e.target.value})} className="apple-input" /><input type="text" placeholder="المعيقات (اختياري)" value={formData.blocker || ''} onChange={(e) => setFormData({...formData, blocker: e.target.value})} className="apple-input" /><div className="flex gap-2"><button onClick={handleSaveProject} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowProjectModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}

      {showTaskModal && (<div className="modal-backdrop" onClick={() => setShowTaskModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير المهمة' : 'مهمة جديدة'}</h3><div className="space-y-4"><input type="text" placeholder="عنوان المهمة" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="apple-input" /><select value={formData.quadrant || ''} onChange={(e) => setFormData({...formData, quadrant: e.target.value})} className="apple-input"><option value="urgent-important">عاجلة ومهمة</option><option value="not-urgent-important">مهمة فقط</option><option value="urgent-not-important">عاجلة فقط</option><option value="done">مكتملة</option></select><input type="text" placeholder="المسؤول (اختياري)" value={formData.assignee || ''} onChange={(e) => setFormData({...formData, assignee: e.target.value})} className="apple-input" /><div className="flex gap-2"><button onClick={handleSaveTask} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowTaskModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}

      {showEventModal && (<div className="modal-backdrop" onClick={() => setShowEventModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير الحدث' : 'حدث جديد'}</h3><div className="space-y-4"><input type="text" placeholder="عنوان الحدث" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="apple-input" /><input type="date" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} className="apple-input" /><input type="time" value={formData.startTime || ''} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="apple-input" /><div><label className="text-sm mb-2 block">المدة (دقيقة)</label><input type="number" value={formData.duration || 60} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} className="apple-input" /></div><select value={formData.type || ''} onChange={(e) => setFormData({...formData, type: e.target.value})} className="apple-input"><option value="اجتماع">اجتماع</option><option value="تدريب">تدريب</option><option value="عرض">عرض</option><option value="اخرى">أخرى</option></select><div className="flex gap-2"><button onClick={handleSaveEvent} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowEventModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}

      {showTeamModal && (<div className="modal-backdrop" onClick={() => setShowTeamModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير العضو' : 'عضو جديد'}</h3><div className="space-y-4"><input type="text" placeholder="الاسم الكامل" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="apple-input" /><input type="text" placeholder="الدور الوظيفي" value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} className="apple-input" /><input type="text" placeholder="المشروع" value={formData.project || ''} onChange={(e) => setFormData({...formData, project: e.target.value})} className="apple-input" /><div><label className="text-sm mb-2 block">الأداء (%)</label><input type="range" min="0" max="100" value={formData.performance || 80} onChange={(e) => setFormData({...formData, performance: parseInt(e.target.value)})} className="w-full" /><p className="text-sm text-slate-400 mt-1">{formData.performance}%</p></div><div className="flex gap-2"><button onClick={handleSaveTeamMember} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowTeamModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}

      {showKPIModal && (<div className="modal-backdrop" onClick={() => setShowKPIModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير KPI' : 'KPI جديد'}</h3><div className="space-y-4"><input type="text" placeholder="اسم KPI" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="apple-input" /><input type="number" placeholder="القيمة الحالية" value={formData.current || ''} onChange={(e) => setFormData({...formData, current: parseFloat(e.target.value)})} className="apple-input" /><input type="number" placeholder="القيمة المستهدفة" value={formData.target || ''} onChange={(e) => setFormData({...formData, target: parseFloat(e.target.value)})} className="apple-input" /><input type="text" placeholder="الوحدة" value={formData.unit || ''} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="apple-input" /><div className="flex gap-2"><button onClick={handleSaveKPI} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowKPIModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}

      {showBudgetModal && (<div className="modal-backdrop" onClick={() => setShowBudgetModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير الميزانية' : 'ميزانية جديدة'}</h3><div className="space-y-4"><input type="text" placeholder="اسم الميزانية" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="apple-input" /><input type="number" placeholder="المبلغ المخصص" value={formData.allocated || ''} onChange={(e) => setFormData({...formData, allocated: parseFloat(e.target.value)})} className="apple-input" /><input type="number" placeholder="المبلغ المصروف" value={formData.spent || ''} onChange={(e) => setFormData({...formData, spent: parseFloat(e.target.value)})} className="apple-input" /><input type="text" placeholder="الفئة" value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} className="apple-input" /><div className="flex gap-2"><button onClick={handleSaveBudget} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowBudgetModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}

      {showInvestmentModal && (<div className="modal-backdrop" onClick={() => setShowInvestmentModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير الاستثمار' : 'استثمار جديد'}</h3><div className="space-y-4"><input type="text" placeholder="اسم الاستثمار" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="apple-input" /><input type="number" placeholder="المبلغ" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} className="apple-input" /><input type="number" placeholder="العائد على الاستثمار (%)" value={formData.roi || ''} onChange={(e) => setFormData({...formData, roi: parseFloat(e.target.value)})} className="apple-input" /><input type="date" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} className="apple-input" /><div className="flex gap-2"><button onClick={handleSaveInvestment} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowInvestmentModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}

      {showCashFlowModal && (<div className="modal-backdrop" onClick={() => setShowCashFlowModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير التدفق' : 'تدفق جديد'}</h3><div className="space-y-4"><select value={formData.type || ''} onChange={(e) => setFormData({...formData, type: e.target.value})} className="apple-input"><option value="inflow">وارد</option><option value="outflow">صادر</option></select><input type="text" placeholder="الوصف" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="apple-input" /><input type="number" placeholder="المبلغ" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} className="apple-input" /><input type="date" value={formData.date || ''} onChange={(e) => setFormData({...formData, date: e.target.value})} className="apple-input" /><div className="flex gap-2"><button onClick={handleSaveCashFlow} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowCashFlowModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}

      {showPLModal && (<div className="modal-backdrop" onClick={() => setShowPLModal(false)}><div className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#04070f] glass-card p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير السجل' : 'سجل جديد'}</h3><div className="space-y-4"><input type="text" placeholder="الشهر" value={formData.month || ''} onChange={(e) => setFormData({...formData, month: e.target.value})} className="apple-input" /><input type="number" placeholder="الإيرادات" value={formData.revenue || ''} onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value)})} className="apple-input" /><input type="number" placeholder="تكلفة البضاعة" value={formData.cogs || ''} onChange={(e) => setFormData({...formData, cogs: parseFloat(e.target.value)})} className="apple-input" /><input type="number" placeholder="مصاريف التشغيل" value={formData.opex || ''} onChange={(e) => setFormData({...formData, opex: parseFloat(e.target.value)})} className="apple-input" /><div className="flex gap-2"><button onClick={handleSavePL} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowPLModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div></div></div></div>)}
    </div>
  );
}
