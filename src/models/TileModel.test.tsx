import { createTileModel } from './TileModel';

describe('TileModel', () => {
  it('should create default TileModel', () => {
    const tile = createTileModel();
    expect(tile.id).toBeDefined();
    expect(tile.properties.color).toBe('black');
    expect(tile.properties.walkable).toBe(false);
  });

  it('should create a valid TileModel with custom properties', () => {
    const tile = createTileModel({ color: 'red', walkable: true });
    expect(tile.id).toBeDefined();
    expect(tile.properties.color).toBe('red');
    expect(tile.properties.walkable).toBe(true);
  });
});