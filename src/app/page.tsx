"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink, MessageSquare, X, Image as ImageIcon, Sun, Moon, Info, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Cyborg Brain SVG (Reference Matched - Animation Disabled)
const PixelBrain = ({ className, color = "currentColor" }: { className?: string, color?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    className={className} 
    fill={color}
  >
    {/* Left Side: Organic Brain */}
    <path d="M12 4c-4.418 0-8 3.582-8 8s3.582 8 8 8v-16z" opacity="0.1" />
    <path d="M11 6c-3.3 0-6 2.7-6 6s2.7 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M11 10c-1.5 0-2.5 1-2.5 2s1 2 2.5 2" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <path d="M8 8c-0.5 0.5-1 1-1 2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <path d="M8 16c-0.5-0.5-1-1-1-2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    
    {/* Middle Fissure */}
    <rect x="13" y="4" width="2" height="16" opacity="0.2" fill="black" />

    {/* Right Side: Digital Chip / Circuits */}
    <rect x="16" y="6" width="6" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="18" y="8" width="2" height="8" opacity="0.4" fill="currentColor" />
    
    {/* Circuit Lines Protruding */}
    <path d="M22 8h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <circle cx="27" cy="8" r="1" fill="currentColor" />
    
    <path d="M22 12h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <circle cx="29" cy="12" r="1" fill="currentColor" />
    
    <path d="M22 16h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <circle cx="27" cy="16" r="1" fill="currentColor" />
    
    <path d="M19 6V2h4" fill="none" stroke="currentColor" strokeWidth="1" />
    <circle cx="23" cy="2" r="1" fill="currentColor" />
    
    <path d="M19 18v4h4" fill="none" stroke="currentColor" strokeWidth="1" />
    <circle cx="23" cy="22" r="1" fill="currentColor" />
  </svg>
);

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    citations: any[];
    realImages?: {src: string, pmcUrl: string}[];
  } | null>(null);
  const [error, setError] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  
  const loadingRef = useRef<HTMLDivElement>(null);

  // Sync theme with document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Auto-scroll logic for loading state
  useEffect(() => {
    if (loading && loadingRef.current) {
      setTimeout(() => {
        loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [loading]);

  // Chatbot State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activePaper, setActivePaper] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{role:string, content:string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [chatMessages]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/med-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Terminal link fragmented. Retesting path...");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cognitive synthesis failed.");
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (cite: any) => {
    setActivePaper(cite);
    setChatMessages([{role: 'assistant', content: `SECURE_CHANNEL [${cite.id}] ESTABLISHED. Context loaded.`}]);
    setChatModalOpen(true);
  };

  const closeChat = () => {
    setChatModalOpen(false);
    setActivePaper(null);
    setChatMessages([]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const newMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/med-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperAbstract: activePaper.abstract,
          paperTitle: activePaper.title,
          messages: [...chatMessages, newMessage]
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch(err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "CRITICAL_ERROR: Signal interruption." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 flex flex-col items-center p-4 md:p-8 relative overflow-x-hidden`}>
      
      {/* Background Accents */}
      <AnimatePresence>
        {!isDarkMode && (
          <motion.div initial={{opacity:0}} animate={{opacity:0.2}} exit={{opacity:0}} className="absolute top-[5%] right-[5%] w-64 h-64 bg-[#FFD700] rounded-full blur-[80px] pointer-events-none" />
        )}
      </AnimatePresence>

      {/* Persistence Controls */}
      <div className="absolute top-4 right-4 flex gap-4 z-50">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`nes-btn p-2 !flex items-center justify-center ${isDarkMode ? 'is-warning' : 'is-primary'}`}
          title="Terminal mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          onClick={() => setAboutModalOpen(true)}
          className="nes-btn is-warning p-2 !flex items-center justify-center"
          title="Manual"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 text-center mb-10 mt-6"
      >
        <div className="flex flex-col items-center gap-6 mb-4">
          <PixelBrain className="w-28 h-28" />
          <h1 className="text-6xl md:text-9xl font-extrabold tracking-tighter pixel-text">SYNAPSE</h1>
        </div>
        <p className={`font-bold uppercase tracking-[0.4em] text-[10px] md:text-sm opacity-60`}>Professional Evidence Synthesis Terminal</p>
      </motion.div>

      {/* Input Module */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="z-10 w-full max-w-4xl mb-16"
      >
        <form onSubmit={handleSearch} className="nes-field">
          <div className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ENTER RESEARCH PARAMETERS..."
              className={`nes-input !bg-transparent !border-4 !text-2xl h-20 ${isDarkMode ? 'is-success' : 'is-primary'}`}
              disabled={loading}
            />
            <div className="mt-10 flex justify-center">
               <button 
                  type="submit" 
                  disabled={loading || !query.trim()}
                  className={`nes-btn w-full md:w-auto px-20 py-4 !text-xl ${isDarkMode ? 'is-success' : 'is-primary'}`}
                >
                  {loading ? "INITIALIZING SCAN..." : "SCAN"}
                </button>
            </div>
          </div>
        </form>
      </motion.div>

      {error && (
        <div className="nes-container is-rounded is-dark mb-8 w-full max-w-2xl border-red-500">
          <p className="text-red-400 text-sm italic">FAULT_DETECTED: {error}</p>
        </div>
      )}

      {/* Loading & Results Indicator Wrapper */}
      <div className="w-full flex flex-col items-center">
        <AnimatePresence>
            {loading && (
            <motion.div 
                ref={loadingRef}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="py-24 flex flex-col items-center z-10"
            >
                <i className="nes-icon heart is-large"></i>
                <p className="mt-10 pixel-text animate-pulse text-base">MAPPING RESEARCH PATHWAYS...</p>
            </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {result && !loading && (
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-7xl grid grid-cols-1 xl:grid-cols-3 gap-12 pb-24"
            >
                <div className="xl:col-span-2 space-y-12">
                <div className="nes-container is-rounded with-title bg-paper shadow-lg">
                    <p className="title">ANALYSIS_SUMMARY</p>
                    <div className="text-[1.35rem] leading-relaxed whitespace-pre-wrap font-sans opacity-95 p-6">
                    {result.answer}
                    </div>
                </div>

                <div className="nes-container is-rounded with-title bg-paper shadow-lg">
                    <p className="title">CITATION_MANIFEST</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {result.citations.map((cite, i) => (
                        <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.03, y: -5 }}
                        className={`nes-container is-rounded !p-6 flex flex-col shadow-sm cursor-default`}
                        >
                        <div className={`citation-id mb-4 uppercase opacity-60 ${isDarkMode ? 'text-[#00F2FE]' : 'text-[#00A896]'}`}>RECORD_{cite.id}</div>
                        <div className="text-lg font-bold mb-8 flex-grow leading-tight line-clamp-3">{cite.title}</div>
                        
                        <div className="flex gap-4">
                            <button 
                            onClick={() => openChat(cite)}
                            className={`nes-btn !p-3 !flex items-center justify-center ${isDarkMode ? 'is-success' : 'is-primary'}`}
                            title="Open Remote channel"
                            >
                            <MessageSquare size={20} />
                            </button>
                            <a 
                            href={`https://pubmed.ncbi.nlm.nih.gov/${cite.id}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="nes-btn !p-3 !flex items-center justify-center"
                            title="View Record"
                            >
                            <ExternalLink size={20} />
                            </a>
                        </div>
                        </motion.div>
                    ))}
                    </div>
                </div>
                </div>

                <div className="xl:col-span-1">
                <div className="nes-container is-rounded with-title bg-paper shadow-lg flex flex-col items-center h-full">
                    <p className="title">EXTRACTED_FIGURES</p>
                    {result.realImages && result.realImages.length > 0 ? (
                        <div className="flex flex-col gap-12 w-full p-4">
                            {result.realImages.map((img, idx) => (
                                <div 
                                key={idx}
                                className={`nes-container is-rounded !p-1 bg-white group relative shadow-md transition-all hover:scale-[1.05] ${isDarkMode ? 'is-dark' : ''}`}
                                >
                                <img src={img.src} alt="Visual Record" className="w-full h-auto" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-6 p-6 pointer-events-none">
                                    <div className="flex gap-6 pointer-events-auto">
                                        <a href={img.src} target="_blank" rel="noreferrer" className="nes-btn is-primary p-4" title="Full Image">
                                            <ImageIcon size={28} />
                                        </a>
                                        <a href={img.pmcUrl} target="_blank" rel="noreferrer" className="nes-btn p-4" title="Source Paper">
                                            <FileText size={28} />
                                        </a>
                                    </div>
                                </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 p-12 opacity-10">
                        <i className="nes-icon close is-large"></i>
                        <p className="mt-12 text-center text-xs uppercase pixel-text">Visual Channel Offline</p>
                        </div>
                    )}
                </div>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Manual Modal */}
      <AnimatePresence>
        {aboutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`nes-container is-rounded bg-paper !w-full !max-w-3xl !p-10 !relative border-4 shadow-2xl overflow-y-auto max-h-[90vh]`}>
              <button onClick={() => setAboutModalOpen(false)} className="absolute -top-3 -right-3 nes-btn is-error px-4">X</button>
              <h2 className="text-4xl font-bold mb-10 pixel-text border-b-4 border-black pb-4 uppercase">Project_Synapse</h2>
              <div className="space-y-10 text-xl font-sans leading-relaxed opacity-95">
                <p>Welcome to <span className="font-bold text-orange-500 underline decoration-4">Synapse</span>, a terminal built for the biomedical era. In a landscape of clinical information overload, finding evidence requires more than just a search bar.</p>
                <p>This system performs RAG across the National Library of Medicine. Every query triggers a real-time scan and figure extraction. My goal is to empower researchers with evidence they can trust.</p>
                <p>Every claim is tied to a specific source ID. It’s a tool for those who value verifiable truth and clean interactivity.</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Remote Chat Channel */}
        {chatModalOpen && activePaper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
               initial={{ scale: 0.98, y: 50 }} 
               animate={{ scale: 1, y: 0 }} 
               className={`nes-container is-rounded bg-paper w-full max-w-6xl flex flex-col h-[800px] max-h-[95vh] !p-0 shadow-2xl`}
            >
               <div className={`p-8 border-b-4 border-black flex items-center justify-between ${isDarkMode ? 'bg-[#9046CF]/30' : 'bg-[#F9C80E]/30'}`}>
                  <div>
                    <h3 className="text-lg font-bold uppercase flex items-center gap-4">
                      <i className="nes-icon chat"></i> 
                      Remote_Link_Active
                    </h3>
                    <div className="text-sm opacity-60 line-clamp-1 mt-3 font-sans">{activePaper.title}</div>
                  </div>
                  <button onClick={closeChat} className="nes-btn is-error px-6">X</button>
               </div>

               <div className="flex-1 overflow-y-auto p-10 md:p-16 space-y-10">
                 {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`nes-balloon ${msg.role === 'user' ? 'from-right' : 'from-left'} !max-w-[80%] !p-8 !m-2 shadow-sm`}>
                         <p className="text-xl font-sans leading-relaxed">{msg.content}</p>
                       </div>
                    </div>
                 ))}
                 {chatLoading && <div className="p-4"><p className="text-xs text-[#00A896] animate-pulse uppercase pixel-text tracking-widest">Decoding Stream...</p></div>}
                 <div ref={messagesEndRef} />
               </div>

               <div className="p-10 bg-paper border-t-4 border-black">
                 <form onSubmit={handleChatSubmit} className="flex gap-8">
                    <input 
                      type="text"
                      className="nes-input !text-xl font-sans h-20"
                      placeholder="PROMPT CONTEXT..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                    />
                    <button type="submit" disabled={chatLoading || !chatInput.trim()} className="nes-btn is-primary px-12 h-20">SEND</button>
                 </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
