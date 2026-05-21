import React from 'react';

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
};

export const Button = ({
  onClick,
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
}: ButtonProps) => (
  <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant} ${className}`}>
    {children}
  </button>
);

export const Card = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; id?: string }>(
  ({ children, className = '', id }, ref) => (
    <div ref={ref} id={id} className={`card ${className}`}>
      {children}
    </div>
  ),
);

Card.displayName = 'Card';

export const Stat = ({ label, value, tone = '' }: { label: string; value: string | number; tone?: string }) => (
  <div className={`stat ${tone}`}>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);

export const PageHeader = ({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) => (
  <section className="page-header">
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    {children && <p className="lede">{children}</p>}
  </section>
);
