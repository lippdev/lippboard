import React from 'react';
import { 
  Home, 
  Inbox, 
  Activity, 
  Tag, 
  Lightbulb, 
  CheckSquare, 
  Languages, 
  Calendar, 
  Target, 
  GitPullRequest, 
  Folder, 
  Smile, 
  Bot, 
  Settings,
  Search,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeModule, setActiveModule, isOpen, setIsOpen, state, searchQuery, setSearchQuery }) {
  const modulesList = [
    { id: 'thoughts', label: 'Pensamentos', icon: Lightbulb, badge: state.thoughts.length },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, badge: state.tasks.filter(t => t.status === 'a_fazer').length },
    { id: 'languages', label: 'Estudo de Idiomas', icon: Languages, badge: state.languages.todayStudied ? '✓' : '!' },
    { id: 'calendar', label: 'Calendário', icon: Calendar, badge: state.calendar.length },
    { id: 'goals', label: 'Metas', icon: Target, badge: state.goals.length },
    { id: 'github', label: 'GitHub', icon: GitPullRequest, badge: state.github.prs.length },
    { id: 'fileboard', label: 'Arquivos', icon: Folder, badge: state.files?.length || 0 },
    { id: 'mood', label: 'Humor', icon: Smile, badge: `${state.mood.todayScore}/5` },
    { id: 'agentbridge', label: 'Ponte do Subagente', icon: Bot, badge: 'IA' },
  ];

  const navItem = (id, label, Icon, badge) => (
    <button
      key={id}
      className={`nav-item ${activeModule === id ? 'active' : ''}`}
      onClick={() => { setActiveModule(id); setIsOpen(false); }}
    >
      <Icon className="nav-item-icon" />
      <span>{label}</span>
      {badge !== undefined && <span className="nav-badge">{badge}</span>}
    </button>
  );

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div className="sidebar-header">
        <div className="sidebar-header-main">
          <div className="sidebar-logo-icon">L</div>
          <div className="sidebar-brand-text">
            <span>Lipp Board</span>
            <span className="sidebar-version">v0.1 · webOS</span>
          </div>
        </div>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsOpen(false)}
          aria-label="Fechar menu"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="sidebar-search-box">
        <div className="search-input-wrapper sidebar-search-wrapper">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar módulos, notas e tarefas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-scroll">
        <div className="sidebar-quick-actions">
          {navItem('home', 'Início', Home)}
          {navItem('inbox', 'Caixa de Entrada', Inbox)}
          {navItem('activity', 'Atividades', Activity)}
          {navItem('tags', 'Tags', Tag)}
        </div>

        <div className="sidebar-nav-section">
          <div className="nav-section-title">MÓDULOS</div>
          {modulesList.map(({ id, label, icon: Icon, badge }) => navItem(id, label, Icon, badge))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <div className="sidebar-footer-copy">
              <Sparkles size={14} />
              <span>Modo PWA / toque rápido</span>
            </div>
            {navItem('settings', 'Configurações', Settings)}
          </div>
        </div>
      </div>
    </aside>
  );
}
