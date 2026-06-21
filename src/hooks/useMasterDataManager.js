import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useMasterDataManager = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem('wallet_token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const fetchMasterData = useCallback(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        fetch(`${API_BASE}/admin/master-data`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem('wallet_token');
                    navigate('/login');
                    throw new Error('Yetkisiz erişim');
                }
                return res.json();
            })
            .then((resData) => {
                setData(resData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Veri çekme hatası:", err);
                setLoading(false);
            });
    }, [token, navigate, API_BASE]);

    useEffect(() => {
        fetchMasterData();
    }, [fetchMasterData]);

    return { data, loading, fetchMasterData, token };
};