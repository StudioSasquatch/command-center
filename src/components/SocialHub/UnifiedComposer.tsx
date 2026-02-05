'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image as ImageIcon, 
  Calendar,
  Sparkles,
  Linkedin,
  Instagram,
  Facebook,
  Check,
  Loader2,
  Wand2,
  CheckCircle2,
  XCircle,
  X,
  Film,
  Trash2
} from 'lucide-react';
import { XIcon } from '@/components/icons/XIcon';

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  maxLength: number;
  enabled: boolean;
}

interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const platforms: Platform[] = [
  { id: 'twitter', name: 'X', icon: XIcon, color: '#ffffff', maxLength: 280, enabled: true },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0a66c2', maxLength: 3000, enabled: true },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#e4405f', maxLength: 2200, enabled: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877f2', maxLength: 63206, enabled: true },
];

export function UnifiedComposer() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [results, setResults] = useState<PostResult[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: MediaFile[] = [];
    
    for (let i = 0; i < files.length && mediaFiles.length + newMedia.length < 4; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) continue;
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      newMedia.push({
        file,
        preview,
        type: isVideo ? 'video' : 'image'
      });
    }

    setMediaFiles(prev => [...prev, ...newMedia]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleAIEnhance = async () => {
    if (!content) return;
    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Enhance this social media post for maximum engagement. Keep the core message but make it more compelling, add relevant emojis, and optimize for virality. Keep it under 280 characters for Twitter compatibility. Original: "${content}"`
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          setContent(data.response);
        }
      }
    } catch (error) {
      console.error('AI enhance failed:', error);
    }
    
    setIsGenerating(false);
  };

  const uploadMedia = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return [];
    
    setIsUploading(true);
    const mediaIds: string[] = [];

    for (const media of mediaFiles) {
      try {
        const formData = new FormData();
        formData.append('file', media.file);
        formData.append('type', media.type);

        const res = await fetch('/api/x/media', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.mediaId) {
            mediaIds.push(data.mediaId);
          }
        }
      } catch (error) {
        console.error('Media upload failed:', error);
      }
    }

    setIsUploading(false);
    return mediaIds;
  };

  const handlePost = async () => {
    if (!content || selectedPlatforms.length === 0) return;
    
    setIsPosting(true);
    setResults(null);
    
    try {
      // Upload media first if any
      const mediaIds = await uploadMedia();
      
      const body: Record<string, unknown> = {
        content,
        platforms: selectedPlatforms,
        mediaIds: mediaIds.length > 0 ? mediaIds : undefined
      };
      
      if (showScheduler && scheduledTime) {
        body.scheduledFor = new Date(scheduledTime).toISOString();
      }
      
      const res = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (data.scheduled) {
        setResults([{ platform: 'all', success: true, postId: data.post.id }]);
        setContent('');
        setScheduledTime('');
        setShowScheduler(false);
        setMediaFiles([]);
      } else if (data.results) {
        setResults(data.results);
        if (data.success) {
          setContent('');
          setMediaFiles([]);
        }
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Post failed:', error);
      setResults([{ platform: 'all', success: false, error: 'Network error' }]);
      setShowResults(true);
    }
    
    setIsPosting(false);
  };

  const shortestMaxLength = Math.min(
    ...selectedPlatforms.map(p => platforms.find(pl => pl.id === p)?.maxLength || 280)
  );

  const isOverLimit = content.length > shortestMaxLength;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Results Toast */}
      <AnimatePresence>
        {showResults && results && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Post Results</span>
              <button onClick={() => setShowResults(false)}>
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm text-white capitalize">{result.platform}</span>
                  {result.postUrl && (
                    <a 
                      href={result.postUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-[#1d9bf0] hover:underline"
                    >
                      View →
                    </a>
                  )}
                  {result.error && (
                    <span className="text-xs text-red-400">{result.error}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#ff5722]/20 to-[#ff9800]/20">
            <Sparkles className="w-5 h-5 text-[#ff5722]" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Compose</h3>
            <p className="text-xs text-[var(--text-muted)]">Write once, publish everywhere</p>
          </div>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {platforms.map(platform => {
          const Icon = platform.icon;
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isSelected 
                  ? 'border-white/30 bg-white/10' 
                  : 'border-white/10 bg-white/5 opacity-50 hover:opacity-100'
              }`}
            >
              <Icon className="w-4 h-4" style={{ color: platform.color }} />
              <span className="text-sm font-medium text-white">{platform.name}</span>
              {isSelected && <Check className="w-3 h-3 text-[#00e676]" />}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Write your post here..."
          className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[#ff5722]/50 transition-colors"
          disabled={isPosting}
        />
        
        {/* Character Count */}
        <div className={`absolute bottom-3 right-3 text-xs font-mono ${
          isOverLimit ? 'text-red-400' : 'text-[var(--text-muted)]'
        }`}>
          {content.length} / {shortestMaxLength}
        </div>
      </div>

      {/* Media Preview */}
      <AnimatePresence>
        {mediaFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)]">
                {mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''} attached
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mediaFiles.map((media, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.preview}
                      alt={`Attachment ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-white/10"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                      <Film className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              ))}
              {mediaFiles.length < 4 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center hover:border-white/40 transition-colors"
                >
                  <ImageIcon className="w-6 h-6 text-[var(--text-muted)]" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            disabled={isPosting || mediaFiles.length >= 4}
            title="Add image or video"
          >
            <ImageIcon className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button 
            onClick={() => setShowScheduler(!showScheduler)}
            className={`p-2 rounded-lg border transition-all ${
              showScheduler 
                ? 'bg-[#ff5722]/20 border-[#ff5722]/30' 
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
            disabled={isPosting}
          >
            <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button 
            onClick={handleAIEnhance}
            disabled={isGenerating || !content || isPosting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-xs font-medium text-purple-300">AI Enhance</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {showScheduler && (
              <motion.input
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none"
                disabled={isPosting}
              />
            )}
          </AnimatePresence>
          <button 
            onClick={handlePost}
            disabled={!content || selectedPlatforms.length === 0 || isOverLimit || isPosting || isUploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff5722] to-[#ff9800] text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPosting || isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isUploading ? 'Uploading...' : showScheduler && scheduledTime ? 'Schedule' : 'Post Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
