import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Sayfa hangi günü istiyorsa onu alıyoruz (Varsayılan: 6)
    const gun = searchParams.get("gun") || "6";

    // Buluttaki Neon veritabanından müşterileri çekiyoruz
    const { rows } = await sql`
            SELECT * FROM musteriler 
            WHERE planlanan_gun = ${parseInt(gun)} OR durum = 'Bekliyor'
            ORDER BY id ASC
        `;

    // Verileri ön yüze sapasağlam paketleyip gönderiyoruz
    return NextResponse.json(rows);
  } catch (error) {
    // Eğer veritabanı bağlantısında bir sorun olursa terminale kabak gibi yazdıracak
    console.error("=== VERİTABANI BAĞLANTI HATASI ===");
    console.error(error.message);
    console.error("=================================");

    return NextResponse.json({ hata: error.message }, { status: 500 });
  }
}
