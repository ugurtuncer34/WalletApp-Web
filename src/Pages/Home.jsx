import { useState, useEffect } from 'react';
import { useMasterData } from '../hooks/useMasterData';
import { useDashboard } from '../hooks/useDashboard';
import { useTransactions } from '../hooks/useTransactions';
import { useFilters } from '../hooks/useFilters';
import { getLocalDatetimeForInput } from '../utils/dateHelpers';

// Komponentler
import DashboardView from '../Components/DashboardView';
import TransactionFeed from '../Components/TransactionFeed';
import SmartInput from '../Components/SmartInput';
import TransactionForm from '../Components/TransactionForm';
import AdvancedFilter from '../Components/AdvancedFilter';
import { QuickAddModal, EditModal } from '../Components/TransactionModals';

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInitialData, setEditInitialData] = useState(null);

  const [activeTab, setActiveTab] = useState('home'); 
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // --- MOBİL PROFİL SAYFASI İÇİN STATE'LER ---
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);

  // --- BOTTOM SHEET SÜRÜKLEME (SWIPE) STATE'İ ---
  const [touchStartY, setTouchStartY] = useState(null);

  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);

  const handleTouchEnd = (e) => {
    if (touchStartY === null) return;
    const distance = e.changedTouches[0].clientY - touchStartY;
    if (distance > 50) setIsBottomSheetOpen(false);
    setTouchStartY(null);
  };

  const masterData = useMasterData();
  const dashboardInfo = useDashboard();
  const filters = useFilters();

  const handleTransactionSuccess = () => {
    dashboardInfo.fetchDashboard();
    filters.refetchIfSearched();
  };

  const {
    transactions, page, hasMore, fetchTransactions,
    quickLoading, addQuickTransaction,
    manualLoading, addManualTransaction,
    editLoading, updateTransaction,
    deleteTransaction
  } = useTransactions(handleTransactionSuccess);

  useEffect(() => {
    fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSmartInputSubmit = async (text) => {
    const res = await addQuickTransaction(text);
    if (res.success) setInputText("");
  };

  const handleChipClick = (chipWord) => {
    setSelectedChip(chipWord);
    setIsBottomSheetOpen(false); 
    setIsQuickModalOpen(true);
  };

  const handleQuickModalSubmit = async (text) => {
    const res = await addQuickTransaction(text);
    if (res.success) {
      setIsQuickModalOpen(false);
      setInputText("");
    }
  };

  const handleOpenEditModal = (t) => {
    const cat = masterData.categories.find(c => c.name === t.categoryName);
    const mer = masterData.merchants.find(m => m.name === t.merchantName);
    const cou = masterData.countries.find(c => c.name === t.countryName);
    const cur = masterData.currencies.find(c => c.symbol === t.currencySymbol);

    setEditInitialData({
      id: t.id,
      amount: t.amount,
      description: t.description || "",
      categoryId: cat ? cat.id : "",
      merchantId: mer ? mer.id : "",
      countryId: cou ? cou.id : "",
      currencyId: cur ? cur.id : "",
      date: getLocalDatetimeForInput(t.date),
      exchangeRate: t.exchangeRate || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (id, payload) => {
    const res = await updateTransaction(id, payload);
    if (res.success) setIsEditModalOpen(false);
  };

  const handleBottomSheetFormSubmit = async (payload) => {
    const res = await addManualTransaction(payload);
    if (res.success) setIsBottomSheetOpen(false);
  };

  // --- MOBİL ŞİFRE DEĞİŞTİRME HANDLER ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
        setPwError("Yeni şifreler eşleşmiyor!");
        return;
    }
    setPwLoading(true); setPwError(null);
    try {
        const token = localStorage.getItem('wallet_token');
        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${API_BASE}/Auth/change-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
        });
        if (response.ok) {
            alert("Şifre başarıyla değiştirildi!");
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            setPwError("Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.");
        }
    } catch (err) {
        setPwError("Sunucu hatası. Bağlantınızı kontrol edin.");
    } finally {
        setPwLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-2 lg:pt-4 pb-28 lg:pb-8 font-sans flex flex-col gap-4 lg:gap-6 relative">

      <QuickAddModal isOpen={isQuickModalOpen} onClose={() => setIsQuickModalOpen(false)} chipName={selectedChip} onSubmit={handleQuickModalSubmit} loading={quickLoading} />
      <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} initialData={editInitialData} masterData={masterData} onSubmit={handleEditSubmit} loading={editLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        
        {/* TAB 1: ANA SAYFA */}
        <div className={`${activeTab === 'home' ? 'flex' : 'hidden'} lg:flex flex-col gap-4 lg:gap-6 lg:col-span-4`}>
          <SmartInput inputText={inputText} setInputText={setInputText} onQuickAdd={handleSmartInputSubmit} loading={quickLoading} onChipClick={handleChipClick} />
          <TransactionFeed transactions={transactions} categories={masterData.categories} hasMore={hasMore} onLoadMore={() => fetchTransactions(page + 1)} onEdit={handleOpenEditModal} onDelete={deleteTransaction} />
        </div>

        {/* TAB 2: GRAFİK */}
        <div className={`${activeTab === 'grafik' ? 'flex' : 'hidden'} lg:flex flex-col gap-4 lg:gap-6 lg:col-span-8`}>
          <DashboardView dashboard={dashboardInfo.dashboard} dashboardMonth={dashboardInfo.dashboardMonth} setDashboardMonth={dashboardInfo.setDashboardMonth} dashboardYear={dashboardInfo.dashboardYear} setDashboardYear={dashboardInfo.setDashboardYear} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 mt-0 lg:mt-4">
        {/* TAB 3: ARA */}
        <div className={`${activeTab === 'ara' ? 'block' : 'hidden'} lg:block`}>
          <AdvancedFilter filters={filters} masterData={masterData} categories={masterData.categories} onEdit={handleOpenEditModal} onDelete={deleteTransaction} />
        </div>

        {/* =========================================================================
            TAB 4: MOBİL PROFİL SAYFASI (Tam Sayfa Görünüm)
            ========================================================================= */}
        <div className={`${activeTab === 'profil' ? 'block' : 'hidden'} lg:hidden pb-10`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 animate-fadeIn transition-colors">
            
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-3xl shadow-inner">👤</div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Profilim</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">👋 {localStorage.getItem('wallet_user')}</p>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700 mb-6" />

            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">🔑 Şifre Değiştir</h3>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
                <input type="password" placeholder="Mevcut Şifre" required className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-sm border border-transparent dark:border-gray-700 focus:border-blue-500 focus:outline-none transition" onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} value={passwords.currentPassword} />
                <input type="password" placeholder="Yeni Şifre" required className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-sm border border-transparent dark:border-gray-700 focus:border-blue-500 focus:outline-none transition" onChange={e => setPasswords({...passwords, newPassword: e.target.value})} value={passwords.newPassword} />
                <input type="password" placeholder="Yeni Şifre (Tekrar)" required className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-sm border border-transparent dark:border-gray-700 focus:border-blue-500 focus:outline-none transition" onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} value={passwords.confirmPassword} />
                
                {pwError && <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{pwError}</p>}
                
                <button type="submit" disabled={pwLoading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md disabled:opacity-50">
                    {pwLoading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                </button>
            </form>

            <hr className="border-gray-100 dark:border-gray-700 my-6" />

            <button onClick={() => {
                localStorage.removeItem('wallet_token');
                localStorage.removeItem('wallet_user');
                window.location.href = '/login';
            }} className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-2">
                🚪 Çıkış Yap
            </button>
          </div>
        </div>

        {/* MASAÜSTÜ MANUEL FORM */}
        <div className="hidden lg:block">
          <TransactionForm masterData={masterData} onAdd={addManualTransaction} loading={manualLoading} />
        </div>
      </div>

      {/* BOTTOM SHEET MODAL (Sadece Detaylı Ekleme) */}
      <div 
        className={`lg:hidden fixed inset-0 z-[60] flex justify-center items-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isBottomSheetOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsBottomSheetOpen(false)}
      >
        <div 
          className={`bg-white dark:bg-slate-900 w-full rounded-t-3xl p-6 pb-12 max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-out ${
            isBottomSheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="w-full flex justify-center pb-6 -mt-2 pt-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-16 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
          </div>
          
          <TransactionForm masterData={masterData} onAdd={handleBottomSheetFormSubmit} loading={manualLoading} />
        </div>
      </div>

      {/* MOBİL ALT MENÜ (TAB BAR) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 flex justify-around items-center h-16 z-40 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 w-16 transition-colors ${activeTab === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}>
          <span className="text-2xl mb-1">{activeTab === 'home' ? '🏠' : '🛖'}</span>
          <span className="text-[10px] font-bold">Ana Sayfa</span>
        </button>

        <button onClick={() => setActiveTab('grafik')} className={`flex flex-col items-center p-2 w-16 transition-colors ${activeTab === 'grafik' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}>
          <span className="text-2xl mb-1">📊</span>
          <span className="text-[10px] font-bold">Grafik</span>
        </button>

        {/* GÖBEKTEKİ EFSANE FAB BUTONU */}
        <div className="relative -top-6">
          <button 
            onClick={() => setIsBottomSheetOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-blue-600/40 text-3xl font-light transition-transform active:scale-95"
          >
            +
          </button>
        </div>

        <button onClick={() => setActiveTab('ara')} className={`flex flex-col items-center p-2 w-16 transition-colors ${activeTab === 'ara' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}>
          <span className="text-2xl mb-1">🔍</span>
          <span className="text-[10px] font-bold">Ara</span>
        </button>

        <button onClick={() => setActiveTab('profil')} className={`flex flex-col items-center p-2 w-16 transition-colors ${activeTab === 'profil' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}>
          <span className="text-2xl mb-1">👤</span>
          <span className="text-[10px] font-bold">Profil</span>
        </button>

      </div>
    </div>
  );
}