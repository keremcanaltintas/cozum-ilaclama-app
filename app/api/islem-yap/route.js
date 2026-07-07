import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const isGunluk = body.is_gunluk || body.isGunluk || false;

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
                tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                gunluk_id INTEGER
            );
        `;

        if (actionType === 'SIFIRLA') {
            // Bugünün tüm ziyaret loglarını veritabanından temizle (normal ve günlük olanlar)
            await sql`
                DELETE FROM ziyaretler 
                WHERE gun = ${Number(currentDay)};
            `;
            await sql`
                UPDATE gunluk_ziyaretler 
                SET gidildi = FALSE, ziyaret_tarihi = NULL 
                WHERE tarih = CURRENT_DATE;
            `;
        }
        else if (actionType === 'TAM_ODEME') {
            let bekleyenBakiye = 0;

            if (isGunluk) {
                const musteriRes = await sql`
                    SELECT kalan_bakiye FROM gunluk_ziyaretler WHERE id = ${musteriId};
                `;
                if (musteriRes.rows.length === 0) {
                    return NextResponse.json({ success: false, error: 'Müşteri bulunamadı.' }, { status: 404 });
                }
                bekleyenBakiye = Number(musteriRes.rows[0].kalan_bakiye);

                // Günlük müşteriyi güncelle
                await sql`
                    UPDATE gunluk_ziyaretler 
                    SET durum = 'Ödendi', kalan_bakiye = 0 
                    WHERE id = ${musteriId};
                `;

                // Ödemeler tablosuna tahsilat kaydı ekle (gunluk_id ile)
                await sql`
                    INSERT INTO odemeler (musteri_id, gunluk_id, odenen_miktar, bekleyen_miktar, kalan_miktar, odeme_tipi)
                    VALUES (0, ${musteriId}, ${bekleyenBakiye}, ${bekleyenBakiye}, 0, 'TAM');
                `;
            } else {
                const musteriRes = await sql`
                    SELECT kalan_bakiye FROM musteriler WHERE id = ${musteriId};
                `;
                if (musteriRes.rows.length === 0) {
                    return NextResponse.json({ success: false, error: 'Müşteri bulunamadı.' }, { status: 404 });
                }
                bekleyenBakiye = Number(musteriRes.rows[0].kalan_bakiye);

                await sql`
                    UPDATE musteriler 
                    SET durum = 'Ödendi', kalan_bakiye = 0 
                    WHERE id = ${musteriId};
                `;

                await sql`
                    INSERT INTO odemeler (musteri_id, gunluk_id, odenen_miktar, bekleyen_miktar, kalan_miktar, odeme_tipi)
                    VALUES (${musteriId}, NULL, ${bekleyenBakiye}, ${bekleyenBakiye}, 0, 'TAM');
                `;
            }
        } 
        else if (actionType === 'KISMI_ODEME') {
            let bekleyenBakiye = 0;
            const odenenMiktar = Number(value);

            if (isGunluk) {
                const musteriRes = await sql`
                    SELECT kalan_bakiye FROM gunluk_ziyaretler WHERE id = ${musteriId};
                `;
                if (musteriRes.rows.length === 0) {
                    return NextResponse.json({ success: false, error: 'Müşteri bulunamadı.' }, { status: 404 });
                }
                bekleyenBakiye = Number(musteriRes.rows[0].kalan_bakiye);

                if (odenenMiktar > bekleyenBakiye) {
                    return NextResponse.json({ success: false, error: `Girilen tutar (₺${odenenMiktar}) kalan bakiyeden (₺${bekleyenBakiye}) fazla olamaz.` }, { status: 400 });
                }

                const kalanMiktar = Math.max(0, bekleyenBakiye - odenenMiktar);
                const yeniDurum = kalanMiktar <= 0 ? 'Ödendi' : 'Bekliyor';

                await sql`
                    UPDATE gunluk_ziyaretler 
                    SET durum = ${yeniDurum}, kalan_bakiye = ${kalanMiktar} 
                    WHERE id = ${musteriId};
                `;

                await sql`
                    INSERT INTO odemeler (musteri_id, gunluk_id, odenen_miktar, bekleyen_miktar, kalan_miktar, odeme_tipi)
                    VALUES (0, ${musteriId}, ${odenenMiktar}, ${bekleyenBakiye}, ${kalanMiktar}, 'KISMI');
                `;
            } else {
                const musteriRes = await sql`
                    SELECT kalan_bakiye FROM musteriler WHERE id = ${musteriId};
                `;
                if (musteriRes.rows.length === 0) {
                    return NextResponse.json({ success: false, error: 'Müşteri bulunamadı.' }, { status: 404 });
                }
                bekleyenBakiye = Number(musteriRes.rows[0].kalan_bakiye);

                if (odenenMiktar > bekleyenBakiye) {
                    return NextResponse.json({ success: false, error: `Girilen tutar (₺${odenenMiktar}) kalan bakiyeden (₺${bekleyenBakiye}) fazla olamaz.` }, { status: 400 });
                }

                const kalanMiktar = Math.max(0, bekleyenBakiye - odenenMiktar);
                const yeniDurum = kalanMiktar <= 0 ? 'Ödendi' : 'Bekliyor';

                await sql`
                    UPDATE musteriler 
                    SET durum = ${yeniDurum}, kalan_bakiye = ${kalanMiktar} 
                    WHERE id = ${musteriId};
                `;

                await sql`
                    INSERT INTO odemeler (musteri_id, gunluk_id, odenen_miktar, bekleyen_miktar, kalan_miktar, odeme_tipi)
                    VALUES (${musteriId}, NULL, ${odenenMiktar}, ${bekleyenBakiye}, ${kalanMiktar}, 'KISMI');
                `;
            }
        } 
        else if (actionType === 'GIDILDI') {
            if (isGunluk) {
                // Günlük müşteri tablosunda gidildi olarak işaretle
                await sql`
                    UPDATE gunluk_ziyaretler 
                    SET gidildi = TRUE, ziyaret_tarihi = CURRENT_TIMESTAMP
                    WHERE id = ${musteriId};
                `;
            } else {
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
            }
        } else {
            return NextResponse.json({ success: false, error: 'Geçersiz işlem tipi.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'İşlem başarıyla veritabanına kaydedildi.' });

    } catch (error) {
        console.error('İşlem kaydetme hatası:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
