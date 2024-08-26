import type { ThingModel } from "./ThingModel";

export class TileModel {
  private walkable: boolean;
  private contents: ThingModel | null;
  
  constructor(walkable = true, contents = null) {
    this.walkable = walkable;
    this.contents = contents;
  }
  
  isWalkable = (): boolean => {
    if (this.contents === null) {
      return this.walkable;
    }
    
    return this.walkable && this.contents.isWalkable();
  }
}