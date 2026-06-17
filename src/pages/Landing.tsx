import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Instagram, Twitter } from "lucide-react";
import { cn } from "../lib/utils";

const VideoBackground = ({ src, className }: { src: string, className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let frameId: number;

    const checkTime = () => {
      if (video.duration && video.currentTime >= video.duration - 1) {
        setOpacity(0); // Fade out just before the end
        setTimeout(() => {
          video.currentTime = 0;
          video.play();
        }, 800); // Give time for CSS transition
      } else if (video.currentTime > 0 && opacity === 0) {
        setOpacity(1); // Fade in once playing
      }
      frameId = requestAnimationFrame(checkTime);
    };

    video.addEventListener("play", () => {
      frameId = requestAnimationFrame(checkTime);
    });

    return () => cancelAnimationFrame(frameId);
  }, [opacity]);

  return (
    <video
      ref={videoRef}
      className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-1000", className)}
      style={{ opacity }}
      autoPlay
      muted
      playsInline
      src={src}
    />
  );
};

export default function Landing() {
  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-white/20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between mix-blend-difference">
        <Link to="/" className="font-serif text-2xl tracking-wide font-normal">AlumniIQ</Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/80">
          <Link to="/chat" className="hover:text-white transition-colors">Features</Link>
          <Link to="/alumni" className="hover:text-white transition-colors">Explorer</Link>
          <Link to="/insights" className="hover:text-white transition-colors">Insights</Link>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/login" className="text-white/80 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="liquid-glass px-5 py-2 rounded-full hover:bg-white/10 transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <VideoBackground src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight mb-8"
          >
            Discover where alumni become extraordinary.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mb-12 font-light leading-relaxed"
          >
            Explore alumni careers, uncover industry trends, and ask AI-powered questions about your university network.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          >
            <div className="liquid-glass p-1 rounded-full flex w-full max-w-md">
              <input type="email" placeholder="Enter your email" className="bg-transparent border-none outline-none px-6 py-3 w-full text-white placeholder-white/40 font-light" />
              <Link to="/register" className="bg-white text-black px-6 py-3 rounded-full font-medium whitespace-nowrap hover:bg-white/90 transition-colors">
                Get Started
              </Link>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/80 hover:text-white transition-colors">
              Watch Demo <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-10 left-6 md:left-12 flex gap-6 text-white/50"
        >
          <Instagram className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <Globe className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 md:px-12 lg:px-24 bg-black relative">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-serif text-5xl md:text-7xl mb-8">Transform alumni data into career intelligence.</h2>
          <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed">
            <strong className="text-white font-normal block mb-4">Every graduate leaves a story behind.</strong>
            AlumniIQ transforms alumni records into actionable insights through AI-powered exploration, helping students understand career pathways, industry trends, and opportunities across the world.
          </p>
        </motion.div>
      </section>

      {/* AI Discovery Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-50" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-xl liquid-glass rounded-3xl p-10 md:p-14 border border-white/5 shadow-2xl"
        >
          <h2 className="font-serif text-4xl md:text-5xl mb-6">AI-Powered Alumni Discovery</h2>
          <p className="text-white/70 text-lg mb-8 font-light">Ask questions naturally and receive instant insights from alumni data.</p>
          
          <div className="space-y-4 mb-10">
            {["Which alumni work at Google?", "Show alumni in Germany.", "Top skills in Data Science.", "Career paths in AI."].map((q, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-sm font-medium text-white/90">"{q}"</span>
              </div>
            ))}
          </div>

          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-white/90 transition-colors">
            Explore AI Assistant <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Intelligence x Human Potential */}
      <section className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-5xl md:text-7xl text-center mb-24"
          >
            Career Intelligence ×<br />Human Potential
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-2xl shadow-white/5 aspect-square relative"
            >
              <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4" />
            </motion.div>
            <div className="space-y-12 md:pl-12">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="liquid-glass p-8 rounded-2xl"
              >
                <h3 className="text-2xl font-serif mb-3 text-white">Discover Patterns</h3>
                <p className="text-white/60 font-light">Analyze career trajectories across countries, industries, and companies to see exactly how professionals navigate their roles.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.2 }}
                className="liquid-glass p-8 rounded-2xl"
              >
                <h3 className="text-2xl font-serif mb-3 text-white">Make Better Decisions</h3>
                <p className="text-white/60 font-light">Use real alumni outcomes to guide education and career planning, backed by aggregated data and success metrics.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Final CTA */}
      <section className="py-32 px-6 text-center border-t border-white/5">
        <h2 className="font-serif text-5xl md:text-6xl mb-8">Ready to explore?</h2>
        <Link to="/register" className="inline-block bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-white/90 transition-colors">
          Join AlumniIQ Today
        </Link>
      </section>
    </div>
  );
}
