// GitHub REST API Integration Service

/**
 * Helper to fetch data from GitHub API.
 * @param {string} endpoint - The endpoint suffix (e.g., 'search/issues').
 * @param {string} token - The personal access token.
 * @param {object} params - Query parameters.
 */
async function fetchGithub(endpoint, token, params = {}) {
  const url = new URL(`https://api.github.com/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}));
    throw new Error(errorDetails.message || `GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch PRs for a given handle and type.
 * @param {string} handle - GitHub username.
 * @param {string} token - GitHub Personal Access Token.
 */
export async function fetchUserPRs(handle, token) {
  if (!handle) return [];

  // Parallel fetch for different categories to align with tabs:
  // 1. Authored: is:pr author:{handle}
  // 2. Review Requested: is:pr review-requested:{handle}
  // 3. Mentioned: is:pr mentions:{handle}
  // 4. Assigned: is:pr assignee:{handle}
  // 5. In your repos: is:pr user:{handle} (excluding authored by self to keep clean)
  try {
    const [authoredData, reviewData, mentionedData, assignedData, reposData] = await Promise.all([
      fetchGithub('search/issues', token, { q: `is:pr author:${handle}` }).catch(() => ({ items: [] })),
      fetchGithub('search/issues', token, { q: `is:pr review-requested:${handle}` }).catch(() => ({ items: [] })),
      fetchGithub('search/issues', token, { q: `is:pr mentions:${handle}` }).catch(() => ({ items: [] })),
      fetchGithub('search/issues', token, { q: `is:pr assignee:${handle}` }).catch(() => ({ items: [] })),
      fetchGithub('search/issues', token, { q: `is:pr user:${handle}` }).catch(() => ({ items: [] })),
    ]);

    const formatPR = (item, type, statusLabel) => {
      // Extract repo name from html_url: e.g., https://github.com/owner/repo/pull/1
      const parts = item.html_url.split('/');
      const repo = `${parts[3]}/${parts[4]}`;
      const prNumber = parts[6];

      return {
        id: String(item.id),
        title: item.title,
        repo,
        prNumber,
        author: item.user?.login || 'unknown',
        additions: 0, // Search API does not return additions/deletions/filesCount directly without details fetch.
        deletions: 0, // We'll keep them as 0 or default to omit clutter.
        filesCount: 0,
        updatedAt: new Date(item.updated_at).toLocaleDateString('pt-BR'),
        status: statusLabel,
        type,
        url: item.html_url,
      };
    };

    const prs = [];

    // Map each response to standard state structures
    if (authoredData.items) {
      prs.push(...authoredData.items.map(item => formatPR(item, 'authored', 'AUTHORED')));
    }
    if (reviewData.items) {
      prs.push(...reviewData.items.map(item => formatPR(item, 'review', 'REVISÃO')));
    }
    if (mentionedData.items) {
      prs.push(...mentionedData.items.map(item => formatPR(item, 'mentioned', 'MENCIONADO')));
    }
    if (assignedData.items) {
      prs.push(...assignedData.items.map(item => formatPR(item, 'assigned', 'ATRIBUÍDO')));
    }
    if (reposData.items) {
      // Exclude already authored PRs from the repo feed to avoid redundancy
      const authoredIds = new Set(authoredData.items.map(i => i.id));
      const filteredRepos = reposData.items.filter(item => !authoredIds.has(item.id));
      prs.push(...filteredRepos.map(item => formatPR(item, 'repos', 'NOS REPOS')));
    }

    // De-duplicate in case a PR falls in multiple queries
    const seen = new Set();
    return prs.filter(pr => {
      const duplicate = seen.has(pr.id);
      seen.add(pr.id);
      return !duplicate;
    });
  } catch (error) {
    console.error('Error fetching PRs from GitHub API:', error);
    throw error;
  }
}

/**
 * Fetch recent activity events for a user handle.
 * @param {string} handle - GitHub username.
 * @param {string} token - GitHub Personal Access Token.
 */
export async function fetchUserActivity(handle, token) {
  if (!handle) return [];

  try {
    const events = await fetchGithub(`users/${handle}/events`, token, { per_page: 20 });
    
    // Map event types to readable format
    return events.map(event => {
      let description = '';
      let details = '';
      const date = new Date(event.created_at).toLocaleString('pt-BR');

      switch (event.type) {
        case 'PushEvent':
          const commitCount = event.payload.commits?.length || 0;
          const branch = event.payload.ref?.replace('refs/heads/', '') || 'main';
          description = `Efetuou push de ${commitCount} commit(s) na branch "${branch}"`;
          details = event.payload.commits?.[0]?.message || '';
          break;
        case 'PullRequestEvent':
          description = `${event.payload.action === 'opened' ? 'Abriu' : event.payload.action === 'closed' ? 'Fechou' : 'Atualizou'} o PR #${event.payload.number}`;
          details = event.payload.pull_request?.title || '';
          break;
        case 'PullRequestReviewEvent':
          description = `Revisou o PR #${event.payload.pull_request?.number}`;
          details = event.payload.review?.state || '';
          break;
        case 'IssuesEvent':
          description = `${event.payload.action === 'opened' ? 'Criou' : 'Fechou'} a Issue #${event.payload.issue?.number}`;
          details = event.payload.issue?.title || '';
          break;
        case 'CreateEvent':
          description = `Criou a ${event.payload.ref_type} "${event.payload.ref || ''}"`;
          details = `Repositório: ${event.repo.name}`;
          break;
        case 'DeleteEvent':
          description = `Deletou a ${event.payload.ref_type} "${event.payload.ref || ''}"`;
          details = `Repositório: ${event.repo.name}`;
          break;
        case 'IssueCommentEvent':
          description = `Comentou na Issue/PR #${event.payload.issue?.number}`;
          details = event.payload.comment?.body?.slice(0, 80) + '...' || '';
          break;
        default:
          description = `Evento de tipo ${event.type}`;
          details = `Repositório: ${event.repo.name}`;
      }

      return {
        id: event.id,
        type: event.type,
        repo: event.repo.name,
        description,
        details,
        date,
      };
    });
  } catch (error) {
    console.error('Error fetching activities from GitHub API:', error);
    throw error;
  }
}
