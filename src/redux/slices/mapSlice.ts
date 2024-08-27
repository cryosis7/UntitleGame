import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  GroundModel,
  groundModelCreator,
} from '../../models/physical/GroundModel';

export interface MapState {
  settings: {
    mapSize: number;
    tileSize: number;
    tilesPerRow: number;
  };
  map: GroundModel[];
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
    setTile: create.reducer(
      (
        state,
        { payload }: PayloadAction<{ tile: GroundModel; index: number }>,
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
    initialiseMap: create.reducer((state) => {
      state.map = Array(
        state.settings.tilesPerRow * state.settings.tilesPerRow,
      ).fill(groundModelCreator());
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
