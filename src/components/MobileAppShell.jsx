import React from 'react';
import Sidebar from './Sidebar.jsx';
import MobileDock from './MobileDock.jsx';
import SubagentCommandDrawer from './SubagentCommandDrawer.jsx';

export default function MobileAppShell({
  activeModule,
  setActiveModule,
  sidebarOpen,
  setSidebarOpen,
  drawerOpen,
  setDrawerOpen,
  state,
  searchQuery,
  setSearchQuery,
  children,
  onStateChange,
}) {
  return (
    <div className="app-shell">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        state={state}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}

      <main className="app-main app-shell__main">
        <div className="app-shell__statusbar">
          <span>Mobile</span>
          <span>Lipp Board</span>
          <span>Sync</span>
        </div>
        <div className="app-content app-shell__content">
          {children}
        </div>
      </main>

      <SubagentCommandDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStateChange={onStateChange}
      />

      <MobileDock
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onOpenMenu={() => setSidebarOpen((prev) => !prev)}
      />
    </div>
  );
}
