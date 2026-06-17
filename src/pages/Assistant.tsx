import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, Building, Briefcase, Globe2, Loader2, StopCircle, CornerDownLeft } from "lucide-react";
import { ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

/**
 * Fixes malformed markdown tables where the AI outputs all rows on a single line.
 * Detects patterns like: | H1 | H2 | | --- | --- | | d1 | d2 | | d3 | d4 |
 * and splits them into proper multi-line markdown tables.
 */
function fixMarkdownTables(text: string): string {
  // Match a block that looks like a table jammed onto one line
  // Pattern: starts with |, has multiple | --- | separators, and more | data |
  return text.replace(
    /\|[^\n]*\|\s*\|\s*---[^\n]*\|\s*\|/g,
    (match) => {
      // Split at every | that is followed by a space and another | (row boundary)
      // The key insight: row boundaries happen at "| |" patterns
      const parts = match.split(/\s*\|\s*\|\s*/).filter(Boolean);
      if (parts.length < 3) return match; // Not enough for header + separator + data
      
      return parts.map(p => `| ${p.trim()} |`).join('\n');
    }
  );
}

export default function Assistant() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"json" | "pdf">("json");
  const [provider, setProvider] = useState<"gemini" | "groq">("gemini");
  const [groqModel, setGroqModel] = useState("llama-3.1-8b-instant");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleInitialQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleInitialQuery = (query: string) => {
    setInput(query);
    // Auto-submit initial query
    setTimeout(() => {
      const e = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(e, query);
    }, 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Expand textarea dynamically
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const preventEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", content: finalInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = 'auto'; // reset height
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: "assistant", content: "" }]);

    try {
      const endpoint = provider === "groq" ? "/api/assistant/chat/groq" : "/api/assistant/chat";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mode,
          groqModel,
          messages: messages.concat(userMessage).map(m => ({ 
            role: m.role === "assistant" ? "model" : m.role, 
            parts: [{ text: m.content }] 
          })) 
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              accumulatedText += data.text;
              
              setMessages(prev => prev.map(m => 
                m.id === botMessageId ? { ...m, content: accumulatedText } : m
              ));
            } catch (e) {
              console.error("Error parsing event stream data", e);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(m => 
        m.id === botMessageId ? { ...m, content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}` } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative w-full items-center">
      
      {/* Dynamic Header just for aesthetic when chatting */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 w-full p-4 flex justify-center pointer-events-none z-10"
          >
            <div className="px-4 py-1.5 rounded-full liquid-glass border border-white/5 text-xs text-white/40 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Core Intelligence Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto w-full scroll-smooth pt-16 md:pt-10">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
          
          {/* Hero Empty State */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 relative">
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-white/90">
                  What do you want to explore?
                </h1>
                <p className="text-white/40 text-lg font-light tracking-wide max-w-xl mx-auto">
                  Ask AlumniIQ about specific career paths, discover hidden trends, or find the right connections across the globe.
                </p>
              </motion.div>

              {/* Suggestions Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl"
              >
                {[
                  { title: "Class Analysis", desc: "Who graduated in 2021?", icon: Globe2 },
                  { title: "Role Deep Dive", desc: "What skills do Product Managers have?", icon: Briefcase },
                  { title: "Company Discovery", desc: "Which alumni work at Amazon?", icon: Building },
                  { title: "AI Matchmaking", desc: "Find me 3 alumni who would be good co-founders for a Fintech startup based on their career highlights.", icon: Sparkles }
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setInput(item.desc);
                      inputRef.current?.focus();
                    }}
                    className="liquid-glass p-5 rounded-2xl border border-white/5 text-left group hover:bg-white/5 transition-all flex flex-col gap-3 max-h-32"
                  >
                    <item.icon className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
                    <div>
                      <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.title}</div>
                      <div className="text-xs text-white/40 truncate">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            /* Chat Interface List */
            <div className="space-y-8 pb-32">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4 w-full text-base",
                      message.role === "user" ? "ml-auto max-w-[85%] sm:max-w-[70%] justify-end" : "justify-start w-full"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10 mt-1">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "rounded-3xl px-6 py-4 leading-relaxed",
                      message.role === "user" 
                        ? "bg-white/10 text-white shadow-lg border border-white/5 liquid-glass" 
                        : "text-white/90"
                    )}>
                      {message.role === "assistant" ? (
                        message.content ? (
                        <div className="markdown-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{fixMarkdownTables(message.content)}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-white/50 h-6">
                            <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                          </div>
                        )
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className={cn(
        "w-full px-4 sm:px-6 transition-all duration-500 ease-in-out z-20",
        messages.length === 0 ? "absolute bottom-1/4 max-w-3xl translate-y-24" : "sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-black via-black to-transparent max-w-4xl"
      )}>
        {/* Provider Toggle */}
          <div className="flex justify-center mb-3">
            <div className="bg-white/5 p-1 rounded-full flex gap-1 liquid-glass border border-white/10">
              <button
                type="button"
                onClick={() => { setProvider("gemini"); setMode("json"); }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5",
                  provider === "gemini" ? "bg-blue-500/80 text-white font-medium" : "text-white/50 hover:text-white/80"
                )}
              >
                <span>🌀</span> Gemini
              </button>
              <button
                type="button"
                onClick={() => { setProvider("groq"); setMode("json"); }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5",
                  provider === "groq" ? "bg-orange-500/80 text-white font-medium" : "text-white/50 hover:text-white/80"
                )}
              >
                <span>⚡</span> Groq
              </button>
            </div>
          </div>

          {/* Groq Model Toggle */}
          {provider === "groq" && (
            <div className="flex justify-center mb-4 relative z-50">
              <div className="bg-white/5 p-1 rounded-full flex gap-1 liquid-glass border border-white/10">
                <select 
                  value={groqModel}
                  onChange={(e) => setGroqModel(e.target.value)}
                  className="bg-transparent text-white/80 text-xs px-3 py-1 outline-none cursor-pointer appearance-none text-center"
                >
                  <option value="llama-3.1-8b-instant" className="bg-black">Llama 3.1 8B</option>
                  <option value="llama-3.3-70b-versatile" className="bg-black">Llama 3.3 70B</option>
                  <option value="mixtral-8x7b-32768" className="bg-black">Mixtral 8x7B</option>
                  <option value="gemma2-9b-it" className="bg-black">Gemma 2 9B</option>
                </select>
                <div className="flex items-center justify-center pr-2 pointer-events-none text-white/50">
                  <CornerDownLeft className="w-3 h-3" />
                </div>
              </div>
            </div>
          )}

          {/* Mode Toggle — only show for Gemini */}
          {provider === "gemini" && (
          <div className="flex justify-center mb-4">
            <div className="bg-white/5 p-1 rounded-full flex gap-1 liquid-glass border border-white/10">
              <button
                type="button"
                onClick={() => setMode("json")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs transition-all",
                  mode === "json" ? "bg-white text-black font-medium" : "text-white/50 hover:text-white/80"
                )}
              >
                JSON Mode (Fast)
              </button>
              <button
                type="button"
                onClick={() => setMode("pdf")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs transition-all",
                  mode === "pdf" ? "bg-white text-black font-medium" : "text-white/50 hover:text-white/80"
                )}
              >
                PDF Mode (Thorough)
              </button>
            </div>
          </div>
          )}

        <form 
          onSubmit={(e) => handleSubmit(e)} 
          className="relative group w-full"
        >

          <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          
          <div className="relative liquid-glass rounded-3xl border border-white/10 bg-black/60 shadow-2xl flex flex-col p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={preventEnter}
              disabled={isLoading}
              rows={1}
              placeholder="Message AlumniIQ..."
              className="w-full bg-transparent border-none resize-none px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-0 transition-all text-base max-h-[200px] overflow-y-auto custom-scrollbar"
            />
            
            <div className="flex justify-between items-center px-2 pb-1 pt-2">
              <div className="text-white/20 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <CornerDownLeft className="w-3 h-3" /> return to send
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2 rounded-full flex items-center justify-center transition-all duration-300",
                  input.trim() 
                    ? "bg-white text-black hover:bg-white/90 scale-100" 
                    : "bg-white/5 text-white/20 scale-95",
                  isLoading && "opacity-50"
                )}
              >
                {isLoading ? <StopCircle className="w-4 h-4 text-white" /> : <Send className="w-4 h-4 ml-0.5" />}
              </button>
            </div>
          </div>
        </form>
        {messages.length > 0 && (
          <div className="text-center mt-3 text-xs text-white/20 font-light">
            Currently using <span className={provider === "groq" ? "text-orange-400/60" : "text-blue-400/60"}>{provider === "groq" ? "⚡ Groq (Llama 3.1 8B)" : "🌀 Gemini"}</span> · AlumniIQ can make mistakes.
          </div>
        )}
      </div>
    </div>
  );
}
