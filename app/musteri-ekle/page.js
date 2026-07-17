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
        const isPastDay = 
            calYear < now.getFullYear() ||
            (calYear === now.getFullYear() && calMonth < now.getMonth()) ||
            (calYear === now.getFullYear() && calMonth === now.getMonth() && gun < todayDate);

        if (isPastDay) return;

        if (ziyaretGunleri.includes(gun)) {
            setZiyaretGunleri(ziyaretGunleri.filter(g => g !== gun));
        } else {
            setZiyaretGunleri([...ziyaretGunleri, gun].sort((a, b) => a - b));
        }
    };

    const selectPreset = (type) => {
        const filterPastDays = (daysArray) => {
            return daysArray.filter(d => {
                const isPast = 
                    calYear < now.getFullYear() ||
                    (calYear === now.getFullYear() && calMonth < now.getMonth()) ||
                    (calYear === now.getFullYear() && calMonth === now.getMonth() && d < todayDate);
                return !isPast;
            });
        };

        if (type === 'ALL') {
            const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            setZiyaretGunleri(filterPastDays(allDays));
        } else if (type === 'CLEAR') {
            setZiyaretGunleri([]);
        } else if (type === 'TEK') {
            const tekDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(g => g % 2 !== 0);
            setZiyaretGunleri(filterPastDays(tekDays));
        } else if (type === 'CIFT') {
            const ciftDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(g => g % 2 === 0);
            setZiyaretGunleri(filterPastDays(ciftDays));
        } else if (type === 'HAFTA_ICI') {
            const days = [];
            for (let d = 1; d <= daysInMonth; d++) {
                const dayOfWeek = new Date(calYear, calMonth, d).getDay();
                if (dayOfWeek >= 1 && dayOfWeek <= 5) days.push(d);
            }
            setZiyaretGunleri(filterPastDays(days));
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Sayfa Başlığı ve Açıklama */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-100 to-transparent dark:from-emerald-900/20 opacity-60 blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 mb-3">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Kayıt Modülü</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 flex items-center gap-3">
                        Yeni Müşteri Oluştur
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg">Sisteme yeni bir abone ekleyerek aylık hizmet verilecek günleri ve ücretlendirmeyi tanımlayın.</p>
                </div>
            </div>

            {/* Form Kartı */}
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Üst Alan: İsim ve Ücret yan yana */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Müşteri İsmi */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Firma / Müşteri Adı
                            </label>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    value={isim}
                                    onChange={(e) => setIsim(e.target.value)}
                                    placeholder="Örn: Yıldız Eczanesi" 
                                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                    required
                                />
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Ücret Girişi */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Aylık Hizmet Ücreti
                            </label>
                            <div className="relative group">
                                <input 
                                    type="number" 
                                    value={ucret}
                                    onChange={(e) => setUcret(e.target.value)}
                                    placeholder="Örn: 1500" 
                                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono tracking-wide"
                                    required
                                />
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold">
                                        ₺
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>

                    {/* TAKVİM BÖLÜMÜ */}
                    <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Hizmet Periyodu
                                </label>
                                <p className="text-[11px] text-slate-400 font-medium">Hizmet verilecek günleri takvimden seçin veya hızlı seçim butonlarını kullanın.</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                                ziyaretGunleri.length > 0 
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-600/50' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700'
                            }`}>
                                {ziyaretGunleri.length > 0 && (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {ziyaretGunleri.length} Gün Seçildi
                            </span>
                        </div>

                        {/* Takvim Kartı */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-inner">
                            
                            {/* Takvim Başlığı: Ay Navigasyonu */}
                            <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                <button 
                                    type="button" 
                                    onClick={goToPrevMonth}
                                    disabled={calYear < now.getFullYear() || (calYear === now.getFullYear() && calMonth <= now.getMonth())}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-wide">
                                        {AY_ISIMLERI[calMonth]} {calYear}
                                    </h3>
                                    {!isCurrentMonth && (
                                        <button 
                                            type="button" 
                                            onClick={goToToday}
                                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition cursor-pointer"
                                        >
                                            Bugün
                                        </button>
                                    )}
                                </div>

                                <button 
                                    type="button" 
                                    onClick={goToNextMonth}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>

                            {/* Haftanın Gün İsimleri */}
                            <div className="grid grid-cols-7 px-4 pt-4 pb-2">
                                {GUN_ISIMLERI.map((gun, i) => (
                                    <div key={gun} className={`text-center text-[10px] font-extrabold uppercase tracking-wider ${
                                        i >= 5 
                                            ? 'text-rose-400 dark:text-rose-500' 
                                            : 'text-slate-400 dark:text-slate-500'
                                    }`}>
                                        {gun}
                                    </div>
                                ))}
                            </div>

                            {/* Gün Hücreleri */}
                            <div className="grid grid-cols-7 gap-1.5 px-4 pb-5">
                                {calendarCells.slice(0, totalRows).map((cell, idx) => {
                                    const isSelected = cell.isCurrentMonth && ziyaretGunleri.includes(cell.day);
                                    const isToday = isCurrentMonth && cell.isCurrentMonth && cell.day === todayDate;
                                    const isWeekend = idx % 7 >= 5;
                                    const isPastDay = cell.isCurrentMonth && (
                                        calYear < now.getFullYear() ||
                                        (calYear === now.getFullYear() && calMonth < now.getMonth()) ||
                                        (calYear === now.getFullYear() && calMonth === now.getMonth() && cell.day < todayDate)
                                    );

                                    if (!cell.isCurrentMonth) {
                                        return (
                                            <div key={`ghost-${idx}`} className="aspect-square flex items-center justify-center">
                                                <span className="text-xs text-slate-200 dark:text-slate-700/50 font-medium">{cell.day}</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={cell.day}
                                            type="button"
                                            onClick={() => toggleGun(cell.day)}
                                            disabled={isPastDay}
                                            className={`
                                                aspect-square rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center relative
                                                ${isPastDay
                                                    ? 'bg-slate-100/50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40 hover:bg-slate-100/50'
                                                    : isSelected 
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-95 ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900 cursor-pointer' 
                                                        : isToday
                                                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer shadow-sm'
                                                            : isWeekend
                                                                ? 'bg-white dark:bg-slate-800/80 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-slate-100 dark:border-slate-700 cursor-pointer shadow-sm'
                                                                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 cursor-pointer shadow-sm'
                                                }
                                            `}
                                        >
                                            {cell.day}
                                            {isToday && !isSelected && (
                                                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Hızlı Seçim Butonları */}
                            <div className="flex flex-wrap gap-2 px-5 pb-5 border-t border-slate-100 dark:border-slate-700/60 pt-4 bg-white/50 dark:bg-slate-800/50">
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('ALL')}
                                    className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 transition cursor-pointer shadow-sm"
                                >
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Hepsini Seç
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('HAFTA_ICI')}
                                    className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 transition cursor-pointer shadow-sm"
                                >
                                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    Hafta İçi
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('TEK')}
                                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 transition cursor-pointer shadow-sm"
                                >
                                    Tek Günler
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('CIFT')}
                                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 transition cursor-pointer shadow-sm"
                                >
                                    Çift Günler
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => selectPreset('CLEAR')}
                                    className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-500/30 transition cursor-pointer ml-auto"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Temizle
                                </button>
                            </div>
                        </div>

                        {/* Seçili Günler Özeti */}
                        {ziyaretGunleri.length > 0 && (
                            <div className="flex flex-wrap gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                {ziyaretGunleri.map(g => {
                                    const dayOfWeek = new Date(calYear, calMonth, g).getDay();
                                    const dayName = GUN_ISIMLERI[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
                                    return (
                                        <span key={g} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                                            <span className="text-emerald-500">{g}</span>
                                            <span className="text-slate-400 font-medium">{dayName}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Submit Butonu */}
                    <button 
                        type="submit" 
                        disabled={yukleniyor || !isim.trim() || !ucret}
                        className="w-full relative group overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-4 rounded-2xl transition-all active:scale-[0.98] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-slate-600 shadow-xl shadow-emerald-600/20 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
                    >
                        {/* Buton Hover Efekti */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"></div>
                        
                        <span className="relative flex items-center gap-2">
                            {yukleniyor ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    Müşteriyi Kaydet
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </span>
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
