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
    onOpenSearch,
    onOpenForm
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

    return (
        <div className="flex flex-col gap-4 lg:gap-6">

            {/* ==========================================
                1. KOMPAKT FİLTRE, TOPLAM HARCAMA VE ALT ALTA BUTONLAR
                ========================================== */}
            <div className="flex flex-col xl:flex-row justify-between items-center bg-blue-50 dark:bg-blue-700 rounded-2xl lg:rounded-3xl p-4 lg:p-5 shadow-[0_2px_10px_-3px_rgba(37,99,235,0.1)] border border-blue-100 dark:border-blue-600 text-blue-900 dark:text-white gap-4 transition-colors">

                {/* SOL TARAF: Filtreler */}
                <div className="flex gap-2 w-full xl:w-auto">
                    <select
                        value={dashboardMonth}
                        onChange={(e) => setDashboardMonth(Number(e.target.value))}
                        className="flex-1 xl:w-32 p-2 bg-white dark:bg-blue-800 border border-blue-200 dark:border-blue-500 text-blue-900 dark:text-blue-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                    >
                        <option value={1}>Ocak</option><option value={2}>Şubat</option><option value={3}>Mart</option>
                        <option value={4}>Nisan</option><option value={5}>Mayıs</option><option value={6}>Haziran</option>
                        <option value={7}>Temmuz</option><option value={8}>Ağustos</option><option value={9}>Eylül</option>
                        <option value={10}>Ekim</option><option value={11}>Kasım</option><option value={12}>Aralık</option>
                    </select>

                    <select
                        value={dashboardYear}
                        onChange={(e) => setDashboardYear(Number(e.target.value))}
                        className="flex-1 xl:w-28 p-2 bg-white dark:bg-blue-800 border border-blue-200 dark:border-blue-500 text-blue-900 dark:text-blue-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm"
                    >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                    </select>
                </div>

                {/* SAĞ TARAF: Harcama Tutarı + Ayrıcı Çizgi + Alt Alta Butonlar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 xl:gap-6 w-full xl:w-auto mt-2 xl:mt-0 justify-center xl:justify-end">

                    {/* Toplam Harcama */}
                    <div className="text-center sm:text-right w-full sm:w-auto">
                        <p className="text-blue-600/70 dark:text-blue-200/80 text-[10px] xl:text-xs font-bold uppercase tracking-wider mb-1">Bu Ayki Toplam Harcama</p>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight flex items-baseline justify-center sm:justify-end gap-1">
                            {dashboard?.totalMonthlyExpense?.toLocaleString('tr-TR')}
                            <span className="text-lg opacity-60 font-medium">₺</span>
                        </h2>
                    </div>

                    {/* Dikey Ayırıcı Çizgi (Tutar ve Butonları Ayırır - Sadece Masaüstü) */}
                    {onOpenSearch && onOpenForm && (
                        <div className="hidden lg:block w-px h-16 bg-blue-200 dark:bg-blue-500/50"></div>
                    )}

                    {/* MASAÜSTÜ AKSİYON BUTONLARI (flex-col ile Alt Alta ve ESKİ STİLLERİYLE) */}
                    {onOpenSearch && onOpenForm && (
                        <div className="hidden lg:flex flex-col gap-2 w-full sm:w-[170px]">
                            <button
                                onClick={onOpenSearch}
                                className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-800 rounded-xl shadow-sm border border-blue-200 dark:border-blue-600 text-xs font-bold text-blue-700 dark:text-blue-50 hover:bg-blue-100 dark:hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                🔍 Gelişmiş Arama
                            </button>
                            <button
                                onClick={onOpenForm}
                                className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-50 border border-blue-200 dark:border-blue-600 rounded-xl shadow-sm text-xs font-bold transition flex items-center justify-center gap-2"
                            >
                                ✍️ Manuel Ekle
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ==========================================
                2. GRAFİKLER 
                ========================================== */}
            {dashboard && (
                <>
                    {/* GÜNLÜK TREND (Tek sıra geniş) */}
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

                    {/* KATEGORİ DAĞILIMI VE İŞYERLERİ (Yan yana veya alt alta) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">

                        {/* KATEGORİ DAĞILIMI (PIE - DRILL DOWN) */}
                        <div className="bg-white dark:bg-slate-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-slate-700 flex flex-col transition-colors relative">

                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-blue-900 dark:text-gray-100 font-bold text-sm lg:text-base">
                                    {selectedParent ? `${selectedParent} Detayı` : 'Kategori Dağılımı'}
                                </h3>

                                {/* Eğer alt kategoriye girilmişse "Geri" butonu göster */}
                                {selectedParent && (
                                    <button
                                        onClick={() => setSelectedParent(null)}
                                        className="text-[10px] lg:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-700 px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 transition"
                                    >
                                        ← Geri Dön
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 h-[200px] lg:h-[300px]">
                                {/* Gösterilecek veriyi dinamik seçiyoruz: Ana kategoriler mi, yoksa seçilenin alt kategorileri mi? */}
                                {(() => {
                                    const currentData = selectedParent
                                        ? dashboard.categoryDistribution.find(c => c.label === selectedParent)?.subCategories || []
                                        : dashboard.categoryDistribution;

                                    if (!currentData || currentData.length === 0) {
                                        return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>;
                                    }

                                    return (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart key={selectedParent ?? 'root'}>
                                                <Pie
                                                    data={currentData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    nameKey="label"
                                                    stroke="none"
                                                    // Sadece ana ekrandayken (alt kategoriler varsa) tıklanabilir (cursor-pointer) yap
                                                    className={!selectedParent ? "cursor-pointer outline-none" : "outline-none"}
                                                    onClick={(data) => {
                                                        // Ana ekrandayız ve tıklanan dilimin alt kategorisi varsa içine gir
                                                        if (!selectedParent && data && data.payload && data.payload.subCategories && data.payload.subCategories.length > 0) {
                                                            setSelectedParent(data.payload.label);
                                                        }
                                                    }}
                                                    isAnimationActive={true}
                                                    animationBegin={0}
                                                    animationDuration={1000}
                                                    animationEasing="ease-out"
                                                >
                                                    {currentData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                            className="transition-all duration-300 hover:opacity-80 outline-none"
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => [`${value.toLocaleString('tr-TR')} ₺`, name]} contentStyle={tooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    );
                                })()}
                            </div>

                            {/* Lejant (Alt Bilgi) */}
                            <div className="flex flex-wrap justify-center gap-2 lg:gap-3 mt-2">
                                {(() => {
                                    const currentData = selectedParent
                                        ? dashboard.categoryDistribution.find(c => c.label === selectedParent)?.subCategories || []
                                        : dashboard.categoryDistribution;

                                    // Ekrana çok fazla sığmayacağı için ilk 6 tanesini gösteriyoruz
                                    return currentData.slice(0, 6).map((entry, index) => (
                                        <div key={index} className="flex items-center gap-1.5 text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 font-medium">
                                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            {entry.label}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* SIK KULLANILAN İŞYERLERİ (BAR) */}
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