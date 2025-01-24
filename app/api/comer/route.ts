import { NextResponse } from "next/server";
import pool from "@/app/db/db";
import { authMiddleware } from "../middleware/auth";

// Función para obtener comerciantes con paginación
export const getComerciante = async (skip: number, limit: number) => {
  const result = await pool.query(
    "SELECT * FROM comerciante LIMIT $1 OFFSET $2",
    [limit, skip]
  );
  return result.rows;
};

// Función para obtener el total de comerciantes
export const getTotalComerciantes = async () => {
  const result = await pool.query("SELECT COUNT(*) FROM comerciante");
  return parseInt(result.rows[0].count);
};

// Función para buscar un comerciante por ID
export const getComercianteById = async (id: number) => {
  const result = await pool.query("SELECT * FROM comerciante WHERE id_comerciante = $1", [id]);
  return result.rows[0];
};

// Función para crear un nuevo comerciante
export const createComerciante = async (comerciante: {
  nombre: string;
  ciudad: string;
  telefono: string;
  correo_electronico: string;
  estado: string;
  usuario_actualizacion: number;
}) => {
  const {
    nombre,
    ciudad,
    telefono,
    correo_electronico,
    estado,
    usuario_actualizacion,
  } = comerciante;

  const result = await pool.query(
    "INSERT INTO comerciante (nombre, ciudad, telefono, correo_electronico, estado, usuario_actualizacion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [nombre, ciudad, telefono, correo_electronico, estado, usuario_actualizacion]
  );
  return result.rows[0];
};

// Método GET para manejar la solicitud
export async function GET(req: Request) {
  
  const tokenValidationResponse = await authMiddleware(req);

  if (tokenValidationResponse.status !== 200) {
    return tokenValidationResponse;
  }

  
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '5');
  const skip = (page - 1) * limit;

  try {
    
    const result = await getComerciante(skip, limit);

    
    const totalComerciantes = await getTotalComerciantes();
    const totalPages = Math.ceil(totalComerciantes / limit);

    
    return NextResponse.json({
      ok: true,
      msg: result,
      pagination: {
        page,
        limit,
        skip,
        totalComerciantes,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error obteniendo comerciantes:', error);
    return NextResponse.json({ ok: false, error: 'Error al obtener los comerciantes' }, { status: 500 });
  }
}

// Método POST
export async function POST(req: Request) {
  // Validación del token
  const tokenValidationResponse = await authMiddleware(req);

  if (tokenValidationResponse.status !== 200) {
    return tokenValidationResponse;
  }

  try {
    // Leer el cuerpo de la solicitud
    const body = await req.json();
    console.log(body);

    // Verificar si es una consulta por ID
    if (body.id) {
      const comerciante = await getComercianteById(body.id);

      if (!comerciante) {
        return NextResponse.json(
          { ok: false, error: "Comerciante no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ ok: true, msg: comerciante });
    }

    // Crear un nuevo comerciante
    if (body.nombre && body.email && body.telefono && body.ciudad) {
      const nuevoComerciante = await createComerciante({
        nombre: body.nombre_completo,
        ciudad: body.ciudad,
        telefono: body.telefono,
        correo_electronico: body.correo_electronico,
        estado: body.estado,
        usuario_actualizacion: body.usuario_actualizacion,
      });

      return NextResponse.json({ ok: true, msg: nuevoComerciante });
    }

    // Si no se cumple ningún caso válido
    return NextResponse.json(
      { ok: false, error: "Datos insuficientes para procesar la solicitud" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en el método POST:", error);
    return NextResponse.json({ ok: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT
export async function PUT(req: Request) {
  const tokenValidationResponse = await authMiddleware(req); 
  if (tokenValidationResponse.status !== 200) {
      return tokenValidationResponse;
  }

  // Aquí va la lógica para actualizar un comerciante
  return NextResponse.json({ ok: true, msg: 'Comerciante actualizado' });
}

// DELETE
export async function DELETE(req: Request) {
  const tokenValidationResponse = await authMiddleware(req); 
  if (tokenValidationResponse.status !== 200) {
      return tokenValidationResponse;
  }

  // Aquí va la lógica para eliminar un comerciante
  return NextResponse.json({ ok: true, msg: 'Comerciante eliminado' });
}