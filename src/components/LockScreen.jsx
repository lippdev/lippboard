import React, { useState, useEffect, useCallback } from 'react';
import { Scan, Lock, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { verifyPassword, authenticateBiometrics } from '../services/securityService';

export default function LockScreen({ securityConfig, userProfile, onUnlock }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Tenta autenticar com Face ID / Biometria automaticamente se ativado
  const handleBiometricAuth = useCallback(async () => {
    if (!securityConfig.biometricsEnabled) return;
    
    setIsAuthenticatingBio(true);
    setErrorMsg('');
    try {
      const success = await authenticateBiometrics(securityConfig.webAuthnCredentialId);
      if (success) {
        onUnlock();
      }
    } catch (err) {
      console.warn('Autenticação biométrica cancelada ou falhou:', err);
      // Não exibe erro chamativo se o usuário apenas cancelou o modal do SO
      if (err.name !== 'NotAllowedError') {
        setErrorMsg('Falha na autenticação biométrica. Use sua senha.');
      }
    } finally {
      setIsAuthenticatingBio(false);
    }
  }, [securityConfig, onUnlock]);

  // Dispara a biometria nativa ao montar a tela de bloqueio se estiver habilitada
  useEffect(() => {
    if (securityConfig.biometricsEnabled) {
      handleBiometricAuth();
    }
  }, [securityConfig.biometricsEnabled, handleBiometricAuth]);

  // Trata digitação do senha
  const handlePasswordSubmit = useCallback(async (currentPassword) => {
    if (!currentPassword) return;
    const isValid = await verifyPassword(currentPassword, securityConfig.passwordHash, securityConfig.passwordSalt);
    if (isValid) {
      onUnlock();
    } else {
      setIsShaking(true);
      setErrorMsg('Senha de segurança incorreta.');
      setPasswordInput('');
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [securityConfig.passwordHash, securityConfig.passwordSalt, onUnlock]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    await handlePasswordSubmit(passwordInput);
  }, [handlePasswordSubmit, passwordInput]);

  return (
    <div className="lockscreen-overlay">
      <div className={`lockscreen-card ${isShaking ? 'shake' : ''}`}>
        
        {/* Header do Perfil / App */}
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
            {userProfile?.name ? `Olá, ${userProfile.name.split(' ')[0]}! ` : 'Olá! '}Insira sua senha ou use o Face ID para continuar.
          </p>
        </div>

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
            <button type="button" className="lockscreen-password-visibility" onClick={() => setShowPassword(v => !v)} aria-label="Alternar visibilidade da senha">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" className="topbar-btn btn-primary lockscreen-unlock-btn">
            <Lock size={15} />
            <span>Desbloquear</span>
          </button>
        </form>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="lockscreen-error">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {securityConfig.biometricsEnabled ? (
          <button 
            type="button"
            className="topbar-btn bio-btn lockscreen-bio-btn" 
            onClick={handleBiometricAuth}
            title="Entrar com Face ID / Touch ID"
            disabled={isAuthenticatingBio}
          >
            <Scan size={18} color="var(--accent-primary, #6366f1)" />
            <span>{isAuthenticatingBio ? 'Verificando...' : 'Face ID'}</span>
          </button>
        ) : null}

        {/* Rodapé informativo */}
        <div className="lockscreen-footer">
          <Sparkles size={13} color="var(--text-muted)" />
          <span>Proteção PWA ativada para VPS</span>
        </div>

      </div>
    </div>
  );
}
