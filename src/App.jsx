import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import MasterData from './pages/MasterData';

function App() {
  return (
    <BrowserRouter>
      {/* Üst Menü (Navbar) */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
            WalletApp ⚡
          </Link>
          <div className="flex gap-4">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Ana Sayfa</Link>
            <Link to="/master-data" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Röntgen</Link>
          </div>
        </div>
      </nav>

      {/* Sayfa İçerikleri */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/master-data" element={<MasterData />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;