import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { hashPassword } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, isim, secretKey } = body;

        // Basit bir güvenlik kontrolü (İnternetteki herkes admin oluşturamasın)
        const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || "cozum-admin-setup-secret-key-13579";
        if (secretKey !== ADMIN_SETUP_SECRET) {
            return NextResponse.json({ success: false, error: "Yetkisiz kurulum isteği. Geçersiz kurulum anahtarı." }, { status: 403 });
        }

        if (!email || !password || !isim) {
            return NextResponse.json({ success: false, error: "Lütfen email, password ve isim alanlarını doldurun." }, { status: 400 });
        }

        // 1. Kullanıcılar tablosunu garantiye al
        await sql`
            CREATE TABLE IF NOT EXISTS kullanicilar (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                isim VARCHAR(255) NOT NULL,
                rol VARCHAR(50) DEFAULT 'admin'
            );
        `;

        // 2. Parolayı hash'le
        const passwordHash = await hashPassword(password);

        // 3. Admin kullanıcısını veritabanına ekle
        await sql`
            INSERT INTO kullanicilar (email, password_hash, isim, rol)
            VALUES (${email}, ${passwordHash}, ${isim}, 'admin')
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = ${passwordHash},
                isim = ${isim},
                rol = 'admin';
        `;

        return NextResponse.json({ 
            success: true, 
            message: `Admin kullanıcısı (${email}) başarıyla oluşturuldu/güncellendi!` 
        });

    } catch (error) {
        console.error("Admin setup hatası:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
