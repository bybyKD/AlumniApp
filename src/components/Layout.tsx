import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { 
  Plus,
  MessageSquare, 
  PieChart, 
  Search,
  LogOut,
  UserCircle,
  Hash,
  Sparkles
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const tools = [
    { name: "Alumni Directory", href: "/alumni", icon: Search },
    { name: "Network Insights", href: "/insights", icon: PieChart },
  ];

  // Mock recent chats
  const recentChats = [
    "Google Engineers in NY",
    "Data Science Pathways",
    "Stripe Product Managers",
    "Remote AI Roles"
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-[260px] h-full flex flex-col liquid-glass bg-black/60 hidden md:flex border-r border-white/5 relative z-10 shrink-0">
        
        {/* App Header & New Chat */}
        <div className="p-4 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 px-2 pb-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl tracking-wide">AlumniIQ</span>
          </Link>
          
          <Link 
            to="/chat"
            className="flex items-center justify-between px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all border border-white/5 shadow-inner"
          >
            <span className="font-medium text-sm">New Thread</span>
            <Plus className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">
          
          {/* Tools Area */}
          <div>
            <div className="text-xs font-semibold text-white/40 mb-3 px-2 tracking-wider">PLATFORM TOOLS</div>
            <div className="space-y-1">
              {tools.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                      isActive 
                        ? "bg-white/10 text-white shadow-sm border border-white/5" 
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-white/50 group-hover:text-white/80")} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent History */}
          <div>
            <div className="text-xs font-semibold text-white/40 mb-3 px-2 tracking-wider">RECENT THREADS</div>
            <div className="space-y-1">
              {recentChats.map((chat, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/5 group text-left"
                >
                  <MessageSquare className="w-4 h-4 text-white/30 group-hover:text-white/60 shrink-0" />
                  <span className="font-medium text-sm truncate">{chat}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* User Profile */}
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group mb-2 border border-transparent hover:border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white/20 to-white/5 flex items-center justify-center shrink-0 border border-white/10">
              <UserCircle className="w-5 h-5 text-white/80" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-white truncate">{user?.name}</span>
              <span className="text-xs text-white/40 truncate">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium text-sm">Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black relative">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-white/10 flex items-center justify-between liquid-glass bg-black/50 z-20 absolute top-0 w-full">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-serif text-xl">AlumniIQ</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/alumni"><Search className="w-5 h-5 text-white/70" /></Link>
            <Link to="/chat"><Plus className="w-5 h-5 text-white/70" /></Link>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full h-full md:pt-0 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
