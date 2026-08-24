import React, { useState } from 'react';
import { KITS_ETAPAS, PARTS_LIST, DEPARTMENTS } from '../data/mockData';
import { Calculator, Layers, Send, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, PackageCheck, RefreshCw } from 'lucide-react';

export default function DiagnosticTool() {
  const [activeTab, setActiveTab] = useState<'kits' | 'calc' | 'busca'>('kits');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Calculator state
  const [calcType, setCalcType] = useState<'contrapiso' | 'alvenaria' | 'pintura'>('contrapiso');
  const [areaM2, setAreaM2] = useState<number>(30);

  // Calculations
  const getCalcResults = () => {
    if (calcType === 'contrapiso') {
      // 1m² contrapiso (5cm espessura) ~ 0.25 sacos de cimento 50kg + 0.5 saca areia 20kg
      const cimentoSacos = Math.ceil(areaM2 * 0.25);
      const areiaSacas = Math.ceil(areaM2 * 0.5);
      return [
        { name: 'Cimento CP-II 50kg', qty: `${cimentoSacos} sacos`, price: cimentoSacos * 42.0 },
        { name: 'Areia Média Saca 20kg', qty: `${areiaSacas} sacas`, price: areiaSacas * 9.9 },
        { name: 'Impermeabilizante 18L', qty: areaM2 > 50 ? '2 galões' : '1 galão', price: areaM2 > 50 ? 163.0 : 81.5 },
      ];
    } else if (calcType === 'alvenaria') {
      // 1m² alvenaria ~ 25 tijolos + 0.15 sacos cimento + 0.3 saca areia
      const tijolos = Math.ceil(areaM2 * 25);
      const cimentoSacos = Math.ceil(areaM2 * 0.15);
      const areiaSacas = Math.ceil(areaM2 * 0.3);
      return [
        { name: 'Bloco/Tijolo Baiano (milheiro fracionado)', qty: `${tijolos} unidades`, price: Math.round(tijolos * 1.2) },
        { name: 'Cimento CP-II 50kg', qty: `${cimentoSacos} sacos`, price: cimentoSacos * 42.0 },
        { name: 'Areia Média Saca 20kg', qty: `${areiaSacas} sacas`, price: areiaSacas * 9.9 },
      ];
    } else {
      // Pintura 1 lata 18L ~ 100m² com 2 demãos
      const latas = Math.ceil(areaM2 / 100);
      const rolos = Math.ceil(areaM2 / 60);
      return [
        { name: 'Tinta Acrílica Proteção Litoral 18L', qty: `${latas} lata(s) 18L`, price: latas * 269.0 },
        { name: 'Rolo de Lã Sintética 23cm', qty: `${rolos} unidade(s)`, price: rolos * 24.9 },
      ];
    }
  };

  const calcResults = getCalcResults();
  const calcTotal = calcResults.reduce((sum, item) => sum + item.price, 0);

  const filteredItems = PARTS_LIST.filter(item => {
    const matchesDept = selectedDept === 'all' || item.category === selectedDept;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  }).slice(0, 15);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleSendKitWhatsApp = (kitTitle: string, items: { name: string; qty: string; price: number }[]) => {
    const text =
      `Olá Trevos Construções! Vi o *${kitTitle}* no site e gostaria de solicitar orçamento e verificar frete para Mangaratiba:\n\n` +
      items.map(i => `• ${i.name} (${i.qty}) — R$ ${i.price.toFixed(2)}`).join('\n') +
      `\n\nPodem me enviar a cotação final?`;
    window.open(`https://wa.me/5521990387232?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendCalcWhatsApp = () => {
    const text =
      `Olá Trevos Construções! Usei a Calculadora de Materiais por m² no site para *${calcType.toUpperCase()}* (${areaM2}m²):\n\n` +
      calcResults.map(i => `• ${i.name}: ${i.qty} — R$ ${i.price.toFixed(2)}`).join('\n') +
      `\n*Total Estimado:* R$ ${calcTotal.toFixed(2)}\n\nGostaria de confirmar estes itens e agendar entrega na obra.`;
    window.open(`https://wa.me/5521990387232?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendBudgetBusca = () => {
    const items = PARTS_LIST.filter(p => selectedItems.includes(p.id));
    const textBase =
      `Olá Trevos Construções! Montei uma lista de materiais pelo site:\n\n` +
      items.map(p => `• ${p.name} — R$ ${p.price.toFixed(2)}`).join('\n') +
      `\n\nGostaria de receber um orçamento e verificar disponibilidade de entrega em Mangaratiba.`;
    window.open(`https://wa.me/5521990387232?text=${encodeURIComponent(textBase)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden text-left" id="assistente-materiais">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-green-900 via-green-950 to-slate-950 text-white p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-orange-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Assistente Prático de Obra
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white">
              Monte Sua Lista por Etapa ou Metragem (m²)
            </h3>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl font-light font-sans">
              Facilitamos a cotação da sua obra com kits prontos por etapa e calculadora automática de insumos por metro quadrado.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/15 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('kits')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kits' ? 'bg-white text-green-950 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              🛠️ Kits por Etapa
            </button>
            <button
              onClick={() => setActiveTab('calc')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calc' ? 'bg-white text-green-950 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              📐 Calculadora m²
            </button>
            <button
              onClick={() => setActiveTab('busca')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'busca' ? 'bg-white text-green-950 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              🔍 Lista por Produto
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* TAB 1: KITS POR ETAPA DA OBRA */}
        {activeTab === 'kits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Kits Prontos para Obras em Mangaratiba</h4>
                <p className="text-xs text-slate-500 font-sans">Selecione uma etapa abaixo para ver os materiais calculados com preço de pacote.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {KITS_ETAPAS.map((kit) => (
                <div
                  key={kit.id}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-green-300 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{kit.icon}</span>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 font-display">{kit.title}</h5>
                          <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Pacote Pronto</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-sans">Valor Estimado</span>
                        <span className="text-sm font-bold font-mono text-green-brand">R$ {kit.estimatedPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-sans font-light leading-relaxed">{kit.description}</p>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs text-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans mb-1">Insumos incluídos:</span>
                      {kit.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                          <span className="font-medium text-slate-800">• {item.name}</span>
                          <span className="font-mono text-slate-500">{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendKitWhatsApp(kit.title, kit.items)}
                    className="mt-4 w-full bg-green-brand hover:bg-green-dark text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Cotar {kit.title} no WhatsApp
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CALCULADORA DE MATERIAIS POR M² */}
        {activeTab === 'calc' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-display">Calculadora de Obra por m²</h4>
                  <p className="text-xs text-slate-500 font-sans">Informe o tipo de serviço e a metragem da sua área.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setCalcType('contrapiso')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${calcType === 'contrapiso' ? 'bg-green-brand text-white' : 'text-slate-600'}`}
                  >
                    Contrapiso / Laje
                  </button>
                  <button
                    onClick={() => setCalcType('alvenaria')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${calcType === 'alvenaria' ? 'bg-green-brand text-white' : 'text-slate-600'}`}
                  >
                    Alvenaria / Parede
                  </button>
                  <button
                    onClick={() => setCalcType('pintura')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${calcType === 'pintura' ? 'bg-green-brand text-white' : 'text-slate-600'}`}
                  >
                    Pintura Externa
                  </button>
                </div>
              </div>

              {/* Slider for M² */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Área da Obra (Metragem Quadrada):</span>
                  <span className="text-base font-mono text-green-brand bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                    {areaM2} m²
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value))}
                  className="w-full accent-green-brand cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5 m² (pequena reforma)</span>
                  <span>100 m²</span>
                  <span>200 m² (obra grande)</span>
                </div>
              </div>

              {/* Calculated Items Preview */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                  Insumos Estimados Necessários para {areaM2}m² de {calcType.toUpperCase()}:
                </span>

                <div className="space-y-2">
                  {calcResults.map((res, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <div>
                        <strong className="text-slate-900 font-semibold">{res.name}</strong>
                        <span className="text-xs text-slate-500 font-mono block">Quantidade estimada: {res.qty}</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900">R$ {res.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">Total Estimado de Materiais:</span>
                  <span className="text-lg font-extrabold font-mono text-green-brand">R$ {calcTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSendCalcWhatsApp}
                className="w-full bg-orange-accent hover:opacity-95 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Cálculo de {areaM2}m² para o Vendedor no WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: LISTA BUSCA POR PRODUTO */}
        {activeTab === 'busca' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="flex bg-slate-100 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setSelectedDept('all')}
                  className={`flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    selectedDept === 'all' ? 'bg-white text-green-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Todos
                </button>
                {DEPARTMENTS.slice(0, 5).map((dept) => (
                  <button
                    key={dept.key}
                    onClick={() => setSelectedDept(dept.key)}
                    className={`flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                      selectedDept === dept.key ? 'bg-white text-green-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Buscar: tubo, cimento, tinta, ferramenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedItems.includes(item.id)
                      ? 'border-green-600 bg-green-50/50 shadow-inner ring-1 ring-green-600/30'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">{item.subcategory}</span>
                    <span className="text-xs font-bold text-green-700">R$ {item.price.toFixed(2)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                </button>
              ))}
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-green-50 border border-green-100 rounded-2xl p-4">
                <span className="text-xs font-bold text-green-900">{selectedItems.length} itens selecionados</span>
                <button
                  onClick={handleSendBudgetBusca}
                  className="bg-green-brand hover:bg-green-dark text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Enviar Lista no WhatsApp
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

