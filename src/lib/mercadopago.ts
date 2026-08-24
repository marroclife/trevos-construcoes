const publicKey = (import.meta.env as any).VITE_MERCADO_PAGO_PUBLIC_KEY || '';

export function loadMercadoPagoSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    const existing = document.getElementById('mercadopago-sdk') as HTMLScriptElement;
    if (existing && (window as any).MercadoPago) {
      resolve();
      return;
    }
    if (!publicKey) {
      reject(new Error('Mercado Pago public key not configured'));
      return;
    }
    const script = document.createElement('script');
    script.id = 'mercadopago-sdk';
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Mercado Pago SDK'));
    document.body.appendChild(script);
  });
}

export function initMercadoPagoCardForm(
  containerId: string,
  preferenceId: string,
  onSuccess?: () => void,
  onError?: (err: any) => void
): any {
  if (!publicKey || !(window as any).MercadoPago) return null;
  const mp = new (window as any).MercadoPago(publicKey, { locale: 'pt-BR' });
  const form = mp.cardForm({
    amount: '0',
    autoMount: true,
    form: {
      id: containerId,
      cardholderName: { id: 'cardholderName', placeholder: 'Nome como no cartão' },
      cardholderEmail: { id: 'cardholderEmail', placeholder: 'E-mail' },
      cardNumber: { id: 'cardNumber', placeholder: 'Número do cartão' },
      cardExpirationMonth: { id: 'cardExpirationMonth', placeholder: 'MM' },
      cardExpirationYear: { id: 'cardExpirationYear', placeholder: 'AA' },
      securityCode: { id: 'securityCode', placeholder: 'CVV' },
      installments: { id: 'installments', placeholder: 'Parcelas' },
      issuer: { id: 'issuer', placeholder: 'Bandeira' },
      identificationType: { id: 'identificationType', placeholder: 'Tipo' },
      identificationNumber: { id: 'identificationNumber', placeholder: 'Número' },
    },
    callbacks: {
      onFormMounted: (error: any) => {
        if (error && onError) onError(error);
      },
      onSubmit: async (event: any) => {
        event.preventDefault();
        const data = mp.cardForm({ amount: '0', autoMount: false });
        if (onSuccess) onSuccess();
        return Promise.resolve();
      },
      onFetching: (resource: string) => {
        return () => {};
      },
    },
  });
  return form;
}

export function openMercadoPagoCheckout(preferenceId: string) {
  if (!publicKey || !(window as any).MercadoPago) {
    throw new Error('Mercado Pago SDK not loaded');
  }
  const mp = new (window as any).MercadoPago(publicKey, { locale: 'pt-BR' });
  mp.checkout({
    preference: { id: preferenceId },
    autoOpen: true,
  });
}
