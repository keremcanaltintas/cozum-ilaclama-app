import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { musteriId, actionType, value, currentDay } = body;

        if (!musteriId || !actionType) {
            return NextResponse.json({ success: false, error: 'Eksik parametre gönderildi.' }, { status: 400 });
        }

        if (actionType === 'TAM_ODEME') {
            // Bakiyeyi sıfırla ve durumu Ödendi yap
            await sql`
                UPDATE musteriler 
                SET durum = 'Ödendi', kalan_bakiye = 0 
                WHERE id = ${musteriId};
            `;
        } 
        else if (actionType === 'KISMI_ODEME') {
            // Gönderilen tutarı mevcut kalan_bakiye değerinden düş
            await sql`
                UPDATE musteriler 
                SET durum = 'Bekliyor', kalan_bakiye = kalan_bakiye - ${Number(value)} 
                WHERE id = ${musteriId};
            `;
        } 
        else if (actionType === 'GIDILDI') {
            // Ziyaretler tablosuna yeni log ekle
            await sql`
                INSERT INTO ziyaretler (musteri_id, gun) 
                VALUES (${musteriId}, ${Number(currentDay)});
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
