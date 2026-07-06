import { useState, useEffect } from 'react';

export const useDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [dashboardMonth, setDashboardMonth] = useState(new Date().getMonth() + 1);
    const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear());
    
    // Filtre state'leri (Boş string = Tümü)
    const [selectedUserId, setSelectedUserId] = useState(""); 
    const [selectedCurrencyId, setSelectedCurrencyId] = useState(""); 

    const token = localStorage.getItem('wallet_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const fetchDashboard = async (m = dashboardMonth, y = dashboardYear, uid = selectedUserId, cid = selectedCurrencyId) => {
        if (!token) return;
        try {
            let url = `${API_BASE}/dashboard?month=${m}&year=${y}`;
            if (uid) url += `&userId=${uid}`;
            if (cid) url += `&currencyId=${cid}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setDashboard(await res.json());
        } catch (err) {
            console.error("Dashboard çekilemedi:", err);
        }
    };

    useEffect(() => {
        fetchDashboard(dashboardMonth, dashboardYear, selectedUserId, selectedCurrencyId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, dashboardMonth, dashboardYear, selectedUserId, selectedCurrencyId]);

    return {
        dashboard,
        dashboardMonth, setDashboardMonth,
        dashboardYear, setDashboardYear,
        selectedUserId, setSelectedUserId,
        selectedCurrencyId, setSelectedCurrencyId,
        fetchDashboard
    };
};