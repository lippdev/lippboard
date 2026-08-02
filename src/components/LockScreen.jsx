import React, { useState, useEffect, useCallback } from 'react';
import { Scan, Lock, Delete, AlertCircle, Sparkles } from 'lucide-react';
import { verifyPin, authenticateBiometrics } from '../services/securityService';

export default function LockScreen({ securityConfig, userProfile, onUnlock }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState(false);

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
        setErrorMsg('Falha na autenticação biométrica. Use seu PIN.');
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

  // Trata digitação do PIN
  const handleDigit = useCallback((digit) => {
    setPinInput(prev => {
      if (prev.length < 6) {
        setErrorMsg('');
        return prev + digit;
      }
      return prev;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setErrorMsg('');
    setPinInput(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setErrorMsg('');
    setPinInput('');
  }, []);

  // Submeter verificação do PIN
  const handlePinSubmit = useCallback(async (currentPin) => {
    if (!currentPin) return;
    const isValid = await verifyPin(currentPin, securityConfig.pinHash);
    if (isValid) {
      onUnlock();
    } else {
      setIsShaking(true);
      setErrorMsg('PIN de segurança incorreto.');
      setPinInput('');
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [securityConfig.pinHash, onUnlock]);

  // Submete automaticamente quando o PIN atinge 4 a 6 dígitos se bater o hash
  useEffect(() => {
    if (pinInput.length >= 4) {
      handlePinSubmit(pinInput);
    }
  }, [pinInput, handlePinSubmit]);

  // Listener para teclado físico
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDelete, handleClear]);

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
            {userProfile?.name ? `Olá, ${userProfile.name.split(' ')[0]}! ` : 'Olá! '}Insira seu PIN ou ative o Face ID para continuar.
          </p>
        </div>

        {/* Indicador visual de PIN (Dots) */}
        <div className="lockscreen-pin-display">
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx} 
              className={`pin-dot ${idx < pinInput.length ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="lockscreen-error">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Teclado Numérico Virtual */}
        <div className="lockscreen-keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button 
              key={num} 
              type="button"
              className="keypad-btn" 
              onClick={() => handleDigit(num)}
            >
              {num}
            </button>
          ))}
          
          {/* Botão Biometria / Face ID se disponível */}
          {securityConfig.biometricsEnabled ? (
            <button 
              type="button"
              className="keypad-btn bio-btn" 
              onClick={handleBiometricAuth}
              title="Entrar com Face ID / Touch ID"
              disabled={isAuthenticatingBio}
            >
              <Scan size={22} color="var(--accent-primary, #6366f1)" />
            </button>
          ) : (
            <div className="keypad-btn empty-btn" />
          )}

          <button 
            type="button"
            className="keypad-btn" 
            onClick={() => handleDigit('0')}
          >
            0
          </button>

          <button 
            type="button"
            className="keypad-btn action-btn" 
            onClick={handleDelete}
            title="Apagar dígito"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Rodapé informativo */}
        <div className="lockscreen-footer">
          <Sparkles size={13} color="var(--text-muted)" />
          <span>Proteção PWA ativada para VPS</span>
        </div>

      </div>
    </div>
  );
}
