import { render, screen, fireEvent } from '@testing-library/react';
import { StatusFilter } from '@/components/StatusFilter/StatusFilter';

describe('StatusFilter', () => {
  it('opens the listbox, selects an option, and calls onChange', () => {
    const onChange = jest.fn();
    render(<StatusFilter value="" onChange={onChange} label="Filter by status" />);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('character-status-filter'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'Alive' }));

    expect(onChange).toHaveBeenCalledWith('alive');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape without changing the selection', () => {
    const onChange = jest.fn();
    render(<StatusFilter value="" onChange={onChange} label="Filter by status" />);

    fireEvent.click(screen.getByTestId('character-status-filter'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes when clicking outside', () => {
    render(
      <div>
        <StatusFilter value="" onChange={jest.fn()} label="Filter by status" />
        <button type="button">outside</button>
      </div>,
    );

    fireEvent.click(screen.getByTestId('character-status-filter'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText('outside'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows the current selection with its status dot', () => {
    render(<StatusFilter value="dead" onChange={jest.fn()} label="Filter by status" />);

    expect(screen.getByTestId('character-status-filter')).toHaveTextContent('Dead');
  });
});
