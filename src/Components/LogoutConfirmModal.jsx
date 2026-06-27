export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-2xl w-full max-w-sm transform transition-all text-center border border-gray-100 dark:border-slate-800">
        
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
          🚪
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Çıkış Yapıyorsunuz</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          FamilyFinance'ten çıkmak istediğinize emin misiniz?
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition"
          >
            Vazgeç
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_-3px_rgba(220,38,38,0.4)] transition"
          >
            Çıkış
          </button>
        </div>

      </div>
    </div>
  );
}