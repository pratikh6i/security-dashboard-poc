import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'cloudguard-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
    return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
}

export interface TokenPayload {
    userId: number;
    username: string;
}

export function generateToken(payload: TokenPayload): string {
    return sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = verify(token, JWT_SECRET) as JwtPayload & TokenPayload;
        return { userId: decoded.userId, username: decoded.username };
    } catch {
        return null;
    }
}

export function getTokenFromHeaders(headers: Headers): string | null {
    const authHeader = headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    // Also check cookie
    const cookies = headers.get('cookie');
    if (cookies) {
        const match = cookies.match(/auth_token=([^;]+)/);
        if (match) return match[1];
    }

    return null;
}

export function requireAuth(headers: Headers): TokenPayload {
    const token = getTokenFromHeaders(headers);
    if (!token) {
        throw new Error('Authentication required');
    }

    const payload = verifyToken(token);
    if (!payload) {
        throw new Error('Invalid or expired token');
    }

    return payload;
}
