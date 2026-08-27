import React, { useEffect, useState } from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { GoogleReview } from '../types';

type ReviewsPayload = { rating: number; total: number; googleUrl: string; reviews: GoogleReview[]; source: string };

const fallback: ReviewsPayload = {
  rating: 5,
  total: 49,
  source: 'fallback',
  googleUrl: 'https://www.google.com/search?q=TREVOS+MATERIAIS+E+SERVI%C3%87OS+DE+CONSTRU%C3%87%C3%83O+LTDA',
  reviews: [
    { id: 'luciano', author: 'Luciano Simas', rating: 5, text: 'Excelente loja, preço muito bom, mais barato que eu encontrei.', relativeTime: 'Avaliação publicada no Google' },
    { id: 'janaina', author: 'Janaina Ceia', rating: 5, text: 'Super recomendo!', relativeTime: 'Avaliação publicada no Google' },
    { id: 'manoel', author: 'Manoel Germano', rating: 5, text: 'Localização de fácil acesso, profissionais competentes e ótimo atendimento.', relativeTime: 'Avaliação publicada no Google' },
  ],
};

export default function GoogleReviews() {
  const [data, setData] = useState<ReviewsPayload>(fallback);
  useEffect(() => { fetch('/api/google-reviews').then(r => r.ok ? r.json() : Promise.reject()).then(setData).catch(() => setData(fallback)); }, []);

  return (
    <section className="py-16 bg-white" id="avaliacoes-google">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-green-brand uppercase tracking-widest">Avaliações públicas do Google</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 mt-2">Confiança construída em cada atendimento</h2>
            <p className="text-sm text-slate-500 mt-3">Experiências compartilhadas por clientes da Trevos em Mangaratiba.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
            <strong className="text-4xl text-slate-900 font-display">{data.rating.toFixed(1).replace('.', ',')}</strong>
            <div><div className="flex text-amber-500">{[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}</div><span className="text-xs text-slate-500">{data.total} avaliações no Google</span></div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {data.reviews.slice(0, 3).map(review => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between gap-5">
              <div><div className="flex text-amber-500 mb-4">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div><p className="text-sm leading-relaxed text-slate-700">“{review.text}”</p></div>
              <div className="flex items-center gap-3 border-t border-slate-200 pt-4">{review.avatarUrl ? <img src={review.avatarUrl} alt="" className="w-9 h-9 rounded-full" /> : <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold">{review.author.charAt(0)}</div>}<div><strong className="text-xs text-slate-900 block">{review.author}</strong><span className="text-[10px] text-slate-500">{review.relativeTime}</span></div></div>
            </article>
          ))}
        </div>
        <div className="text-center"><a href={data.googleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-green-brand hover:text-green-800">Ver todas as avaliações no Google <ExternalLink className="w-4 h-4" /></a></div>
      </div>
    </section>
  );
}
