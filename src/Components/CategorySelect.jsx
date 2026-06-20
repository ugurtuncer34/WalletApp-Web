import { useState, useRef, useEffect } from 'react';

const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLocaleLowerCase('tr-TR').replace(/(?:^|\s)\S/g, (a) => a.toLocaleUpperCase('tr-TR'));
  };

const CategorySelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* KAPALI HALİ (SADECE İKON VE KÜÇÜK HARFLİ İSİM GÖSTERİR, OKLARI GİZLER) */}
      <div
        className="p-2.5 bg-gray-50 text-sm text-gray-700 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 transition cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate font-medium text-gray-800 flex items-center gap-2">
          {selectedOption ? (
            <>
              <span>{selectedOption.icon}</span> 
              <span>{toTitleCase(selectedOption.name)}</span>
            </>
          ) : <span className="text-gray-500 font-normal">{placeholder}</span>}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {/* AÇIK HALİ (AĞAÇ YAPISI VE GENİŞ PENCERE) */}
      {isOpen && (
        <div className="absolute z-50 min-w-[260px] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-80 overflow-y-auto flex flex-col">
          <div
            className="p-2.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition font-medium m-1"
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            Tümü (Seçimi Temizle)
          </div>
          <div className="p-1 space-y-0.5">
            {options.map(c => (
              <div
                key={c.id}
                className={`p-2.5 text-sm cursor-pointer rounded-lg transition flex items-center gap-2 ${
                  c.isParent 
                    ? 'font-bold text-gray-900 bg-gray-50 mt-1' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 ml-4'
                }`}
                onClick={() => { onChange(c.id); setIsOpen(false); }}
              >
                {/* Ağaç simgeleri sadece liste açıkken görünür */}
                <span className="opacity-60 text-xs">{c.isParent ? '📁' : '↳'}</span>
                <span>{c.icon}</span>
                <span>{toTitleCase(c.name)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelect;