"use client";
import React, { useState } from 'react';

export default function MusteriEklePage() {
    const [isim, setIsim] = useState('');
    const [ucret, setUcret] = useState('');
    const [ziyaretGunleri, setZiyaretGunleri] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const toggleGun = (gun) => {
        if (ziyaretGunleri.includes(gun)) {
            setZiyaretGunleri(ziyaretGunleri.filter(g => g !== gun));
        } else {
            setZiyaretGunleri([...ziyaretGunleri, gun].sort((a, b) => a - b));
        }
    };

    const selectPreset = (type) => {
        if (type === 'ALL') {
            setZiyaretGunleri(Array.from({ length: 31 }, (_, i) => i + 1));
        } else if (type === 'CLEAR') {
            setZiyaretGunleri([]);
        } else if (type === 'TEK') {
            setZiyaretGunleri(Array.from({ length: 31 }, (_, i) => i + 1).filter(g => g % 2 !== 0));
        } else if (type === 'CIFT') {
            setZiyaretGunleri(Array.from({ length: 31 }, (_, i) => i + 1).filter(g => g % 2 === 0));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (ziyaretGunleri.length === 0) {
            triggerToast('Lütfen en az bir hizmet günü seçin!', 'error');
            return;
        }

        setYukleniyor(true);

        try {
            const response = await fetch('/api/musteri-ekle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    isim, 
                    aylik_ucret: ucret, 
                    ziyaret_gunleri: ziyaretGunleri 
                })
            });

            const data = await response.json();

            if (response.ok) {
                triggerToast("Müşteri başarıyla sisteme kaydedildi!");
                setIsim('');
                setUcret('');
                setZiyaretGunleri([]);
            } else {
                triggerToast("Hata: " + data.hata, "error");
            }
        } catch (error) {
            triggerToast("Sistem hatası oluştu.", "error");
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Sayfa Başlığı */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800">Yeni Müşteri Kaydı</h1>
                <p className="text-xs text-slate-400 font-medium">Uşak Çözüm İlaçlama Takip Modülü</p>
            </div>

            {/* Form Kartı */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Müşteri İsmi */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Müşteri Adı / Ünvanı</label>
                        <input 
                            type="text" 
                            value={isim}
                            onChange={(e) => setIsim(e.target.value)}
                            placeholder="Örn: Kebapçı Selami" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition"
                            required
                        />
                    </div>

                    {/* Ücret Girişi */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aylık Hizmet Ücreti (₺)</label>
                        <input 
                            type="number" 
                            value={ucret}
                            onChange={(e) => setUcret(e.target.value)}
                            placeholder="Örn: 1500" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-emerald-500 transition"
                            required
                        />
                    </div>

                    {/* Gün Seçimi */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Hizmet Verilecek Günler</label>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                                {ziyaretGunleri.length} Gün Seçildi
                            </span>
                        </div>

                        {/* Hızlı Seçim Butonları */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <button 
                                type="button" 
                                onClick={() => selectPreset('ALL')}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                                Hepsini Seç
                            </button>
                            <button 
                                type="button" 
                                onClick={() => selectPreset('TEK')}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                                Tek Günler
                            </button>
                            <button 
                                type="button" 
                                onClick={() => selectPreset('CIFT')}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                                Çift Günler
                            </button>
                            <button 
                                type="button" 
                                onClick={() => selectPreset('CLEAR')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-rose-100 transition cursor-pointer"
                            >
                                Seçimleri Temizle
                            </button>
                        </div>

                        {/* Gün Butonları Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((gun) => {
                                const isSelected = ziyaretGunleri.includes(gun);
                                return (
                                    <button
                                        key={gun}
                                        type="button"
                                        onClick={() => toggleGun(gun)}
                                        className={`
                                            aspect-square rounded-xl text-xs font-bold transition flex items-center justify-center border cursor-pointer
                                            ${isSelected 
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-95' 
                                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'}
                                        `}
                                    >
                                        {gun}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Butonu */}
                    <button 
                        type="submit" 
                        disabled={yukleniyor}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl transition active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                    >
                        {yukleniyor ? "Kaydediliyor..." : "Müşteriyi Kaydet ve Günleri Planla"}
                    </button>
                </form>
            </div>

            {/* Toast Bildirimi */}
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
