import { useState, useEffect, useMemo } from 'react';

export const useMasterData = () => {
    const [categories, setCategories] = useState([]);
    const [merchants, setMerchants] = useState([]);
    const [countries, setCountries] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    const token = localStorage.getItem('wallet_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const fetchFilterOptions = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/admin/master-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
                setMerchants(data.merchants || []);
                setCountries(data.countries || []);
                setCurrencies(data.currencies || []);
            }
        } catch (err) {
            console.error("Filtre seçenekleri yüklenemedi:", err);
        }
    };

    useEffect(() => {
        fetchFilterOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Kategori ağaç yapısı sıralaması
    const groupedCategories = useMemo(() => {
        const result = [];
        const parents = categories.filter(c => !c.parentCategory);

        parents.forEach(p => {
            result.push({ ...p, isParent: true });
            const children = categories.filter(c => c.parentCategory?.id === p.id);
            children.forEach(ch => {
                result.push({ ...ch, isParent: false });
            });
        });

        return result.length > 0 ? result : categories;
    }, [categories]);

    // Akıllı İşyeri (Merchant) Filtreleme Yardımcısı
    const getFilteredMerchants = (selectedCategoryId) => {
        if (!selectedCategoryId) return merchants;

        const validCategoryIds = [
            selectedCategoryId,
            ...categories.filter(c => c.parentCategory?.id === selectedCategoryId).map(c => c.id)
        ];

        return merchants.filter(m => m.defaultCategory && validCategoryIds.includes(m.defaultCategory.id));
    };

    return {
        categories,
        merchants,
        countries,
        currencies,
        groupedCategories,
        getFilteredMerchants,
        fetchFilterOptions // İhtiyaç olursa dışarıdan tetiklemek için
    };
};