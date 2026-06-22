import { useState, useEffect, useRef } from 'react';
import { formatDateTime } from '../utils/dateHelpers';

export default function TransactionFeed({
    transactions,
    categories,
    hasMore,
    onLoadMore,
    onEdit,
    onDelete
}) {
    // Mobilde hangi işlemin üç nokta menüsü açık?
    const [activeMenuId, setActiveMenuId] = useState(null);
    const menuRef = useRef(null);

    // Dışarı tıklayınca açık olan menüyü kapatma efekti
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const toggleMenu = (e, id) => {
        e.stopPropagation(); // Tıklamanın satırı tetiklemesini engelle
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    return (
        // DİKKAT: Eski sağlam yükseklikler (h-[400px] xl:h-[550px]) geri geldi!
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 flex flex-col h-[400px] xl:h-[550px] transition-colors relative">
            
            <h2 className="text-gray-800 dark:text-white font-bold mb-3 lg:mb-4 flex justify-between items-center text-sm lg:text-base">
                <span>Son İşlemler (Canlı Akış)</span>
                <span className="text-xs font-normal text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">{transactions.length}</span>
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 lg:space-y-3 pr-1 lg:pr-2 scrollbar-hide">
                {transactions.map((t) => {
                    const catObj = categories.find(c => c.name === t.categoryName);
                    const subtitleCategory = catObj?.parentCategory?.name || t.categoryName;
                    
                    // Bu satırın menüsü açık mı?
                    const isMenuOpen = activeMenuId === t.id;

                    return (
                        <div key={t.id} className="p-3 rounded-2xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-transparent dark:border-gray-700 hover:border-gray-100 dark:hover:border-slate-600 transition duration-200 group relative">
                            
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl shadow-sm">
                                    {t.categoryIcon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-0.5 uppercase tracking-wider">
                                        {formatDateTime(t.date)}
                                    </span>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm capitalize">
                                        {(t.description || t.categoryName || "").toLocaleLowerCase('tr-TR')}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-0.5">
                                        {subtitleCategory}
                                        {t.merchantName ? ` • ${t.merchantName}` : ''}
                                        {t.countryName && t.countryName !== 'TÜRKİYE' && t.countryName !== 'Türkiye' ? ` • ${t.countryName}` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="relative flex flex-col items-end justify-center min-w-[70px]">
                                
                                {/* MASAÜSTÜ HOVER & MOBİL ÜÇ NOKTA MENÜSÜ BİRLEŞİMİ */}
                                <div 
                                    ref={isMenuOpen ? menuRef : null}
                                    className={`absolute -top-4 right-6 lg:right-0 flex items-center gap-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-md lg:shadow-sm rounded-lg lg:rounded-md border border-gray-200 dark:border-slate-600 p-1 z-20 transition-all duration-200
                                    ${isMenuOpen ? 'opacity-100 pointer-events-auto translate-x-0' : 'opacity-0 pointer-events-none translate-x-2 lg:translate-x-0 lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto'}`}
                                >
                                    <button 
                                        onClick={() => { onEdit(t); setActiveMenuId(null); }} 
                                        className="text-gray-500 dark:text-gray-300 hover:text-blue-600 p-2 lg:p-1 text-xs lg:text-[10px] leading-none rounded hover:bg-blue-50 dark:hover:bg-slate-700 transition" 
                                        title="Düzenle"
                                    >
                                        ✏️
                                    </button>
                                    <div className="w-px h-4 bg-gray-200 dark:bg-slate-600"></div>
                                    <button 
                                        onClick={() => { onDelete(t.id); setActiveMenuId(null); }} 
                                        className="text-gray-500 dark:text-gray-300 hover:text-red-600 p-2 lg:p-1 text-xs lg:text-[10px] leading-none rounded hover:bg-red-50 dark:hover:bg-slate-700 transition" 
                                        title="Sil"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Üç Nokta Butonu (Boşluklar ayarlandı: -top-3 ve -right-1) */}
                                <button 
                                    onClick={(e) => toggleMenu(e, t.id)}
                                    className="lg:hidden absolute -right-1 -top-3 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 active:scale-95 transition-transform"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                    </svg>
                                </button>

                                {/* Fiyat ve Kur (DİKKAT: Mobildeki üst boşluk mt-6 yapılarak araya daha çok mesafe kondu) */}
                                <div className="font-bold text-gray-900 dark:text-gray-100 text-right mt-6 lg:mt-3 text-sm lg:text-base">
                                    {t.amount} {t.currencySymbol ? t.currencySymbol : '₺'}
                                    {t.exchangeRate && t.exchangeRate !== 1 && <div className="text-[9px] text-gray-400 font-normal mt-0.5">Kur: {t.exchangeRate}</div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {transactions.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">Henüz harcama yok.</p>}
                
                {hasMore && transactions.length > 0 && (
                    <button onClick={onLoadMore} className="w-full mt-2 py-3 lg:py-2.5 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider rounded-xl transition">
                        Daha Fazla Yükle ↓
                    </button>
                )}
            </div>
        </div>
    );
}