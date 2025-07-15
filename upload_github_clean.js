const fs = require('fs');
const path = require('path');

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE';
const REPO_OWNER = 'gameall123';
const REPO_NAME = 'Gameall123-new';

function githubRequest(method, endpoint, data = null) {
  const options = {
    method: method,
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GameAll-Upload-Script'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${endpoint}`, options)
    .then(response => response.json());
}

async function uploadFile(filePath, content) {
  try {
    const base64Content = Buffer.from(content).toString('base64');
    const result = await githubRequest('PUT', `/contents/${filePath}`, {
      message: `Upload ${filePath}`,
      content: base64Content,
      branch: 'main'
    });
    
    if (result.content) {
      console.log(`✅ ${filePath} uploaded successfully`);
    } else {
      console.log(`❌ Failed to upload ${filePath}:`, result.message);
    }
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error);
  }
}

async function uploadDirectory(dirPath, basePath = '') {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.join(basePath, item).replace(/\\/g, '/');
    
    if (fs.statSync(fullPath).isDirectory()) {
      await uploadDirectory(fullPath, relativePath);
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      await uploadFile(relativePath, content);
    }
  }
}

async function main() {
  console.log('🚀 Starting GameAll project upload to GitHub...');
  
  // Upload main directories
  await uploadDirectory('./client', 'client');
  await uploadDirectory('./server', 'server');
  await uploadDirectory('./shared', 'shared');
  
  console.log('✅ Upload completed!');
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { uploadFile, uploadDirectory, main };
} else {
  main();
}