import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('toggles the dark class on <html> and persists the choice', async () => {
    render(<ThemeToggle />);
    const button = screen.getByTestId('theme-toggle');

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    });

    fireEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');

    fireEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
  });
});
