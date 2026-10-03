import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GlassScene } from './GlassScene';

const css = readFileSync(join(__dirname, '..', 'glass.css'), 'utf8');

describe('Liquid Glass scene', () => {
  it('renders a decorative aurora hidden from screen readers, behind the content', () => {
    render(
      <GlassScene>
        <p>content</p>
      </GlassScene>,
    );
    expect(screen.getByTestId('glass-aurora')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('uses the Safari-prefixed backdrop filter so the glass works on iPhone', () => {
    expect(css).toMatch(/-webkit-backdrop-filter:\s*blur/);
    expect(css).toMatch(/[^-]backdrop-filter:\s*blur/);
  });

  it('respects reduced motion, reduced transparency and missing backdrop-filter support', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@media (prefers-reduced-transparency: reduce)');
    expect(css).toContain('@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))');
  });
});
