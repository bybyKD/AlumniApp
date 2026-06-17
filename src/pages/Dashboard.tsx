import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Users, Building, Globe2, Briefcase, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Alumni } from "../types";

export default function Dashboard() {
  const user = useAuthStore(state => state.user);
  const [recentAlumni, setRecentAlumni] = useState<Alumni[]>([]);

  useEffect(() => {
    fetch("/api/alumni")
      .then(res => res.json())
      .then(data => setRecentAlumni(data.slice(0, 3)));
  }, []);

  const stats = [
    { label: "Total Alumni", value: "12,450", icon: Users },
    { label: "Companies", value: "850+", icon: Building },
    { label: "Countries", value: "45", icon: Globe2 },
    { label: "Industries", value: "32", icon: Briefcase },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <header>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl md:text-5xl mb-2"
        >
          Welcome back, {user?.name.split(" ")[0]}
        </motion.h1>
        <p className="text-white/60 font-light text-lg">Here's the latest career intelligence for your network.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="liquid-glass p-6 rounded-2xl flex flex-col gap-4 border border-white/5"
            >
              <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-serif">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Quick Actions / AI Suggestions */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif">Suggested Intelligence Queries</h2>
            <Link to="/assistant" className="text-sm flex items-center gap-1 text-white/60 hover:text-white transition-colors">
              Open Assistant <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Which alumni work in Google?",
              "Show alumni in Germany.",
              "Top AI professionals.",
              "Most common alumni skills in Tech."
            ].map((q, i) => (
              <Link 
                key={i} 
                to={`/assistant?q=${encodeURIComponent(q)}`}
                className="liquid-glass p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all text-sm group"
              >
                <Sparkles className="w-4 h-4 text-white/40 mb-3 group-hover:text-white transition-colors" />
                {q}
              </Link>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <Link to="/alumni" className="bg-white text-black px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg shadow-white/10">
              <Search className="w-4 h-4" /> Explore Alumni
            </Link>
            <Link to="/insights" className="liquid-glass px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-white/10 transition-colors">
              <PieChart className="w-4 h-4" /> View Insights
            </Link>
          </div>
        </div>

        {/* Recent Profiles */}
        <div className="liquid-glass p-6 rounded-2xl border border-white/5 flex flex-col">
          <h2 className="text-xl font-serif mb-6">Trending Profiles</h2>
          <div className="space-y-4 flex-1">
            {recentAlumni.map(alumni => (
              <div key={alumni.id} className="flex gap-4 items-center group cursor-pointer">
                <img src={alumni.image} alt={alumni.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white group-hover:text-white/80 truncate">{alumni.name}</h3>
                  <p className="text-xs text-white/50 truncate flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {alumni.position} at {alumni.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/alumni" className="text-sm text-center text-white/50 hover:text-white pt-4 mt-4 border-t border-white/5">
            View all alumni
          </Link>
        </div>
      </div>
    </div>
  );
}

// Need to import icons for actions
import { Search, PieChart } from "lucide-react";
