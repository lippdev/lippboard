import React, { useEffect, useMemo, useState } from 'react';
import LockScreen from './components/LockScreen';
import MobileAppShell from './components/MobileAppShell.jsx';

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
import { useAuthSession } from './hooks/useAuthSession.js';
import './styles/theme.css';

export default function App() {
  const initialStore = useMemo(() => getStore(), []);
  const [state, setState] = useState(initialStore);
  const [activeModule, setActiveModule] = useState('home');
  const [theme, setTheme] = useState(initialStore.theme || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    authMode,
    authLoading,
    authError,
    isAuthenticated,
    authBootstrapDone,
    faceIdSupported,
    passkeyRegistered,
    handleLogin,
    handleFaceIdLogin,
    handleSetup,
  } = useAuthSession({ state, setState, setTheme });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    const themeColor = theme === 'light' ? '#f8fafc' : '#0b0f19';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', themeColor);
    setState((prev) => {
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

  useEffect(() => {
    document.body.classList.toggle('app-locked', !isAuthenticated);
    document.documentElement.classList.toggle('app-locked', !isAuthenticated);
    return () => {
      document.body.classList.remove('app-locked');
      document.documentElement.classList.remove('app-locked');
    };
  }, [isAuthenticated]);

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
        return <SettingsModule state={state} setState={setState} theme={theme} setTheme={setTheme} />;
      default:
        return <GithubModule state={state} setState={setState} />;
    }
  };

  if (authLoading && !isAuthenticated) {
    return (
      <div className="app-container app-container--locked">
        <div className="lockscreen-overlay auth-overlay">
          <div className="lockscreen-card auth-card">
            <div className="lockscreen-footer">
              <span>Carregando banco do app...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container app-container--locked">
        <LockScreen
          mode={authMode === 'setup' && !authBootstrapDone ? 'setup' : 'login'}
          isLoading={authLoading}
          errorMessage={authError}
          defaultDisplayName={state.auth?.displayName || 'Seu nome'}
          canUseFaceId={faceIdSupported}
          hasFaceId={passkeyRegistered}
          onLogin={handleLogin}
          onSetup={handleSetup}
          onFaceIdLogin={handleFaceIdLogin}
        />
      </div>
    );
  }

  return (
    <MobileAppShell
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen}
      state={state}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onStateChange={(newState) => setState({ ...newState })}
    >
      {renderActiveModule()}
    </MobileAppShell>
  );
}
