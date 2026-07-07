import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { verifyToken, hashPassword, verifyPassword } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        // 1. Yetki Kontrolü
        const token = request.cookies.get('auth_token')?.value;
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ success: false, error: "Yetkisiz erişim. Oturumunuz kapalı veya süresi dolmuş." }, { status: 401 });
        }

        // 2. Request Body Ayrıştırma
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, error: "Lütfen tüm alanları doldurun." }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ success: false, error: "Yeni şifre en az 6 karakter olmalıdır." }, { status: 400 });
        }

        // 3. Kullanıcıyı Veritabanından Sorgula
        const userRes = await sql`
            SELECT * FROM kullanicilar WHERE id = ${payload.id};
        `;

        if (userRes.rows.length === 0) {
            return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı." }, { status: 404 });
        }

        const user = userRes.rows[0];

        // 4. Mevcut Şifreyi Doğrula
        let isPasswordCorrect = false;

        // Düz metin şifre kontrolü (Eğer veritabanındaki şifre hash formatında değilse)
        if (!user.password_hash.includes(':')) {
            isPasswordCorrect = (user.password_hash === currentPassword);
        } else {
            isPasswordCorrect = await verifyPassword(currentPassword, user.password_hash);
        }

        if (!isPasswordCorrect) {
            return NextResponse.json({ success: false, error: "Mevcut şifreniz hatalı." }, { status: 400 });
        }

        // 5. Yeni Şifreyi Hashle ve Kaydet
        const newPasswordHash = await hashPassword(newPassword);
        await sql`
            UPDATE kullanicilar 
            SET password_hash = ${newPasswordHash} 
            WHERE id = ${user.id};
        `;

        return NextResponse.json({ 
            success: true, 
            message: "Şifreniz başarıyla değiştirildi." 
        });

    } catch (error) {
        console.error("[CHANGE PASSWORD ERROR] Sunucu hatası:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
