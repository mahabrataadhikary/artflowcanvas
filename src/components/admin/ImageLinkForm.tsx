import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link2, LayoutGrid, Image as ImageIcon, Loader2, ExternalLink, Globe, Pencil } from 'lucide-react';
import { turso } from '../../lib/turso';
import toast from 'react-hot-toast';

const CATEGORIES = ['Sketches', 'Watercolors', 'Pen Art', 'Oil Pastels'] as const;
const SECTIONS = [
  { id: 'gallery', label: 'Art Gallery', icon: <ImageIcon size={16} /> },
  { id: 'collaboration', label: 'Collaboration', icon: <Globe size={16} /> },
] as const;

interface Props {
  onSuccess: () => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function ImageLinkForm({ onSuccess, initialData, onCancel }: Props) {
  const isEditing = !!initialData;
  const [imageUrl, setImageUrl] = useState(initialData?.src || '');
  const [instagramUrl, setInstagramUrl] = useState(initialData?.instagramUrl || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<string>(initialData?.category || CATEGORIES[0]);
  const [section, setSection] = useState<string>(initialData?.section || SECTIONS[0].id);
  const [description, setDescription] = useState(initialData?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

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

      if (isEditing) {
        await turso.execute({
          sql: `UPDATE artworks 
                SET title = ?, category = ?, src = ?, width = ?, height = ?, 
                    description = ?, source = ?, instagramUrl = ?, section = ? 
                WHERE id = ?`,
          args: [
            title.trim(),
            category,
            imageUrl.trim(),
            dims.width,
            dims.height,
            description.trim(),
            instagramUrl.trim() ? 'instagram' : 'link',
            instagramUrl.trim() || null,
            section,
            initialData.id,
          ],
        });
        toast.success('Artwork updated successfully!');
      } else {
        await turso.execute({
          sql: 'INSERT INTO artworks (id, title, category, src, width, height, description, source, instagramUrl, section, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            Date.now().toString(),
            title.trim(),
            category,
            imageUrl.trim(),
            dims.width,
            dims.height,
            description.trim(),
            instagramUrl.trim() ? 'instagram' : 'link',
            instagramUrl.trim() || null,
            section,
            new Date().toISOString(),
          ],
        });
        toast.success('Artwork added successfully!');
      }

      if (!isEditing) {
        setImageUrl('');
        setInstagramUrl('');
        setTitle('');
        setDescription('');
      }
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
      {/* Header for Edit Mode */}
      {isEditing && (
        <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2 text-purple-300 font-medium">
            <Pencil size={14} />
            <span>Editing Artwork</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Section Selection */}
      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-wider text-white/30 font-semibold">Target Section *</label>
        <div className="grid grid-cols-2 gap-3">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                section === s.id
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.05] hover:text-white/60 hover:border-white/10'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Direct Image URL *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Link2 size={16} className="text-white/20" />
          </div>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => { setImageUrl(e.target.value); setPreviewError(false); }}
            placeholder="https://... (direct link to image/screenshot)"
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
              <p className="text-xs">Unable to load preview — check if the URL is a direct image link</p>
            </div>
          )}
        </div>
      )}

      {/* Instagram Post (Optional) */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Instagram Post URL (Optional)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Globe size={16} className="text-white/20" />
          </div>
          <input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Project Name / Artwork Title"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 transition-colors"
          required
        />
      </div>

      {/* Category (Only shown for Gallery) */}
      {section === 'gallery' && (
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
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:bg-white/[0.05] hover:text-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
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
          background: 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(59,130,246,0.7))',
        }}
      >
        {submitting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {isEditing ? <Pencil size={16} /> : <ImageIcon size={16} />}
            {isEditing ? 'Save Changes' : `Add to ${section === 'gallery' ? 'Gallery' : 'Collaborations'}`}
          </>
        )}
      </motion.button>
    </form>
  );
}
