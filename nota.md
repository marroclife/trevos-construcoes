# Nota de repasse para o Nexo — Trevos Construções

Data: 27/08/2026

## Contexto

O projeto foi reposicionado para atender cinco frentes:

1. Loja de materiais e varejo.
2. Clientes empresariais e construtoras.
3. Órgãos públicos, licitações e reformas prediais.
4. Orçamentos com regras diferentes para CPF, CNPJ e licitação.
5. CYMAR, assistente educacional de obras com análise e edição de fotos.

## Implementações realizadas

- Identidade visual atualizada com base na marca oficial enviada pela proprietária.
- Paleta principal alterada para verde floresta, dourado e creme.
- Novas versões vetoriais do logo para fundos claros, escuros e uso somente do símbolo.
- Razão social identificada como `TREVOS COMÉRCIO SERVIÇOS E EMPREENDIMENTOS LTDA`.
- CNPJ informado na marca: `40.176.506/0001-18`.
- Arte original arquivada em `public/brand-reference-trevos.png`.

- Avaliações do Google com nota 5,0 e 49 avaliações.
- Endpoint `/api/google-reviews` preparado para Google Places API New.
- Fallback local com três avaliações públicas enquanto as credenciais não estiverem configuradas.
- Seção “Trevos Empresas & Governo”.
- Serviços de reformas de prédios públicos, fornecimento institucional e licitações.
- Orçamento segmentado por CPF, CNPJ e Licitação.
- Campos de empresa/órgão, CPF/CNPJ, processo ou edital e prazo de pagamento.
- Novo departamento “Escritório e Papelaria”.
- Produtos iniciais de cadeira ergonômica e papel A4.
- Primeira versão funcional da CYMAR.
- Upload e compressão de fotografias no navegador.
- Análise visual educacional da superfície por OpenAI Responses API.
- Lista sugerida de preparação, materiais, quantidades e alertas.
- Simulação de cor usando a API de edição de imagens da OpenAI.
- Personagem original da CYMAR salva em `public/cymar-assistant.png`.
- Hero reorganizado para loja, empresas/governo, consultoria e CYMAR.
- Suporte para três fotografias reais no hero por variáveis de ambiente.
- CMS e proposta comercial de desenvolvimento retirados da navegação pública.
- Promessas comerciais não confirmadas foram substituídas por textos mais seguros.
- Erro TypeScript do painel administrativo corrigido.
- Estouro horizontal do hero e sobreposição de setas no celular corrigidos.

## Variáveis necessárias na Vercel

```env
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
OPENAI_API_KEY=
OPENAI_VISION_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-2
```

Para as fotografias reais do hero:

```env
VITE_HERO_IMAGE_1=/hero-loja-1.webp
VITE_HERO_IMAGE_2=/hero-loja-2.webp
VITE_HERO_IMAGE_3=/hero-loja-3.webp
```

As fotografias originais autorizadas devem ser tratadas e salvas em `public/` ou hospedadas no CDN antes de configurar essas variáveis.

## Confirmações pendentes com a proprietária

- Google Business exibe `(21) 2039-0071`.
- O site atualmente utiliza `(21) 99038-7232`.
- Confirmar qual é o telefone comercial e qual é o WhatsApp oficial.
- Confirmar endereço e horário oficial.
- Confirmar condições reais de parcelamento, frete, promoções e prazos de entrega.
- Solicitar os arquivos originais das fotos da loja, equipe, estoque, entregas e obras executadas.
- Confirmar quais obras públicas podem aparecer no portfólio e obter autorização para divulgar nomes e fotografias.

## Observações técnicas

- A Google Places API retorna no máximo cinco avaliações por consulta. O site apresenta três e direciona o visitante para ver todas no Google.
- Não colocar `OPENAI_API_KEY` ou `GOOGLE_PLACES_API_KEY` em variáveis `VITE_*`.
- A análise da CYMAR é educacional e não substitui vistoria de engenheiro, arquiteto, eletricista ou profissional habilitado.
- Fotografias enviadas à CYMAR são reduzidas no navegador e enviadas ao servidor somente quando o usuário solicita análise.
- A simulação visual deve ser apresentada como aproximada, pois iluminação e tela alteram a percepção da cor.
- Preços de balcão não devem ser reutilizados automaticamente em CNPJ ou licitações.

## Verificações realizadas

- `npm run lint`: aprovado.
- `npm run build`: aprovado.
- Página inicial verificada em desktop e celular.

## Arquivos principais adicionados

- `api/google-reviews.ts`
- `api/cymar.ts`
- `src/components/GoogleReviews.tsx`
- `src/components/CymarAssistant.tsx`
- `src/components/InstitutionalServices.tsx`
- `public/cymar-assistant.png`

O guia completo de configuração está em `SETUP_CREDENCIAIS.md`.
