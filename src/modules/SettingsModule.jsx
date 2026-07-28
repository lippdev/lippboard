import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Download, Key, RefreshCw, CheckCircle, Shield } from 'lucide-react';
import { saveStore } from '../services/store.js';

export default function SettingsModule({ state, setState, theme, setTheme, isPwaInstalled, onInstallPwa }) {
  const [token, setToken] = useState(state.user.githubToken || '');
  const [savedMsg, setSavedMsg] = useState('');

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

  const handleResetData = () => {
    if (window.confirm('Deseja realmente restaurar os dados originais do Lipp Board?')) {
      localStorage.removeItem('lippboard_pwa_data_v1');
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configurações do Sistema</h1>
        <p className="page-subtitle">Personalize a aparência, tokens de acesso do GitHub e aplicativo PWA.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
        
        {/* Card 1: Tema & PWA */}
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

        {/* Card 2: GitHub Personal Access Token */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--warning)" />
            Conexão GitHub Privado (@lippdev)
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Opcional: insira seu <em>Personal Access Token (PAT)</em> para que o Lipp Board carregue repositórios e PRs privados diretamente.
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

        {/* Card 3: Segurança e Backup */}
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
