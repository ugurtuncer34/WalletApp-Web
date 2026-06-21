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
  // --- LOKAL UI STATE'LERİ ---
  const [inputText, setInputText] = useState("");
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInitialData, setEditInitialData] = useState(null);

  // --- CUSTOM HOOK'LAR ---
  const masterData = useMasterData();
  const dashboardInfo = useDashboard();
  const filters = useFilters();

  // Herhangi bir ekleme/silme/güncelleme başarılı olduğunda ekranı tazeleme mantığı
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

  // Sayfa ilk yüklendiğinde listeyi çek
  useEffect(() => {
    fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- UI TETİKLEYİCİLERİ (HANDLERS) ---
  const handleSmartInputSubmit = async (text) => {
    const res = await addQuickTransaction(text);
    if (res.success) setInputText("");
  };

  const handleChipClick = (chipWord) => {
    setSelectedChip(chipWord);
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
    // Tıklanan kaydın string değerlerinden ID'lerini bulup form formatına çevir
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

  // --- RENDER ---
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-2 lg:pt-4 pb-8 font-sans flex flex-col gap-4 lg:gap-6">

      {/* MODALLAR */}
      <QuickAddModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        chipName={selectedChip}
        onSubmit={handleQuickModalSubmit}
        loading={quickLoading}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={editInitialData}
        masterData={masterData}
        onSubmit={handleEditSubmit}
        loading={editLoading}
      />

      {/* ÜST BÖLÜM: Sol Kolon (Akıllı Giriş & Liste) + Sağ Kolon (Dashboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <SmartInput
            inputText={inputText}
            setInputText={setInputText}
            onQuickAdd={handleSmartInputSubmit}
            loading={quickLoading}
            onChipClick={handleChipClick}
          />
          <TransactionFeed
            transactions={transactions}
            categories={masterData.categories}
            hasMore={hasMore}
            onLoadMore={() => fetchTransactions(page + 1)}
            onEdit={handleOpenEditModal}
            onDelete={deleteTransaction}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
          <DashboardView
            dashboard={dashboardInfo.dashboard}
            dashboardMonth={dashboardInfo.dashboardMonth}
            setDashboardMonth={dashboardInfo.setDashboardMonth}
            dashboardYear={dashboardInfo.dashboardYear}
            setDashboardYear={dashboardInfo.setDashboardYear}
          />
        </div>
      </div>

      {/* ALT BÖLÜM: Gelişmiş Filtre & Manuel Ekleme */}
      <div className="grid grid-cols-1 gap-8 mt-4">
        <AdvancedFilter
          filters={filters}
          masterData={masterData}
          categories={masterData.categories}
          onEdit={handleOpenEditModal}
          onDelete={deleteTransaction}
        />

        <TransactionForm
          masterData={masterData}
          onAdd={addManualTransaction}
          loading={manualLoading}
        />
      </div>

    </div>
  );
}