'use client';

import { useState, useEffect, useCallback } from 'react';
import MusteriEkleFormu from './MusteriEkleFormu';

export default function Home() {
    const [clients, setClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [connError, setConnError] = useState(false);
    
    // Ziyaret durumunu yerel hafızada tutmak için state
    const [localVisits, setLocalVisits] = useState({});

    // Modal Yönetimleri
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null, name: '' });
    const [partialModal, setPartialModal] = useState({ open: false, id: null, name: '', amount: '' });

    // Toast Bildirimleri
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const today = new Date();
    const currentDay = today.getDate();

    // Tost mesaj gösterici yardımcı fonksiyon
    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Sunucudan müşterileri çekme fonksiyonu
    const fetchClients = useCallback(async () => {
        setLoading(true);
        setConnError(false);
        try {
            const res = await fetch(`/api/bugunun-listesi?gun=${currentDay}`);
            if (!res.ok) throw new Error('Sunucu hatası');
            const data = await res.json();
            setClients(data);
        } catch (error) {
            console.error(error);
            setConnError(true);
            triggerToast('Sunucu bağlantısı kurulamadı!', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentDay]);

    // Sayfa açıldığında verileri ve localstorage hafızasını yükle
    useEffect(() => {
        fetchClients();
        const savedVisits = localStorage.getItem(`visits_day_${currentDay}`);
        if (savedVisits) {
            setLocalVisits(JSON.parse(savedVisits));
        }
    }, [fetchClients, currentDay]);

    // Ortak API istek fonksiyonu
    const handleAction = async (musteriId, actionType, value = null) => {
        try {
            const res = await fetch('/api/islem-yap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ musteriId, actionType, value, currentDay })
            });
            const data = await res.json();

            if (data.success) {
                if (actionType === 'GIDILDI') {
                    const updatedVisits = { ...localVisits, [musteriId]: true };
                    setLocalVisits(updatedVisits);
                    localStorage.setItem(`visits_day_${currentDay}`, JSON.stringify(updatedVisits));
                    triggerToast('Ziyaret başarıyla işaretlendi.');
                } else {
                    triggerToast('Tahsilat kaydı veritabanına işlendi.');
                    fetchClients(); // Bakiyeleri yenile
                }
            } else {
                triggerToast('Hata: ' + data.error, 'error');
            }
        } catch (error) {
            triggerToast('İşlem sunucuya iletilemedi!', 'error');
        }
    };

    // Filtreleme mantığı
    const filteredClients = clients.filter(c => 
        c.isim.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Özet Dashboard Hesaplamaları
    const toplamMusteri = filteredClients.length;
    const ziyaretEdilenler = filteredClients.filter(c => localVisits[c.id]).length;
    const toplamCari = filteredClients.reduce((acc, c) => acc + Number(c.kalan_bakiye), 0);

    const resetVisits = () => {
        if(confirm("Bugünün yerel ziyaret geçmişini sıfırlamak istediğinize emin misiniz?")) {
            setLocalVisits({});
            localStorage.removeItem(`visits_day_${currentDay}`);
            triggerToast('Ziyaret verileri sıfırlandı.');
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-800 pb-12">
            
            {/* Üst Bilgi Barı (Header) */}
            <header className="bg-emerald-800 text-white px-6 py-4 shadow-md sticky top-0 z-40 rounded-b-3xl">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Uşak Çözüm</h1>
                        <p className="text-xs font-medium text-emerald-200 uppercase tracking-widest">Saha Takip Modülü</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={fetchClients} className="p-2 hover:bg-emerald-700 rounded-full transition active:scale-95">
                            🔄
                        </button>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-4 pt-3 border-t border-emerald-700/50 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        📅 Bugün: {currentDay} Temmuz 2026
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                    </span>
                </div>
            </header>

            {/* Ana Gövde Düzeni */}
            <main className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sol Taraf: Kontroller ve Özet */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Arama Modülü */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Müşteri Arama</h3>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Müşteri adı arayın..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition"
                            />
                        </div>
                    </div>

                    {/* Yeni Müşteri Kayıt Formu */}
                    <MusteriEkleFormu 
                        onSuccess={() => {
                            fetchClients();
                            triggerToast('Müşteri başarıyla eklendi!');
                        }}
                        onError={(err) => {
                            triggerToast(err, 'error');
                        }}
                    />

                    {/* Günlük Özet Dashboard */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Günlük Cari Özet</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-50 p-3 rounded-xl">
                                <span className="block text-xs font-medium text-slate-500">MÜŞTERİ</span>
                                <span className="text-xl font-extrabold text-slate-800">{toplamMusteri}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl">
                                <span className="block text-xs font-medium text-slate-500">ZİYARET</span>
                                <span className="text-xl font-extrabold text-emerald-600">{ziyaretEdilenler}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl col-span-1">
                                <span className="block text-xs font-medium text-slate-500">TOPLAM</span>
                                <span className="text-sm font-black text-rose-600 truncate block">₺{toplamCari}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sistem Ayarları */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sistem Ayarları</h3>
                        <button 
                            onClick={resetVisits}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs py-3 rounded-xl transition flex justify-center items-center gap-2"
                        >
                            🔄 Bugünün Ziyaretlerini Sıfırla
                        </button>
                    </div>
                </div>

                {/* Sağ Taraf: İş Planı ve Müşteri Kartları */}
                <div className="lg:col-span-8">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Bugünkü İş Planı</h2>
                    
                    {/* Hata Durumu */}
                    {connError && (
                        <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center space-y-4">
                            <div className="text-rose-500 text-4xl">⚠️</div>
                            <h3 className="text-lg font-bold text-rose-800">Sunucu Bağlantısı Yok</h3>
                            <p className="text-sm text-rose-600 max-w-sm mx-auto">Vercel Postgres env değişkenlerini ve projenin yerel sunucusunu kontrol edin.</p>
                            <button onClick={fetchClients} className="bg-rose-600 text-white font-semibold px-6 py-2 rounded-xl text-sm active:scale-95 transition">Tekrar Dene</button>
                        </div>
                    )}

                    {/* Yükleniyor Durumu */}
                    {loading && !connError && (
                        <div className="text-center p-12 text-slate-400 font-medium text-sm">Veritabanına güvenli bulut bağlantısı kuruluyor...</div>
                    )}

                    {/* Veri Listeleme */}
                    {!loading && !connError && filteredClients.length === 0 && (
                        <div className="bg-white border border-slate-100 p-12 rounded-2xl text-center text-slate-400 text-sm font-medium">
                            Bugün için planlanmış herhangi bir ilaçlama kaydı bulunmuyor.
                        </div>
                    )}

                    {!loading && !connError && filteredClients.map(client => {
                        const isVisited = localVisits[client.id];
                        return (
                            <div 
                                key={client.id}
                                className={`bg-white rounded-2xl shadow-sm border mb-4 p-5 transition relative overflow-hidden ${isVisited ? 'border-l-4 border-l-emerald-500 border-slate-200/60 opacity-75' : 'border-slate-100'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            {client.isim}
                                            {isVisited && <span className="text-emerald-500 text-sm">✓</span>}
                                        </h3>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${client.durum === 'Ödendi' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {client.durum}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 block font-medium">Kalan Bakiye</span>
                                        <span className="text-base font-black text-emerald-700">₺{client.kalan_bakiye}</span>
                                    </div>
                                </div>

                                {/* İşlem Butonları */}
                                <div className="mt-4 space-y-2">
                                    <button 
                                        disabled={isVisited}
                                        onClick={() => handleAction(client.id, 'GIDILDI')}
                                        className={`w-full font-bold text-sm py-3 rounded-xl transition flex justify-center items-center gap-2 ${isVisited ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed' : 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100'}`}
                                    >
                                        {isVisited ? '✓ Gidildi Olarak İşaretlendi' : '📍 Gidildi Olarak İşaretle'}
                                    </button>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => setConfirmModal({ open: true, id: client.id, name: client.isim })}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition active:scale-[0.98]"
                                        >
                                            💵 Tamamını Aldım
                                        </button>
                                        <button 
                                            onClick={() => setPartialModal({ open: true, id: client.id, name: client.isim, amount: '' })}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-3 rounded-xl transition active:scale-[0.98]"
                                        >
                                            🪙 Kısmi Ödeme
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* --- MODAL 1: TAM ÖDEME ONAYI --- */}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Tam Tahsilat Teyidi</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            <strong className="text-slate-700">{confirmModal.name}</strong> isimli müşterinin tüm bakiyesi ödendi olarak işaretlenecektir. Onaylıyor musunuz?
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setConfirmModal({ open: false, id: null, name: '' })}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition"
                            >
                                İptal
                            </button>
                            <button 
                                onClick={() => {
                                    handleAction(confirmModal.id, 'TAM_ODEME');
                                    setConfirmModal({ open: false, id: null, name: '' });
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition"
                            >
                                Evet, Aldım
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: KISMİ ÖDEME PANELİ --- */}
            {partialModal.open && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Kısmi Tahsilat Girişi</h3>
                        <p className="text-xs text-slate-400 mb-4">{partialModal.name}</p>
                        
                        {/* Hızlı Tutar Butonları */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {[100, 250, 500].map(val => (
                                <button 
                                    key={val}
                                    type="button"
                                    onClick={() => setPartialModal({ ...partialModal, amount: val.toString() })}
                                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 text-xs font-bold text-slate-600 transition"
                                >
                                    ₺{val}
                                </button>
                            ))}
                        </div>

                        <input 
                            type="number" 
                            placeholder="Alınan tutarı girin (₺)" 
                            value={partialModal.amount}
                            onChange={(e) => setPartialModal({ ...partialModal, amount: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-amber-500 transition mb-6"
                        />

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPartialModal({ open: false, id: null, name: '', amount: '' })}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition"
                            >
                                Vazgeç
                            </button>
                            <button 
                                onClick={() => {
                                    if(partialModal.amount && !isNaN(partialModal.amount)) {
                                        handleAction(partialModal.id, 'KISMI_ODEME', partialModal.amount);
                                        setPartialModal({ open: false, id: null, name: '', amount: '' });
                                    } else {
                                        alert("Lütfen geçerli bir tutar girin.");
                                    }
                                }}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- GLOBAL TOAST BİLDİRİM BALONU --- */}
            {toast.show && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className={`px-5 py-3 rounded-xl shadow-lg font-bold text-sm text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'}`}>
                        {toast.message}
                    </div>
                </div>
            )}

        </div>
    );
}
