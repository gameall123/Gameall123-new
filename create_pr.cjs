const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE';
const REPO_OWNER = 'gameall123';
const REPO_NAME = 'Gameall123-new';
const BASE_BRANCH = 'main';

function run(cmd) {
  return execSync(cmd, { stdio: 'inherit' });
}

async function createPullRequest(branchName, title, body) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GameAll-PR-Script'
    },
    body: JSON.stringify({
      title,
      head: branchName,
      base: BASE_BRANCH,
      body
    })
  });
  const data = await res.json();
  if (data.html_url) {
    console.log(`✅ Pull request creata: ${data.html_url}`);
  } else {
    console.error('❌ Errore creazione PR:', data);
  }
}

async function main() {
  const branchName = `auto/pr-${Date.now()}`;
  const title = 'Modifiche automatiche da chat';
  const body = 'Questa PR contiene le modifiche automatiche apportate tramite chat.';

  run(`git checkout -b ${branchName}`);
  run('git add .');
  run(`git commit -m "${title}" || echo "Nessuna modifica da committare"`);
  run(`git push origin ${branchName}`);

  await createPullRequest(branchName, title, body);
}

main();