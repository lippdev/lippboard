import React, { useState } from 'react';
import { 
  GitPullRequest, 
  RotateCw, 
  Unlink, 
  ExternalLink, 
  GitBranch, 
  Key, 
  Lock
} from 'lucide-react';
import { saveStore } from '../services/store.js';
import { fetchUserPRs, fetchUserActivity } from '../services/githubService.js';

export default function GithubModule({ state, setState }) {
  const [activeTab, setActiveTab] = useState('activity'); // Começa na atividade recente conforme preferência
  const [tokenInput, setTokenInput] = useState(state.user.githubToken || '');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const tabs = [
    { id: 'activity', label: 'Atividades Recentes' },
    { id: 'all', label: 'Todos os PRs' },
    { id: 'authored', label: 'Meus PRs' },
    { id: 'review', label: 'Revisão Solicitada' },
    { id: 'mentioned', label: 'Mencionados' },
    { id: 'assigned', label: 'Atribuídos' },
    { id: 'repos', label: 'Nos Repositórios' },
  ];

  const filteredPrs = state.github.prs.filter(pr => {
    if (activeTab === 'all') return true;
    if (activeTab === 'authored') return pr.type === 'authored';
    if (activeTab === 'review') return pr.type === 'review';
    if (activeTab === 'mentioned') return pr.type === 'mentioned';
    if (activeTab === 'assigned') return pr.type === 'assigned';
    if (activeTab === 'repos') return pr.type === 'repos';
    return true;
  });

  const handleSync = async () => {
    setSyncing(true);
    setErrorMsg('');
    try {
      const handle = state.user.handle;
      const token = state.user.githubToken;
      
      const [fetchedPrs, fetchedActivities] = await Promise.all([
        fetchUserPRs(handle, token),
        fetchUserActivity(handle, token)
      ]);

      const updated = {
        ...state,
        user: {
          ...state.user,
          lastSynced: new Date().toLocaleString('pt-BR')
        },
        github: {
          ...state.github,
          prs: fetchedPrs,
          activities: fetchedActivities
        }
      };
      setState(updated);
      saveStore(updated);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao sincronizar com o GitHub. Verifique seu token.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveToken = (e) => {
    e.preventDefault();
    const updated = {
      ...state,
      user: {
        ...state.user,
        githubToken: tokenInput
      }
    };
    setState(updated);
    saveStore(updated);
    setShowTokenModal(false);
  };

  const handleDisconnect = () => {
    if (window.confirm('Deseja desconectar seu token do GitHub e limpar PRs/atividades salvos?')) {
      const updated = {
        ...state,
        user: {
          ...state.user,
          githubToken: ''
        },
        github: {
          prs: [],
          activities: []
        }
      };
      setState(updated);
      saveStore(updated);
      setTokenInput('');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">GitHub</h1>
        <p className="page-subtitle">Sua atividade de commits, eventos e Pull Requests em tempo real.</p>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Account Sync Header Card */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <GitPullRequest size={22} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>GitHub · @{state.user.handle}</h3>
              {state.user.githubToken && (
                <span style={{ fontSize: '11px', background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={10} /> Token Privado Ativo
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Última sincronização: {state.user.lastSynced || 'Nunca sincronizado'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="topbar-btn" 
            onClick={() => setShowTokenModal(true)}
            title="Conectar repositórios privados"
          >
            <Key size={15} />
            <span>{state.user.githubToken ? 'Alterar Token' : 'Conectar GitHub'}</span>
          </button>

          <button 
            className="topbar-btn" 
            onClick={handleSync}
            disabled={syncing}
          >
            <RotateCw size={15} className={syncing ? 'spin' : ''} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar agora'}</span>
          </button>
          
          <button 
            className="topbar-btn" 
            style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
            onClick={handleDisconnect}
            disabled={!state.user.githubToken}
          >
            <Unlink size={15} />
            <span>Desconectar</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
              backgroundColor: activeTab === tab.id ? 'var(--text-primary)' : 'var(--bg-input)',
              color: activeTab === tab.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activeTab === 'activity' ? (
          (!state.github.activities || state.github.activities.length === 0) ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhuma atividade recente carregada. Clique em <strong>Sincronizar agora</strong> para buscar eventos do GitHub.
            </div>
          ) : (
            state.github.activities.map(act => (
              <div 
                key={act.id} 
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <GitBranch size={18} color="var(--accent-primary)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {act.description}
                    </h4>
                    {act.details && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{act.details}</p>}
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {act.repo} · {act.date}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          filteredPrs.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum Pull Request nesta categoria.
            </div>
          ) : (
            filteredPrs.map(pr => (

          <div 
            key={pr.id} 
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <GitBranch size={18} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {pr.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  <span>{pr.repo}#{pr.prNumber}</span>
                  <span>por <strong>{pr.author}</strong></span>
                  {(pr.additions > 0 || pr.deletions > 0) && (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      <strong style={{ color: 'var(--success)' }}>+{pr.additions}</strong> / <strong style={{ color: 'var(--danger)' }}>-{pr.deletions}</strong>
                    </span>
                  )}
                  {pr.filesCount > 0 && <span>{pr.filesCount} arquivos</span>}
                  <span>atualizado {pr.updatedAt}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: pr.status === 'AUTHORED' ? 'var(--badge-authored)' : pr.status === 'MENCIONADO' ? 'var(--badge-mentioned)' : 'var(--badge-repo)',
                color: pr.status === 'AUTHORED' ? 'var(--badge-authored-text)' : pr.status === 'MENCIONADO' ? 'var(--badge-mentioned-text)' : 'var(--badge-repo-text)'
              }}>
                {pr.status}
              </span>

              <a 
                href={pr.url} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))))}
      </div>

      {/* Modal para Inserção de Token Privado do GitHub */}
      {showTokenModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '420px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>GitHub Personal Access Token</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Insira um token de acesso pessoal do GitHub para que o Lipp Board carregue seus repositórios e PRs privados diretamente.
            </p>
            <form onSubmit={handleSaveToken}>
              <input 
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}
              />
              <div style={{ display: 'flex', justifyRight: 'flex-end', gap: '8px' }}>
                <button 
                  type="button" 
                  className="topbar-btn"
                  onClick={() => setShowTokenModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="topbar-btn btn-primary">
                  Salvar Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
