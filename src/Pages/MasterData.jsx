import { useMasterDataManager } from '../hooks/useMasterDataManager';
import GenericList from '../Components/GenericList';

export default function MasterData() {
  const { data, loading, fetchMasterData, token } = useMasterDataManager();

  if (loading && !data) return <div className="p-8 text-gray-500 dark:text-gray-400">Veritabanı taranıyor...</div>;
  if (!data) return <div className="p-8 text-red-500 dark:text-red-400">Veri bulunamadı. Backend açık mı?</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
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
        {/* Diğer GenericList bileşenleri için de aynı mantığı koruyoruz */}
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