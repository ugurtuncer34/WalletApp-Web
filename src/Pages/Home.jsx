import { useState, useEffect } from 'react';

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sayfa açıldığında son harcamaları getir
  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:5139/api/transactions'); // Portu kontrol et
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Harcamalar çekilemedi:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Quick Add API'sine İstek Atma
  const handleQuickAdd = async (textToSubmit) => {
    if (!textToSubmit) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5139/api/transactions/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSubmit })
      });

      if (res.ok) {
        setInputText(""); // Başarılıysa inputu temizle
        fetchTransactions(); // Listeyi yenile
      } else {
        const errText = await res.text();
        alert("Hata: " + errText);
      }
    } catch (err) {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // Inputta Enter'a basınca tetiklenmesi için
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleQuickAdd(inputText);
    }
  };

  // Hızlı Çip (Quick Chip) butonuna tıklandığında
  const handleChipClick = (chipWord) => {
    // Sadece rakam girilmişse (örn: "150"), sonuna çipi ekle ve yolla ("150 kahve")
    const amountMatch = inputText.match(/^\d+(\.\d+)?$/); 
    
    if (amountMatch) {
      const finalString = `${inputText} ${chipWord}`;
      handleQuickAdd(finalString);
    } else {
      // Rakam yoksa inputa sadece kelimeyi ekle
      setInputText((prev) => prev + (prev ? " " : "") + chipWord);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      
      {/* Üst Kısım: Arama Çubuğu (Smart Input) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Örn: 150 file market..."
          disabled={loading}
          className="w-full text-xl p-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 transition"
        />
        
        {/* Quick Chips Bölümü */}
        <div className="flex flex-wrap gap-2">
          {["Kahve", "Fırın", "File", "Şok", "Opet", "Eczane", "Tekel"].map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip.toLowerCase())}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-medium text-sm hover:bg-blue-100 transition active:scale-95"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Alt Kısım: Son İşlemler (Live Feed) */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-4 px-1">Son İşlemler</h2>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-50">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{t.categoryIcon}</span>
                <div>
                  <p className="font-semibold text-gray-800 capitalize">{t.description}</p>
                  <p className="text-sm text-gray-500">
                    {t.categoryName} {t.merchantName ? `• ${t.merchantName}` : ''}
                  </p>
                </div>
              </div>
              <div className="font-bold text-lg text-gray-900">
                {t.amount} ₺
              </div>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-gray-500 text-center py-4">Henüz harcama yok.</p>}
        </div>
      </div>
      
    </div>
  );
}