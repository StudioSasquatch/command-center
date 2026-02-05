// Scheduled Posts Storage
// Memory-based storage with environment variable persistence for serverless

export interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  mediaUrls?: string[];
  scheduledFor: string; // ISO date string
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  createdAt: string;
  publishedAt?: string;
  results?: Array<{
    platform: string;
    success: boolean;
    postId?: string;
    postUrl?: string;
    error?: string;
  }>;
}

// In-memory storage for the current session
let memoryStore: ScheduledPost[] = [];
let lastSyncTime = 0;

// Simple base64 encoding/decoding for storage
function encodeData(data: any): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

function decodeData(encoded: string): any {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString());
  } catch {
    return [];
  }
}

// Load from environment variable (if available)
function loadFromStorage(): ScheduledPost[] {
  try {
    // For development, try file system (will work locally)
    if (process.env.NODE_ENV === 'development') {
      const { readFileSync, existsSync } = require('fs');
      const { join } = require('path');
      const filePath = join(process.cwd(), 'data', 'scheduled-posts.json');
      
      if (existsSync(filePath)) {
        const data = readFileSync(filePath, 'utf-8');
        return JSON.parse(data).posts || [];
      }
    }

    // For production, use environment variable
    const envData = process.env.SCHEDULED_POSTS_DATA;
    if (envData) {
      return decodeData(envData);
    }
    
    return [];
  } catch {
    return [];
  }
}

// Save to storage (memory + env var for serverless)
function saveToStorage(posts: ScheduledPost[]) {
  memoryStore = posts;
  
  // In development, save to file
  if (process.env.NODE_ENV === 'development') {
    try {
      const { writeFileSync, existsSync, mkdirSync } = require('fs');
      const { join } = require('path');
      const dir = join(process.cwd(), 'data');
      
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      const filePath = join(process.cwd(), 'data', 'scheduled-posts.json');
      writeFileSync(filePath, JSON.stringify({ posts }, null, 2));
    } catch (error) {
      console.warn('Failed to write to file in development:', error);
    }
  }
  
  // Note: In production, we'll need an external storage solution
  // For now, data only persists during the function execution
}

function ensureLoaded() {
  const now = Date.now();
  // Reload data every 5 minutes or if not loaded yet
  if (memoryStore.length === 0 || now - lastSyncTime > 300000) {
    memoryStore = loadFromStorage();
    lastSyncTime = now;
  }
}

export function getScheduledPosts(): ScheduledPost[] {
  ensureLoaded();
  return memoryStore.filter((p: ScheduledPost) => p.status === 'scheduled');
}

export function getAllPosts(): ScheduledPost[] {
  ensureLoaded();
  return [...memoryStore];
}

export function addScheduledPost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>): ScheduledPost {
  ensureLoaded();
  
  const newPost: ScheduledPost = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  
  const posts = [...memoryStore, newPost];
  saveToStorage(posts);
  
  return newPost;
}

export function updatePost(id: string, updates: Partial<ScheduledPost>): ScheduledPost | null {
  ensureLoaded();
  
  const index = memoryStore.findIndex((p: ScheduledPost) => p.id === id);
  if (index === -1) return null;
  
  const posts = [...memoryStore];
  posts[index] = { ...posts[index], ...updates };
  saveToStorage(posts);
  
  return posts[index];
}

export function deletePost(id: string): boolean {
  ensureLoaded();
  
  const index = memoryStore.findIndex((p: ScheduledPost) => p.id === id);
  if (index === -1) return false;
  
  const posts = memoryStore.filter(p => p.id !== id);
  saveToStorage(posts);
  
  return true;
}

export function getPostsDueNow(): ScheduledPost[] {
  const posts = getScheduledPosts();
  const now = new Date();
  
  return posts.filter(post => {
    const scheduledTime = new Date(post.scheduledFor);
    return scheduledTime <= now && post.status === 'scheduled';
  });
}
