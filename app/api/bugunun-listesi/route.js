import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    mesaj: "API sorunsuz calisiyor, hata veritabaninda!",
  });
}
