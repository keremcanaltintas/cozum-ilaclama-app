"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Tema İlk Yükleme — varsayılan: açık mod
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            // Varsayılan olarak açık mod: dark sınıfını temizle
            document.documentElement.classList.remove('dark');
            // localStorage'da kayıt yoksa açık modu kaydet
            if (!savedTheme) {
                localStorage.setItem('theme', 'light');
            }
        }
    }, []);

    useEffect(() => {
        if (pathname !== '/login' && !user) {
            fetch('/api/current-user')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setUser(data.user);
                    }
                })
                .catch(err => console.error("Kullanıcı yükleme hatası:", err));
        }
    }, [pathname, user]);

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
        { name: 'Aylık Rapor', path: '/raporlar', icon: '📊', desc: 'Finansal Analiz' },
        { name: 'Ayarlar', path: '/ayarlar', icon: '⚙️', desc: 'Sistem & Profil' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
            {/* MOBİL BAŞLIK BAR (HEADER) */}
            <header className="lg:hidden bg-nestro-bg text-white px-4 py-3 flex justify-between items-center shadow-md z-40 sticky top-0 border-b border-nestro-active-border/20">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="p-2 hover:bg-nestro-active-bg/50 rounded-lg transition"
                    >
                        ☰
                    </button>
                    <img src="/logo.png" alt="Uşak Çözüm" className="h-8 w-auto object-contain brightness-0 invert" />
                </div>
                {user && (
                    <div className="text-xs font-bold text-nestro-text-active bg-nestro-active-bg/50 px-3 py-1 rounded-full border border-nestro-active-border/30">
                        👤 {user.email === 'usakcozumilaclama' ? 'Böcek Kadir' : user.isim}
                    </div>
                )}
            </header>

            {/* SİDEBAR (MASAÜSTÜ & MOBİL DRAWER) */}
            <aside className={`
                fixed inset-y-0 left-0 bg-nestro-bg w-64 border-r border-nestro-active-border/20 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:min-h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Bölümü */}
                <div className="p-6 border-b border-nestro-active-border/20 flex items-center justify-between">
                    <img src="/logo.png" alt="Uşak Çözüm" className="h-12 w-auto object-contain brightness-0 invert" />
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="lg:hidden p-2 text-nestro-text hover:bg-nestro-active-bg/50 hover:text-nestro-text-active rounded-lg transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Hoş Geldin Mesajı */}
                {user && (
                    <div className="px-6 py-3 bg-nestro-active-bg/25 border-b border-nestro-active-border/15">
                        <div className="text-[9px] uppercase font-extrabold text-nestro-light-green tracking-wider">Aktif Oturum</div>
                        <div className="text-xs font-bold text-nestro-text-active flex items-center gap-1.5 mt-0.5">
                            <span className="text-nestro-light-green">●</span> Hoş Geldin {user.email === 'usakcozumilaclama' ? 'Böcek Kadir' : user.isim}
                        </div>
                    </div>
                )}

                {/* Menü Linkleri */}
                <nav className="flex-1 p-4 space-y-2 lg:overflow-visible overflow-y-auto bg-nestro-bg">
                    {menuItems.map((item) => {
                        const active = pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                href={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors duration-150 group
                                    ${active 
                                        ? 'bg-nestro-active-bg text-nestro-text-active font-bold border-l-4 border-nestro-active-border shadow-xs' 
                                        : 'text-nestro-text hover:bg-nestro-active-bg/50 hover:text-nestro-text-active'}
                                `}
                            >
                                <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
                                    {item.icon}
                                </span>
                                <div>
                                    <div className="text-sm font-semibold">{item.name}</div>
                                    <div className={`text-[10px] ${active ? 'text-nestro-light-green font-medium' : 'text-nestro-text/60 font-normal group-hover:text-nestro-text/90'}`}>
                                        {item.desc}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
                {/* Çıkış Yap Butonu */}
                <div className="p-4 border-t border-nestro-active-border/20 bg-nestro-bg">
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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-nestro-btn-dark-bg text-nestro-btn-dark-text border border-nestro-btn-dark-border hover:border-nestro-btn-dark-text/30 font-bold transition duration-200 cursor-pointer shadow-inner"
                    >
                        <span className="text-xl">🚪</span>
                        <div className="text-sm">Çıkış Yap</div>
                    </button>
                </div>

                {/* Footer Bölümü */}
                <div className="p-4 border-t border-nestro-active-border/15 bg-[#082018]/50 flex items-center gap-3">
                    <img src="/seal.jpg" alt="Mühür" className="h-10 w-10 rounded-full object-cover border border-nestro-active-border/20 shadow-sm" />
                    <div>
                        <div className="text-xs font-bold text-nestro-text-active">Uşak Çözüm</div>
                        <div className="text-[10px] text-nestro-text/60 font-medium">Saha Takip Modülü</div>
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
                <header className="hidden lg:flex bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 py-4 justify-between items-center z-30">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            {menuItems.find(item => item.path === pathname)?.name || 'Panel'}
                        </h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            {menuItems.find(item => item.path === pathname)?.desc || 'Uşak Çözüm İlaçlama Takip Sistemi'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-100/50 dark:border-emerald-900/30 flex items-center gap-1.5 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Çevrimiçi
                        </span>
                        <img src="/seal.jpg" alt="Mühür" className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-md" />
                    </div>
                </header>

                {/* SAYFA İÇERİĞİ */}
                <main className="flex-1 lg:overflow-visible overflow-y-auto p-4 lg:p-8 bg-slate-50 dark:bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
