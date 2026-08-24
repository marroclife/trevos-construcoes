import React, { useState, useMemo } from 'react';
import { COSTA_VERDE_CITIES, SERVICE_EQUIPMENTS, getServicesForEquipment } from '../data/mockData';
import { Calendar, MapPin, CheckCircle2, MessageSquare, Clock, User, Mail, Phone, Wrench, AlertCircle, Truck, FileText } from 'lucide-react';
import { Appointment } from '../types';

export default function BudgetCalculator() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: COSTA_VERDE_CITIES[0].name,
    district: '',
    accessType: 'Via plana simples',
    dischargeMethod: 'Descarga Manual Padrão',
    serviceType: 'Orçamento',
    equipment: SERVICE_EQUIPMENTS[0].key,
    date: '',
    time: '08:00',
    description: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const selectedCityObj = COSTA_VERDE_CITIES.find(c => c.name === formData.city) || COSTA_VERDE_CITIES[0];
  const selectedServiceObj = SERVICE_EQUIPMENTS.find(e => e.key === formData.equipment) || SERVICE_EQUIPMENTS[0];

  const availableServices = useMemo(() => getServicesForEquipment(formData.equipment), [formData.equipment]);

  // Keep service type in sync with selected service category
  if (!availableServices.includes(formData.serviceType)) {
    setFormData(prev => ({ ...prev, serviceType: availableServices[0] || 'Orçamento' }));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const compileWhatsAppMessage = () => {
    return `Olá Trevos Construções! Gostaria de solicitar um orçamento:\n\n` +
      `👤 *Nome:* ${formData.name}\n` +
      `📧 *E-mail:* ${formData.email || 'Não informado'}\n` +
      `📱 *WhatsApp:* ${formData.phone}\n` +
      `📍 *Local:* ${formData.district ? `${formData.district}, ` : ''}${formData.city}\n` +
      `🚚 *Acesso Obra:* ${formData.accessType}\n` +
      `📦 *Descarga:* ${formData.dischargeMethod}\n` +
      `🔧 *Serviço:* ${formData.serviceType}\n` +
      `📋 *Categoria:* ${selectedServiceObj.label}\n` +
      `📝 *Descrição:* ${formData.description || 'Não informada'}\n\n` +
      `Aguardo retorno da cotação e frete. Obrigado!`;
  };

  const persistAppointment = (): Appointment => {
    const id = `orc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const appointment: Appointment = {
      id,
      ...formData,
      status: 'Novo',
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem('trevos-construcoes-appointments');
      const list: Appointment[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem('trevos-construcoes-appointments', JSON.stringify([appointment, ...list]));
    } catch {
      // ignore storage errors
    }

    return appointment;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Por favor, informe seu nome e WhatsApp para o orçamento.');
      return;
    }

    const appointment = persistAppointment();
    setAppointmentId(appointment.id);
    setSubmitted(true);

    // Open WhatsApp with pre-filled message
    const encoded = encodeURIComponent(compileWhatsAppMessage());
    window.open(`https://wa.me/5521990387232?text=${encoded}`, '_blank');
  };

  const handleReset = () => {
    setSubmitted(false);
    setAppointmentId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: COSTA_VERDE_CITIES[0].name,
      district: '',
      accessType: 'Via plana simples',
      dischargeMethod: 'Descarga Manual Padrão',
      serviceType: 'Orçamento',
      equipment: SERVICE_EQUIPMENTS[0].key,
      date: '',
      time: '08:00',
      description: '',
    });
  };

  const handleGeneratePDF = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-left" id="solicitar-orcamento">
      {/* Top Banner with PDF Button */}
      <div className="bg-gradient-to-r from-green-900 via-green-950 to-slate-950 p-6 md:p-8 border-b border-slate-800 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block font-sans">
            Mangaratiba & Região (Costa Verde)
          </span>
          <h3 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white mt-1">
            Solicitar Orçamento & Agendamento
          </h3>
          <p className="text-xs md:text-sm text-slate-300 font-light font-sans mt-1">
            Informe os dados da sua obra e receba a cotação formal com condições de entrega.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGeneratePDF}
          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          Imprimir / Gerar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form Column */}
        <div className="lg:col-span-7 p-6 md:p-8 space-y-6">
          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-display">Orçamento Registrado!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Protocolo <span className="font-mono text-emerald-300">{appointmentId}</span> salvo. Você foi direcionado ao WhatsApp da Trevos.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all"
              >
                Novo Orçamento
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Row 1: Name + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                    <User className="w-3 h-3 inline mr-1" />Seu Nome *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-brand/40 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                    <Phone className="w-3 h-3 inline mr-1" />WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="(21) 99999-9999"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-brand/40 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Row 2: Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                    <MapPin className="w-3 h-3 inline mr-1" />Cidade
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        city: e.target.value,
                        district: ''
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-brand/40 transition-all font-sans"
                  >
                    {COSTA_VERDE_CITIES.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                    Bairro / Distrito
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-brand/40 transition-all font-sans"
                  >
                    <option value="">Selecione...</option>
                    {selectedCityObj.districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                    <Truck className="w-3 h-3 inline mr-1" />Acesso do Local da Obra
                  </label>
                  <select
                    name="accessType"
                    value={formData.accessType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-green-brand/40 font-sans"
                  >
                    <option value="Via plana simples">Via plana simples</option>
                    <option value="Subida de morro / Ladeira">Subida de morro / Ladeira</option>
                    <option value="Rua estreita / Acesso restrito">Rua estreita / Acesso restrito</option>
                    <option value="Condomínio (requer liberação)">Condomínio (requer liberação)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                    Tipo de Descarga Desejado
                  </label>
                  <select
                    name="dischargeMethod"
                    value={formData.dischargeMethod}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-green-brand/40 font-sans"
                  >
                    <option value="Descarga Manual Padrão">Descarga Manual Padrão</option>
                    <option value="Caminhão Munck (Laje/Vigas)">Caminhão Munck (Laje/Vigas)</option>
                    <option value="Caminhão Basculante (Areia/Brita)">Caminhão Basculante (Areia/Brita)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Service Type + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                    <Wrench className="w-3 h-3 inline mr-1" />Tipo de Serviço
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-brand/40 transition-all font-sans"
                  >
                    {availableServices.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                    {selectedServiceObj.emoji} Categoria
                  </label>
                  <select
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-brand/40 transition-all font-sans"
                  >
                    {SERVICE_EQUIPMENTS.map(equipment => (
                      <option key={equipment.key} value={equipment.key}>{equipment.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Description */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 font-sans">
                  <AlertCircle className="w-3 h-3 inline mr-1" />Descrição da Obra / Lista de Materiais
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Descreva sua obra, materiais necessários, metragem, prazo ou qualquer detalhe importante."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-brand/40 transition-all font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-accent hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-accent/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Enviar Orçamento pelo WhatsApp
              </button>
            </form>
          )}
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 bg-green-dark/50 border-l border-slate-800 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest font-sans">
              Resumo do Orçamento
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Cliente</span>
                <span className="font-semibold text-white">{formData.name || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">WhatsApp</span>
                <span className="font-semibold text-white">{formData.phone || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Local</span>
                <span className="font-semibold text-white text-right">
                  {formData.district ? `${formData.district}, ` : ''}{formData.city}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Logística</span>
                <span className="font-semibold text-white text-right">
                  {formData.dischargeMethod} ({formData.accessType})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Serviço / Categoria</span>
                <span className="font-semibold text-white text-right">
                  {formData.serviceType} / {selectedServiceObj.label}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Garantia de resposta rápida
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Após o envio, nossa equipe confirma disponibilidade de materiais, prazo de entrega e valores pelo WhatsApp. Atendemos de segunda a sábado.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
