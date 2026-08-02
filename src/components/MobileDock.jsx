import React from 'react';
import { Menu, Home, CheckSquare, GitPullRequest, Bot } from 'lucide-react';

const items = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'github', label: 'GitHub', icon: GitPullRequest },
];

export default function MobileDock({ activeModule, setActiveModule, onOpenDrawer, onOpenMenu }) {
  return (
    <>
      <nav className="mobile-dock" aria-label="Navegação rápida">
        <button
          type="button"
          className="mobile-dock-item mobile-dock-menu"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          title="Menu"
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>

        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`mobile-dock-item ${activeModule === id ? 'active' : ''}`}
            onClick={() => setActiveModule(id)}
            aria-current={activeModule === id ? 'page' : undefined}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="mobile-dock-fab"
        onClick={onOpenDrawer}
        aria-label="Abrir comando de IA"
        title="Comando IA"
      >
        <Bot size={20} />
      </button>
    </>
  );
}
