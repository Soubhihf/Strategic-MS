'use client';
import React, { useState, useEffect, useRef } from 'react';

// TYPES
interface Project {
  id: string;
  icon?: string;
  name: string;
  description: string;
  progress: number;
  stage: string;
  blocker?: string;
  horizon?: string;
  nextAction?: string;
}
interface Task { id: string; title: string; quadrant: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'done'; assignee?: string; }
interface TeamMember { id: string; name: string; role: string; project: string; performance: number; }
interface CalendarEvent { id: string; title: string; date: string; startTime: string; duration: number; projectId?: string; type: string; }
interface KPI { id: string; name: string; current: number; target: number; unit: string; }
interface ChatMessage { role: 'user' | 'assistant'; content: string; }

interface AppState {
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  events: CalendarEvent[];
  kpis: KPI[];
}

const pct = (a: number, b: number): number => (b === 0 ? 0 : Math.round((a / b) * 100));

const defaultState: AppState = {
  projects: [
    { id: '1', icon: '🫘', name: 'غسيل الكلى — دمشق', description: 'توفير محاليل وخراطيش غسيل الكلى بجودة GMP', progress: 15, stage: 'إعادة تشغيل', blocker: 'الترخيص النهائي من وزارة الصحة', horizon: '6-12 شهر', nextAction: 'متابعة ملف الترخيص هذا الأسبوع' },
    { id: '2', icon: '🌍', name: 'غسيل الكلى — إقليمي', description: 'التوسع في عُمان وأفريقيا بخبرة 10 سنوات', progress: 8, stage: 'جاهز للانطلاق', blocker: 'تنسيق التوقيت مع P1', horizon: '6-18 شهر', nextAction: 'تحديد أول عميل عُماني' },
    { id: '3', icon: '🍼', name: 'بيورميل — أغذية أطفال', description: 'تحويل بيورميل لعلامة تصديرية إقليمية', progress: 30, stage: 'أزمة توزيع', blocker: 'غياب قناة توزيع', horizon: '3-6 أشهر', nextAction: 'قائمة 20 موزع إقليمي' },
    { id: '4', icon: '🌽', name: 'توبيكس سناك — البرازيل', description: 'اختراق السوق البرازيلي بسناك متميز', progress: 10, stage: 'بحث موزعين', blocker: 'ANVISA + موزع محلي', horizon: '6-9 أشهر', nextAction: 'الغرفة التجارية العربية البرازيلية' },
    { id: '5', icon: '💎', name: 'Fortrace / BFP — فينتك', description: 'بديل مالي عالمي يتجاوز قيود POU', progress: 5, stage: 'بحث وتطوير', blocker: 'الإطار القانوني + المطور التقني', horizon: '24-36 شهر', nextAction: 'Whitepaper أولي' },
    { id: '6', icon: '🌱', name: 'أسمدة وفوسفات — البرازيل', description: 'تصدير الفوسفات السوري للبرازيل', progress: 5, stage: 'قيد الدراسة', blocker: 'التحقق من الميزة التنافسية', horizon: '12-18 شهر', nextAction: 'تحليل أسعار الفوسفات العالمي' },
  ],
  tasks: [
    { id: '1', title: 'متابعة ملف الترخيص في وزارة الصحة', quadrant: 'urgent-important', assignee: 'أنا' },
    { id: '2', title: 'قائمة 20 موزع إقليمي لبيورميل', quadrant: 'urgent-important', assignee: 'أنا' },
    { id: '3', title: 'التواصل مع الغرفة التجارية العربية البرازيلية', quadrant: 'not-urgent-important', assignee: 'أنا' },
    { id: '4', title: 'تحليل أسعار الفوسفات العالمي', quadrant: 'not-urgent-important', assignee: 'أنا' },
    { id: '5', title: 'تحديد أول عميل عُماني محتمل', quadrant: 'not-urgent-important', assignee: 'أنا' },
    { id: '6', title: 'Whitepaper أولي لـ BFP/Fortrace', quadrant: 'not-urgent-important', assignee: 'أنا' },
  ],
  team: [
    { id: '1', name: 'أحمد الحسن', role: 'مدير الإنتاج', project: 'غسيل الكلى', performance: 85 },
    { id: '2', name: 'سارة نجم', role: 'مديرة التسويق', project: 'بيورميل', performance: 88 },
    { id: '3', name: 'محمد كرمي', role: 'مندوب المبيعات', project: 'توبيكس سناك', performance: 75 },
  ],
  events: [
    { id: '1', title: 'اجتماع مع وزارة الصحة', date: '2026-04-03', startTime: '10:00', duration: 60, projectId: 'غسيل الكلى دمشق', type: 'اجتماع' },
    { id: '2', title: 'جلسة تعمق على الاستراتيجية', date: '2026-04-05', startTime: '14:00', duration: 120, projectId: '', type: 'تخطيط' },
    { id: '3', title: 'مراجعة أسبوعية للمشاريع', date: '2026-04-07', startTime: '09:00', duration: 90, projectId: '', type: 'مراجعة' },
  ],
  kpis: [
    { id: '1', name: 'معدل التوسع الشهري', current: 15, target: 25, unit: '%' },
    { id: '2', name: 'هامش الربح الإجمالي', current: 38, target: 40, unit: '%' },
    { id: '3', name: 'معدل إكمال المشاريع', current: 45, target: 70, unit: '%' },
  ],
};

export default function Executive() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [state, setState] = useState<AppState>(defaultState);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('exec-os-v3');
    const loggedIn = localStorage.getItem('exec-os-logged-in');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...defaultState,
          ...parsed,
          projects: parsed.projects?.length > 0 ? parsed.projects : defaultState.projects,
        }));
      } catch (e) {}
    }
    if (loggedIn === 'true') setIsLoggedIn(true);
    if (window.innerWidth >= 768) setSidebarOpen(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) localStorage.setItem('exec-os-v3', JSON.stringify(state));
  }, [state, isLoggedIn]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const navigate = (page: string) => {
    setCurrentPage(page);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'soubhi' && password === '123456789') {
      setIsLoggedIn(true);
      localStorage.setItem('exec-os-logged-in', 'true');
      setLoginError(''); setUsername(''); setPassword('');
    } else setLoginError('بيانات الدخول غير صحيحة');
  };

  const handleLogout = () => { setIsLoggedIn(false); localStorage.removeItem('exec-os-logged-in'); };
  const updateState = (updater: (prev: AppState) => AppState) => setState(updater);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);
    setChatLoading(true);
    try {
      const projectContext = state.projects.map(p =>
        `${p.icon || ''} ${p.name}: ${p.description} — التقدم: ${p.progress}%${p.blocker ? ' — معيق: ' + p.blocker : ''}`
      ).join('\n');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: chatHistory, projectContext }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply || 'حدث خطأ. حاول مرة أخرى.' }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'تعذّر الاتصال بالمستشار. يرجى المحاولة مرة أخرى.' }]);
    } finally { setChatLoading(false); }
  };

  // Project handlers
  const handleAddProject = () => { setEditingId(null); setFormData({ icon: '', name: '', description: '', progress: 0, stage: '', blocker: '', horizon: '', nextAction: '' }); setShowProjectModal(true); };
  const handleEditProject = (p: Project) => { setEditingId(p.id); setFormData({ ...p }); setShowProjectModal(true); };
  const handleSaveProject = () => {
    if (!formData.name?.trim()) return;
    if (editingId) updateState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === editingId ? { ...p, ...formData } : p) }));
    else updateState(prev => ({ ...prev, projects: [...prev.projects, { id: Date.now().toString(), ...formData } as Project] }));
    setShowProjectModal(false); setFormData({});
  };
  const handleDeleteProject = (id: string) => { if (confirm('حذف المشروع؟')) updateState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) })); };

  // Task handlers
  const handleAddTask = () => { setEditingId(null); setFormData({ title: '', quadrant: 'not-urgent-important', assignee: '' }); setShowTaskModal(true); };
  const handleSaveTask = () => {
    if (!formData.title?.trim()) return;
    if (editingId) updateState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === editingId ? { ...t, ...formData } : t) }));
    else updateState(prev => ({ ...prev, tasks: [...prev.tasks, { id: Date.now().toString(), ...formData } as Task] }));
    setShowTaskModal(false); setFormData({});
  };
  const handleToggleTask = (id: string, q: string) => { const nq = q === 'done' ? 'not-urgent-important' : 'done'; updateState(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, quadrant: nq as Task['quadrant'] } : t) })); };
  const handleDeleteTask = (id: string) => { if (confirm('حذف المهمة؟')) updateState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) })); };

  // Event handlers
  const handleAddEvent = () => { setEditingId(null); setFormData({ title: '', date: new Date().toISOString().split('T')[0], startTime: '09:00', duration: 60, projectId: '', type: 'اجتماع' }); setShowEventModal(true); };
  const handleSaveEvent = () => {
    if (!formData.title?.trim()) return;
    if (editingId) updateState(prev => ({ ...prev, events: prev.events.map(e => e.id === editingId ? { ...e, ...formData } : e) }));
    else updateState(prev => ({ ...prev, events: [...prev.events, { id: Date.now().toString(), ...formData } as CalendarEvent] }));
    setShowEventModal(false); setFormData({});
  };
  const handleDeleteEvent = (id: string) => updateState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));

  // Team handlers
  const handleAddTeamMember = () => { setEditingId(null); setFormData({ name: '', role: '', project: '', performance: 80 }); setShowTeamModal(true); };
  const handleSaveTeamMember = () => {
    if (!formData.name?.trim()) return;
    if (editingId) updateState(prev => ({ ...prev, team: prev.team.map(m => m.id === editingId ? { ...m, ...formData } : m) }));
    else updateState(prev => ({ ...prev, team: [...prev.team, { id: Date.now().toString(), ...formData } as TeamMember] }));
    setShowTeamModal(false); setFormData({});
  };
  const handleDeleteTeamMember = (id: string) => updateState(prev => ({ ...prev, team: prev.team.filter(m => m.id !== id) }));

  // KPI handlers
  const handleAddKPI = () => { setEditingId(null); setFormData({ name: '', current: 0, target: 0, unit: '' }); setShowKPIModal(true); };
  const handleSaveKPI = () => {
    if (!formData.name?.trim()) return;
    if (editingId) updateState(prev => ({ ...prev, kpis: prev.kpis.map(k => k.id === editingId ? { ...k, ...formData } : k) }));
    else updateState(prev => ({ ...prev, kpis: [...prev.kpis, { id: Date.now().toString(), ...formData } as KPI] }));
    setShowKPIModal(false); setFormData({});
  };
  const handleDeleteKPI = (id: string) => updateState(prev => ({ ...prev, kpis: prev.kpis.filter(k => k.id !== id) }));

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#04070f]">
      <div className="text-center"><div className="text-4xl mb-4 animate-spin">⚡</div><p className="text-slate-400">جاري التحميل...</p></div>
    </div>
  );

  if (!isLoggedIn) return (
    <div className="flex items-center justify-center min-h-screen bg-[#04070f]">
      <div className="glass-card w-full max-w-md mx-4 p-8">
        <div className="text-center mb-8"><div className="text-5xl mb-4">⚡</div><h1 className="text-3xl font-bold mb-2">Executive OS</h1><p className="text-slate-400">المنظومة التنفيذية الموحدة</p></div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">اسم المستخدم</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="soubhi" className="apple-input" /></div>
          <div><label className="block text-sm font-medium mb-2">كلمة المرور</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" className="apple-input" /></div>
          {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
          <button type="submit" className="apple-btn w-full">دخول</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#04070f] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <div className={`fixed md:relative z-30 h-full transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="glass-card h-full rounded-none border-l border-r-0 overflow-y-auto p-4 w-64">
          <div className="mb-8"><h2 className="text-xl font-bold flex items-center gap-2 mb-1"><span>⚡</span> Executive OS</h2><p className="text-xs text-slate-500">المنظومة التنفيذية</p></div>
          <nav className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">الرئيسية</p>
              <div className="space-y-1">
                <div onClick={() => navigate('dashboard')} className={`sidebar-item ${currentPage === 'dashboard' ? 'active' : ''}`}><span>📊</span><span>لوحة القيادة</span></div>
                <div onClick={() => navigate('coach')} className={`sidebar-item ${currentPage === 'coach' ? 'active' : ''}`}><span>🤖</span><span>المستشار التنفيذي</span></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">المشاريع والمهام</p>
              <div className="space-y-1">
                <div onClick={() => navigate('projects')} className={`sidebar-item ${currentPage === 'projects' ? 'active' : ''}`}><span>📋</span><span>المشاريع</span></div>
                <div onClick={() => navigate('tasks')} className={`sidebar-item ${currentPage === 'tasks' ? 'active' : ''}`}><span>✅</span><span>إدارة المهام</span><span className="mr-auto text-xs bg-blue-500/30 px-2 py-0.5 rounded">{state.tasks.filter(t => t.quadrant !== 'done').length}</span></div>
                <div onClick={() => navigate('team')} className={`sidebar-item ${currentPage === 'team' ? 'active' : ''}`}><span>👥</span><span>الفريق</span></div>
                <div onClick={() => navigate('calendar')} className={`sidebar-item ${currentPage === 'calendar' ? 'active' : ''}`}><span>📅</span><span>التقويم</span></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">التحليل والتخطيط</p>
              <div className="space-y-1">
                <div onClick={() => navigate('kpis')} className={`sidebar-item ${currentPage === 'kpis' ? 'active' : ''}`}><span>📈</span><span>KPIs</span></div>
                <div onClick={() => navigate('mindmaps')} className={`sidebar-item ${currentPage === 'mindmaps' ? 'active' : ''}`}><span>🧠</span><span>خرائط ذهنية</span></div>
                <div onClick={() => navigate('feasibility')} className={`sidebar-item ${currentPage === 'feasibility' ? 'active' : ''}`}><span>🎯</span><span>دراسة الجدوى</span></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">التواصل والوثائق</p>
              <div className="space-y-1">
                <div onClick={() => navigate('communications')} className={`sidebar-item ${currentPage === 'communications' ? 'active' : ''}`}><span>📱</span><span>مركز التواصل</span></div>
                <div onClick={() => navigate('documents')} className={`sidebar-item ${currentPage === 'documents' ? 'active' : ''}`}><span>📄</span><span>مولّد الوثائق</span></div>
              </div>
            </div>
            <div><div onClick={() => navigate('settings')} className={`sidebar-item ${currentPage === 'settings' ? 'active' : ''}`}><span>⚙️</span><span>الإعدادات</span></div></div>
          </nav>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="glass-card rounded-none border-b border-t-0 border-l-0 border-r-0 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="apple-btn-secondary px-3 py-2">{sidebarOpen ? '✕' : '☰'}</button>
            <div><h1 className="text-xl font-bold flex items-center gap-2"><span>⚡</span> Executive OS</h1><p className="text-xs text-slate-500">المنظومة التنفيذية الموحدة</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('settings')} className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30">👤</button>
            <button onClick={handleLogout} className="apple-btn-secondary px-3 py-2 text-sm">خروج</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">

            {currentPage === 'dashboard' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">لوحة القيادة</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">المشاريع النشطة</p><p className="text-3xl font-bold">{state.projects.length}</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">المهام العاجلة</p><p className="text-3xl font-bold text-red-400">{state.tasks.filter(t => t.quadrant.includes('urgent') && t.quadrant !== 'done').length}</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">المهام المكتملة</p><p className="text-3xl font-bold text-green-400">{state.tasks.filter(t => t.quadrant === 'done').length}</p></div>
                  <div className="stat-card"><p className="text-slate-400 text-sm mb-2">متوسط التقدم</p><p className="text-3xl font-bold text-blue-400">{state.projects.length > 0 ? Math.round(state.projects.reduce((s, p) => s + p.progress, 0) / state.projects.length) : 0}%</p></div>
                </div>
                <div className="stat-card-large">
                  <h3 className="text-lg font-semibold mb-4">حالة المشاريع</h3>
                  <div className="space-y-3">
                    {state.projects.map(p => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-xl">{p.icon || '📋'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1"><span className="font-medium truncate">{p.name}</span><span className="text-sm text-slate-400 mr-2">{p.progress}%</span></div>
                          <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="stat-card-large">
                    <h3 className="text-lg font-semibold mb-4">🚨 المهام العاجلة</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {state.tasks.filter(t => t.quadrant === 'urgent-important').map(t => (
                        <div key={t.id} className="flex items-center gap-2 p-2 bg-red-500/10 rounded border border-red-500/20"><span className="text-red-400">●</span><span className="flex-1">{t.title}</span><span className="text-xs text-slate-400">{t.assignee}</span></div>
                      ))}
                      {state.tasks.filter(t => t.quadrant === 'urgent-important').length === 0 && <p className="text-slate-500 text-sm">لا توجد مهام عاجلة</p>}
                    </div>
                  </div>
                  <div className="stat-card-large">
                    <h3 className="text-lg font-semibold mb-4">⚠️ معيقات المشاريع</h3>
                    <div className="space-y-2">
                      {state.projects.filter(p => p.blocker).map(p => (
                        <div key={p.id} className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                          <span>{p.icon || '📋'}</span>
                          <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-yellow-400">⚠️ {p.blocker}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="stat-card-large border-r-4 border-r-yellow-400"><p className="text-sm text-slate-400 mb-2">💡 نصيحة اليوم</p><p className="text-base leading-relaxed">ركز على المهام العاجلة والمهمة. استخدم مصفوفة أيزنهاور للتمييز بين الأولويات الفعلية وتخصيص الموارد بكفاءة.</p></div>
              </div>
            )}

            {currentPage === 'coach' && (
              <div className="space-y-4 animate-fadeUp max-w-2xl">
                <div><h2 className="text-2xl font-bold mb-2">🤖 المستشار التنفيذي</h2><p className="text-slate-400">استشر الذكاء الاصطناعي بشأن مشاريعك واستراتيجيتك</p></div>
                <div className="stat-card-large space-y-4">
                  <div className="bg-black/20 border border-white/10 rounded-lg p-4 min-h-48 max-h-96 overflow-y-auto space-y-3 flex flex-col">
                    {chatHistory.length === 0 && (
                      <div className="flex justify-start"><div className="bg-white/10 rounded-lg p-3 max-w-xs"><p className="text-sm">مرحبا! أنا المستشار التنفيذي. كيف يمكنني مساعدتك اليوم؟</p></div></div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg p-3 max-w-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600/40' : 'bg-white/10'}`}>{msg.content}</div>
                      </div>
                    ))}
                    {chatLoading && <div className="flex justify-start"><div className="bg-white/10 rounded-lg p-3"><span className="text-sm text-slate-400 animate-pulse">يفكر المستشار...</span></div></div>}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setChatInput('حلل وضع مشاريعي الحالية وأعطني أولوياتك')} className="apple-btn-secondary px-3 py-1.5 text-sm">📊 تحليل الأداء</button>
                    <button onClick={() => setChatInput('ما هي أهم الإجراءات التي يجب اتخاذها هذا الأسبوع؟')} className="apple-btn-secondary px-3 py-1.5 text-sm">💡 اقتراحات</button>
                    <button onClick={() => setChatInput('كيف يمكنني تسريع التقدم في المشاريع المتعثرة؟')} className="apple-btn-secondary px-3 py-1.5 text-sm">🚀 تسريع المشاريع</button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder="اسأل المستشار..." className="apple-input flex-1" disabled={chatLoading} />
                    <button onClick={handleSendMessage} disabled={chatLoading || !chatInput.trim()}
                      className="apple-btn px-4 disabled:opacity-50 disabled:cursor-not-allowed">
                      {chatLoading ? '⏳' : 'إرسال'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'projects' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">📋 المشاريع</h2><button onClick={handleAddProject} className="apple-btn px-4">+ مشروع جديد</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.projects.map(p => (
                    <div key={p.id} className="stat-card-large flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2"><span className="text-2xl">{p.icon || '📋'}</span><h3 className="font-semibold leading-tight">{p.name}</h3></div>
                        <div className="flex gap-1 flex-shrink-0"><button onClick={() => handleEditProject(p)} className="text-blue-400 hover:text-blue-300">✏️</button><button onClick={() => handleDeleteProject(p.id)} className="text-red-400 hover:text-red-300">✕</button></div>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{p.description}</p>
                      <div className="space-y-2 mt-auto">
                        <div className="flex justify-between text-sm"><span>التقدم</span><span>{p.progress}%</span></div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                        <div className="flex justify-between text-xs text-slate-400 pt-1">
                          <span className="bg-white/10 px-2 py-0.5 rounded">{p.stage}</span>
                          {p.horizon && <span className="text-blue-400">{p.horizon}</span>}
                        </div>
                        {p.blocker && <p className="text-xs text-yellow-400">⚠️ {p.blocker}</p>}
                        {p.nextAction && <p className="text-xs text-green-400">→ {p.nextAction}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'tasks' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">✅ إدارة المهام</h2><button onClick={handleAddTask} className="apple-btn px-4">+ مهمة جديدة</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {([
                    ['urgent-important','العاجلة والمهمة','red'],
                    ['not-urgent-important','المهمة فقط','blue'],
                    ['urgent-not-important','العاجلة فقط','yellow'],
                    ['done','مكتملة','green']
                  ] as [Task['quadrant'],string,string][]).map(([q,label,c]) => (
                    <div key={q} className={`stat-card-large border-t-4 border-t-${c}-500`}>
                      <h3 className={`font-semibold mb-3 text-${c}-400`}>{label}</h3>
                      <div className="space-y-2">
                        {state.tasks.filter(t => t.quadrant === q).map(task => (
                          <div key={task.id} className={`p-2 bg-${c}-500/10 rounded border border-${c}-500/20 cursor-pointer hover:bg-${c}-500/20 ${q==='done'?'line-through opacity-70':''}`} onClick={() => handleToggleTask(task.id, task.quadrant)}>
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-sm flex-1">{task.title}</p>
                              <button onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }} className="text-red-400/60 hover:text-red-400 text-xs flex-shrink-0">✕</button>
                            </div>
                            {task.assignee && <p className="text-xs text-slate-400 mt-1">{task.assignee}</p>}
                          </div>
                        ))}
                        {state.tasks.filter(t => t.quadrant === q).length === 0 && <p className="text-slate-500 text-sm">لا توجد مهام</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'team' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">👥 الفريق</h2><button onClick={handleAddTeamMember} className="apple-btn px-4">+ عضو جديد</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.team.map(m => (
                    <div key={m.id} className="stat-card-large">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-lg bg-blue-500/30 flex items-center justify-center text-lg">👤</div><div><h3 className="font-semibold">{m.name}</h3><p className="text-sm text-slate-400">{m.role}</p></div></div>
                        <button onClick={() => handleDeleteTeamMember(m.id)} className="text-red-400 hover:text-red-300">✕</button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span>الأداء</span><span>{m.performance}%</span></div>
                        <div className="progress-bar"><div className={`progress-fill ${m.performance >= 90 ? 'success' : ''}`} style={{ width: `${m.performance}%` }} /></div>
                        <p className="text-xs text-slate-400 pt-2">المشروع: {m.project}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'calendar' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">📅 التقويم</h2><button onClick={handleAddEvent} className="apple-btn px-4">+ حدث جديد</button></div>
                <div className="stat-card-large overflow-x-auto">
                  <table><thead><tr><th>التاريخ</th><th>الوقت</th><th>العنوان</th><th>النوع</th><th></th></tr></thead>
                  <tbody>{state.events.sort((a,b) => a.date.localeCompare(b.date)).map(ev => (
                    <tr key={ev.id}><td>{ev.date}</td><td>{ev.startTime}</td><td>{ev.title}</td><td>{ev.type}</td><td><button onClick={() => handleDeleteEvent(ev.id)} className="text-red-400 hover:text-red-300">✕</button></td></tr>
                  ))}</tbody></table>
                  {state.events.length === 0 && <p className="text-slate-400 text-sm p-4">لا توجد أحداث</p>}
                </div>
              </div>
            )}

            {currentPage === 'kpis' && (
              <div className="space-y-6 animate-fadeUp">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">📈 KPIs</h2><button onClick={handleAddKPI} className="apple-btn px-4">+ KPI جديد</button></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.kpis.map(k => (
                    <div key={k.id} className="stat-card-large">
                      <div className="flex items-start justify-between mb-3"><h3 className="font-semibold">{k.name}</h3><button onClick={() => handleDeleteKPI(k.id)} className="text-red-400 hover:text-red-300">✕</button></div>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-slate-400">الحالي: {k.current} {k.unit}</span><span className="text-slate-400">الهدف: {k.target} {k.unit}</span></div>
                        <div className="progress-bar"><div className={`progress-fill ${pct(k.current,k.target)>=100?'success':''}`} style={{ width: `${Math.min(pct(k.current,k.target),100)}%` }} /></div>
                        <p className="text-sm font-semibold text-blue-400">{pct(k.current,k.target)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'mindmaps' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">🧠 خرائط ذهنية</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {state.projects.map(p => (
                    <div key={p.id} className="stat-card-large">
                      <div className="flex items-center gap-2 mb-4"><span className="text-2xl">{p.icon||'📋'}</span><h3 className="font-semibold">{p.name}</h3></div>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20"><p className="text-xs text-slate-400 mb-1">الرسالة</p><p className="text-sm">{p.description}</p></div>
                        {p.horizon && <div className="p-3 bg-purple-500/10 rounded border border-purple-500/20"><p className="text-xs text-slate-400 mb-1">الأفق الزمني</p><p className="text-sm">{p.horizon}</p></div>}
                        {p.blocker && <div className="p-3 bg-yellow-500/10 rounded border border-yellow-500/20"><p className="text-xs text-slate-400 mb-1">المعيقات</p><p className="text-sm">{p.blocker}</p></div>}
                        {p.nextAction && <div className="p-3 bg-green-500/10 rounded border border-green-500/20"><p className="text-xs text-slate-400 mb-1">الخطوة التالية</p><p className="text-sm">{p.nextAction}</p></div>}
                        <div className="p-3 bg-white/5 rounded"><p className="text-xs text-slate-400 mb-1">التقدم</p><div className="progress-bar mt-1"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div><p className="text-sm font-semibold mt-1">{p.progress}%</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'feasibility' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">🎯 دراسة الجدوى</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="stat-card-large"><h3 className="font-semibold mb-4">💹 حاسبة التعادل</h3><div className="space-y-3"><div><label className="text-sm text-slate-400 block mb-1">التكاليف الثابتة</label><input type="number" placeholder="50000" className="apple-input" /></div><div><label className="text-sm text-slate-400 block mb-1">سعر البيع المتوسط</label><input type="number" placeholder="1000" className="apple-input" /></div><div><label className="text-sm text-slate-400 block mb-1">التكلفة المتغيرة</label><input type="number" placeholder="500" className="apple-input" /></div><button className="apple-btn w-full">حساب</button></div></div>
                  <div className="stat-card-large"><h3 className="font-semibold mb-4">📊 تحليل SWOT</h3><div className="space-y-2 text-sm"><div className="p-2 bg-green-500/10 rounded border border-green-500/20"><p className="font-semibold text-green-400 mb-1">القوة</p><p>فريق متخصص وخبرة 10 سنوات</p></div><div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20"><p className="font-semibold text-yellow-400 mb-1">الضعف</p><p>محدودية الموارد والتراخيص</p></div><div className="p-2 bg-blue-500/10 rounded border border-blue-500/20"><p className="font-semibold text-blue-400 mb-1">الفرص</p><p>أسواق إقليمية ودولية ناشئة</p></div><div className="p-2 bg-red-500/10 rounded border border-red-500/20"><p className="font-semibold text-red-400 mb-1">التهديدات</p><p>المنافسة والتعقيدات التنظيمية</p></div></div></div>
                </div>
              </div>
            )}

            {currentPage === 'communications' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">📱 مركز التواصل</h2>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">إنشاء رسالة</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">المستقبل</label><input type="text" placeholder="رقم التلجرام" className="apple-input" /></div><div><label className="block text-sm font-medium mb-2">النص</label><textarea placeholder="اكتب رسالتك هنا..." className="apple-input min-h-32" /></div><div className="flex gap-2"><button className="apple-btn flex-1">📱 إرسال عبر التلجرام</button><button className="apple-btn-secondary flex-1">🤖 AI Drafting</button></div></div></div>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">قوالب التلجرام</h3><div className="space-y-2"><button className="w-full text-right p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">📝 تقرير يومي</button><button className="w-full text-right p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">📊 إحصائيات الأداء</button><button className="w-full text-right p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition">⚠️ تنبيه عاجل</button></div></div>
              </div>
            )}

            {currentPage === 'documents' && (
              <div className="space-y-6 animate-fadeUp">
                <h2 className="text-2xl font-bold">📄 مولّد الوثائق</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[{n:'خطة المشروع',e:'📋',d:'خطة تفصيلية للمشروع'},{n:'تقرير الأداء',e:'📊',d:'تقرير شامل للأداء'},{n:'اتفاقية',e:'📜',d:'نموذج اتفاقية'},{n:'عرض سعر',e:'💼',d:'عرض سعر للعملاء'},{n:'دراسة جدوى',e:'🎯',d:'دراسة جدوى المشروع'},{n:'خطة تسويق',e:'📣',d:'خطة تسويقية مفصلة'}].map((doc,i) => (
                    <div key={i} className="stat-card-large"><div className="text-3xl mb-2">{doc.e}</div><h3 className="font-semibold mb-2">{doc.n}</h3><p className="text-sm text-slate-400 mb-4">{doc.d}</p><button className="apple-btn w-full">إنشاء 🤖</button></div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'settings' && (
              <div className="space-y-6 animate-fadeUp max-w-2xl">
                <h2 className="text-2xl font-bold">⚙️ الإعدادات</h2>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">حساب المستخدم</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">اسم المستخدم</label><input type="text" defaultValue="soubhi" className="apple-input" disabled /></div><div><label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label><input type="password" placeholder="••••••••••" className="apple-input" /></div><button className="apple-btn">تحديث</button></div></div>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">🔑 إعدادات API</h3><p className="text-sm text-slate-400 mb-3">تم حفظ مفتاح API في متغيرات البيئة (Vercel)</p><input type="password" value="••••••••••••••••" className="apple-input" disabled /></div>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">📱 إعدادات التلجرام</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">رمز بوت التلجرام</label><input type="password" placeholder="123456:ABC..." className="apple-input" /></div><div><label className="block text-sm font-medium mb-2">معرف الدردشة</label><input type="text" placeholder="1234567890" className="apple-input" /></div><button className="apple-btn-secondary">اختبار الاتصال</button></div></div>
                <div className="stat-card-large"><h3 className="font-semibold mb-4">💾 إدارة البيانات</h3><div className="space-y-2"><button className="w-full apple-btn-secondary text-right">⬇️ استخراج البيانات</button><button className="w-full apple-btn-secondary text-right">🔄 استيراد البيانات</button><button onClick={() => { if(confirm('حذف جميع البيانات؟')) { setState(defaultState); localStorage.removeItem('exec-os-v3'); }}} className="w-full apple-btn-danger text-right">🗑️ حذف جميع البيانات</button></div></div>
                <button onClick={handleLogout} className="w-full apple-btn-danger py-3">تسجيل الخروج</button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MODALS — centered with flexbox */}
      {showProjectModal && (
        <div className="modal-backdrop flex items-center justify-center p-4" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content w-full max-w-md bg-[#0d1525] glass-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير المشروع' : 'مشروع جديد'}</h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              <input type="text" placeholder="رمز (emoji)" value={formData.icon||''} onChange={e => setFormData({...formData,icon:e.target.value})} className="apple-input" />
              <input type="text" placeholder="اسم المشروع *" value={formData.name||''} onChange={e => setFormData({...formData,name:e.target.value})} className="apple-input" />
              <textarea placeholder="الوصف / الرسالة" value={formData.description||''} onChange={e => setFormData({...formData,description:e.target.value})} className="apple-input min-h-20" />
              <div><label className="text-sm mb-1 block text-slate-400">التقدم: {formData.progress||0}%</label><input type="range" min="0" max="100" value={formData.progress||0} onChange={e => setFormData({...formData,progress:parseInt(e.target.value)})} className="w-full" /></div>
              <input type="text" placeholder="المرحلة" value={formData.stage||''} onChange={e => setFormData({...formData,stage:e.target.value})} className="apple-input" />
              <input type="text" placeholder="الأفق الزمني (مثال: 6-12 شهر)" value={formData.horizon||''} onChange={e => setFormData({...formData,horizon:e.target.value})} className="apple-input" />
              <input type="text" placeholder="المعيقات" value={formData.blocker||''} onChange={e => setFormData({...formData,blocker:e.target.value})} className="apple-input" />
              <input type="text" placeholder="الخطوة التالية" value={formData.nextAction||''} onChange={e => setFormData({...formData,nextAction:e.target.value})} className="apple-input" />
              <div className="flex gap-2 pt-2"><button onClick={handleSaveProject} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowProjectModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-backdrop flex items-center justify-center p-4" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content w-full max-w-md bg-[#0d1525] glass-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير المهمة' : 'مهمة جديدة'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="عنوان المهمة *" value={formData.title||''} onChange={e => setFormData({...formData,title:e.target.value})} className="apple-input" />
              <select value={formData.quadrant||''} onChange={e => setFormData({...formData,quadrant:e.target.value})} className="apple-input">
                <option value="urgent-important">عاجلة ومهمة</option><option value="not-urgent-important">مهمة فقط</option><option value="urgent-not-important">عاجلة فقط</option><option value="done">مكتملة</option>
              </select>
              <input type="text" placeholder="المسؤول (اختياري)" value={formData.assignee||''} onChange={e => setFormData({...formData,assignee:e.target.value})} className="apple-input" />
              <div className="flex gap-2"><button onClick={handleSaveTask} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowTaskModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="modal-backdrop flex items-center justify-center p-4" onClick={() => setShowEventModal(false)}>
          <div className="modal-content w-full max-w-md bg-[#0d1525] glass-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير الحدث' : 'حدث جديد'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="عنوان الحدث *" value={formData.title||''} onChange={e => setFormData({...formData,title:e.target.value})} className="apple-input" />
              <input type="date" value={formData.date||''} onChange={e => setFormData({...formData,date:e.target.value})} className="apple-input" />
              <input type="time" value={formData.startTime||''} onChange={e => setFormData({...formData,startTime:e.target.value})} className="apple-input" />
              <select value={formData.type||''} onChange={e => setFormData({...formData,type:e.target.value})} className="apple-input">
                <option value="اجتماع">اجتماع</option><option value="تدريب">تدريب</option><option value="تخطيط">تخطيط</option><option value="مراجعة">مراجعة</option><option value="أخرى">أخرى</option>
              </select>
              <div className="flex gap-2"><button onClick={handleSaveEvent} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowEventModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

      {showTeamModal && (
        <div className="modal-backdrop flex items-center justify-center p-4" onClick={() => setShowTeamModal(false)}>
          <div className="modal-content w-full max-w-md bg-[#0d1525] glass-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير العضو' : 'عضو جديد'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="الاسم الكامل *" value={formData.name||''} onChange={e => setFormData({...formData,name:e.target.value})} className="apple-input" />
              <input type="text" placeholder="الدور الوظيفي *" value={formData.role||''} onChange={e => setFormData({...formData,role:e.target.value})} className="apple-input" />
              <input type="text" placeholder="المشروع" value={formData.project||''} onChange={e => setFormData({...formData,project:e.target.value})} className="apple-input" />
              <div><label className="text-sm mb-1 block text-slate-400">الأداء: {formData.performance||80}%</label><input type="range" min="0" max="100" value={formData.performance||80} onChange={e => setFormData({...formData,performance:parseInt(e.target.value)})} className="w-full" /></div>
              <div className="flex gap-2"><button onClick={handleSaveTeamMember} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowTeamModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

      {showKPIModal && (
        <div className="modal-backdrop flex items-center justify-center p-4" onClick={() => setShowKPIModal(false)}>
          <div className="modal-content w-full max-w-md bg-[#0d1525] glass-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{editingId ? 'تحرير KPI' : 'KPI جديد'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="اسم KPI *" value={formData.name||''} onChange={e => setFormData({...formData,name:e.target.value})} className="apple-input" />
              <input type="number" placeholder="القيمة الحالية" value={formData.current||''} onChange={e => setFormData({...formData,current:parseFloat(e.target.value)})} className="apple-input" />
              <input type="number" placeholder="القيمة المستهدفة" value={formData.target||''} onChange={e => setFormData({...formData,target:parseFloat(e.target.value)})} className="apple-input" />
              <input type="text" placeholder="الوحدة (مثال: %، ر.س)" value={formData.unit||''} onChange={e => setFormData({...formData,unit:e.target.value})} className="apple-input" />
              <div className="flex gap-2"><button onClick={handleSaveKPI} className="apple-btn flex-1">حفظ</button><button onClick={() => setShowKPIModal(false)} className="apple-btn-secondary flex-1">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
