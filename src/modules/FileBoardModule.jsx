import React, { useState, useEffect, useCallback } from 'react';
import { FileText, ExternalLink, Plus, Trash2, Download, Upload } from 'lucide-react';
import { getAllFiles, getFile, saveFile, deleteFile, formatBytes } from '../services/fileStorageService.js';

export default function FileBoardModule({ state, setState }) {
  const files = state.files || [];
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const loadFiles = useCallback(async () => {
    try {
      const data = await getAllFiles();
      if (data.length === 0 && (!state.files || state.files.length === 0)) {
        // Mock inicial caso esteja vazio, para que o usuário não veja o painel em branco
        const initialMock = [
          { id: '1', name: 'Documentação do Lipp Board PWA', type: 'doc', size: '24 KB', date: '28/07/2026' },
          { id: '2', name: 'Guia de Estudo de Idiomas - Anotações.md', type: 'markdown', size: '12 KB', date: '27/07/2026' },
          { id: '3', name: 'Link: Repositório GitHub (lippdev/lippboard)', type: 'link', size: 'URL', date: '28/07/2026', url: 'https://github.com/lippdev/lippboard.git' }
        ];
        // Salva mock inicial no IndexedDB
        for (const item of initialMock) {
          await saveFile(item);
        }
        const updated = {
          ...state,
          files: initialMock
        };
        setState(updated);
        saveStore(updated);
      } else {
        // Sincroniza metadados para o state local (localStorage) excluindo os dados binários (content)
        const metadata = data.map(({ id, name, type, size, date, url }) => ({
          id, name, type, size, date, url
        }));
        
        const updated = {
          ...state,
          files: metadata
        };
        setState(updated);
        saveStore(updated);
      }
    } catch (err) {
      console.error('Erro ao ler arquivos do IndexedDB:', err);
    }
  }, [state, setState]);

  // Carrega arquivos salvos do IndexedDB ao montar o componente
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUpload = async (e) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      let docType = 'doc';
      if (file.type.includes('image')) docType = 'image';
      else if (file.name.endsWith('.md')) docType = 'markdown';
      else if (file.name.endsWith('.js') || file.name.endsWith('.json') || file.name.endsWith('.html') || file.name.endsWith('.css')) docType = 'code';

      const fileObj = {
        id: 'f_' + Date.now() + '_' + i,
        name: file.name,
        type: docType,
        size: formatBytes(file.size),
        date: new Date().toLocaleDateString('pt-BR'),
        content: file // O IndexedDB pode armazenar arquivos/blobs diretamente
      };

      try {
        await saveFile(fileObj);
      } catch (err) {
        console.error('Erro ao salvar arquivo no IndexedDB:', err);
        alert('Falha ao salvar o arquivo. O IndexedDB pode estar sem espaço.');
      }
    }
    loadFiles();
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    // Garante que o link tem protocolo correto
    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const linkObj = {
      id: 'l_' + Date.now(),
      name: linkTitle,
      type: 'link',
      size: 'URL',
      date: new Date().toLocaleDateString('pt-BR'),
      url: formattedUrl
    };

    try {
      await saveFile(linkObj);
      setLinkTitle('');
      setLinkUrl('');
      setShowLinkForm(false);
      loadFiles();
    } catch (err) {
      console.error('Erro ao salvar link no IndexedDB:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteFile(id);
        loadFiles();
      } catch (err) {
        console.error('Erro ao deletar arquivo:', err);
      }
    }
  };

  const handleDownload = async (fileObj) => {
    try {
      const fullFile = await getFile(fileObj.id);
      if (!fullFile || !fullFile.content) {
        alert('Conteúdo do arquivo não encontrado localmente no IndexedDB.');
        return;
      }
      const url = URL.createObjectURL(fullFile.content);
      const a = document.createElement('a');
      a.href = url;
      a.download = fullFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar arquivo do IndexedDB:', err);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Arquivos & Links</h1>
          <p className="page-subtitle">Centralizador de documentos locais no navegador e referências úteis.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label className="topbar-btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={15} />
            <span>Upload de Arquivo</span>
            <input 
              type="file" 
              multiple 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>
          <button className="topbar-btn" onClick={() => setShowLinkForm(!showLinkForm)}>
            <Plus size={15} />
            <span>Adicionar Link</span>
          </button>
        </div>
      </div>

      {showLinkForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Adicionar Link de Referência</h3>
          <form onSubmit={handleAddLink} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Título / Nome do Link</label>
              <input 
                type="text" 
                placeholder="Ex: Documentação Figma, Repositório Git..."
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
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
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>URL</label>
              <input 
                type="text" 
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="topbar-btn btn-primary" style={{ padding: '9px 16px' }}>Salvar</button>
              <button type="button" className="topbar-btn" onClick={() => setShowLinkForm(false)} style={{ padding: '9px 16px' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {files.map(f => (
          <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '120px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-color)'
                }}>
                  <FileText size={18} color="var(--accent-primary)" />
                </div>
                <h4 
                  title={f.name}
                  style={{ fontSize: '14px', fontWeight: '600', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {f.name}
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
              <span>{f.size} · {f.date}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {f.type === 'link' ? (
                  f.url && (
                    <a href={f.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Visitar <ExternalLink size={12} />
                    </a>
                  )
                ) : (
                  <button 
                    onClick={() => handleDownload(f)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}
                  >
                    Baixar <Download size={12} />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(f.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
