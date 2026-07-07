"use client";
import React, { useState, useEffect } from 'react';

export default function RaporlarPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState('TAHSILAT'); // 'TAHSILAT', 'ALACAK', 'SAYI'

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
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Sayfa Başlığı */}
            <div className="flex justify-between items-center">
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
                <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Özet Kartları Grid (Liquid Glass Efektli & Seçilebilir) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Kart 1: Toplam Tahsilat */}
                        <div 
                            onClick={() => setActiveTab('TAHSILAT')}
                            className={`backdrop-blur-md p-6 rounded-2xl border transition duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-between shadow-xs
                                ${activeTab === 'TAHSILAT' 
                                    ? 'bg-emerald-500/10 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                                    : 'bg-white/60 border-white/20 hover:border-slate-300'}`}
                        >
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Toplam Tahsilat</span>
                                <span className="text-2xl font-black text-emerald-700">₺{data.toplamTahsilat}</span>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border transition-colors
                                ${activeTab === 'TAHSILAT' 
                                    ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30' 
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                💵
                            </div>
                        </div>

                        {/* Kart 2: Toplam Bekleyen Alacak */}
                        <div 
                            onClick={() => setActiveTab('ALACAK')}
                            className={`backdrop-blur-md p-6 rounded-2xl border transition duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-between shadow-xs
                                ${activeTab === 'ALACAK' 
                                    ? 'bg-rose-500/10 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]' 
                                    : 'bg-white/60 border-white/20 hover:border-slate-300'}`}
                        >
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Bekleyen Alacak</span>
                                <span className="text-2xl font-black text-rose-600">₺{data.toplamBekleyen}</span>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border transition-colors
                                ${activeTab === 'ALACAK' 
                                    ? 'bg-rose-500/20 text-rose-700 border-rose-500/30' 
                                    : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                ⏳
                            </div>
                        </div>

                        {/* Kart 3: Tahsilat İşlem Sayısı */}
                        <div 
                            onClick={() => setActiveTab('SAYI')}
                            className={`backdrop-blur-md p-6 rounded-2xl border transition duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-between shadow-xs
                                ${activeTab === 'SAYI' 
                                    ? 'bg-blue-500/10 border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                                    : 'bg-white/60 border-white/20 hover:border-slate-300'}`}
                        >
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tahsilat Sayısı</span>
                                <span className="text-2xl font-black text-slate-800">{data.tahsilatSayisi} Adet</span>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border transition-colors
                                ${activeTab === 'SAYI' 
                                    ? 'bg-blue-500/20 text-blue-700 border-blue-500/30' 
                                    : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
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

                    {/* Seçilen KPI'ye Göre Alt Detay Tablosu */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {activeTab === 'TAHSILAT' && "Gerçekleşen Tahsilatlar Detay Listesi"}
                                {activeTab === 'ALACAK' && "Ödeme Bekleyen Alacaklar (Müşteri Detayları)"}
                                {activeTab === 'SAYI' && "Tahsilat Analizi ve İşlem Dağılımı"}
                            </h3>
                            <span className="text-[10px] bg-slate-200/60 text-slate-600 px-2.5 py-1 rounded-lg font-bold">
                                {activeTab === 'TAHSILAT' && `${data.odemelerListesi.length} Kayıt`}
                                {activeTab === 'ALACAK' && `${data.bekleyenlerListesi.length} Müşteri`}
                                {activeTab === 'SAYI' && `${data.tahsilatSayisi} Tahsilat`}
                            </span>
                        </div>

                        {activeTab === 'TAHSILAT' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/20 text-[10px] font-bold text-slate-400 tracking-wider border-b border-slate-100 uppercase whitespace-nowrap">
                                            <th className="py-4 px-6">Müşteri Adı</th>
                                            <th className="py-4 px-6">Ödeme Tipi</th>
                                            <th className="py-4 px-6 text-right">Ödenen Miktar</th>
                                            <th className="py-4 px-6 text-right">Önceki Bakiye</th>
                                            <th className="py-4 px-6 text-right">Kalan Bakiye</th>
                                            <th className="py-4 px-6 text-right">İşlem Tarihi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                                        {data.odemelerListesi.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">Henüz tahsilat kaydı bulunmamaktadır.</td>
                                            </tr>
                                        ) : (
                                            data.odemelerListesi.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50/50 transition whitespace-nowrap">
                                                    <td className="py-4 px-6 font-bold text-slate-800">{log.musteri_isim}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${log.odeme_tipi === 'TAM' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                            {log.odeme_tipi === 'TAM' ? 'Tam Ödeme' : 'Kısmi Ödeme'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-emerald-700 font-extrabold">₺{log.odenen_miktar}</td>
                                                    <td className="py-4 px-6 text-right font-medium text-slate-400">₺{log.bekleyen_miktar}</td>
                                                    <td className="py-4 px-6 text-right font-bold text-slate-700">₺{log.kalan_miktar}</td>
                                                    <td className="py-4 px-6 text-right text-slate-400 text-xs font-semibold">{formatDateTime(log.tarih)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'ALACAK' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/20 text-[10px] font-bold text-slate-400 tracking-wider border-b border-slate-100 uppercase whitespace-nowrap">
                                            <th className="py-4 px-6">Müşteri Adı</th>
                                            <th className="py-4 px-6">Hizmet Ücreti</th>
                                            <th className="py-4 px-6 text-right">Bekleyen Borç Tutarı</th>
                                            <th className="py-4 px-6 text-right">Ödeme Durumu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                                        {data.bekleyenlerListesi.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">Tüm alacaklar tahsil edilmiş! Harika.</td>
                                            </tr>
                                        ) : (
                                            data.bekleyenlerListesi.map((client) => (
                                                <tr key={client.id} className="hover:bg-slate-50/50 transition whitespace-nowrap">
                                                    <td className="py-4 px-6 font-bold text-slate-800">{client.isim}</td>
                                                    <td className="py-4 px-6 font-medium text-slate-400">₺{client.aylik_ucret}</td>
                                                    <td className="py-4 px-6 text-right text-rose-600 font-extrabold text-base">₺{client.kalan_bakiye}</td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-amber-50 text-amber-600 border-amber-100">
                                                            {client.durum}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'SAYI' && (
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tam Kapatılan Tahsilatlar</span>
                                        <span className="text-xl font-bold text-emerald-700">{data.odemelerListesi.filter(o => o.odeme_tipi === 'TAM').length} Adet</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kısmi Alınan Tahsilatlar</span>
                                        <span className="text-xl font-bold text-amber-600">{data.odemelerListesi.filter(o => o.odeme_tipi === 'KISMI').length} Adet</span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ortalama Tahsilat Miktarı</span>
                                        <span className="text-xl font-bold text-slate-700">
                                            ₺{data.tahsilatSayisi > 0 ? Math.round(data.toplamTahsilat / data.tahsilatSayisi) : 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Son Yapılan Tahsilat Kayıtları</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/10 text-[10px] font-bold text-slate-400 tracking-wider border-b border-slate-100 uppercase whitespace-nowrap">
                                                    <th className="py-4 px-6">Müşteri Adı</th>
                                                    <th className="py-4 px-6">Ödeme Tipi</th>
                                                    <th className="py-4 px-6 text-right">Ödenen Miktar</th>
                                                    <th className="py-4 px-6 text-right">Tarih</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                                                {data.odemelerListesi.slice(0, 5).map((log) => (
                                                    <tr key={log.id} className="hover:bg-slate-50/50 transition whitespace-nowrap">
                                                        <td className="py-4 px-6 font-bold text-slate-800">{log.musteri_isim}</td>
                                                        <td className="py-4 px-6">
                                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${log.odeme_tipi === 'TAM' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                                {log.odeme_tipi === 'TAM' ? 'Tam' : 'Kısmi'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right text-emerald-700 font-bold">₺{log.odenen_miktar}</td>
                                                        <td className="py-4 px-6 text-right text-slate-400 text-xs font-semibold">{formatDateTime(log.tarih)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
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
