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

      <nav className={`sticky top-0 z-50 ${navBg} backdrop-blur-md border-b ${borderCol} px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.25rem)] lg:py-3 sm:mb-2 lg:mb-4 shadow-sm transition-colors duration-300`}>
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          
          <Link to="/" className={`text-lg sm:text-xl font-bold ${accentColor} tracking-tight`}>
            FamilyFinance ⚡
          </Link>

          <div className="flex gap-4 sm:gap-6 items-center">
            
            {/* 1. ANA SAYFA */}
            <Link to="/" className={`flex items-center text-sm font-medium ${textColor} hover:text-blue-500 transition-colors`}>
              <span className="hidden sm:inline">Ana Sayfa</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:hidden">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </Link>

            {/* 2. RÖNTGEN (ADMİN) */}
            {isAdmin && (
              <Link to="/master-data" className="flex items-center text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors">
                <span className="hidden sm:inline">Röntgen</span>
                {/* 🛡️ Emojisi yerine şık bir Kalkan (Shield Check) SVG'si */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:hidden">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </Link>
            )}

            {/* 3. TEMA DEĞİŞTİRİCİ */}
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full transition-all active:scale-90 ${isDarkMode ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-gray-100 text-slate-500 hover:bg-gray-200"}`}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* 4. PROFİL ADI */}
            <span 
              className="text-sm font-medium text-gray-500 hidden sm:flex items-center gap-1.5 cursor-pointer hover:text-blue-500 transition-colors capitalize" 
              onClick={onProfileClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {user}
            </span>

            {/* 5. ÇIKIŞ YAP */}
            <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors">
              <span className="hidden sm:inline">Çıkış</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:hidden">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
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