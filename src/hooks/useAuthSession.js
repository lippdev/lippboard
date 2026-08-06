import { useEffect, useState } from 'react';
import { getStore, saveStore, loadRemoteStore } from '../services/store.js';
import { bootstrapAccount, getAuthStatus, login as apiLogin } from '../services/backendService.js';
import { isFaceIdAvailable, loginWithFaceId } from '../services/passkeyService.js';

export function useAuthSession({ state, setState, setTheme }) {
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authBootstrapDone, setAuthBootstrapDone] = useState(false);
  const [faceIdSupported, setFaceIdSupported] = useState(false);
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);
  const [autoFaceIdAttempted, setAutoFaceIdAttempted] = useState(false);

  useEffect(() => {
    setFaceIdSupported(isFaceIdAvailable());
  }, []);

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
  }, [setState, setTheme]);

  useEffect(() => {
    if (
      !authLoading &&
      !isAuthenticated &&
      !autoFaceIdAttempted &&
      authMode === 'login' &&
      passkeyRegistered &&
      faceIdSupported
    ) {
      setAutoFaceIdAttempted(true);
      void (async () => {
        setAuthLoading(true);
        setAuthError('');
        try {
          const result = await loginWithFaceId();
          setPasskeyRegistered(true);
          const remoteState = await loadRemoteStore();
          const hydratedState = {
            ...(remoteState || getStore()),
            auth: {
              ...(remoteState?.auth || {}),
              username: result?.user?.username || state.auth?.username || state.user.handle || 'seu-usuario',
              displayName: result?.user?.displayName || state.auth?.displayName || state.user.name || 'Seu nome',
              lastLoginAt: new Date().toISOString(),
              rememberSession: true,
              passkeyRegistered: true,
            },
          };
          setState(hydratedState);
          saveStore(hydratedState);
          setTheme(hydratedState.theme || 'dark');
          setIsAuthenticated(true);
          setAuthBootstrapDone(true);
        } catch (err) {
          setAuthError(err.message || 'Falha no Face ID.');
        } finally {
          setAuthLoading(false);
        }
      })();
    }
  }, [authLoading, authMode, autoFaceIdAttempted, faceIdSupported, isAuthenticated, passkeyRegistered, setState, setTheme, state.auth?.displayName, state.auth?.username, state.user.handle, state.user.name]);

  const handleLogin = async ({ username, password }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await apiLogin({ username, password });
      const remoteState = await loadRemoteStore();
      const nextPasskeyRegistered = Boolean(result?.passkeyRegistered ?? passkeyRegistered);
      setPasskeyRegistered(nextPasskeyRegistered);
      const hydratedState = {
        ...(remoteState || getStore()),
        auth: {
          ...(remoteState?.auth || {}),
          username,
          displayName: result?.user?.displayName || username,
          lastLoginAt: new Date().toISOString(),
          rememberSession: true,
          passkeyRegistered: nextPasskeyRegistered,
        },
      };
      setState(hydratedState);
      saveStore(hydratedState);
      setTheme(hydratedState.theme || 'dark');
      setIsAuthenticated(true);
      setAuthBootstrapDone(true);
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
      const hydratedState = {
        ...(remoteState || getStore()),
        auth: {
          ...(remoteState?.auth || {}),
          username: result?.user?.username || state.auth?.username || state.user.handle || 'seu-usuario',
          displayName: result?.user?.displayName || state.auth?.displayName || state.user.name || 'Seu nome',
          lastLoginAt: new Date().toISOString(),
          rememberSession: true,
          passkeyRegistered: true,
        },
      };
      setState(hydratedState);
      saveStore(hydratedState);
      setTheme(hydratedState.theme || 'dark');
      setIsAuthenticated(true);
      setAuthBootstrapDone(true);
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
      const hydratedState = {
        ...(remoteState || getStore()),
        auth: {
          ...(remoteState?.auth || {}),
          username,
          displayName,
          lastLoginAt: new Date().toISOString(),
          rememberSession: true,
          passkeyRegistered: Boolean(result?.passkeyRegistered),
        },
      };
      setState(hydratedState);
      saveStore(hydratedState);
      setTheme(hydratedState.theme || 'dark');
      setIsAuthenticated(true);
      setAuthBootstrapDone(true);
    } catch (err) {
      setAuthError(err.message || 'Falha ao criar acesso.');
    } finally {
      setAuthLoading(false);
    }
  };

  return {
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
  };
}
