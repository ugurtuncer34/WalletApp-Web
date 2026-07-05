import { useState, useEffect } from 'react';
import { useCrypto } from '../hooks/useCrypto';

export default function CryptoWidget() {
    const { portfolio, loading, actionLoading, fetchPortfolio, addOrUpdateCrypto, deleteCrypto } = useCrypto();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({ coinCode: '', amount: '' });
    const [isEditing, setIsEditing] = useState(false); // Sadece var olanı mı güncelliyoruz?

    useEffect(() => {
        fetchPortfolio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetFormAndCloseModal = () => {
        setFormData({ coinCode: '', amount: '' });
        setIsEditing(false);
        setIsModalOpen(false);
    };

    const handleEditClick = (holding) => {
        setFormData({ coinCode: holding.coinCode, amount: holding.amount });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.coinCode || !formData.amount) return;

        const res = await addOrUpdateCrypto(formData.coinCode.trim().toUpperCase(), formData.amount);
        if (res.success) {
            resetFormAndCloseModal();
        } else {
            alert(res.message);
        }
    };

    const handleDelete = async (id, coinCode) => {
        await deleteCrypto(id);
    };

    // USD formatlayıcı
    const formatUsd = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="w-full mt-4 bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 transition-colors">
            {/* BAŞLIK VE TOPLAM DEĞER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 px-1 gap-2">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    🪙 Kripto Varlıklarım
                    {loading && <span className="text-[10px] text-blue-500 animate-pulse">Güncelleniyor...</span>}
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800/50 flex flex-col items-end">
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">Toplam Portföy</span>
                    <span className="text-sm font-black tracking-tight">{formatUsd(portfolio?.totalPortfolioValueUsd || 0)}</span>
                </div>
            </div>

            {/* YATAY KART LİSTESİ */}
            <div className="flex overflow-x-auto gap-4 pb-2 pt-3 px-1 scrollbar-hide snap-x">
                {portfolio?.holdings?.map(h => (
                    <div key={h.id} className="snap-start flex-shrink-0 w-[220px] bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm relative group transition-transform hover:-translate-y-1.5 flex flex-col">

                        <div className="flex justify-between items-start mb-2">
                            <div className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-wider">
                                {h.coinCode}
                            </div>
                            <div className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
                                {formatUsd(h.currentPrice)}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Miktar: <span className="font-semibold text-gray-700 dark:text-gray-300">{h.amount}</span></p>

                        <div className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-2">
                            {formatUsd(h.totalValue)}
                        </div>

                        {/* HOVER BUTONLARI */}
                        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEditClick(h); }}
                                className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full flex items-center justify-center transition-colors text-xs"
                                title="Miktarı Güncelle"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(h.id, h.coinCode); }}
                                className="w-7 h-7 bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full flex items-center justify-center transition-colors text-xs font-bold"
                                title="Portföyden Sil"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}

                {/* YENİ EKLE BUTONU */}
                <button
                    onClick={() => { resetFormAndCloseModal(); setIsModalOpen(true); }}
                    className="snap-start flex-shrink-0 w-[220px] min-h-[140px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-gray-400 hover:text-blue-500 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-900/50 transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 flex items-center justify-center text-xl transition-colors">
                        +
                    </div>
                    <span className="text-xs font-bold">Coin Ekle</span>
                </button>
            </div>

            {/* EKLEME / GÜNCELLEME MODALI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-gray-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEditing ? `${formData.coinCode} Güncelle` : 'Yeni Coin Ekle'}
                            </h3>
                            <button onClick={resetFormAndCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Coin Kodu (Örn: BTC, ETH)</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isEditing} // Düzenlerken kod değiştirilemez
                                    value={formData.coinCode}
                                    onChange={e => setFormData({ ...formData, coinCode: e.target.value.toUpperCase() })}
                                    placeholder="BTC"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-gray-200 transition disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Elindeki Miktar (Küsüratlı Olabilir)</label>
                                <input
                                    type="number"
                                    step="0.00000001" // Kriptoda küsüratlar derin olur
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Örn: 0.05"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-gray-200 transition"
                                />
                            </div>

                            <button type="submit" disabled={actionLoading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md disabled:opacity-50">
                                {actionLoading ? 'İşleniyor...' : 'Kaydet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}