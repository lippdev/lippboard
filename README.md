# lippboard

App pessoal em React + Vite para uso como PWA/mobile-first.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run mcp
```

## MCP do projeto

Este repositório inclui um servidor MCP local para outras IAs controlarem o projeto.

### Comando

```bash
node ./mcp/lippboard-mcp.js
```

### Ferramentas expostas

- `project_status` — status do projeto, git e scripts disponíveis
- `read_repo_file` — lê um arquivo dentro do repo
- `write_repo_file` — escreve um arquivo dentro do repo
- `replace_repo_text` — substitui texto em um arquivo
- `search_repo` — busca conteúdo nos arquivos
- `list_repo_files` — lista arquivos por glob
- `run_script` — executa `build` ou `lint`
- `git_commit` — faz commit com autor configurado

### Hermes / MCP client

Para conectar no Hermes, use o servidor local no `mcp/lippboard-mcp.js`.

Se quiser, eu também posso te passar um exemplo de configuração para Cursor, Claude Desktop ou outro cliente MCP.
