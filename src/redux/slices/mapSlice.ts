import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TileModel } from '../../models/TileModel';

export interface MapState {
  settings: {
    mapSize: number;
    tileSize: number;
    tilesPerRow: number;
  };
  map: TileModel[];
}

const initialState: MapState = {
  settings: {
    mapSize: 500,
    tileSize: 50,
    tilesPerRow: 10,
  },
  map: [],
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: (create) => ({
    // setMapSettings: create.reducer(
    //   (
    //     state,
    //     { payload }: PayloadAction<{ mapSize: number; tilesPerRow: number }>,
    //   ) => {
    //     state.settings.mapSize = payload.mapSize;
    //     state.settings.tilesPerRow = payload.tilesPerRow;
    //     state.settings.tileSize = payload.mapSize / payload.tilesPerRow;
    //   },
    // ),
    // setMap: create.reducer((state, { payload }: PayloadAction<TileModel[]>) => {
    //   state.map = payload;
    // }),
    setTile: create.reducer(
      (
        state,
        { payload }: PayloadAction<{ tile: TileModel; index: number }>,
      ) => {
        if (payload.index < 0 || payload.index > state.map.length) {
          console.error(
            'Index out of bounds - tried to set Maps index of ' + payload.index,
          );
          return;
        }
        state.map[payload.index] = payload.tile;
      },
    ),
    initialiseMap: create.reducer((state, { payload }: PayloadAction) => {
      state.map = Array(
        state.settings.tilesPerRow * state.settings.tilesPerRow,
      ).fill(new TileModel());
    }),
  }),
  selectors: {
    getTileSize: (mapState) => mapState.settings.tileSize,
    getTilesPerRow: (mapState) => mapState.settings.tilesPerRow,
    getMap: (mapState) => mapState.map,
  },
});

export const { initialiseMap, setTile } = mapSlice.actions;

export const { getTileSize, getTilesPerRow, getMap } = mapSlice.selectors;
