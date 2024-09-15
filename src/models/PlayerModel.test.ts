import { createPlayerObject } from './PlayerModel';

describe('PlayerModel', () => {
  it('should create a player object with default properties', () => {
    const player = createPlayerObject();
    expect(player.id).toBeDefined();
    expect(player.properties.position).toEqual({ x: 0, y: 0 });
  });

  it('should create a player object with custom properties', () => {
    const player = createPlayerObject({ position: { x: 1, y: 2 } });
    expect(player.id).toBeDefined();
    expect(player.properties.position).toEqual({ x: 1, y: 2 });
  });
});
