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
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Chapa Payment Methods</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Admin Authorized 🟢
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure one or more payment methods where your Chapa earnings will be settled.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3857d6] hover:bg-[#2b44ac] text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
        >
          <CreditCard className="h-4 w-4" />
          <span>Manage Payment Methods</span>
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Payment methods updated and saved successfully!</span>
        </div>
      )}

      {/* ── Balance Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Available Balance */}
        <div className="panel p-5 bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Balance</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ETB {chapaConfig.availableBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-800 pt-2 border-t border-emerald-100 font-semibold">
            Settled automatically per your schedule
          </p>
        </div>

        {/* Pending Settlement */}
        <div className="panel p-5 bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Settlement</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ETB {chapaConfig.pendingSettlement?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Released once delivery is confirmed.
          </p>
        </div>

        {/* Total Paid Out */}
        <div className="panel p-5 bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Lifetime Paid</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ETB {chapaConfig.totalWithdrawn?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Processed via Chapa's verified banking rail.
          </p>
        </div>
      </div>

      {/* ── Active Payment Methods Display ── */}
      <div className="panel p-6 bg-white border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900">Active Payout Destinations</h2>
            <p className="text-xs text-slate-500">
              Chapa will distribute earnings across your configured methods.
            </p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            Edit Methods
          </button>
        </div>

        {enabledMethodDetails.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">No payment methods configured</p>
            <p className="text-xs text-slate-400">Click "Manage Payment Methods" to add your payout destinations.</p>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3857d6] text-white text-xs font-bold shadow-xs hover:bg-[#2b44ac] transition-all"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Add Payment Method</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledMethodDetails.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`p-4 rounded-2xl border ${method.border} ${method.bg} space-y-2.5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-xs`}>
                        <Icon className={`h-4 w-4 ${method.color}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-black ${method.color}`}>{method.label}</p>
                        <p className="text-[10px] text-slate-500">{method.description}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white border border-emerald-200 text-emerald-700">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Active
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/60">
                    <p className="text-[10px] text-slate-500 font-medium mb-0.5">{method.inputLabel}</p>
                    <p className="font-mono text-xs font-bold text-slate-900">
                      {selectedMethods[method.id] || '—'}
                    </p>
                  </div>

                  <div className="pt-1 border-t border-white/60 flex items-center gap-1 text-[11px] text-slate-600">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span>Verified by Admin · 2% Chapa fee</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Holder name & compliance strip */}
        {enabledMethodDetails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Beneficiary Name</span>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{chapaConfig.accountHolderName || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">TIN Number</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{chapaConfig.tinNumber || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Payout Schedule</span>
              <p className="font-bold text-slate-900 mt-0.5">Weekly (Fridays)</p>
            </div>
          </div>
        )}

        {/* Security / Compliance Notice */}
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
          <FileCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            All settlements are routed securely through <strong>Chapa Financial Technologies</strong> to your registered Ethiopian bank or mobile wallet. Standard cycle: 1–2 business days. A <strong>2% Chapa gateway fee</strong> applies per transaction.
          </p>
        </div>
      </div>

      {/* ── Recent Chapa Payout History ── */}
      <div className="panel overflow-hidden bg-white border border-slate-200/90 shadow-2xs">
        <div className="p-4.5 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">Settlement History</h3>
          <p className="text-xs text-slate-400">Payouts settled by Chapa to your registered accounts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Payout ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Chapa Ref</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chapaConfig.recentPayouts?.map((pot) => (
                <tr key={pot.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{pot.id}</td>
                  <td className="px-4 py-3 text-slate-500">{pot.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{pot.destination}</td>
                  <td className="px-4 py-3 font-black text-slate-900">ETB {pot.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{pot.reference}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
              <div className="panel bg-white w-full max-w-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Select Payout Methods</h3>
                      <p className="text-xs text-slate-500">Check all methods you want to receive payouts through</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  {/* Multi-select Payment Method Checkboxes */}
                  <div className="space-y-2">
                    <p className="font-bold text-slate-700 text-xs">Available Payment Rails <span className="text-slate-400 font-normal">(select one or more)</span></p>

                    {ALL_PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isChecked = method.id in selectedMethods;

                      return (
                        <div
                          key={method.id}
                          className={`rounded-xl border transition-all ${
                            isChecked
                              ? `${method.border} ${method.bg}`
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          {/* Checkbox Row */}
                          <label className="flex items-center gap-3 p-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleMethod(method.id)}
                              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer shrink-0"
                            />
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${isChecked ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                              <Icon className={`h-4 w-4 ${isChecked ? method.color : 'text-slate-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold ${isChecked ? method.color : 'text-slate-700'}`}>{method.label}</p>
                              <p className="text-[11px] text-slate-500">{method.description}</p>
                            </div>
                            {isChecked && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white border border-emerald-200 text-emerald-700 shrink-0">
                                ✓ Selected
                              </span>
                            )}
                          </label>

                          {/* Account Input — only shown when checked */}
                          {isChecked && (
                            <div className="px-4 pb-3 border-t border-white/50">
                              <label className="block font-bold text-slate-600 mb-1 mt-2">{method.inputLabel} *</label>
                              <input
                                type="text"
                                value={selectedMethods[method.id] || ''}
                                onChange={(e) => setMethodAccount(method.id, e.target.value)}
                                placeholder={method.placeholder}
                                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold focus:border-[#3857d6] focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Shared Account Info */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <p className="font-bold text-slate-700">Account Holder Details</p>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Legal Full Name *</label>
                      <input
                        type="text"
                        required
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="e.g. Alemayehu Tadesse"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-[#3857d6] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">TIN Number (Tax ID)</label>
                      <input
                        type="text"
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value)}
                        placeholder="e.g. TIN-00984123"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:border-[#3857d6] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3857d6] hover:bg-[#2b44ac] text-white font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
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
