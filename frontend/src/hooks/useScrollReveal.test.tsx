import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollReveal } from './useScrollReveal';

let intersectionCallback: ((entries: Partial<IntersectionObserverEntry>[]) => void) | null = null;
const disconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
    intersectionCallback = callback;
  }
  observe = vi.fn();
  disconnect = disconnect;
  unobserve = vi.fn();
}

function TestComponent() {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="target">
      {isRevealed ? 'revealed' : 'hidden'}
    </div>
  );
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    intersectionCallback = null;
    disconnect.mockClear();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts hidden and reveals once the element intersects the viewport', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('target')).toHaveTextContent('hidden');

    act(() => {
      intersectionCallback?.([{ isIntersecting: true }]);
    });

    expect(screen.getByTestId('target')).toHaveTextContent('revealed');
    expect(disconnect).toHaveBeenCalled();
  });

  it('reveals immediately when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(<TestComponent />);

    expect(screen.getByTestId('target')).toHaveTextContent('revealed');
  });
});
