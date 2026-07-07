import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    const response = NextResponse.json({ success: true, message: "Çıkış başarılı!" });
    
    // Cookie'yi sil
    response.cookies.set({
        name: 'auth_token',
        value: '',
        maxAge: 0,
        path: '/'
    });
    
    return response;
}
