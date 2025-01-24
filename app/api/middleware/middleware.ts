
import { NextResponse } from "next/server";
import { authMiddleware } from "./auth";

// Aplicar middleware de autenticación en las rutas privadas
export function middleware(req: Request) {
  const url = new URL(req.url);

  // Asegúrate de que este middleware se aplique solo a las rutas que requieran autenticación
  if (url.pathname.startsWith('/api/comerciantes')) {
    return authMiddleware(req);
  }

  return NextResponse.next();
}
