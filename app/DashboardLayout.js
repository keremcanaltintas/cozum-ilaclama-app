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
        { 
            name: 'Dashboard', 
            path: '/', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
            ), 
            desc: 'Bugünkü İş Planı' 
        },
        { 
            name: 'Müşteriler', 
            path: '/musteriler', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ), 
            desc: 'Tüm Liste' 
        },
        { 
            name: 'Gidilenler', 
            path: '/bugun-gidilenler', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ), 
            desc: 'Bugün Gidilenler' 
        },
        { 
            name: 'Ödemeler', 
            path: '/odemeler', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ), 
            desc: 'Tahsilat Geçmişi' 
        },
        { 
            name: 'Müşteri Ekle', 
            path: '/musteri-ekle', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ), 
            desc: 'Yeni Kayıt' 
        },
        { 
            name: 'Aylık Rapor', 
            path: '/raporlar', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-4 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ), 
            desc: 'Finansal Analiz' 
        },
        { 
            name: 'Ayarlar', 
            path: '/ayarlar', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ), 
            desc: 'Sistem & Profil' 
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
            {/* MOBİL BAŞLIK BAR (HEADER) */}
            <header className="lg:hidden bg-nestro-bg text-white px-4 py-3 flex justify-between items-center shadow-md z-40 sticky top-0 border-b border-nestro-active-border/20">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="p-2 hover:bg-nestro-active-bg/50 rounded-lg transition text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <img src="/logo.png" alt="Uşak Çözüm" className="h-8 w-auto object-contain brightness-0 invert" />
                </div>
                {user && (
                    <div className="text-xs font-bold text-nestro-text-active bg-nestro-active-bg/50 px-3 py-1 rounded-full border border-nestro-active-border/30">
                        {user.email === 'usakcozumilaclama' ? 'Böcek Kadir' : user.isim}
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" />
                        </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
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
