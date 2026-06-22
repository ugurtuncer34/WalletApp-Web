export default function SmartInput({
    inputText,
    setInputText,
    onQuickAdd,
    loading,
    onChipClick
}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onQuickAdd(inputText);
    };

    return (
        <>
            {/* 1. KART: AKILLI GİRİŞ */}
            <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 transition-colors">
                <h2 className="text-gray-800 dark:text-white font-bold mb-2 lg:mb-4 text-sm lg:text-base">Akıllı Giriş</h2>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Örn: 150 file market..."
                    disabled={loading}
                    // Mobilde p-2.5 ve text-base, Masaüstünde p-3 ve text-lg (Orijinal renklerine dokunmadım)
                    className="w-full text-base lg:text-lg p-2.5 lg:p-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-transparent dark:border-gray-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                />
            </div>

            {/* 2. KART: HIZLI İŞLEM ÇİPLERİ */}
            <div className="bg-white dark:bg-gray-800 p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 transition-colors">
                <h2 className="text-gray-800 dark:text-white font-bold mb-2 lg:mb-3 text-xs lg:text-sm">Hızlı İşlem (Tek Tık)</h2>
                {/* Mobilde çiplerin arası daha dar (gap-1.5), masaüstünde normal (lg:gap-2) */}
                <div className="flex flex-wrap gap-1.5 lg:gap-2">
                    {["Kahve", "File", "Fırın", "Şok", "Opet", "Eczane"].map((chip) => (
                        <button
                            key={chip}
                            onClick={() => onChipClick(chip.toLowerCase())}
                            // Gradientler tamamen orijinal. Sadece mobilde px-3 py-1.5, masaüstünde px-4 py-2
                            className="px-3 py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 rounded-xl font-semibold text-xs lg:text-sm hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/50 dark:hover:to-blue-700/50 border border-blue-200/50 dark:border-blue-800/50 shadow-sm transition active:scale-95"
                        >
                            ⚡ {chip}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}