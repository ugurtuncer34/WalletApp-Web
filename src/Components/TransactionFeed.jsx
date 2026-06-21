import { formatDateTime } from '../utils/dateHelpers';

export default function TransactionFeed({
    transactions,
    categories,
    hasMore,
    onLoadMore,
    onEdit,
    onDelete
}) {
    return (
        <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col h-[400px] xl:h-[550px]">
            <h2 className="text-gray-800 font-bold mb-4 flex justify-between items-center">
                <span>Son İşlemler (Canlı Akış)</span>
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{transactions.length}</span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {transactions.map((t) => {
                    // Kategori objesini bul ve üst kategorisi varsa subtitle olarak kullan
                    const catObj = categories.find(c => c.name === t.categoryName);
                    const subtitleCategory = catObj?.parentCategory?.name || t.categoryName;

                    return (
                        <div key={t.id} className="p-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 border border-transparent hover:border-gray-100 transition duration-200 group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl shadow-sm">
                                    {t.categoryIcon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">
                                        {formatDateTime(t.date)}
                                    </span>
                                    <p className="font-semibold text-gray-800 text-sm capitalize">
                                        {(t.description || t.categoryName || "").toLocaleLowerCase('tr-TR')}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5 text-[10px]">
                                        {subtitleCategory}
                                        {t.merchantName ? ` • ${t.merchantName}` : ''}
                                        {t.countryName && t.countryName !== 'TÜRKİYE' && t.countryName !== 'Türkiye' ? ` • ${t.countryName}` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="relative flex flex-col items-end justify-center min-w-[70px]">
                                <div className="absolute -top-4 right-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm shadow-sm rounded-md border border-gray-100 p-0.5 z-20 pointer-events-none group-hover:pointer-events-auto">
                                    <button onClick={() => onEdit(t)} className="text-gray-400 hover:text-blue-600 p-1 text-[10px] leading-none rounded hover:bg-blue-50 transition" title="Düzenle">✏️</button>
                                    <button onClick={() => onDelete(t.id)} className="text-gray-400 hover:text-red-600 p-1 text-[10px] leading-none rounded hover:bg-red-50 transition" title="Sil">🗑️</button>
                                </div>
                                <div className="font-bold text-gray-900 text-right mt-3">
                                    {t.amount} {t.currencySymbol ? t.currencySymbol : '₺'}
                                    {t.exchangeRate && t.exchangeRate !== 1 && <div className="text-[9px] text-gray-400 font-normal mt-0.5">Kur: {t.exchangeRate}</div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {transactions.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Henüz harcama yok.</p>}
                {hasMore && transactions.length > 0 && (
                    <button onClick={onLoadMore} className="w-full mt-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-xl transition">
                        Daha Fazla Yükle ↓
                    </button>
                )}
            </div>
        </div>
    );
}