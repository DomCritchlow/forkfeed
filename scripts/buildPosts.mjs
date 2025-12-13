import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, linkify: true });

// Character limit for posts (like Twitter)
const MAX_CHARS = 300;

// Configuration from environment variables with sensible defaults
const SITE_TITLE = process.env.SITE_TITLE || 'ForkFeed';
const SITE_URL = process.env.SITE_URL || 'https://example.github.io/forkfeed';
const SITE_DESCRIPTION = process.env.SITE_DESCRIPTION || 'A personal microblog';

const POSTS_DIR = 'posts';
const POSTS_JSON_PATH = 'posts.json';
const RSS_PATH = 'rss.xml';

/**
 * Read and parse all markdown posts from the posts directory
 */
function readPosts() {
  const posts = [];
  
  if (!fs.existsSync(POSTS_DIR)) {
    console.log(`Posts directory "${POSTS_DIR}" not found, creating empty posts.json`);
    return posts;
  }
  
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  
  for (const filename of files) {
    const filepath = path.join(POSTS_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    
    try {
      const { data: frontmatter, content: body } = matter(content);
      
      // Skip drafts
      if (frontmatter.draft === true) {
        console.log(`Skipping draft: ${filename}`);
        continue;
      }
      
      // Validate date
      if (!frontmatter.date) {
        console.log(`Skipping post with missing date: ${filename}`);
        continue;
      }
      
      const date = new Date(frontmatter.date);
      if (isNaN(date.getTime())) {
        console.log(`Skipping post with invalid date: ${filename}`);
        continue;
      }
      
      // Derive id from frontmatter or filename
      const id = frontmatter.id || filename.replace(/\.md$/, '');
      
      // Get plain text for character count
      const plainText = body.trim();
      const charCount = plainText.length;
      
      // Warn if over limit (but still include)
      if (charCount > MAX_CHARS) {
        console.warn(`Warning: ${filename} exceeds ${MAX_CHARS} chars (${charCount} chars)`);
      }
      
      // Convert markdown to HTML
      const html = md.render(plainText);
      
      posts.push({
        id,
        title: frontmatter.title || null,
        date: frontmatter.date,
        type: frontmatter.type || 'text',
        image: frontmatter.image || null,
        tags: frontmatter.tags || [],
        url: `post.html?id=${encodeURIComponent(id)}`,
        html
      });
    } catch (err) {
      console.error(`Error parsing ${filename}:`, err.message);
    }
  }
  
  // Sort by date descending (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return posts;
}

/**
 * Generate RSS 2.0 XML from posts
 */
function generateRSS(posts) {
  const escapeXml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
  
  const formatRFC822 = (isoDate) => {
    const date = new Date(isoDate);
    return date.toUTCString();
  };
  
  const items = posts.map(post => {
    const title = post.title || post.html.replace(/<[^>]*>/g, '').slice(0, 50) + '...';
    const fullUrl = `${SITE_URL}${post.url}`;
    
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(fullUrl)}</link>
      <guid isPermaLink="true">${escapeXml(fullUrl)}</guid>
      <pubDate>${formatRFC822(post.date)}</pubDate>
      <description><![CDATA[${post.html}]]></description>
    </item>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(SITE_URL)}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

// Main execution
console.log('Building posts...');
console.log(`Site: ${SITE_TITLE} (${SITE_URL})`);

const posts = readPosts();
console.log(`Found ${posts.length} published post(s)`);

// Write posts.json
fs.writeFileSync(POSTS_JSON_PATH, JSON.stringify(posts, null, 2));
console.log(`Wrote ${POSTS_JSON_PATH}`);

// Write rss.xml
const rss = generateRSS(posts);
fs.writeFileSync(RSS_PATH, rss);
console.log(`Wrote ${RSS_PATH}`);

console.log('Done!');

