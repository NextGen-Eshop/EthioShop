import {
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineArrowUpRight,
  HiOutlineArrowDownRight,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineGlobeAlt
} from 'react-icons/hi2';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Analytics() {
  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={stagger}
      className="max-w-[1400px] mx-auto space-y-10 pb-20"
    >
      {/* Header Area */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Analytics</span></h1>
          <p className="text-slate-500 font-medium">Real-time data and predictive insights for your business growth.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button className="px-4 py-2 text-xs font-bold bg-white text-slate-900 rounded-lg shadow-sm border border-slate-100">Live View</button>
            <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Historical</button>
          </div>
          <button className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95">
            Export Data
          </button>
        </div>
      </motion.div>

      {/* Analytics Grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ColoredStatCard 
          label="Total Revenue" 
          value="ETB 142,500" 
          trend="+12.5%" 
          trendUp={true} 
          icon={<HiOutlineCurrencyDollar className="w-6 h-6" />}
          gradient="from-emerald-500 to-teal-600"
          shadow="shadow-emerald-100"
        />
        <ColoredStatCard 
          label="Orders" 
          value="842" 
          trend="+5.2%" 
          trendUp={true} 
          icon={<HiOutlineChartBar className="w-6 h-6" />}
          gradient="from-indigo-500 to-blue-600"
          shadow="shadow-indigo-100"
        />
        <ColoredStatCard 
          label="Active Users" 
          value="12.4k" 
          trend="-2.1%" 
          trendUp={false} 
          icon={<HiOutlineUserGroup className="w-6 h-6" />}
          gradient="from-purple-500 to-pink-600"
          shadow="shadow-purple-100"
        />
        <ColoredStatCard 
          label="Wait Time" 
          value="4.2m" 
          trend="+0.8%" 
          trendUp={false} 
          icon={<HiOutlineClock className="w-6 h-6" />}
          gradient="from-amber-500 to-orange-600"
          shadow="shadow-amber-100"
        />
      </motion.div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Progress */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-indigo-100/50 transition-colors" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="font-extrabold text-2xl text-slate-900">Revenue Growth</h3>
              <p className="text-slate-400 text-sm mt-1">Comparison between Current vs Target</p>
            </div>
            <HiOutlineArrowUpRight className="w-8 h-8 text-emerald-500 p-2 bg-emerald-50 rounded-full" />
          </div>

          <div className="flex items-end gap-3 h-64 relative z-10">
            {[45, 65, 55, 85, 95, 75, 85, 50, 70, 60, 90, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-2 group/bar cursor-pointer">
                <div className="flex-1 flex items-end">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className={`w-full rounded-2xl transition-all duration-300 ${i === 11 ? 'bg-gradient-to-t from-indigo-600 to-purple-600' : 'bg-slate-100 hover:bg-indigo-400'}`}
                  ></motion.div>
                </div>
                <span className="text-[10px] font-bold text-slate-300 group-hover/bar:text-slate-900 text-center uppercase tracking-tighter">
                  {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Region stats */}
        <motion.div variants={fadeInUp} className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-100 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
           
           <h3 className="font-extrabold text-2xl mb-8 relative z-10">Market Share</h3>
           <div className="space-y-8 relative z-10">
             <RegionItem label="Addis Ababa" value="62%" color="bg-indigo-500" icon={<HiOutlineGlobeAlt className="w-4 h-4" />} />
             <RegionItem label="Bahir Dar" value="18%" color="bg-emerald-500" icon={<HiOutlineGlobeAlt className="w-4 h-4" />} />
             <RegionItem label="Hawassa" value="12%" color="bg-amber-500" icon={<HiOutlineGlobeAlt className="w-4 h-4" />} />
             <RegionItem label="Other" value="8%" color="bg-rose-500" icon={<HiOutlineGlobeAlt className="w-4 h-4" />} />
           </div>

           <div className="mt-12 pt-8 border-t border-white/10">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">🏆</div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Best Performing</p>
                 <p className="text-sm font-bold">Electronics Category</p>
               </div>
             </div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ColoredStatCard({ label, value, trend, trendUp, icon, gradient, shadow }) {
  return (
    <div className={`bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all duration-300 shadow-sm hover:shadow-2xl ${shadow} group cursor-default relative overflow-hidden group/card`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform group-hover/card:scale-110 group-hover/card:-rotate-3`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend} {trendUp ? <HiOutlineArrowUpRight className="w-3 h-3" /> : <HiOutlineArrowDownRight className="w-3 h-3" />}
        </div>
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      
      {/* Decorative pulse on hover */}
      <div className={`absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover/card:opacity-5 transition-opacity duration-500 blur-xl`} />
    </div>
  );
}

function RegionItem({ label, value, color, icon }) {
  return (
    <div className="space-y-3 group/item">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${color} bg-opacity-20 text-white group-hover/item:scale-110 transition-transform`}>
            {icon}
          </div>
          <span className="text-sm font-bold text-slate-200">{label}</span>
        </div>
        <span className="text-sm font-black">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: value }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}
