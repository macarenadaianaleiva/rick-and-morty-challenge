import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ComparisonToolbar } from '@/components/ComparisonToolbar/ComparisonToolbar';

describe('ComparisonToolbar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows an updating indicator only while isFetching is true', () => {
    const { rerender } = render(<ComparisonToolbar onClear={jest.fn()} isFetching />);
    expect(screen.getByLabelText('Updating comparison')).toBeInTheDocument();

    rerender(<ComparisonToolbar onClear={jest.fn()} isFetching={false} />);
    expect(screen.queryByLabelText('Updating comparison')).not.toBeInTheDocument();
  });

  it('copies the current URL and confirms it, then reverts after a moment', async () => {
    const writeText = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    render(<ComparisonToolbar onClear={jest.fn()} />);

    fireEvent.click(screen.getByTestId('share-comparison-button'));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() => {
      expect(screen.getByTestId('share-comparison-button')).toHaveTextContent('Copied!');
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(screen.getByTestId('share-comparison-button')).toHaveTextContent('Share comparison');
    });
  });

  it('shows a failure message when the clipboard write is rejected', async () => {
    jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

    render(<ComparisonToolbar onClear={jest.fn()} />);

    fireEvent.click(screen.getByTestId('share-comparison-button'));

    await waitFor(() => {
      expect(screen.getByTestId('share-comparison-button')).toHaveTextContent("Couldn't copy");
    });
  });

  it('calls onClear when "Clear selection" is clicked', () => {
    const onClear = jest.fn();
    render(<ComparisonToolbar onClear={onClear} />);

    fireEvent.click(screen.getByTestId('clear-selection-button'));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
