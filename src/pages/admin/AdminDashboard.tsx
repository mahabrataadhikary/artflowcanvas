import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Instagram,
  LayoutGrid,
  LogOut,
  Palette,
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import PhotoUploadForm from '../../components/admin/PhotoUploadForm';
import InstagramLinkForm from '../../components/admin/InstagramLinkForm';
import ArtworkList from '../../components/admin/ArtworkList';

type Tab = 'upload' | 'instagram' | 'gallery';

interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  src: string;
  source: 'upload' | 'instagram';
  instagramUrl?: string;
  description: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('admin_authenticated') !== 'true') {
      navigate('/admin');
      return;
    }
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'artworks'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: ArtworkItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ArtworkItem));
      setArtworks(items);
    } catch (err) {
      console.error('Failed to fetch artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    navigate('/admin');
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'upload', label: 'Upload Photo', icon: <Upload size={18} />, desc: 'Upload from device' },
    { id: 'instagram', label: 'From Instagram', icon: <Instagram size={18} />, desc: 'Add via link' },
    { id: 'gallery', label: 'All Artworks', icon: <LayoutGrid size={18} />, desc: `${artworks.length} items` },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a12]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
              <Palette size={16} className="text-purple-300" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white/80">Art Flow Canvas</span>
              <span className="text-xs text-white/25 ml-2">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
            >
              View Site <ChevronRight size={12} />
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-white/30 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/5"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Stats ribbon */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Artworks', value: artworks.length, icon: <ImageIcon size={18} /> },
            { label: 'Uploaded', value: artworks.filter(a => a.source === 'upload').length, icon: <Upload size={18} /> },
            { label: 'From Instagram', value: artworks.filter(a => a.source === 'instagram').length, icon: <Instagram size={18} /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/25">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-white/80">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/25 font-bold">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 relative flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/35 hover:text-white/55'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/[0.06] border border-white/[0.08] rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2.5">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white/80">Upload Artwork</h2>
                    <p className="text-xs text-white/30 mt-1">Upload an image file from your device</p>
                  </div>
                  <PhotoUploadForm onSuccess={fetchArtworks} />
                </div>
              </motion.div>
            )}

            {activeTab === 'instagram' && (
              <motion.div
                key="instagram"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white/80">Add from Instagram</h2>
                    <p className="text-xs text-white/30 mt-1">Import artwork by providing the Instagram post URL</p>
                  </div>
                  <InstagramLinkForm onSuccess={fetchArtworks} />
                </div>
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-none"
              >
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white/80">All Artworks</h2>
                  <p className="text-xs text-white/30 mt-1">Manage your gallery collection</p>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-purple-400 rounded-full animate-spin" />
                  </div>
                ) : (
                  <ArtworkList artworks={artworks} onDelete={fetchArtworks} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
