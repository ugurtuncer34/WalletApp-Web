/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function MasterData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('wallet_token');

  const fetchMasterData = () => {
    setLoading(true);
    fetch(`${API_BASE}/admin/master-data`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('wallet_token');
          navigate('/login');
          throw new Error('Yetkisiz erişim');
        }
        return res.json();
      })
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
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMasterData();
  }, [token, navigate]);

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
          token={token}
          fields={[
            { name: 'name', placeholder: 'Kategori Adı', type: 'text' }, 
            { name: 'icon', placeholder: 'İkon (Örn: 🛒)', type: 'text' },
            { name: 'parentCategoryId', placeholder: 'Üst Kategori', type: 'select', options: data.categories }
          ]}
          onRefresh={fetchMasterData}
        />

        <GenericList 
          title="Ülkeler" 
          icon="🌍" 
          items={data.countries} 
          endpoint="countries" 
          token={token}
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
          token={token}
          fields={[
            { name: 'name', placeholder: 'İşyeri Adı', type: 'text' },
            { name: 'defaultCategoryId', placeholder: 'Varsayılan Kategori', type: 'select', options: data.categories }
          ]}
          onRefresh={fetchMasterData}
        />

        <GenericList 
          title="Kurlar" 
          icon="💵" 
          items={data.currencies} 
          endpoint="currencies" 
          token={token}
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
          token={token}
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
// GENERIC LIST COMPONENT (AKILLI - Ekle & Güncelle Yetenekli)
// ============================================================================
function GenericList({ title, icon, items = [], endpoint, fields, onRefresh, token }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editModeId, setEditModeId] = useState(null); // Güncelleme Modu Takibi

  const handleInputChange = (e, fieldName) => {
    const val = e.target.value;
    setFormData({ ...formData, [fieldName]: val === "" ? null : val });
  };

  // Düzenle Butonuna Basıldığında Formu Doldur
  const handleEditClick = (item) => {
    setEditModeId(item.id);
    
    // Yabancı anahtarları (Foreign Keys) güvenli şekilde map'le
    const mappedData = { ...item };
    if (item.parentCategory) mappedData.parentCategoryId = item.parentCategory.id;
    if (item.defaultCategory) mappedData.defaultCategoryId = item.defaultCategory.id;
    
    setFormData(mappedData);
  };

  // Düzenleme Modundan Çıkış
  const handleCancelEdit = () => {
    setEditModeId(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const isUpdate = editModeId !== null;
    const url = isUpdate ? `${API_BASE}/${endpoint}/${editModeId}` : `${API_BASE}/${endpoint}`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Sadece formdatayı gönderiyoruz, editModeId PUT urline eklendiği için yeterli
        body: JSON.stringify({ ...formData, id: isUpdate ? editModeId : undefined }) 
      });

      if (res.ok) {
        setFormData({});
        setEditModeId(null);
        onRefresh();
      } else {
        const errorData = await res.json();
        alert(`İşlem başarısız: ${errorData.message || res.statusText}`);
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
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        if(editModeId === id) handleCancelEdit(); // Eğer sildiği kaydı o an düzenliyorsa, formu da temizle
        onRefresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Silme başarısız! ${errData.message || "Bu kayıt başka bir tabloda kullanılıyor olabilir."}`);
      }
    } catch (err) {
      alert("Sunucuya ulaşılamadı.");
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm flex flex-col h-[75vh] transition ${editModeId ? 'border border-blue-400 ring-2 ring-blue-100' : 'border border-gray-100'}`}>
      
      <div className={`p-4 border-b bg-gray-50/50 rounded-t-2xl ${editModeId ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'}`}>
        <h3 className="font-bold text-gray-700 flex items-center justify-between">
          <span>{icon} {title} {editModeId && <span className="text-xs text-blue-500 ml-1">(Düzenleniyor)</span>}</span>
          <span className="text-xs bg-gray-200 text-gray-600 py-1 px-2 rounded-full">{items.length}</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Kayıt yok</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`group flex justify-between items-start p-2 rounded-lg border-b border-transparent transition ${editModeId === item.id ? 'bg-blue-50/50' : 'hover:bg-gray-50 hover:border-gray-100'}`}>
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  {item.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>}
                  <span className={`text-sm font-medium truncate ${editModeId === item.id ? 'text-blue-700' : 'text-gray-700'}`} title={item.name}>{item.name}</span>
                  {item.code && <span className="text-xs text-gray-400 font-mono">{item.code}</span>}
                </div>
                
                {(item.parentCategory || item.defaultCategory) && (
                  <span className="text-[10px] text-gray-400 mt-0.5 ml-1">
                    ↳ {item.parentCategory?.name || item.defaultCategory?.name}
                  </span>
                )}
              </div>
              
              <div className="flex opacity-0 group-hover:opacity-100 transition gap-1">
                <button 
                  onClick={() => handleEditClick(item)}
                  className="text-gray-300 hover:text-blue-500 hover:bg-blue-50 p-1 rounded-md transition"
                  title="Düzenle"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(item.id, item.name)}
                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition"
                  title="Sil"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`p-3 border-t bg-gray-50/30 rounded-b-2xl ${editModeId ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'}`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {fields.map((field) => {
            if (field.type === 'select') {
              return (
                <select
                  key={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(e, field.name)}
                  className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition bg-white"
                >
                  <option value="">{field.placeholder} (Opsiyonel)</option>
                  {field.options?.filter(opt => opt.id !== editModeId).map(opt => (
                    // Kendini üst kategori/varsayılan kategori olarak seçmesini engelliyoruz (opt.id !== editModeId)
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              );
            }
            
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
          
          <div className="flex gap-2 mt-1">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`flex-1 font-semibold text-sm py-2 rounded-lg transition disabled:opacity-50 ${editModeId ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
            >
              {isSubmitting ? 'İşleniyor...' : (editModeId ? 'Kaydet' : '+ Ekle')}
            </button>
            
            {editModeId && (
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="px-4 font-semibold text-sm py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
              >
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}