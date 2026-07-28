import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SubagentCommandDrawer from './components/SubagentCommandDrawer';

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

  // Aplica tema ao atributo root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const updated = { ...state, theme };
    setState(updated);
    saveStore(updated);
  }, [theme]);

  // Captura evento de instalação PWA
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

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
        return <CalendarModule state={state} />;
      case 'goals':
        return <GoalsModule state={state} />;
      case 'fileboard':
        return <FileBoardModule />;
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
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        state={state}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="app-main">
        <Topbar 
          activeModule={activeModule}
          theme={theme}
          setTheme={setTheme}
          onOpenDrawer={() => setDrawerOpen(true)}
          isPwaInstalled={isPwaInstalled}
          onInstallPwa={deferredPrompt ? handleInstallPwa : null}
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
    </div>
  );
}
