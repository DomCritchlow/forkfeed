import fs from 'fs';

// Generate config.json from environment variables
// These are set automatically by GitHub Actions or can be overridden

const config = {
  siteName: process.env.SITE_TITLE || 'ForkFeed',
  siteUrl: process.env.SITE_URL || '',
  siteDescription: process.env.SITE_DESCRIPTION || 'A personal microblog',
  authorName: process.env.AUTHOR_NAME || 'Anonymous',
  repoUrl: process.env.REPO_URL || '',
  branch: process.env.DEFAULT_BRANCH || 'main'
};

fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
console.log('Generated config.json');
console.log(`  Author: ${config.authorName}`);
console.log(`  Site: ${config.siteName}`);

