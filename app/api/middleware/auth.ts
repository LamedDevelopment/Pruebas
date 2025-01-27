import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || '';

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

export const validateAdmin = async (req: Request) => {
  try {
    const token = req.headers.get('x-token');
    if (!token) {
      return NextResponse.json({ ok: false, error: "Token no proporcionado" }, { status: 401 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { role } = payload as { role: string };

    if (role !== "Admin") {
      return NextResponse.json(
        { ok: false, error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, user: payload }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ ok: false, error: "Token inválido o expirado" }, { status: 401 });
  }
};

