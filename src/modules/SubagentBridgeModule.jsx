import React, { useState } from 'react';
import { Bot, Terminal, Download, Upload, CheckCircle, Copy, Sparkles } from 'lucide-react';
import { processAgentCommand } from '../services/agentBridgeService.js';
import { saveStore } from '../services/store.js';

export default function SubagentBridgeModule({ state, setState }) {
  const [testCmd, setTestCmd] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleTestCommand = (e) => {
    e.preventDefault();
    if (!testCmd.trim()) return;

    const res = processAgentCommand(testCmd);
    setState(res.state);
    setTestCmd('');
  };

  const handleExportState = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "lipp-board-estado.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyPromptTemplate = () => {
    const template = `Você é um subagente assistente do sistema Lipp Board. Execute as seguintes tarefas adicionando-as à checklist de estudos e tarefas do dia do usuário Filipe Moreira (@lippdev):
- Estudo de Idiomas: Confirmar checklist de estudo de Inglês por 30 minutos.
- Tarefas: Adicionar a tarefa "Revisar PRs do repositório lippboard.git" com prioridade Alta.`;

    navigator.clipboard.writeText(template);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ponte do Subagente de IA</h1>
        <p className="page-subtitle">Protocolo de comunicação local para assistentes (Gemini, ChatGPT, Antigravity) sem chaves de API nem OAuth.</p>
      </div>

      {/* Grid de Operações */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Card de Teste Direto */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="var(--accent-primary)" />
            Executar Comando de Teste
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Envie uma instrução para simular o comportamento do seu subagente no aplicativo.
          </p>

          <form onSubmit={handleTestCommand} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Ex: Marcar que estudei inglês hoje por 45 minutos"
              value={testCmd}
              onChange={(e) => setTestCmd(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                color: 'var(--text-primary)'
              }}
            />
            <button type="submit" className="topbar-btn btn-primary" style={{ justifyContent: 'center' }}>
              Executar no Estado Local
            </button>
          </form>
        </div>

        {/* Card Modelo de Prompt para Copiar */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--warning)" />
            Prompt para o seu Assistente / IA
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Copie o modelo de instrução para enviar ao Gemini ou ChatGPT.
          </p>

          <button 
            className="topbar-btn" 
            onClick={copyPromptTemplate}
            style={{ width: '100%', justifyContent: 'center', backgroundColor: copiedPrompt ? 'var(--success-bg)' : 'var(--bg-input)', color: copiedPrompt ? 'var(--success)' : 'var(--text-primary)' }}
          >
            <Copy size={16} />
            <span>{copiedPrompt ? 'Copiado para a área de transferência!' : 'Copiar Prompt de Instrução'}</span>
          </button>
        </div>
      </div>

      {/* Histórico de Ações do Subagente */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Histórico de Execuções dos Subagentes</h3>
          <button className="topbar-btn" onClick={handleExportState}>
            <Download size={14} />
            <span>Exportar Estado (JSON)</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {state.subagentLogs.map(log => (
            <div 
              key={log.id}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={16} color="var(--success)" />
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '600' }}>{log.details}</h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{log.agent} · {log.timestamp}</span>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--success)', backgroundColor: 'var(--success-bg)', padding: '2px 8px', borderRadius: '4px' }}>
                {log.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
