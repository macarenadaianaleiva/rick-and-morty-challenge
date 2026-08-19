import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from '@/components/ErrorState/ErrorState';

describe('ErrorState', () => {
  it('renders the error message', () => {
    render(<ErrorState message="Something went wrong" onRetry={jest.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Something went wrong" onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
