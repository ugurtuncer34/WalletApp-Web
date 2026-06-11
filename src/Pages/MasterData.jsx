import { useState, useEffect } from 'react';

// API Adresini dışarı aldık (Merkezi Yönetim)
const API_BASE = 'http://localhost:5139/api';

export default function MasterData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMasterData = () => {
    setLoading(true);
    fetch(`${API_BASE}/admin/master-data`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Veri çekme hatası:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  if (loading && !data) return <div className="p-8 text-gray-500">Veritabanı taranıyor...</div>;
  if (!data) return <div className="p-8 text-red-500">Veri bulunamadı. Backend açık mı?</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📊 Master Data Röntgeni
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
        
        <GenericList 
          title="Kategoriler" 
          icon="📁" 
          items={data.categories} 
          endpoint="categories" 
          fields={[
            { name: 'name', placeholder: 'Kategori Adı', type: 'text' }, 
            { name: 'icon', placeholder: 'İkon (Örn: 🛒)', type: 'text' },
            // Parent Category için Dropdown (Kendi kendini referans alıyor)
            { name: 'parentCategoryId', placeholder: 'Üst Kategori', type: 'select', options: data.categories }
          ]}
          onRefresh={fetchMasterData}
        />

        <GenericList 
          title="Ülkeler" 
          icon="🌍" 
          items={data.countries} 
          endpoint="countries" 
          fields={[
            { name: 'name', placeholder: 'Ülke Adı', type: 'text' }, 
            { name: 'code', placeholder: 'Kod (Örn: TR)', type: 'text' }
          ]}
          onRefresh={fetchMasterData}
        />

        <GenericList 
          title="İşyerleri" 
          icon="🏢" 
          items={data.merchants} 
          endpoint="merchants" 
          fields={[
            { name: 'name', placeholder: 'İşyeri Adı', type: 'text' },
            // Merchant için Varsayılan Kategori Dropdown'ı
            { name: 'defaultCategoryId', placeholder: 'Varsayılan Kategori', type: 'select', options: data.categories }
          ]}
          onRefresh={fetchMasterData}
        />

        <GenericList 
          title="Kurlar" 
          icon="💵" 
          items={data.currencies} 
          endpoint="currencies" 
          fields={[
            { name: 'name', placeholder: 'Kur Adı', type: 'text' }, 
            { name: 'code', placeholder: 'Kod (USD)', type: 'text' }, 
            { name: 'symbol', placeholder: 'Sembol ($)', type: 'text' }
          ]}
          onRefresh={fetchMasterData}
        />

        <GenericList 
          title="Etiketler" 
          icon="🏷️" 
          items={data.tags} 
          endpoint="tags" 
          fields={[
            { name: 'name', placeholder: 'Etiket Adı', type: 'text' }, 
            { name: 'color', placeholder: 'Renk (Hex: #fff)', type: 'text' }
          ]}
          onRefresh={fetchMasterData}
        />

      </div>
    </div>
  );
}

// ============================================================================
// GENERIC LIST COMPONENT (Artık Dropdown Destekli)
// ============================================================================
function GenericList({ title, icon, items = [], endpoint, fields, onRefresh }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e, fieldName) => {
    const val = e.target.value;
    // Eğer select kutusunda "Seçiniz" (boş) seçildiyse Guid hatası almamak için null gönderiyoruz
    setFormData({ ...formData, [fieldName]: val === "" ? null : val });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setFormData({});
        onRefresh();
      } else {
        alert("Ekleme başarısız oldu. API'yi kontrol edin.");
      }
    } catch (err) {
      alert("Sunucuya ulaşılamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`'${name}' kaydını silmek istediğinize emin misiniz?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        onRefresh();
      } else {
        alert("Silme başarısız! Bu kayıt başka bir tabloda kullanılıyor olabilir.");
      }
    } catch (err) {
      alert("Sunucuya ulaşılamadı.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[75vh]">
      
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
        <h3 className="font-bold text-gray-700 flex items-center justify-between">
          <span>{icon} {title}</span>
          <span className="text-xs bg-gray-200 text-gray-600 py-1 px-2 rounded-full">{items.length}</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Kayıt yok</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group flex justify-between items-start p-2 hover:bg-gray-50 rounded-lg border-b border-transparent hover:border-gray-100 transition">
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  {item.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>}
                  <span className="text-sm font-medium text-gray-700 truncate" title={item.name}>{item.name}</span>
                  {item.code && <span className="text-xs text-gray-400 font-mono">{item.code}</span>}
                </div>
                
                {/* Alt Detaylar (Parent Category veya Default Category) */}
                {(item.parentCategory || item.defaultCategory) && (
                  <span className="text-[10px] text-gray-400 mt-0.5 ml-1">
                    ↳ {item.parentCategory?.name || item.defaultCategory?.name}
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => handleDelete(item.id, item.name)}
                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition opacity-0 group-hover:opacity-100"
                title="Sil"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          {fields.map((field) => {
            // EĞER TİP "SELECT" İSE DROPDOWN RENDER ET
            if (field.type === 'select') {
              return (
                <select
                  key={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(e, field.name)}
                  className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition bg-white"
                >
                  <option value="">{field.placeholder} (Opsiyonel)</option>
                  {field.options?.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              );
            }
            
            // TİP "TEXT" İSE NORMAL INPUT RENDER ET
            return (
              <input
                key={field.name}
                type="text"
                required={!field.placeholder.includes('Opsiyonel')}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(e, field.name)}
                placeholder={field.placeholder}
                className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
              />
            );
          })}
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm py-2 rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? 'Ekleniyor...' : '+ Ekle'}
          </button>
        </form>
      </div>

    </div>
  );
}