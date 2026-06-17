import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion } from "motion/react";
import { ArrowRight, Building2 } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, university, password })
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
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col justify-center z-10 p-6">
        <Link to="/" className="flex justify-center items-center gap-2 mb-10 text-white/90 hover:text-white transition-colors">
          <Building2 className="w-6 h-6" />
          <span className="font-serif text-2xl">AlumniIQ</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass p-8 sm:p-10 rounded-3xl"
        >
          <h1 className="font-serif text-4xl mb-2">Create Account</h1>
          <p className="text-white/50 text-sm mb-8 font-light">Join the Career Intelligence Network</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/70">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="Alex Student"
              />
            </div>
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
              <label className="text-sm font-medium text-white/70">University</label>
              <input 
                type="text" 
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="Stanford University"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/70">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-medium rounded-xl py-3 mt-4 hover:bg-white/90 transition-colors flex justify-center items-center gap-2"
            >
              {loading ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-white/50">
              Already have an account? <Link to="/login" className="text-white hover:underline">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
