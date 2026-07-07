import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gun = searchParams.get("gun") || new Date().getDate().toString();

    // Ziyaretler tablosunu garantiye al
    await sql`
        CREATE TABLE IF NOT EXISTS ziyaretler (
            id SERIAL PRIMARY KEY,
            musteri_id INTEGER NOT NULL,
            gun INTEGER NOT NULL,
            tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Hangi tarih sütununun var olduğunu dinamik olarak kontrol et
    let tarihColumn = 'tarih';
    try {
      const colCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ziyaretler' AND column_name = 'islem_tarihi';
      `;
      if (colCheck.rows.length > 0) {
        tarihColumn = 'islem_tarihi';
      }
    } catch (e) {
      console.warn("Sütun kontrolü başarısız oldu, varsayılan olarak 'tarih' kullanılıyor:", e.message);
    }

    // Bugün gidilen müşterileri getir
    let rows;
    if (tarihColumn === 'islem_tarihi') {
      const res = await sql`
        SELECT 
            m.id,
            m.isim,
            m.durum,
            m.aylik_ucret,
            m.kalan_bakiye,
            COUNT(z.id) as ziyaret_sayisi,
            MAX(z.islem_tarihi) as ziyaret_tarihi
        FROM ziyaretler z
        JOIN musteriler m ON z.musteri_id = m.id
        GROUP BY m.id, m.isim, m.durum, m.aylik_ucret, m.kalan_bakiye
        ORDER BY ziyaret_tarihi DESC;
      `;
      rows = res.rows;
    } else {
      const res = await sql`
        SELECT 
            m.id,
            m.isim,
            m.durum,
            m.aylik_ucret,
            m.kalan_bakiye,
            COUNT(z.id) as ziyaret_sayisi,
            MAX(z.tarih) as ziyaret_tarihi
        FROM ziyaretler z
        JOIN musteriler m ON z.musteri_id = m.id
        GROUP BY m.id, m.isim, m.durum, m.aylik_ucret, m.kalan_bakiye
        ORDER BY ziyaret_tarihi DESC;
      `;
      rows = res.rows;
    }

    const regularVisits = rows.map(r => ({ ...r, is_gunluk: false, telefon: '' }));

    // 2. Günlük Ziyaretlerden gidilenleri çek
    let dailyVisits = [];
    try {
        const dailyRes = await sql`
            SELECT 
                id, 
                isim, 
                durum, 
                ucret as aylik_ucret, 
                kalan_bakiye, 
                1 as ziyaret_sayisi, 
                ziyaret_tarihi,
                TRUE as is_gunluk,
                telefon
            FROM gunluk_ziyaretler
            WHERE gidildi = TRUE
            ORDER BY ziyaret_tarihi DESC;
        `;
        dailyVisits = dailyRes.rows;
    } catch (e) {
        console.warn("gunluk_ziyaretler tablosu henüz oluşturulmamış:", e.message);
    }

    // İki listeyi birleştir ve en son ziyaret tarihine göre sırala
    const combined = [...regularVisits, ...dailyVisits].sort((a, b) => {
        return new Date(b.ziyaret_tarihi) - new Date(a.ziyaret_tarihi);
    });

    return NextResponse.json(combined);
  } catch (error) {
    console.error("Bugün gidilenler API hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
