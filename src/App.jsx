import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useState } from 'react';
import Home from './Pages/Home';
import MasterData from './Pages/MasterData';
import Login from './Pages/Login';
import ProfileModal from './Components/ProfileModal';
import LogoutConfirmModal from './Components/LogoutConfirmModal';

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

function Navbar({onProfileClick}) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const token = localStorage.getItem('wallet_token');
  const user = localStorage.getItem('wallet_user');
  
  // YENİ: Çıkış modalı state'i
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const role = getUserRole();
  const isAdmin = role === "Admin";

  const handleLogout = () => {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    navigate('/login');
  };

  if (!token) return null;

  const navBg = isDarkMode ? "bg-slate-900/90" : "bg-white/90";
  const borderCol = isDarkMode ? "border-slate-800" : "border-gray-200";
  const textColor = isDarkMode ? "text-gray-300" : "text-gray-600";
  const accentColor = isDarkMode ? "text-blue-400" : "text-blue-600";

  return (
    <>
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogout} 
      />

      {/* DİKKAT: pb-3 pt-[...] kuralını sadece mobilde kullanıp, masaüstünde lg:py-3 ile eziyoruz */}
      <nav className={`sticky top-0 z-50 ${navBg} backdrop-blur-md border-b ${borderCol} px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.25rem)] lg:py-3 sm:mb-2 lg:mb-4 shadow-sm transition-colors duration-300`}>
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link to="/" className={`text-lg sm:text-xl font-bold ${accentColor} tracking-tight`}>
            FamilyFinance ⚡
          </Link>

          <div className="flex gap-3 sm:gap-5 items-center">
            <Link to="/" className={`text-sm font-medium ${textColor} hover:text-blue-500`}>
              <span className="hidden sm:inline">Ana Sayfa</span>
              <span className="sm:hidden">🏠</span>
            </Link>

            {isAdmin && (
              <Link to="/master-data" className="text-sm font-medium text-purple-500 hover:text-purple-400">
                <span className="hidden sm:inline">Röntgen 🛡️</span>
                <span className="sm:hidden">🛡️</span>
              </Link>
            )}

            <button onClick={toggleTheme} className={`p-2 rounded-full ${isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-200"}`}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <span 
              className="text-xs sm:text-sm text-gray-400 hidden sm:inline cursor-pointer hover:text-blue-500 transition" 
              onClick={onProfileClick}
            >
              👋 {user}
            </span>

            {/* YENİ: Artık direkt handleLogout çağırmıyor, Modalı açıyor */}
            <button onClick={() => setIsLogoutModalOpen(true)} className="text-sm font-medium text-red-500 hover:text-red-700">
              <span className="hidden sm:inline">Çıkış</span>
              <span className="sm:hidden text-lg">🚪</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

const AdminRoute = ({ children }) => {
  const role = getUserRole();
  return role === "Admin" ? children : <Navigate to="/" />;
};

// Fazladan koyduğum o belalı BottomTabBar'ı sildim. Sadece Layout iskeleti kaldı.
function Layout({ children, onProfileClick }) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar onProfileClick={onProfileClick} />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  return (
    <ThemeProvider>
      <BrowserRouter>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Tek ve doğru olan yol: */}
          <Route path="/" element={<Layout onProfileClick={() => setIsProfileOpen(true)}><Home /></Layout>} />
          <Route path="/master-data" element={<Layout onProfileClick={() => setIsProfileOpen(true)}><AdminRoute><MasterData /></AdminRoute></Layout>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}