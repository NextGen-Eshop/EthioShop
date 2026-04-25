export default function Analytics() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Analytics</h1>
          <p className="text-gray-500 text-sm">Insights and performance metrics for EthioShop.</p>
        </div>
        <button className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">
          Refresh Data
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Conversion Rate" value="4.2%" trend="+0.8%" trendUp icon="trending_up" color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Customer LTV" value="ETB 8,420" trend="+15%" trendUp icon="loyalty" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="CAC (Avg)" value="ETB 452" trend="-5%" trendUp icon="paid" color="bg-purple-50 text-purple-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic Sources */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="font-bold text-lg text-gray-900">Traffic Sources</h3>
          <div className="space-y-4">
            <SourceItem label="Direct" percentage={45} color="bg-indigo-600" />
            <SourceItem label="Social Media" percentage={30} color="bg-indigo-400" />
            <SourceItem label="Referral" percentage={15} color="bg-indigo-300" />
            <SourceItem label="Other" percentage={10} color="bg-indigo-200" />
          </div>
        </div>

        {/* Weekly Engagement */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="font-bold text-lg text-gray-900">Weekly Engagement</h3>
          <div className="flex items-end gap-3 h-40">
            {[60, 40, 80, 50, 90, 70, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-indigo-100 rounded-lg hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all cursor-pointer" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <HighlightCard title="Top Category" value="Electronics" subtitle="42% of total sales" icon="devices" />
        <HighlightCard title="Peak Hours" value="2 PM – 6 PM" subtitle="Highest order volume" icon="schedule" />
        <HighlightCard title="Return Rate" value="2.1%" subtitle="Below industry average" icon="assignment_return" />
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, trendUp, icon, color }) {
  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-indigo-100/30 hover:border-indigo-100 transition-all">
      <div className="flex justify-between items-start mb-5">
        <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${color} transition-colors`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{trend}</span>
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}

function SourceItem({ label, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900">{percentage}%</span>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function HighlightCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-100 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <p className="text-xs text-gray-400 font-medium mb-1">{title}</p>
      <p className="text-lg font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
