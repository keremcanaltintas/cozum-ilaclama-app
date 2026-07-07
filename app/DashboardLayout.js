"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Koyu/Açık Mod State
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    // Şifre Değiştirme Modal State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Tema İlk Yükleme
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Tema Değiştirme Fonksiyonu
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Şifre Değiştirme Post Handler
    const handleChangePasswordSubmit = async (e) => {
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
                setPasswordSuccess('Şifreniz başarıyla değiştirildi!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    setIsPasswordModalOpen(false);
                    setPasswordSuccess('');
                }, 1500);
            } else {
                setPasswordError(data.error || 'Şifre değiştirilemedi.');
            }
        } catch (err) {
            setPasswordError('Sunucu hatası oluştu.');
        } finally {
            setPasswordLoading(false);
        }
    };

    useEffect(() => {
        if (pathname !== '/login') {
            fetch('/api/current-user')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setUser(data.user);
                    }
                })
                .catch(err => console.error("Kullanıcı yükleme hatası:", err));
        }
    }, [pathname]);

    // Giriş sayfasında sidebar düzenini gösterme
    if (pathname === '/login') {
        return <>{children}</>;
    }

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: '🏠', desc: 'Bugünkü İş Planı' },
        { name: 'Müşteriler', path: '/musteriler', icon: '👥', desc: 'Tüm Liste' },
        { name: 'Gidilenler', path: '/bugun-gidilenler', icon: '📍', desc: 'Bugün Gidilenler' },
        { name: 'Ödemeler', path: '/odemeler', icon: '💳', desc: 'Tahsilat Geçmişi' },
        { name: 'Müşteri Ekle', path: '/musteri-ekle', icon: '➕', desc: 'Yeni Kayıt' },
        { name: 'Aylık Rapor', path: '/raporlar', icon: '📊', desc: 'Finansal Analiz' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* MOBİL BAŞLIK BAR (HEADER) */}
            <header className="lg:hidden bg-emerald-800 text-white px-4 py-3 flex justify-between items-center shadow-md z-40 sticky top-0">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="p-2 hover:bg-emerald-700 rounded-lg transition"
                    >
                        ☰
                    </button>
                    <img src="/logo.png" alt="Uşak Çözüm" className="h-8 w-auto object-contain brightness-0 invert" />
                </div>
                {user && (
                    <div className="text-xs font-bold text-emerald-100 bg-emerald-700/50 px-3 py-1 rounded-full border border-emerald-600">
                        👤 {user.email === 'usakcozumilaclama' ? 'Böcek Kadir' : user.isim}
                    </div>
                )}
            </header>

            {/* SİDEBAR (MASAÜSTÜ & MOBİL DRAWER) */}
            <aside className={`
                fixed inset-y-0 left-0 bg-white w-64 border-r border-slate-100 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:min-h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Bölümü */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <img src="/logo.png" alt="Uşak Çözüm" className="h-12 w-auto object-contain" />
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Hoş Geldin Mesajı */}
                {user && (
                    <div className="px-6 py-3 bg-emerald-50/50 border-b border-slate-100">
                        <div className="text-[9px] uppercase font-extrabold text-emerald-800 tracking-wider">Aktif Oturum</div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                            🟢 Hoş Geldin {user.email === 'usakcozumilaclama' ? 'Böcek Kadir' : user.isim}
                        </div>
                    </div>
                )}

                {/* Menü Linkleri */}
                <nav className="flex-1 p-4 space-y-2 lg:overflow-visible overflow-y-auto">
                    {menuItems.map((item) => {
                        const active = pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                href={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                                    ${active 
                                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
                                    {item.icon}
                                </span>
                                <div>
                                    <div className="text-sm font-semibold">{item.name}</div>
                                    <div className={`text-[10px] ${active ? 'text-emerald-600 font-medium' : 'text-slate-400 font-normal group-hover:text-slate-500'}`}>
                                        {item.desc}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sistem Ayarları Bölümü */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3">Sistem Ayarları</div>
                    
                    {/* Görünüm Ayarları */}
                    <div className="flex items-center justify-between mb-3 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-3xs">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            {!mounted ? '☀️ Açık Mod' : (theme === 'light' ? '☀️ Açık Mod' : '🌙 Koyu Mod')}
                        </span>
                        <button 
                            onClick={toggleTheme}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                        >
                            Değiştir
                        </button>
                    </div>

                    {/* Şifre Değiştir */}
                    <button 
                        onClick={() => {
                            setPasswordError('');
                            setPasswordSuccess('');
                            setIsPasswordModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                        🔑 Şifre Değiştir
                    </button>
                </div>

                {/* Çıkış Yap Butonu */}
                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={async () => {
                            if(confirm("Sistemden çıkış yapmak istediğinize emin misiniz?")) {
                                try {
                                    const res = await fetch('/api/logout', { method: 'POST' });
                                    if (res.ok) {
                                        window.location.href = '/login';
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 font-bold transition duration-200 cursor-pointer"
                    >
                        <span className="text-xl">🚪</span>
                        <div className="text-sm">Çıkış Yap</div>
                    </button>
                </div>

                {/* Footer Bölümü */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <img src="/seal.jpg" alt="Mühür" className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                    <div>
                        <div className="text-xs font-bold text-slate-800">Uşak Çözüm</div>
                        <div className="text-[10px] text-slate-400 font-medium">Saha Takip Modülü</div>
                    </div>
                </div>
            </aside>

            {/* Arka Plan Overlay (Mobil için Sidebar açıkken arkası kararsın) */}
            {isOpen && (
                <div 
                    onClick={() => setIsOpen(false)} 
                    className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-45 lg:hidden"
                />
            )}

            {/* ANA İÇERİK ALANI */}
            <div className="flex-1 flex flex-col min-h-screen lg:overflow-visible overflow-hidden">
                {/* ÜST MASAÜSTÜ BAR (HEADER) */}
                <header className="hidden lg:flex bg-white border-b border-slate-100 px-8 py-4 justify-between items-center z-30">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {menuItems.find(item => item.path === pathname)?.name || 'Panel'}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium">
                            {menuItems.find(item => item.path === pathname)?.desc || 'Uşak Çözüm İlaçlama Takip Sistemi'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-100/50 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Çevrimiçi
                        </span>
                        <img src="/seal.jpg" alt="Mühür" className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-md" />
                    </div>
                </header>

                {/* SAYFA İÇERİĞİ */}
                <main className="flex-1 lg:overflow-visible overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>

            {/* ŞİFRE DEĞİŞTİRME MODAL */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Kapat Butonu */}
                        <button 
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg p-2 rounded-lg cursor-pointer"
                        >
                            ✕
                        </button>

                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                            🔑 Şifre Değiştirme
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Hesap güvenliğiniz için güçlü bir şifre belirleyin.</p>

                        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Mevcut Şifre</label>
                                <input 
                                    type="password" 
                                    placeholder="Mevcut şifrenizi girin" 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition"
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
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">Yeni Şifre Tekrar</label>
                                <input 
                                    type="password" 
                                    placeholder="Yeni şifrenizi doğrulayın" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                                />
                            </div>

                            {/* Hata ve Başarı Bildirimleri */}
                            {passwordError && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-semibold py-2.5 px-4 rounded-xl text-center">
                                    ⚠️ {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold py-2.5 px-4 rounded-xl text-center">
                                    ✓ {passwordSuccess}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs py-2.5 rounded-xl transition cursor-pointer"
                                >
                                    İptal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={passwordLoading}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition active:scale-95 cursor-pointer flex justify-center items-center"
                                >
                                    {passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
