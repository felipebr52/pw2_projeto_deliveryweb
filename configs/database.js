import mysql from 'mysql2/promise';
// Função para conectar ao banco de dados MySQL usando as variáveis de ambiente
export async function conectarDB() {
    const configs = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'delivery_db',
        port: process.env.DB_PORTA || 3306
    }
    console.log("DB Configs:", configs);
    const con = await mysql.createConnection(configs);
    console.log("Ligação feita com sucesso!");
    return con;
}
