import { renderWithStore } from '../../utils/test-utils';
import { Player } from './Player';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { initialMapState, setPlayer } from '../../redux/slices/mapSlice';
import { createTileModel } from '../../models/TileModel';
import * as hooks from '../../redux/hooks';
import * as mapUtils from '../../utils/mapUtils';
import userEvent from '@testing-library/user-event';

describe('Player Component', () => {
  const mockPlayer = {
    id: 'player1',
    properties: {
      position: { x: 0, y: 0 },
    },
  };

  const mockMap = [
    [createTileModel(), createTileModel()],
    [createTileModel({ walkable: false }), createTileModel({ color: 'green' })],
  ];

  const mockDispatch = vi.fn();
  const mockCanMoveInDirection = vi.fn();
  const mockMovePlayer = vi.fn();

  beforeEach(() => {
    mockDispatch.mockReset();
    vi.spyOn(hooks, 'useDispatch').mockReturnValue(mockDispatch);
    vi.spyOn(mapUtils, 'canMoveInDirection').mockImplementation(
      mockCanMoveInDirection,
    );
    vi.spyOn(mapUtils, 'movePlayer').mockImplementation(mockMovePlayer);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with given props', () => {
      renderWithStore(<Player />, {
        preloadedState: {
          map: {
            map: mockMap,
            player: mockPlayer,
            settings: { ...initialMapState.settings, tileSize: 32 },
          },
        },
      });

      const playerElement = screen.getByLabelText('player');
      expect(playerElement).toBeInTheDocument();
      expect(playerElement).toHaveStyle({
        top: '0px',
        left: '0px',
        width: '32px',
        height: '32px',
      });
    });
  });

  describe('Movement', () => {
    it.each`
      key             | direction  | initialPosition   | expectedPosition
      ${'w'}          | ${'up'}    | ${{ x: 0, y: 1 }} | ${{ x: 0, y: 0 }}
      ${'s'}          | ${'down'}  | ${{ x: 0, y: 0 }} | ${{ x: 0, y: 1 }}
      ${'a'}          | ${'left'}  | ${{ x: 1, y: 0 }} | ${{ x: 0, y: 0 }}
      ${'d'}          | ${'right'} | ${{ x: 0, y: 0 }} | ${{ x: 1, y: 0 }}
      ${'ArrowUp'}    | ${'up'}    | ${{ x: 0, y: 1 }} | ${{ x: 0, y: 0 }}
      ${'ArrowDown'}  | ${'down'}  | ${{ x: 0, y: 0 }} | ${{ x: 0, y: 1 }}
      ${'ArrowLeft'}  | ${'left'}  | ${{ x: 1, y: 0 }} | ${{ x: 0, y: 0 }}
      ${'ArrowRight'} | ${'right'} | ${{ x: 0, y: 0 }} | ${{ x: 1, y: 0 }}
    `(
      'moves player $direction when "$key" is pressed and movement is allowed',
      async ({ key, initialPosition, expectedPosition }) => {
        const user = userEvent.setup();

        mockCanMoveInDirection.mockReturnValue(true);
        mockMovePlayer.mockReturnValue({
          ...mockPlayer,
          properties: {
            ...mockPlayer.properties,
            position: expectedPosition,
          },
        });

        renderWithStore(<Player />, {
          preloadedState: {
            map: {
              map: mockMap,
              player: {
                ...mockPlayer,
                properties: {
                  ...mockPlayer.properties,
                  position: initialPosition,
                },
              },
              settings: { ...initialMapState.settings, tileSize: 32 },
            },
          },
        });

        await user.keyboard(`{${key}}`);

        expect(mockDispatch).toHaveBeenCalledWith(
          setPlayer({
            ...mockPlayer,
            properties: {
              ...mockPlayer.properties,
              position: expectedPosition,
            },
          }),
        );
      },
    );

    it.each`
      key             | direction
      ${'w'}          | ${'up'}
      ${'s'}          | ${'down'}
      ${'a'}          | ${'left'}
      ${'d'}          | ${'right'}
      ${'ArrowUp'}    | ${'up'}
      ${'ArrowDown'}  | ${'down'}
      ${'ArrowLeft'}  | ${'left'}
      ${'ArrowRight'} | ${'right'}
    `(
      'does not call setPlayer when key "$key" is pressed and movement is blocked',
      async ({ key, direction }) => {
        const user = userEvent.setup();

        mockCanMoveInDirection.mockReturnValue(false);

        renderWithStore(<Player />, {
          preloadedState: {
            map: {
              map: mockMap,
              player: mockPlayer,
              settings: { ...initialMapState.settings, tileSize: 32 },
            },
          },
        });

        await user.keyboard(`{${key}}`);

        expect(mockDispatch).not.toHaveBeenCalled();
      },
    );

    it('does not call setPlayer when a different key is pressed', async () => {
      const user = userEvent.setup();

      renderWithStore(<Player />, {
        preloadedState: {
          map: {
            map: mockMap,
            player: mockPlayer,
            settings: { ...initialMapState.settings, tileSize: 32 },
          },
        },
      });

      await user.keyboard('{e}');

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not call setPlayer when a key is released', async () => {
      const user = userEvent.setup();

      renderWithStore(<Player />, {
        preloadedState: {
          map: {
            map: mockMap,
            player: mockPlayer,
            settings: { ...initialMapState.settings, tileSize: 32 },
          },
        },
      });

      await user.keyboard('{w/}');

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
