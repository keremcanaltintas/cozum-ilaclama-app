import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    // Eğer parametre gelmezse sunucunun mevcut gününü esas alıyoruz
    const gun = searchParams.get('gun') || new Date().getDate();

    try {
        const { rows } = await sql`
            SELECT id, isim, aylik_ucret, durum, kalan_bakiye, planlanan_gun 
            FROM musteriler 
            WHERE planlanan_gun = ${Number(gun)}
            ORDER BY id ASC;
        `;
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Veritabanı hatası:', error);
        return NextResponse.json({ error: 'Müşteri listesi alınamadı: ' + error.message }, { status: 500 });
    }
}
