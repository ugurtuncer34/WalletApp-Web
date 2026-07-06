import { useState, useEffect } from 'react';
import CategorySelect from './CategorySelect';
import SearchableSelect from './Combobox';

const FREQUENCY_MAP = {
    1: 'Günlük',
    2: 'Haftalık',
    3: 'Aylık',
    4: 'Yıllık'
};

export default function RecurringWidget({ masterData }) {
    const { groupedCategories, merchants, categories } = masterData; 
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        categoryId: '',
        merchantId: '',
        frequency: 3,
        startDate: new Date().toISOString().split('T')[0],
        isInstallment: false,
        totalInstallments: ''
    });

    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('wallet_token');

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch(`${API_BASE}/RecurringTransactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSubscriptions(data);
            }
        } catch (error) {
            console.error("Abonelikler çekilemedi:", error);
        }
    };

    useEffect(() => {
        if (token) fetchSubscriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const resetFormAndCloseModal = () => {
        setFormData({
            name: '', description: '', amount: '', categoryId: '', merchantId: '',
            frequency: 3, startDate: new Date().toISOString().split('T')[0],
            isInstallment: false, totalInstallments: ''
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEditClick = (sub) => {
        // İsimlerden yola çıkarak masterData içerisindeki ID'leri buluyoruz
        const cat = categories?.find(c => c.name === sub.categoryName);
        const mer = merchants?.find(m => m.name === sub.merchantName);

        setFormData({
            name: sub.name,
            description: sub.description || '',
            amount: sub.amount,
            categoryId: cat ? cat.id : (sub.categoryId || ''),
            merchantId: mer ? mer.id : (sub.merchantId || ''),
            frequency: sub.frequency,
            startDate: new Date(sub.nextExecutionDate).toISOString().split('T')[0],
            isInstallment: sub.isInstallment,
            totalInstallments: sub.totalInstallments || ''
        });
        setEditingId(sub.id);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryId) {
            alert("Lütfen bir kategori seçin.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                description: formData.description || null,
                frequency: parseInt(formData.frequency),
                merchantId: formData.merchantId || null,
                totalInstallments: formData.isInstallment ? parseInt(formData.totalInstallments) : null,
                nextExecutionDate: formData.startDate 
            };

            const url = editingId 
                ? `${API_BASE}/RecurringTransactions/${editingId}` 
                : `${API_BASE}/RecurringTransactions`;
                
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                resetFormAndCloseModal();
                fetchSubscriptions();
            } else {
                alert(editingId ? "Güncellenirken bir hata oluştu." : "Eklenirken bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id, name) => {
        if (!window.confirm(`'${name}' işlemini iptal etmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`${API_BASE}/RecurringTransactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchSubscriptions();
        } catch (error) {
            console.error(error);
        }
    };

    const formatNextDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="w-full mt-2 mb-4 lg:mb-0 bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    ⏳ Yaklaşan Ödemeler
                    <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full">
                        {subscriptions.length} Aktif
                    </span>
                </h3>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-2 pt-3 px-1 scrollbar-hide snap-x">
                {subscriptions.map(sub => (
                    <div key={sub.id} className="snap-start flex-shrink-0 w-[220px] bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm relative group transition-transform hover:-translate-y-1.5 flex flex-col">
                        
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {formatNextDate(sub.nextExecutionDate)}
                            </div>
                            <div className="text-[9px] font-bold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded">
                                {FREQUENCY_MAP[sub.frequency]}
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-800 dark:text-white text-sm truncate pr-2" title={sub.name}>{sub.name}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mb-3 pr-2">{sub.merchantName || sub.categoryName}</p>

                        <div className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-2">
                            {sub.amount} ₺
                        </div>

                        {sub.isInstallment && sub.totalInstallments > 0 && (
                            <div className="mt-auto mb-6">
                                <div className="flex justify-between text-[9px] font-bold text-gray-500 mb-1">
                                    <span>Taksit</span>
                                    <span>{sub.processedInstallments} / {sub.totalInstallments}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full"
                                        style={{ width: `${(sub.processedInstallments / sub.totalInstallments) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEditClick(sub); }}
                                className="w-6 h-6 bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full flex items-center justify-center transition-colors text-[10px]"
                                title="Düzenle"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCancel(sub.id, sub.name); }}
                                className="w-6 h-6 bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full flex items-center justify-center transition-colors text-xs"
                                title="İptal Et"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => { setIsModalOpen(true); setEditingId(null); }}
                    className="snap-start flex-shrink-0 w-[220px] min-h-[140px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-4 text-gray-400 hover:text-blue-500 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-900/50 transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 flex items-center justify-center text-xl transition-colors">
                        +
                    </div>
                    <span className="text-xs font-bold">Yeni Ödeme Ekle</span>
                </button>
            </div>

            {/* EKLEME / GÜNCELLEME MODALI */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-visible shadow-2xl p-6 border border-gray-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingId ? 'Abonelik / Taksit Düzenle' : 'Düzenli Ödeme Ekle'}
                            </h3>
                            <button onClick={resetFormAndCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Başlık (Örn: Netflix, Kira)</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-gray-200 transition" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Açıklama (Opsiyonel)</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detaylı bilgi ekleyebilirsiniz..." className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-gray-200 transition" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative z-40">
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Kategori *</label>
                                    <CategorySelect
                                        options={groupedCategories || []}
                                        value={formData.categoryId}
                                        onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                        placeholder="Seçiniz..."
                                        disableParents={true}
                                    />
                                </div>
                                <div className="relative z-30">
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">İşyeri (Opsiyonel)</label>
                                    <SearchableSelect
                                        options={formData.categoryId && merchants ? merchants.filter(m => m.defaultCategory?.id === formData.categoryId) : (merchants || [])}
                                        value={formData.merchantId}
                                        onChange={(val) => setFormData({ ...formData, merchantId: val })}
                                        placeholder="İsteğe Bağlı"
                                        emptyLabel="Boş Bırak"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Tutar (₺) *</label>
                                    <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-gray-200 transition" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Sıklık *</label>
                                    <select required value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-gray-200 transition">
                                        <option value={1}>Günlük</option>
                                        <option value={2}>Haftalık</option>
                                        <option value={3}>Aylık</option>
                                        <option value={4}>Yıllık</option>
                                    </select>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">İlk Ödeme / Çekim Tarihi *</label>
                                <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-gray-200 transition" />
                            </div>

                            <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                <input type="checkbox" id="isInstallment" checked={formData.isInstallment} onChange={e => setFormData({ ...formData, isInstallment: e.target.checked })} className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
                                <label htmlFor="isInstallment" className="text-sm font-bold text-blue-900 dark:text-blue-300 cursor-pointer">Bu bir taksitli işlem mi?</label>
                            </div>

                            {formData.isInstallment && (
                                <div className="animate-fadeIn">
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Toplam Taksit Sayısı *</label>
                                    <input type="number" required min="2" value={formData.totalInstallments} onChange={e => setFormData({ ...formData, totalInstallments: e.target.value })} placeholder="Örn: 6" className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-gray-200 transition" />
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md disabled:opacity-50">
                                {loading ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Abonelik / Taksit Ekle')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}