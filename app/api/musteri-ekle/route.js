import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { isim, aylik_ucret, planlanan_gun } = await request.json();

        // Basit bir doğrulama
        if (!isim || !aylik_ucret || !planlanan_gun) {
            return NextResponse.json({ hata: "Lütfen tüm alanları doldurun." }, { status: 400 });
        }

        // Veritabanına yeni müşteriyi ekleme sorgusu
        // kalan_bakiye başlangıçta aylık ücrete eşit ayarlanır
        await sql`
            INSERT INTO musteriler (isim, aylik_ucret, planlanan_gun, durum, kalan_bakiye)
            VALUES (${isim}, ${parseInt(aylik_ucret)}, ${parseInt(planlanan_gun)}, 'Bekliyor', ${parseInt(aylik_ucret)})
        `;

        return NextResponse.json({ mesaj: "Müşteri başarıyla kaydedildi!" }, { status: 200 });
    } catch (error) {
        console.error("Müşteri ekleme hatası:", error.message);
        return NextResponse.json({ hata: "Veritabanı hatası: " + error.message }, { status: 500 });
    }
}
