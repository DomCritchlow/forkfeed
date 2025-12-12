import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

const FEEDS_JSON_PATH = 'feeds.json';
const TIMELINE_JSON_PATH = 'timeline.json';

// Limits to prevent timeline from getting too large
const MAX_ITEMS_PER_FEED = 10;
const MAX_TOTAL_ITEMS = 100;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
});

/**
 * Read and parse feeds.json
 */
function readFeeds() {
  if (!fs.existsSync(FEEDS_JSON_PATH)) {
    console.log(`${FEEDS_JSON_PATH} not found, creating empty timeline`);
    return [];
  }
  
  const content = fs.readFileSync(FEEDS_JSON_PATH, 'utf-8');
  const feeds = JSON.parse(content);
  
  if (!Array.isArray(feeds)) {
    console.error('feeds.json must be an array');
    return [];
  }
  
  return feeds.filter(feed => {
    if (!feed.url) {
      console.log(`Skipping feed entry without url: ${JSON.stringify(feed)}`);
      return false;
    }
    return true;
  });
}

/**
 * Fetch and parse a single RSS feed
 */
async function fetchFeed(feed) {
  try {
    console.log(`Fetching: ${feed.name || feed.url}`);
    
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'ForkFeed/1.0 RSS Aggregator'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xml = await response.text();
    const parsed = parser.parse(xml);
    
    // Handle RSS 2.0 format
    const channel = parsed?.rss?.channel;
    if (!channel) {
      throw new Error('Invalid RSS format: missing channel');
    }
    
    const channelLink = channel.link || new URL(feed.url).origin;
    let items = channel.item || [];
    
    // Ensure items is an array (single item comes as object)
    if (!Array.isArray(items)) {
      items = [items];
    }
    
    // Limit items per feed
    const limitedItems = items.slice(0, MAX_ITEMS_PER_FEED);
    return limitedItems.map(item => normalizeItem(item, feed, channelLink));
  } catch (err) {
    console.error(`Error fetching ${feed.name || feed.url}:`, err.message);
    return [];
  }
}

/**
 * Normalize an RSS item to timeline format
 */
function normalizeItem(item, feed, channelLink) {
  // Get post URL
  const postUrl = item.link || item.guid?.['#text'] || item.guid || null;
  if (!postUrl) {
    return null;
  }
  
  // Parse date
  let date = null;
  const rawDate = item.pubDate || item['dc:date'] || item.date;
  if (rawDate) {
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      date = parsed.toISOString();
    }
  }
  
  if (!date) {
    return null;
  }
  
  // Get content
  const contentHtml = item['content:encoded'] || item.description || '';
  
  // Get title
  const title = item.title || '';
  
  // Generate stable ID
  const guid = item.guid?.['#text'] || item.guid || postUrl;
  const id = `${feed.name || 'unknown'}-${feed.url}-${guid}`;
  
  return {
    sourceName: feed.name || 'Unknown',
    sourceUrl: typeof channelLink === 'string' ? channelLink : channelLink?.['#text'] || feed.url,
    feedUrl: feed.url,
    postUrl: typeof postUrl === 'string' ? postUrl : postUrl?.['#text'] || '',
    title: typeof title === 'string' ? title : '',
    date,
    contentHtml: typeof contentHtml === 'string' ? contentHtml : '',
    id
  };
}

/**
 * Fetch all feeds and build timeline
 */
async function buildTimeline() {
  const feeds = readFeeds();
  
  if (feeds.length === 0) {
    console.log('No feeds to fetch');
    return [];
  }
  
  console.log(`Fetching ${feeds.length} feed(s)...`);
  
  // Fetch all feeds in parallel
  const results = await Promise.all(feeds.map(fetchFeed));
  
  // Flatten and filter out nulls
  const allItems = results.flat().filter(item => item !== null);
  
  // Sort by date descending
  allItems.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Limit total items
  return allItems.slice(0, MAX_TOTAL_ITEMS);
}

// Main execution
console.log('Building aggregated timeline...');

const timeline = await buildTimeline();
console.log(`Collected ${timeline.length} item(s) (max ${MAX_ITEMS_PER_FEED}/feed, ${MAX_TOTAL_ITEMS} total)`);

// Write timeline.json
fs.writeFileSync(TIMELINE_JSON_PATH, JSON.stringify(timeline, null, 2));
console.log(`Wrote ${TIMELINE_JSON_PATH}`);

console.log('Done!');

