import { useState, useCallback } from 'react';

export const useCrypto = () => {
    const [portfolio, setPortfolio] = useState({ holdings: [], totalPortfolioValueUsd: 0 });
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const token = localStorage.getItem('wallet_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    // 1. Cüzdanı Getir
    const fetchPortfolio = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/crypto`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPortfolio(data);
            }
        } catch (err) {
            console.error("Kripto verileri çekilemedi:", err);
        } finally {
            setLoading(false);
        }
    }, [token, API_BASE]);

    // 2. Coin Ekle / Güncelle
    const addOrUpdateCrypto = async (coinCode, amount) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE}/crypto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ coinCode, amount: parseFloat(amount) })
            });

            if (res.ok) {
                await fetchPortfolio(); // Başarılıysa listeyi tazele
                return { success: true };
            } else {
                const err = await res.json();
                return { success: false, message: err.message || "Bilinmeyen hata" };
            }
        } catch (err) {
            console.error("Kripto eklenemedi:", err);
            return { success: false, message: "Sunucu hatası" };
        } finally {
            setActionLoading(false);
        }
    };

    // 3. Coin Sil
    const deleteCrypto = async (id) => {
        if (!window.confirm("Bu varlığı portföyden silmek istediğinize emin misiniz?")) return { cancelled: true };
        
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE}/crypto/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchPortfolio(); // Başarılıysa listeyi tazele
                return { success: true };
            }
            return { success: false, message: "Silme işlemi başarısız" };
        } catch (err) {
            console.error("Kripto silinemedi:", err);
            return { success: false, message: "Sunucu hatası" };
        } finally {
            setActionLoading(false);
        }
    };

    return {
        portfolio,
        loading,
        actionLoading,
        fetchPortfolio,
        addOrUpdateCrypto,
        deleteCrypto
    };
};