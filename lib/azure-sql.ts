import sql from "mssql";

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getSqlConfig(): sql.config {
  const server = process.env.AZURE_SQL_SERVER;
  const database = process.env.AZURE_SQL_DATABASE;
  const user = process.env.AZURE_SQL_USER;
  const password = process.env.AZURE_SQL_PASSWORD;

  if (!server || !database || !user || !password) {
    throw new Error("Azure SQL environment variables are missing.");
  }

  return {
    server,
    database,
    user,
    password,
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  };
}

export async function getSqlPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(getSqlConfig()).connect();
  }

  return poolPromise;
}

export { sql };
