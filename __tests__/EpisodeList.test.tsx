import { render, screen } from '@testing-library/react';
import { EpisodeList } from '@/components/EpisodeList/EpisodeList';
import type { Episode } from '@/types/rickAndMorty';

const episodes: Episode[] = [
  { id: 1, name: 'Pilot', air_date: 'December 2, 2013', episode: 'S01E01' },
];

describe('EpisodeList', () => {
  it('shows an empty message when there are no episodes', () => {
    render(<EpisodeList title="Test section" episodes={[]} />);

    expect(screen.getByText(/No episodes/i)).toBeInTheDocument();
  });

  it('renders episode code, name and air date when episodes are present', () => {
    render(<EpisodeList title="Test section" episodes={episodes} />);

    expect(screen.getByText(/S01E01/)).toBeInTheDocument();
    expect(screen.getByText(/Pilot/)).toBeInTheDocument();
    expect(screen.getByText(/December 2, 2013/)).toBeInTheDocument();
  });

  it('shows the episode count next to the title', () => {
    render(<EpisodeList title="Test section" episodes={episodes} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
