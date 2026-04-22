# Dump do banco

`dump.sql` é um dump completo do MySQL (schema + dados) compartilhado entre o OT server e o site Next.js. Todas as contas pessoais foram removidas antes do export — sobra apenas a conta de sistema `Account Manager` e os cinco sample chars de cada vocação.

Gerado com:

```bash
mysqldump -u root --skip-comments --routines --triggers --single-transaction \
  --default-character-set=utf8mb4 servidor > dump.sql
```

## Importando localmente

```bash
# 1. Criar o banco
mysql -u root -e "CREATE DATABASE servidor CHARACTER SET utf8mb4;"

# 2. Carregar o dump
mysql -u root servidor < db/dump.sql

# 3. Regerar o cliente Prisma contra o banco recém-criado
npx prisma generate
```

Depois ajuste `DATABASE_URL` no `.env` pra apontar pro seu MySQL local e rode `npm run dev`.

## O que tem dentro

- Schema completo (tabelas, índices, routines, triggers)
- Dados de referência do jogo: monstros, items, spells, ofertas do shop, casas, tiles, etc.
- Conta de sistema + sample characters (sem nenhum usuário real)

Se quiser rodar o OT server também, pegue o map + pasta data no repositório do próprio server.
