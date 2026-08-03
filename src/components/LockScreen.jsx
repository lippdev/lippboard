import React, { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Eye, EyeOff, KeyRound, LogIn, Lock, Sparkles, ShieldCheck } from 'lucide-react';

export default function LockScreen({
  mode = 'login',
  isLoading = false,
  errorMessage = '',
  onLogin,
  onSetup,
}) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const isSetupMode = mode === 'setup';
  const headline = useMemo(
    () => (isSetupMode ? 'Criar acesso do Lipp Board' : 'Entrar no Lipp Board'),
    [isSetupMode]
  );

  const helperText = useMemo(
    () => {
      if (isSetupMode) {
        return 'Crie o primeiro usuário administrador. Depois disso, o acesso passa a ser feito com login comum e banco SQLite.';
      }
      return 'Use seu usuário e senha para entrar. Seus dados ficam salvos no banco do app.';
    },
    [isSetupMode]
  );

  const submitLabel = isSetupMode ? 'Criar conta e entrar' : 'Entrar';
  const submitIcon = isSetupMode ? <UserPlus size={16} /> : <LogIn size={16} />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedDisplayName = displayName.trim();

    if (!normalizedUsername) {
      setLocalError('Informe um usuário.');
      return;
    }

    if (!password || password.length < 8) {
      setLocalError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (isSetupMode) {
      if (!normalizedDisplayName) {
        setLocalError('Informe seu nome de exibição.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('A senha e a confirmação não conferem.');
        return;
      }
      await onSetup?.({
        username: normalizedUsername,
        displayName: normalizedDisplayName,
        password,
      });
      return;
    }

    await onLogin?.({
      username: normalizedUsername,
      password,
    });
  };

  return (
    <div className="lockscreen-overlay auth-overlay">
      <div className="lockscreen-card auth-card">
        <div className="auth-hero">
          <div className="lockscreen-avatar-wrapper auth-badge">
            <div className="lockscreen-avatar lockscreen-avatar--empty auth-avatar" aria-hidden="true">
              <Lock size={26} />
            </div>
            <div className="lockscreen-shield-badge auth-shield-badge">
              <BadgeCheck size={14} color="#ffffff" />
            </div>
          </div>

          <div className="auth-pill-row">
            <span className="auth-pill"><ShieldCheck size={12} /> Login seguro</span>
            <span className="auth-pill"><KeyRound size={12} /> Banco SQLite</span>
            <span className="auth-pill"><Sparkles size={12} /> PWA de produção</span>
          </div>

          <h1 className="lockscreen-title auth-title">{headline}</h1>
          <p className="lockscreen-subtitle auth-subtitle">{helperText}</p>

          <div className="auth-summary">
            <div>
              <span className="auth-summary-label">Modo</span>
              <strong>{isSetupMode ? 'Primeiro acesso' : 'Login normal'}</strong>
            </div>
            <div>
              <span className="auth-summary-label">Segurança</span>
              <strong>Senha + sessão no servidor</strong>
            </div>
          </div>
        </div>

        <form className="lockscreen-password-form auth-form" onSubmit={handleSubmit}>
          {isSetupMode && (
            <label className="auth-field">
              <span>Nome de exibição</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => { setLocalError(''); setDisplayName(e.target.value); }}
                placeholder="Ex.: Filipe"
                autoComplete="name"
                className="lockscreen-password-input"
              />
            </label>
          )}

          <label className="auth-field">
            <span>Usuário</span>
            <input
              type="text"
              value={username}
              onChange={(e) => { setLocalError(''); setUsername(e.target.value); }}
              placeholder="ex.: lipp"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              className="lockscreen-password-input"
            />
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <div className="lockscreen-password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setLocalError(''); setPassword(e.target.value); }}
                placeholder={isSetupMode ? 'Crie uma senha forte' : 'Digite sua senha'}
                autoComplete={isSetupMode ? 'new-password' : 'current-password'}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="lockscreen-password-input"
              />
              <button
                type="button"
                className="lockscreen-password-visibility"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Alternar visibilidade da senha"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {isSetupMode && (
            <label className="auth-field">
              <span>Confirmar senha</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setLocalError(''); setConfirmPassword(e.target.value); }}
                placeholder="Repita a senha"
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="lockscreen-password-input"
              />
            </label>
          )}

          <button type="submit" className="topbar-btn btn-primary lockscreen-unlock-btn auth-submit" disabled={isLoading}>
            {submitIcon}
            <span>{isLoading ? 'Processando...' : submitLabel}</span>
            {!isLoading && <ArrowRight size={15} />}
          </button>
        </form>

        {(localError || errorMessage) && (
          <div className="lockscreen-error auth-error">
            <span>{localError || errorMessage}</span>
          </div>
        )}

        <div className="lockscreen-footer">
          <Sparkles size={13} color="var(--text-muted)" />
          <span>Login comum, banco SQLite e sessão segura</span>
        </div>
      </div>
    </div>
  );
}
