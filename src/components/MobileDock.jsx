import React from 'react';
import { Menu } from 'lucide-react';
import { MOBILE_DOCK_ITEMS } from '../config/appNavigation.js';

export default function MobileDock({ activeModule, setActiveModule, onOpenMenu }) {
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

        {MOBILE_DOCK_ITEMS.map(({ id, label, icon: Icon }) => (
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
    </>
  );
}
