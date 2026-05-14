import { describe, it, expect } from 'vitest';

describe('Frontend Environment', () => {
  it('should have a working test environment', () => {
    expect(true).toBe(true);
  });

  it('should have access to JSDOM', () => {
    const element = document.createElement('div');
    element.innerHTML = 'Hello World';
    expect(element.innerHTML).toBe('Hello World');
  });
});
