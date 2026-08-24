import React from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ArrowLeft,
  FileText,
  Calendar,
  ShieldCheck,
  CreditCard,
  Server,
  Database,
  Globe,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import Logo from '../components/Logo';

export default function ProposalPage() {
  const handleWhatsAppProposal = () => {
    const text = encodeURIComponent(
      'Olá! Recebi a proposta de desenvolvimento do site Trevos Construções no valor de R$ 2.000. Gostaria de tirar dúvidas e seguir com o projeto.'
    );
    window.open(`https://wa.me/5521990387232?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappContact = '(21) 99038-7232';
  const emailContact = 'contato@trevosconstrucoes.com';

  const includedItems = [
    'Site institucional responsivo (desktop, tablet e mobile)',
    'Página inicial com carrossel de promoções full-width',
    'Loja virtual / catálogo de materiais de construção',
    'Carrinho de compras com orçamento via WhatsApp',
    'Solicitação de orçamento e consultoria técnica',
    'Seção de serviços, departamentos e localização',
    'Painel administrativo (CMS) para produtos, pedidos e estoque',
    'Integração com banco de dados (Supabase)',
    'Integração com WhatsApp para atendimento e orçamentos',
    'Configuração de domínio e deploy na Vercel',
    'Treinamento de 1h para uso do painel administrativo',
    'Garantia de 30 dias para correções de bugs',
  ];

  const fees = [
    {
      item: 'Desenvolvimento do site (escopo fechado)',
      recurrence: 'Único',
      value: 'R$ 2.000,00',
      notes: 'Valor total do projeto. Pagamento em até 3x no PIX/boleto/cartão.',
    },
    {
      item: 'Hospedagem Vercel (plano Hobby)',
      recurrence: 'Mensal',
      value: 'R$ 0,00',
      notes: 'Gratuito para sites com tráfego moderado. Upgrade opcional para Pro (R$ 20/mês) conforme crescimento.',
    },
    {
      item: 'Banco de dados Supabase (plano Free)',
      recurrence: 'Mensal',
      value: 'R$ 0,00',
      notes: '500 MB de armazenamento e 2.000 conexões simultâneas. Upgrade para Pro (US$ 25/mês ≈ R$ 130/mês) quando necessário.',
    },
    {
      item: 'Registro/renovação de domínio',
      recurrence: 'Anual',
      value: 'R$ 45,00 a R$ 60,00',
      notes: 'Valor médio para domínios .com.br. Pode ser adquirido por você ou por nós em seu nome.',
    },
    {
      item: 'Certificado SSL',
      recurrence: 'Anual',
      value: 'R$ 0,00',
      notes: 'Incluso gratuitamente pela Vercel e pelo Supabase.',
    },
    {
      item: 'Gateway de pagamento online (opcional)',
      recurrence: 'Por transação',
      value: '1,99% + R$ 0,10',
      notes: 'Taxa aproximada do Mercado Pago para vendas online. Ativação opcional e só recomendada após validação da loja.',
    },
  ];

  const timeline = [
    { phase: 'Alinhamento e aprovação', duration: '1-2 dias', description: 'Aprovação da proposta, definição de domínio e coleta de materiais (logo, fotos, conteúdos).' },
    { phase: 'Design e configuração', duration: '3-5 dias', description: 'Ajuste de identidade visual, tipografia, cores, páginas e estrutura do catálogo.' },
    { phase: 'Desenvolvimento e integrações', duration: '5-7 dias', description: 'Catálogo, carrinho, CMS, banco de dados, WhatsApp e testes internos.' },
    { phase: 'Revisão e ajustes', duration: '2-3 dias', description: 'Validação com o cliente, correções finais e treinamento do painel.' },
    { phase: 'Publicação (go-live)', duration: '1 dia', description: 'Deploy final, configuração de domínio e entrega do projeto.' },
  ];

  const totalProject = 'R$ 2.000,00';
  const monthlyEstimate = 'R$ 0,00*';
  const monthlyFootnote = '*Custos mensais começam em zero com planos gratuitos. Domínio é anual (R$ 45-60). Upgrade de hospedagem/banco opcional conforme escala.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Simple context bar */}
      <div className="bg-green-50 border-b border-green-100 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-green-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Site
          </Link>
          <span className="text-xs font-bold text-green-brand">Proposta Comercial</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
                <FileText className="w-3.5 h-3.5" /> Proposta Comercial
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
                Desenvolvimento do Site Trevos Construções
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Mockup aprovado • Escopo fechado • Valor fixo
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm min-w-[180px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Investimento</span>
              <span className="text-3xl font-extrabold text-green-brand font-display">R$ 2.000</span>
              <span className="text-sm font-semibold text-slate-600">,00</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cliente</span>
              <span className="font-semibold text-slate-800">Trevos Construções</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Prazo estimado</span>
              <span className="font-semibold text-slate-800">10 a 15 dias úteis</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Validade</span>
              <span className="font-semibold text-slate-800">30 dias</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Responsável</span>
              <span className="font-semibold text-slate-800">Marroc Solutions</span>
            </div>
          </div>
        </div>

        {/* Scope */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
            <Check className="w-6 h-6 text-green-brand" /> O que está incluído no valor
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {includedItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-700" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Investment table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8 overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-green-brand" /> Detalhamento de investimentos e taxas
          </h2>

          <div className="overflow-x-auto -mx-6 sm:-mx-10 px-6 sm:px-10">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="py-3 pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recorrência</th>
                  <th className="py-3 pr-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {fees.map((fee, index) => (
                  <tr key={index} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-4 pr-4 font-semibold text-slate-800">{fee.item}</td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        fee.recurrence === 'Único' ? 'bg-orange-100 text-orange-700' :
                        fee.recurrence === 'Anual' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {fee.recurrence}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right font-bold text-slate-900 whitespace-nowrap">{fee.value}</td>
                    <td className="py-4 text-slate-500 text-xs leading-relaxed max-w-xs">{fee.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Investimento inicial do projeto</p>
                <p className="text-3xl font-extrabold text-green-brand font-display">{totalProject}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500 mb-1">Custo mensal estimado inicial</p>
                <p className="text-2xl font-extrabold text-slate-800 font-display">{monthlyEstimate}</p>
                <p className="text-[11px] text-slate-500 mt-2 max-w-sm">{monthlyFootnote}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-brand" /> Cronograma estimado
          </h2>
          <div className="space-y-4">
            {timeline.map((step, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-green-brand text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{step.phase}</p>
                    <p className="text-[10px] text-green-brand font-bold uppercase tracking-wider">{step.duration}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Infra cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <Server className="w-6 h-6 text-green-brand mb-3" />
            <h3 className="font-bold text-sm text-slate-900">Hospedagem</h3>
            <p className="text-xs text-slate-500 mt-1">Vercel — CDN global, SSL grátis e deploy contínuo.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <Database className="w-6 h-6 text-green-brand mb-3" />
            <h3 className="font-bold text-sm text-slate-900">Banco de dados</h3>
            <p className="text-xs text-slate-500 mt-1">Supabase — PostgreSQL, autenticação e storage.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <Globe className="w-6 h-6 text-green-brand mb-3" />
            <h3 className="font-bold text-sm text-slate-900">Domínio</h3>
            <p className="text-xs text-slate-500 mt-1">Configuração de DNS e redirecionamentos inclusa.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <MessageSquare className="w-6 h-6 text-green-brand mb-3" />
            <h3 className="font-bold text-sm text-slate-900">WhatsApp</h3>
            <p className="text-xs text-slate-500 mt-1">Botões de orçamento e atendimento integrados.</p>
          </div>
        </section>

        {/* Terms */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-brand" /> Condições comerciais
          </h2>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2"><span className="text-green-brand font-bold">•</span> O valor de <strong>R$ 2.000,00</strong> é fechado para o escopo descrito acima.</li>
            <li className="flex items-start gap-2"><span className="text-green-brand font-bold">•</span> Pagamento pode ser parcelado em até <strong>3 vezes</strong> via PIX, boleto ou cartão.</li>
            <li className="flex items-start gap-2"><span className="text-green-brand font-bold">•</span> Alterações fora do escopo serão orçadas separadamente.</li>
            <li className="flex items-start gap-2"><span className="text-green-brand font-bold">•</span> A proposta tem validade de 30 dias a partir da data de envio.</li>
            <li className="flex items-start gap-2"><span className="text-green-brand font-bold">•</span> Custos de domínio, hospedagem e banco são de responsabilidade do cliente após o go-live.</li>
            <li className="flex items-start gap-2"><span className="text-green-brand font-bold">•</span> Garantia de 30 dias para correção de bugs relacionados ao desenvolvimento.</li>
            <li className="flex items-start gap-2"><span className="text-green-brand font-bold">•</span> Manutenção mensal opcional: <strong>R$ 200,00</strong> para atualizações de conteúdo, produtos e pequenos ajustes.</li>
          </ul>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-green-800 via-green-900 to-green-950 rounded-2xl p-6 sm:p-10 text-white text-center shadow-lg print:hidden">
          <h2 className="text-xl sm:text-2xl font-bold font-display mb-3">Pronto para levar a Trevos Construções para o digital?</h2>
          <p className="text-green-100/90 text-sm mb-6 max-w-2xl mx-auto">
            Envie esta proposta de volta com um OK ou tire suas dúvidas direto no WhatsApp. O desenvolvimento começa assim que o primeiro pagamento for confirmado.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleWhatsAppProposal}
              className="bg-white text-green-900 hover:bg-green-50 font-bold py-3.5 px-8 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <MessageSquare className="w-4 h-4" /> Quero seguir com a proposta
            </button>
            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-6 rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FileText className="w-4 h-4" /> Imprimir / Salvar PDF
            </button>
          </div>
        </div>

        {/* Signature area */}
        <div className="mt-10 pt-8 border-t border-slate-200 print:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Proposta elaborada por</p>
              <p className="font-bold text-slate-900">Marroc Solutions</p>
              <p className="text-xs text-slate-500">{emailContact} • {whatsappContact}</p>
              <p className="text-xs text-slate-500">https://solutions.marroc.xyz</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Aprovação do cliente</p>
              <p className="text-sm text-slate-700 mb-4">Assinatura: _________________________________</p>
              <p className="text-sm text-slate-700">Data: ____/____/________</p>
            </div>
          </div>
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
