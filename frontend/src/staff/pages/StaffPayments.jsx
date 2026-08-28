import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  X,
  FileCheck,
  Smartphone,
  Building2,
  Wallet,
  Save
} from 'lucide-react';
import { useStaffStore } from '../store/staffStore';
import { useThemeStore } from '../../store/themeStore';

const ALL_PAYMENT_METHODS = [
  {
    id: 'telebirr',
    label: 'Telebirr',
    description: 'Ethiopian Telecom mobile wallet',
    icon: Smartphone,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    placeholder: '+251 91 122 3344',
    inputLabel: 'Telebirr Phone Number',
  },
  {
    id: 'cbe_birr',
    label: 'CBE Birr',
    description: 'Commercial Bank of Ethiopia mobile wallet',
    icon: Smartphone,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    placeholder: '+251 92 000 1122',
    inputLabel: 'CBE Birr Phone Number',
  },
  {
    id: 'cbe_bank',
    label: 'CBE Bank Transfer',
    description: 'Commercial Bank of Ethiopia account',
    icon: Building2,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    placeholder: '1000123456789',
    inputLabel: 'CBE Account Number',
  },
  {
    id: 'awash_bank',
    label: 'Awash Bank',
    description: 'Awash International Bank account',
    icon: Building2,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    placeholder: '0011234567890',
    inputLabel: 'Awash Account Number',
  },
  {
    id: 'abyssinia',
    label: 'Bank of Abyssinia',
    description: 'Bank of Abyssinia transfer',
    icon: Building2,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    placeholder: '0021234567890',
    inputLabel: 'BOA Account Number',
  },
  {
    id: 'amhara_bank',
    label: 'Amhara Bank',
    description: 'Amhara Bank digital transfer',
    icon: Building2,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    placeholder: '0031234567890',
    inputLabel: 'Amhara Bank Account Number',
  },
];

export default function StaffPayments() {
  const { chapaConfig, updateChapaConfig } = useStaffStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Multi-select: selectedMethods is a record of { methodId: accountNumber }
  const [selectedMethods, setSelectedMethods] = useState(
    chapaConfig.selectedMethods || {
      telebirr: chapaConfig.accountNumber || '',
    }
  );
  const [accountHolderName, setAccountHolderName] = useState(chapaConfig.accountHolderName || '');
  const [tinNumber, setTinNumber] = useState(chapaConfig.tinNumber || '');

  const toggleMethod = (id) => {
    setSelectedMethods((prev) => {
      if (id in prev) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: '' };
    });
  };

  const setMethodAccount = (id, value) => {
    setSelectedMethods((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const enabledMethods = Object.keys(selectedMethods);
    if (enabledMethods.length === 0) {
      alert('Please select at least one payout method.');
      return;
    }
    const missing = enabledMethods.filter((id) => !selectedMethods[id]?.trim());
    if (missing.length > 0) {
      alert(`Please enter account/phone numbers for: ${missing.join(', ')}`);
      return;
    }
    if (!accountHolderName.trim()) {
      alert('Please enter the account holder name.');
      return;
    }

    updateChapaConfig({
      selectedMethods,
      accountHolderName,
      tinNumber,
      // Backward-compat: primary method is the first selected one
      payoutMethod: enabledMethods[0],
      accountNumber: selectedMethods[enabledMethods[0]] || '',
      bankName: ALL_PAYMENT_METHODS.find((m) => m.id === enabledMethods[0])?.label || enabledMethods[0],
    });

    setSaved(true);
    setIsEditModalOpen(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const enabledMethodIds = Object.keys(selectedMethods);
  const enabledMethodDetails = ALL_PAYMENT_METHODS.filter((m) => enabledMethodIds.includes(m.id));

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Chapa Payment Methods</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              Admin Authorized 🟢
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure one or more payment methods where your Chapa earnings will be settled.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer shrink-0"
        >
          <CreditCard className="h-4 w-4" />
          <span>Manage Payment Methods</span>
        </button>
      </div>

      {saved && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border ${
          isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Payment methods updated and saved successfully!</span>
        </div>
      )}

      {/* ── Balance Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Available Balance */}
        <div className={`panel p-5 border shadow-xs space-y-3 rounded-2xl ${
          isDark ? 'bg-[#0f1222] border-emerald-500/30 text-white' : 'bg-gradient-to-br from-white to-emerald-50/40 border-emerald-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ETB {chapaConfig.availableBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[11px] pt-2 border-t font-semibold ${isDark ? 'text-emerald-400 border-emerald-500/20' : 'text-emerald-800 border-emerald-100'}`}>
            Settled automatically per your schedule
          </p>
        </div>

        {/* Pending Settlement */}
        <div className={`panel p-5 border shadow-xs space-y-3 rounded-2xl ${
          isDark ? 'bg-[#0f1222] border-[#1b1f38] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Settlement</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ETB {chapaConfig.pendingSettlement?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-[11px] text-slate-400 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            Released once delivery is confirmed.
          </p>
        </div>

        {/* Total Paid Out */}
        <div className={`panel p-5 border shadow-xs space-y-3 rounded-2xl ${
          isDark ? 'bg-[#0f1222] border-[#1b1f38] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Lifetime Paid</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ETB {chapaConfig.totalWithdrawn?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-[11px] text-slate-400 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            Processed via Chapa's verified banking rail.
          </p>
        </div>
      </div>

      {/* ── Active Payment Methods Display ── */}
      <div className={`panel p-6 border shadow-2xs space-y-5 rounded-2xl ${
        isDark ? 'bg-[#0f1222] border-[#1b1f38] text-white' : 'bg-white border-slate-200/90 text-slate-900'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
          isDark ? 'border-white/10' : 'border-slate-100'
        }`}>
          <div>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Active Payout Destinations</h2>
            <p className="text-xs text-slate-400">
              Chapa will distribute earnings across your configured methods.
            </p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer ${
              isDark ? 'border-white/10 text-slate-200 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            Edit Methods
          </button>
        </div>

        {enabledMethodDetails.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto ${
              isDark ? 'bg-[#151828] text-slate-400' : 'bg-slate-100 text-slate-400'
            }`}>
              <CreditCard className="h-6 w-6" />
            </div>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>No payment methods configured</p>
            <p className="text-xs text-slate-400">Click "Manage Payment Methods" to add your payout destinations.</p>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-xs"
            >
              Add Payout Method
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledMethodDetails.map((method) => {
              const Icon = method.icon;
              const account = selectedMethods[method.id];

              return (
                <div
                  key={method.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark
                      ? 'bg-[#14182c] border-white/10 hover:border-purple-500/50'
                      : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                        isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-white shadow-xs text-indigo-600'
                      }`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{method.label}</p>
                        <span className={`text-[10px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Active & Verified</span>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  </div>

                  <div className={`p-2.5 rounded-xl border font-mono text-xs font-bold break-all ${
                    isDark ? 'bg-[#0f1222] border-white/5 text-purple-300' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    {account}
                  </div>

                  <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400">
                    <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>Verified by Admin · 2% Chapa fee</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Holder name & compliance strip */}
        {enabledMethodDetails.length > 0 && (
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t text-xs ${
            isDark ? 'border-white/10' : 'border-slate-100'
          }`}>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#14182c] border-[#1b1f38]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Beneficiary Name</span>
              <p className={`font-bold mt-0.5 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{chapaConfig.accountHolderName || '—'}</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#14182c] border-[#1b1f38]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="text-slate-400 font-bold uppercase text-[10px]">TIN Number</span>
              <p className={`font-mono font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{chapaConfig.tinNumber || '—'}</p>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#14182c] border-[#1b1f38]' : 'bg-slate-50 border-slate-100'}`}>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Payout Schedule</span>
              <p className={`font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Weekly (Fridays)</p>
            </div>
          </div>
        )}

        {/* Security / Compliance Notice */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
          isDark ? 'bg-purple-950/30 border-purple-500/30 text-purple-200' : 'bg-indigo-50/70 border-indigo-100 text-indigo-900'
        }`}>
          <FileCheck className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            All settlements are routed securely through <strong>Chapa Financial Technologies</strong> to your registered Ethiopian bank or mobile wallet. Standard cycle: 1–2 business days. A <strong>2% Chapa gateway fee</strong> applies per transaction.
          </p>
        </div>
      </div>

      {/* ── Recent Chapa Payout History ── */}
      <div className={`panel overflow-hidden border shadow-2xs rounded-2xl ${
        isDark ? 'bg-[#0f1222] border-[#1b1f38]' : 'bg-white border-slate-200/90'
      }`}>
        <div className={`p-4.5 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Settlement History</h3>
          <p className="text-xs text-slate-400">Payouts settled by Chapa to your registered accounts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${
              isDark ? 'bg-[#14182c] border-[#1b1f38] text-slate-400' : 'bg-slate-50/80 border-slate-100 text-slate-400'
            }`}>
              <tr>
                <th className="px-4 py-3">Payout ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Chapa Ref</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1b1f38]' : 'divide-slate-100'}`}>
              {chapaConfig.recentPayouts?.map((pot) => (
                <tr key={pot.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/70'}`}>
                  <td className={`px-4 py-3 font-mono font-bold ${isDark ? 'text-purple-400' : 'text-slate-900'}`}>{pot.id}</td>
                  <td className="px-4 py-3 text-slate-400">{pot.date}</td>
                  <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{pot.destination}</td>
                  <td className={`px-4 py-3 font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>ETB {pot.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{pot.reference}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {pot.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Manage Payment Methods (Multi-Select) ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div className={`panel w-full max-w-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto rounded-2xl border ${
                isDark ? 'bg-[#121526] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                {/* Modal Header */}
                <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Select Payout Methods</h3>
                      <p className="text-xs text-slate-400">Check all methods you want to receive payouts through</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  {/* Multi-select Payment Method Checkboxes */}
                  <div className="space-y-2">
                    <p className={`font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Available Payment Rails <span className="text-slate-400 font-normal">(select one or more)</span></p>

                    {ALL_PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isChecked = method.id in selectedMethods;

                      return (
                        <div
                          key={method.id}
                          className={`rounded-xl border transition-all ${
                            isChecked
                              ? isDark
                                ? 'bg-purple-950/30 border-purple-500/50'
                                : `${method.border} ${method.bg}`
                              : isDark
                              ? 'border-white/10 bg-[#151828] hover:bg-white/[0.04]'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          {/* Checkbox Row */}
                          <label className="flex items-center gap-3 p-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMethod(method.id)}
                              className="h-4 w-4 rounded accent-purple-600 cursor-pointer shrink-0"
                            />
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isChecked
                                ? isDark ? 'bg-purple-600/30 text-purple-300' : 'bg-white shadow-xs'
                                : isDark ? 'bg-[#1c2038]' : 'bg-slate-100'
                            }`}>
                              <Icon className={`h-4 w-4 ${isChecked ? isDark ? 'text-purple-300' : method.color : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold ${isChecked ? isDark ? 'text-purple-300' : method.color : isDark ? 'text-white' : 'text-slate-700'}`}>{method.label}</p>
                              <p className="text-[11px] text-slate-400">{method.description}</p>
                            </div>
                            {isChecked && (
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white border border-emerald-200 text-emerald-700'
                              }`}>
                                ✓ Selected
                              </span>
                            )}
                          </label>

                          {/* Account Input — only shown when checked */}
                          {isChecked && (
                            <div className={`px-4 pb-3 border-t ${isDark ? 'border-white/10' : 'border-white/50'}`}>
                              <label className={`block font-bold mb-1 mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{method.inputLabel} *</label>
                              <input
                                type="text"
                                value={selectedMethods[method.id] || ''}
                                onChange={(e) => setMethodAccount(method.id, e.target.value)}
                                placeholder={method.placeholder}
                                className={`w-full h-9 px-3 rounded-xl border text-xs font-mono font-bold focus:outline-none ${
                                  isDark
                                    ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                                    : 'border-slate-200 bg-white text-slate-900 focus:border-purple-600'
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Shared Account Info */}
                  <div className={`pt-2 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Account Holder Details</p>

                    <div>
                      <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Legal Full Name *</label>
                      <input
                        type="text"
                        required
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="e.g. Alemayehu Tadesse"
                        className={`w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none ${
                          isDark
                            ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>TIN Number (Tax ID)</label>
                      <input
                        type="text"
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value)}
                        placeholder="e.g. TIN-00984123"
                        className={`w-full h-10 px-3 rounded-xl border text-xs font-mono focus:outline-none ${
                          isDark
                            ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className={`px-4 py-2.5 rounded-xl border font-bold cursor-pointer ${
                        isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/25 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Payment Methods</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
