const sections = [
  {
    title: '1. Information we collect',
    content:
      'We collect account details, shipping information, transaction records, and basic device analytics needed to operate and secure the service.',
  },
  {
    title: '2. How data is used',
    content:
      'Your data is used to process orders, personalize recommendations, provide support, and improve product quality. We do not sell personal data.',
  },
  {
    title: '3. Data retention',
    content:
      'Records are retained only for legal, operational, and fraud-prevention requirements and are deleted when no longer necessary.',
  },
  {
    title: '4. Your controls',
    content:
      'You can request account updates, data export, or deletion through support. We respond to requests within applicable legal timelines.',
  },
];

export default function Privacy() {
  return (
    <section className="container-shell py-12 md:py-16">
      <div className="panel p-6 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3857d6]">Privacy Policy</p>
        <h1 className="mt-3 text-3xl md:text-4xl">Your data, handled responsibly.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5b6475]">
          This policy explains what we collect, how we use it, and which controls you have when using EthioShop Atelier.
        </p>
        <div className="mt-8 space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-xl border border-[#d8deed] bg-[#f8faff] p-5">
              <h2 className="text-lg">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#5b6475]">{section.content}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
