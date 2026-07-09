import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { formatChartDate } from '../utils/dateHelpers';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function DashboardView({
    dashboard,
    dashboardMonth,
    setDashboardMonth,
    dashboardYear,
    setDashboardYear,
    users,
    selectedUserId,
    onUserSelect,
    currencies,
    selectedCurrencyId,
    onCurrencySelect,
    onOpenSearch,
    onOpenForm,
    onOpenBulkModal
}) {
    const { isDarkMode } = useTheme();

    const [selectedParent, setSelectedParent] = useState(null);

    useEffect(() => {
        setSelectedParent(null);
    }, [dashboard]);

    const gridColor = isDarkMode ? '#374151' : '#f3f4f6';
    const textColor = isDarkMode ? '#9ca3af' : '#9ca3af';
    const tooltipStyle = {
        borderRadius: '12px',
        border: isDarkMode ? '1px solid #374151' : 'none',
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    };

    const isBulkImportEnabled = import.meta.env.VITE_ENABLE_BULK_IMPORT === 'true';

    return (
        <div className="flex flex-col gap-4 lg:gap-6">

            {/* ==========================================
                1. MAVİ ANA KART (KONTROL PANELİ)
                ========================================== */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-blue-50 dark:bg-blue-700 rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-[0_2px_10px_-3px_rgba(37,99,235,0.1)] border border-blue-100 dark:border-blue-600 text-blue-900 dark:text-white gap-4 transition-colors">

                {/* SOL TARAF: Filtreler (Tarih ve Kişi) */}
                <div className="flex flex-col gap-3 w-full xl:w-auto overflow-hidden">

                    {/* Üst Satır: Ay ve Yıl (Boyutlar daraltıldı ve sabitlendi) */}
                    <div className="flex gap-2">
                        <select
                            value={dashboardMonth}
                            onChange={(e) => setDashboardMonth(Number(e.target.value))}
                            className="w-32 p-2 bg-white dark:bg-blue-800 border border-blue-200 dark:border-blue-500 text-blue-900 dark:text-blue-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                        >
                            <option value={1}>Ocak</option><option value={2}>Şubat</option><option value={3}>Mart</option>
                            <option value={4}>Nisan</option><option value={5}>Mayıs</option><option value={6}>Haziran</option>
                            <option value={7}>Temmuz</option><option value={8}>Ağustos</option><option value={9}>Eylül</option>
                            <option value={10}>Ekim</option><option value={11}>Kasım</option><option value={12}>Aralık</option>
                        </select>
                        <select
                            value={dashboardYear}
                            onChange={(e) => setDashboardYear(Number(e.target.value))}
                            className="w-24 p-2 bg-white dark:bg-blue-800 border border-blue-200 dark:border-blue-500 text-blue-900 dark:text-blue-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                        >
                            <option value={2024}>2024</option><option value={2025}>2025</option><option value={2026}>2026</option><option value={2027}>2027</option>
                        </select>
                    </div>

                    {/* Alt Satır: Chipler */}
                    <div className="flex flex-col gap-2">

                        {/* Kişi Chipleri */}
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => onUserSelect("")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${!selectedUserId
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md dark:bg-blue-500 dark:border-blue-500'
                                    : 'bg-white/60 dark:bg-blue-800/50 text-blue-900 dark:text-blue-100 border-blue-200/50 dark:border-blue-600/50 hover:bg-white dark:hover:bg-blue-800'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                                Tüm Aile
                            </button>
                            {users?.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => onUserSelect(u.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap capitalize flex items-center gap-1.5 border ${selectedUserId === u.id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md dark:bg-blue-500 dark:border-blue-500'
                                        : 'bg-white/60 dark:bg-blue-800/50 text-blue-900 dark:text-blue-100 border-blue-200/50 dark:border-blue-600/50 hover:bg-white dark:hover:bg-blue-800'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                    {u.username}
                                </button>
                            ))}
                        </div>

                        {/* Kur Chipleri - ŞİMDİLİK GİZLENDİ / YORUMA ALINDI */}
                        {/* 
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mt-1">
                            <button
                                onClick={() => onCurrencySelect("")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                                    !selectedCurrencyId 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md dark:bg-blue-500 dark:border-blue-500' 
                                        : 'bg-white/60 dark:bg-blue-800/50 text-blue-900 dark:text-blue-100 border-blue-200/50 dark:border-blue-600/50 hover:bg-white dark:hover:bg-blue-800'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V5.942c0-.754-.726-1.294-1.453-1.096V4.846M3.75 22.5h15m-15-18.75h15m-15 15h15m-15-11.25h15m-15 7.5h15m-15-3.75h15M3.75 22.5A2.25 2.25 0 011.5 20.25v-15A2.25 2.25 0 013.75 3h15a2.25 2.25 0 012.25 2.25v15a2.25 2.25 0 01-2.25 2.25h-15z" /></svg>
                                Tüm Kurlar
                            </button>
                            {currencies?.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => onCurrencySelect(c.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                                        selectedCurrencyId === c.id 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md dark:bg-blue-500 dark:border-blue-500' 
                                            : 'bg-white/60 dark:bg-blue-800/50 text-blue-900 dark:text-blue-100 border-blue-200/50 dark:border-blue-600/50 hover:bg-white dark:hover:bg-blue-800'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {c.code}
                                </button>
                            ))}
                        </div> 
                        */}
                    </div>
                </div>

                {/* SAĞ TARAF: Toplam Harcama ve Aksiyon Butonları */}
                <div className="flex flex-col sm:flex-row items-center gap-4 xl:gap-6 w-full xl:w-auto mt-2 xl:mt-0 justify-center xl:justify-end">
                    <div className="text-center sm:text-right w-full sm:w-auto">
                        <p className="text-blue-600/70 dark:text-blue-200/80 text-[10px] xl:text-xs font-bold uppercase tracking-wider mb-1">
                            {selectedUserId || selectedCurrencyId ? 'Filtrelenmiş Toplam' : 'Bu Ayki Toplam Harcama'}
                        </p>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight flex items-baseline justify-center sm:justify-end gap-1">
                            {dashboard?.totalMonthlyExpense?.toLocaleString('tr-TR')}
                            <span className="text-lg opacity-60 font-medium">₺</span>
                        </h2>
                    </div>

                    {onOpenSearch && onOpenForm && (
                        <div className="hidden lg:block w-px h-16 bg-blue-200 dark:bg-blue-500/50"></div>
                    )}

                    {onOpenSearch && onOpenForm && (
                        <div className="hidden lg:flex flex-col gap-2 w-full sm:w-[170px]">
                            <button onClick={onOpenSearch} className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-800 rounded-xl shadow-sm border border-blue-200 dark:border-blue-600 text-xs font-bold text-blue-700 dark:text-blue-50 hover:bg-blue-100 dark:hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                🔍 Gelişmiş Arama
                            </button>
                            <button onClick={onOpenForm} className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-50 border border-blue-200 dark:border-blue-600 rounded-xl shadow-sm text-xs font-bold transition flex items-center justify-center gap-2">
                                ✍️ Manuel Ekle
                            </button>
                            {/* Koşullu render */}
                            {isBulkImportEnabled && (
                                <button
                                    onClick={onOpenBulkModal}
                                    className="flex-[3] px-2 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-xl shadow-sm text-xs font-bold transition flex items-center justify-center gap-2"
                                    title="Import Statement"
                                >
                                    📄 Import
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ==========================================
                2. GRAFİKLER 
                ========================================== */}
            {dashboard && (
                <>
                    <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-700 transition-colors">
                        <h3 className="text-blue-900 dark:text-gray-100 font-bold mb-4 text-sm lg:text-base">Günlük Harcama Trendi</h3>
                        <div className="h-[200px] lg:h-[280px] w-full">
                            {dashboard.dailyTrend?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboard.dailyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="date" tickFormatter={formatChartDate} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: textColor }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: textColor }} dx={-10} />
                                        <Tooltip labelFormatter={formatChartDate} contentStyle={tooltipStyle} />
                                        <Line type="monotone" dataKey="amount" name="Tutar (₺)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-700 flex flex-col transition-colors relative">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-blue-900 dark:text-gray-100 font-bold text-sm lg:text-base">
                                    {selectedParent ? `${selectedParent} Detayı` : 'Kategori Dağılımı'}
                                </h3>
                                {selectedParent && (
                                    <button onClick={() => setSelectedParent(null)} className="text-[10px] lg:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-700 px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 transition">
                                        ← Geri Dön
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 h-[200px] lg:h-[300px]">
                                {(() => {
                                    const currentData = selectedParent ? dashboard.categoryDistribution.find(c => c.label === selectedParent)?.subCategories || [] : dashboard.categoryDistribution;
                                    if (!currentData || currentData.length === 0) return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>;

                                    return (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart key={selectedParent ?? 'root'}>
                                                <Pie data={currentData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="label" stroke="none" className={!selectedParent ? "cursor-pointer outline-none" : "outline-none"} onClick={(data) => { if (!selectedParent && data?.payload?.subCategories?.length > 0) setSelectedParent(data.payload.label); }} isAnimationActive={true} animationBegin={0} animationDuration={1000} animationEasing="ease-out">
                                                    {currentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="transition-all duration-300 hover:opacity-80 outline-none" />)}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => [`${value.toLocaleString('tr-TR')} ₺`, name]} contentStyle={tooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    );
                                })()}
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 lg:gap-3 mt-2">
                                {(() => {
                                    const currentData = selectedParent ? dashboard.categoryDistribution.find(c => c.label === selectedParent)?.subCategories || [] : dashboard.categoryDistribution;
                                    return currentData.slice(0, 6).map((entry, index) => (
                                        <div key={index} className="flex items-center gap-1.5 text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 font-medium">
                                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>{entry.label}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-700 transition-colors">
                            <h3 className="text-blue-900 dark:text-gray-100 font-bold mb-2 text-sm lg:text-base">Sık Kullanılan İşyerleri</h3>
                            <div className="h-[200px] lg:h-[300px]">
                                {dashboard.merchantDistribution?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dashboard.merchantDistribution.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: textColor }} width={80} />
                                            <Tooltip cursor={{ fill: isDarkMode ? '#334155' : '#f8fafc' }} contentStyle={tooltipStyle} />
                                            <Bar dataKey="value" name="Tutar (₺)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}