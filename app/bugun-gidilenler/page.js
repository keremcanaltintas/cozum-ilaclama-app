"use client";
import React, { useState, useEffect } from 'react';

export default function BugunGidilenlerPage() {
    const [visitedList, setVisitedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    const today = new Date();
    const currentDay = today.getDate();

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

    const formatTime = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleTimeString('tr-TR', {
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
                    <h1 className="text-xl font-bold text-slate-800">Bugün Gidilen Müşteriler</h1>
                    <p className="text-xs text-slate-400 font-medium">Uşak Çözüm Bugünkü Saha Kayıtları</p>
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
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Bugün Ziyaret Edilen Müşteri Sayısı</h3>
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
                                        <th className="py-4 px-6">Durum</th>
                                        <th className="py-4 px-6 text-right">Aylık Ücret</th>
                                        <th className="py-4 px-6 text-right">Kalan Bakiye</th>
                                        <th className="py-4 px-6 text-right">Ziyaret Saati</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {visitedList.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50/50 text-slate-700 transition text-sm">
                                            <td className="py-4 px-6 font-bold text-slate-800">
                                                {client.isim}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`
                                                    text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border
                                                    ${client.durum === 'Ödendi' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'}
                                                `}>
                                                    {client.durum}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-slate-500">
                                                ₺{client.aylik_ucret}
                                            </td>
                                            <td className="py-4 px-6 text-right font-semibold text-slate-700">
                                                ₺{client.kalan_bakiye}
                                            </td>
                                            <td className="py-4 px-6 text-right text-emerald-700 font-extrabold text-sm">
                                                ⏱️ {formatTime(client.ziyaret_tarihi)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
