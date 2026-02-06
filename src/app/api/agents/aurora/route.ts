/**
 * Aurora Agent - Creative/Image Generation
 *
 * Processes image feedback and generates new images using:
 * - Claude Sonnet (via Vercel AI Gateway) for analyzing feedback
 * - Image generation model (via Vercel AI Gateway) for image generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateText, generateImage } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { updateAgentStatus } from '@/lib/agent-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Create gateway with explicit API key (supports both env var names)
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_SECRET,
});

interface AuroraTask {
  postId: string;
  feedback: string;
  originalPrompt?: string;
  postText?: string;
}

// Generate improved image prompt using Sonnet via Gateway
async function analyzeAndImprovePrompt(task: AuroraTask): Promise<string> {
  const { text } = await generateText({
    model: gateway('anthropic/claude-sonnet-4-20250514'),
    system: `You are Aurora, a creative AI agent specializing in visual content.
Your job is to analyze feedback about images and create improved image generation prompts.
Be specific about composition, lighting, colors, style, and mood.
Output ONLY the improved prompt, nothing else. Keep it under 200 words.`,
    prompt: `Original image description: ${task.originalPrompt || 'Not provided'}
Post text for context: ${task.postText || 'Not provided'}
User feedback: ${task.feedback}

Create an improved, detailed image generation prompt that addresses the feedback.`,
  });

  return text;
}

// Generate image using Gemini or Imagen via Gateway
async function generateNewImage(prompt: string): Promise<string | null> {
  try {
    // Use gateway.image() for image generation models
    const { images } = await generateImage({
      model: gateway.image('google/imagen-4.0-generate-001'),
      prompt,
      n: 1,
    });

    // Return the first image as base64 data URL
    if (images && images.length > 0) {
      const image = images[0];
      const mediaType = image.mediaType || 'image/png';
      return `data:${mediaType};base64,${image.base64}`;
    }
    return null;
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}

// Update the content post with new image
async function updatePostImage(postId: string, imageUrl: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured');
    return false;
  }

  const { error } = await supabase
    .from('content_posts')
    .update({ media_url: imageUrl })
    .eq('id', postId);

  return !error;
}

// Mark feedback as resolved
async function resolveFeedback(postId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await supabase
    .from('content_feedback')
    .update({ resolved: true })
    .eq('post_id', postId)
    .eq('resolved', false);
}

export async function POST(request: NextRequest) {
  console.log('🌸 Aurora agent called');

  try {
    const body = await request.json();
    const { postId, feedback, originalPrompt, postText } = body;

    console.log('🌸 Aurora received:', { postId, feedback: feedback?.substring(0, 50) });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback required' }, { status: 400 });
    }

    // Check if AI Gateway is configured
    if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_AI_GATEWAY_SECRET) {
      console.error('🌸 Aurora: AI Gateway API key not configured');
      await updateAgentStatus('aurora', {
        status: 'error',
        task: 'AI Gateway not configured',
        error: 'Missing AI_GATEWAY_API_KEY or VERCEL_AI_GATEWAY_SECRET',
      });
      return NextResponse.json({ error: 'AI Gateway not configured' }, { status: 500 });
    }

    // Update Aurora status to working
    console.log('🌸 Aurora: Updating status to working');
    await updateAgentStatus('aurora', {
      status: 'working',
      task: `Processing: "${feedback.substring(0, 50)}..."`,
      progress: 10,
    });

    // Step 1: Analyze feedback and create improved prompt
    await updateAgentStatus('aurora', {
      status: 'working',
      task: 'Analyzing feedback...',
      progress: 30,
    });

    const improvedPrompt = await analyzeAndImprovePrompt({
      postId,
      feedback,
      originalPrompt,
      postText,
    });

    console.log('Aurora improved prompt:', improvedPrompt);

    // Step 2: Generate new image
    await updateAgentStatus('aurora', {
      status: 'working',
      task: 'Generating new image...',
      progress: 60,
    });

    const imageUrl = await generateNewImage(improvedPrompt);

    if (!imageUrl) {
      await updateAgentStatus('aurora', {
        status: 'error',
        task: 'Image generation failed',
        error: 'Failed to generate image',
      });

      return NextResponse.json({
        success: false,
        error: 'Image generation failed',
        improvedPrompt,
      }, { status: 500 });
    }

    // Step 3: Update the post with new image
    await updateAgentStatus('aurora', {
      status: 'working',
      task: 'Updating post...',
      progress: 90,
    });

    if (postId) {
      await updatePostImage(postId, imageUrl);
      await resolveFeedback(postId);
    }

    // Complete - status stays as complete (client can poll and see it)
    console.log('🌸 Aurora: Task complete!');
    await updateAgentStatus('aurora', {
      status: 'complete',
      task: 'Image regenerated!',
      progress: 100,
    });

    // Note: Can't use setTimeout in serverless - status will stay "complete"
    // until next task or manual reset

    return NextResponse.json({
      success: true,
      improvedPrompt,
      imageUrl,
      postId,
    });
  } catch (error) {
    console.error('Aurora agent error:', error);

    await updateAgentStatus('aurora', {
      status: 'error',
      task: 'Error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Aurora agent failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
