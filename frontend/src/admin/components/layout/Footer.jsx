export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-100 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} <span className="font-semibold text-gray-600">EthioShop</span> Admin Dashboard
        </p>
        <div className="flex items-center gap-4">
          {['Help', 'Privacy', 'Terms'].map((l) => (
            <a key={l} href="#" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
