import React from 'react';

export const Button = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
      {children}
    </button>
  );
};

export const Card = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>((props, ref) => {
  const { children, className = '' } = props;
  return (
    <div ref={ref} className={`p-4 bg-gray-100 rounded shadow-md ${className}`}>{children}</div>
  );
});

Card.displayName = 'Card';
