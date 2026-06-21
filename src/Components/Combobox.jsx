import { useState, useRef, useEffect } from 'react';

const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLocaleLowerCase('tr-TR').replace(/(?:^|\s)\S/g, (a) => a.toLocaleUpperCase('tr-TR'));
};

const SearchableSelect = ({ options, value, onChange, placeholder, emptyLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div
                className="p-2.5 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 rounded-xl border border-transparent dark:border-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 transition cursor-pointer flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">{selectedOption ? selectedOption.name : placeholder}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">▼</span>
            </div>

            {isOpen && (
                <div className="absolute z-50 min-w-[240px] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col transition-colors">
                    <div className="p-2 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                        <input
                            type="text"
                            autoFocus
                            className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none transition"
                            placeholder="🔍 İsim yazın..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        <div
                            className="p-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition font-medium"
                            onClick={() => { onChange(""); setIsOpen(false); setSearchTerm(''); }}
                        >
                            {emptyLabel}
                        </div>
                        {filteredOptions.map(opt => (
                            <div
                                key={opt.id}
                                className="p-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-200 rounded-lg cursor-pointer transition"
                                onClick={() => { onChange(opt.id); setIsOpen(false); setSearchTerm(''); }}
                            >
                                {toTitleCase(opt.name)}
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="p-3 text-sm text-gray-400 dark:text-gray-500 text-center">İşyeri bulunamadı</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;