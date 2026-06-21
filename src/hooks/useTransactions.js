import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useTransactions = (onSuccess) => {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [quickLoading, setQuickLoading] = useState(false);
    const [manualLoading, setManualLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem('wallet_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const fetchTransactions = useCallback(async (pageNum = 1) => {
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/transactions?PageNumber=${pageNum}&PageSize=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                localStorage.removeItem('wallet_token');
                navigate('/login');
                return;
            }
            const data = await res.json();
            if (pageNum === 1) setTransactions(data.items);
            else setTransactions(prev => [...prev, ...data.items]);

            setHasMore(data.totalCount > pageNum * data.pageSize);
            setPage(pageNum);
        } catch (err) {
            console.error("Harcamalar çekilemedi:", err);
        }
    }, [token, API_BASE, navigate]);

    const addQuickTransaction = async (textToSubmit) => {
        if (!textToSubmit) return { success: false };
        setQuickLoading(true);
        try {
            const res = await fetch(`${API_BASE}/transactions/quick-add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text: textToSubmit })
            });
            if (res.ok) {
                fetchTransactions(1); // Kendi listesini anında tazeler
                if (onSuccess) onSuccess(); // Dashboard'u tazelemek için dışarı sinyal çakar
                return { success: true };
            } else {
                const errData = await res.json();
                alert("Hata: " + (errData.message || "Bilinmeyen hata"));
                return { success: false };
            }
        } catch (err) {
            alert("Sunucuya bağlanılamadı.");
            console.error("Harcama eklenemedi", err);
            return { success: false };
        } finally {
            setQuickLoading(false);
        }
    };

    const addManualTransaction = async (payload) => {
        setManualLoading(true);
        try {
            const res = await fetch(`${API_BASE}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Harcama başarıyla eklendi!");
                fetchTransactions(1);
                if (onSuccess) onSuccess();
                return { success: true };
            } else {
                const errData = await res.json();
                alert("Hata: " + (errData.message || "Ekleme başarısız."));
                return { success: false };
            }
        } catch (err) {
            alert("Sunucuya bağlanılamadı.");
            console.error("Harcama eklenemedi", err);
            return { success: false };
        } finally {
            setManualLoading(false);
        }
    };

    const updateTransaction = async (id, payload) => {
        setEditLoading(true);
        try {
            const res = await fetch(`${API_BASE}/transactions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchTransactions(page); // Mevcut sayfayı koruyarak tazeler
                if (onSuccess) onSuccess();
                return { success: true };
            } else {
                const errData = await res.json();
                alert("Güncelleme başarısız: " + (errData.message || "Bilinmeyen Hata"));
                return { success: false };
            }
        } catch (err) {
            alert("Sunucuya bağlanılamadı.");
            console.error("Harcama güncellenemedi", err);
            return { success: false };
        } finally {
            setEditLoading(false);
        }
    };

    const deleteTransaction = async (id) => {
        const isConfirmed = window.confirm("Bu harcamayı silmek istediğinize emin misiniz?");
        if (!isConfirmed) return { success: false };

        try {
            const res = await fetch(`${API_BASE}/transactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchTransactions(1);
                if (onSuccess) onSuccess();
                return { success: true };
            } else {
                alert("Silme işlemi başarısız oldu.");
                return { success: false };
            }
        } catch (err) {
            alert("Sunucuya bağlanılamadı.");
            console.error("Harcama silinemedi", err);
            return { success: false };
        }
    };

    return {
        transactions, page, hasMore, fetchTransactions,
        quickLoading, addQuickTransaction,
        manualLoading, addManualTransaction,
        editLoading, updateTransaction,
        deleteTransaction
    };
};