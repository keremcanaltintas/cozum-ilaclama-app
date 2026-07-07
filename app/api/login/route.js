import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { verifyPassword, signToken } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: "Lütfen e-posta ve şifrenizi girin." }, { status: 400 });
        }

        // 1. Kullanıcıyı sorgula
        const userRes = await sql`
            SELECT * FROM kullanicilar WHERE email = ${email};
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
