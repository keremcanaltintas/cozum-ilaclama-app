"use client";
import React, { useState } from 'react';

const GUN_ISIMLERI = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'];
const AY_ISIMLERI = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export default function MusteriEklePage() {
    const [isim, setIsim] = useState('');
    const [ucret, setUcret] = useState('');
    const [ziyaretGunleri, setZiyaretGunleri] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Takvim navigasyonu
    const now = new Date();
    const [calYear, setCalYear] = useState(now.getFullYear());
    const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed

    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Takvim Hesaplamaları
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDayOfWeek = (() => {
        // getDay: 0=Pazar, 1=Pazartesi... Biz Pazartesi=0 istiyoruz
        const d = new Date(calYear, calMonth, 1).getDay();
        return d === 0 ? 6 : d - 1; // Pazartesi bazlı
    })();

    const todayDate = now.getDate();
    const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

    // Önceki ayın son günleri (boşluk doldurmak için)
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

    // Takvim grid'i oluştur (6 satır x 7 sütun = 42 hücre)
    const calendarCells = [];
    // Önceki ay günleri
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        calendarCells.push({ day: prevMonthDays - i, isCurrentMonth: false, isPrev: true });
    }
    // Bu ayın günleri
    for (let d = 1; d <= daysInMonth; d++) {
        calendarCells.push({ day: d, isCurrentMonth: true, isPrev: false });
    }
    // Sonraki ay günleri
    const remaining = 42 - calendarCells.length;
    for (let d = 1; d <= remaining; d++) {
        calendarCells.push({ day: d, isCurrentMonth: false, isPrev: false });
    }
    // 6. satır tamamen sonraki aya aitse kaldır (5 satıra sığdır)
    const totalRows = calendarCells.length > 35 && calendarCells.slice(35).every(c => !c.isCurrentMonth) 
        ? 35 : calendarCells.length;

    const toggleGun = (gun) => {
        if (ziyaretGunleri.includes(gun)) {
            setZiyaretGunleri(ziyaretGunleri.filter(g => g !== gun));
        } else {
            setZiyaretGunleri([...ziyaretGunleri, gun].sort((a, b) => a - b));
        }
    };

    const selectPreset = (type) => {
        if (type === 'ALL') {
            setZiyaretGunleri(Array.from({ length: daysInMonth }, (_, i) => i + 1));
        } else if (type === 'CLEAR') {
            setZiyaretGunleri([]);
        } else if (type === 'TEK') {
            setZiyaretGunleri(Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(g => g % 2 !== 0));
        } else if (type === 'CIFT') {
            setZiyaretGunleri(Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(g => g % 2 === 0));
        } else if (type === 'HAFTA_ICI') {
            // Pazartesi-Cuma günlerini seç
            const days = [];
            for (let d = 1; d <= daysInMonth; d++) {
                const dayOfWeek = new Date(calYear, calMonth, d).getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) days.push(d);
            }
            setZiyaretGunleri(days);
        }
    };

    const goToPrevMonth = () => {
        if (calMonth === 0) {
            setCalMonth(11);
            setCalYear(calYear - 1);
        } else {
            setCalMonth(calMonth - 1);
        }
        setZiyaretGunleri([]);
    };

    const goToNextMonth = () => {
        if (calMonth === 11) {
            setCalMonth(0);
            setCalYear(calYear + 1);
        } else {
            setCalMonth(calMonth + 1);
        }
        setZiyaretGunleri([]);
    };

    const goToToday = () => {
        setCalMonth(now.getMonth());
        setCalYear(now.getFullYear());
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
        <div className="max-w-3xl mx-auto">
            {/* Sayfa Başlığı */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Yeni Müşteri Kaydı</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Uşak Çözüm İlaçlama Takip Modülü</p>
            </div>

            {/* Form Kartı */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Üst Alan: İsim ve Ücret yan yana */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Müşteri İsmi */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Müşteri Adı / Ünvanı</label>
                            <input 
                                type="text" 
                                value={isim}
                                onChange={(e) => setIsim(e.target.value)}
                                placeholder="Örn: Kebapçı Selami" 
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                                required
                            />
                        </div>

                        {/* Ücret Girişi */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Aylık Hizmet Ücreti (₺)</label>
                            <input 
                                type="number" 
                                value={ucret}
                                onChange={(e) => setUcret(e.target.value)}
                                placeholder="Örn: 1500" 
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                                required
                            />
                        </div>
                    </div>

                    {/* TAKVİM BÖLÜMÜ */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hizmet Verilecek Günler</label>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all ${
                                ziyaretGunleri.length > 0 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                                {ziyaretGunleri.length} Gün Seçildi
                            </span>
                        </div>

                        {/* Takvim Kartı */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                            
                            {/* Takvim Başlığı: Ay Navigasyonu */}
                            <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                <button 
                                    type="button" 
                                    onClick={goToPrevMonth}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition cursor-pointer text-sm"
                                >
                                    ‹
                                </button>
                                
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                        {AY_ISIMLERI[calMonth]} {calYear}
                                    </h3>
                                    {!isCurrentMonth && (
                                        <button 
                                            type="button" 
                                            onClick={goToToday}
                                            className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition cursor-pointer"
                                        >
                                            Bugün
                                        </button>
                                    )}
                                </div>

                                <button 
                                    type="button" 
                                    onClick={goToNextMonth}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition cursor-pointer text-sm"
                                >
                                    ›
                                </button>
                            </div>

                            {/* Haftanın Gün İsimleri */}
                            <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                                {GUN_ISIMLERI.map((gun, i) => (
                                    <div key={gun} className={`text-center text-[10px] font-bold uppercase tracking-wider py-1.5 ${
                                        i >= 5 
                                            ? 'text-rose-400 dark:text-rose-500' 
                                            : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                        {gun}
                                    </div>
                                ))}
                            </div>

                            {/* Gün Hücreleri */}
                            <div className="grid grid-cols-7 gap-1 px-3 pb-4">
                                {calendarCells.slice(0, totalRows).map((cell, idx) => {
                                    const isSelected = cell.isCurrentMonth && ziyaretGunleri.includes(cell.day);
                                    const isToday = isCurrentMonth && cell.isCurrentMonth && cell.day === todayDate;
                                    const isWeekend = idx % 7 >= 5;

                                    if (!cell.isCurrentMonth) {
                                        return (
                                            <div key={`ghost-${idx}`} className="aspect-square flex items-center justify-center">
                                                <span className="text-xs text-slate-200 dark:text-slate-700 font-medium">{cell.day}</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={cell.day}
                                            type="button"
                                            onClick={() => toggleGun(cell.day)}
                                            className={`
                                                aspect-square rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center relative cursor-pointer
                                                ${isSelected 
                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[0.92]' 
                                                    : isToday
                                                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                        : isWeekend
                                                            ? 'bg-white dark:bg-slate-800 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-100 dark:border-slate-700'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                                                }
                                            `}
                                        >
                                            {cell.day}
                                            {isToday && !isSelected && (
                                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Hızlı Seçim Butonları */}
                            <div className="flex flex-wrap gap-2 px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('ALL')}
                                    className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                >
                                    📅 Hepsini Seç
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('HAFTA_ICI')}
                                    className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                >
                                    🏢 Hafta İçi
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('TEK')}
                                    className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                >
                                    Tek Günler
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('CIFT')}
                                    className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                >
                                    Çift Günler
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('CLEAR')}
                                    className="bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30 transition cursor-pointer ml-auto"
                                >
                                    ✕ Temizle
                                </button>
                            </div>
                        </div>

                        {/* Seçili Günler Özeti */}
                        {ziyaretGunleri.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {ziyaretGunleri.map(g => {
                                    const dayOfWeek = new Date(calYear, calMonth, g).getDay();
                                    const dayName = GUN_ISIMLERI[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
                                    return (
                                        <span key={g} className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                            {g} {dayName}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
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
