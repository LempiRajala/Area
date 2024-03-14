import React from "react";
import { Sprite } from '@pixi/react';
import { cellSize } from "./const";
import { getSurroundedTexture } from "./textures";

export default function Surrounded({
  x, y, color
}: {
  x: number, y: number, color: number
}) {
  const factor = 8;
  const texture = getSurroundedTexture(color, cellSize * factor);
  return (
    <Sprite
      x={x * cellSize}
      y={y * cellSize}
      scale={1 / factor}
      width={cellSize}
      height={cellSize}
      texture={texture}/>
  )
}