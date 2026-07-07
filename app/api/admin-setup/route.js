import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { hashPassword } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // 1. Kullanıcılar tablosunu oluştur
        await sql`
            CREATE TABLE IF NOT EXISTS kullanicilar (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                isim VARCHAR(255) NOT NULL,
                rol VARCHAR(50) DEFAULT 'admin'
            );
        `;

        // 2. Parolaları hash'le (Web Crypto PBKDF2)
        const hashKadir = await hashPassword("kadir12345.");
        const hashKerem = await hashPassword("kerem0205KA");

        // 3. Kadir kullanıcısını ekle/güncelle (usakcozumilaclama)
        await sql`
            INSERT INTO kullanicilar (email, password_hash, isim, rol)
            VALUES ('usakcozumilaclama', ${hashKadir}, 'Böcek Kadir', 'admin')
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = ${hashKadir}, 
                isim = 'Böcek Kadir',
                rol = 'admin';
        `;

        // 4. Kerem kullanıcısını ekle/güncelle (kerem0205)
        await sql`
            INSERT INTO kullanicilar (email, password_hash, isim, rol)
            VALUES ('kerem0205', ${hashKerem}, 'Kerem', 'admin')
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = ${hashKerem}, 
                isim = 'Kerem',
                rol = 'admin';
        `;

        return NextResponse.json({ 
            success: true, 
            message: "Kullanıcılar tablosu oluşturuldu. 'usakcozumilaclama' (şifre: kadir12345.) ve 'kerem0205' (şifre: kerem0205KA) hesapları başarıyla oluşturuldu!" 
        });

    } catch (error) {
        console.error("Admin setup hatası:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
