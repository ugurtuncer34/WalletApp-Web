import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ProfileModal({ isOpen, onClose }) {
    const [view, setView] = useState('menu'); // 'menu' veya 'password'
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal kapanınca her zaman ana menüye dön
    useEffect(() => {
        if (!isOpen) setView('menu');
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("Yeni şifreler eşleşmiyor!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('wallet_token');
            const response = await fetch(`${API_BASE}/Auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            });

            if (response.ok) {
                alert("Şifre başarıyla değiştirildi!");
                setView('menu');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setError("Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.");
            }
        } catch (err) {
            setError("Sunucu hatası.");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Arka Plan (Sadece açıkken tıklanabilir backdrop) */
        <div className={`fixed inset-0 z-[60] transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose}>
            
            {/* Konumlanmış Menü Kutusu (Sağ üst köşe) */}
            <div 
                className={`fixed top-16 right-4 z-[70] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-72 p-4 transform transition-all duration-300 ease-out origin-top-right ${
                    isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {view === 'menu' ? (
                    /* ANA MENÜ GÖRÜNÜMÜ */
                    <div className="flex flex-col gap-1">
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Hesap</div>
                        <button onClick={() => setView('password')} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 transition">
                            🔑 Şifre Değiştir
                        </button>
                        <hr className="my-2 border-gray-100 dark:border-gray-700" />
                        <button onClick={onClose} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 transition">
                            Kapat
                        </button>
                    </div>
                ) : (
                    /* ŞİFRE DEĞİŞTİRME GÖRÜNÜMÜ */
                    <div className="flex flex-col gap-3">
                        <button onClick={() => setView('menu')} className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-2">← Geri</button>
                        <h3 className="font-bold text-gray-800 dark:text-white">Şifre Değiştir</h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <input type="password" placeholder="Mevcut" required className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border dark:border-gray-700" onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
                            <input type="password" placeholder="Yeni" required className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border dark:border-gray-700" onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
                            <input type="password" placeholder="Yeni (Tekrar)" required className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border dark:border-gray-700" onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
                            {error && <p className="text-red-500 text-[10px]">{error}</p>}
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700">
                                {loading ? '...' : 'Kaydet'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}