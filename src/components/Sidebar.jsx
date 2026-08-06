import React, { useRef, useState } from 'react';
import { Search, ChevronLeft, Settings } from 'lucide-react';
import { SIDEBAR_MODULES, SIDEBAR_QUICK_ACTIONS } from '../config/appNavigation.js';

export default function Sidebar({ activeModule, setActiveModule, isOpen, setIsOpen, state, searchQuery, setSearchQuery }) {
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleTouchStart = (event) => {
    if (!isOpen) return;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(false);
    setDragX(0);
  };

  const handleTouchMove = (event) => {
    if (!isOpen) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (!isDragging) {
      if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      setIsDragging(true);
    }

    if (deltaX < 0) {
      setDragX(Math.max(deltaX, -340));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const shouldClose = dragX < -72;
    setDragX(0);
    setIsDragging(false);
    if (shouldClose) setIsOpen(false);
  };

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'open' : ''} ${isDragging ? 'is-dragging' : ''}`}
      aria-hidden={!isOpen}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={dragX ? { transform: `translate3d(${dragX}px, 0, 0)` } : undefined}
    >
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
          {SIDEBAR_QUICK_ACTIONS.map(({ id, label, icon: Icon }) => navItem(id, label, Icon))}
        </div>

        <div className="sidebar-nav-section">
          <div className="nav-section-title">MÓDULOS</div>
          {SIDEBAR_MODULES.map(({ id, label, icon: Icon, badge }) => {
            const resolvedBadge = id === 'tasks'
              ? state.tasks.filter((task) => task.status === 'a_fazer').length
              : id === 'languages'
                ? (state.languages.todayStudied ? '✓' : '!')
                : id === 'github'
                  ? state.github.prs.length
                  : id === 'fileboard'
                    ? state.files?.length || 0
                    : id === 'mood'
                      ? `${state.mood.todayScore}/5`
                      : id === 'thoughts'
                        ? state.thoughts.length
                        : badge;

            return navItem(id, label, Icon, resolvedBadge);
          })}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            {navItem('settings', 'Configurações', Settings)}
          </div>
        </div>
      </div>
    </aside>
  );
}
