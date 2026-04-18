import {
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineArrowUpRight,
} from 'react-icons/hi2';

export default function Analytics() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-10">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Analytics</h1>
          <p className="text-slate-500 text-sm">Insights and performance metrics for EthioShop.</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
          Refresh Data
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Conversion Rate" 
          value="4.2%" 
          trend="+0.8%" 
          trendUp={true} 
          icon={<HiOutlineChartBar className="w-5 h-5" />}
        />
        <StatCard 
          label="Customer LTV" 
          value="$842.00" 
          trend="+15%" 
          trendUp={true} 
          icon={<HiOutlineUserGroup className="w-5 h-5" />}
        />
        <StatCard 
          label="CAC (Avg)" 
          value="$45.20" 
          trend="-5%" 
          trendUp={true} 
          icon={<HiOutlineCurrencyDollar className="w-5 h-5" />}
        />
      </div>

      {/* Main Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Traffic Sources</h3>
          <div className="space-y-4">
            <SourceItem label="Direct" percentage={45} color="bg-primary" />
            <SourceItem label="Social Media" percentage={30} color="bg-slate-400" />
            <SourceItem label="Referral" percentage={15} color="bg-slate-200" />
            <SourceItem label="Other" percentage={10} color="bg-slate-100" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-8 space-y-6">
          <h3 className="font-bold text-lg text-slate-900">Weekly Engagement</h3>
          <div className="flex items-end gap-2 h-40">
            {[60, 40, 80, 50, 90, 70, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-100 rounded-t-md hover:bg-primary transition-colors cursor-pointer" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, trendUp, icon }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 transition-all hover:border-primary/20 group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend} <HiOutlineArrowUpRight className={trendUp ? 'rotate-0' : 'rotate-90'} />
        </div>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

function SourceItem({ label, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
