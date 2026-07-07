"use client";
import React, { useState, useEffect } from 'react';

export default function BugunGidilenlerPage() {
    const [visitedList, setVisitedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Modal Yönetimleri
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null, name: '' });
    const [partialModal, setPartialModal] = useState({ open: false, id: null, name: '', amount: '' });

    // Toast Bildirimleri
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const today = new Date();
    const currentDay = today.getDate();

    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchVisited = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/bugun-gidilenler?gun=${currentDay}`);
            if (!res.ok) throw new Error('API Hatası');
            const data = await res.json();
            setVisitedList(data);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisited();
    }, [currentDay]);

    const handleAction = async (musteriId, actionType, value = null) => {
        try {
            const res = await fetch('/api/islem-yap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ musteriId, actionType, value, currentDay })
            });
            const data = await res.json();

            if (data.success) {
                triggerToast(actionType === 'TAM_ODEME' ? 'Tam bakiye ödemesi kaydedildi!' : 'Kısmi ödeme kaydı işlendi.');
                fetchVisited(); // Ziyaret edilenlerin bakiyelerini yenile
            } else {
                triggerToast('Hata: ' + data.error, 'error');
            }
        } catch (error) {
            triggerToast('İşlem sunucuya iletilemedi!', 'error');
        }
    };

    const formatDateTime = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Sayfa Başlığı */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Ziyaret Edilen Müşteriler</h1>
                    <p className="text-xs text-slate-400 font-medium">Uşak Çözüm Ziyaret ve Tahsilat Geçmişi</p>
                </div>
                <button 
                    onClick={fetchVisited}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2 rounded-xl text-xs transition shadow-2xs active:scale-95 cursor-pointer"
                >
                    🔄 Yenile
                </button>
            </div>

            {/* Özet Dashboard */}
            {!loading && !error && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Toplam Ziyaret Edilen Müşteri Sayısı</h3>
                        <span className="text-2xl font-black text-emerald-700">{visitedList.length} Müşteri</span>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border border-emerald-100">
                        📍
                    </div>
                </div>
            )}

            {/* Durum Kontrolleri */}
            {loading && (
                <div className="bg-white border border-slate-100 p-12 rounded-2xl text-center text-slate-400 text-sm font-medium">
                    Bugünün ziyaret kayıtları veritabanından sorgulanıyor...
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-12 rounded-2xl text-center">
                    <span className="text-rose-500 text-3xl block mb-3">⚠️</span>
                    <h3 className="text-sm font-bold text-rose-800 mb-1">Kayıtlar Yüklenemedi</h3>
                    <p className="text-xs text-rose-600 mb-4">Veritabanı bağlantısında bir sorun oluştu.</p>
                    <button 
                        onClick={fetchVisited} 
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs active:scale-95 transition"
                    >
                        Tekrar Dene
                    </button>
                </div>
            )}

            {/* Veri Listeleme */}
            {!loading && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gidilen Müşteri Kayıtları</h3>
                    </div>

                    {visitedList.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm font-medium">
                            Bugün henüz gidildi olarak işaretlenmiş herhangi bir müşteri bulunmuyor.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 tracking-wider border-b border-slate-100 uppercase">
                                        <th className="py-4 px-6">Müşteri Adı</th>
                                        <th className="py-4 px-6">Ödeme Durumu</th>
                                        <th className="py-4 px-6 text-center">Toplam Ziyaret</th>
                                        <th className="py-4 px-6 text-right">Aylık Ücret</th>
                                        <th className="py-4 px-6 text-right">Kalan Bakiye</th>
                                        <th className="py-4 px-6 text-right">Son Ziyaret Zamanı</th>
                                        <th className="py-4 px-6 text-center">Tahsilat İşlemleri</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {visitedList.map((client) => {
                                        const isPaid = client.durum === 'Ödendi' || Number(client.kalan_bakiye) <= 0;
                                        return (
                                            <tr key={client.id} className="hover:bg-slate-50/50 text-slate-700 transition text-sm">
                                                <td className="py-4 px-6 font-bold text-slate-800">
                                                    {client.isim}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`
                                                        text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border
                                                        ${isPaid 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'}
                                                    `}>
                                                        {client.durum}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center font-bold text-slate-600">
                                                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg text-xs">
                                                        📍 {client.ziyaret_sayisi} Kez
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right font-medium text-slate-500">
                                                    ₺{client.aylik_ucret}
                                                </td>
                                                <td className="py-4 px-6 text-right font-extrabold text-slate-800">
                                                    <span className={Number(client.kalan_bakiye) > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                                                        ₺{client.kalan_bakiye}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right text-emerald-700 font-extrabold text-xs">
                                                    ⏱️ {formatDateTime(client.ziyaret_tarihi)}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {isPaid ? (
                                                        <span className="text-emerald-600 text-xs font-bold flex justify-center items-center gap-1 font-extrabold">
                                                            ✅ Tahsil Edildi
                                                        </span>
                                                    ) : (
                                                        <div className="flex gap-2 justify-center">
                                                            <button 
                                                                onClick={() => setConfirmModal({ open: true, id: client.id, name: client.isim })}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                                                            >
                                                                💵 Tam Al
                                                            </button>
                                                            <button 
                                                                onClick={() => setPartialModal({ open: true, id: client.id, name: client.isim, amount: '' })}
                                                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                                                            >
                                                                🪙 Kısmi
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

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
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition cursor-pointer"
                            >
                                İptal
                            </button>
                            <button 
                                onClick={() => {
                                    handleAction(confirmModal.id, 'TAM_ODEME');
                                    setConfirmModal({ open: false, id: null, name: '' });
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
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
                                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 text-xs font-bold text-slate-600 transition cursor-pointer"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition mb-6"
                        />

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPartialModal({ open: false, id: null, name: '', amount: '' })}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm transition cursor-pointer"
                            >
                                Vazgeç
                            </button>
                            <button 
                                onClick={() => {
                                    if(partialModal.amount && !isNaN(partialModal.amount)) {
                                        // Girilen ödeme miktarının kalan bakiyeyi aşmadığını doğrula
                                        const client = visitedList.find(c => c.id === partialModal.id);
                                        const amountInput = Number(partialModal.amount);
                                        if (client && amountInput > Number(client.kalan_bakiye)) {
                                            alert(`Hata: Girilen tutar (₺${amountInput}) kalan bakiyeden (₺${client.kalan_bakiye}) fazla olamaz.`);
                                            return;
                                        }
                                        handleAction(partialModal.id, 'KISMI_ODEME', partialModal.amount);
                                        setPartialModal({ open: false, id: null, name: '', amount: '' });
                                    } else {
                                        alert("Lütfen geçerli bir tutar girin.");
                                    }
                                }}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
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
