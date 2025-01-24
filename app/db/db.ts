import { Pool } from 'pg';

// Crear una nueva instancia de conexión a la base de datos
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432', 10),
});

// Probar la conexión a la base de datos
export const testDBConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("🔗 Conexión exitosa a PostgreSQL");
    client.release(); // Liberar el cliente después de la prueba
  } catch (error) {
    console.error("❌ Error al conectar con PostgreSQL:", error);
  }
};

// export const getUsers = async () => {
//   const result = await pool.query("SELECT * FROM usuario");
//   return result.rows;
// };

export default pool;

