import { useState, useEffect } from 'react';
import CategorySelect from './CategorySelect';
import SearchableSelect from './Combobox';

// HIZLI EKLEME MODALI
export function QuickAddModal({ isOpen, onClose, chipName, onSubmit, loading }) {
    const [chipAmount, setChipAmount] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (chipAmount) {
            onSubmit(`${chipAmount} ${chipName}`);
            setChipAmount("");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn transition-colors">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100 border border-transparent dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{chipName} Ekle</h3>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">Tutar (₺)</label>
                        <input type="number" autoFocus value={chipAmount} onChange={(e) => setChipAmount(e.target.value)} placeholder="Örn: 150" disabled={loading} className="w-full text-2xl p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-transparent dark:border-gray-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition" />
                    </div>
                    <button type="submit" disabled={loading || !chipAmount} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-md disabled:opacity-50">
                        {loading ? 'Ekleniyor...' : 'Kaydet'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// DÜZENLEME MODALI
export function EditModal({ isOpen, onClose, initialData, masterData, onSubmit, loading }) {
    const { groupedCategories, getFilteredMerchants, countries, currencies } = masterData;
    const [editForm, setEditForm] = useState(initialData);

    // Modal açıldığında form datasını güncelle
    useEffect(() => { setEditForm(initialData); }, [initialData]);

    if (!isOpen || !editForm) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        await onSubmit(editForm.id, payload);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn transition-colors">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto border border-transparent dark:border-gray-700">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">✏️ Harcamayı Düzenle</h3>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tutar *</label><input type="number" step="0.01" required value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} className="p-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Kategori *</label><CategorySelect options={groupedCategories} value={editForm.categoryId} onChange={(val) => setEditForm({ ...editForm, categoryId: val })} placeholder="Seçiniz..." /></div>
                    <div className="flex flex-col gap-1 md:col-span-2"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Açıklama</label><input type="text" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="p-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">İşyeri</label><SearchableSelect options={getFilteredMerchants(editForm.categoryId)} value={editForm.merchantId} onChange={(val) => setEditForm({ ...editForm, merchantId: val })} placeholder="İsteğe Bağlı" emptyLabel="Boş Bırak (Temizle)" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Tarih</label><input type="datetime-local" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} className="p-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ülke</label><select value={editForm.countryId} onChange={e => setEditForm({ ...editForm, countryId: e.target.value })} className="p-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition"><option value="">TR</option>{countries.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Döviz</label><div className="flex gap-2"><select value={editForm.currencyId} onChange={e => setEditForm({ ...editForm, currencyId: e.target.value })} className="w-1/2 p-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition"><option value="">TRY</option>{currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}</select><input type="number" step="0.01" value={editForm.exchangeRate} onChange={e => setEditForm({ ...editForm, exchangeRate: e.target.value })} placeholder="Kur" className="w-1/2 p-3 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition" /></div></div>
                    <button type="submit" disabled={loading} className="md:col-span-2 w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-md disabled:opacity-50">{loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</button>
                </form>
            </div>
        </div>
    );
}