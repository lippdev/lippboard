import React from 'react';
import { Folder, FileText, Link, ExternalLink } from 'lucide-react';

export default function FileBoardModule() {
  const files = [
    { id: '1', name: 'Documentação do Lipp Board PWA', type: 'doc', size: '24 KB', date: '28/07/2026' },
    { id: '2', name: 'Guia de Estudo de Idiomas - Anotações.md', type: 'markdown', size: '12 KB', date: '27/07/2026' },
    { id: '3', name: 'Link: Repositório GitHub (lippdev/lippboard)', type: 'link', size: 'URL', date: '28/07/2026', url: 'https://github.com/lippdev/lippboard.git' },
    { id: '4', name: 'Subagent Protocol Specs.json', type: 'code', size: '8 KB', date: '28/07/2026' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Arquivos & Links</h1>
        <p className="page-subtitle">Centralizador de documentos, notas de projeto e referências úteis.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {files.map(f => (
          <div key={f.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              {f.type === 'link' ? <Link size={20} color="var(--info)" /> : <FileText size={20} color="var(--accent-primary)" />}
              <h4 style={{ fontSize: '14px', fontWeight: '600', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.name}
              </h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>{f.size} · {f.date}</span>
              {f.url && (
                <a href={f.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Acessar <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
