import React, { useState } from 'react';
import { Bot, Send, X, CheckCircle, Sparkles } from 'lucide-react';
import { processAgentCommand } from '../services/agentBridgeService.js';

export default function SubagentCommandDrawer({ isOpen, onClose, onStateChange }) {
  const [commandInput, setCommandInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const res = processAgentCommand(commandInput);
    setFeedback(res);
    setCommandInput('');
    if (onStateChange) onStateChange(res.state);

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleQuickPreset = (presetText) => {
    setCommandInput(presetText);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '440px',
        maxWidth: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Ponte do Subagente de IA</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Zero API Key & Zero Logins</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {feedback && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} />
            <span>{feedback.message}</span>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
            Solicite qualquer ação ao seu subagente (Gemini, ChatGPT ou Antigravity). O comando será processado e refletirá diretamente nas checklists, tarefas ou anotações do <strong>Lipp Board</strong>.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exemplos Rápidos:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <button 
                onClick={() => handleQuickPreset('Marcar que estudei inglês hoje por 30 minutos')}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={12} style={{ marginRight: '6px', color: 'var(--accent-primary)' }} />
                "Marcar que estudei inglês hoje por 30 minutos"
              </button>
              <button 
                onClick={() => handleQuickPreset('Criar tarefa "Revisar código do Lipp Board PWA" com prioridade alta')}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={12} style={{ marginRight: '6px', color: 'var(--accent-primary)' }} />
                "Criar tarefa 'Revisar código do Lipp Board PWA' com prioridade alta"
              </button>
              <button 
                onClick={() => handleQuickPreset('Criar nota "Arquitetura PWA 100% offline e sem OAuth"')}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={12} style={{ marginRight: '6px', color: 'var(--accent-primary)' }} />
                "Criar nota 'Arquitetura PWA 100% offline e sem OAuth'"
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Digite um comando para o subagente..." 
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
