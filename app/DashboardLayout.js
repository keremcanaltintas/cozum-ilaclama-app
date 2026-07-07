"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Tema İlk Yükleme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

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
        { name: 'Aylık Rapor', path: '/raporlar', icon: '📊', desc: 'Finansal Analiz' },
        { name: 'Ayarlar', path: '/ayarlar', icon: '⚙️', desc: 'Sistem & Profil' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
            {/* MOBİL BAŞLIK BAR (HEADER) */}
            <header className="lg:hidden bg-emerald-800 dark:bg-emerald-950 text-white px-4 py-3 flex justify-between items-center shadow-md z-40 sticky top-0 border-b dark:border-emerald-900/40">
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
                    <div className="text-xs font-bold text-emerald-100 dark:text-emerald-300 bg-emerald-700/50 dark:bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-600 dark:border-emerald-800">
                        👤 {user.email === 'usakcozumilaclama' ? 'Böcek Kadir' : user.isim}
                    </div>
                )}
            </header>

            {/* SİDEBAR (MASAÜSTÜ & MOBİL DRAWER) */}
            <aside className={`
                fixed inset-y-0 left-0 bg-white dark:bg-slate-900 w-64 border-r border-slate-100 dark:border-slate-800 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:min-h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Bölümü */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <img src="/logo.png" alt="Uşak Çözüm" className="h-12 w-auto object-contain" />
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="lg:hidden p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Hoş Geldin Mesajı */}
                {user && (
                    <div className="px-6 py-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-slate-800">
                        <div className="text-[9px] uppercase font-extrabold text-emerald-800 dark:text-emerald-400 tracking-wider">Aktif Oturum</div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                            🟢 Hoş Geldin {user.email === 'usakcozumilaclama' ? 'Böcek Kadir' : user.isim}
                        </div>
                    </div>
                )}

                {/* Menü Linkleri */}
                <nav className="flex-1 p-4 space-y-2 lg:overflow-visible overflow-y-auto bg-white dark:bg-slate-900">
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
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold border-l-4 border-emerald-600 shadow-xs' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                                `}
                            >
                                <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
                                    {item.icon}
                                </span>
                                <div>
                                    <div className="text-sm font-semibold">{item.name}</div>
                                    <div className={`text-[10px] ${active ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500 font-normal group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}>
                                        {item.desc}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
                {/* Çıkış Yap Butonu */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold transition duration-200 cursor-pointer"
                    >
                        <span className="text-xl">🚪</span>
                        <div className="text-sm">Çıkış Yap</div>
                    </button>
                </div>

                {/* Footer Bölümü */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                    <img src="/seal.jpg" alt="Mühür" className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                    <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Uşak Çözüm</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Saha Takip Modülü</div>
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
