"use client";
import React, { useState, useEffect } from 'react';

export default function OdemelerPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchOdemeler = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/api/raporlar');
            if (!res.ok) throw new Error('API Hatası');
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOdemeler();
    }, []);

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Sayfa Başlığı */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Ödemeler Paneli</h1>
                    <p className="text-xs text-slate-400 font-medium">Uşak Çözüm Tahsilat Geçmişi</p>
                </div>
                <button 
                    onClick={fetchOdemeler}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2 rounded-xl text-xs transition shadow-2xs active:scale-95 cursor-pointer"
                >
                    🔄 Yenile
                </button>
            </div>

            {/* Durum Kontrolleri */}
            {loading && (
                <div className="bg-white border border-slate-100 p-12 rounded-2xl text-center text-slate-400 text-sm font-medium">
                    Tahsilat geçmişi güvenli veritabanından yükleniyor...
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-12 rounded-2xl text-center">
                    <span className="text-rose-500 text-3xl block mb-3">⚠️</span>
                    <h3 className="text-sm font-bold text-rose-800 mb-1">Veriler Yüklenemedi</h3>
                    <p className="text-xs text-rose-600 mb-4">Veritabanı bağlantısında bir sorun oluştu.</p>
                    <button 
                        onClick={fetchOdemeler} 
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs active:scale-95 transition"
                    >
                        Tekrar Dene
                    </button>
                </div>
            )}

            {/* Veri Listeleme */}
            {!loading && !error && data && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tahsilat Log Kayıtları</h3>
                    </div>

                    {data.odemelerListesi.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm font-medium">
                            Sistemde henüz kayıtlı bir tahsilat işlemi bulunmuyor.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                                        <th className="py-4 px-6">Müşteri Adı</th>
                                        <th className="py-4 px-6">Ödeme Tipi</th>
                                        <th className="py-4 px-6 text-right">Ödenen Miktar</th>
                                        <th className="py-4 px-6 text-right">Önceki Bakiye</th>
                                        <th className="py-4 px-6 text-right">Kalan Bakiye</th>
                                        <th className="py-4 px-6 text-right">İşlem Tarihi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.odemelerListesi.map((ode) => (
                                        <tr key={ode.id} className="hover:bg-slate-50/50 text-slate-700 transition whitespace-nowrap">
                                            <td className="py-4 px-6 font-bold text-slate-800 text-sm">
                                                {ode.musteri_isim}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`
                                                    text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border
                                                    ${ode.odeme_tipi === 'TAM' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'}
                                                `}>
                                                    {ode.odeme_tipi === 'TAM' ? 'Tam Ödeme' : 'Kısmi Ödeme'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-extrabold text-emerald-700 text-sm">
                                                ₺{ode.odenen_miktar}
                                            </td>
                                            <td className="py-4 px-6 text-right text-slate-500 text-xs">
                                                ₺{ode.bekleyen_miktar}
                                            </td>
                                            <td className="py-4 px-6 text-right text-slate-700 font-semibold text-xs">
                                                ₺{ode.kalan_miktar}
                                            </td>
                                            <td className="py-4 px-6 text-right text-slate-400 text-xs font-medium">
                                                {formatDate(ode.tarih)}
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
