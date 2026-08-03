import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MobileDock from './components/MobileDock';
import SubagentCommandDrawer from './components/SubagentCommandDrawer';
import LockScreen from './components/LockScreen';

// Módulos
import HomeModule from './modules/HomeModule';
import GithubModule from './modules/GithubModule';
import LanguagesModule from './modules/LanguagesModule';
import TasksModule from './modules/TasksModule';
import ThoughtsModule from './modules/ThoughtsModule';
import CalendarModule from './modules/CalendarModule';
import GoalsModule from './modules/GoalsModule';
import FileBoardModule from './modules/FileBoardModule';
import MoodModule from './modules/MoodModule';
import SubagentBridgeModule from './modules/SubagentBridgeModule';
import SettingsModule from './modules/SettingsModule';

import { getStore, saveStore } from './services/store';
import './styles/theme.css';

export default function App() {
  const [state, setState] = useState(() => getStore());
  const [activeModule, setActiveModule] = useState('github'); // Começa no GitHub igual à imagem
  const [theme, setTheme] = useState(state.theme || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Estado de bloqueio inicial do aplicativo baseada em sessão
  const isSecurityConfigured = Boolean(state.security?.enabled && (state.security?.passwordHash || state.security?.pinHash));
  const [isLocked, setIsLocked] = useState(true);

  // Aplica tema ao atributo root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setState(prev => {
      if (prev.theme === theme) return prev;
      const updated = { ...prev, theme };
      saveStore(updated);
      return updated;
    });
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-locked', sidebarOpen);
    return () => document.body.classList.remove('sidebar-locked');
  }, [sidebarOpen]);


  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleSetupSecurity = (security) => {
    const updated = {
      ...state,
      security: {
        ...state.security,
        ...security,
      },
    };
    setState(updated);
    saveStore(updated);
    setIsLocked(false);
  };

  const handleLockApp = () => {
    setIsLocked(true);
  };

  // Captura evento de instalação PWA
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && state.security?.enabled && state.security?.autoLockOnHide) {
        handleLockApp();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.security?.enabled, state.security?.autoLockOnHide]);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'home':
        return <HomeModule state={state} setActiveModule={setActiveModule} onOpenDrawer={() => setDrawerOpen(true)} />;
      case 'github':
        return <GithubModule state={state} setState={setState} />;
      case 'languages':
        return <LanguagesModule state={state} setState={setState} />;
      case 'tasks':
        return <TasksModule state={state} setState={setState} />;
      case 'thoughts':
        return <ThoughtsModule state={state} setState={setState} />;
      case 'calendar':
        return <CalendarModule state={state} setState={setState} />;
      case 'goals':
        return <GoalsModule state={state} setState={setState} />;
      case 'fileboard':
        return <FileBoardModule state={state} setState={setState} />;
      case 'mood':
        return <MoodModule state={state} setState={setState} />;
      case 'agentbridge':
        return <SubagentBridgeModule state={state} setState={setState} />;
      case 'settings':
        return <SettingsModule state={state} setState={setState} theme={theme} setTheme={setTheme} isPwaInstalled={isPwaInstalled} onInstallPwa={handleInstallPwa} />;
      default:
        return <GithubModule state={state} setState={setState} />;
    }
  };

  return (
    <div className="app-container">
      {/* Tela de Bloqueio por senha / Face ID (WebAuthn) */}
      {isLocked && (
        <LockScreen 
          securityConfig={state.security}
          userProfile={state.user}
          mode={isSecurityConfigured ? 'unlock' : 'setup'}
          onUnlock={handleUnlock}
          onSetupSecurity={handleSetupSecurity}
        />
      )}

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

      <main className="app-main">
        <Topbar 
          activeModule={activeModule}
          theme={theme}
          setTheme={setTheme}
          onOpenDrawer={() => setDrawerOpen(true)}
          isPwaInstalled={isPwaInstalled}
          onInstallPwa={deferredPrompt ? handleInstallPwa : null}
          isSecurityEnabled={state.security?.enabled}
          onLockApp={handleLockApp}
        />

        <div className="app-content">
          {renderActiveModule()}
        </div>
      </main>

      <SubagentCommandDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStateChange={(newState) => setState({ ...newState })}
      />

      <MobileDock
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenMenu={() => setSidebarOpen(prev => !prev)}
      />
    </div>
  );
}

