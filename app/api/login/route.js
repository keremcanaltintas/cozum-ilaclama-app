import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { verifyPassword, signToken } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: "Lütfen kullanıcı adınızı ve şifrenizi girin." }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

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

        // 1b. Tablo boşsa varsayılan kullanıcıları otomatik ekle (Self-Seeding)
        const countRes = await sql`SELECT COUNT(*)::int as count FROM kullanicilar;`;
        if (countRes.rows[0].count === 0) {
            const hashKadir = await hashPassword("kadir12345.");
            const hashKerem = await hashPassword("kerem0205KA");
            
            await sql`
                INSERT INTO kullanicilar (email, password_hash, isim, rol)
                VALUES ('usakcozumilaclama', ${hashKadir}, 'Böcek Kadir', 'admin');
            `;
            await sql`
                INSERT INTO kullanicilar (email, password_hash, isim, rol)
                VALUES ('kerem0205', ${hashKerem}, 'Kerem', 'admin');
            `;
        }

        // 2. Kullanıcıyı sorgula
        const userRes = await sql`
            SELECT * FROM kullanicilar WHERE email = ${normalizedEmail};
        `;

        if (userRes.rows.length === 0) {
            return NextResponse.json({ success: false, error: "Hatalı e-posta veya şifre." }, { status: 401 });
        }

        const user = userRes.rows[0];

        // 2. Şifre doğrula
        const isPasswordCorrect = await verifyPassword(password, user.password_hash);
        if (!isPasswordCorrect) {
            return NextResponse.json({ success: false, error: "Hatalı e-posta veya şifre." }, { status: 401 });
        }

        // 3. JWT imzala
        const token = await signToken({
            id: user.id,
            email: user.email,
            isim: user.isim,
            rol: user.rol
        });

        // 4. HTTP-only Cookie olarak kaydet ve yanıtla
        const response = NextResponse.json({ 
            success: true, 
            message: "Giriş işlemi başarıyla tamamlandı!" 
        });

        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 gün
            path: '/'
        });

        return response;

    } catch (error) {
        console.error("Giriş API hatası:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
