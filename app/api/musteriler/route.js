import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
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
