/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

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

  // Filtreli Arama Bölümü İçin State'ler
  const [categories, setCategories] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterMerchantId, setFilterMerchantId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // === YENİ: MODAL STATE'LERİ ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState("");
  const [chipAmount, setChipAmount] = useState("");

  const token = localStorage.getItem('wallet_token');
  const API_BASE = 'http://localhost:5139/api';

  // === DATA FETCHING ===
  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setDashboard(await res.json());
    } catch (err) {
      console.error("Dashboard çekilemedi:", err);
    }
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
    } catch (err) {
      console.error("Harcamalar çekilemedi:", err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/master-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setMerchants(data.merchants || []);
      }
    } catch (err) {
      console.error("Filtre seçenekleri yüklenemedi:", err);
    }
  };

  const handleFilterSearch = async (e) => {
    e.preventDefault();
    setFilterLoading(true);
    try {
      let url = `${API_BASE}/transactions?PageNumber=1&PageSize=50`;
      if (filterCategoryId) url += `&CategoryId=${filterCategoryId}`;
      if (filterMerchantId) url += `&MerchantId=${filterMerchantId}`;
      if (filterStartDate) url += `&StartDate=${filterStartDate}`;
      if (filterEndDate) url += `&EndDate=${filterEndDate}`;

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setFilteredTransactions(data.items || []);
        setHasSearched(true);
      }
    } catch (err) {
      console.error("Filtreleme hatası:", err);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleClearFilter = () => {
    setFilterCategoryId("");
    setFilterMerchantId("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilteredTransactions([]);
    setHasSearched(false);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboard();
    fetchTransactions(1);
    fetchFilterOptions();
  }, [token, navigate]);

  // === QUICK ADD (Ana Input veya Modal'dan Tetiklenir) ===
  const handleQuickAdd = async (textToSubmit) => {
    if (!textToSubmit) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/transactions/quick-add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ text: textToSubmit })
      });

      if (res.ok) {
        setInputText(""); 
        setChipAmount(""); // Modal inputunu temizle
        setIsModalOpen(false); // Modalı kapat
        fetchDashboard();
        fetchTransactions(1); 
        if (hasSearched) handleFilterSearch({ preventDefault: () => {} }); 
      } else {
        const errData = await res.json();
        alert("Hata: " + (errData.message || "Bilinmeyen hata"));
      }
    } catch (err) {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // Ana Input Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleQuickAdd(inputText);
  };

  // Çipe Tıklandığında Modalı Aç
  const handleChipClick = (chipWord) => {
    setSelectedChip(chipWord);
    setChipAmount(""); // Önceki değeri temizle
    setIsModalOpen(true);
  };

  // Modal İçindeki Form Gönderildiğinde (Enter veya Buton)
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!chipAmount) return;
    // Rakam ve kelimeyi birleştir (Örn: "150 kahve") ve Quick Add'e gönder
    handleQuickAdd(`${chipAmount} ${selectedChip}`);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const formatChartDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-sans flex flex-col gap-8">
      
      {/* ========================================================= */}
      {/* YENİ: QUICK CHIP MODAL (Overlay & Dialog)                   */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 capitalize">{selectedChip} Ekle</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-500 uppercase mb-2 block">Tutar (₺)</label>
                <input
                  type="number"
                  autoFocus // Modal açılır açılmaz imleci buraya odaklar
                  value={chipAmount}
                  onChange={(e) => setChipAmount(e.target.value)}
                  placeholder="Örn: 150"
                  disabled={loading}
                  className="w-full text-2xl p-4 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !chipAmount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Ekleniyor...' : 'Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ÜST GRİD: OPERASYON VE GRAFİKLER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SOL KOLON: OPERASYON MERKEZİ */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AKILLI GİRİŞ BÖLÜMÜ */}
          <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
            <h2 className="text-gray-800 font-bold mb-4">Akıllı Giriş</h2>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Örn: 150 file market..."
              disabled={loading}
              className="w-full text-lg p-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
            />
          </div>

          {/* HIZLI ÇİPLER (AYRI BİR SEGMENT) */}
          <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
            <h2 className="text-gray-800 font-bold mb-3 text-sm">Hızlı İşlem (Tek Tık)</h2>
            <div className="flex flex-wrap gap-2">
              {["Kahve", "File", "Fırın", "Şok", "Opet", "Eczane"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip.toLowerCase())}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl font-semibold text-sm hover:from-blue-100 hover:to-blue-200 border border-blue-200/50 shadow-sm transition active:scale-95"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col h-[650px]">
            <h2 className="text-gray-800 font-bold mb-4 flex justify-between items-center">
              <span>Son İşlemler (Canlı Akış)</span>
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{transactions.length}</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {transactions.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 border border-transparent hover:border-gray-100 transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl shadow-sm">
                      {t.categoryIcon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">{formatDateTime(t.date)}</span>
                      <p className="font-semibold text-gray-800 text-sm capitalize">{t.description}</p>
                      <p className="text-xs text-gray-500">{t.categoryName} {t.merchantName ? `• ${t.merchantName}` : ''}</p>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                    {t.amount} ₺
                  </div>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Henüz harcama yok.</p>}
              
              {hasMore && transactions.length > 0 && (
                <button 
                  onClick={() => fetchTransactions(page + 1)}
                  className="w-full mt-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl transition"
                >
                  Daha Fazla Yükle ↓
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: RAPORLAR VE GRAFİKLER */}
        {dashboard && (
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">💸</div>
                <h3 className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Bu Ayki Toplam Harcama</h3>
                <p className="text-4xl font-black relative z-10">{dashboard.totalMonthlyExpense?.toLocaleString('tr-TR')} <span className="text-xl">₺</span></p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Zirve Kategori</h3>
                <p className="text-2xl font-bold text-gray-800 truncate">
                  {dashboard.categoryDistribution?.length > 0 ? dashboard.categoryDistribution[0].label : '-'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Sık Gidilen İşyeri</h3>
                <p className="text-2xl font-bold text-gray-800 truncate">
                  {dashboard.merchantDistribution?.length > 0 ? dashboard.merchantDistribution[0].label : '-'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <h3 className="text-gray-800 font-bold mb-6">Günlük Harcama Trendi</h3>
              <div className="h-[250px] w-full">
                {dashboard.dailyTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboard.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" tickFormatter={formatChartDate} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dx={-10} />
                      <Tooltip labelFormatter={formatChartDate} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="amount" name="Tutar (₺)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col">
                <h3 className="text-gray-800 font-bold mb-4">Kategori Dağılımı</h3>
                <div className="flex-1 h-[250px]">
                  {dashboard.categoryDistribution?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dashboard.categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="label" stroke="none">
                          {dashboard.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} ₺`, name]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
                  )}
                </div>
                {/* Pasta Altı Lejant */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {dashboard.categoryDistribution?.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      {entry.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
                <h3 className="text-gray-800 font-bold mb-4">Sık Kullanılan İşyerleri</h3>
                <div className="h-[250px]">
                  {dashboard.merchantDistribution?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboard.merchantDistribution.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6b7280'}} width={80} />
                        <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" name="Tutar (₺)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 4. BÖLÜM: EN ALT KISIM - GELİŞMİŞ FİLTRELİ SORGULAMA */}
      <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
        <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
          🔍 Gelişmiş Harcama Arama
        </h3>
        
        <form onSubmit={handleFilterSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Başlangıç</label>
            <input 
              type="date" 
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="p-2.5 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Bitiş</label>
            <input 
              type="date" 
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="p-2.5 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Kategori</label>
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="p-2.5 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition"
            >
              <option value="">Tümü</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">İşyeri</label>
            <select
              value={filterMerchantId}
              onChange={(e) => setFilterMerchantId(e.target.value)}
              className="p-2.5 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition"
            >
              <option value="">Tümü</option>
              {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={filterLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {filterLoading ? 'Sorgulanıyor...' : 'Sorgula'}
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm py-3 rounded-xl transition"
                title="Filtreleri Temizle"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {hasSearched && (
          <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
            <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
              Sorgu Sonuçları ({filteredTransactions.length} Eşleşme)
            </h4>
            
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
              {filteredTransactions.map((t) => (
                <div key={t.id} className="p-3 bg-gray-50 hover:bg-gray-100/70 rounded-xl flex items-center justify-between border border-gray-100/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm">{t.categoryIcon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm capitalize">{t.description}</p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {formatDateTime(t.date)} • <span className="text-gray-500">{t.categoryName}</span> {t.merchantName ? `• ${t.merchantName}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-gray-800 text-sm">
                    {t.amount} ₺
                  </div>
                </div>
              ))}
              
              {filteredTransactions.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-6">Aranan kriterlere uygun harcama bulunamadı.</p>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}