import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

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

    // 1. Toplam Tahsil Edilen Miktar
    const totalPaidRes = await sql`SELECT SUM(odenen_miktar) as total FROM odemeler;`;
    const toplamTahsilat = Number(totalPaidRes.rows[0].total || 0);

    // 2. Toplam Bekleyen Alacak
    const totalPendingRes = await sql`SELECT SUM(kalan_bakiye) as total FROM musteriler;`;
    const toplamBekleyen = Number(totalPendingRes.rows[0].total || 0);

    // 3. Toplam Tahsilat Sayısı
    const countRes = await sql`SELECT COUNT(*) as count FROM odemeler;`;
    const tahsilatSayisi = Number(countRes.rows[0].count || 0);

    // 4. Detaylı Ödemeler Listesi (Müşteri isimleriyle birleştirilerek)
    const listRes = await sql`
        SELECT o.*, m.isim as musteri_isim 
        FROM odemeler o 
        JOIN musteriler m ON o.musteri_id = m.id 
        ORDER BY o.tarih DESC;
    `;
    const odemelerListesi = listRes.rows;

    return NextResponse.json({
      toplamTahsilat,
      toplamBekleyen,
      tahsilatSayisi,
      odemelerListesi
    });
  } catch (error) {
    console.error("Raporlar API hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
