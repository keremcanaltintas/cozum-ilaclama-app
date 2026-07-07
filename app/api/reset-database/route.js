import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Ziyaretler, Ödemeler, Günlük Ziyaretler ve Müşteriler tablolarındaki verileri silip ID'leri sıfırla
        await sql`TRUNCATE TABLE ziyaretler RESTART IDENTITY CASCADE;`;
        await sql`TRUNCATE TABLE odemeler RESTART IDENTITY CASCADE;`;
        await sql`TRUNCATE TABLE gunluk_ziyaretler RESTART IDENTITY CASCADE;`;
        await sql`TRUNCATE TABLE musteriler RESTART IDENTITY CASCADE;`;
        
        return NextResponse.json({ 
            success: true, 
            message: "Veritabanı başarıyla sıfırlandı! Tüm veriler temizlendi ve ID sayaçları 1'e çekildi. Müşterilerinizi sıfırdan eklemeye başlayabilirsiniz." 
        });
    } catch (error) {
        console.error("Veritabanı sıfırlama hatası:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
