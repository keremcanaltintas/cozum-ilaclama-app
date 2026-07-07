"use client";
import React, { useState } from 'react';

export default function MusteriEkleFormu({ onSuccess, onError }) {
    const [isim, setIsim] = useState('');
    const [ucret, setUcret] = useState('');
    const [gun, setGun] = useState('1');
    const [yukleniyor, setYukleniyor] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setYukleniyor(true);

        try {
            const response = await fetch('/api/musteri-ekle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isim, aylik_ucret: ucret, planlanan_gun: gun })
            });

            if (response.ok) {
                setIsim('');
                setUcret('');
                setGun('1');
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                const data = await response.json();
                if (onError) {
                    onError(data.hata);
                }
            }
        } catch (error) {
            if (onError) {
                onError("Sistem hatası oluştu.");
            }
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 animate-in fade-in slide-in-from-top-4 duration-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Yeni Müşteri Kaydı</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Müşteri Adı / Unvanı</label>
                    <input 
                        type="text" 
                        value={isim}
                        onChange={(e) => setIsim(e.target.value)}
                        placeholder="Örn: Kebapçı Selami" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Aylık Ücret (₺)</label>
                        <input 
                            type="number" 
                            value={ucret}
                            onChange={(e) => setUcret(e.target.value)}
                            placeholder="1500" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hizmet Günü</label>
                        <select 
                            value={gun}
                            onChange={(e) => setGun(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition bg-white"
                        >
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}. Gün</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button 
                    type="submit" 
                    disabled={yukleniyor}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {yukleniyor ? "Kaydediliyor..." : "Müşteriyi Sisteme Ekle"}
                </button>
            </form>
        </div>
    );
}
