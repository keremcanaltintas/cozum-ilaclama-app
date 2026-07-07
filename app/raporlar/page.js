"use client";
import React, { useState, useEffect } from 'react';

export default function RaporlarPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchRaporlar = async () => {
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
        fetchRaporlar();
    }, []);

    const collectionRatio = data && (data.toplamTahsilat + data.toplamBekleyen > 0)
        ? Math.round((data.toplamTahsilat / (data.toplamTahsilat + data.toplamBekleyen)) * 100)
        : 0;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Sayfa Başlığı */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Aylık Raporlar</h1>
                    <p className="text-xs text-slate-400 font-medium">Uşak Çözüm Finansal Analiz ve Analitikler</p>
                </div>
                <button 
                    onClick={fetchRaporlar}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2 rounded-xl text-xs transition shadow-2xs active:scale-95 cursor-pointer"
                >
                    🔄 Yenile
                </button>
            </div>

            {/* Durum Kontrolleri */}
            {loading && (
                <div className="bg-white border border-slate-100 p-12 rounded-2xl text-center text-slate-400 text-sm font-medium">
                    Analiz ve rapor verileri hazırlanıyor...
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-12 rounded-2xl text-center">
                    <span className="text-rose-500 text-3xl block mb-3">⚠️</span>
                    <h3 className="text-sm font-bold text-rose-800 mb-1">Rapor Yüklenemedi</h3>
                    <p className="text-xs text-rose-600 mb-4">Veritabanı bağlantısında bir sorun oluştu.</p>
                    <button 
                        onClick={fetchRaporlar} 
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs active:scale-95 transition"
                    >
                        Tekrar Dene
                    </button>
                </div>
            )}

            {/* Rapor Verileri */}
            {!loading && !error && data && (
                <div className="space-y-6">
                    
                    {/* Özet Kartları Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Kart 1: Toplam Tahsilat */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Toplam Tahsilat</span>
                                <span className="text-2xl font-black text-emerald-700">₺{data.toplamTahsilat}</span>
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border border-emerald-100">
                                💵
                            </div>
                        </div>

                        {/* Kart 2: Toplam Bekleyen Alacak */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Bekleyen Alacak</span>
                                <span className="text-2xl font-black text-rose-600">₺{data.toplamBekleyen}</span>
                            </div>
                            <div className="bg-rose-50 text-rose-600 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border border-rose-100">
                                ⏳
                            </div>
                        </div>

                        {/* Kart 3: Tahsilat İşlem Sayısı */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tahsilat Sayısı</span>
                                <span className="text-2xl font-black text-slate-800">{data.tahsilatSayisi} Adet</span>
                            </div>
                            <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border border-blue-100">
                                🧾
                            </div>
                        </div>
                    </div>

                    {/* Tahsilat Oranı İlerleme Kartı */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Tahsilat Performans Oranı</h3>
                                <p className="text-[10px] text-slate-400 font-medium">Toplam ciro içindeki tahsil edilmiş oran</p>
                            </div>
                            <span className="text-lg font-black text-emerald-700">%{collectionRatio}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                            <div 
                                className="bg-emerald-600 h-full rounded-full transition-all duration-500 shadow-xs"
                                style={{ width: `${collectionRatio}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-slate-400">
                            <span>ÖDENEN: ₺{data.toplamTahsilat}</span>
                            <span>TOPLAM CİRO: ₺{data.toplamTahsilat + data.toplamBekleyen}</span>
                        </div>
                    </div>

                    {/* Finansal Analiz Özet Notu */}
                    <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-sm border border-emerald-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-bold mb-1">Genel Saha Finans Durumu</h4>
                            <p className="text-xs text-emerald-200 font-medium max-w-xl">
                                Uşak Çözüm saha takip modülünde şu ana kadar toplam <strong>{data.tahsilatSayisi} adet</strong> tahsilat işlemi başarıyla tamamlanmıştır. Toplam bekleyen alacak bakiyeniz <strong>₺{data.toplamBekleyen}</strong> olup, tahsilatlarınızı bu ekrandan takip edebilirsiniz.
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
