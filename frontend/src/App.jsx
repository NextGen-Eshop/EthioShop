import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import CartPage from './pages/CartPage';
import { ShoppingBag, Sparkles } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      {/* Premium Navbar */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_8px_16px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-all duration-300">
                <Sparkles size={20} />
              </div>
              <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                E-Shop Cart
              </span>
            </Link>
            <div className="flex space-x-8 items-center">
              <Link to="/products" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors">Discover</Link>
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors group">
                <ShoppingBag size={24} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white shadow-sm">3</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 min-h-screen relative">
        <Routes>
          <Route path="/" element={<Navigate to="/cart" replace />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/products" element={
            <div className="pt-32 text-center text-slate-500 min-h-[80vh] flex flex-col items-center justify-center">
              <div className="glass-panel p-12 rounded-[2rem] max-w-lg mx-auto shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <h1 className="text-4xl font-extrabold mb-4 text-slate-800 relative z-10">New Collection</h1>
                <p className="text-lg relative z-10 font-medium text-slate-500 mb-8">Our premium product catalog is coming soon.</p>
                <Link to="/cart" className="relative z-10 inline-flex items-center text-white bg-indigo-600 hover:bg-indigo-700 font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5">
                  View Cart Now
                </Link>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/cart" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App;
