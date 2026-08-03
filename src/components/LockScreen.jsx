import React, { useState, useEffect, useCallback } from 'react';
import { Scan, Lock, AlertCircle, Sparkles, Eye, EyeOff, KeyRound } from 'lucide-react';
import { createPasswordRecord, verifyPassword, authenticateBiometrics, isWebAuthnAvailable } from '../services/securityService';

export default function LockScreen({ securityConfig, userProfile, mode = 'unlock', onUnlock, onSetupSecurity }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);

  const isSetupMode = mode === 'setup';
  const hasBiometrics = Boolean(!isSetupMode && securityConfig.biometricsEnabled && isWebAuthnAvailable());

  const handleSetupSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    setErrorMsg('');

    if (!passwordInput || passwordInput.length < 8) {
      setErrorMsg('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg('A senha e a confirmação não conferem.');
      return;
    }

    const { hash, salt } = await createPasswordRecord(passwordInput);
    onSetupSecurity?.({
      enabled: true,
      passwordHash: hash,
      passwordSalt: salt,
      biometricsEnabled: false,
      webAuthnCredentialId: null,
      autoLockOnHide: true,
    });
    onUnlock?.();
  }, [confirmPasswordInput, onSetupSecurity, onUnlock, passwordInput]);

  const handlePasswordSubmit = useCallback(async (currentPassword) => {
    if (!currentPassword) return;
    const isValid = await verifyPassword(currentPassword, securityConfig.passwordHash || securityConfig.pinHash, securityConfig.passwordSalt || '');
    if (isValid) {
      onUnlock?.();
      return;
    }

    setIsShaking(true);
    setErrorMsg('Senha de segurança incorreta.');
    setPasswordInput('');
    setTimeout(() => setIsShaking(false), 500);
  }, [securityConfig.passwordHash, securityConfig.pinHash, securityConfig.passwordSalt, onUnlock]);

  const handleBiometricAuth = useCallback(async ({ manual = false } = {}) => {
    if (!hasBiometrics) {
      if (manual) setShowPasswordFallback(true);
      return;
    }

    setIsAuthenticatingBio(true);
    setErrorMsg('');

    try {
      const success = await authenticateBiometrics(securityConfig.webAuthnCredentialId);
      if (success) {
        onUnlock?.();
        return;
      }
      setShowPasswordFallback(true);
    } catch (err) {
      console.warn('Autenticação biométrica cancelada ou falhou:', err);
      if (err.name !== 'NotAllowedError') {
        setErrorMsg('Falha na autenticação biométrica. Use sua senha.');
      }
      setShowPasswordFallback(true);
    } finally {
      setIsAuthenticatingBio(false);
    }
  }, [hasBiometrics, onUnlock, securityConfig.webAuthnCredentialId]);

  useEffect(() => {
    if (isSetupMode) return;
    if (hasBiometrics) {
      handleBiometricAuth();
    } else {
      setShowPasswordFallback(true);
    }
  }, [handleBiometricAuth, hasBiometrics, isSetupMode]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    if (isSetupMode) {
      await handleSetupSubmit(e);
      return;
    }
    await handlePasswordSubmit(passwordInput);
  }, [handlePasswordSubmit, handleSetupSubmit, isSetupMode, passwordInput]);

  return (
    <div className="lockscreen-overlay">
      <div className={`lockscreen-card ${isShaking ? 'shake' : ''}`}>
        <div className="lockscreen-header">
          <div className="lockscreen-avatar-wrapper">
            {userProfile?.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile?.name || 'Lipp Board User'}
                className="lockscreen-avatar"
              />
            ) : (
              <div className="lockscreen-avatar lockscreen-avatar--empty" aria-hidden="true" />
            )}
            <div className="lockscreen-shield-badge">
              <Lock size={14} color="#ffffff" />
            </div>
          </div>
          <h2 className="lockscreen-title">
            {isSetupMode ? 'Defina uma senha de acesso' : 'Lipp Board Bloqueado'}
          </h2>
          <p className="lockscreen-subtitle">
            {isSetupMode
              ? 'Esse app exige uma senha para abrir. Depois você pode ativar Face ID nas configurações.'
              : `${userProfile?.name ? `Olá, ${userProfile.name.split(' ')[0]}! ` : 'Olá! '}${hasBiometrics ? 'Use Face ID primeiro; a senha fica como fallback.' : 'Insira sua senha para continuar.'}`}
          </p>
        </div>

        {isSetupMode ? (
          <form className="lockscreen-password-form" onSubmit={handleSubmit}>
            <div className="lockscreen-password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => { setErrorMsg(''); setPasswordInput(e.target.value); }}
                placeholder="Nova senha"
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="lockscreen-password-input"
              />
              <button
                type="button"
                className="lockscreen-password-visibility"
                onClick={() => setShowPassword(v => !v)}
                aria-label="Alternar visibilidade da senha"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="lockscreen-password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPasswordInput}
                onChange={(e) => { setErrorMsg(''); setConfirmPasswordInput(e.target.value); }}
                placeholder="Confirmar senha"
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="lockscreen-password-input"
              />
            </div>

            <button type="submit" className="topbar-btn btn-primary lockscreen-unlock-btn">
              <Lock size={15} />
              <span>Salvar e entrar</span>
            </button>
          </form>
        ) : hasBiometrics && !showPasswordFallback ? (
          <>
            <button
              type="button"
              className="topbar-btn btn-primary lockscreen-unlock-btn"
              onClick={() => handleBiometricAuth({ manual: true })}
              disabled={isAuthenticatingBio}
            >
              <Scan size={16} />
              <span>{isAuthenticatingBio ? 'Reconhecendo Face ID...' : 'Desbloquear com Face ID'}</span>
            </button>

            <button
              type="button"
              className="topbar-btn lockscreen-fallback-btn"
              onClick={() => setShowPasswordFallback(true)}
            >
              <KeyRound size={16} />
              <span>Usar senha</span>
            </button>
          </>
        ) : (
          <form className="lockscreen-password-form" onSubmit={handleSubmit}>
            <div className="lockscreen-password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => { setErrorMsg(''); setPasswordInput(e.target.value); }}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="lockscreen-password-input"
              />
              <button
                type="button"
                className="lockscreen-password-visibility"
                onClick={() => setShowPassword(v => !v)}
                aria-label="Alternar visibilidade da senha"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="topbar-btn btn-primary lockscreen-unlock-btn">
              <Lock size={15} />
              <span>Desbloquear</span>
            </button>

            {hasBiometrics && (
              <button
                type="button"
                className="topbar-btn lockscreen-fallback-btn"
                onClick={() => {
                  setErrorMsg('');
                  setShowPasswordFallback(false);
                  handleBiometricAuth({ manual: true });
                }}
                disabled={isAuthenticatingBio}
              >
                <Scan size={16} />
                <span>{isAuthenticatingBio ? 'Voltando ao Face ID...' : 'Voltar para Face ID'}</span>
              </button>
            )}
          </form>
        )}

        {errorMsg && (
          <div className="lockscreen-error">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="lockscreen-footer">
          <Sparkles size={13} color="var(--text-muted)" />
          <span>Proteção PWA ativada para VPS</span>
        </div>
      </div>
    </div>
  );
}
