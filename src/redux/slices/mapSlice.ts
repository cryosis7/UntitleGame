import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { TileModel } from '../../models/TileModel';
import type { Position } from '../../utils/mapUtils';
import { initMap, isPositionInMap } from '../../utils/mapUtils';
import type { PlayerModel } from '../../models/PlayerModel';
import { createPlayerObject } from '../../models/PlayerModel';

export interface MapState {
  settings: {
    mapSize: number;
    tileSize: number;
    tilesPerRow: number;
  };
  map: TileModel[][];
  player: PlayerModel;
}

export const initialMapState: MapState = {
  settings: {
    mapSize: 500,
    tileSize: 50,
    tilesPerRow: 10,
  },
  map: [],
  player: createPlayerObject(),
};

export const mapSlice = createSlice({
  name: 'map',
  initialState: initialMapState,
  reducers: (create) => ({
    setTile: create.reducer(
      (
        state,
        { payload }: PayloadAction<{ tile: TileModel; position: Position }>,
      ) => {
        const { position, tile } = payload;
        if (!isPositionInMap(state.map, payload.position)) {
          console.error(
            `Position out of bounds - tried to set Maps position of (${position.x}, ${position.y})`,
          );
          return;
        }
        state.map[position.y][position.x] = tile;
      },
    ),
    initialiseMap: create.reducer((state) => {
      state.map = initMap(
        state.settings.tilesPerRow,
        state.settings.tilesPerRow,
      );
    }),
    setPlayerPosition: create.reducer(
      (state, { payload }: PayloadAction<Position>) => {
        if (state.player) {
          state.player.properties.position = payload;
        }
      },
    ),
    setPlayer: create.reducer(
      (state, { payload }: PayloadAction<PlayerModel>) => {
        state.player = payload;
      },
    ),
  }),
  selectors: {
    getTileSize: (mapState) => mapState.settings.tileSize,
    getTilesPerRow: (mapState) => mapState.settings.tilesPerRow,
    getMap: (mapState) => mapState.map,
    getPlayer: (mapState) => mapState.player,
  },
});

export const { initialiseMap, setTile, setPlayerPosition, setPlayer } =
  mapSlice.actions;

export const { getTileSize, getTilesPerRow, getMap, getPlayer } =
  mapSlice.selectors;
