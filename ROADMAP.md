# 🗺️ Roadmap do Projeto - Frio Costa Verde

> Atualizado em: 6 de agosto de 2026
> Solicitação do proprietário: *"Bom dia meu amigo. Tudo na paz. Como tá o andamento do serviço? Serviços a serem acrescentados: instalação e manutenção de split, lavadora, geladeira/freezer e micro-ondas."*

Este documento detalha o status real do desenvolvimento do sistema da **Frio Costa Verde** e o plano de expansão para atender às novas solicitações do proprietário.

---

## 📊 Status Geral Atual
O projeto está em estágio **avançado de interface e funcionalidade básica (MVP funcional)**. A estrutura de e-commerce de peças, o sistema de diagnóstico interativo, o painel administrativo e a integração com pagamentos via Mercado Pago já estão implementados no frontend e backend. O banco de dados (PostgreSQL/Neon) está configurado com Prisma, mas parte da experiência ainda depende de fallbacks em `localStorage` e de credenciais de pagamento pendentes.

---

## ✅ O que já está pronto e funcional

### Loja digital (e-commerce)
- [x] **Catálogo de Peças Eletrônico** com filtros por categoria (`refrigeracao` / `lavadora`), marca e busca — `src/components/PartsCatalog.tsx`, `src/App.tsx:140-190`.
- [x] **Carrinho de Compras** com persistência em `localStorage` — `src/components/ShoppingCart.tsx`, `src/App.tsx:75-110`.
- [x] **Checkout com Mercado Pago** (PIX + Cartão via Checkout Pro) — `src/components/CheckoutModal.tsx`, `api/checkout/index.ts`, `api/checkout/init-card.ts`.
- [x] **Histórico de Pedidos** com fallback local e possibilidade de integração API — `src/components/OrderHistoryModal.tsx`.
- [x] **APIs de pedidos** (`/api/orders`, `/api/orders/[id]`) para listagem e detalhes reais — `api/orders/index.ts`, `api/orders/[id].ts`.

### Captação e diagnóstico
- [x] **Diagnóstico Interativo** de sintomas para refrigeração e lavadoras — `src/components/DiagnosticTool.tsx`, `src/data/mockData.ts:120-280`.
- [x] **Formulário de Orçamento/Agendamento** com envio para WhatsApp — `src/components/BudgetCalculator.tsx`, `src/App.tsx:540-550`.
- [x] **Integração com WhatsApp** em vários pontos do site (hero, footer, botão flutuante, catálogo, diagnóstico) — número `5521994954092`.

### Backoffice / CMS
- [x] **Painel Administrativo (CMS)** com login simples via `sessionStorage` — `src/components/BackofficeDashboard.tsx`.
- [x] **CRUD de Produtos** integrado ao banco via API — `api/products`, `src/lib/api.ts`.
- [x] **Upload de imagens** via Cloudinary — `api/upload.ts`.
- [x] **Visualização de agendamentos** salvos em `localStorage` — `BackofficeDashboard.tsx:appointments`.

### Infraestrutura
- [x] Banco PostgreSQL/Neon conectado via Prisma 7 — `prisma/schema.prisma`, `src/lib/prisma.ts`.
- [x] Build e TypeScript passando — `npx tsc --noEmit && npm run build`.
- [x] Webhook do Mercado Pago estruturado — `api/webhooks/mercado-pago.ts`.

---

## ⚠️ O que falta / está mockado / incompleto

### Dados e conteúdo estático
- [ ] **Depoimentos (`TESTIMONIALS`)** e parte das informações de marca são dados fixos em `src/data/mockData.ts`.
- [ ] **Cidades e bairros** (`COSTA_VERDE_CITIES`) estão hardcoded em `src/data/mockData.ts:10-17`.
- [ ] **Catálogo de peças padrão** (`PARTS_LIST`) é um mock inicial; em produção deve ser cadastrado e mantido via CMS/DB.

### Serviços técnicos
- [x] **Tipos de serviço no formulário** (`BudgetCalculator.tsx`) foram expandidos para cobrir instalação e manutenção de split/ar-condicionado, lavadora, geladeira/freezer e micro-ondas.
- [x] **Equipamentos no formulário** (`BudgetCalculator.tsx` + `mockData.ts`) agora incluem Ar-condicionado / Split e Micro-ondas, além de geladeira, freezer, lavadora e refrigeração comercial.
- [ ] **Diagnóstico** só cobre refrigeração e lavadora. Não possui split/ar-condicionado nem micro-ondas.

### Agendamentos
- [ ] **Agendamentos são salvos apenas no `localStorage`** (`BudgetCalculator.tsx:persistAppointment`) — não há tabela `Appointment` no banco nem API para persistir, listar ou gerenciar visitas técnicas.
- [ ] **CMS lê agendamentos do `localStorage`** (`BackofficeDashboard.tsx`), o que é volátil e não compartilha dados entre dispositivos.

### Pedidos e pagamentos
- [ ] **Gestão de Pedidos no CMS** ainda lê/persiste em `localStorage` em partes; a API `/api/orders` existe, mas o dashboard não consome ela para atualizar status (`OrderStatus` enum do Prisma não é usado no CMS).
- [ ] **Credenciais do Mercado Pago estão vazias** — `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_PUBLIC_KEY` e `MERCADO_PAGO_WEBHOOK_SECRET` em `.env` estão em branco. O checkout funciona em modo fallback (`gatewayDisabled: true`).
- [ ] **Webhook do Mercado Pago** precisa de domínio público e `notification_url` configurado para atualizar o status do pedido automaticamente.

### Autenticação e segurança
- [ ] **Login do CMS** é simulado por `sessionStorage.setItem('frio-costa-verde-admin-token', 'logged')` — sem senha real, sem JWT, sem hash. O model `Admin` do Prisma não é usado.

---

## 🛠️ Novos Serviços Solicitados pelo Proprietário

O proprietário solicitou a inclusão de serviços de **Instalação e Manutenção** para os equipamentos abaixo.

| Equipamento | Status Atual no Sistema | O que falta fazer | Prioridade |
| :--- | :--- | :--- | :--- |
| **Split / Ar-condicionado** | 🟢 Formulário de serviços pronto; catálogo de peças ainda não existe. | 1. Adicionar categoria `ar-condicionado` no Prisma/catálogo.<br>2. Incluir peças típicas (controle remoto, capacitor, serpentina, gás, etc.).<br>3. ~~Adicionar serviços de instalação, limpeza/higienização e manutenção preventiva no orçamentador.~~ ✅ Feito.<br>4. Criar diagnósticos para "não gela", "vazando água", "barulho", "mau cheiro". | 🟡 Média |
| **Lavadora** | 🟢 Formulário de serviços pronto; peças e diagnóstico existem. | ~~Adicionar explicitamente as opções de serviço: *Instalação*, *Manutenção Preventiva*, *Troca de rolamento/kit mecânico* e *Conserto de placa* no formulário de orçamento.~~ ✅ Feito. | 🟢 Concluído |
| **Geladeira / Freezer** | 🟢 Formulário de serviços pronto; peças e diagnóstico existem. | ~~Adicionar serviços: *Instalação de novo equipamento*, *Recarga de gás*, *Troca de compressor*, *Degelo completo* e *Manutenção preventiva* no orçamentador.~~ ✅ Feito. | 🟢 Concluído |
| **Micro-ondas** | 🟢 Formulário de serviços pronto; catálogo de peças ainda não existe. | 1. Criar categoria `micro-ondas` no catálogo.<br>2. Cadastrar peças (magnetron, placa de potência, chave de porta, fusível, capacitor).<br>3. ~~Adicionar serviço de *Reparo em Micro-ondas* no orçamentador.~~ ✅ Feito.<br>4. Criar diagnósticos para "não esquenta", "liga mas não gira", "faz barulho", "queimando cheiro". | 🟡 Média |

---

## 🚀 Próximos Passos Priorizados

1. **Credenciais Mercado Pago** — preencher `.env` com `ACCESS_TOKEN`, `PUBLIC_KEY` e configurar webhook após deploy.
2. **Deploy e domínio público** — publicar na Vercel para o webhook funcionar e permitir testes reais de PIX/cartão.
3. **~~Catálogo de serviços técnicos~~** — adicionar novos tipos de serviço e equipamentos no `BudgetCalculator.tsx`. ✅ Feito em 10/08/2026.
4. **Catálogo de peças: Split/Ar-condicionado e Micro-ondas** — adicionar novas categorias no Prisma, API, CMS e catálogo.
5. **Persistência real de agendamentos** — criar tabela `Appointment`, API CRUD e integrar o formulário.
6. **Gestão de pedidos no CMS** — consumir `/api/orders` e permitir alterar `OrderStatus`/`PaymentStatus`.
7. **Login seguro no CMS** — usar o model `Admin` do Prisma com senha hash + JWT.
8. **Substituição gradual de mocks** — mover depoimentos, cidades e catálogo inicial para banco/JSON administrável.

---

## 📦 Blocos de Dependência

| Bloqueio | Descrição | Como desbloquear |
| :--- | :--- | :--- |
| **Credenciais Mercado Pago** | Sem `ACCESS_TOKEN` e `PUBLIC_KEY`, o checkout opera em modo fallback e não cria cobranças reais. | Criar aplicação no Mercado Pago e copiar chaves para `.env` (ver `SETUP_CREDENCIAIS.md` e MCP Server). |
| **Deploy + domínio** | Webhook precisa de URL pública (`https://<dominio>/api/webhooks/mercado-pago`). | Fazer deploy na Vercel e registrar o domínio nas configurações do Mercado Pago. |
| **Banco de dados** | Schema Prisma já está pronto, mas agendamentos não persistem. | Rodar `prisma migrate dev` após adicionar model `Appointment`. |
| **Definição comercial** | Preços de mão-de-obra para split, micro-ondas etc. precisam ser confirmados pelo proprietário. | Reunião rápida ou lista de preços base. |

---

## 💬 Resposta Resumida para o Proprietário

> Bom dia! O sistema já está com a **loja de peças funcionando**, **checkout com Mercado Pago**, **diagnóstico**, **orçamento via WhatsApp** e **painel administrativo** prontos. O que falta para a sua solicitação é: incluir **Split/Ar-condicionado** e **Micro-ondas** no catálogo e orçamentador, e expandir as opções de **instalação/manutenção** para lavadora, geladeira e freezer. Assim que você confirmar os valores de mão-de-obra, eu implemento esses serviços e deixo o formulário alinhado.

