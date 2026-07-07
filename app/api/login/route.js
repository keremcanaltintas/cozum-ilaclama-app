import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { hashPassword, verifyPassword, signToken } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        
        console.log(`\n--- [GİRİŞ DENEMESİ BAŞLADI] ---`);
        console.log(`[LOGIN] Gelen Kullanıcı Adı: "${email}"`);

        if (!email || !password) {
            console.log(`[LOGIN HATA] Giriş başarısız: Kullanıcı adı veya şifre boş gönderildi.`);
            return NextResponse.json({ success: false, error: "Lütfen kullanıcı adınızı ve şifrenizi girin." }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[LOGIN] Normalize Edilen Kullanıcı Adı: "${normalizedEmail}"`);

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
            console.log(`[LOGIN SEED] 'kullanicilar' tablosu boş. Kadir ve Kerem hesapları oluşturuluyor...`);
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
            console.log(`[LOGIN SEED BAŞARILI] Kadir ve Kerem hesapları veritabanına kaydedildi.`);
        }

        // 2. Kullanıcıyı sorgula
        console.log(`[LOGIN] Veritabanında "${normalizedEmail}" aranıyor...`);
        const userRes = await sql`
            SELECT * FROM kullanicilar WHERE email = ${normalizedEmail};
        `;

        if (userRes.rows.length === 0) {
            console.log(`[LOGIN HATA] "${normalizedEmail}" kullanıcı adı veritabanında bulunamadı!`);
            return NextResponse.json({ success: false, error: "Hatalı kullanıcı adı veya şifre." }, { status: 401 });
        }

        const user = userRes.rows[0];
        console.log(`[LOGIN] Kullanıcı bulundu! İsim: "${user.isim}", Rol: "${user.rol}"`);

        // 3. Şifre doğrula
        console.log(`[LOGIN] Şifre doğrulaması başlatılıyor...`);
        let isPasswordCorrect = false;

        // Eğer veritabanındaki şifre hash formatında değilse (iki nokta üst üste içermiyorsa),
        // kullanıcının düz metin olarak yazdığını varsayıp düz metin kontrolü yapıyoruz.
        if (!user.password_hash.includes(':')) {
            console.log(`[LOGIN UYARI] Veritabanında düz metin şifre tespit edildi! Düz metin doğrulaması yapılıyor...`);
            isPasswordCorrect = (user.password_hash === password);
            
            if (isPasswordCorrect) {
                console.log(`[LOGIN AUTO-UPGRADE] Giriş başarılı. Düz şifre güvenli hash'e dönüştürülüyor...`);
                const secureHash = await hashPassword(password);
                await sql`
                    UPDATE kullanicilar 
                    SET password_hash = ${secureHash} 
                    WHERE id = ${user.id};
                `;
                console.log(`[LOGIN AUTO-UPGRADE BAŞARILI] Kullanıcı şifresi veritabanında güvenli şekilde hash'lendi!`);
            }
        } else {
            isPasswordCorrect = await verifyPassword(password, user.password_hash);
        }
        
        if (!isPasswordCorrect) {
            console.log(`[LOGIN HATA] Şifre uyuşmadı! Girilen şifre veritabanındaki şifreyle eşleşmiyor.`);
            return NextResponse.json({ success: false, error: "Hatalı kullanıcı adı veya şifre." }, { status: 401 });
        }

        console.log(`[LOGIN BAŞARILI] Şifre doğru. JWT token oluşturuluyor...`);

        // 4. JWT imzala
        const token = await signToken({
            id: user.id,
            email: user.email,
            isim: user.isim,
            rol: user.rol
        });

        // 5. HTTP-only Cookie olarak kaydet ve yanıtla
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

        console.log(`[LOGIN TAMAMLANDI] Giriş başarılı. Çerez tarayıcıya set edildi.`);
        return response;

    } catch (error) {
        console.error(`[LOGIN KRİTİK HATA] Sunucu hatası oluştu:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
