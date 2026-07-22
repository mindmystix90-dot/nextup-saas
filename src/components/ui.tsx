import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-6 ${className}`}>{children}</div>;
}

export function StatCard({
  icon: Icon, label, value, color = 'text-primary',
}: { icon: React.ElementType; label: string; value: string | number; color?: string }) {
  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-secondary/50 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold font-display">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' }) {
  const classes: Record<string, string> = {
    default: 'badge-default', secondary: 'badge-secondary', success: 'badge-success',
    warning: 'badge-warning', danger: 'badge-danger', outline: 'badge-outline',
  };
  return <span className={`badge ${classes[variant]}`}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-secondary/50 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
    </div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-secondary border-t-primary`} />
    </div>
  );
}

export function Button({
  children, onClick, variant = 'primary', type = 'button', disabled, className = '',
}: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'outline' | 'danger'; type?: 'button' | 'submit'; disabled?: boolean; className?: string }) {
  const classes: Record<string, string> = {
    primary: 'btn-primary', secondary: 'btn-secondary', outline: 'btn-outline', danger: 'btn-danger',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${classes[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Input({
  label, type = 'text', value, onChange, placeholder, required,
}: { label?: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="input-field"
      />
    </div>
  );
}

export function Textarea({
  label, value, onChange, placeholder, rows = 4,
}: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className="input-field resize-none"
      />
    </div>
  );
}

export function Select({
  label, value, onChange, options,
}: { label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Modal({
  open, onClose, title, children, maxWidth = 'max-w-lg',
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={onClose}>
      <div className={`bg-card border border-border rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-slide-up`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold font-display">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
  const init = (name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold`}>
      {init}
    </div>
  );
}
