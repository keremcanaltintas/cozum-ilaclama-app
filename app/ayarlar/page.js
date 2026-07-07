"use client";

import React, { useState, useEffect } from 'react';

export default function AyarlarPage() {
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState('light');

    // Şifre Değiştirme State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Sistem Ayarları Reset/Sıfırlama State
    const [resetLoading, setResetLoading] = useState(false);
    const [dbResetLoading, setDbResetLoading] = useState(false);

    // Tost/Bildirim State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const currentDay = new Date().getDate();

    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Kullanıcı bilgileri ve tema yükleme
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        fetch('/api/current-user')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                }
            })
            .catch(err => console.error("Kullanıcı yükleme hatası:", err));
    }, []);

    // Tema Değiştirme
    const toggleTheme = (selectedTheme) => {
        setTheme(selectedTheme);
        localStorage.setItem('theme', selectedTheme);
        if (selectedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        triggerToast(`Görünüm modu değiştirildi: ${selectedTheme === 'dark' ? 'Koyu' : 'Açık'}`);
    };

    // Şifre Değiştirme
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Yeni şifreler uyuşmuyor.');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPasswordSuccess('Şifreniz başarıyla güncellendi!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                triggerToast('Şifre başarıyla güncellendi!');
            } else {
                setPasswordError(data.error || 'Şifre değiştirilemedi.');
            }
        } catch (err) {
            setPasswordError('Bağlantı hatası oluştu.');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Ziyaretleri Sıfırla
    const handleResetVisits = async () => {
        if(confirm("Bugünün yerel ziyaret geçmişini sıfırlamak istediğinize emin misiniz?")) {
            setResetLoading(true);
            try {
                const res = await fetch('/api/islem-yap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ actionType: 'SIFIRLA', currentDay })
                });
                const data = await res.json();

                if (data.success) {
                    // Yerel localStorage sıfırlaması
                    localStorage.removeItem(`visits_day_${currentDay}`);
                    triggerToast('Bugünün ziyaret geçmişi sıfırlandı.');
                } else {
                    triggerToast('Sıfırlama hatası: ' + data.error, 'error');
                }
            } catch (error) {
                triggerToast('Sunucuya bağlanılamadı!', 'error');
            } finally {
                setResetLoading(false);
            }
        }
    };

    // Veritabanını Fabrika Ayarlarına Sıfırla
    const handleResetDatabase = async () => {
        if(confirm("DİKKAT! Tüm müşteriler, ziyaretler ve ödemeler kalıcı olarak silinecektir. Bu işlem geri alınamaz! Sıfırlamak istediğinize emin misiniz?")) {
            if(confirm("Son kez soruyoruz: Tüm verileri temizleyip fabrika ayarlarına dönmek istediğinize emin misiniz?")) {
                setDbResetLoading(true);
                try {
                    const res = await fetch('/api/reset-database');
                    const data = await res.json();
                    if (data.success) {
                        triggerToast('Veritabanı sıfırlandı! Tüm kayıtlar silindi.', 'success');
                    } else {
                        triggerToast('Sıfırlama hatası: ' + data.error, 'error');
                    }
                } catch (error) {
                    triggerToast('Sunucuya bağlanılamadı!', 'error');
                } finally {
                    setDbResetLoading(false);
                }
            }
        }
    };

    return (
        <div className="font-sans antialiased text-slate-800 dark:text-slate-200">
            {/* Sayfa Başlığı */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white">⚙️ Sistem Ayarları</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Sistem görünümünü, hesap güvenliğini ve veritabanı ayarlarını buradan yönetebilirsiniz.</p>
            </div>

            {/* Grid Düzeni */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* SOL KOLON: Profil Kartı ve Sistem Bilgileri (4/12 genişlik) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Profil Kartı */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-3xl mb-4 text-emerald-600 dark:text-emerald-400 shadow-inner">
                            👤
                        </div>
                        {user ? (
                            <>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">{user.isim}</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">@{user.email}</p>
                                <span className="mt-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                    🛡️ {user.rol === 'admin' ? 'Yönetici' : user.rol}
                                </span>
                            </>
                        ) : (
                            <div className="animate-pulse space-y-2 w-full flex flex-col items-center">
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-2/3"></div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2"></div>
                            </div>
                        )}
                    </div>

                    {/* Sistem Bilgileri */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Sistem Bilgileri</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Yazılım Sürümü</span>
                                <span className="font-semibold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">v1.2.0</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Veritabanı</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Neon Postgres (Bulut)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Durum</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Çevrimiçi
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-700/50 pt-3">
                                <span className="text-slate-500 dark:text-slate-400">Bugünün Tarihi</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* SAĞ KOLON: Görünüm, Şifre Değiştirme ve Sistem Sıfırlama (8/12 genişlik) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Görünüm Ayarları Kartı */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Görünüm Ayarları</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Uygulamanın renk şemasını seçin. Koyu mod loş ışıklı ortamlarda gözlerinizi korumaya yardımcı olur.</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Açık Mod Kartı */}
                            <button 
                                onClick={() => toggleTheme('light')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition active:scale-98 cursor-pointer ${
                                    theme === 'light' 
                                        ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5' 
                                        : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                }`}
                            >
                                <span className="text-2xl">☀️</span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Açık Mod</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Klasik parlak görünüm</p>
                                </div>
                                {theme === 'light' && <span className="ml-auto text-emerald-600 dark:text-emerald-400 text-sm font-bold">✓</span>}
                            </button>

                            {/* Koyu Mod Kartı */}
                            <button 
                                onClick={() => toggleTheme('dark')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition active:scale-98 cursor-pointer ${
                                    theme === 'dark' 
                                        ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5' 
                                        : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                }`}
                            >
                                <span className="text-2xl">🌙</span>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Koyu Mod</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Siyah ve loş tonlar</p>
                                </div>
                                {theme === 'dark' && <span className="ml-auto text-emerald-600 dark:text-emerald-400 text-sm font-bold">✓</span>}
                            </button>
                        </div>
                    </div>

                    {/* Güvenlik Ayarları Kartı */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Şifre Değiştir</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Şifrenizi düzenli aralıklarla değiştirmek hesabınızın güvenliğini artırır.</p>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Mevcut Şifre</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Yeni Şifre</label>
                                    <input 
                                        type="password" 
                                        placeholder="En az 6 karakter" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Yeni Şifre Tekrar</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Hata ve Başarı Bildirimleri */}
                            {passwordError && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold py-2.5 px-4 rounded-xl text-center">
                                    ⚠️ {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold py-2.5 px-4 rounded-xl text-center">
                                    ✓ {passwordSuccess}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={passwordLoading}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-6 rounded-xl transition active:scale-95 cursor-pointer flex justify-center items-center gap-2"
                                >
                                    {passwordLoading ? 'Güncelleniyor...' : '🔑 Şifreyi Güncelle'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Veritabanı ve Sistem Yönetimi Kartı */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-4">Sistem Yönetimi (Veritabanı)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Sistem sıfırlama işlemleri verileri kalıcı olarak silebileceğinden dikkatli kullanılmalıdır.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ziyaretleri Sıfırla */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Bugünün Ziyaretlerini Temizle</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Bugün için yapılan ziyaretlerin durumunu 'gitmedi' olarak yerel hafızadan ve buluttan sıfırlar.</p>
                                </div>
                                <button 
                                    onClick={handleResetVisits}
                                    disabled={resetLoading}
                                    className="w-full mt-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition active:scale-95 cursor-pointer"
                                >
                                    {resetLoading ? 'Temizleniyor...' : '🔄 Ziyaret Geçmişini Sıfırla'}
                                </button>
                            </div>

                            {/* Veritabanını Sıfırla */}
                            <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-100 dark:border-rose-950/20 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">Veritabanını Fabrika Ayarlarına Döndür</h4>
                                    <p className="text-[10px] text-rose-600/80 dark:text-rose-400/50 mt-1">UYARI: Tüm kayıtlı müşteriler, ödemeler ve ziyaret takipleri kalıcı olarak veritabanından silinir.</p>
                                </div>
                                <button 
                                    onClick={handleResetDatabase}
                                    disabled={dbResetLoading}
                                    className="w-full mt-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 font-bold text-xs py-2.5 rounded-xl transition active:scale-95 cursor-pointer"
                                >
                                    {dbResetLoading ? 'Sıfırlanıyor...' : '⚠️ Tüm Verileri Sıfırla'}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

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
