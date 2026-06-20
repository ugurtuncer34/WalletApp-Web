import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Home from './Pages/Home';
import MasterData from './Pages/MasterData';
import Login from './Pages/Login';

// JWT Token'ın içini açıp Rolü okuyan fonksiyonumuz
const getUserRole = () => {
  const token = localStorage.getItem('wallet_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // .NET'in varsayılan Rol anahtarı uzun ve çirkindir, oradan yakalıyoruz:
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
  } catch {
    return null; // Token bozuksa null dön
  }
};

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('wallet_token');
  const user = localStorage.getItem('wallet_user');

  // Rolü Navbar render olurken alıyoruz
  const role = getUserRole();
  const isAdmin = role === "Admin";

  const handleLogout = () => {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
          WalletApp ⚡
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Ana Sayfa</Link>

          {isAdmin && (
            <Link to="/master-data" className="text-sm font-medium text-purple-600 hover:text-purple-800 transition">
              Röntgen 🛡️
            </Link>
          )}

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

// Router Koruyucu Bileşen
const AdminRoute = ({ children }) => {
  const role = getUserRole();
  return role === "Admin" ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        {/* Admin rolü gerekli */}
        <Route
          path="/master-data"
          element={
            <AdminRoute>
              <MasterData />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;