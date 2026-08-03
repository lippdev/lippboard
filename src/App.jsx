import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MobileDock from './components/MobileDock';
import SubagentCommandDrawer from './components/SubagentCommandDrawer';
import LockScreen from './components/LockScreen';

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

import { getStore, saveStore, loadRemoteStore, clearStore } from './services/store';
import { bootstrapAccount, getAuthStatus, login as apiLogin, logout as apiLogout } from './services/backendService';
import { isFaceIdAvailable, loginWithFaceId } from './services/passkeyService';
import './styles/theme.css';

export default function App() {
  const initialStore = useMemo(() => getStore(), []);
  const [state, setState] = useState(initialStore);
  const [activeModule, setActiveModule] = useState('github');
  const [theme, setTheme] = useState(initialStore.theme || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authBootstrapDone, setAuthBootstrapDone] = useState(false);
  const [faceIdSupported, setFaceIdSupported] = useState(false);
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setState((prev) => {
      if (prev.theme === theme) return prev;
      const updated = { ...prev, theme };
      saveStore(updated);
      return updated;
    });
  }, [theme]);

  useEffect(() => {
    setFaceIdSupported(isFaceIdAvailable());
  }, []);

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

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const status = await getAuthStatus();
        if (cancelled) return;

        if (status.backendAvailable === false) {
          setAuthError('Não foi possível conectar ao banco do app.');
          setAuthLoading(false);
          setIsAuthenticated(false);
          return;
        }

        setAuthMode(status.firstRun ? 'setup' : 'login');
        setPasskeyRegistered(Boolean(status.passkeyRegistered));

        if (status.authenticated) {
          const remoteState = await loadRemoteStore();
          if (cancelled) return;
          if (remoteState) {
            const hydrated = {
              ...remoteState,
              auth: {
                ...(remoteState.auth || {}),
                passkeyRegistered: Boolean(status.passkeyRegistered),
              },
            };
            setState(hydrated);
            setTheme(remoteState.theme || 'dark');
            saveStore(hydrated);
          }
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        if (!cancelled) {
          setAuthError(err.message || 'Falha ao iniciar o app.');
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isAuthenticated) {
        setIsAuthenticated(false);
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
  }, [isAuthenticated]);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const syncAuthenticatedState = async ({ username, displayName, remoteState, passkeyRegisteredValue = passkeyRegistered }) => {
    const hydratedState = {
      ...(remoteState || getStore()),
      auth: {
        ...(remoteState?.auth || {}),
        username,
        displayName: remoteState?.auth?.displayName || remoteState?.user?.name || displayName || username,
        lastLoginAt: new Date().toISOString(),
        rememberSession: true,
        passkeyRegistered: passkeyRegisteredValue,
      },
    };
    setState(hydratedState);
    saveStore(hydratedState);
    setTheme(hydratedState.theme || 'dark');
    setIsAuthenticated(true);
    setAuthBootstrapDone(true);
  };

  const handleLogin = async ({ username, password }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await apiLogin({ username, password });
      const remoteState = await loadRemoteStore();
      setPasskeyRegistered(Boolean(result?.passkeyRegistered ?? passkeyRegistered));
      await syncAuthenticatedState({ username, displayName: result?.user?.displayName || username, remoteState, passkeyRegisteredValue: Boolean(result?.passkeyRegistered ?? passkeyRegistered) });
    } catch (err) {
      setAuthError(err.message || 'Falha no login.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFaceIdLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await loginWithFaceId();
      setPasskeyRegistered(true);
      const remoteState = await loadRemoteStore();
      await syncAuthenticatedState({
        username: result?.user?.username || state.auth?.username || state.user.handle || 'lipp',
        displayName: result?.user?.displayName || state.auth?.displayName || state.user.name || 'Filipe',
        remoteState,
        passkeyRegisteredValue: true,
      });
    } catch (err) {
      setAuthError(err.message || 'Falha no Face ID.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSetup = async ({ username, displayName, password }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await bootstrapAccount({ username, displayName, password });
      setPasskeyRegistered(Boolean(result?.passkeyRegistered));
      const remoteState = await loadRemoteStore();
      await syncAuthenticatedState({ username, displayName, remoteState, passkeyRegisteredValue: Boolean(result?.passkeyRegistered ?? passkeyRegistered) });
    } catch (err) {
      setAuthError(err.message || 'Falha ao criar acesso.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await apiLogout();
    } finally {
      clearStore();
      setState(getStore());
      setIsAuthenticated(false);
      setAuthLoading(false);
    }
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
          defaultDisplayName={state.auth?.displayName || 'Filipe'}
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

      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}

      <main className="app-main">
        <Topbar
          activeModule={activeModule}
          theme={theme}
          setTheme={setTheme}
          onOpenDrawer={() => setDrawerOpen(true)}
          isPwaInstalled={isPwaInstalled}
          onInstallPwa={deferredPrompt ? handleInstallPwa : null}
          isSecurityEnabled={true}
          onLockApp={handleLogout}
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
        onOpenMenu={() => setSidebarOpen((prev) => !prev)}
      />
    </div>
  );
}
