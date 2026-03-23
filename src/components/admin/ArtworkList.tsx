import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Instagram, Upload, ExternalLink, Image as ImageIcon, Pencil } from 'lucide-react';
import { turso } from '../../lib/turso';
import toast from 'react-hot-toast';

interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  src: string;
  source: 'upload' | 'instagram' | 'link';
  instagramUrl?: string;
  description: string;
  section: 'gallery' | 'collaboration';
}

interface Props {
  artworks: ArtworkItem[];
  onDelete: () => void;
  onEdit: (artwork: ArtworkItem) => void;
}

export default function ArtworkList({ artworks, onDelete, onEdit }: Props) {
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      await turso.execute({
        sql: 'DELETE FROM artworks WHERE id = ?',
        args: [id],
      });
      toast.success(`"${title}" deleted`);
      onDelete();
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/20">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <ImageIcon size={28} />
        </div>
        <p className="text-sm font-medium">No artworks yet</p>
        <p className="text-xs mt-1 text-white/15">Upload your first piece to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {artworks.map((art) => (
          <motion.div
            key={art.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300"
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden bg-white/[0.02]">
              <img
                src={art.src}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxYTFhMmUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzMzM0NCIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white/80 truncate">{art.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">{art.category}</span>
                    <span className="text-white/10">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-white/25">
                      {art.source === 'instagram' ? <Instagram size={10} /> : <Upload size={10} />}
                      {art.source}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {art.instagramUrl && (
                    <a
                      href={art.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/25 hover:text-pink-400 hover:border-pink-500/30 transition-all"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    onClick={() => onEdit(art)}
                    className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/25 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(art.id, art.title)}
                    className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/25 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {art.description && (
                <p className="text-xs text-white/20 mt-2 line-clamp-2">{art.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
