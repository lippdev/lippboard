import React, { useState, useEffect } from 'react';
import { Sun, Moon, Download, Key, RefreshCw, CheckCircle, Shield, User, Lock, Scan, Check } from 'lucide-react';
import { saveStore } from '../services/store.js';
import { createPasswordRecord, isWebAuthnAvailable, isPlatformAuthenticatorAvailable, registerBiometrics, authenticateBiometrics } from '../services/securityService.js';

export default function SettingsModule({ state, setState, theme, setTheme, isPwaInstalled, onInstallPwa }) {
  const [token, setToken] = useState(state.user.githubToken || '');
  const [name, setName] = useState(state.user.name || '');
  const [handle, setHandle] = useState(state.user.handle || '');
  const [email, setEmail] = useState(state.user.email || '');
  const [avatar, setAvatar] = useState(state.user.avatar || '');
  const [savedMsg, setSavedMsg] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  const pageChecklist = [
    ['Início', 'Layout ajustado'],
    ['GitHub', 'Tabs e cards responsivos'],
    ['Tarefas', 'Formulário mobile-first'],
    ['Pensamentos', 'Cards em grid'],
    ['Idiomas', 'Checklist e histórico'],
    ['Calendário', 'Agenda e formulário'],
    ['Metas', 'Progresso e ações'],
    ['Arquivos', 'Links e uploads'],
    ['Humor', 'Entrada simples'],
    ['Ponte IA', 'Comandos e histórico'],
    ['Configurações', 'Perfil, segurança e tema'],
  ];

  // Segurança State
  const secConfig = state.security || { enabled: false, passwordHash: '', passwordSalt: '', biometricsEnabled: false, autoLockOnHide: true };
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secMsg, setSecMsg] = useState('');
  const [secError, setSecError] = useState('');
  const [_hasPlatformBio, setHasPlatformBio] = useState(false);
  const [isRegisteringBio, setIsRegisteringBio] = useState(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(avail => setHasPlatformBio(avail));
  }, []);

  const handleSaveToken = (e) => {
    e.preventDefault();
    const updated = {
      ...state,
      user: {
        ...state.user,
        githubToken: token
      }
    };
    setState(updated);
    saveStore(updated);
    setSavedMsg('Token do GitHub salvo com sucesso!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...state,
      user: {
        ...state.user,
        name,
        handle,
        email,
        avatar
      }
    };
    setState(updated);
    saveStore(updated);
    setProfileMsg('Perfil atualizado com sucesso!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setSecMsg('');
    setSecError('');

    if (!password || password.length < 8) {
      setSecError('A senha de segurança deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setSecError('A senha e a confirmação não conferem.');
      return;
    }

    const { hash, salt } = await createPasswordRecord(password);
    const updated = {
      ...state,
      security: {
        ...secConfig,
        enabled: true,
        passwordHash: hash,
        passwordSalt: salt
      }
    };
    setState(updated);
    saveStore(updated);
    setPassword('');
    setConfirmPassword('');
    setSecMsg('Senha de segurança salva com sucesso e proteção ativada!');
    setTimeout(() => setSecMsg(''), 4000);
  };

  const handleToggleSecurity = (enabled) => {
    if (enabled && !secConfig.passwordHash) {
      setSecError('Cadastre uma senha antes de ativar a proteção.');
      return;
    }
    const updated = {
      ...state,
      security: {
        ...secConfig,
        enabled
      }
    };
    setState(updated);
    saveStore(updated);
    setSecMsg(enabled ? 'Proteção do app ativada!' : 'Proteção do app desativada.');
    setTimeout(() => setSecMsg(''), 3000);
  };

  const handleToggleAutoLock = () => {
    const updated = {
      ...state,
      security: {
        ...secConfig,
        autoLockOnHide: !secConfig.autoLockOnHide
      }
    };
    setState(updated);
    saveStore(updated);
  };

  const handleRegisterBiometrics = async () => {
    setSecMsg('');
    setSecError('');
    setIsRegisteringBio(true);

    try {
      const credentialId = await registerBiometrics(state.user.handle, state.user.name);
      const updated = {
        ...state,
        security: {
          ...secConfig,
          biometricsEnabled: true,
          webAuthnCredentialId: credentialId
        }
      };
      setState(updated);
      saveStore(updated);
      setSecMsg('Face ID / Biometria cadastrada com sucesso!');
    } catch (err) {
      console.error(err);
      setSecError('Não foi possível registrar a biometria do dispositivo.');
    } finally {
      setIsRegisteringBio(false);
      setTimeout(() => {
        setSecMsg('');
        setSecError('');
      }, 4000);
    }
  };

  const handleTestBiometrics = async () => {
    setSecMsg('');
    setSecError('');
    try {
      const ok = await authenticateBiometrics(secConfig.webAuthnCredentialId);
      if (ok) {
        setSecMsg('Biometria / Face ID autenticado com sucesso!');
      }
    } catch (err) {
      console.warn('Erro no teste de biometria:', err);
      setSecError('Falha no teste de biometria. Verifique se o Face ID está configurado.');
    } finally {
      setTimeout(() => {
        setSecMsg('');
        setSecError('');
      }, 4000);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Deseja realmente restaurar os dados originais do Lipp Board?')) {
      localStorage.removeItem('lippboard_pwa_data_v1');
      localStorage.removeItem('lippboard_pwa_data_v2');
      localStorage.removeItem('lippboard_pwa_data_v3');
      localStorage.removeItem('lippboard_db');
      localStorage.removeItem('lippboard_db_v2');
      window.location.reload();
    }
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <h1 className="page-title">Configurações do Sistema</h1>
        <p className="page-subtitle">Personalize a aparência, perfil, segurança/biometria e tokens de acesso.</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} color="var(--accent-primary)" />
          Checklist das páginas
        </h3>
        <div className="module-page-checklist">
          {pageChecklist.map(([label, status]) => (
            <div key={label} className="page-check-item">
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{label}</span>
              <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700' }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
        
        {/* Card 1: Perfil do Usuário */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--accent-primary)" />
            Perfil do Usuário
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Personalize seu nome de exibição, handle do GitHub e informações de contato no Lipp Board.
          </p>

          {profileMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '12.5px', marginBottom: '12px' }}>
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="module-form-grid module-form-grid--2">
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nome Completo</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GitHub Username (Handle)</label>
                <input 
                  type="text" 
                  value={handle} 
                  onChange={(e) => setHandle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div className="module-form-grid module-form-grid--2">
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>URL do Avatar</label>
                <input 
                  type="text" 
                  value={avatar} 
                  onChange={(e) => setAvatar(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="submit" className="topbar-btn btn-primary" style={{ padding: '8px 20px' }}>
                Salvar Perfil
              </button>
            </div>
          </form>
        </div>

        {/* Card Nova: Segurança, senha e Face ID / WebAuthn */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--accent-primary)" />
            Segurança do App & Face ID (VPS / PWA)
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Proteja seu Lipp Board hospedado na VPS com senha de segurança e desbloqueio por Face ID / Biometria nativa.
          </p>

          {secMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '12.5px', marginBottom: '12px' }}>
              {secMsg}
            </div>
          )}

          {secError && (
            <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '12.5px', marginBottom: '12px' }}>
              {secError}
            </div>
          )}

          {/* Toggle de Ativar Segurança */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Bloqueio de Segurança do App</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {secConfig.enabled ? 'A proteção por senha / Biometria está ativada.' : 'Ative para solicitar autenticação ao abrir o PWA.'}
              </p>
            </div>
            <button 
              className={`topbar-btn ${secConfig.enabled ? 'btn-primary' : ''}`}
              onClick={() => handleToggleSecurity(!secConfig.enabled)}
            >
              {secConfig.enabled ? <Lock size={16} /> : <Shield size={16} />}
              <span>{secConfig.enabled ? 'Proteção Ativada' : 'Ativar Proteção'}</span>
            </button>
          </div>

          {/* Form de Definição de senha */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '600', marginBottom: '8px' }}>
              {secConfig.passwordHash ? 'Alterar senha de segurança' : 'Cadastrar senha de segurança'}
            </h4>
            <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="module-form-grid module-form-grid--2">
                <input 
                  type="password"
                  placeholder="Nova senha"
                  maxLength={64}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}
                />
                <input 
                  type="password"
                  placeholder="Confirmar senha"
                  maxLength={64}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="topbar-btn">
                  Salvar senha
                </button>
              </div>
            </form>
          </div>

          {/* Autenticação Biométrica / Face ID */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scan size={16} color="var(--accent-primary)" />
                  Face ID / Biometria do Dispositivo (WebAuthn)
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {secConfig.biometricsEnabled 
                    ? 'Biometria registrada neste dispositivo.' 
                    : isWebAuthnAvailable() 
                      ? 'Cadastre a biometria nativa para desbloquear o PWA sem digitar senha.'
                      : 'WebAuthn não está disponível no contexto atual (requer HTTPS na VPS).'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button"
                className="topbar-btn btn-primary"
                onClick={handleRegisterBiometrics}
                disabled={isRegisteringBio || !isWebAuthnAvailable()}
              >
                <Scan size={16} />
                <span>{secConfig.biometricsEnabled ? 'Recadastrar Face ID' : 'Cadastrar Face ID'}</span>
              </button>

              {secConfig.biometricsEnabled && (
                <button 
                  type="button"
                  className="topbar-btn"
                  onClick={handleTestBiometrics}
                >
                  <Check size={16} />
                  <span>Testar Biometria</span>
                </button>
              )}
            </div>
          </div>

          {/* Auto Lock on Hide */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
            <div>
              <h4 style={{ fontSize: '13.5px', fontWeight: '600' }}>Bloquear ao Minimizar / Trocar de Aba</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Travar o Lipp Board automaticamente quando a tela perder o foco.</p>
            </div>
            <button 
              className={`topbar-btn ${secConfig.autoLockOnHide ? 'btn-primary' : ''}`}
              onClick={handleToggleAutoLock}
            >
              <span>{secConfig.autoLockOnHide ? 'Sim' : 'Não'}</span>
            </button>
          </div>

        </div>
        
        {/* Card 3: Tema & PWA */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} color="var(--accent-primary)" />
            Aparência & PWA (Aplicativo Instalável)
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Tema da Interface</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Alterne entre os modos Escuro e Claro.</p>
            </div>
            <button 
              className="topbar-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Status do PWA</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Instale o Lipp Board diretamente na área de trabalho ou celular.</p>
            </div>
            {isPwaInstalled ? (
              <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={16} /> PWA Instalado
              </span>
            ) : (
              <button className="topbar-btn btn-primary" onClick={onInstallPwa}>
                <Download size={16} />
                <span>Instalar PWA</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 4: GitHub Personal Access Token */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--warning)" />
            Conexão GitHub Privado
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Opcional: insira seu <em>Personal Access Token (PAT)</em> para que o Lipp Board carregue repositórios, commits e PRs diretamente.
          </p>

          {savedMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '12.5px', marginBottom: '12px' }}>
              {savedMsg}
            </div>
          )}

          <form onSubmit={handleSaveToken} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
            <button type="submit" className="topbar-btn btn-primary">
              Salvar Token
            </button>
          </form>
        </div>

        {/* Card 5: Segurança e Backup */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--danger)" />
            Restauração de Dados
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Restaurar os dados originais de fábrica do aplicativo caso queira limpar o cache local.
          </p>

          <button className="topbar-btn" onClick={handleResetData} style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <RefreshCw size={15} />
            <span>Restaurar Dados Originais</span>
          </button>
        </div>

      </div>
    </div>
  );
}

