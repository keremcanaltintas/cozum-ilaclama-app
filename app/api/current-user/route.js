import { NextResponse } from "next/server";
import { verifyToken } from "../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ success: false, error: "Oturum bulunamadı." }, { status: 401 });
        }

        return NextResponse.json({ 
            success: true, 
            user: {
                id: payload.id,
                email: payload.email,
                isim: payload.isim,
                rol: payload.rol
            }
        });
    } catch (error) {
        console.error("Kullanıcı bilgisi getirme hatası:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
