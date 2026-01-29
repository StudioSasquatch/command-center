import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// This will eventually read from the actual workspace files
// For now, return the static data structure

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'blocked' | 'complete';
  priority: number;
  progress: number;
  nextAction: string;
  category: 'venture' | 'content' | 'life';
  accentColor: string;
  metrics?: { label: string; value: string | number }[];
  lastUpdated?: string;
}

const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/Users/jkirby/clawd';

async function parseProjectReadme(projectDir: string): Promise<Partial<Project> | null> {
  try {
    const readmePath = path.join(WORKSPACE_PATH, 'projects', projectDir, 'README.md');
    const content = await fs.readFile(readmePath, 'utf-8');
    
    // Extract status from content
    const statusMatch = content.match(/\*\*Status:\*\*\s*(\w+)/i);
    const status = statusMatch ? statusMatch[1].toLowerCase() : 'pending';
    
    // Extract description
    const descMatch = content.match(/\*\*(?:Type|Concept):\*\*\s*(.+)/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    return {
      id: projectDir,
      status: status as Project['status'],
      description,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Read projects directory
    const projectsDir = path.join(WORKSPACE_PATH, 'projects');
    const dirs = await fs.readdir(projectsDir);
    
    const projectData: Record<string, Partial<Project>> = {};
    
    for (const dir of dirs) {
      const stat = await fs.stat(path.join(projectsDir, dir));
      if (stat.isDirectory()) {
        const data = await parseProjectReadme(dir);
        if (data) {
          projectData[dir] = data;
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      projects: projectData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reading projects:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to read projects' 
    }, { status: 500 });
  }
}
