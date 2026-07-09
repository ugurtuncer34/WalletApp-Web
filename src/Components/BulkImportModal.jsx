import { useState } from 'react';
import CategorySelect from './CategorySelect';
import SearchableSelect from './Combobox';


export default function BulkImportModal({ isOpen, onClose, masterData, onBulkSubmit, loading }) {
    const { groupedCategories, merchants, categories } = masterData;
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [nlpLoading, setNlpLoading] = useState(false);
    const [parsedData, setParsedData] = useState([]);
    
    const NLP_URL = import.meta.env.VITE_NLP_API_URL;
    console.log("NLP_URL::");
    console.log(NLP_URL);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleParsePdf = async () => {
        if (!file) return;
        setNlpLoading(true);

        const categoriesJson = JSON.stringify(categories.map(c => c.name));
        const merchantsJson = JSON.stringify(merchants.map(m => ({
            name: m.name,
            defaultCategoryName: m.defaultCategory?.name
        })));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("categories", categoriesJson);
        formData.append("merchants", merchantsJson);

        try {
            const response = await fetch(NLP_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success && result.data) {
                const mappedTransactions = result.data.map((item, index) => {
                    const matchedCat = categories.find(c => c.name === item.category);
                    const matchedMer = merchants.find(m => m.name === item.merchant);
                    
                    return {
                        id: `temp-${index}`,
                        date: item.date,
                        amount: item.amount,
                        description: item.merchant, 
                        categoryId: matchedCat ? matchedCat.id : "",
                        merchantId: item.isMerchantMatched && matchedMer ? matchedMer.id : "",
                        isMerchantMatched: item.isMerchantMatched,
                        rawMerchant: item.merchant,
                        excluded: false
                    };
                });

                setParsedData(mappedTransactions);
                setStep(2);
            } else {
                alert("NLP İşleme hatası: " + result.message);
            }
        } catch (err) {
            console.error("NLP bağlantı hatası", err);
            alert("NLP mikroservisine bağlanılamadı.");
        } finally {
            setNlpLoading(false);
        }
    };

    const handleRowChange = (id, field, value) => {
        setParsedData(prev => prev.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleExcludeToggle = (id) => {
        setParsedData(prev => prev.map(item => 
            item.id === id ? { ...item, excluded: !item.excluded } : item
        ));
    };

    const handleSubmitToBackend = async () => {
        const finalPayload = parsedData
            .filter(item => !item.excluded)
            .map(item => ({
                date: new Date(item.date).toISOString(),
                amount: parseFloat(item.amount),
                description: item.description || null,
                categoryId: item.categoryId || null,
                merchantId: item.merchantId || null,
                currencyId: null, 
                countryId: null   
            }));

        const result = await onBulkSubmit(finalPayload);
        if (result.success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setStep(1);
        setFile(null);
        setParsedData([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
            
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {step === 1 ? 'Ekstre Yükle (PDF)' : 'Harcama İncele & Onayla'}
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-6">
                            <div className="w-full max-w-md">
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Banka Ekstresi Yükle (PDF)</label>
                                <input 
                                    type="file" 
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                                />
                            </div>
                            <button 
                                onClick={handleParsePdf} 
                                disabled={!file || nlpLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md disabled:opacity-50"
                            >
                                {nlpLoading ? 'Yapay zeka ile analiz ediliyor...' : 'Parse Statement'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-blue-100 dark:border-slate-700">
                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                    {parsedData.length} adet harcama bulundu. Lütfen kayıttan önce kontrol edin.
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-slate-700">
                                            <th className="p-3 text-xs font-bold text-gray-500">Include</th>
                                            <th className="p-3 text-xs font-bold text-gray-500">Date</th>
                                            <th className="p-3 text-xs font-bold text-gray-500">Amount</th>
                                            <th className="p-3 text-xs font-bold text-gray-500">Raw Description</th>
                                            <th className="p-3 text-xs font-bold text-gray-500">Merchant Match</th>
                                            <th className="p-3 text-xs font-bold text-gray-500">Category</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.map(item => (
                                            <tr key={item.id} className={`border-b border-gray-100 dark:border-slate-800 transition ${item.excluded ? 'opacity-40 bg-gray-50 dark:bg-slate-900' : ''}`}>
                                                <td className="p-3 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={!item.excluded} 
                                                        onChange={() => handleExcludeToggle(item.id)}
                                                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-3 text-xs whitespace-nowrap">{item.date}</td>
                                                <td className="p-3 font-bold">{item.amount}</td>
                                                <td className="p-3 text-xs max-w-[200px] truncate" title={item.rawMerchant}>
                                                    {item.rawMerchant}
                                                </td>
                                                <td className="p-3 min-w-[200px]">
                                                    <div className={`p-1 rounded-lg border ${item.isMerchantMatched ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20' : 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20'}`}>
                                                        <SearchableSelect 
                                                            options={merchants} 
                                                            value={item.merchantId} 
                                                            onChange={(val) => handleRowChange(item.id, 'merchantId', val)} 
                                                            placeholder={item.isMerchantMatched ? item.description : "Select Merchant..."} 
                                                            emptyLabel="Clear Selection" 
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-3 min-w-[200px]">
                                                    <CategorySelect 
                                                        options={groupedCategories} 
                                                        value={item.categoryId} 
                                                        onChange={(val) => handleRowChange(item.id, 'categoryId', val)} 
                                                        placeholder="Select Category" 
                                                        disableParents={true} 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {step === 2 && (
                    <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 rounded-b-3xl flex justify-end gap-3">
                        <button onClick={handleClose} className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition hover:bg-gray-50">
                            İptal Et
                        </button>
                        <button 
                            onClick={handleSubmitToBackend} 
                            disabled={loading || parsedData.filter(x => !x.excluded).length === 0}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md disabled:opacity-50 transition"
                        >
                            {loading ? 'Veritabanına kaydediliyor...' : `${parsedData.filter(x => !x.excluded).length} Adet Harcama Ekle`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}