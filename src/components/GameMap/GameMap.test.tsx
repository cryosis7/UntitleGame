import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithStore } from '../../utils/test-utils';
import { GameMap } from './GameMap';
import type { TileProps } from './Tile';
import * as reduxHooks from '../../redux/hooks';
import * as mapSlice from '../../redux/slices/mapSlice';
import { createTileModel } from '../../models/TileModel';

const map = [
  [createTileModel(), createTileModel(), createTileModel()],
  [createTileModel(), createTileModel(), createTileModel()],
  [createTileModel(), createTileModel(), createTileModel()],
];
const testTile = {
  id: 'test-id',
  properties: { walkable: false, color: 'black' },
};

vi.mock('./Tile', () => ({
  Tile: ({ position, updateTile }: TileProps) => (
    <div
      data-testid={`tile-${position.x}-${position.y}`}
      onClick={() =>
        updateTile(testTile)
      }
    >{`Tile: ${position.x}, ${position.y}`}</div>
  ),
}));

vi.mock('./Player', () => ({
  Player: () => <div data-testid='player'>Player</div>,
}));

describe('GameMap', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    mockDispatch.mockReset();
    vi.spyOn(reduxHooks, 'useDispatch').mockReturnValue(mockDispatch);
    vi.spyOn(mapSlice, 'initialiseMap').mockReturnValue({
      type: 'map/initialiseMap',
      payload: undefined,
    });
    vi.spyOn(mapSlice, 'setTile').mockReturnValue({
      type: 'map/setTile',
      payload: { tile: createTileModel(), position: { x: 0, y: 0 } },
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithStore(<GameMap />);
      expect(screen.getByTestId('player')).toBeInTheDocument();
    });

    it('renders the correct number of tiles', () => {
      renderWithStore(<GameMap />, {
        preloadedState: {
          map: {
            ...mapSlice.initialMapState,
            map,
          },
        },
      });

      expect(screen.getAllByTestId(/^tile-/)).toHaveLength(9);
    });
  });

  describe('Dispatching actions', () => {
    it('dispatches initialiseMap on mount', () => {
      renderWithStore(<GameMap />, {
        preloadedState: {
          map: {
            ...mapSlice.initialMapState,
            map: [],
          },
        },
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'map/initialiseMap',
        payload: undefined,
      });
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mapSlice.initialiseMap).toHaveBeenCalled();
    });

    it('dispatches setTile when the updateTile function is called', () => {
      vi.spyOn(mapSlice, 'setTile').mockReturnValue({
        type: 'map/setTile',
        payload: {
          tile: testTile,
          position: { x: 2, y: 0 },
        },
      });

      renderWithStore(<GameMap />, {
        preloadedState: {
          map: {
            ...mapSlice.initialMapState,
            map,
          },
        },
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'map/initialiseMap',
        payload: undefined,
      });
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      mockDispatch.mockClear();

      const tile = screen.getByTestId('tile-2-0');
      fireEvent.click(tile);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'map/setTile',
        payload: {
          tile: testTile,
          position: { x: 2, y: 0 },
        },
      });
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
  });
});
