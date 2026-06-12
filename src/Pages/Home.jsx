import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Tarayıcı hafızasından Token'ı okuyoruz
  const token = localStorage.getItem('wallet_token');

  // Sayfa açıldığında son harcamaları getir
  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:5139/api/transactions', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      // Eğer Token sahteyse veya süresi dolmuşsa çıkışa yolla
      if (res.status === 401) {
        localStorage.removeItem('wallet_token');
        navigate('/login');
        return;
      }

      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Harcamalar çekilemedi:", err);
    }
  };

  useEffect(() => {
    // Bileti olmayan ana sayfayı göremez!
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [token, navigate]);

  // Quick Add API'sine İstek Atma
  const handleQuickAdd = async (textToSubmit) => {
    if (!textToSubmit) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5139/api/transactions/quick-add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Burada da bileti gösteriyoruz
        },
        body: JSON.stringify({ text: textToSubmit })
      });

      if (res.ok) {
        setInputText(""); 
        fetchTransactions(); 
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleQuickAdd(inputText);
    }
  };

  const handleChipClick = (chipWord) => {
    const amountMatch = inputText.match(/^\d+(\.\d+)?$/); 
    if (amountMatch) {
      const finalString = `${inputText} ${chipWord}`;
      handleQuickAdd(finalString);
    } else {
      setInputText((prev) => prev + (prev ? " " : "") + chipWord);
    }
  };

  // Tarihi profesyonelce Türkçe formatlayan fonksiyon
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    }); // Çıktı: "12 Haziran, 15:30"
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
                <div className="flex flex-col">
                  {/* Tarih Alanı Eklendi */}
                  <span className="text-[11px] font-medium text-gray-400 mb-0.5 uppercase tracking-wide">
                    {formatDateTime(t.date)}
                  </span>
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