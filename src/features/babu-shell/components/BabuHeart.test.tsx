import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Mood } from '../constants';
import { BabuHeart } from './BabuHeart';

const NAMES: Record<Mood, string> = {
  happy: 'Baboo is happy',
  ok: 'Baboo is doing OK',
  tired: 'Baboo is a little tired',
  rest: 'Baboo is in Rest Mode, sleeping',
};

describe('BabuHeart', () => {
  it.each(Object.entries(NAMES) as [Mood, string][])('names the %s mood for screen readers', (mood, name) => {
    render(<BabuHeart mood={mood} />);
    expect(screen.getByRole('img', { name })).toHaveAttribute('data-mood', mood);
  });

  it('draws mood extras: shake lines when happy, sweat when tired, Z when resting', () => {
    const part = (container: HTMLElement, name: string) => container.querySelector(`[data-part="${name}"]`);

    const happy = render(<BabuHeart mood="happy" />).container;
    expect(part(happy, 'shake-lines')).not.toBeNull();
    expect(part(happy, 'sleeping-z')).toBeNull();

    const tired = render(<BabuHeart mood="tired" />).container;
    expect(part(tired, 'sweat')).not.toBeNull();
    expect(part(tired, 'shake-lines')).toBeNull();

    const rest = render(<BabuHeart mood="rest" />).container;
    expect(part(rest, 'sleeping-z')).not.toBeNull();
    expect(part(rest, 'face')).toHaveAttribute('data-eyes', 'closed');
  });

  it('beats faster when happy and breathes slowly in Rest Mode', () => {
    const beat = (mood: Mood) =>
      (render(<BabuHeart mood={mood} />).container.querySelector('.babu-beat') as SVGGElement).style;
    expect(beat('happy').animationDuration).toBe('0.8s');
    expect(beat('rest').animationName).toBe('babu-snooze');
  });

  it('keeps clip-path ids unique when two Baboos are on screen', () => {
    const { container } = render(
      <>
        <BabuHeart mood="happy" />
        <BabuHeart mood="happy" />
      </>,
    );
    const ids = [...container.querySelectorAll('clipPath')].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
