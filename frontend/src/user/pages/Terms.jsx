import { useSettingsStore } from '../../store/settingsStore';

const defaultTerms = [
  '1. Accounts must be created with accurate information and kept secure by the user.',
  '2. Prices and stock are subject to change, but confirmed order totals are honored.',
  '3. Orders may be canceled for fraud protection, payment failure, or stock mismatch.',
  '4. Returns are accepted within policy windows when products are in original condition.',
  '5. By using this service, you agree to comply with local consumer and e-commerce laws.',
];

export default function Terms() {
  const { settings } = useSettingsStore();

  return (
    <section className="container-shell py-12 md:py-16">
      <div className="panel p-6 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00a98f]">Terms of Service</p>
        <h1 className="mt-3 text-3xl md:text-4xl">Clear terms for trusted shopping at {settings.storeName || 'EthioShop'}.</h1>
        
        {settings.termsConditions ? (
          <div className="mt-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-[#5b6475] dark:text-slate-300 whitespace-pre-line">
            {settings.termsConditions}
          </div>
        ) : null}

        <h3 className="mt-8 text-base font-bold text-slate-800 dark:text-slate-200">Standard Customer Obligations:</h3>
        <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-7 text-[#5b6475] dark:text-slate-400">
          {defaultTerms.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
