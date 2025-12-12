// Shared utilities for ForkFeed

// Load site config
async function loadConfig() {
  const defaults = {
    siteName: 'ForkFeed',
    authorName: 'Anonymous',
    repoUrl: '',
    branch: 'main'
  };
  
  try {
    const res = await fetch('config.json');
    if (res.ok) {
      return { ...defaults, ...await res.json() };
    }
  } catch (e) {}
  
  return defaults;
}

// Escape HTML
function esc(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
}

// Format date with 24-hour time
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Setup action buttons (Subscribe, New Post)
function setupButtons(config) {
  if (!config.repoUrl) return;
  
  const branch = config.branch || 'main';
  
  // Subscribe button
  const subscribeBtn = document.getElementById('subscribe-btn');
  if (subscribeBtn) {
    subscribeBtn.href = `${config.repoUrl}/edit/${branch}/feeds.json`;
    subscribeBtn.target = '_blank';
    subscribeBtn.style.display = 'inline-block';
  }
  
  // New post button
  const newPostBtn = document.getElementById('new-post-btn');
  if (newPostBtn) {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toISOString();
    const template = `---\ndate: "${time}"\n---\n\n`;
    const filename = `posts/${today}-post.md`;
    
    newPostBtn.href = `${config.repoUrl}/new/${branch}?filename=${encodeURIComponent(filename)}&value=${encodeURIComponent(template)}`;
    newPostBtn.target = '_blank';
    newPostBtn.style.display = 'inline-block';
  }
}

// Update nav to show author name as posts link
function updateNav(config) {
  const postsLink = document.getElementById('posts-link');
  if (postsLink && config.authorName) {
    postsLink.textContent = config.authorName;
  }
}

// Extract plain text snippet from HTML
function getSnippet(html, maxLength = 200) {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength).trim() + '...' : text;
}

// Check if content is just a "Comments" link (like HN)
function isCommentsLink(html) {
  return html && /^<a[^>]*>Comments<\/a>$/i.test(html);
}

// Check if content contains an image
function hasImage(html) {
  return html && html.includes('<img');
}

// Extract first image src from HTML
function extractImageSrc(html) {
  const match = html && html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

