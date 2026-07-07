"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Giriş yapılamadı.');
            }
        } catch (err) {
            setError('Sunucu bağlantı hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 font-sans antialiased">
            {/* Arka Plan Sıvı Cam / Glow Efektli Balonlar */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse duration-[6000ms]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse duration-[8000ms]" />

            {/* Login Kartı Container */}
            <div className="relative z-10 w-full max-w-md p-8 mx-4 rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl flex flex-col items-center">
                
                {/* Logo Çerçevesi */}
                <div className="w-24 h-24 rounded-full overflow-hidden border border-white/30 shadow-md bg-white p-1 mb-6 flex items-center justify-center">
                    <img 
                        src="/logo.jpg" 
                        alt="Uşak Çözüm Logo" 
                        className="w-full h-full object-contain rounded-full"
                    />
                </div>

                {/* Başlıklar */}
                <h1 className="text-xl font-bold text-white mb-1">Uşak Çözüm İlaçlama</h1>
                <p className="text-xs text-emerald-300/80 font-medium mb-6 uppercase tracking-wider">Yönetici Paneli Girişi</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    
                    {/* E-posta */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 pl-1">Kullanıcı Adı</label>
                        <input 
                            type="text" 
                            placeholder="Kullanıcı adınızı girin..." 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition duration-200"
                        />
                    </div>

                    {/* Şifre */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 pl-1">Şifre</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition duration-200"
                        />
                    </div>

                    {/* Hata Mesajı */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold py-2.5 px-4 rounded-xl text-center animate-shake">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Giriş Butonu */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm py-3 rounded-xl transition duration-200 shadow-lg cursor-pointer flex justify-center items-center gap-2 mt-4"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Giriş Yapılıyor...
                            </span>
                        ) : (
                            "Ana Panele Giriş Yap"
                        )}
                    </button>
                </form>

                {/* Alt Metin */}
                <span className="text-[10px] text-slate-500 mt-8 block">
                    Uşak Çözüm Saha Takip Sistemi v1.2.0
                </span>
            </div>
        </div>
    );
}
