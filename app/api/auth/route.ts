import { testDBConnection,  } from "@/app/db/db";
import pool from "@/app/db/db";
import { generateToken } from "@/app/lib/jwt";
import { NextResponse } from "next/server";

export async function GET() {
    try {
      await testDBConnection(); // Probar la conexión
      return NextResponse.json({ ok: true, message: "Conexión a la base de datos exitosa" });
    } catch (error) {
      console.error("Error en la conexión:", error);
      return NextResponse.json(
        { ok: false, error: "Error al conectar con la base de datos" },
        { status: 500 }
      );
    }
  }
  
  export const getUsers = async () => {
    const result = await pool.query("SELECT * FROM usuario");
    return result.rows;
  };
  
  export async function POST(req: Request) {
    try {
      const { correo_electronico, contrasena } = await req.json();
  
      // Validación de campos
      if (!correo_electronico || !contrasena) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }
  
      const users = await getUsers();      
  
      const user = users.find(
        (u: { correo_electronico: string }) => u.correo_electronico === correo_electronico
      );
  
      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
  
      // Validar la contraseña (en un caso real deberías usar un hash, como bcrypt)
      if (user.contrasena !== contrasena) {
        return NextResponse.json(
          { error: "Contraseña incorrecta" },
          { status: 401 }
        );
      }

      const token = generateToken(user.id_usuario, user.correo_electronico, user.rol);
  
      // Respuesta exitosa
      return NextResponse.json({
        ok: true,
        msg: token,
      });
    } catch (error) {
      console.error("Error en el servidor:", error);
      return NextResponse.json(
        { ok: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }
  