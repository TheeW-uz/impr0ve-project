import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JwtPayload } from '@/lib/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}

// ─── Extract & verify token from Authorization header ─────────────────────────
export function getAuthUser(req: NextRequest): JwtPayload | null {
  try {
    const header = req.headers.get('authorization') ?? '';
    if (!header.startsWith('Bearer ')) return null;
    const token = header.slice(7);
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

// ─── HOF: wrap a route handler with auth check ────────────────────────────────
type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, string>; user: JwtPayload }
) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, ctx: { params: Record<string, string> }) => {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, { ...ctx, user });
  };
}

// ─── Standard API response helpers ────────────────────────────────────────────
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// ─── Validate required body fields ────────────────────────────────────────────
export function validateBody(
  body: Record<string, unknown>,
  required: string[]
): string | null {
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return `Field "${field}" is required`;
    }
  }
  return null;
}
