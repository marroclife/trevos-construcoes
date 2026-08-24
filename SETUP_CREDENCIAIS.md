# Guia de Credenciais — Frio Costa Verde

Este guia explica como obter as 3 credenciais principais para colocar o projeto 100% online.

---

## 1. NEON — Banco de dados PostgreSQL

O projeto já usa Prisma 7 + adapter Neon. Você precisa criar um banco e copiar a `DATABASE_URL`.

### Passo a passo

1. Acesse: https://console.neon.tech
2. Crie uma conta (pode usar GitHub/Google) ou faça login.
3. Crie um novo projeto.
4. Dentro do projeto, crie um banco de dados (ex: `frio-costa-verde`).
5. Vá em **Connection Details** ou **Quick Start**.
6. Copie a string de conexão no formato:
   ```
   postgresql://usuario:senha@host.neon.tech/banco?sslmode=require
   ```
7. Cole em `.env.local` na variável `DATABASE_URL`.

### Importante

- A string já vem com `sslmode=require` — mantenha isso.
- Guarde essa URL com segurança. Quem tiver acesso a ela tem acesso total ao banco.

---

## 2. CLOUDINARY — Upload de imagens

As imagens dos produtos não são salvas em Base64 no banco. Elas são enviadas para o Cloudinary e o banco guarda apenas a URL.

### Passo a passo

1. Acesse: https://cloudinary.com
2. Crie uma conta gratuita.
3. No dashboard, procure a seção **Product Environment Credentials**.
4. Copie:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
5. Cole em `.env.local`.

### Dica

No plano gratuito você já consegue armazenar bastantes imagens. As imagens serão salvas na pasta `frio-costa-verde/products/`.

---

## 3. MERCADO PAGO — Checkout online

Se quiser que os clientes paguem direto no site (Pix ou cartão), precisa das credenciais do Mercado Pago.

### Passo a passo

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login com sua conta MP.
3. Vá em **Suas integrações** > **Criar aplicação**.
4. Crie uma aplicação do tipo **Checkout API / Checkout Pro**.
5. Dentro da aplicação, vá em **Credenciais de produção**.
6. Copie:
   - **Public Key** → `MERCADO_PAGO_PUBLIC_KEY`
   - **Access Token** → `MERCADO_PAGO_ACCESS_TOKEN`
7. Cole em `.env.local`.

### Webhook (opcional para já)

- A variável `MERCADO_PAGO_WEBHOOK_SECRET` pode ficar vazia por enquanto.
- Quando o checkout estiver ativo, você configura um webhook no painel do Mercado Pago apontando para `https://seu-dominio.vercel.app/api/webhooks/mercado-pago`.

---

## 4. Vercel — Configurar as variáveis de ambiente no deploy

Quando você fizer deploy na Vercel, as variáveis do `.env.local` não vão automaticamente. Você precisa cadastrá-las no dashboard.

### Passo a passo

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **frio-costa-verde**.
3. Vá em **Settings** > **Environment Variables**.
4. Adicione uma a uma:
   - `DATABASE_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_PUBLIC_KEY`
   - `JWT_SECRET` (pode gerar uma string aleatória, ex: em https://generate-secret.vercel.app/32)
5. Clique em **Save** e faça um novo deploy.

---

## 5. Aplicar as migrações do Prisma no Neon

Depois de configurar o `DATABASE_URL`, você precisa criar as tabelas no banco.

### No terminal local (com `.env.local` preenchido)

```bash
cd /home/nexo-operator/.openclaw/workspace/projects/frio-costa-verde
npx prisma migrate dev --name init
npx prisma db seed   # opcional: se quiser popular com dados de exemplo
```

Se não tiver migrações ainda, rode primeiro:

```bash
npx prisma migrate dev --name init
```

Isso criará todas as tabelas (`products`, `orders`, `order_items`, `categories`, `brands`, `admins`).

---

## 6. Testar o deploy

Após o deploy na Vercel:

1. Acesse `https://seu-dominio.vercel.app/api/health`
2. Deve retornar:
   ```json
   { "status": "ok", "database": "connected" }
   ```
3. Acesse o CMS, cadastre um produto com imagem.
4. Verifique se a imagem aparece no Cloudinary e no catálogo da loja.

---

## Checklist final

- [ ] Conta criada no Neon + `DATABASE_URL` copiada
- [ ] Conta criada no Cloudinary + 3 credenciais copiadas
- [ ] Conta/aplicação criada no Mercado Pago + 2 credenciais copiadas
- [ ] `.env.local` preenchido localmente
- [ ] Variáveis cadastradas no dashboard da Vercel
- [ ] Migrações do Prisma aplicadas no Neon (`npx prisma migrate dev`)
- [ ] Deploy testado: `/api/health`, CMS, upload de imagem

---

*Quando você tiver as credenciais, me manda cada uma que eu configuro no projeto e no deploy.*
