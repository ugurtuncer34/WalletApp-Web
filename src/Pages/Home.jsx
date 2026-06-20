/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import SearchableSelect from '../Components/Combobox';
import CategorySelect from '../Components/CategorySelect';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ana akış ve Dashboard State'leri
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  // Master Data State'leri 
  const [categories, setCategories] = useState([]);

  // Kategori ağaç yapısı sıralaması
  const groupedCategories = useMemo(() => {
    const result = [];
    // Sadece ana kategorileri (Parent'ı olmayanları) bul
    const parents = categories.filter(c => !c.parentCategory);

    parents.forEach(p => {
      // Ana kategoriyi listeye ekle
      result.push({ ...p, isParent: true });

      // Bu ana kategoriye ait alt kategorileri bul ve hemen altına ekle
      const children = categories.filter(c => c.parentCategory?.id === p.id);
      children.forEach(ch => {
        result.push({ ...ch, isParent: false });
      });
    });

    return result.length > 0 ? result : categories;
  }, [categories]);

  const [merchants, setMerchants] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // Dashboard Filtre State'leri
  const [dashboardMonth, setDashboardMonth] = useState(new Date().getMonth() + 1); // JS'de aylar 0'dan başlar, o yüzden +1
  const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear());

  // Filtreli Arama State'leri
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterMerchantId, setFilterMerchantId] = useState("");
  const [filterCountryId, setFilterCountryId] = useState("");
  const [filterCurrencyId, setFilterCurrencyId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // Manuel Ekleme Form State'leri
  const [manualForm, setManualForm] = useState({
    amount: "", date: "", description: "", categoryId: "", merchantId: "", countryId: "", currencyId: "", exchangeRate: ""
  });
  const [manualLoading, setManualLoading] = useState(false);

  // Modal State'leri (Hızlı Ekleme)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState("");
  const [chipAmount, setChipAmount] = useState("");

  // Düzenleme Modalı State'leri
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const token = localStorage.getItem('wallet_token');
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // === DATA FETCHING ===
  const fetchDashboard = async (m = dashboardMonth, y = dashboardYear) => {
    try {
      const res = await fetch(`${API_BASE}/dashboard?month=${m}&year=${y}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setDashboard(await res.json());
    } catch (err) { console.error("Dashboard çekilemedi:", err); }
  };

  const fetchTransactions = async (pageNum = 1) => {
    try {
      const res = await fetch(`${API_BASE}/transactions?PageNumber=${pageNum}&PageSize=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('wallet_token');
        navigate('/login');
        return;
      }
      const data = await res.json();
      if (pageNum === 1) setTransactions(data.items);
      else setTransactions(prev => [...prev, ...data.items]);

      setHasMore(data.totalCount > pageNum * data.pageSize);
      setPage(pageNum);
    } catch (err) { console.error("Harcamalar çekilemedi:", err); }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/master-data`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setMerchants(data.merchants || []);
        setCountries(data.countries || []);
        setCurrencies(data.currencies || []);
      }
    } catch (err) { console.error("Filtre seçenekleri yüklenemedi:", err); }
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchDashboard(dashboardMonth, dashboardYear);
    fetchTransactions(1);
    fetchFilterOptions();
  }, [token, navigate, dashboardMonth, dashboardYear]);

  // === SEARCH & FILTER ===
  const handleFilterSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setFilterLoading(true);
    try {
      let url = `${API_BASE}/transactions?PageNumber=1&PageSize=50`;
      if (filterCategoryId) url += `&CategoryId=${filterCategoryId}`;
      if (filterMerchantId) url += `&MerchantId=${filterMerchantId}`;
      if (filterCountryId) url += `&CountryId=${filterCountryId}`;
      if (filterCurrencyId) url += `&CurrencyId=${filterCurrencyId}`;
      if (filterStartDate) url += `&StartDate=${filterStartDate}`;
      if (filterEndDate) url += `&EndDate=${filterEndDate}`;

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setFilteredTransactions(data.items || []);
        setHasSearched(true);
      }
    } catch (err) { console.error("Filtreleme hatası:", err); }
    finally { setFilterLoading(false); }
  };

  const handleClearFilter = () => {
    setFilterCategoryId(""); setFilterMerchantId(""); setFilterCountryId(""); setFilterCurrencyId(""); setFilterStartDate(""); setFilterEndDate("");
    setFilteredTransactions([]); setHasSearched(false);
  };

  // === QUICK ADD & MODAL ===
  const handleQuickAdd = async (textToSubmit) => {
    if (!textToSubmit) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/transactions/quick-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: textToSubmit })
      });
      if (res.ok) {
        setInputText(""); setChipAmount(""); setIsModalOpen(false);
        fetchDashboard(); fetchTransactions(1);
        if (hasSearched) handleFilterSearch();
      } else {
        const errData = await res.json(); alert("Hata: " + (errData.message || "Bilinmeyen hata"));
      }
    } catch (err) { alert("Sunucuya bağlanılamadı."); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleQuickAdd(inputText); };
  const handleChipClick = (chipWord) => { setSelectedChip(chipWord); setChipAmount(""); setIsModalOpen(true); };
  const handleModalSubmit = (e) => { e.preventDefault(); if (chipAmount) handleQuickAdd(`${chipAmount} ${selectedChip}`); };

  // === MANUEL EKLEME ===
  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualForm.amount || !manualForm.categoryId) {
      alert("Tutar ve Kategori zorunludur!");
      return;
    }
    setManualLoading(true);

    const payload = {
      amount: parseFloat(manualForm.amount),
      description: manualForm.description || null,
      categoryId: manualForm.categoryId,
      merchantId: manualForm.merchantId || null,
      countryId: manualForm.countryId || null,
      currencyId: manualForm.currencyId || null,
      date: manualForm.date ? new Date(manualForm.date).toISOString() : null,
      exchangeRate: manualForm.exchangeRate ? parseFloat(manualForm.exchangeRate) : null
    };

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setManualForm({ amount: "", date: "", description: "", categoryId: "", merchantId: "", countryId: "", currencyId: "", exchangeRate: "" });
        fetchDashboard(); fetchTransactions(1);
        if (hasSearched) handleFilterSearch();
        alert("Harcama başarıyla eklendi!");
      } else {
        const errData = await res.json();
        alert("Hata: " + (errData.message || "Ekleme başarısız."));
      }
    } catch (err) { alert("Sunucuya bağlanılamadı."); }
    finally { setManualLoading(false); }
  };

  // === SİLME (DELETE) İŞLEMİ ===
  const handleDeleteTransaction = async (id) => {
    const isConfirmed = window.confirm("Bu harcamayı silmek istediğinize emin misiniz?");
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchDashboard();
        fetchTransactions(1);
        if (hasSearched) handleFilterSearch();
      } else {
        alert("Silme işlemi başarısız oldu.");
      }
    } catch (err) { alert("Sunucuya bağlanılamadı."); }
  };

  // === DÜZENLEME (EDIT) İŞLEMLERİ ===
  const getLocalDatetimeForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleOpenEditModal = (t) => {
    const cat = categories.find(c => c.name === t.categoryName);
    const mer = merchants.find(m => m.name === t.merchantName);
    const cou = countries.find(c => c.name === t.countryName);
    const cur = currencies.find(c => c.symbol === t.currencySymbol);

    setEditForm({
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const emptyGuid = "00000000-0000-0000-0000-000000000000";

    const payload = {
      amount: parseFloat(editForm.amount),
      description: editForm.description || "",
      categoryId: editForm.categoryId || undefined,
      merchantId: editForm.merchantId ? editForm.merchantId : emptyGuid,
      countryId: editForm.countryId ? editForm.countryId : emptyGuid,
      currencyId: editForm.currencyId ? editForm.currencyId : emptyGuid,
      date: editForm.date ? new Date(editForm.date).toISOString() : undefined,
      exchangeRate: editForm.exchangeRate ? parseFloat(editForm.exchangeRate) : undefined
    };

    try {
      const res = await fetch(`${API_BASE}/transactions/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditForm(null);
        fetchDashboard();
        fetchTransactions(page);
        if (hasSearched) handleFilterSearch();
      } else {
        const errData = await res.json();
        alert("Güncelleme başarısız: " + (errData.message || "Bilinmeyen Hata"));
      }
    } catch (err) { alert("Sunucuya bağlanılamadı."); }
    finally { setEditLoading(false); }
  };

  // Helpers
  const formatDateTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '';
  const formatChartDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '';


  // === AKILLI İŞYERİ (MERCHANT) FİLTRELEME YARDIMCISI ===
  const getFilteredMerchants = (selectedCategoryId) => {
    // Kategori seçilmediyse hepsini getir
    if (!selectedCategoryId) return merchants;

    // Seçilen kategorinin kendi ID'si ve (eğer varsa) alt kategorilerinin ID'lerini bir diziye topla
    const validCategoryIds = [
      selectedCategoryId,
      ...categories.filter(c => c.parentCategory?.id === selectedCategoryId).map(c => c.id)
    ];

    // Default kategorisi bu dizideki ID'lerden biri olan işyerlerini döndür
    return merchants.filter(m => m.defaultCategory && validCategoryIds.includes(m.defaultCategory.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-2 lg:pt-4 pb-8 font-sans flex flex-col gap-4 lg:gap-6">

      {/* QUICK CHIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 capitalize">{selectedChip} Ekle</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
            </div>
            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase mb-2 block">Tutar (₺)</label>
                <input type="number" autoFocus value={chipAmount} onChange={(e) => setChipAmount(e.target.value)} placeholder="Örn: 150" disabled={loading} className="w-full text-2xl p-4 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition" />
              </div>
              <button type="submit" disabled={loading || !chipAmount} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md disabled:opacity-50">
                {loading ? 'Ekleniyor...' : 'Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DÜZENLEME MODALI */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">✏️ Harcamayı Düzenle</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tutar *</label>
                <input type="number" step="0.01" required value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} className="p-3 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Kategori *</label>
                <CategorySelect
                  options={groupedCategories}
                  value={editForm.categoryId}
                  onChange={(val) => setEditForm({ ...editForm, categoryId: val })}
                  placeholder="Seçiniz..."
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Açıklama</label>
                <input type="text" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="p-3 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">İşyeri</label>
                <SearchableSelect
                  options={getFilteredMerchants(editForm.categoryId)}
                  value={editForm.merchantId}
                  onChange={(val) => setEditForm({ ...editForm, merchantId: val })}
                  placeholder="İsteğe Bağlı"
                  emptyLabel="Boş Bırak (Temizle)"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tarih</label>
                <input type="datetime-local" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} className="p-3 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Ülke</label>
                <select value={editForm.countryId} onChange={e => setEditForm({ ...editForm, countryId: e.target.value })} className="p-3 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition">
                  <option value="">Varsayılan (TR)</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Döviz & Kur</label>
                <div className="flex gap-2">
                  <select value={editForm.currencyId} onChange={e => setEditForm({ ...editForm, currencyId: e.target.value })} className="w-1/2 p-3 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition">
                    <option value="">Varsayılan (TRY)</option>
                    {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
                  <input type="number" step="0.01" value={editForm.exchangeRate} onChange={e => setEditForm({ ...editForm, exchangeRate: e.target.value })} placeholder="Kur (1)" className="w-1/2 p-3 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" />
                </div>
              </div>

              <button type="submit" disabled={editLoading} className="md:col-span-2 w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-md disabled:opacity-50">
                {editLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ÜST GRİD: OPERASYON VE GRAFİKLER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        
        {/* SOL KOLON (Akıllı Giriş, Çipler, Canlı Akış) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
            <h2 className="text-gray-800 font-bold mb-4">Akıllı Giriş</h2>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Örn: 150 file market..." disabled={loading} className="w-full text-lg p-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition" />
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
            <h2 className="text-gray-800 font-bold mb-3 text-sm">Hızlı İşlem (Tek Tık)</h2>
            <div className="flex flex-wrap gap-2">
              {["Kahve", "File", "Fırın", "Şok", "Opet", "Eczane"].map((chip) => (
                <button key={chip} onClick={() => handleChipClick(chip.toLowerCase())} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl font-semibold text-sm hover:from-blue-100 hover:to-blue-200 border border-blue-200/50 shadow-sm transition active:scale-95">
                  ⚡ {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col h-[400px] xl:h-[550px]">
            <h2 className="text-gray-800 font-bold mb-4 flex justify-between items-center">
              <span>Son İşlemler (Canlı Akış)</span>
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{transactions.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {transactions.map((t) => {
                const catObj = categories.find(c => c.name === t.categoryName);
                const subtitleCategory = catObj?.parentCategory?.name || t.categoryName;

                return (
                  <div key={t.id} className="p-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 border border-transparent hover:border-gray-100 transition duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl shadow-sm">
                        {t.categoryIcon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">
                          {formatDateTime(t.date)}
                        </span>
                        <p className="font-semibold text-gray-800 text-sm capitalize">
                          {(t.description || t.categoryName || "").toLocaleLowerCase('tr-TR')}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5 text-[10px]">
                          {subtitleCategory}
                          {t.merchantName ? ` • ${t.merchantName}` : ''}
                          {t.countryName && t.countryName !== 'TÜRKİYE' && t.countryName !== 'Türkiye' ? ` • ${t.countryName}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex flex-col items-end justify-center min-w-[70px]">
                      <div className="absolute -top-4 right-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm shadow-sm rounded-md border border-gray-100 p-0.5 z-20 pointer-events-none group-hover:pointer-events-auto">
                        <button onClick={() => handleOpenEditModal(t)} className="text-gray-400 hover:text-blue-600 p-1 text-[10px] leading-none rounded hover:bg-blue-50 transition" title="Düzenle">✏️</button>
                        <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-400 hover:text-red-600 p-1 text-[10px] leading-none rounded hover:bg-red-50 transition" title="Sil">🗑️</button>
                      </div>
                      <div className="font-bold text-gray-900 text-right mt-3">
                        {t.amount} {t.currencySymbol ? t.currencySymbol : '₺'}
                        {t.exchangeRate && t.exchangeRate !== 1 && <div className="text-[9px] text-gray-400 font-normal mt-0.5">Kur: {t.exchangeRate}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Henüz harcama yok.</p>}
              {hasMore && transactions.length > 0 && (
                <button onClick={() => fetchTransactions(page + 1)} className="w-full mt-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl transition">
                  Daha Fazla Yükle ↓
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ KOLON (Dashboard) */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* DASHBOARD BAŞLIK VE FİLTRE BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 gap-4">
            <h3 className="text-gray-800 font-bold flex items-center gap-2">
              📊 Finansal Özet
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={dashboardMonth}
                onChange={(e) => setDashboardMonth(Number(e.target.value))}
                className="flex-1 sm:w-32 p-2.5 bg-gray-50 text-sm font-semibold text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition cursor-pointer"
              >
                <option value={1}>Ocak</option>
                <option value={2}>Şubat</option>
                <option value={3}>Mart</option>
                <option value={4}>Nisan</option>
                <option value={5}>Mayıs</option>
                <option value={6}>Haziran</option>
                <option value={7}>Temmuz</option>
                <option value={8}>Ağustos</option>
                <option value={9}>Eylül</option>
                <option value={10}>Ekim</option>
                <option value={11}>Kasım</option>
                <option value={12}>Aralık</option>
              </select>

              <select
                value={dashboardYear}
                onChange={(e) => setDashboardYear(Number(e.target.value))}
                className="flex-1 sm:w-28 p-2.5 bg-gray-50 text-sm font-semibold text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition cursor-pointer"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {/* DASHBOARD GRAFİKLERİ */}
          {dashboard && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">💸</div>
                  <h3 className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Bu Ayki Toplam Harcama</h3>
                  <p className="text-3xl font-black relative z-10">{dashboard.totalMonthlyExpense?.toLocaleString('tr-TR')} <span className="text-lg">₺</span></p>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Zirve Kategori</h3>
                  <p className="text-xl font-bold text-gray-800 truncate">{dashboard.categoryDistribution?.length > 0 ? dashboard.categoryDistribution[0].label : '-'}</p>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Sık Gidilen İşyeri</h3>
                  <p className="text-xl font-bold text-gray-800 truncate">{dashboard.merchantDistribution?.length > 0 ? dashboard.merchantDistribution[0].label : '-'}</p>
                </div>
              </div>

              <div className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
                <h3 className="text-gray-800 font-bold mb-6">Günlük Harcama Trendi</h3>
                <div className="h-[240px] w-full">
                  {dashboard.dailyTrend?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboard.dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" tickFormatter={formatChartDate} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dx={-10} />
                        <Tooltip labelFormatter={formatChartDate} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="amount" name="Tutar (₺)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col">
                  <h3 className="text-gray-800 font-bold mb-4">Kategori Dağılımı</h3>
                  <div className="flex-1 h-[240px]">
                    {dashboard.categoryDistribution?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dashboard.categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="label" stroke="none">
                            {dashboard.categoryDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} ₺`, name]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {dashboard.categoryDistribution?.slice(0, 5).map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>{entry.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
                  <h3 className="text-gray-800 font-bold mb-4">Sık Kullanılan İşyerleri</h3>
                  <div className="h-[240px]">
                    {dashboard.merchantDistribution?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.merchantDistribution.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} width={80} />
                          <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="value" name="Tutar (₺)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ALT GRİD: FİLTRE VE MANUEL EKLEME */}
      <div className="grid grid-cols-1 gap-8 mt-4">
        
        {/* GELİŞMİŞ FİLTRELİ SORGULAMA */}
        <div className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
          <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">🔍 Gelişmiş Harcama Arama</h3>
          <form onSubmit={handleFilterSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Başlangıç</label><input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" /></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Bitiş</label><input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" /></div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori</label>
              <CategorySelect
                options={groupedCategories}
                value={filterCategoryId}
                onChange={setFilterCategoryId}
                placeholder="Tümü"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">İşyeri</label>
              <SearchableSelect
                options={getFilteredMerchants(filterCategoryId)}
                value={filterMerchantId}
                onChange={setFilterMerchantId}
                placeholder="Tümü"
                emptyLabel="Tümü (Seçimi Temizle)"
              />
            </div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Ülke</label><select value={filterCountryId} onChange={(e) => setFilterCountryId(e.target.value)} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition"><option value="">Tümü</option>{countries.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
            <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Döviz</label><select value={filterCurrencyId} onChange={(e) => setFilterCurrencyId(e.target.value)} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition"><option value="">Tümü</option>{currencies.map(c => <option key={c.id} value={c.id}>{c.code} ({c.symbol})</option>)}</select></div>
            <div className="flex gap-2">
              <button type="submit" disabled={filterLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition shadow-sm disabled:opacity-50">{filterLoading ? 'Sorgulanıyor...' : 'Sorgula'}</button>
              {hasSearched && <button type="button" onClick={handleClearFilter} className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm py-3 rounded-xl transition" title="Temizle">✕</button>}
            </div>
          </form>

          {hasSearched && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
              <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Sorgu Sonuçları ({filteredTransactions.length} Eşleşme)</h4>
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
                {filteredTransactions.map((t) => {
                  const catObj = categories.find(c => c.name === t.categoryName);
                  const subtitleCategory = catObj?.parentCategory?.name || t.categoryName;
                  
                  return (
                    <div key={t.id} className="p-3 bg-gray-50 hover:bg-gray-100/70 rounded-xl flex items-center justify-between border border-gray-100/50 transition duration-200 group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm">{t.categoryIcon}</span>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm capitalize">
                            {(t.description || t.categoryName || "").toLocaleLowerCase('tr-TR')}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                            {formatDateTime(t.date)} • <span className="text-gray-500">{subtitleCategory}</span> {t.merchantName ? `• ${t.merchantName}` : ''} {t.countryName && t.countryName !== 'Türkiye' && t.countryName !== 'TÜRKİYE' ? `• ${t.countryName}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end w-[160px] gap-2">
                        <div className="font-bold text-gray-800 text-sm text-right flex-1">
                          {t.amount} {t.currencySymbol ? t.currencySymbol : '₺'}
                          {t.exchangeRate && t.exchangeRate !== 1 && <div className="text-[10px] text-gray-400 font-normal mt-0.5">Kur: {t.exchangeRate}</div>}
                        </div>
                        <div className="w-[60px] flex items-center justify-end gap-1">
                          <button onClick={() => handleOpenEditModal(t)} className="text-gray-400 hover:text-blue-600 bg-transparent hover:bg-blue-50 p-1.5 rounded-lg transition" title="Düzenle">✏️</button>
                          <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-400 hover:text-red-600 bg-transparent hover:bg-red-50 p-1.5 rounded-lg transition" title="Sil">🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredTransactions.length === 0 && <p className="text-gray-400 text-sm text-center py-6">Eşleşme bulunamadı.</p>}
              </div>
            </div>
          )}
        </div>

        {/* MANUEL HARCAMA EKLEME FORMU */}
        <div className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 mb-8">
          <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">✍️ Detaylı Harcama Ekle</h3>
          <form onSubmit={handleManualAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Tutar *</label>
              <input type="number" step="0.01" required value={manualForm.amount} onChange={e => setManualForm({ ...manualForm, amount: e.target.value })} placeholder="Örn: 1500" className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori *</label>
              <CategorySelect
                options={groupedCategories}
                value={manualForm.categoryId}
                onChange={(val) => setManualForm({ ...manualForm, categoryId: val })}
                placeholder="Seçiniz..."
                disableParents={true}
              />
            </div>

            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Açıklama</label>
              <input type="text" value={manualForm.description} onChange={e => setManualForm({ ...manualForm, description: e.target.value })} placeholder="Örn: Prag akşam yemeği..." className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">İşyeri</label>
              <SearchableSelect
                options={manualForm.categoryId
                  ? merchants.filter(m => m.defaultCategory?.id === manualForm.categoryId)
                  : merchants}
                value={manualForm.merchantId}
                onChange={(val) => setManualForm({ ...manualForm, merchantId: val })}
                placeholder="İsteğe Bağlı"
                emptyLabel="Boş Bırak"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Tarih</label>
              <input type="datetime-local" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Ülke & Döviz (Boş: TR/TRY)</label>
              <div className="flex gap-2">
                <select value={manualForm.countryId} onChange={e => setManualForm({ ...manualForm, countryId: e.target.value })} className="w-1/2 p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition">
                  <option value="">Ülke</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
                <select value={manualForm.currencyId} onChange={e => setManualForm({ ...manualForm, currencyId: e.target.value })} className="w-1/2 p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition">
                  <option value="">Döviz</option>
                  {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Kur (Exchange Rate)</label>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={manualForm.exchangeRate} onChange={e => setManualForm({ ...manualForm, exchangeRate: e.target.value })} placeholder="Örn: 35.5" className="w-2/3 p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" />
                <button type="submit" disabled={manualLoading} className="w-1/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-sm disabled:opacity-50">
                  {manualLoading ? '...' : 'Ekle'}
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}