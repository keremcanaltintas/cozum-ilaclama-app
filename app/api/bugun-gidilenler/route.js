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
        SELECT m.*, z.islem_tarihi as ziyaret_tarihi
        FROM ziyaretler z
        JOIN musteriler m ON z.musteri_id = m.id
        WHERE z.gun = ${parseInt(gun)}
        ORDER BY z.id DESC;
      `;
      rows = res.rows;
    } else {
      const res = await sql`
        SELECT m.*, z.tarih as ziyaret_tarihi
        FROM ziyaretler z
        JOIN musteriler m ON z.musteri_id = m.id
        WHERE z.gun = ${parseInt(gun)}
        ORDER BY z.id DESC;
      `;
      rows = res.rows;
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Bugün gidilenler API hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
