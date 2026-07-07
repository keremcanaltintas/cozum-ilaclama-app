"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

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
                <img src="/seal.jpg" alt="Mühür" className="h-8 w-8 rounded-full object-cover border border-emerald-500 shadow-sm" />
            </header>

            {/* SİDEBAR (MASAÜSTÜ & MOBİL DRAWER) */}
            <aside className={`
                fixed inset-y-0 left-0 bg-white w-64 border-r border-slate-100 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
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

                {/* Menü Linkleri */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
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
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
