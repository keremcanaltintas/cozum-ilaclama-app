"use client";
import React, { useState, useEffect } from 'react';

export default function MusterilerPage() {
    const [clients, setClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'BEKLEYEN', 'ODENDI'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchClients = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/api/musteriler');
            if (!res.ok) throw new Error('API Hatası');
            const data = await res.json();
            setClients(data);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Filtreleme mantığı
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.isim.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesStatus = true;
        if (statusFilter === 'BEKLEYEN') {
            matchesStatus = client.durum !== 'Ödendi';
        } else if (statusFilter === 'ODENDI') {
            matchesStatus = client.durum === 'Ödendi';
        }

        return matchesSearch && matchesStatus;
    });

    const renderGunler = (client) => {
        if (client.ziyaret_gunleri && Array.isArray(client.ziyaret_gunleri)) {
            return client.ziyaret_gunleri.map(g => `${g}. Gün`).join(', ');
        } else if (client.planlanan_gun) {
            return `${client.planlanan_gun}. Gün`;
        }
        return '-';
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Sayfa Başlığı */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Müşteriler Rehberi</h1>
                    <p className="text-xs text-slate-400 font-medium">Uşak Çözüm Müşteri Portföyü</p>
                </div>
                <button 
                    onClick={fetchClients}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2 rounded-xl text-xs transition shadow-2xs active:scale-95 cursor-pointer"
                >
                    🔄 Yenile
                </button>
            </div>

            {/* Arama ve Filtreleme Modülü */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Canlı Arama Girişi */}
                <div className="flex-1 max-w-md">
                    <input 
                        type="text" 
                        placeholder="Müşteri adı arayın..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>

                {/* Sekme Filtreleri */}
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100 self-start md:self-auto">
                    <button 
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Tümü
                    </button>
                    <button 
                        onClick={() => setStatusFilter('BEKLEYEN')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'BEKLEYEN' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Ödeme Bekleyenler
                    </button>
                    <button 
                        onClick={() => setStatusFilter('ODENDI')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'ODENDI' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Ödenenler
                    </button>
                </div>
            </div>

            {/* Yükleniyor Durumu */}
            {loading && (
                <div className="bg-white border border-slate-100 p-12 rounded-2xl text-center text-slate-400 text-sm font-medium">
                    Müşteri listesi veritabanından çekiliyor...
                </div>
            )}

            {/* Hata Durumu */}
            {error && (
                <div className="bg-rose-50 border border-rose-100 p-12 rounded-2xl text-center">
                    <span className="text-rose-500 text-3xl block mb-3">⚠️</span>
                    <h3 className="text-sm font-bold text-rose-800 mb-1">Veriler Yüklenemedi</h3>
                    <p className="text-xs text-rose-600 mb-4">Veritabanı bağlantısında bir sorun oluştu.</p>
                    <button 
                        onClick={fetchClients} 
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs active:scale-95 transition"
                    >
                        Tekrar Dene
                    </button>
                </div>
            )}

            {/* Veri Listeleme */}
            {!loading && !error && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {filteredClients.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm font-medium">
                            Kriterlere uygun herhangi bir müşteri kaydı bulunamadı.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                                        <th className="py-4 px-6">Müşteri Adı / Ünvanı</th>
                                        <th className="py-4 px-6">Ziyaret Günleri</th>
                                        <th className="py-4 px-6 text-right">Aylık Ücret</th>
                                        <th className="py-4 px-6 text-right">Kalan Bakiye</th>
                                        <th className="py-4 px-6 text-right">Ödeme Durumu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50/50 transition whitespace-nowrap">
                                            <td className="py-4 px-6 font-bold text-slate-800">
                                                {client.isim}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-slate-500 text-xs">
                                                <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg inline-block">
                                                    {renderGunler(client)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-slate-500">
                                                ₺{client.aylik_ucret}
                                            </td>
                                            <td className="py-4 px-6 text-right font-extrabold text-slate-900">
                                                <span className={Number(client.kalan_bakiye) > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                                                    ₺{client.kalan_bakiye}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`
                                                    text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border
                                                    ${client.durum === 'Ödendi' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'}
                                                `}>
                                                    {client.durum}
                                                </span>
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
