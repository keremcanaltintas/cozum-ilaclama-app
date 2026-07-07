import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { isim, aylik_ucret, ziyaret_gunleri } = await request.json();

        // Basit bir doğrulama
        if (!isim || !aylik_ucret || !Array.isArray(ziyaret_gunleri) || ziyaret_gunleri.length === 0) {
            return NextResponse.json({ hata: "Lütfen tüm alanları doldurun ve en az bir gün seçin." }, { status: 400 });
        }

        // Günleri temizleyip sayısal değerlere dönüştürerek doğrula
        const parsedGunler = ziyaret_gunleri.map(g => parseInt(g)).filter(g => !isNaN(g) && g >= 1 && g <= 31);
        if (parsedGunler.length === 0) {
            return NextResponse.json({ hata: "Lütfen geçerli ziyaret günleri seçin." }, { status: 400 });
        }

        // Veritabanına yeni müşteriyi ekleme sorgusu
        // kalan_bakiye başlangıçta aylık ücrete eşit ayarlanır
        try {
            // Önce yeni ziyaret_gunleri dizisiyle kaydetmeyi deniyoruz
            await sql`
                INSERT INTO musteriler (isim, aylik_ucret, ziyaret_gunleri, durum, kalan_bakiye)
                VALUES (${isim}, ${parseInt(aylik_ucret)}, ${parsedGunler}, 'Bekliyor', ${parseInt(aylik_ucret)})
            `;
        } catch (dbError) {
            console.warn("ziyaret_gunleri sütunu bulunamadı, planlanan_gun alanına geri dönülüyor:", dbError.message);
            // Migration henüz yapılmadıysa dizinin ilk gününü planlanan_gun olarak kaydediyoruz
            const tekilGun = parsedGunler[0];
            await sql`
                INSERT INTO musteriler (isim, aylik_ucret, planlanan_gun, durum, kalan_bakiye)
                VALUES (${isim}, ${parseInt(aylik_ucret)}, ${tekilGun}, 'Bekliyor', ${parseInt(aylik_ucret)})
            `;
        }

        return NextResponse.json({ mesaj: "Müşteri başarıyla kaydedildi!" }, { status: 200 });
    } catch (error) {
        console.error("Müşteri ekleme hatası:", error.message);
        return NextResponse.json({ hata: "Veritabanı hatası: " + error.message }, { status: 500 });
    }
}
