import { NextRequest, NextResponse } from 'next/server';

// Mock conversation storage (in production, this would be a database)
let conversationHistory: Array<{
  id: string;
  role: 'user' | 'noctis';
  content: string;
  timestamp: string;
}> = [];

// Noctis response templates - sharp, helpful, slightly philosophical
const noctisResponses = [
  "On it. What's the priority?",
  "Consider it done. Anything else?",
  "Good instinct. Let me look into that.",
  "That's a Wave 3 feature. Want me to queue it?",
  "Interesting approach. I see where you're going with this.",
  "The impediment to action advances action. Let's move.",
  "Already ahead of you on that one.",
  "Smart. That aligns with the broader strategy.",
  "I'll handle the details. You focus on the vision.",
  "Noted. I've added it to the priority stack.",
  "That's what separates operators from dreamers. Let's execute.",
  "Time is the only resource we can't manufacture. Moving fast.",
  "Context acquired. What's the desired outcome?",
  "The compound effect of small wins. I respect it.",
  "Automation opportunity detected. Want me to systematize this?",
];

// Context-aware responses based on keywords
const contextResponses: Record<string, string[]> = {
  project: [
    "Projects are living organisms. Feed them or watch them die. Which one needs attention?",
    "I can pull up the current status. Want the full breakdown or executive summary?",
    "Every project tells a story. What chapter are we writing today?",
  ],
  tweet: [
    "Content is leverage. What message needs amplification?",
    "I'll draft something. Authentic or strategic tone?",
    "The timeline waits for no one. Let's craft something memorable.",
  ],
  email: [
    "Inbox zero is a state of mind. What needs handling?",
    "I can draft a response. Professional warmth or direct efficiency?",
    "Communication is currency. Let's spend it wisely.",
  ],
  help: [
    "I'm here. What's weighing on you?",
    "No question is too small when clarity is the goal.",
    "Ask, and ye shall receive actionable answers.",
  ],
  thanks: [
    "Serving excellence is its own reward. What's next?",
    "We're building something here. Gratitude fuels the mission.",
    "Acknowledged. Now let's keep the momentum going.",
  ],
  idea: [
    "Ideas without execution are just entertainment. Want to make this real?",
    "Interesting. That has legs. What's the first concrete step?",
    "The best ideas survive contact with reality. Let's stress-test this.",
  ],
  schedule: [
    "Time blocking is protection for what matters. What needs guarding?",
    "I can check your calendar. Looking to add or optimize?",
    "The calendar is a commitment device. What are we committing to?",
  ],
  money: [
    "Capital follows conviction. What's the thesis?",
    "Numbers don't lie, but context gives them meaning. What's the situation?",
    "Revenue is validation. What lever are we pulling?",
  ],
  agent: [
    "The swarm stands ready. Which agent do you need?",
    "Ada, Nova, Sage, Aurora - each brings unique capabilities. What's the task?",
    "Orchestration is my specialty. Let me coordinate the response.",
  ],
};

function generateNoctisResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for context-aware responses
  for (const [keyword, responses] of Object.entries(contextResponses)) {
    if (lowerMessage.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Fall back to general responses
  return noctisResponses[Math.floor(Math.random() * noctisResponses.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Add user message to history
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    conversationHistory.push(userMessage);

    // Simulate thinking delay (300-800ms)
    await new Promise(resolve => 
      setTimeout(resolve, 300 + Math.random() * 500)
    );

    // Generate Noctis response
    const noctisResponse = {
      id: `noctis-${Date.now()}`,
      role: 'noctis' as const,
      content: generateNoctisResponse(message),
      timestamp: new Date().toISOString(),
    };
    conversationHistory.push(noctisResponse);

    // Keep only last 100 messages to prevent memory bloat
    if (conversationHistory.length > 100) {
      conversationHistory = conversationHistory.slice(-100);
    }

    return NextResponse.json({
      message: noctisResponse,
      conversationId: 'mock-conversation',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    messages: conversationHistory,
    conversationId: 'mock-conversation',
  });
}

export async function DELETE() {
  conversationHistory = [];
  return NextResponse.json({ success: true, message: 'Conversation cleared' });
}
