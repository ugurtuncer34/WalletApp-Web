import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { formatChartDate } from '../utils/dateHelpers';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function DashboardView({
    dashboard,
    dashboardMonth,
    setDashboardMonth,
    dashboardYear,
    setDashboardYear
}) {
    return (
        <div className="flex flex-col gap-4">
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
                        <option value={1}>Ocak</option><option value={2}>Şubat</option><option value={3}>Mart</option>
                        <option value={4}>Nisan</option><option value={5}>Mayıs</option><option value={6}>Haziran</option>
                        <option value={7}>Temmuz</option><option value={8}>Ağustos</option><option value={9}>Eylül</option>
                        <option value={10}>Ekim</option><option value={11}>Kasım</option><option value={12}>Aralık</option>
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
    );
}