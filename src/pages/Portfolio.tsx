import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  Instagram,
  Mail,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Palette,
  PenTool,
  Brush,
  Image as ImageIcon,
  ChevronLeft,
  Pause,
  Play
} from 'lucide-react';
import PhotoAlbum from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

import { cn } from '../lib/utils';
import { ARTWORKS, WIP_IMAGES, type Artwork } from '../constants';
const ABOUT_WORDS = [
  "Hello!", "I'm", "Kounik", "Adhikary,", "An",
  <span className="relative whitespace-nowrap"><span className="relative z-10">Artist</span><span className="absolute bottom-1 left-0 w-full h-3 bg-blue-300/40 -rotate-1 -z-10 rounded-md filter blur-[1px]"></span></span>,
  "based", "in",
  <span className="relative whitespace-nowrap"><span className="relative z-10">West Bengal, India</span><span className="absolute bottom-1 left-0 w-full h-3 bg-red-300/40 rotate-1 -z-10 rounded-md filter blur-[1px]"></span></span>,
  ".", "I’ve", "had", "a", "deep", "love", "for",
  <span className="relative whitespace-nowrap"><span className="relative z-10">drawing</span><span className="absolute bottom-1 left-0 w-full h-3 bg-green-300/40 -rotate-1 -z-10 rounded-md filter blur-[1px]"></span></span>,
  "and",
  <span className="relative whitespace-nowrap"><span className="relative z-10">creativity</span><span className="absolute bottom-1 left-0 w-full h-3 bg-amber-300/40 rotate-1 -z-10 rounded-md filter blur-[1px]"></span></span>,
  ",", "which", "gradually", "turned", "into", "a", "passion", "for", "creating", "meaningful", "artwork.",
  "<br>",
  "I", "specialize", "in",
  <span className="relative whitespace-nowrap text-fuchsia-900/90 font-medium"><span className="relative z-10">Portrait Sketches</span><span className="absolute bottom-1 left-0 w-full h-3 bg-fuchsia-300/50 rotate-1 -z-10 rounded-md filter blur-[1px]"></span></span>,
  ",",
  <span className="relative whitespace-nowrap text-cyan-900/90 font-medium"><span className="relative z-10">Water Color</span><span className="absolute bottom-0 left-0 w-full h-3 bg-cyan-300/50 -rotate-2 -z-10 rounded-md filter blur-[1px]"></span></span>,
  "and",
  <span className="relative whitespace-nowrap text-slate-800/90 font-medium"><span className="relative z-10">Pen Sketches</span><span className="absolute bottom-1 left-0 w-full h-3 bg-slate-300/60 rotate-1 -z-10 rounded-md filter blur-[1px]"></span></span>,
  ",", "focusing", "on", "capturing", "emotions", "and", "fine", "details."
];

function ScrollWord({ word, index, total, progress }: { key?: number, word: string | ReactNode, index: number, total: number, progress: any }) {
  if (word === "<br>") {
    return <span className="w-full hidden md:block h-2" />;
  }

  const start = index / total;
  const end = start + (1 / total);
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  const y = useTransform(progress, [start, end], [8, 0]);

  return (
    <motion.span style={{ opacity, y }} className="inline-block">
      {word}
    </motion.span>
  );
}

function ScrollAnimatedText({ words }: { words: (string | ReactNode)[] }) {
  const container = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.85", "end 0.75"]
  });

  return (
    <p ref={container} className="flex flex-wrap justify-center text-center gap-x-[0.27em] gap-y-1">
      {words.map((word, i) => (
        <ScrollWord key={i} word={word} index={i} total={words.length} progress={scrollYProgress} />
      ))}
    </p>
  );
}

export default function App() {
  const [filter, setFilter] = useState<string>('All');
  const [index, setIndex] = useState(-1);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredArtworks = filter === 'All'
    ? ARTWORKS
    : ARTWORKS.filter(art => art.category === filter);

  const categories = ['All', 'Sketches', 'Watercolors', 'Pen Art', 'Oil Pastels'];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && filteredArtworks.length > 0) {
      interval = setInterval(() => {
        setSlideIndex((prev) => (prev + 1) % filteredArtworks.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, filteredArtworks.length, slideIndex]);

  useEffect(() => {
    setSlideIndex(0);
  }, [filter]);

  const nextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % filteredArtworks.length);
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + filteredArtworks.length) % filteredArtworks.length);
  };

  return (
    <div className="min-h-screen selection:bg-ink/10 selection:text-ink">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        scrolled ? "bg-canvas/80 backdrop-blur-md border-b border-ink/5 py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#" className="text-2xl font-serif font-bold tracking-tighter">
            Art Flow Canvas<span className="text-ink/40">.</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-widest font-medium">
            {['Gallery', 'About', 'Shop', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-ink/60 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-ink transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-canvas pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-8 text-3xl font-serif">
              {['Gallery', 'About', 'Shop', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex justify-between items-center border-b border-ink/10 pb-4"
                >
                  {item}
                  <ChevronRight size={24} className="text-ink/30" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          <div className="absolute inset-0 canvas-texture opacity-30 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-xs uppercase tracking-[0.3em] font-semibold mb-6 text-ink/50">
                Visual Artist & Illustrator
              </span>
              <h1 className="text-6xl lg:text-8xl font-serif leading-[0.9] mb-8 tracking-tight">
                Capturing Life <br />
                Through <span className="italic text-ink/70">Ink & Color</span>
              </h1>
              <p className="text-lg text-ink/60 max-w-md mb-10 leading-relaxed">
                Exploring the intersection of raw emotion and delicate precision through traditional mediums. Based in the heart of creative expression.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#gallery"
                  className="sketch-border px-8 py-4 bg-ink text-canvas hover:bg-canvas hover:text-ink transition-all duration-300 flex items-center gap-2 group"
                >
                  Explore Gallery
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#about"
                  className="sketch-border px-8 py-4 hover:bg-ink/5 transition-all duration-300"
                >
                  About Me
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-full overflow-hidden sketch-border">
                <img
                  src="/icons/pp.jpeg"
                  alt="Featured Artwork"
                  className="w-full h-full object-cover transition-all duration-700 scale-105 hover:scale-100"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-canvas sketch-border flex items-center justify-center rotate-[-12deg] hidden lg:flex">
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold">Kounik</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-50">Adhikary</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Me Section */}
        <section id="about" className="py-24 bg-canvas relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 canvas-texture opacity-20 pointer-events-none" />

          <div className="max-w-4xl mx-auto px-6 z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="h-12 w-px bg-ink/30" />
                <span className="text-sm uppercase tracking-widest font-bold text-ink/50"></span>
              </div>
              <div className="relative inline-block mb-10">
                <h2 className="text-4xl md:text-5xl font-serif relative z-10">About Me</h2>
                <div className="absolute -bottom-1 left-[-2%] w-[104%] h-[2px] bg-ink/60 rounded-full filter blur-[0.5px] -rotate-1"></div>
                <div className="absolute -bottom-2.5 left-[1%] w-[102%] h-[1.5px] bg-ink/40 rounded-full filter blur-[0.5px] rotate-1"></div>
              </div>
              <div className="text-xl md:text-2xl text-ink/80 leading-relaxed font-serif">
                <ScrollAnimatedText words={ABOUT_WORDS} />
              </div>
            </motion.div>
          </div>
          
          {/* Decorative floating elements */}
          <div className="absolute z-0 top-1/2 left-0 w-96 h-96 bg-ink/5 rounded-full blur-3xl opacity-50 -translate-y-1/2 -translate-x-1/4" />
          <div className="absolute z-0 top-1/2 right-0 w-96 h-96 bg-ink/5 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4" />
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-32 bg-ink text-canvas relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-ink/90 to-ink pointer-events-none z-0" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center mb-20 gap-4">
              <div>
                <div className="relative inline-block mb-8 mt-2">
                  <h2 className="text-4xl md:text-5xl font-serif relative z-10">Art Gallery</h2>
                  <div className="absolute -bottom-1 left-[-2%] w-[104%] h-[2px] bg-canvas/60 rounded-full filter blur-[0.5px] -rotate-1"></div>
                  <div className="absolute -bottom-2.5 left-[1%] w-[102%] h-[1.5px] bg-canvas/40 rounded-full filter blur-[0.5px] rotate-1"></div>
                </div>
                <p className="text-canvas/50 max-w-md mx-auto">Swipe or use arrows to navigate through the collection. Tap any artwork to view it in full screen.</p>
              </div>
            </div>

            <div className="relative w-full max-w-5xl mx-auto h-[450px] md:h-[650px] flex items-center justify-center perspective-[1200px]">
              {filteredArtworks.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                  {filteredArtworks.map((art, i) => {
                    const len = filteredArtworks.length;
                    let offset = i - slideIndex;
                    if (offset > Math.floor(len / 2)) offset -= len;
                    else if (offset < -Math.floor(len / 2)) offset += len;
                    
                    const MathAbs = Math.abs(offset);
                    const isActive = offset === 0;

                    return (
                      <motion.div
                        key={art.title + i}
                        className={cn(
                          "absolute w-[75%] md:w-[55%] aspect-[4/3] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-white/5 backdrop-blur-xl transition-all",
                          isActive ? "z-30 cursor-grab active:cursor-grabbing hover:border-white/30" : MathAbs === 1 ? "z-20 cursor-pointer" : MathAbs === 2 ? "z-10 cursor-pointer" : "z-0 pointer-events-none"
                        )}
                        initial={false}
                        animate={{
                          x: offset === 0 ? "0%" : offset > 0 ? `${70 + MathAbs * 10}%` : `-${70 + MathAbs * 10}%`,
                          scale: 1 - MathAbs * 0.12,
                          opacity: MathAbs > 2 ? 0 : 1 - MathAbs * 0.3,
                          rotateY: offset * -12, 
                          z: MathAbs * -100
                        }}
                        transition={{ duration: 0.7, type: "spring", stiffness: 250, damping: 25 }}
                        drag={isActive ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.8}
                        onDragEnd={(_, info) => {
                          if (info.offset.x > 60) prevSlide();
                          else if (info.offset.x < -60) nextSlide();
                        }}
                        onClick={() => {
                          if (!isActive) {
                             if (offset > 0) nextSlide();
                             else prevSlide();
                          } else {
                             setIndex(i);
                          }
                        }}
                      >
                        <img
                          src={art.src}
                          alt={art.title}
                          className="w-full h-full object-cover pointer-events-none opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                           <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                             <h3 className="text-2xl md:text-3xl font-serif text-white mb-1">{art.title}</h3>
                             <p className="text-xs md:text-sm uppercase tracking-widest text-white/70 font-bold">{art.category}</p>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Navigation Controls */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-40">
                    <button
                      onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all pointer-events-auto backdrop-blur-md border border-white/20"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all pointer-events-auto backdrop-blur-md border border-white/20"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  {/* Indicators / Timeline */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-3 z-40">
                    {filteredArtworks.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setSlideIndex(i); }}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-500",
                          i === slideIndex ? "bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/30 w-3 hover:bg-white/50"
                        )}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Play/Pause toggle is optional for the stacked UI but nice to keep */}
                  <div className="absolute -top-12 right-0 z-40">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                      className="text-white/50 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold flex items-center gap-2"
                    >
                      {isPlaying ? <><Pause size={14}/> Auto-Play</> : <><Play size={14}/> Paused</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-canvas/40 font-serif text-2xl">No works found.</div>
              )}
            </div>

            <Lightbox
              index={index}
              open={index >= 0}
              close={() => setIndex(-1)}
              slides={filteredArtworks.map(art => ({ src: art.src, title: art.title, description: art.description }))}
            />
          </div>
        </section>

        {/* Shop/Commission Section */}
        <section id="shop" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Bring Art Home</h2>
            <p className="text-ink/50 max-w-2xl mx-auto mb-16">
              Limited edition prints and custom commissions are available. Each piece is handled with care and printed on archival quality paper.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Original Works', price: 'From $450', icon: <Palette size={32} /> },
                { title: 'Fine Art Prints', price: 'From $65', icon: <ImageIcon size={32} /> },
                { title: 'Custom Commissions', price: 'Contact for Quote', icon: <PenTool size={32} /> }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-10 bg-canvas sketch-border flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white sketch-border flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-serif mb-2">{item.title}</h3>
                  <p className="text-ink/40 mb-8 uppercase tracking-widest text-xs font-bold">{item.price}</p>
                  <button className="w-full py-3 sketch-border hover:bg-ink hover:text-canvas transition-all duration-300 uppercase tracking-widest text-sm font-bold">
                    Inquire Now
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 bg-ink text-canvas relative flex flex-col items-center justify-center text-center">
          <div className="max-w-3xl mx-auto px-6 flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">Let's Create <br />Something Together</h2>
            <p className="text-canvas/60 text-lg md:text-xl mb-16 max-w-xl mx-auto">
              Feel free to reach out for collaborations, inquiries, or any new ideas. I’m always open to working together and creating something meaningful.
            </p>

            <div className="flex flex-col items-center sm:items-start space-y-4 md:space-y-6 w-max mx-auto">
              <a href="mailto:kounikadhikari@gmail.com`" className="flex items-center gap-4 text-2xl md:text-3xl hover:text-canvas/70 transition-colors group">
                <div className="w-14 h-14 rounded-full bg-canvas/5 flex items-center justify-center group-hover:bg-canvas/10 transition-colors">
                  <Mail size={24} />
                </div>
                <span className="relative pb-3">
                  hello@kounik.art
                  <span className="absolute bottom-1 left-[-2%] w-[104%] h-[1.5px] bg-canvas/60 rounded-full -rotate-[0.8deg] filter blur-[0.3px]"></span>
                  <span className="absolute bottom-[-1px] left-[1%] w-[102%] h-[1px] bg-canvas/35 rounded-full rotate-[1.2deg] filter blur-[0.5px]"></span>
                </span>
              </a>
              <a href="https://instagram.com/artflowcanvas" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-2xl md:text-3xl hover:text-canvas/70 transition-colors group">
                <div className="w-14 h-14 rounded-full bg-canvas/5 flex items-center justify-center group-hover:bg-canvas/10 transition-colors">
                  <Instagram size={24} />
                </div>
                <span className="relative pb-3">
                  @artflowcanvas
                  <span className="absolute bottom-1 left-[-2%] w-[104%] h-[1.5px] bg-canvas/60 rounded-full rotate-[0.6deg] filter blur-[0.3px]"></span>
                  <span className="absolute bottom-[-1px] left-[1%] w-[102%] h-[1px] bg-canvas/35 rounded-full -rotate-[1deg] filter blur-[0.5px]"></span>
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-canvas border-t border-ink/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-ink/40">
            © {new Date().getFullYear()} ArtFlowCanvas. All rights reserved.
          </div>

          <div className="font-signature text-4xl md:text-5xl text-ink/80">
            Kounik Adhikary.
          </div>

          <div className="flex gap-8 text-xs uppercase tracking-widest font-bold opacity-40">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
