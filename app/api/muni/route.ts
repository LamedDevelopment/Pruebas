import { NextResponse } from "next/server";
import pool from "@/app/db/db";
import redis from "@/app/lib/redis";

export const getMunicipios = async () => {
    const result = await pool.query("SELECT * FROM municipios");
    return result.rows;
  };

  export async function GET() {

    try {
      const cacheKey = 'municipios';
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        console.log('Datos recuperados del caché');
        return NextResponse.json({
          ok: true,
          message: 'Datos recuperados del caché',
          data: JSON.parse(cachedData),
        });
      }

      const result = await getMunicipios();
      const municipios = result.map(muni => ({
        cod_muni: muni.cod_muni,
        nombre_muni: muni.nombre_muni,
        departamento: muni.departamento,
        provincia: muni.provincia,
        nombre: muni.nombre,
      }));

        await redis.set(cacheKey, JSON.stringify(municipios), 'EX', 3600);

        return NextResponse.json({
                ok: true,
                msg: municipios,
              });

    } catch (error) {
        console.log(error);
    }
    
}
export function POST() {

}
export function DELETE() {

}
export function PUSH() {

}