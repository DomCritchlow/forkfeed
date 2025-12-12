# ForkFeed

A minimal, self-hosted microblog with RSS feed aggregation. Runs entirely on GitHub Pages — no server, no database, no algorithms.

## What is ForkFeed?

ForkFeed is a personal social feed that you own and control:

- **Post** short updates and photos from your browser (via GitHub)
- **Follow** any RSS feed — blogs, news sites, other ForkFeed users
- **View** everything in one unified timeline
- **Share** your posts via auto-generated RSS feed

Think Twitter meets RSS reader, but it's just static files on GitHub Pages.

## Features

| Feature | Description |
|---------|-------------|
| **Microblog** | 300-char posts with optional images |
| **RSS Aggregator** | Follow any RSS feed (xkcd, Hacker News, blogs, etc.) |
| **Unified Timeline** | Your posts + feeds you follow, sorted by date |
| **Auto-generated RSS** | Others can subscribe to your posts |
| **Zero Config** | GitHub username becomes your display name |
| **No Backend** | 100% static, hosted on GitHub Pages |
| **One-click Posting** | "New post" button opens GitHub file editor |

## Quick Start

### 1. Fork this repo

Click **Fork** to create your own copy.

### 2. Enable GitHub Pages

Go to **Settings → Pages → Deploy from branch → main**

### 3. Start posting

Visit your site at `https://<username>.github.io/forkfeed/`

Click **New post** to create your first post.

### 4. Delete example content

Remove the example posts in `posts/` and example feeds in `feeds.json`.

## Usage

### Creating Posts

Click **New post** in the nav, or manually create a file in `posts/`:

```markdown
---
date: "2025-12-12T10:30:00Z"
---

Your post content here. Supports **markdown**.
```

#### Photo post

```markdown
---
date: "2025-12-12T10:30:00Z"
image: "/media/photo.jpg"
---

Caption for your photo ✨
```

Upload images to the `media/` folder.

### Following RSS Feeds

Click **Subscribe** in the nav, or edit `feeds.json` directly:

```json
[
  { "name": "xkcd", "url": "https://xkcd.com/rss.xml" },
  { "name": "Hacker News", "url": "https://news.ycombinator.com/rss" },
  { "name": "A Friend", "url": "https://friend.github.io/forkfeed/rss.xml" }
]
```

Feeds refresh on every push. To auto-refresh on a schedule, uncomment in `.github/workflows/build.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

## Pages

| URL | Description |
|-----|-------------|
| `/` | Home — unified timeline (your posts + feeds) |
| `/posts.html` | Your posts only |
| `/feed.html?name=X` | Single feed view |
| `/post.html?id=X` | Single post view |
| `/rss.xml` | Your RSS feed |

## Customization

Set repository variables at **Settings → Secrets and variables → Actions → Variables**:

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTHOR_NAME` | Your display name | GitHub username |
| `SITE_TITLE` | Site title | ForkFeed |
| `DEFAULT_BRANCH` | Branch for new posts | Current branch |

## Limits

To keep things fast and focused:

- Posts: 300 character soft limit (warning in build)
- Feeds: 10 items per feed, 100 items total in timeline

## Project Structure

```
forkfeed/
├── index.html          # Home (unified timeline)
├── posts.html          # Your posts
├── feed.html           # Single feed view
├── post.html           # Single post view
├── styles.css          # Shared styles
├── app.js              # Shared JavaScript
├── posts/              # Your markdown posts
├── media/              # Your images
├── feeds.json          # RSS feeds you follow
├── scripts/
│   ├── buildConfig.mjs     # Generates config.json
│   ├── buildPosts.mjs      # Generates posts.json + rss.xml
│   └── buildAggregator.mjs # Generates timeline.json
├── .github/
│   └── workflows/
│       └── build.yml   # GitHub Actions workflow
└── [generated]
    ├── config.json     # Site configuration
    ├── posts.json      # Parsed posts
    ├── timeline.json   # Aggregated feeds
    └── rss.xml         # Your RSS feed
```

## For Maintainers: Dual-Branch Setup

To use this repo as both a template and your personal blog:

| Branch | Purpose |
|--------|---------|
| `main` | Template with example content (for forking) |
| `live` | Your personal blog (deploy from this branch) |

```bash
# Create personal branch
git checkout -b live
git push -u origin live

# Configure Pages to deploy from 'live'
# Settings → Pages → Branch: live

# Workflow:
# - Template/code changes: commit to main, merge to live
# - Personal posts: commit directly to live
```

## Local Development

```bash
npm install
npm run build
python3 -m http.server 3000
# Open http://localhost:3000
```

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no frameworks)
- **Build**: Node.js scripts
- **Dependencies**: gray-matter, markdown-it, fast-xml-parser
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## License

[MIT](LICENSE)
