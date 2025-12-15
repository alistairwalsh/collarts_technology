import fetch from 'node-fetch';

export const slashCommands = [
  {
    name: 'rat-status',
    description: 'Summarise latest GitHub commits + checks for a branch',
    options: [
      {
        name: 'branch',
        description: 'Branch to inspect (defaults to main)',
        type: 3,
        required: false
      }
    ]
  },
  {
    name: 'deploy-fresh-cheese',
    description: 'Trigger a Vercel deployment for a ref',
    options: [
      {
        name: 'ref',
        description: 'Branch or commit to deploy (defaults to main)',
        type: 3,
        required: false
      }
    ]
  },
  {
    name: 'hide-the-stash',
    description: 'Roll back to the previous healthy Vercel deployment'
  },
  {
    name: 'open-issue',
    description: 'Create a GitHub issue from the current discussion',
    options: [
      { name: 'title', description: 'Issue title', type: 3, required: true },
      { name: 'summary', description: 'Short summary', type: 3, required: true }
    ]
  },
  {
    name: 'patch-notes',
    description: 'Summarise the latest merged pull requests'
  }
];

export async function handleApplicationCommand(interaction) {
  const name = interaction?.data?.name;
  switch (name) {
    case 'rat-status':
      return ratStatus(interaction);
    case 'deploy-fresh-cheese':
      return deployFreshCheese(interaction);
    case 'hide-the-stash':
      return hideTheStash();
    case 'open-issue':
      return openIssue(interaction);
    case 'patch-notes':
      return patchNotes();
    default:
      return respond(`Unknown command: ${name}`);
  }
}

function respond(content) {
  return {
    type: 4,
    data: { content }
  };
}

async function ratStatus(interaction) {
  const branch = interaction?.data?.options?.find(opt => opt.name === 'branch')?.value || 'main';
  const activity = await fetchGithubBranchSummary(branch);
  return respond(
    `Latest on ${branch}:\n` +
      `• Commits: ${activity.commitCount}\n` +
      `• Last commit: ${activity.lastCommit}\n` +
      `• Checks: ${activity.checkState}`
  );
}

async function deployFreshCheese(interaction) {
  const ref = interaction?.data?.options?.find(opt => opt.name === 'ref')?.value || 'main';
  const deployment = await triggerVercelDeploy(ref);
  return respond(
    deployment.ok
      ? `Deploy queued for ${ref}. Preview: ${deployment.previewUrl || 'pending...'}`
      : `Could not queue deploy for ${ref}: ${deployment.error}`
  );
}

async function hideTheStash() {
  const rollback = await triggerVercelRollback();
  return respond(
    rollback.ok
      ? `Rolled back to ${rollback.target}. Production should stabilise shortly.`
      : `Rollback failed: ${rollback.error}`
  );
}

async function openIssue(interaction) {
  const title = interaction?.data?.options?.find(opt => opt.name === 'title')?.value;
  const summary = interaction?.data?.options?.find(opt => opt.name === 'summary')?.value;
  const issue = await createGithubIssue(title, summary, interaction);
  return respond(
    issue.ok ? `Opened ${issue.url}` : `Issue not created: ${issue.error}`
  );
}

async function patchNotes() {
  const notes = await generatePatchNotes();
  return respond(notes);
}

async function fetchGithubBranchSummary(branch) {
  const token = process.env.GITHUB_APP_TOKEN;
  if (!token) {
    return {
      commitCount: 'unknown (set GITHUB_APP_TOKEN)',
      lastCommit: 'n/a',
      checkState: 'n/a'
    };
  }
  const url = `https://api.github.com/repos/${process.env.GITHUB_REPO}/commits?sha=${encodeURIComponent(branch)}&per_page=5`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'collarts-max4live-bot'
    }
  });
  if (!res.ok) {
    return {
      commitCount: 'unknown',
      lastCommit: `error ${res.status}`,
      checkState: 'n/a'
    };
  }
  const commits = await res.json();
  const last = commits[0];
  return {
    commitCount: commits.length,
    lastCommit: last ? `${last.sha.slice(0, 7)} — ${last.commit.message.split('\n')[0]}` : 'none',
    checkState: 'query via /repos/:owner/:repo/commits/:ref/statuses (TODO)'
  };
}

async function triggerVercelDeploy(ref) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return { ok: false, error: 'VERCEL_TOKEN not configured' };
  }
  const project = process.env.VERCEL_PROJECT;
  const res = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: project,
      gitSource: { type: 'github', ref },
      target: 'production'
    })
  });
  if (!res.ok) {
    return { ok: false, error: `Vercel ${res.status}` };
  }
  const json = await res.json();
  return { ok: true, previewUrl: json?.url ? `https://${json.url}` : undefined };
}

async function triggerVercelRollback() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    return { ok: false, error: 'VERCEL_TOKEN or VERCEL_PROJECT_ID missing' };
  }
  const res = await fetch(`https://api.vercel.com/v13/deployments/${projectId}/rollback`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    return { ok: false, error: `Vercel ${res.status}` };
  }
  const json = await res.json();
  return { ok: true, target: json?.target || 'previous release' };
}

async function createGithubIssue(title, summary, interaction) {
  const token = process.env.GITHUB_APP_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    return { ok: false, error: 'GITHUB_APP_TOKEN or GITHUB_REPO missing' };
  }
  const body = `${summary}\n\n_Opened by ${interaction.member?.user?.username || 'unknown'} via Discord._`;
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'collarts-max4live-bot',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, body })
  });
  if (!res.ok) {
    return { ok: false, error: `GitHub ${res.status}` };
  }
  const json = await res.json();
  return { ok: true, url: json.html_url };
}

async function generatePatchNotes() {
  const token = process.env.GITHUB_APP_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    return 'Cannot build patch notes without GITHUB_APP_TOKEN / GITHUB_REPO';
  }
  const merged = await fetch(`https://api.github.com/repos/${repo}/pulls?state=closed&per_page=5`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'collarts-max4live-bot'
    }
  });
  if (!merged.ok) {
    return `GitHub error ${merged.status}`;
  }
  const pulls = (await merged.json()).filter(pr => pr.merged_at);
  if (!pulls.length) {
    return 'No merged pull requests yet.';
  }
  const lines = pulls.map(pr => `• ${pr.title} (#${pr.number}) by ${pr.user?.login}`);
  return ['Latest patch notes:', ...lines].join('\n');
}
