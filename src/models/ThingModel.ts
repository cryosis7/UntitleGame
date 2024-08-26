export class ThingModel {
  private moveable: boolean = true;
  private walkable: boolean = false;

  isWalkable = (): boolean => this.walkable;
}
