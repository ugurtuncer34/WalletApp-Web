import { useState, useRef, useEffect } from 'react';

const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLocaleLowerCase('tr-TR').replace(/(?:^|\s)\S/g, (a) => a.toLocaleUpperCase('tr-TR'));
};

const CategorySelect = ({ options, value, onChange, placeholder, disableParents = false }) => {
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
      {/* KAPALI HALİ */}
      <div
        className="p-2.5 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
          {selectedOption ? (
            <>
              <span>{selectedOption.icon}</span>
              <span>{toTitleCase(selectedOption.name)}</span>
            </>
          ) : <span className="text-gray-500 dark:text-gray-400 font-normal">{placeholder}</span>}
        </span>
        <span className="text-gray-400 dark:text-gray-500 text-xs">▼</span>
      </div>

      {/* AÇIK HALİ */}
      {isOpen && (
        <div className="absolute z-50 min-w-[260px] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto flex flex-col transition-colors">
          <div
            className="p-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition font-medium m-1"
            onClick={() => { onChange(""); setIsOpen(false); }}
          >
            Tümü (Seçimi Temizle)
          </div>
          <div className="p-1 space-y-0.5">
            {options.map(c => {
              const isDisabled = disableParents && c.isParent;

              return (
                <div
                  key={c.id}
                  className={`p-2.5 text-sm cursor-pointer rounded-lg transition flex items-center gap-2 
                ${c.isParent
                      ? 'font-bold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 mt-1'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-200 ml-4'}
                ${isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'}`}
                  onClick={() => {
                    if (!isDisabled) { onChange(c.id); setIsOpen(false); }
                  }}
                >
                  <span className="opacity-60 text-xs">{c.isParent ? '📁' : '↳'}</span>
                  <span>{c.icon}</span>
                  <span>{toTitleCase(c.name)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelect;