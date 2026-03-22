import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link2, Instagram, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

const CATEGORIES = ['Sketches', 'Watercolors', 'Pen Art', 'Oil Pastels'] as const;

interface Props {
  onSuccess: () => void;
}

export default function InstagramLinkForm({ onSuccess }: Props) {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const isValidInstagramUrl = (url: string) => {
    return url.includes('instagram.com/p/') || url.includes('instagram.com/reel/');
  };

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 800, height: 800 });
      img.src = url;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim() || !title.trim()) {
      toast.error('Please provide an image URL and title');
      return;
    }

    setSubmitting(true);
    try {
      const dims = await getImageDimensions(imageUrl);

      await addDoc(collection(db, 'artworks'), {
        title: title.trim(),
        category,
        src: imageUrl.trim(),
        width: dims.width,
        height: dims.height,
        description: description.trim(),
        source: 'instagram',
        instagramUrl: instagramUrl.trim() || null,
        createdAt: serverTimestamp(),
      });

      toast.success('Artwork added from Instagram!');
      setInstagramUrl('');
      setImageUrl('');
      setTitle('');
      setDescription('');
      setPreviewError(false);
      onSuccess();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info banner */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/15 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Instagram size={20} className="text-pink-400/70 mt-0.5 shrink-0" />
          <div className="text-xs text-white/50 leading-relaxed">
            <p className="font-semibold text-white/70 mb-1">Adding from Instagram</p>
            <p>Paste the Instagram post URL and the direct image URL. To get the image URL, right-click the image on Instagram and select "Copy image address".</p>
          </div>
        </div>
      </div>

      {/* Instagram URL */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Instagram Post URL</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Link2 size={16} className="text-white/20" />
          </div>
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-pink-500/40 transition-colors"
          />
        </div>
        {instagramUrl && !isValidInstagramUrl(instagramUrl) && (
          <p className="text-xs text-yellow-400/60 mt-1.5">This doesn't look like an Instagram post URL</p>
        )}
      </div>

      {/* Direct Image URL */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Direct Image URL *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <ImageIcon size={16} className="text-white/20" />
          </div>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => { setImageUrl(e.target.value); setPreviewError(false); }}
            placeholder="https://... (direct link to image)"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 transition-colors"
            required
          />
        </div>
      </div>

      {/* Image Preview */}
      {imageUrl && (
        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02]">
          {!previewError ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full max-h-64 object-contain"
              onError={() => setPreviewError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-white/30">
              <ImageIcon size={32} className="mb-2" />
              <p className="text-xs">Unable to load preview — the image may still work</p>
            </div>
          )}
        </div>
      )}

      {/* Instagram link preview */}
      {instagramUrl && isValidInstagramUrl(instagramUrl) && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-pink-400/60 hover:text-pink-400 transition-colors"
        >
          <ExternalLink size={12} />
          View original post on Instagram
        </a>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Portrait of Calm"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 transition-colors"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Category *</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                category === cat
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.05] hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the artwork..."
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={submitting || !imageUrl.trim() || !title.trim()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-xl py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
        style={{
          background: 'linear-gradient(135deg, rgba(236,72,153,0.7), rgba(139,92,246,0.7))',
        }}
      >
        {submitting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <Instagram size={16} />
            Add from Instagram
          </>
        )}
      </motion.button>
    </form>
  );
}
