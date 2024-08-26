import { BaseThing } from "../models/physical/BaseThing";
import { GroundModel } from "../models/physical/GroundModel";

export const isGroundModel = (item: BaseThing): item is GroundModel => {
  return (item as GroundModel).contents !== undefined;
}

export const isWalkable = (item: BaseThing) => {
  if (isGroundModel(item) && item.contents) {
    return item.walkable && item.contents.walkable;
  }
  return item.walkable;
}