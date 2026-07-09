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
import LogoutConfirmModal from '../Components/LogoutConfirmModal';
import RecurringWidget from '../Components/RecurringWidget';
import Toast from '../Components/Toast';
import CryptoWidget from '../Components/CryptoWidget';
import DataTable from '../Components/DataTable';
import BulkImportModal from '../Components/BulkImportModal';

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInitialData, setEditInitialData] = useState(null);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('home');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const [toast, setToast] = useState({ message: '', type: '' });

  // --- MASAÜSTÜ DRAWER (KAYAN PANEL) STATE'LERİ ---
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isDesktopFormOpen, setIsDesktopFormOpen] = useState(false);

  // --- MOBİL PROFİL SAYFASI İÇİN STATE'LER ---
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [desktopRightTab, setDesktopRightTab] = useState('dashboard');
  const [users, setUsers] = useState([]);

  // --- BOTTOM SHEET SÜRÜKLEME (SWIPE) STATE'İ ---
  const [touchStartY, setTouchStartY] = useState(null);
  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);
  const handleTouchEnd = (e) => {
    if (touchStartY === null) return;
    const distance = e.changedTouches[0].clientY - touchStartY;
    if (distance > 50) setIsBottomSheetOpen(false);
    setTouchStartY(null);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
    window.location.href = '/login';
  };

  const masterData = useMasterData();
  const dashboardInfo = useDashboard();
  const filters = useFilters();

  const handleTransactionSuccess = () => {
    dashboardInfo.fetchDashboard();
    filters.refetchIfSearched();
  };

  const {
    transactions, page, hasMore, totalCount, fetchTransactions,
    quickLoading, addQuickTransaction,
    manualLoading, addManualTransaction,
    editLoading, updateTransaction,
    deleteTransaction,
    bulkLoading, addBulkTransactions
  } = useTransactions(handleTransactionSuccess);

  useEffect(() => {
    fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('wallet_token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Kullanıcılar çekilemedi:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSmartInputSubmit = async (text) => {
    const res = await addQuickTransaction(text);
    if (res.success) {
      setInputText("");
      setToast({ message: 'Harcama başarıyla eklendi!', type: 'success' });
    } else {
      setToast({ message: 'Eklenirken bir hata oluştu.', type: 'error' });
    }
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
      setToast({ message: `${selectedChip.toUpperCase()} harcaması eklendi!`, type: 'success' });
    } else {
      setToast({ message: 'Eklenirken bir hata oluştu.', type: 'error' });
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
    if (res.success) {
      setIsEditModalOpen(false);
      setToast({ message: 'Harcama güncellendi!', type: 'success' });
    } else {
      setToast({ message: 'Güncellenirken bir hata oluştu.', type: 'error' });
    }
  };

  const handleDeleteTransaction = async (id) => {
    const res = await deleteTransaction(id);
    // Hook'unun (useTransactions) nasıl döndüğüne bağlı olarak if kontrolü:
    if (!res || res.cancelled) return;
    if (res && res.success) {
      setToast({ message: 'Kayıt silindi!', type: 'success' });
    } else {
      setToast({ message: 'Silinirken bir hata oluştu.', type: 'error' });
    }
  };

  const handleBottomSheetFormSubmit = async (payload) => {
    const res = await addManualTransaction(payload);
    if (res.success) {
      setIsBottomSheetOpen(false);
      setToast({ message: 'Harcama başarıyla eklendi!', type: 'success' });
    } else {
      setToast({ message: 'Eklenirken bir hata oluştu.', type: 'error' });
    }
  };

  const handleDesktopManualSubmit = async (payload) => {
    const res = await addManualTransaction(payload);
    if (res.success) {
      setIsDesktopFormOpen(false);
      setToast({ message: 'Harcama başarıyla eklendi!', type: 'success' });
    } else {
      setToast({ message: 'Eklenirken bir hata oluştu.', type: 'error' });
    }
    return res;
  };

  const handleBulkSubmit = async (payload) => {
    const res = await addBulkTransactions(payload);
    if (res.success) {
      setToast({ message: `${payload.length} adet harcama başarıyla eklendi!!`, type: 'success' });
    } else {
      setToast({ message: 'Toplu ekleme sırasında hata oluştu.', type: 'error' });
    }
    return res;
  };

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

  const handleAddNewMerchant = async (merchantData) => {
    try {
      const token = localStorage.getItem('wallet_token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(`${API_BASE}/merchants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(merchantData)
      });
      
      if (response.ok) {
        const newMerchant = await response.json();
        
        // Mutate the local array to immediately reflect the new data in the dropdown
        if (masterData && masterData.merchants) {
          masterData.merchants.push(newMerchant);
        }
        
        // State update forces a re-render, passing the updated array to the modal
        setToast({ message: 'Merchant successfully added!', type: 'success' });
        
        return newMerchant;
      } else {
        setToast({ message: 'Failed to create merchant.', type: 'error' });
      }
    } catch (err) {
      console.error("Merchant creation error:", err);
      setToast({ message: 'Connection error while adding merchant.', type: 'error' });
    }
    
    return null;
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 md:px-6 pt-2 lg:pt-4 ${activeTab === 'home' ? 'pb-0' : 'pb-28'} lg:pb-8 font-sans flex flex-col gap-4 lg:gap-6 relative`}>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />

      <QuickAddModal isOpen={isQuickModalOpen} onClose={() => setIsQuickModalOpen(false)} chipName={selectedChip} onSubmit={handleQuickModalSubmit} loading={quickLoading} />
      <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} initialData={editInitialData} masterData={masterData} onSubmit={handleEditSubmit} loading={editLoading} />
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        masterData={masterData}
        onBulkSubmit={handleBulkSubmit}
        loading={bulkLoading}
        onAddNewMerchant={handleAddNewMerchant}
      />

      {/* YEPYENİ MASAÜSTÜ SAYFA BAŞLIĞI VE GÖRÜNÜM KONTROLLERİ */}
      <div className="hidden lg:flex justify-between items-end w-full px-1">
        <div>
          <h1 className="text-xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
            Finansal Merkez
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hoş geldin <span className="capitalize font-semibold">{localStorage.getItem('wallet_user')}</span>. Aile bütçesini ve varlıklarını buradan yönetebilirsin.
          </p>
        </div>


        {/* MASAÜSTÜ SEKMELERİ (Standart Akış - Ekranda hiçbir şeyi ezmez) */}
        <div className="hidden lg:flex justify-end">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-1 rounded-full shadow-sm border border-gray-200/80 dark:border-slate-700/80 transition-all flex w-fit">
            <button
              onClick={() => setDesktopRightTab('dashboard')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${desktopRightTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              {/* Dashboard SVG İkonu */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setDesktopRightTab('table')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${desktopRightTab === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              {/* Tablo SVG İkonu */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Tablo
            </button>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start lg:items-stretch">

        {/* TAB 1: ANA SAYFA */}
        <div className={`${activeTab === 'home' ? 'flex' : 'hidden'} lg:flex flex-col gap-2.5 lg:gap-6 lg:col-span-4 h-[calc(100dvh-85px)] lg:h-auto`}>
          <SmartInput inputText={inputText} setInputText={setInputText} onQuickAdd={handleSmartInputSubmit} loading={quickLoading} onChipClick={handleChipClick} />

          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 pb-28 lg:pb-0">
              <TransactionFeed transactions={transactions} categories={masterData.categories} hasMore={hasMore} onLoadMore={() => fetchTransactions(page + 1)} onEdit={handleOpenEditModal} onDelete={handleDeleteTransaction} />
            </div>
          </div>
        </div>

        {/* TAB 2: GRAFİK & TABLO (SAĞ KOLON) */}
        <div className={`${activeTab === 'grafik' ? 'flex' : 'hidden'} lg:flex flex-col gap-4 lg:gap-6 lg:col-span-8`}>

          {/* SADECE AKTİF OLAN COMPONENT RENDER EDİLİR */}
          {desktopRightTab === 'table' ? (
            <div className="hidden lg:flex flex-col flex-1">
              <DataTable
                data={transactions}
                totalCount={totalCount}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTransaction}
                hasMore={hasMore}
                onLoadMore={() => fetchTransactions(page + 1)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4 lg:gap-6">
              <DashboardView
                dashboard={dashboardInfo.dashboard}
                dashboardMonth={dashboardInfo.dashboardMonth}
                setDashboardMonth={dashboardInfo.setDashboardMonth}
                dashboardYear={dashboardInfo.dashboardYear}
                setDashboardYear={dashboardInfo.setDashboardYear}
                users={users}
                selectedUserId={dashboardInfo.selectedUserId}
                onUserSelect={dashboardInfo.setSelectedUserId}
                currencies={masterData.currencies}
                selectedCurrencyId={dashboardInfo.selectedCurrencyId}
                onCurrencySelect={dashboardInfo.setSelectedCurrencyId}
                onOpenSearch={() => setIsDesktopSearchOpen(true)}
                onOpenForm={() => setIsDesktopFormOpen(true)}
                onOpenBulkModal={() => setIsBulkModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* GELECEK RADAR ÇİZGİSİ (Abonelikler, Taksitler ve Kripto) */}
      {/* <div className={`${activeTab === 'grafik' ? 'flex' : 'hidden'} ${desktopRightTab === 'dashboard' ? 'lg:flex' : 'lg:hidden'} flex-col gap-4 lg:gap-6 w-full`}> */}
      <div className={`${activeTab === 'grafik' ? 'flex' : 'hidden'} lg:flex flex-col gap-4 lg:gap-6 w-full`}>
        <RecurringWidget masterData={masterData} />
        <CryptoWidget />
      </div>

      {/* SADECE MOBİL İÇİN OLAN ALT KISIMLAR */}
      <div className="grid grid-cols-1 gap-8 mt-0 lg:mt-4">
        {/* TAB 3: ARA (SADECE MOBİL) */}
        <div className={`${activeTab === 'ara' ? 'block' : 'hidden'} lg:hidden`}>
          <AdvancedFilter filters={filters} masterData={masterData} categories={masterData.categories} onEdit={handleOpenEditModal} onDelete={handleDeleteTransaction} />
        </div>

        {/* TAB 4: MOBİL PROFİL */}
        <div className={`${activeTab === 'profil' ? 'block' : 'hidden'} lg:hidden pb-10`}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 animate-fadeIn transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-3xl shadow-inner">👤</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Profilim</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">👋 <span className="capitalize">{localStorage.getItem('wallet_user')}</span></p>
              </div>
            </div>
            <hr className="border-gray-100 dark:border-gray-700 mb-6" />
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">🔑 Şifre Değiştir</h3>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              <input type="password" placeholder="Mevcut Şifre" required className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-sm border border-transparent dark:border-gray-700 focus:border-blue-500 focus:outline-none transition" onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} value={passwords.currentPassword} />
              <input type="password" placeholder="Yeni Şifre" required className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-sm border border-transparent dark:border-gray-700 focus:border-blue-500 focus:outline-none transition" onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} value={passwords.newPassword} />
              <input type="password" placeholder="Yeni Şifre (Tekrar)" required className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-sm border border-transparent dark:border-gray-700 focus:border-blue-500 focus:outline-none transition" onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} value={passwords.confirmPassword} />
              {pwError && <p className="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{pwError}</p>}
              <button type="submit" disabled={pwLoading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md disabled:opacity-50">
                {pwLoading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
              </button>
            </form>
            <hr className="border-gray-100 dark:border-gray-700 my-6" />
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-2">
              🚪 Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================
          MASAÜSTÜ SAĞDAN KAYAN PANELLER (DRAWER - SADECE DESKTOP)
          ======================================================= */}
      <div
        className={`hidden lg:block fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isDesktopSearchOpen || isDesktopFormOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => { setIsDesktopSearchOpen(false); setIsDesktopFormOpen(false); }}
      ></div>

      <div className={`hidden lg:block fixed top-0 right-0 h-full w-[450px] bg-slate-50 dark:bg-slate-950 z-[70] shadow-[-10px_0_40px_rgba(0,0,0,0.2)] border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-out ${isDesktopSearchOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <button
          onClick={() => setIsDesktopSearchOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition z-50 shadow-sm"
        >
          ✕
        </button>
        <div className="h-full w-full overflow-y-auto scrollbar-hide p-5 pt-16">
          <AdvancedFilter filters={filters} masterData={masterData} categories={masterData.categories} onEdit={handleOpenEditModal} onDelete={handleDeleteTransaction} />
        </div>
      </div>

      <div className={`hidden lg:block fixed top-0 right-0 h-full w-[450px] bg-slate-50 dark:bg-slate-950 z-[70] shadow-[-10px_0_40px_rgba(0,0,0,0.2)] border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-out ${isDesktopFormOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <button
          onClick={() => setIsDesktopFormOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition z-50 shadow-sm"
        >
          ✕
        </button>
        <div className="h-full w-full overflow-y-auto scrollbar-hide p-5 pt-16">
          <TransactionForm masterData={masterData} onAdd={handleDesktopManualSubmit} loading={manualLoading} />
        </div>
      </div>

      {/* MOBİL BOTTOM SHEET MODAL (Sadece Detaylı Ekleme) */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] flex justify-center items-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isBottomSheetOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsBottomSheetOpen(false)}
      >
        <div
          className={`bg-white dark:bg-slate-900 w-full rounded-t-3xl p-6 pb-12 max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-out ${isBottomSheetOpen ? "translate-y-0" : "translate-y-full"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex justify-center pb-6 -mt-2 pt-2 cursor-grab active:cursor-grabbing" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className="w-16 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
          </div>
          <TransactionForm masterData={masterData} onAdd={handleBottomSheetFormSubmit} loading={manualLoading} />
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

      {/* MOBİL ALT MENÜ (TAB BAR) */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] flex justify-around items-center px-2"
        style={{
          height: 'calc(50px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) * 0.5)',
          /* paddingBottom katsayısı 0.5 yapılarak ikonların PWA modunda aşağıya daha dengeli oturması sağlandı */
        }}
      >

        {/* 1. ANA SAYFA */}
        <button onClick={() => setActiveTab('home')} className="relative flex flex-col items-center justify-center p-2 w-16 h-12 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all duration-300 ${activeTab === 'home' ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill={activeTab === 'home' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'home' ? '0' : '2'}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={`absolute bottom-0 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300 ${activeTab === 'home' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
        </button>

        {/* 2. GRAFİK */}
        <button onClick={() => setActiveTab('grafik')} className="relative flex flex-col items-center justify-center p-2 w-16 h-12 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all duration-300 ${activeTab === 'grafik' ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill={activeTab === 'grafik' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'grafik' ? '0' : '2'}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <span className={`absolute bottom-0 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300 ${activeTab === 'grafik' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
        </button>

        {/* 3. ORTA BUTON (+) */}
        <div className="relative -top-3">
          <button onClick={() => setIsBottomSheetOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-[3.25rem] h-[3.25rem] flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(37,99,235,0.6)] dark:shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] transition-transform active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* 4. ARA */}
        <button onClick={() => setActiveTab('ara')} className="relative flex flex-col items-center justify-center p-2 w-16 h-12 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all duration-300 ${activeTab === 'ara' ? 'text-blue-600 dark:text-blue-400 scale-110 stroke-[2.5]' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 stroke-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className={`absolute bottom-0 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300 ${activeTab === 'ara' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
        </button>

        {/* 5. PROFİL */}
        <button onClick={() => setActiveTab('profil')} className="relative flex flex-col items-center justify-center p-2 w-16 h-12 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all duration-300 ${activeTab === 'profil' ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill={activeTab === 'profil' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'profil' ? '0' : '2'}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className={`absolute bottom-0 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300 ${activeTab === 'profil' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
        </button>
      </div>
    </div>
  );
}