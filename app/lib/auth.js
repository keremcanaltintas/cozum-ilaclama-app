import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || "usak-cozum-ilaclama-secret-key-987654321-secure!";
const encoder = new TextEncoder();

// Helper to convert ArrayBuffer to Base64url string
function base64url(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

// Helper to decode Base64url string to Uint8Array
function base64urlDecode(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// 1. Password Hashing (PBKDF2 with SHA-256)
export async function hashPassword(password) {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    
    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBytes,
            iterations: 10000,
            hash: 'SHA-256'
        },
        baseKey,
        256 // 32 bytes (256 bits)
    );
    
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${saltHex}:${hashHex}`;
}

// 2. Password Verification
export async function verifyPassword(password, storedHash) {
    try {
        const [saltHex, hashHex] = storedHash.split(':');
        const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        
        const baseKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits']
        );
        
        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: saltBytes,
                iterations: 10000,
                hash: 'SHA-256'
            },
            baseKey,
            256
        );
        
        const calculatedHashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex === calculatedHashHex;
    } catch (e) {
        console.error("Password verify error:", e);
        return false;
    }
}

// 3. JWT Token Signing (HMAC SHA-256)
export async function signToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerStr = base64url(encoder.encode(JSON.stringify(header)));
    
    // Set token expiration to 7 days
    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const payloadStr = base64url(encoder.encode(JSON.stringify({ ...payload, exp })));
    
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(SECRET_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(`${headerStr}.${payloadStr}`)
    );
    
    const signatureStr = base64url(signatureBuffer);
    return `${headerStr}.${payloadStr}.${signatureStr}`;
}

// 4. JWT Token Verification
export async function verifyToken(token) {
    if (!token) return null;
    try {
        const [headerStr, payloadStr, signatureStr] = token.split('.');
        
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(SECRET_KEY),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
        
        const data = encoder.encode(`${headerStr}.${payloadStr}`);
        const signatureBytes = base64urlDecode(signatureStr);
        
        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signatureBytes,
            data
        );
        
        if (!isValid) return null;
        
        const decoder = new TextDecoder();
        const payload = JSON.parse(decoder.decode(base64urlDecode(payloadStr)));
        
        // Expiration check
        if (payload.exp && Date.now() > payload.exp) {
            return null;
        }
        
        return payload;
    } catch (e) {
        console.error("JWT verify error:", e);
        return null;
    }
}
