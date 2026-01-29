import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/Users/jkirby/clawd';
const INBOX_PATH = path.join(WORKSPACE_PATH, 'INBOX.md');

export async function GET() {
  try {
    const content = await fs.readFile(INBOX_PATH, 'utf-8');
    
    // Parse inbox items from the Unsorted section
    const unsortedMatch = content.match(/## Unsorted\n\n([\s\S]*?)(?=\n## |$)/);
    const items = unsortedMatch 
      ? unsortedMatch[1]
          .split('\n')
          .filter(line => line.startsWith('- '))
          .map(line => line.slice(2).trim())
      : [];
    
    return NextResponse.json({ 
      success: true, 
      items,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reading inbox:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to read inbox' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { item } = await request.json();
    
    if (!item || typeof item !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid item' 
      }, { status: 400 });
    }
    
    // Read current inbox
    let content = await fs.readFile(INBOX_PATH, 'utf-8');
    
    // Find the Unsorted section and add the new item
    const timestamp = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const newItem = `- [${timestamp}] ${item}`;
    
    // Insert after "## Unsorted\n\n"
    const insertPoint = content.indexOf('## Unsorted\n\n') + '## Unsorted\n\n'.length;
    
    if (insertPoint > '## Unsorted\n\n'.length - 1) {
      // Check if there's "(empty — drop stuff here or just tell me)"
      const emptyMarker = '(empty — drop stuff here or just tell me)';
      if (content.includes(emptyMarker)) {
        content = content.replace(emptyMarker, newItem);
      } else {
        content = content.slice(0, insertPoint) + newItem + '\n' + content.slice(insertPoint);
      }
    } else {
      // Append to end
      content += `\n## Unsorted\n\n${newItem}\n`;
    }
    
    await fs.writeFile(INBOX_PATH, content, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item added to inbox',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error writing to inbox:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to write to inbox' 
    }, { status: 500 });
  }
}
