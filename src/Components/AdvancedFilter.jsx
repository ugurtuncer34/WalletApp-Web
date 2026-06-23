import { useState, useEffect } from 'react';
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

    // Arama formunun açık/kapalı durumunu tutan state
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    // Arama yapıldığında formu kapat, arama temizlendiğinde formu aç
    useEffect(() => {
        if (hasSearched) {
            setIsFilterOpen(false);
        } else {
            setIsFilterOpen(true);
        }
    }, [hasSearched]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 transition-colors">
            
            {/* BAŞLIK (ACCORDION TETİKLEYİCİ) */}
            <button 
                type="button" 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className="w-full flex justify-between items-center text-blue-900 dark:text-gray-100 font-bold mb-2 group"
            >
                <span className="flex items-center gap-2">🔍 Gelişmiş Harcama Arama</span>
                <span className={`text-gray-400 group-hover:text-blue-500 transform transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : 'rotate-0'}`}>
                    ▼
                </span>
            </button>

            {/* ARAMA FORMU (Açılır/Kapanır Animasyonlu) */}
            <div className={`grid transition-all duration-500 ease-in-out ${isFilterOpen ? 'grid-rows-[1fr] opacity-100 mb-4' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
                <div className="overflow-hidden">
                    <form onSubmit={handleFilterSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end pt-2">
                        <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Başlangıç</label><input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition" /></div>
                        <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Bitiş</label><input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition" /></div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Kategori</label>
                            <CategorySelect options={groupedCategories} value={filterCategoryId} onChange={setFilterCategoryId} placeholder="Tümü" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">İşyeri</label>
                            <SearchableSelect options={getFilteredMerchants(filterCategoryId)} value={filterMerchantId} onChange={setFilterMerchantId} placeholder="Tümü" emptyLabel="Tümü (Seçimi Temizle)" />
                        </div>
                        <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Ülke</label><select value={filterCountryId} onChange={e => setFilterCountryId(e.target.value)} className="p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition"><option value="">Tümü</option>{countries.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}</select></div>
                        <div className="flex flex-col gap-1"><label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Döviz</label><select value={filterCurrencyId} onChange={e => setFilterCurrencyId(e.target.value)} className="p-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition"><option value="">Tümü</option>{currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}</select></div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={filterLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-sm disabled:opacity-50">{filterLoading ? 'Sorgulanıyor...' : 'Sorgula'}</button>
                            {hasSearched && <button type="button" onClick={handleClearFilter} className="px-4 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 font-bold text-sm py-2.5 rounded-xl transition" title="Aramayı Temizle">✕</button>}
                        </div>
                    </form>
                </div>
            </div>

            {/* SORGU SONUÇLARI (Yağ gibi açılıp kapanan geçiş) */}
            <div className={`grid transition-all duration-500 ease-in-out ${hasSearched ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                                Sorgu Sonuçları ({filteredTransactions.length} Eşleşme)
                            </h4>
                            {/* Mobilde form kapalıyken formu geri açma butonu */}
                            {!isFilterOpen && (
                                <button onClick={() => setIsFilterOpen(true)} className="text-xs text-blue-500 font-semibold hover:underline">
                                    Filtreyi Değiştir
                                </button>
                            )}
                        </div>

                        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 lg:pr-2 scrollbar-hide">
                            {filteredTransactions.map((t) => {
                                const catObj = categories.find(c => c.name === t.categoryName);
                                const subtitleCategory = catObj?.parentCategory?.name || t.categoryName;
                                return (
                                    <div key={t.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100/70 dark:hover:bg-gray-700 rounded-xl flex items-center justify-between border border-gray-100/50 dark:border-gray-600 transition duration-200 group gap-2">
                                        
                                        {/* SOL TARAF (İkon ve Yazılar) - min-w-0 ile sıkışmasını engelliyoruz */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <span className="text-lg bg-white dark:bg-gray-800 w-9 h-9 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                                {t.categoryIcon}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm capitalize truncate">
                                                    {(t.description || t.categoryName || "").toLocaleLowerCase('tr-TR')}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide truncate">
                                                    {formatDateTime(t.date)} • <span className="text-gray-500 dark:text-gray-400">{subtitleCategory}</span> {t.merchantName ? `• ${t.merchantName}` : ''}
                                                </p>
                                            </div>
                                        </div>

                                        {/* SAĞ TARAF (Tutar ve Butonlar) - Sabit genişlikler kaldırıldı */}
                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            <div className="font-bold text-gray-800 dark:text-gray-100 text-sm text-right whitespace-nowrap">
                                                {t.amount} {t.currencySymbol ? t.currencySymbol : '₺'}
                                                {t.exchangeRate && t.exchangeRate !== 1 && <div className="text-[9px] text-gray-400 font-normal mt-0.5">Kur: {t.exchangeRate}</div>}
                                            </div>
                                            
                                            {/* Butonlar: Mobilde daha minik ve pürüzsüz */}
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => onEdit(t)} className="text-gray-400 dark:text-gray-300 hover:text-blue-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-600 p-1 lg:p-1.5 text-[10px] lg:text-xs rounded-lg transition shadow-sm border border-gray-100 dark:border-gray-600" title="Düzenle">✏️</button>
                                                <button onClick={() => onDelete(t.id)} className="text-gray-400 dark:text-gray-300 hover:text-red-600 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-gray-600 p-1 lg:p-1.5 text-[10px] lg:text-xs rounded-lg transition shadow-sm border border-gray-100 dark:border-gray-600" title="Sil">🗑️</button>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                            {filteredTransactions.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6">Eşleşme bulunamadı.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}