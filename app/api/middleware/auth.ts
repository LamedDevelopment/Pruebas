import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function authMiddleware(req: Request) {
    try {
      const token = req.headers.get('x-token');
      console.log(token);
  
      if (!token) {
        return NextResponse.json({ ok: false, error: 'Token de autenticación no proporcionado' }, { status: 401 });
      }
  
      // Verificamos el token
      const decoded = jwt.verify(token, SECRET_KEY);

      if (!decoded || !decoded.role || !decoded.email) {
        return NextResponse.json(
            { ok: false, error: 'Token inválido o mal formado' },
            { status: 401 }
        );
    }
  
      return NextResponse.next();
  
    } catch (error) {
        console.log(error);
      return NextResponse.json({ ok: false, error: 'Token inválido o expirado' }, { status: 401 });
    }
  }
