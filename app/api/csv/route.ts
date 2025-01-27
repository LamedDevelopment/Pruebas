/*
  /api/csv/
*/
import { NextResponse } from "next/server";
import pool from "@/app/db/db";
import { parse } from "json2csv";
import { validateAdmin } from "../middleware/auth";


// Función para obtener comerciantes con sus datos adicionales
const getComerciantesActivos = async () => {
  const query = `
    SELECT 
      c.nombre_completo AS "nombreCompleto",
      c.ciudad,
      c.telefono,
      c.correo_electronico AS "correoElectronico",
      c.fecha_registro AS "fechaRegistro",
      c.estado,
      COUNT(e.id_establecimiento) AS "cantidadEstablecimientos",
      COALESCE(SUM(e.ingresos), 0) AS "totalIngresos",
      COALESCE(SUM(e.numero_empleados), 0) AS "cantidadEmpleados"
    FROM comerciante c
    LEFT JOIN establecimiento e ON e.id_comerciante = c.id_comerciante
    WHERE c.estado = 'Activo'
    GROUP BY c.id_comerciante
    ORDER BY c.nombre_completo;
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Ruta GET para exportar CSV
export async function GET(req: Request) {
  try {
    const tokenValidationAdminResponse = await validateAdmin(req);
    if (tokenValidationAdminResponse.status !== 200 ) {
      return tokenValidationAdminResponse;
    }

    const comerciantes = await getComerciantesActivos();    
    const csv = parse(comerciantes);    
    const headers = new Headers({
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="comerciantes.csv"',
    });

    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error("Error al exportar comerciantes:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error al exportar comerciantes" }),
      { status: 500 }
    );
  }
}
