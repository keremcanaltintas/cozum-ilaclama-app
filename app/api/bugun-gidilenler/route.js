import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gun = searchParams.get("gun") || new Date().getDate().toString();

    // ziyaretler tablosunu garantiye al
    await sql`
        CREATE TABLE IF NOT EXISTS ziyaretler (
            id SERIAL PRIMARY KEY,
            musteri_id INTEGER NOT NULL,
            gun INTEGER NOT NULL,
            tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Bugün gidilen müşterileri getir (Müşteri bilgileriyle birleştirerek)
    const { rows } = await sql`
        SELECT m.*, z.tarih as ziyaret_tarihi
        FROM ziyaretler z
        JOIN musteriler m ON z.musteri_id = m.id
        WHERE z.gun = ${parseInt(gun)}
        ORDER BY z.id DESC;
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Bugün gidilenler API hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
