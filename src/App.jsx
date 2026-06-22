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
  const { isDarkMode, toggleTheme } = useTheme(); // isDarkMode'u doğrudan kullanıyoruz
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

  // ARKA PLAN RENGİNİ STATE'E BAĞLADIK (Daha garanti)
  const bgColor = isDarkMode ? "bg-gray-900" : "bg-gray-50";

  return (
    <nav className={`sticky top-0 z-50 ${bgColor} backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-3 py-2 shadow-sm transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        
        {/* LOGO: Mobilde sadece icon, masaüstünde yazı */}
        <Link to="/" className="text-lg font-bold text-blue-600 dark:text-blue-400">
          <span className="hidden sm:inline">FamilyFinance ⚡</span>
          <span className="sm:hidden">⚡</span>
        </Link>

        {/* MENÜ */}
        <div className="flex gap-2 sm:gap-4 items-center">
          
          {/* Ana Sayfa: Sadece sm ve üzeri ekranlarda görünür */}
          <Link to="/" className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">Ana Sayfa</Link>

          {isAdmin && (
            <Link to="/master-data" className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {/* Mobilde ikon, masaüstünde yazı */}
              <span className="hidden sm:inline">Röntgen 🛡️</span>
              <span className="sm:hidden">🛡️</span>
            </Link>
          )}

          {/* Tema Butonu */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:inline">👋 {user}</span>
          {/* Çıkış */}
          <button 
            onClick={handleLogout} 
            className="text-sm font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400"
          >
            <span className="hidden sm:inline">Çıkış</span>
            <span className="sm:hidden">🚪</span>
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