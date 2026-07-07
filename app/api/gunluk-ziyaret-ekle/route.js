import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { isim, telefon, ucret } = await request.json();

    if (!isim || !ucret) {
      return NextResponse.json({ hata: "Müşteri adı ve ücret alanları zorunludur." }, { status: 400 });
    }

    // 1. Veritabanında tabloları/sütunları garantiye al (Self-Healing Migration)
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

    await sql`
        ALTER TABLE odemeler ADD COLUMN IF NOT EXISTS gunluk_id INTEGER;
    `;

    // 2. Günlük Ziyaret Ekle (Kalan bakiye başlangıçta ücrete eşittir)
    await sql`
        INSERT INTO gunluk_ziyaretler (isim, telefon, ucret, kalan_bakiye, durum)
        VALUES (${isim}, ${telefon || null}, ${parseInt(ucret)}, ${parseInt(ucret)}, 'Bekliyor');
    `;

    return NextResponse.json({ success: true, mesaj: "Günlük ziyaret başarıyla eklendi!" });
  } catch (error) {
    console.error("Günlük ziyaret ekleme hatası:", error);
    return NextResponse.json({ hata: "Veritabanı hatası: " + error.message }, { status: 500 });
  }
}
