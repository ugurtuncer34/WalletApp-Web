import CategorySelect from './CategorySelect';
import SearchableSelect from './Combobox';
import { formatDateTime } from '../utils/dateHelpers';

export default function AdvancedFilter({ filters, masterData, categories, onEdit, onDelete }) {
    const { groupedCategories, getFilteredMerchants, countries, currencies } = masterData;
    const {
        filterCategoryId, setFilterCategoryId, filterMerchantId, setFilterMerchantId,
        filterCountryId, setFilterCountryId, filterCurrencyId, setFilterCurrencyId,
        filterStartDate, setFilterStartDate, filterEndDate, setFilterEndDate,
        filteredTransactions, hasSearched, filterLoading, handleFilterSearch, handleClearFilter
    } = filters;

    return (
        <div className="bg-white p-4 md:p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
            <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">🔍 Gelişmiş Harcama Arama</h3>
            <form onSubmit={handleFilterSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Başlangıç</label><input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" /></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Bitiş</label><input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition" /></div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori</label>
                    <CategorySelect options={groupedCategories} value={filterCategoryId} onChange={setFilterCategoryId} placeholder="Tümü" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">İşyeri</label>
                    <SearchableSelect options={getFilteredMerchants(filterCategoryId)} value={filterMerchantId} onChange={setFilterMerchantId} placeholder="Tümü" emptyLabel="Tümü (Seçimi Temizle)" />
                </div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Ülke</label><select value={filterCountryId} onChange={e => setFilterCountryId(e.target.value)} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition"><option value="">Tümü</option>{countries.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Döviz</label><select value={filterCurrencyId} onChange={e => setFilterCurrencyId(e.target.value)} className="p-2 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition"><option value="">Tümü</option>{currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}</select></div>
                <div className="flex gap-2">
                    <button type="submit" disabled={filterLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition shadow-sm disabled:opacity-50">{filterLoading ? 'Sorgulanıyor...' : 'Sorgula'}</button>
                    {hasSearched && <button type="button" onClick={handleClearFilter} className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm py-3 rounded-xl transition">✕</button>}
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
                                            <p className="font-semibold text-gray-800 text-sm capitalize">{(t.description || t.categoryName || "").toLocaleLowerCase('tr-TR')}</p>
                                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                                                {formatDateTime(t.date)} • <span className="text-gray-500">{subtitleCategory}</span> {t.merchantName ? `• ${t.merchantName}` : ''} {t.countryName && t.countryName !== 'Türkiye' ? `• ${t.countryName}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end w-[160px] gap-2">
                                        <div className="font-bold text-gray-800 text-sm text-right flex-1">
                                            {t.amount} {t.currencySymbol ? t.currencySymbol : '₺'}
                                            {t.exchangeRate && t.exchangeRate !== 1 && <div className="text-[10px] text-gray-400 font-normal mt-0.5">Kur: {t.exchangeRate}</div>}
                                        </div>
                                        <div className="w-[60px] flex items-center justify-end gap-1">
                                            <button onClick={() => onEdit(t)} className="text-gray-400 hover:text-blue-600 bg-transparent hover:bg-blue-50 p-1.5 rounded-lg transition">✏️</button>
                                            <button onClick={() => onDelete(t.id)} className="text-gray-400 hover:text-red-600 bg-transparent hover:bg-red-50 p-1.5 rounded-lg transition">🗑️</button>
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
    );
}