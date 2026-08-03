import React, { useState, useEffect, useCallback } from 'react';
import { Scan, Lock, AlertCircle, Sparkles, Eye, EyeOff, KeyRound } from 'lucide-react';
import { verifyPassword, authenticateBiometrics, isWebAuthnAvailable } from '../services/securityService';

export default function LockScreen({ securityConfig, userProfile, onUnlock }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);

  const handlePasswordSubmit = useCallback(async (currentPassword) => {
    if (!currentPassword) return;
    const isValid = await verifyPassword(currentPassword, securityConfig.passwordHash, securityConfig.passwordSalt);
    if (isValid) {
      onUnlock();
      return;
    }

    setIsShaking(true);
    setErrorMsg('Senha de segurança incorreta.');
    setPasswordInput('');
    setTimeout(() => setIsShaking(false), 500);
  }, [securityConfig.passwordHash, securityConfig.passwordSalt, onUnlock]);

  const handleBiometricAuth = useCallback(async ({ manual = false } = {}) => {
    if (!securityConfig.biometricsEnabled || !isWebAuthnAvailable()) {
      if (manual) setShowPasswordFallback(true);
      return;
    }

    setIsAuthenticatingBio(true);
    setErrorMsg('');

    try {
      const success = await authenticateBiometrics(securityConfig.webAuthnCredentialId);
      if (success) {
        onUnlock();
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
  }, [securityConfig.biometricsEnabled, securityConfig.webAuthnCredentialId, onUnlock]);

  useEffect(() => {
    const shouldTryBio = securityConfig.biometricsEnabled && isWebAuthnAvailable();
    if (shouldTryBio) {
      handleBiometricAuth();
    } else {
      setShowPasswordFallback(true);
    }
  }, [securityConfig.biometricsEnabled, handleBiometricAuth]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    await handlePasswordSubmit(passwordInput);
  }, [handlePasswordSubmit, passwordInput]);

  const hasBiometrics = Boolean(securityConfig.biometricsEnabled && isWebAuthnAvailable());

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
          <h2 className="lockscreen-title">Lipp Board Bloqueado</h2>
          <p className="lockscreen-subtitle">
            {userProfile?.name ? `Olá, ${userProfile.name.split(' ')[0]}! ` : 'Olá! '}
            {hasBiometrics
              ? 'Use Face ID primeiro; a senha fica como fallback.'
              : 'Insira sua senha para continuar.'}
          </p>
        </div>

        {hasBiometrics && !showPasswordFallback ? (
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
