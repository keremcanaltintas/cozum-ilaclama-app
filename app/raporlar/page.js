"use client";
import React from 'react';

export default function RaporlarPage() {
    return (
        <div className="max-w-4xl mx-auto text-center py-16 px-4">
            <div className="text-6xl mb-6">📊</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Aylık Raporlar</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Aylık tahsilat oranları, saha ziyaret istatistikleri ve finansal grafiklerin listeleneceği raporlama ekranı çok yakında hizmetinizde olacak.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Geliştirme Aşamasında
            </div>
        </div>
    );
}
