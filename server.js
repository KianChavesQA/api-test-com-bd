const fastify = require("fastify")({ logger: true });
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "inventory_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const productSchema = {
  body: {
    type: "object",
    required: ["name", "price", "quantity"],
    properties: {
      name: {
        type: "string",
        // Regex: ^(?!\s*$).+
        // Não permite strings compostas apenas por espaços e exige pelo menos 1 caractere real.
        pattern: "^(?!\\s*$).+",
        minLength: 3,
      },
      price: { type: "number", exclusiveMinimum: 0 },
      quantity: { type: "integer", minimum: 0 },
    },
  },
};

// --- ROTAS CRUD ---

// 1. CREATE
fastify.post("/products", { schema: productSchema }, async (request, reply) => {
  try {
    const { name, price, quantity } = request.body;
    const [result] = await pool.execute(
      "INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)",
      [name, price, quantity],
    );
    return reply
      .code(201)
      .send({ id: result.insertId, message: "Produto criado!" });
  } catch (err) {
    return reply.status(500).send({ error: "Falha ao salvar produto" });
  }
});

// 2. UPDATE (Restaura e valida se existia)
fastify.put(
  "/products/:id",
  { schema: productSchema },
  async (request, reply) => {
    const { id } = request.params;
    const { name, price, quantity } = request.body;
    try {
      const [result] = await pool.execute(
        "UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?",
        [name, price, quantity, id],
      );
      if (result.affectedRows === 0)
        return reply.status(404).send({ error: "Não encontrado" });
      return { message: "Produto atualizado!" };
    } catch (err) {
      return reply.status(500).send({ error: "Erro no update" });
    }
  },
);

// 3. DELETE (Restaura a funcionalidade de remover item único)
fastify.delete("/products/:id", async (request, reply) => {
  const { id } = request.params;
  try {
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [
      id,
    ]);

    // REFUTAÇÃO: Se eu tentar deletar um ID que não existe, o sistema deve avisar
    if (result.affectedRows === 0) {
      return reply
        .status(404)
        .send({ error: "Produto não encontrado para deleção" });
    }

    // 204 No Content é o ideal para DELETE, mas 200 com mensagem facilita o seu teste inicial
    return { message: `Produto ${id} removido com sucesso!` };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: "Erro ao deletar produto" });
  }
});

// --- ROTAS DE TESTE/ADMIN ---

// GET: Check DB
fastify.get("/test/check-db/:id", async (request, reply) => {
  try {
    const { id } = request.params;
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0)
      return reply.status(404).send({ error: "Não encontrado" });
    return rows[0];
  } catch (err) {
    return reply.status(500).send({ error: "Erro na consulta" });
  }
});

// DELETE: Clear Database (Limpeza total)
fastify.delete("/test/clear-database", async (request, reply) => {
  const userKey = request.headers["admin-token"];
  if (userKey !== process.env.SECURITY_KEY) {
    return reply.status(403).send({ error: "Acesso negado!" });
  }
  try {
    await pool.query("TRUNCATE TABLE products");
    return { message: "Banco limpo!" };
  } catch (err) {
    return reply.status(500).send({ error: "Erro na limpeza" });
  }
});

const start = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2),
        quantity INT
      )
    `);
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    console.log("🚀 Kian aprovou o início do servidor na porta 3000");
  } catch (err) {
    process.exit(1);
    fastify.log.error(err);
  }
};
start();
