'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Check, X, ExternalLink, AlertCircle, Image, X as XIcon } from 'lucide-react';

interface PostedTweet {
  id: string;
  text: string;
  url: string;
}

interface ImagePreview {
  file: File;
  preview: string;
  base64?: string;
}

export function TweetComposer() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'posting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [postedTweet, setPostedTweet] = useState<PostedTweet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = text.length;
  const isOverLimit = charCount > 280;
  const isEmpty = text.trim().length === 0 && images.length === 0;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];
    
    for (let i = 0; i < Math.min(files.length, 4 - images.length); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const preview = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);
      newImages.push({ file, preview, base64 });
    }

    setImages([...images, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty || isOverLimit || status === 'uploading' || status === 'posting') return;

    setError(null);

    try {
      let mediaIds: string[] = [];

      // Upload images first if any
      if (images.length > 0) {
        setStatus('uploading');
        
        for (const img of images) {
          if (!img.base64) continue;
          
          const response = await fetch('/api/x/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              media: img.base64,
              mimeType: img.file.type 
            }),
          });

          const data = await response.json();
          if (data.success && data.mediaId) {
            mediaIds.push(data.mediaId);
          } else {
            throw new Error(data.error || 'Failed to upload image');
          }
        }
      }

      // Post tweet
      setStatus('posting');
      
      const response = await fetch('/api/x/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text.trim() || '.',  // X requires some text
          mediaIds: mediaIds.length > 0 ? mediaIds : undefined
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setPostedTweet(data.tweet);
        setText('');
        images.forEach(img => URL.revokeObjectURL(img.preview));
        setImages([]);
        setTimeout(() => {
          setStatus('idle');
          setPostedTweet(null);
        }, 5000);
      } else {
        setStatus('error');
        setError(data.error || 'Failed to post tweet');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Network error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getCharCountColor = () => {
    if (charCount > 280) return 'text-red-500';
    if (charCount > 260) return 'text-amber-400';
    return 'text-[var(--text-muted)]';
  };

  const isLoading = status === 'uploading' || status === 'posting';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-[#1d9bf0]/10">
          <svg className="w-4 h-4 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
          Post to X
        </h2>
        <span className="ml-auto font-mono text-xs text-[var(--text-muted)]">@jkirby_eth</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            disabled={isLoading || status === 'success'}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-[#1d9bf0]/50 focus:outline-none text-white placeholder-[var(--text-muted)] text-sm resize-none transition-colors"
          />
          
          {/* Character count */}
          <div className={`absolute bottom-3 right-3 font-mono text-xs ${getCharCountColor()}`}>
            {charCount}/280
          </div>
        </div>

        {/* Image previews */}
        <AnimatePresence>
          {images.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex gap-2 flex-wrap"
            >
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={img.preview} 
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar for character limit */}
        <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
          <motion.div
            className={`h-full ${isOverLimit ? 'bg-red-500' : charCount > 260 ? 'bg-amber-400' : 'bg-[#1d9bf0]'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((charCount / 280) * 100, 100)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {/* Image upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={isLoading || images.length >= 4}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || images.length >= 4}
              className="p-2 rounded-lg hover:bg-white/5 text-[#1d9bf0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Add image (max 4)"
            >
              <Image className="w-5 h-5" />
            </button>
            {images.length > 0 && (
              <span className="text-xs text-[var(--text-muted)]">{images.length}/4</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {status === 'error' && error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-red-400 text-xs"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="max-w-32 truncate">{error}</span>
                </motion.div>
              )}
              {status === 'success' && postedTweet && (
                <motion.a
                  href={postedTweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-[#30d158] text-xs hover:underline"
                >
                  <Check className="w-4 h-4" />
                  <span>Posted!</span>
                  <ExternalLink className="w-3 h-3" />
                </motion.a>
              )}
              {status === 'uploading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-[var(--text-muted)]"
                >
                  Uploading media...
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isEmpty || isOverLimit || isLoading || status === 'success'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm text-white"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'success' && <Check className="w-4 h-4" />}
              {status === 'error' && <X className="w-4 h-4" />}
              {status === 'idle' && <Send className="w-4 h-4" />}
              <span>{status === 'uploading' ? 'Uploading...' : status === 'posting' ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
