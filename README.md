🚀 API Inventory Lab - Testes & Integração com Banco de Dados
Este projeto é um laboratório de testes focado no ciclo completo de um CRUD, utilizando Node.js, Fastify e MySQL. O diferencial deste repositório é a integração real com banco de dados via Docker, permitindo validar se as operações da API estão sendo persistidas corretamente.

🛠️ Tecnologias e Dependências
Framework: Fastify (Alta performance)

Banco de Dados: MySQL 8.0 (Executado via Docker)

Segurança: Dotenv para gestão de variáveis de ambiente

Testes: Postman (Scripts de validação de DB e contrato)

📋 Funcionalidades da API
A API possui as seguintes rotas e lógicas implementadas no server.js:

POST /products: Cadastra um novo produto (nome, preço, quantidade).

GET /products: Lista todos os produtos cadastrados.

PUT /products/:id: Atualiza as informações de um produto existente.

DELETE /products/:id: Remove um produto específico.

GET /test/check-db/:id: Rota de Teste Especial que valida diretamente no banco de dados se um ID existe, retornando erro 404 caso tenha sido deletado.

DELETE /test/clear-database: Rota de segurança com trava via Header (admin-token) para resetar a tabela usando TRUNCATE.

⚙️ Configuração do Ambiente

1. Pré-requisitos
   Node.js instalado.

Docker e Docker Compose instalados.

2. Instalação
   Clone o repositório e instale as dependências:

Bash

npm install 3. Banco de Dados
O projeto utiliza Docker para subir o MySQL rapidamente:

Bash

docker-compose up -d 4. Variáveis de Ambiente
Configure o seu arquivo .env seguindo o modelo do .env.example:

Snippet de código

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=inventory_db 5. Execução
Para iniciar o servidor:

Bash

node server.js
🧪 Como Testar no Postman
Importe as collections localizadas na pasta /postman

No fluxo de teste, utilize o Collection Runner.

Validação de Banco: Após cada POST ou DELETE, utilize a rota /test/check-db/:id para confirmar se o dado realmente foi criado ou removido do MySQL.

Limpeza Segura: Para rodar os testes novamente do zero, utilize a rota de limpeza passando o header admin-token.

📂 Estrutura do Repositório
server.js: Código principal com rotas e conexão MySQL.

docker-compose.yml: Configuração do container de banco de dados.

.env.example: Modelo de configuração para novos usuários.

.gitignore: Proteção para não subir node_modules e senhas para o GitHub.

Desenvolvido por Kian Chaves 🚀
