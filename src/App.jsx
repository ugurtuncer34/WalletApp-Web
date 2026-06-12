import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import MasterData from './pages/MasterData';
import Login from './pages/Login'; // Yeni sayfamızı import ettik

// Çıkış butonu işlemi için yardımcı bileşen
function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('wallet_token');
  const user = localStorage.getItem('wallet_user');

  const handleLogout = () => {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    navigate('/login');
  };

  // Eğer giriş yapılmamışsa menüyü gösterme
  if (!token) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
          WalletApp ⚡
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Ana Sayfa</Link>
          <Link to="/master-data" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Röntgen</Link>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <span className="text-sm text-gray-400">👋 {user}</span>
          <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700 transition">
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/master-data" element={<MasterData />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;