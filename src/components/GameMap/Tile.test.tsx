import { renderWithStore } from '../../utils/test-utils';
import { Tile } from './Tile';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { TileModel } from '../../models/TileModel';
import { initialMapState } from '../../redux/slices/mapSlice';

describe('Tile Component', () => {
  const mockTile: TileModel = {
    id: '1',
    properties: {
      walkable: true,
      color: 'black',
    },
  };

  const mockUpdateTile = vi.fn();

  it('renders correctly with given props', () => {
    renderWithStore(
      <Tile
        tile={mockTile}
        updateTile={mockUpdateTile}
        position={{ x: 0, y: 0 }}
      />,
      {
        preloadedState: {
          map: {
            ...initialMapState,
            settings: { tileSize: 10, mapSize: 100, tilesPerRow: 10 },
          },
        },
      },
    );

    const tileElement = screen.getByRole('button');
    expect(tileElement).toBeInTheDocument();
    expect(tileElement).toHaveClass('walkable');
    expect(tileElement).toHaveStyle({ width: '10px', height: '10px' });
  });

  it('calls updateTile with correct arguments when clicked', async () => {
    renderWithStore(
      <Tile
        tile={mockTile}
        updateTile={mockUpdateTile}
        position={{ x: 0, y: 0 }}
      />,
    );

    const tileElement = screen.getByRole('button');
    await userEvent.click(tileElement);

    expect(mockUpdateTile).toHaveBeenCalledWith({
      ...mockTile,
      properties: {
        ...mockTile.properties,
        walkable: !mockTile.properties.walkable,
      },
    });
  });
});
