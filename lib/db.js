import mysql from 'mysql2/promise';

let globalPool;

export function getPool() {
  if (!globalPool) {
    const host = process.env.MYSQL_HOST || 'localhost';
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '12345678';
    const database = process.env.MYSQL_DATABASE || 'test';
    const port = Number(process.env.MYSQL_PORT || 3306);

    globalPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
    });
  }
  return globalPool;
}

export async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}




