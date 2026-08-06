import React, { useState } from 'react';
import { Sun, Moon, Key, RefreshCw, CheckCircle, User, Lock, Shield, Bell, Send } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { saveStore, clearStore } from '../services/store.js';
import { clearPwaCache } from '../services/pwaService.js';
import { changePassword, resetRemoteState } from '../services/backendService.js';
import { getNotificationPermission, requestNotificationPermission, sendAppNotification, supportsNotifications } from '../services/notifications.js';

export default function SettingsModule({ state, setState, theme, setTheme }) {
  const [token, setToken] = useState(state.user.githubToken || '');
  const [name, setName] = useState(state.user.name || '');
  const [handle, setHandle] = useState(state.user.handle || '');
  const [email, setEmail] = useState(state.user.email || '');
  const [avatar, setAvatar] = useState(state.user.avatar || '');
  const [savedMsg, setSavedMsg] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [notificationBusy, setNotificationBusy] = useState(false);

  const displayName = state.auth?.displayName || state.user.name || 'Seu nome';
  const username = state.auth?.username || state.user.handle || 'seu-usuario';
  const notificationPermission = getNotificationPermission();
  const notificationsSupported = supportsNotifications();

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
    ['Configurações', 'Perfil, acesso, Face ID e tema'],
  ];

  const persistNotificationState = (enabled, permission) => {
    const updated = {
      ...state,
      notifications: {
        ...(state.notifications || {}),
        enabled,
        permission,
      },
    };
    setState(updated);
    saveStore(updated);
  };

  const handleNotificationPermission = async () => {
    setNotificationBusy(true);
    setNotificationError('');
    setNotificationMsg('');
    try {
      const permission = await requestNotificationPermission();
      persistNotificationState(permission === 'granted', permission);
      setNotificationMsg(permission === 'granted' ? 'Notificações ativadas neste dispositivo.' : 'Permissão de notificações negada.');
    } catch (err) {
      setNotificationError(err.message || 'Falha ao pedir permissão.');
    } finally {
      setNotificationBusy(false);
    }
  };

  const handleTestNotification = async () => {
    setNotificationBusy(true);
    setNotificationError('');
    setNotificationMsg('');
    try {
      const permission = notificationPermission === 'default' ? await requestNotificationPermission() : notificationPermission;
      if (permission !== 'granted') {
        throw new Error('Ative as notificações para enviar o teste.');
      }
      await sendAppNotification({
        title: 'Lipp Board',
        body: 'Notificação de teste enviada com sucesso.'
      });
      persistNotificationState(true, 'granted');
      setNotificationMsg('Teste de notificação enviado.');
    } catch (err) {
      setNotificationError(err.message || 'Falha ao enviar o teste.');
    } finally {
      setNotificationBusy(false);
    }
  };

  const handleSaveToken = (e) => {
    e.preventDefault();
    const updated = {
      ...state,
      user: {
        ...state.user,
        githubToken: token,
      },
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
        avatar,
      },
    };
    setState(updated);
    saveStore(updated);
    setProfileMsg('Perfil atualizado com sucesso!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      setPasswordError('Informe a senha atual e uma nova senha com pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A nova senha e a confirmação não conferem.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg('Senha alterada com sucesso.');
      setTimeout(() => setPasswordMsg(''), 3500);
    } catch (err) {
      setPasswordError(err.message || 'Não foi possível alterar a senha.');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Deseja realmente restaurar os dados originais do Lipp Board?')) {
      clearStore();
      await resetRemoteState();
      window.location.reload();
    }
  };

  return (
    <div className="module-page">
      <div className="page-header">
        <h1 className="page-title">CONFIGS</h1>
        <p className="page-subtitle">Perfil, acesso, tema e manutenção do app em um só lugar.</p>
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
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--accent-primary)" />
            Perfil principal
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Ajuste os dados exibidos no painel. O login principal fica separado e protegido pelo backend.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', padding: '14px', borderRadius: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, rgba(59,130,246,.24), rgba(15,23,42,.96))', color: 'white', fontWeight: 800, fontSize: '18px' }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{username}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Conta principal do Lipp Board</div>
            </div>
          </div>

          {profileMsg && <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '12.5px', marginBottom: '12px' }}>{profileMsg}</div>}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="module-form-grid module-form-grid--2">
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nome completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="settings-input" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Handle público</label>
                <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} className="settings-input" />
              </div>
            </div>

            <div className="module-form-grid module-form-grid--2">
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="settings-input" />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Avatar</label>
                <input type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="settings-input" placeholder="https://..." />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="topbar-btn btn-primary">Salvar perfil</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--accent-primary)" />
            Acesso e senha
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Troque a senha do login ou ajuste a entrada do app sem mexer nos dados salvos.
          </p>

          {passwordMsg && <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '12.5px', marginBottom: '12px' }}>{passwordMsg}</div>}
          {passwordError && <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '12.5px', marginBottom: '12px' }}>{passwordError}</div>}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="module-form-grid module-form-grid--3">
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Senha atual" className="settings-input" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha" className="settings-input" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar nova senha" className="settings-input" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="topbar-btn btn-primary">Atualizar senha</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--accent-primary)" />
            Auth em migração
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            O login principal já foi movido para Better Auth com email e senha.
            A parte biométrica volta depois, já encaixada no fluxo novo.
          </p>
          <div style={{ marginTop: '14px', padding: '12px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '12.5px' }}>
            Face ID: pausado nesta etapa.
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} color="var(--accent-primary)" />
            Interface
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Tema da interface</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Alterne entre os modos escuro e claro.</p>
            </div>
            <button className="topbar-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Modo escuro' : 'Modo claro'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Aparência geral</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configurações visuais pensadas para um app de celular.</p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={16} /> Ativo
            </span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--info)" />
            Notificações
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            iPhone, Android e desktop suportam notificações web quando o navegador permite e o app está instalado ou aberto em HTTPS.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Estado atual</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {notificationsSupported ? `Permissão: ${notificationPermission}` : 'Seu navegador não expõe notificações web.'}
              </p>
            </div>
            <button className="topbar-btn btn-primary" onClick={() => setShowNotificationsModal(true)}>
              <Bell size={16} />
              <span>Abrir</span>
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--warning)" />
            Conexão GitHub privada
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Opcional: insira seu Personal Access Token para carregar repositórios, commits e PRs diretamente.
          </p>

          {savedMsg && <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontSize: '12.5px', marginBottom: '12px' }}>{savedMsg}</div>}

          <form onSubmit={handleSaveToken} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="password"
              placeholder="«redacted:ghp_…»"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="settings-input settings-input--grow"
            />
            <button type="submit" className="topbar-btn btn-primary">Salvar token</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} color="var(--accent-primary)" />
            Cache e manutenção do PWA
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Limpa o cache do app, remove o service worker antigo e força o próximo carregamento a vir fresco.
          </p>

          <button
            type="button"
            className="topbar-btn btn-primary"
            onClick={async () => {
              if (window.confirm('Limpar cache do PWA e recarregar o app?')) {
                await clearPwaCache({ reload: true });
              }
            }}
          >
            <RefreshCw size={15} />
            <span>Limpar cache do PWA</span>
          </button>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--danger)" />
            Restauração de dados
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Volta tudo para o estado limpo do app, sem apagar sua conta no banco.
          </p>

          <button className="topbar-btn" onClick={handleResetData} style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <RefreshCw size={15} />
            <span>Restaurar dados originais</span>
          </button>
        </div>

        <Modal
          open={showNotificationsModal}
          title="Notificações web"
          onClose={() => setShowNotificationsModal(false)}
          width="560px"
          footer={(
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" className="topbar-btn" onClick={() => setShowNotificationsModal(false)}>Fechar</button>
              <button type="button" className="topbar-btn btn-primary" onClick={handleNotificationPermission} disabled={notificationBusy || notificationPermission === 'granted'}>
                <Bell size={15} />
                <span>{notificationBusy ? 'Ativando...' : notificationPermission === 'granted' ? 'Já ativadas' : 'Ativar notificações'}</span>
              </button>
              <button type="button" className="topbar-btn btn-primary" onClick={handleTestNotification} disabled={notificationBusy || notificationPermission !== 'granted'}>
                <Send size={15} />
                <span>Enviar teste</span>
              </button>
            </div>
          )}
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Isso usa a API de notificações do navegador. Funciona em iPhone, Android e PCs quando o navegador e o sistema permitem notificações para o site/PWA.
            </p>
            <div className="page-check-item">
              <span>Suporte no navegador</span>
              <strong>{notificationsSupported ? 'Sim' : 'Não'}</strong>
            </div>
            <div className="page-check-item">
              <span>Permissão atual</span>
              <strong>{notificationPermission}</strong>
            </div>
            {notificationMsg && <div className="inline-success">{notificationMsg}</div>}
            {notificationError && <div className="inline-error">{notificationError}</div>}
          </div>
        </Modal>
      </div>
    </div>
  );
}
