/*
  /api/comer/
*/
import { NextResponse } from "next/server";
import pool from "@/app/db/db";
import { authMiddleware, validateAdmin } from "../middleware/auth";

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

// Función para actualizar un comerciante por ID
export const updateComercianteById = async (id: number, camposActualizacion: any) => {
  // Construir la consulta dinámica
  const keys = Object.keys(camposActualizacion);
  const values = Object.values(camposActualizacion);

  // Validar que haya campos para actualizar
  if (keys.length === 0) {
    throw new Error("No se proporcionaron campos para actualizar.");
  }

  // Generar la parte dinámica de la consulta
  const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(", ");

  // Construir la consulta completa
  const query = `UPDATE comerciante SET ${setClause} WHERE id_comerciante = $1 RETURNING *`;

  // Ejecutar la consulta
  const result = await pool.query(query, [id, ...values]);

  // Devolver el comerciante actualizado
  return result.rows[0];
};

// Función para Eliminar/Cambio de estado de un comerciante por su ID
export const deleteComercianteEstado = async (id: number) => {
  try {
    const result = await pool.query(
      "UPDATE comerciante SET estado = $1 WHERE id_comerciante = $2 RETURNING *",
      ["Inactivo", id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar el estado del comerciante:", error);
    return null;
  }
};




// Función para crear un nuevo comerciante
export const createComerciante = async (comerciante: {
  nombre_completo: string;
  ciudad: string;
  telefono: string;
  correo_electronico: string;
  estado: string;
  usuario_actualizacion: number;
}) => {
  const {
    nombre_completo,
    ciudad,
    telefono,
    correo_electronico,
    estado,
    usuario_actualizacion,
  } = comerciante;

  const result = await pool.query(
    "INSERT INTO comerciante (nombre_completo, ciudad, telefono, correo_electronico, estado, usuario_actualizacion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [nombre_completo, ciudad, telefono, correo_electronico, estado, usuario_actualizacion]
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
    if (body.nombre_completo && body.correo_electronico && body.telefono && body.estado === 'Activo') {
      console.log('Entramos al POST IF, Datos con Nombres: ',body);
      const nuevoComerciante = await createComerciante({
        nombre_completo: body.nombre_completo,
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

  try {
    // Leer el cuerpo de la solicitud
    const body = await req.json();

    // Validar si el ID está presente
    if (!body.id_comerciante) {
      return NextResponse.json(
        { ok: false, error: "Es necesario proporcionar el ID del comerciante." },
        { status: 400 }
      );
    }

    // Validar que al menos un campo esté presente para actualizar
    if (!body.nombre_completo && !body.ciudad && !body.telefono && !body.correo_electronico && !body.estado) {
      return NextResponse.json(
        { ok: false, error: "No hay datos suficientes para actualizar el comerciante." },
        { status: 400 }
      );
    }

    // Construir el objeto con los campos a actualizar
    const camposActualizacion: any = {};
    if (body.nombre_completo) camposActualizacion.nombre_completo = body.nombre_completo;
    if (body.ciudad) camposActualizacion.ciudad = body.ciudad;
    if (body.telefono) camposActualizacion.telefono = body.telefono;
    if (body.correo_electronico) camposActualizacion.correo_electronico = body.correo_electronico;
    if (body.estado) camposActualizacion.estado = body.estado;
    if (body.usuario_actualizacion) camposActualizacion.usuario_actualizacion = body.usuario_actualizacion;

    // Llamar a la función para actualizar al comerciante
    const comercianteActualizado = await updateComercianteById(body.id_comerciante, camposActualizacion);

    if (!comercianteActualizado) {
      return NextResponse.json(
        { ok: false, error: "No se encontró el comerciante o no se pudo actualizar." },
        { status: 404 }
      );
    }

    // Responder con los datos del comerciante actualizado
    return NextResponse.json({ ok: true, msg: comercianteActualizado });
  } catch (error) {
    console.error("Error en el método PUT:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req: Request) {
  const tokenValidationAdminResponse = await validateAdmin(req);
  if (tokenValidationAdminResponse.status !== 200 ) {
    return tokenValidationAdminResponse;
  }

  try {
    const { id_comerciante } = await req.json();

    console.log(id_comerciante)

    if (!id_comerciante) {
      return NextResponse.json(
        { ok: false, error: "El ID del comerciante es requerido" },
        { status: 400 }
      );
    }

    const result = await deleteComercianteEstado(id_comerciante);

    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Comerciante no encontrado o ya está inactivo ó Eliminado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      msg: "El comerciante ha sido marcado como inactivo ó Eliminado",
    });
  } catch (error) {
    console.error("Error al actualizar el estado del comerciante:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

