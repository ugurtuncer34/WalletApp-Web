import { useState } from 'react';
import CategorySelect from './CategorySelect';
import SearchableSelect from './Combobox';

export default function TransactionForm({ masterData, onAdd, loading }) {
    const { groupedCategories, merchants, countries, currencies } = masterData;
    const [form, setForm] = useState({
        amount: "", date: "", description: "", categoryId: "", merchantId: "", countryId: "", currencyId: "", exchangeRate: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || !form.categoryId) {
            alert("Tutar ve Kategori zorunludur!");
            return;
        }

        const payload = {
            amount: parseFloat(form.amount),
            description: form.description || null,
            categoryId: form.categoryId,
            merchantId: form.merchantId || null,
            countryId: form.countryId || null,
            currencyId: form.currencyId || null,
            date: form.date ? new Date(form.date).toISOString() : null,
            exchangeRate: form.exchangeRate ? parseFloat(form.exchangeRate) : null
        };

        const result = await onAdd(payload);
        if (result.success) {
            setForm({ amount: "", date: "", description: "", categoryId: "", merchantId: "", countryId: "", currencyId: "", exchangeRate: "" });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 mb-8 transition-colors">
            <h3 className="text-blue-900 dark:text-gray-100 font-bold mb-4 flex items-center gap-2">✍️ Detaylı Harcama Ekle</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Tutar *</label>
                    <input type="number" step="0.01" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Örn: 1500" className="p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Kategori *</label>
                    <CategorySelect options={groupedCategories} value={form.categoryId} onChange={(val) => setForm({ ...form, categoryId: val })} placeholder="Seçiniz..." disableParents={true} />
                </div>

                <div className="flex flex-col gap-1 lg:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Açıklama</label>
                    <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Örn: Akşam yemeği..." className="p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">İşyeri</label>
                    <SearchableSelect options={form.categoryId ? merchants.filter(m => m.defaultCategory?.id === form.categoryId) : merchants} value={form.merchantId} onChange={(val) => setForm({ ...form, merchantId: val })} placeholder="İsteğe Bağlı" emptyLabel="Boş Bırak" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Tarih</label>
                    <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Ülke & Döviz</label>
                    <div className="flex gap-2">
                        <select value={form.countryId} onChange={e => setForm({ ...form, countryId: e.target.value })} className="w-1/2 p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition">
                            <option value="">TR</option>
                            {countries.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                        </select>
                        <select value={form.currencyId} onChange={e => setForm({ ...form, currencyId: e.target.value })} className="w-1/2 p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition">
                            <option value="">TRY</option>
                            {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Kur</label>
                    <div className="flex gap-2">
                        <input type="number" step="0.01" value={form.exchangeRate} onChange={e => setForm({ ...form, exchangeRate: e.target.value })} placeholder="Kur" className="w-2/3 p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition" />
                        <button type="submit" disabled={loading} className="w-1/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-sm disabled:opacity-50">
                            {loading ? '...' : 'Ekle'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}