import type { ReactNode } from 'react';
import '../glass.css';

/**
 * Liquid Glass backdrop for the Home tab: a soft pink-teal-lilac aurora that
 * drifts slowly behind translucent glass surfaces. Decorative only.
 */
export function GlassScene({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`lg-scene ${className}`}>
      <div aria-hidden="true" className="lg-aurora" data-testid="glass-aurora">
        <span className="lg-blob lg-blob--pink" />
        <span className="lg-blob lg-blob--teal" />
        <span className="lg-blob lg-blob--lilac" />
      </div>
      {children}
    </div>
  );
}
