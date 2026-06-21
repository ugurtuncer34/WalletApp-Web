import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Home from './Pages/Home';
import MasterData from './Pages/MasterData';
import Login from './Pages/Login';

// JWT Token'ın içini açıp Rolü okuyan fonksiyonumuz
const getUserRole = () => {
  const token = localStorage.getItem('wallet_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
  } catch {
    return null;
  }
};

function Navbar() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme(); // Temayı kullan
  const token = localStorage.getItem('wallet_token');
  const user = localStorage.getItem('wallet_user');

  const role = getUserRole();
  const isAdmin = role === "Admin";

  const handleLogout = () => {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 sm:mb-2 lg:mb-4 shadow-sm transition-all duration-300">
      <div className="max-w-2xl mx-auto flex justify-between items-center">

        {/* Proje adını vitrinde FamilyFinance yaptık */}
        <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight transition-colors">
          FamilyFinance ⚡
        </Link>

        <div className="flex gap-4 items-center">
          <Link to="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Ana Sayfa</Link>

          {isAdmin && (
            <Link to="/master-data" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
              Röntgen 🛡️
            </Link>
          )}

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>

          {/* Gece / Gündüz Butonu */}
          <button
            onClick={toggleTheme}
            className="text-lg p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDarkMode ? "Gündüz Moduna Geç" : "Gece Moduna Geç"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:inline">👋 {user}</span>
          <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
}

const AdminRoute = ({ children }) => {
  const role = getUserRole();
  return role === "Admin" ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    // Tüm uygulamayı ThemeProvider ile sarmalıyoruz
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
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
    </ThemeProvider>
  );
}