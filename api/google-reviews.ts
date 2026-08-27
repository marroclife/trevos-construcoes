import type { VercelRequest, VercelResponse } from '@vercel/node';

const FALLBACK = {
  rating: 5,
  total: 49,
  googleUrl: 'https://www.google.com/search?q=TREVOS+MATERIAIS+E+SERVI%C3%87OS+DE+CONSTRU%C3%87%C3%83O+LTDA',
  reviews: [
    { id: 'google-luciano', author: 'Luciano Simas', rating: 5, text: 'Excelente loja, preço muito bom, mais barato que eu encontrei.', relativeTime: 'Avaliação publicada no Google' },
    { id: 'google-janaina', author: 'Janaina Ceia', rating: 5, text: 'Super recomendo!', relativeTime: 'Avaliação publicada no Google' },
    { id: 'google-manoel', author: 'Manoel Germano', rating: 5, text: 'Localização de fácil acesso, profissionais competentes e ótimo atendimento.', relativeTime: 'Avaliação publicada no Google' },
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return res.status(200).json({ ...FALLBACK, source: 'fallback' });

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=pt-BR`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri,displayName',
      },
    });
    if (!response.ok) throw new Error(`Google Places returned ${response.status}`);
    const place: any = await response.json();
    const reviews = (place.reviews || []).map((review: any, index: number) => ({
      id: review.name || `google-${index}`,
      author: review.authorAttribution?.displayName || 'Cliente Google',
      authorUrl: review.authorAttribution?.uri,
      avatarUrl: review.authorAttribution?.photoUri,
      rating: review.rating || 5,
      text: review.text?.text || review.originalText?.text || '',
      relativeTime: review.relativePublishTimeDescription || 'Avaliação do Google',
    })).filter((review: any) => review.text);

    return res.status(200).json({
      rating: place.rating || FALLBACK.rating,
      total: place.userRatingCount || FALLBACK.total,
      googleUrl: place.googleMapsUri || FALLBACK.googleUrl,
      reviews: reviews.length ? reviews : FALLBACK.reviews,
      source: 'google',
    });
  } catch (error) {
    console.error('Google reviews fetch failed:', error);
    return res.status(200).json({ ...FALLBACK, source: 'fallback' });
  }
}
