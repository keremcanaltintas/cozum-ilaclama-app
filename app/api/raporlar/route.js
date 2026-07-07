import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Ödemeler tablosunu garantiye almak için otomatik oluştur
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

    // Günlük ziyaretler tablosunu garantiye al (Join sorgusunun patlamaması için)
    await sql`
        CREATE TABLE IF NOT EXISTS gunluk_ziyaretler (
            id SERIAL PRIMARY KEY,
            isim VARCHAR(255) NOT NULL,
            telefon VARCHAR(50),
            ucret INTEGER NOT NULL,
            durum VARCHAR(50) DEFAULT 'Bekliyor',
            kalan_bakiye INTEGER NOT NULL,
            gidildi BOOLEAN DEFAULT FALSE,
            tarih DATE DEFAULT CURRENT_DATE,
            ziyaret_tarihi TIMESTAMP
        );
    `;

    // 1. Toplam Tahsil Edilen Miktar
    const totalPaidRes = await sql`SELECT SUM(odenen_miktar) as total FROM odemeler;`;
    const toplamTahsilat = Number(totalPaidRes.rows[0].total || 0);

    // 2. Toplam Bekleyen Alacak
    const totalPendingRes = await sql`SELECT SUM(kalan_bakiye) as total FROM musteriler;`;
    const toplamBekleyen = Number(totalPendingRes.rows[0].total || 0);

    // 3. Toplam Tahsilat Sayısı
    const countRes = await sql`SELECT COUNT(*) as count FROM odemeler;`;
    const tahsilatSayisi = Number(countRes.rows[0].count || 0);

    // gunluk_id sütununu garantiye al (Hata vermemesi için)
    try {
        await sql`ALTER TABLE odemeler ADD COLUMN IF NOT EXISTS gunluk_id INTEGER;`;
    } catch (e) {
        console.warn("odemeler sütun ekleme hatası:", e.message);
    }

    // 4. Detaylı Ödemeler Listesi (Normal ve günlük müşteri isimleriyle birleştirilerek)
    const listRes = await sql`
        SELECT o.*, COALESCE(m.isim, g.isim) as musteri_isim 
        FROM odemeler o 
        LEFT JOIN musteriler m ON o.musteri_id = m.id AND o.gunluk_id IS NULL
        LEFT JOIN gunluk_ziyaretler g ON o.gunluk_id = g.id
        ORDER BY o.tarih DESC;
    `;
    const odemelerListesi = listRes.rows;

    // 5. Ödeme Bekleyen Müşteriler Listesi (kalan_bakiye > 0)
    const pendingClientsRes = await sql`
        SELECT id, isim, aylik_ucret, kalan_bakiye, durum 
        FROM musteriler 
        WHERE kalan_bakiye > 0 
        ORDER BY kalan_bakiye DESC;
    `;
    const bekleyenlerListesi = pendingClientsRes.rows;

    return NextResponse.json({
      toplamTahsilat,
      toplamBekleyen,
      tahsilatSayisi,
      odemelerListesi,
      bekleyenlerListesi
    });
  } catch (error) {
    console.error("Raporlar API hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
