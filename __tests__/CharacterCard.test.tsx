import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCard } from '@/components/CharacterCard/CharacterCard';
import type { Character } from '@/types/rickAndMorty';

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: ['https://rickandmortyapi.com/api/episode/1'],
};

describe('CharacterCard', () => {
  it('renders the character name, status and species', () => {
    render(<CharacterCard character={mockCharacter} selected={false} onSelect={jest.fn()} />);

    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText(/Alive - Human/)).toBeInTheDocument();
  });

  it('shows the zero-padded id, so same-named characters stay distinguishable', () => {
    render(<CharacterCard character={mockCharacter} selected={false} onSelect={jest.fn()} />);

    expect(screen.getByText('ID 001')).toBeInTheDocument();
  });

  it('calls onSelect with the character when clicked', () => {
    const onSelect = jest.fn();
    render(<CharacterCard character={mockCharacter} selected={false} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith(mockCharacter);
  });

  it('reflects the selected state via aria-pressed', () => {
    render(<CharacterCard character={mockCharacter} selected onSelect={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
