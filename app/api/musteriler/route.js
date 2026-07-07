import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Otomatik veritabanı güncellemesi (Migration)
    try {
      await sql`ALTER TABLE musteriler ADD COLUMN IF NOT EXISTS ziyaret_gunleri INTEGER[];`;
      await sql`
        UPDATE musteriler 
        SET ziyaret_gunleri = ARRAY[planlanan_gun] 
        WHERE ziyaret_gunleri IS NULL AND planlanan_gun IS NOT NULL;
      `;
    } catch (e) {
      console.error("Otomatik veritabanı güncelleme hatası:", e.message);
    }
    const { rows } = await sql`
        SELECT * FROM musteriler 
        ORDER BY id DESC;
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Müşteri listesi çekme hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
