const fastify = require("fastify")({ logger: true });
const mysql = require("mysql2/promise");
require("dotenv").config();

// Configuração da conexão usando varáveis de ambiente
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD, // Pega do .env
  database: process.env.DB_NAME || "inventory_db",
};

// Rota para cadastrar produto
fastify.post("/products", async (request, reply) => {
  const { name, price, quantity } = request.body;
  const connection = await mysql.createConnection(dbConfig);

  // Insere no banco
  const [result] = await connection.execute(
    "INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)",
    [name, price, quantity]
  );

  await connection.end();
  return { id: result.insertId, message: "Produto salvo com sucesso!" };
});

// Inicialização e criação da tabela
const start = async () => {
  try {
    // Ensure database exists (connect without database)
    const adminConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
    );
    await adminConn.end();

    // Connect to the specific database and ensure table exists
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10,2),
                quantity INT
            )
        `);
    await connection.end();

    await fastify.listen({ port: process.env.PORT || 3000 });
    console.log("Server started and DB ensured on port 3000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
// Rota de teste para verificar se o produto foi salvo
fastify.get("/test/check-db/:id", async (request, reply) => {
  const { id } = request.params;
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute(
    "SELECT * FROM products WHERE id = ?",
    [id]
  );
  await connection.end();

  if (rows.length === 0)
    return reply.status(404).send({ error: "Não encontrado no banco" });
  return rows[0];
});
// Rota para deletar um produto específico (Útil para limpeza de testes)
fastify.delete("/products/:id", async (request, reply) => {
  const { id } = request.params;
  const connection = await mysql.createConnection(dbConfig);

  await connection.execute("DELETE FROM products WHERE id = ?", [id]);

  await connection.end();
  return { message: `Produto ${id} removido com sucesso!` };
});

// Rota para alterar um produto existente
fastify.put("/products/:id", async (request, reply) => {
  const { id } = request.params;
  const { name, price, quantity } = request.body;
  const connection = await mysql.createConnection(dbConfig);

  // Executa o UPDATE no banco de dados
  const [result] = await connection.execute(
    "UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?",
    [name, price, quantity, id]
  );

  await connection.end();

  // Verifica se algum registro foi de fato alterado
  if (result.affectedRows === 0) {
    return reply
      .status(404)
      .send({ error: "Produto não encontrado para alteração" });
  }

  return { message: "Produto atualizado com sucesso!" };
});
// Rota de limpeza com trava de segurança
fastify.delete('/test/clear-database', async (request, reply) => {
    // Definimos uma chave de segurança (pode colocar no seu .env depois)
    const SECURITY_KEY = process.env.SECURITY_KEY; 
    
    // Captura a chave enviada no cabeçalho 'admin-token'
    const userKey = request.headers['admin-token'];

    if (userKey !== SECURITY_KEY) {
        return reply.status(403).send({ error: 'Acesso negado: Chave de segurança inválida!' });
    }

    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute('TRUNCATE TABLE products');
        return { message: 'Banco de dados limpo com sucesso!' };
    } catch (err) {
        return reply.status(500).send({ error: 'Erro ao limpar', details: err.message });
    } finally {
        await connection.end();
    }
});
start();
