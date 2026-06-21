import { useState } from 'react';

export const useFilters = () => {
    const [filterCategoryId, setFilterCategoryId] = useState("");
    const [filterMerchantId, setFilterMerchantId] = useState("");
    const [filterCountryId, setFilterCountryId] = useState("");
    const [filterCurrencyId, setFilterCurrencyId] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);

    const token = localStorage.getItem('wallet_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const handleFilterSearch = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        setFilterLoading(true);
        try {
            let url = `${API_BASE}/transactions?PageNumber=1&PageSize=50`;
            if (filterCategoryId) url += `&CategoryId=${filterCategoryId}`;
            if (filterMerchantId) url += `&MerchantId=${filterMerchantId}`;
            if (filterCountryId) url += `&CountryId=${filterCountryId}`;
            if (filterCurrencyId) url += `&CurrencyId=${filterCurrencyId}`;
            if (filterStartDate) url += `&StartDate=${filterStartDate}`;
            if (filterEndDate) url += `&EndDate=${filterEndDate}`;

            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setFilteredTransactions(data.items || []);
                setHasSearched(true);
            }
        } catch (err) {
            console.error("Filtreleme hatası:", err);
        } finally {
            setFilterLoading(false);
        }
    };

    const handleClearFilter = () => {
        setFilterCategoryId("");
        setFilterMerchantId("");
        setFilterCountryId("");
        setFilterCurrencyId("");
        setFilterStartDate("");
        setFilterEndDate("");
        setFilteredTransactions([]);
        setHasSearched(false);
    };

    // Düzenleme/Silme sonrası eğer arama yapılmışsa listeyi tazelemek için
    const refetchIfSearched = () => {
        if (hasSearched) handleFilterSearch();
    };

    return {
        filterCategoryId, setFilterCategoryId,
        filterMerchantId, setFilterMerchantId,
        filterCountryId, setFilterCountryId,
        filterCurrencyId, setFilterCurrencyId,
        filterStartDate, setFilterStartDate,
        filterEndDate, setFilterEndDate,
        filteredTransactions, hasSearched, filterLoading,
        handleFilterSearch, handleClearFilter, refetchIfSearched
    };
};