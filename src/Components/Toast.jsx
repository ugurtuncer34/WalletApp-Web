import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        if (!message) return;
        
        // 3 saniye sonra bildirimi otomatik kapat
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed z-[200] animate-fadeIn 
                        bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 
                        lg:top-auto lg:bottom-10 lg:left-auto lg:right-10 lg:translate-x-0">
            
            <div className={`flex items-center gap-3.5 px-6 py-4 lg:px-6 lg:py-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border backdrop-blur-xl text-sm lg:text-base font-bold transition-all whitespace-nowrap ${
                isSuccess 
                ? 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border-emerald-500/30' 
                : 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border-red-500/30'
            }`}>
                
                <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full ${
                    isSuccess ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                }`}>
                    <span className="text-lg lg:text-xl">{isSuccess ? '✓' : '✕'}</span>
                </div>
                
                {message}
                
            </div>
        </div>
    );
}