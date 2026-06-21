import { useState, useEffect } from 'react';

export const useDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [dashboardMonth, setDashboardMonth] = useState(new Date().getMonth() + 1);
    const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear());

    const token = localStorage.getItem('wallet_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const fetchDashboard = async (m = dashboardMonth, y = dashboardYear) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE}/dashboard?month=${m}&year=${y}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setDashboard(await res.json());
        } catch (err) {
            console.error("Dashboard çekilemedi:", err);
        }
    };

    useEffect(() => {
        fetchDashboard(dashboardMonth, dashboardYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, dashboardMonth, dashboardYear]);

    return {
        dashboard,
        dashboardMonth,
        setDashboardMonth,
        dashboardYear,
        setDashboardYear,
        fetchDashboard // Ekleme/Silme sonrası manuel tetiklemek için
    };
};