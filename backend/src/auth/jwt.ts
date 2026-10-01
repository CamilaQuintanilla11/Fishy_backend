import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
    const s = process.env.JWT_SECRET;
    if (!s) {
        throw new Error('JWT_SECRET no definido en el entorno');
    }
    return s;
}

export interface JwtPayload {
    sub: string;
    correo: string;
    tieneRol: string;
    rolNombre: string;
    type: 'access' | 'refresh';
    iat: number;
    exp: number;
}

function now(): number {
    return Math.floor(Date.now() / 1000);
}

function b64url(json: object): string {
    return Buffer.from(JSON.stringify(json)).toString('base64url');
}

function hmac(data: string): string {
    return createHmac('sha256',getSecret()).update(data).digest('base64url');
}

export function sign(payload: Omit<JwtPayload, 'iat' | 'exp'>, ttlSeconds: number): string {
    const header = b64url({ alg: 'HS256', typ: 'JWT' });
    const body = b64url({...payload, iat: now(), exp: now() + ttlSeconds}); 
    const signature = hmac(`${header}.${body}`);
    return `${header}.${body}.${signature}`;
}

export function verify(token: string): JwtPayload | null {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) {
        return null;
    }
    const esperada = hmac(`${header}.${body}`);

    const expectedSignature = Buffer.from(signature);
    const providedSignature = Buffer.from(esperada);

    if (expectedSignature.length !== providedSignature.length || !timingSafeEqual(expectedSignature, providedSignature)) {
        return null;
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as JwtPayload;
    if (payload.exp < now()) {
        return null;
    }
    return payload;
}
