import { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5139/api/admin/master-data')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Veri çekme hatası:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Querying Database...</div>;
  if (!data) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>No data found. Is backend online?</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '50px', color: '#333' }}>📊 WalletApp Data</h1>
      
      {/* Yan yana 6 kolon oluşturan flex düzeni */}
      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', alignItems: 'flex-start' }}>
        
        {/* Kolon 1: Kategoriler */}
        <div style={columnStyle}>
          <h3>📁 Kategoriler ({data.categories?.length})</h3>
          {data.categories?.map(c => <div key={c.id} style={itemStyle}>{c.name}</div>)}
        </div>

        {/* Kolon 2: Para Birimleri */}
        <div style={columnStyle}>
          <h3>🪙 Kur ({data.currencies?.length})</h3>
          {data.currencies?.map(c => <div key={c.id} style={itemStyle}>{c.code} - {c.symbol}</div>)}
        </div>

        {/* Kolon 3: Ülkeler */}
        <div style={columnStyle}>
          <h3>🌍 Ülkeler ({data.countries?.length})</h3>
          {data.countries?.map(c => <div key={c.id} style={itemStyle}>{c.name}</div>)}
        </div>

        {/* Kolon 4: İşyerleri */}
        <div style={columnStyle}>
          <h3>🏢 İşyerleri ({data.merchants?.length})</h3>
          {data.merchants?.map(m => <div key={m.id} style={itemStyle}>{m.name}</div>)}
        </div>

        {/* Kolon 5: Etiketler */}
        <div style={columnStyle}>
          <h3>🏷️ Etiketler ({data.tags?.length})</h3>
          {data.tags?.map(t => <div key={t.id} style={{...itemStyle, borderLeft: `4px solid ${t.color || '#ccc'}`}}>{t.name}</div>)}
        </div>

        {/* Kolon 6: Son Harcamalar */}
        <div style={columnStyle}>
          <h3>💸 Son Harcamalar ({data.transactions?.length})</h3>
          {data.transactions?.map(t => (
            <div key={t.id} style={{...itemStyle, fontSize: '12px'}}>
              <strong>{t.amount}</strong> - {t.description || "Açıklama yok"}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// Kolon ve item tasarımları için basit inline stiller
const columnStyle = {
  flex: '1',
  minWidth: '200px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  maxHeight: '80vh',
  overflowY: 'auto'
};

const itemStyle = {
  padding: '8px',
  borderBottom: '1px solid #eee',
  fontSize: '14px',
  color: '#555'
};

export default App;