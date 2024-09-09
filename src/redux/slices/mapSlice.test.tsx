import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { mapSlice, initialiseMap, setTile } from './mapSlice';
import type { TileModel, Position } from '../../models/TileModel';
import { createTileModel } from '../../models/TileModel';

describe('mapSlice', () => {
  const store = configureStore({ reducer: { map: mapSlice.reducer } });

  describe('initialiseMap', () => {
    it('should initialize the map with the correct number of tiles', () => {
      store.dispatch(initialiseMap());
      const state = store.getState().map;
      const { tilesPerRow } = state.settings;
      expect(state.map.length).toBe(tilesPerRow);
      state.map.forEach(row => {
        expect(row.length).toBe(tilesPerRow);
      });
    });

    it('should initialize each tile with the correct properties', () => {
      store.dispatch(initialiseMap());
      const state = store.getState().map;
      state.map.forEach((row, y) => {
        row.forEach((tile, x) => {
          expect(tile.properties.position).toEqual({ x, y });
          expect(tile.properties.walkable).toBe(true);
        });
      });
    });
  });

  describe('setTile', () => {
    it('should set the tile at the specified position', () => {
      store.dispatch(initialiseMap());
      const newTile: TileModel = createTileModel({ position: { x: 1, y: 1 }, color: 'red', walkable: false });
      const position: Position = { x: 1, y: 1 };
      store.dispatch(setTile({ tile: newTile, position }));
      const state = store.getState().map;
      expect(state.map[1][1]).toEqual(newTile);
    });

    it('should not set the tile if the position is out of bounds', () => {
      store.dispatch(initialiseMap());
      const newTile: TileModel = createTileModel({ position: { x: 10, y: 10 }, color: 'red', walkable: false });
      const position: Position = { x: 10, y: 10 };
      store.dispatch(setTile({ tile: newTile, position }));
      const state = store.getState().map;
      expect(state.map[10]).toBeUndefined();
    });
  });
});
