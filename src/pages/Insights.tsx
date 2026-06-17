import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { motion } from "motion/react";
import { PieChart as PieChartIcon, TrendingUp, Users, Map, Globe2, MessageCircle } from "lucide-react";

interface AnalyticsData {
  topSkills: { name: string; value: number }[];
  topIndustries: { name: string; value: number }[];
  topCompanies: { name: string; value: number }[];
  topLanguages: { name: string; value: number }[];
  topCountries: { name: string; value: number }[];
  careerGrowth: { year: string; count: number }[];
}

const COLORS = ['#ffffff', '#cccccc', '#999999', '#666666', '#333333'];
const PIE_COLORS = ['#ffffff', '#bbbbbb', '#777777', '#444444', '#222222'];

export default function Insights() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="p-10 flex items-center justify-center h-full">
        <div className="animate-pulse space-y-8 w-full max-w-7xl">
          <div className="h-10 bg-white/5 rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-80 bg-white/5 rounded-2xl liquid-glass"></div>
            <div className="h-80 bg-white/5 rounded-2xl liquid-glass"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <header>
        <h1 className="font-serif text-4xl md:text-5xl mb-2">Career Insights</h1>
        <p className="text-white/60 font-light text-lg">Visualize network trends and career pathways.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Career Growth Line Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-3xl p-6 border border-white/5 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6 text-white/80">
            <TrendingUp className="w-5 h-5" />
            <h2 className="font-medium text-lg">Network Growth</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.careerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="count" stroke="#fff" strokeWidth={3} dot={{ fill: '#000', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Companies Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass rounded-3xl p-6 border border-white/5 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6 text-white/80">
            <Users className="w-5 h-5" />
            <h2 className="font-medium text-lg">Top Employers</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCompanies} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.8)" tick={{fill: 'rgba(255,255,255,0.8)'}} axisLine={false} tickLine={false} width={80} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="value" fill="#fff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Industries Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="liquid-glass rounded-3xl p-6 border border-white/5 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6 text-white/80">
            <PieChartIcon className="w-5 h-5" />
            <h2 className="font-medium text-lg">Industry Distribution</h2>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topIndustries}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.topIndustries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-4">
            {data.topIndustries.map((ind, i) => (
               <div key={ind.name} className="flex items-center gap-2 text-sm text-white/60">
                 <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                 {ind.name} ({ind.value}%)
               </div>
            ))}
          </div>
        </motion.div>

        {/* Top Skills List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 border border-white/5 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6 text-white/80">
            <Map className="w-5 h-5" />
            <h2 className="font-medium text-lg">Most Requested Skills</h2>
          </div>
          <div className="space-y-4 flex-1">
            {data.topSkills.map((skill, index) => (
              <div key={skill.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center text-white/40 font-mono text-sm">{index + 1}</div>
                  <div className="font-medium text-white/90">{skill.name}</div>
                </div>
                <div className="w-1/2 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full" 
                    style={{ width: `${(skill.value / data.topSkills[0].value) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Languages Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="liquid-glass rounded-3xl p-6 border border-white/5 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6 text-white/80">
            <MessageCircle className="w-5 h-5" />
            <h2 className="font-medium text-lg">Languages Spoken</h2>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topLanguages}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.topLanguages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-4">
            {data.topLanguages.slice(0, 5).map((lang, i) => (
               <div key={lang.name} className="flex items-center gap-2 text-sm text-white/60">
                 <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                 {lang.name} ({lang.value})
               </div>
            ))}
          </div>
        </motion.div>

        {/* Top Countries Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="liquid-glass rounded-3xl p-6 border border-white/5 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6 text-white/80">
            <Globe2 className="w-5 h-5" />
            <h2 className="font-medium text-lg">Global Mobility (Countries)</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCountries} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.8)" tick={{fill: 'rgba(255,255,255,0.8)'}} axisLine={false} tickLine={false} width={80} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="value" fill="#cccccc" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
