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
            <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
                <h2 className="text-gray-800 font-bold mb-4">Akıllı Giriş</h2>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Örn: 150 file market..."
                    disabled={loading}
                    className="w-full text-lg p-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                />
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
                <h2 className="text-gray-800 font-bold mb-3 text-sm">Hızlı İşlem (Tek Tık)</h2>
                <div className="flex flex-wrap gap-2">
                    {["Kahve", "File", "Fırın", "Şok", "Opet", "Eczane"].map((chip) => (
                        <button
                            key={chip}
                            onClick={() => onChipClick(chip.toLowerCase())}
                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl font-semibold text-sm hover:from-blue-100 hover:to-blue-200 border border-blue-200/50 shadow-sm transition active:scale-95"
                        >
                            ⚡ {chip}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}