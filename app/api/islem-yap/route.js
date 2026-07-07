import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { musteriId, actionType, value, currentDay } = body;

        if (!actionType || (actionType !== 'SIFIRLA' && !musteriId)) {
            return NextResponse.json({ success: false, error: 'Eksik parametre gönderildi.' }, { status: 400 });
        }

        // Ödemeler tablosunu otomatik oluştur
        await sql`
            CREATE TABLE IF NOT EXISTS odemeler (
                id SERIAL PRIMARY KEY,
                musteri_id INTEGER NOT NULL,
                odenen_miktar INTEGER NOT NULL,
                bekleyen_miktar INTEGER NOT NULL,
                kalan_miktar INTEGER NOT NULL,
                odeme_tipi VARCHAR(50) NOT NULL,
                tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        if (actionType === 'SIFIRLA') {
            // Bugünün tüm ziyaret loglarını veritabanından temizle
            await sql`
                DELETE FROM ziyaretler 
                WHERE gun = ${Number(currentDay)};
            `;
        }
        else if (actionType === 'TAM_ODEME') {
            // Müşterinin şu anki bekleyen bakiyesini alalım
            const musteriRes = await sql`
                SELECT kalan_bakiye FROM musteriler WHERE id = ${musteriId};
            `;
            if (musteriRes.rows.length === 0) {
                return NextResponse.json({ success: false, error: 'Müşteri bulunamadı.' }, { status: 404 });
            }
            const bekleyenBakiye = Number(musteriRes.rows[0].kalan_bakiye);

            // Bakiyeyi sıfırla ve durumu Ödendi yap
            await sql`
                UPDATE musteriler 
                SET durum = 'Ödendi', kalan_bakiye = 0 
                WHERE id = ${musteriId};
            `;

            // Ödemeler tablosuna tahsilat kaydı ekle
            await sql`
                INSERT INTO odemeler (musteri_id, odenen_miktar, bekleyen_miktar, kalan_miktar, odeme_tipi)
                VALUES (${musteriId}, ${bekleyenBakiye}, ${bekleyenBakiye}, 0, 'TAM');
            `;
        } 
        else if (actionType === 'KISMI_ODEME') {
            // Müşterinin şu anki bekleyen bakiyesini alalım
            const musteriRes = await sql`
                SELECT kalan_bakiye FROM musteriler WHERE id = ${musteriId};
            `;
            if (musteriRes.rows.length === 0) {
                return NextResponse.json({ success: false, error: 'Müşteri bulunamadı.' }, { status: 404 });
            }
            const bekleyenBakiye = Number(musteriRes.rows[0].kalan_bakiye);
            const odenenMiktar = Number(value);
            
            // Girilen tutarın kalan bakiyeyi aşmadığını doğrula
            if (odenenMiktar > bekleyenBakiye) {
                return NextResponse.json({ success: false, error: `Girilen tutar (₺${odenenMiktar}) kalan bakiyeden (₺${bekleyenBakiye}) fazla olamaz.` }, { status: 400 });
            }

            const kalanMiktar = Math.max(0, bekleyenBakiye - odenenMiktar);
            const yeniDurum = kalanMiktar <= 0 ? 'Ödendi' : 'Bekliyor';

            // Gönderilen tutarı mevcut kalan_bakiye değerinden düş
            await sql`
                UPDATE musteriler 
                SET durum = ${yeniDurum}, kalan_bakiye = ${kalanMiktar} 
                WHERE id = ${musteriId};
            `;

            // Ödemeler tablosuna tahsilat kaydı ekle
            await sql`
                INSERT INTO odemeler (musteri_id, odenen_miktar, bekleyen_miktar, kalan_miktar, odeme_tipi)
                VALUES (${musteriId}, ${odenenMiktar}, ${bekleyenBakiye}, ${kalanMiktar}, 'KISMI');
            `;
        } 
        else if (actionType === 'GIDILDI') {
            // Ziyaretler tablosuna yeni log ekle
            await sql`
                INSERT INTO ziyaretler (musteri_id, gun) 
                VALUES (${musteriId}, ${Number(currentDay)});
            `;

            // Müşterinin kalan bakiyesini hizmet ücreti (aylik_ucret) kadar artır ve durumunu 'Bekliyor' yap
            await sql`
                UPDATE musteriler 
                SET kalan_bakiye = kalan_bakiye + aylik_ucret,
                    durum = 'Bekliyor'
                WHERE id = ${musteriId};
            `;
        } else {
            return NextResponse.json({ success: false, error: 'Geçersiz işlem tipi.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'İşlem başarıyla veritabanına kaydedildi.' });

    } catch (error) {
        console.error('İşlem kaydetme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
