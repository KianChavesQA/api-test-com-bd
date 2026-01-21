# 🚀 API Inventory Lab — Testes & Integração com Banco de Dados

Uma sandbox prática para validar o ciclo completo de um CRUD (Create, Read, Update, Delete) com Node.js, Fastify e MySQL. O diferencial: integração real com banco via Docker e um foco explícito em testar hipóteses — Conjecturas & Refutações — para descobrir pontos fracos antes que o usuário os encontre.

---

## 🎯 Objetivo

Este repositório é um laboratório: não só para implementar rotas, mas para validar, atacar e reforçar uma API. Você vai executar a API com MySQL em Docker, rodar verificações diretas no banco, e aprender a transformar falhas em melhorias práticas.

---

## 🧩 Tecnologias

- Framework: Fastify (alta performance)
- Banco: MySQL 8.0 (via Docker)
- Gestão de variáveis: dotenv
- Testes/validação: Postman (Collections com scripts para validar DB/contrato)
- Opcional (recomendo): autocannon / k6 para carga; pumba / tc para injetar falhas

---

## 🚀 Funcionalidades principais

API implementada em `server.js` com as rotas:

- `POST /products` — criar produto (name, price, quantity)
- `GET /products` — listar produtos
- `PUT /products/:id` — atualizar produto
- `DELETE /products/:id` — remover produto
- `GET /test/check-db/:id` — validação direta no banco (retorna 404 se não existir)
- `DELETE /test/clear-database` — limpeza segura; exige header `admin-token`

---

## 🔧 Como rodar (Quickstart)

### 1. Pré-requisitos

- Node.js (>= 16)
- Docker & Docker Compose
- Git

### 2. Clonar e instalar

```bash
git clone <repo-url>
cd <repo>
npm install
```

### 3. Subir o MySQL com Docker

```bash
docker-compose up -d
```

### 4. Configurar variáveis de ambiente

Crie um `.env` baseado no `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=inventory_db
ADMIN_TOKEN=algum-token-seguro
```

### 5. Iniciar o servidor

```bash
node server.js
# ou (recomendado em dev)
npm run dev
```

A API ficará disponível em `http://localhost:3000` (ou na porta que você definiu).

---

## 📋 Exemplos rápidos (curl)

Criar produto:

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Caneta","price":2.5,"quantity":100}'
```

Listar produtos:

```bash
curl http://localhost:3000/products
```

Verificar existência no DB (rota de teste):

```bash
curl http://localhost:3000/test/check-db/1
```

Limpar tabela (exige header admin-token):

```bash
curl -X DELETE http://localhost:3000/test/clear-database \
  -H "admin-token: SEU_ADMIN_TOKEN_AQUI"
```

---

## 🧪 Testes com Postman

- Importe a Collection localizada em `/postman`.
- Use o Collection Runner para executar o fluxo completo (create → check-db → delete → check-db).
- As requests de validação usam a rota `/test/check-db/:id` para confirmar persistência/remoção no MySQL.
- A rota de limpeza exige o header `admin-token` conforme o `.env`.

Dica: configure variáveis de ambiente no Postman (baseUrl, admin-token) para rodar o runner sem alterações manuais.

---

## 🔬 Método aplicado: Conjecturas & Refutações (como eu usei aqui)

Eu não apenas implementei rotas — eu formulei hipóteses e tentei refutá‑las.

1. Conjectura inicial:
   - "A API é robusta para produção."

2. Critérios de refutação (exemplos mensuráveis):
   - Latência média > X ms com 500 RPS
   - Taxa de erro ≥ 1% sob carga
   - Esgotamento de conexões no DB
   - Aceitação de payloads inválidos
   - Processo morre se o DB oscilar por alguns segundos

3. Experimentos executados:
   - Testes de carga (autocannon / k6)
   - Fuzzing de payloads (JSON inválido / campos faltantes)
   - Simulação de falhas de infra (parar container DB, injetar latência)
   - Abertura simultânea de muitas conexões

4. Refutações encontradas (exemplo real do lab):
   - Sem connection pool: conexões esgotavam e a API entrava em erro.
   - Sem validação (schema): dados inválidos chegavam ao DB.
   - Falha temporária no DB derrubava o processo.

5. Correções aplicadas:
   - mysql2 Pools para gerenciar conexões.
   - Fastify JSON Schemas para validação de entrada.
   - Tratamento centralizado de erros, timeouts e estratégias de retry/backoff.

6. Iterar:
   - Re-executar os mesmos experimentos até que a conjectura não seja mais refutada (ou que novas conjecturas surjam).

Quer ver scripts prontos para esses experimentos (autocannon/k6 + comandos pumba/tc)? Posso incluir no repo.

---

## ✅ Checklist de qualidade (para você rodar)

- [ ] Rodar teste de carga (autocannon) e observar latência/erros
- [ ] Verificar logs e métricas durante o teste
- [ ] Enviar payloads malformados e checar validação
- [ ] Simular falha temporária do DB e checar resiliência do processo
- [ ] Confirmar persistência via `/test/check-db/:id`
- [ ] Executar `/test/clear-database` com `admin-token` e validar limpeza

---

## 📂 Estrutura do repositório

- `server.js` — código principal (rotas + conexão MySQL)
- `docker-compose.yml` — container MySQL
- `.env.example` — modelo de configuração
- `/postman` — collections para automação de testes e validações
- `.gitignore`

---

## Contribuindo

Sugestões de melhoria são bem-vindas:

- Adicionar scripts de carga (k6/autocannon)
- Promover testes de chaos (pumba/tc)
- Integrar com CI para rodar experimentos automaticamente
  Abra uma issue ou envie um PR — descreva a conjectura que você quer testar e o experimento proposto.

---

## Licença

MIT — sinta-se livre para usar, modificar e distribuir.

---

## Sobre o autor

Desenvolvido por Kian Chaves 🚀  
Twitter/LinkedIn: @KianChavesQA

---

O que eu fiz e o próximo passo

- Organizei o README para torná‑lo mais atraente, prático e orientado a experimentos: adicionando Quickstart, exemplos curl, checklist e uma seção dedicada ao método Conjecturas & Refutações.
- Posso, se você quiser, adicionar ao repositório: scripts de carga (autocannon/k6), exemplos de JSON Schema do Fastify, e comandos para simular falhas (pumba/tc). Quer que eu gere esses arquivos agora?
