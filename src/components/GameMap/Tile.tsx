import type React from "react";
import "./Tile.scss";
import { useAppSelector } from "../../redux/hooks";
import { getTileSize } from "../../redux/slices/mapSlice";

interface TileProps {
  index: number,
  walkable: boolean,
  contents?: React.ReactNode,
}

export const Tile: React.FC<TileProps> = ({ index, walkable, contents }) => {
  const tileSize = useAppSelector(getTileSize);

  return <div
    className={`${walkable ? "" : "not-"}walkable`}
    style={{
      width: `${tileSize}px`,
      height: `${tileSize}px`
    }}>{index}</div>;
};