const { execSync } = require('child_process');

function run(cmd) {
  return execSync(cmd, { stdio: 'inherit' });
}

function main() {
  const title = 'Modifiche automatiche da chat (commit diretto su main)';
  run('git checkout main');
  run('git pull origin main');
  run('git add .');
  run(`git commit -m "${title}" || echo "Nessuna modifica da committare"`);
  run('git push origin main');
  console.log('✅ Modifiche pushate direttamente su main!');
}

main();