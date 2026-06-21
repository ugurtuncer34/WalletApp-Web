// Arayüzdeki genel tarih gösterimi (Örn: 21 Haziran, 14:30)
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Grafiklerdeki eksen tarihleri (Örn: 21 Haz)
export const formatChartDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
    });
};

// HTML <input type="datetime-local"> elementine uygun formata çevirme
export const getLocalDatetimeForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};