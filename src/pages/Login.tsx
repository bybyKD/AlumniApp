import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion } from "motion/react";
import { ArrowRight, Building2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        login(data.user, data.token);
        navigate("/chat");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden text-white font-sans">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex z-10 p-6">
        {/* Left Form Side */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto xl:mx-0 xl:mr-auto">
          <Link to="/" className="flex items-center gap-2 mb-16 text-white/90 hover:text-white transition-colors">
            <Building2 className="w-6 h-6" />
            <span className="font-serif text-2xl">AlumniIQ</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass p-8 sm:p-10 rounded-3xl"
          >
            <h1 className="font-serif text-4xl mb-2">Welcome Back</h1>
            <p className="text-white/50 text-sm mb-8 font-light">Access the Alumni Career Intelligence Platform</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/70">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="name@university.edu"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-white/70 flex justify-between">
                  <span>Password</span>
                  <Link to="/forgot-password" className="text-white/40 hover:text-white/80 transition-colors">Forgot?</Link>
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="remember" className="rounded border-white/10 bg-white/5" />
                <label htmlFor="remember" className="text-sm text-white/60">Remember me</label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-medium rounded-xl py-3 mt-4 hover:bg-white/90 transition-colors flex justify-center items-center gap-2"
              >
                {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-white/50">
                Don't have an account? <Link to="/register" className="text-white hover:underline">Register</Link>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Info Side (Desktop) */}
        <div className="hidden xl:flex flex-1 flex-col justify-center items-end pl-24">
          <div className="w-full max-w-lg space-y-6">
            {[
              { title: "AI Assistant", desc: "Instantly query thousands of alumni records naturally." },
              { title: "Alumni Explorer", desc: "Filter by company, industry, tags, and pathways." },
              { title: "Career Insights", desc: "View geographic and industry analytics dynamically." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="liquid-glass p-6 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors cursor-default"
              >
                <h3 className="font-serif text-2xl text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
