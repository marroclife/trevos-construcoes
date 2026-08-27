import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({ className = '', iconOnly = false, variant = 'dark' }: LogoProps) {
  // Logo SVG da Trevo — versões otimizadas por fundo
  const src = variant === 'light'
    ? '/logo-trevo-light.svg'
    : '/logo-trevo-dark.svg';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {iconOnly ? (
        <img
          src="/logo-trevo.svg"
          alt="Trevos Comércio, Serviços e Empreendimentos"
          className="h-12 w-auto object-contain"
        />
      ) : (
        <img
          src={src}
          alt="Trevos Comércio, Serviços e Empreendimentos"
          className="h-14 w-auto object-contain"
        />
      )}
    </div>
  );
}
