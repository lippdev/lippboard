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
  X
} from 'lucide-react';

export default function Sidebar({ activeModule, setActiveModule, isOpen, setIsOpen, state, searchQuery, setSearchQuery }) {
  const modulesList = [
    { id: 'thoughts', label: 'Pensamentos', icon: Lightbulb, badge: state.thoughts.length },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, badge: state.tasks.filter(t => t.status === 'pendente').length },
    { id: 'languages', label: 'Estudo de Idiomas', icon: Languages, badge: state.languages.todayStudied ? '✓' : '!' },
    { id: 'calendar', label: 'Calendário', icon: Calendar, badge: state.calendar.length },
    { id: 'goals', label: 'Metas', icon: Target, badge: state.goals.length },
    { id: 'github', label: 'GitHub', icon: GitPullRequest, badge: state.github.prs.length },
    { id: 'fileboard', label: 'Arquivos', icon: Folder, badge: 4 },
    { id: 'mood', label: 'Humor', icon: Smile, badge: `${state.mood.todayScore}/5` },
    { id: 'agentbridge', label: 'Ponte do Subagente', icon: Bot, badge: 'IA' },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">L</div>
        <div className="sidebar-brand-text">
          <span>Lipp Board</span>
          <span className="sidebar-version">v0.1 · webOS</span>
        </div>
        {isOpen && (
          <button 
            className="mobile-menu-btn" 
            style={{ marginLeft: 'auto' }} 
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="sidebar-search-box">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-nav-section">
        <button 
          className={`nav-item ${activeModule === 'home' ? 'active' : ''}`}
          onClick={() => { setActiveModule('home'); setIsOpen(false); }}
        >
          <Home className="nav-item-icon" />
          <span>Início</span>
        </button>
        <button 
          className={`nav-item ${activeModule === 'inbox' ? 'active' : ''}`}
          onClick={() => { setActiveModule('inbox'); setIsOpen(false); }}
        >
          <Inbox className="nav-item-icon" />
          <span>Caixa de Entrada</span>
        </button>
        <button 
          className={`nav-item ${activeModule === 'activity' ? 'active' : ''}`}
          onClick={() => { setActiveModule('activity'); setIsOpen(false); }}
        >
          <Activity className="nav-item-icon" />
          <span>Atividades</span>
        </button>
        <button 
          className={`nav-item ${activeModule === 'tags' ? 'active' : ''}`}
          onClick={() => { setActiveModule('tags'); setIsOpen(false); }}
        >
          <Tag className="nav-item-icon" />
          <span>Tags</span>
        </button>
      </div>

      <div className="sidebar-nav-section">
        <div className="nav-section-title">MÓDULOS</div>
        {modulesList.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              className={`nav-item ${activeModule === m.id ? 'active' : ''}`}
              onClick={() => { setActiveModule(m.id); setIsOpen(false); }}
            >
              <Icon className="nav-item-icon" />
              <span>{m.label}</span>
              <span className="nav-badge">{m.badge}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button 
          className={`nav-item ${activeModule === 'settings' ? 'active' : ''}`}
          onClick={() => { setActiveModule('settings'); setIsOpen(false); }}
        >
          <Settings className="nav-item-icon" />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  );
}
