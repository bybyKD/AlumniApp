import { useEffect, useState } from "react";
import { Alumni } from "../types";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, MapPin, Building, GraduationCap, Briefcase, Linkedin, X, Mail, Sparkles, Globe2, MessageCircle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AlumniExplorer() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Alumni | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/alumni")
      .then(res => res.json())
      .then(data => {
        setAlumni(data);
        setLoading(false);
        const urlId = searchParams.get("id");
        if (urlId) {
          const profile = data.find((a: Alumni) => a.id === urlId);
          if (profile) setSelectedProfile(profile);
        }
      });
  }, [searchParams]);

  // When closing the modal, clear the URL parameter so it doesn't reopen on refresh
  const handleCloseProfile = () => {
    setSelectedProfile(null);
    setSearchParams({});
  };

  // Derived lists for filters
  const allSkills = Array.from(new Set(alumni.flatMap(a => a.skills || []))).sort();
  const allIndustries = Array.from(new Set(alumni.flatMap(a => (a.industry || "").split("|").map(i => i.trim()).filter(Boolean)))).sort();
  const allLanguages = Array.from(new Set(alumni.flatMap(a => a.languages || []))).sort();
  const allCountries = Array.from(new Set(alumni.flatMap(a => a.countries || []))).sort();

  const toggleFilter = (set: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    set(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const filteredAlumni = alumni.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.position.toLowerCase().includes(search.toLowerCase()) ||
      a.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesSkills = selectedSkills.length === 0 || selectedSkills.every(s => a.skills.includes(s));
    const matchesIndustries = selectedIndustries.length === 0 || selectedIndustries.some(i => a.industry.includes(i));
    const matchesLanguages = selectedLanguages.length === 0 || selectedLanguages.some(l => (a.languages || []).includes(l));
    const matchesCountries = selectedCountries.length === 0 || selectedCountries.some(c => (a.countries || []).includes(c));

    return matchesSearch && matchesSkills && matchesIndustries && matchesLanguages && matchesCountries;
  });

  const FilterSection = ({ title, items, selected, setSelected }: { title: string, items: string[], selected: string[], setSelected: any }) => (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-white/80 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 15).map(item => (
          <button
            key={item}
            onClick={() => toggleFilter(setSelected, item)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${selected.includes(item) ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl mb-2">Alumni Explorer</h1>
        <p className="text-white/60 font-light text-lg">Search, filter, and discover career pathways.</p>
      </header>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Search by name, company, role, or skill..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full liquid-glass rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/5"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border ${showFilters ? 'bg-white text-black border-white' : 'liquid-glass hover:bg-white/5 border-white/5 text-white'}`}
        >
          <Filter className="w-5 h-5" /> Filters
        </button>
      </div>

      <div className="flex flex-1 min-h-0 gap-6 relative">
        {/* Sidebar Filters */}
        {showFilters && (
          <div className="w-80 shrink-0 overflow-y-auto custom-scrollbar pr-4 hidden md:block">
            <FilterSection title="Industries" items={allIndustries} selected={selectedIndustries} setSelected={setSelectedIndustries} />
            <FilterSection title="Skills" items={allSkills} selected={selectedSkills} setSelected={setSelectedSkills} />
            <FilterSection title="Languages" items={allLanguages} selected={selectedLanguages} setSelected={setSelectedLanguages} />
            <FilterSection title="Countries" items={allCountries} selected={selectedCountries} setSelected={setSelectedCountries} />
          </div>
        )}

        {/* Grid Wrapper */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map(n => <div key={n} className="h-64 bg-white/5 rounded-2xl liquid-glass"></div>)}
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid auto-rows-max md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10 pr-2">
          {filteredAlumni.map((person, i) => (
            <motion.div 
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="liquid-glass rounded-2xl p-6 border border-white/5 flex flex-col relative group"
            >
              <div className="flex items-start gap-4 mb-4">
                <img src={person.image} alt={person.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                <div>
                  <h3 className="font-medium text-lg text-white group-hover:text-white/80 transition-colors">{person.name}</h3>
                  <div className="text-sm font-light text-white/60 flex items-center gap-1 mt-1">
                    <Briefcase className="w-3 h-3" /> {person.position}
                  </div>
                  <div className="text-sm font-medium text-white/80 mt-0.5">
                    @ {person.company}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm text-white/60 flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" /> {person.country}
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 shrink-0" /> {person.industry}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <GraduationCap className="w-4 h-4 shrink-0" /> {person.education}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {person.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="bg-white/10 text-xs px-2 py-1 rounded-md text-white/80 border border-white/5">
                    {skill}
                  </span>
                ))}
                {person.skills.length > 3 && (
                  <span className="text-xs px-2 py-1 text-white/40">+{person.skills.length - 3}</span>
                )}
              </div>

              <button 
                onClick={() => setSelectedProfile(person)}
                className="w-full mt-auto bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 flex items-center justify-center gap-2 transition-colors text-sm font-medium border border-white/5"
              >
                <Linkedin className="w-4 h-4" /> View Profile
              </button>
            </motion.div>
          ))}
          
          {filteredAlumni.length === 0 && (
            <div className="col-span-full py-20 text-center text-white/40">
              No alumni found matching your search or filters.
            </div>
          )}
        </div>
      )}
        </div>
      </div>
      {/* Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseProfile}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Wrapper */}
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col liquid-glass bg-black/90 rounded-2xl border border-white/10 shadow-2xl"
            >
              {/* Sticky Close Button */}
              <button 
                onClick={handleCloseProfile}
                className="absolute top-4 right-4 z-10 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar pr-4 md:pr-8">
                <div className="flex flex-col md:flex-row gap-6 mb-8 mt-2">
                  <img src={selectedProfile.image} alt={selectedProfile.name} className="w-24 h-24 rounded-full object-cover border-2 border-white/20 shrink-0" />
                  <div>
                    <h2 className="font-serif text-3xl mb-1">{selectedProfile.name}</h2>
                    <div className="text-lg font-medium text-white/80">{selectedProfile.position}</div>
                    <div className="text-white/60 mb-4">{selectedProfile.company}</div>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.email && (
                        <a href={`mailto:${selectedProfile.email}`} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/5">
                          <Mail className="w-4 h-4" /> Email
                        </a>
                      )}
                      {selectedProfile.linkedin && (
                        <a href={`https://${selectedProfile.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm bg-[#0077b5]/80 hover:bg-[#0077b5] px-4 py-2 rounded-xl transition-colors border border-white/5">
                          <Linkedin className="w-4 h-4" /> LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {selectedProfile.bio && (
                  <div className="mb-8">
                    <h3 className="text-xs font-semibold text-white/40 tracking-widest mb-3">ABOUT</h3>
                    <p className="text-white/80 leading-relaxed font-light">{selectedProfile.bio}</p>
                  </div>
                )}

                {selectedProfile.career_highlights && selectedProfile.career_highlights.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-semibold text-white/40 tracking-widest mb-3">CAREER HIGHLIGHTS</h3>
                    <ul className="space-y-4">
                      {selectedProfile.career_highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-white/80 font-light leading-relaxed">
                          <Sparkles className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                  <div>
                    <h3 className="text-xs font-semibold text-white/40 tracking-widest mb-3">EXPERTISE</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedProfile.skills.map(skill => (
                        <span key={skill} className="bg-white/5 text-xs px-2.5 py-1.5 rounded-lg text-white/60 border border-white/5">{skill}</span>
                      ))}
                    </div>
                    
                    {(selectedProfile.languages && selectedProfile.languages.length > 0) && (
                      <>
                        <h3 className="text-xs font-semibold text-white/40 tracking-widest mb-3 mt-6">LANGUAGES</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.languages.map(lang => (
                            <span key={lang} className="bg-blue-500/10 text-blue-200 text-xs px-2.5 py-1.5 rounded-lg border border-blue-500/20 flex items-center gap-1.5">
                              <MessageCircle className="w-3 h-3" /> {lang}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/40 tracking-widest mb-3">EDUCATION</h3>
                    <p className="text-white/80 text-sm font-light leading-relaxed mb-6">{selectedProfile.education}</p>

                    {((selectedProfile.countries && selectedProfile.countries.length > 0) || (selectedProfile.passports && selectedProfile.passports.length > 0)) && (
                      <>
                        <h3 className="text-xs font-semibold text-white/40 tracking-widest mb-3 mt-6">GLOBAL MOBILITY</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.countries?.map(country => (
                            <span key={country} className="bg-emerald-500/10 text-emerald-200 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                              <Globe2 className="w-3 h-3" /> {country}
                            </span>
                          ))}
                          {selectedProfile.passports?.map(passport => (
                            <span key={passport} className="bg-purple-500/10 text-purple-200 text-xs px-2.5 py-1.5 rounded-lg border border-purple-500/20 flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3" /> {passport}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
