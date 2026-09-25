import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "test",
  ssl:
    process.env.DB_SSL === "true"
      ? {
          minVersion: "TLSv1.2",
        }
      : undefined,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 20000,
});

export async function checkDbConnection() {
  try {
    const connection = await pool.getConnection();

    try {
      await connection.ping();

      return {
        ok: true,
        message: "Database connection successful",
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Database connection failed:", error);

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Database connection failed",
    };
  }
}

export default pool;