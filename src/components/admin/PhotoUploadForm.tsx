import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import toast from 'react-hot-toast';

const CATEGORIES = ['Sketches', 'Watercolors', 'Pen Art', 'Oil Pastels'] as const;

interface Props {
  onSuccess: () => void;
}

export default function PhotoUploadForm({ onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 800, height: 600 });
      img.src = url;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error('Please provide an image and title');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, `artworks/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(pct));
        },
        (error) => {
          toast.error('Upload failed: ' + error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const dims = await getImageDimensions(downloadURL);

          await addDoc(collection(db, 'artworks'), {
            title: title.trim(),
            category,
            src: downloadURL,
            width: dims.width,
            height: dims.height,
            description: description.trim(),
            source: 'upload',
            createdAt: serverTimestamp(),
          });

          toast.success('Artwork uploaded successfully!');
          setFile(null);
          setPreview(null);
          setTitle('');
          setDescription('');
          setProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
          onSuccess();
          setUploading(false);
        }
      );
    } catch (err: any) {
      toast.error('Error: ' + err.message);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !preview && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
          isDragging
            ? 'border-purple-400/60 bg-purple-500/10 scale-[1.01]'
            : preview
            ? 'border-white/10 bg-white/[0.02]'
            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full max-h-72 object-contain rounded-xl" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/60 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4">
              <Upload size={24} className="text-white/30" />
            </div>
            <p className="text-sm text-white/50 mb-1">Drop your image here or click to browse</p>
            <p className="text-xs text-white/25">PNG, JPG, WEBP up to 20MB</p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/30 mb-2 font-semibold">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Silent Observer"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-purple-500/40 transition-colors"
          />
        </div>

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
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={uploading || !file || !title.trim()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-xl py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(59,130,246,0.7))',
        }}
      >
        {uploading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <ImageIcon size={16} />
            Upload Artwork
          </>
        )}
      </motion.button>
    </form>
  );
}
