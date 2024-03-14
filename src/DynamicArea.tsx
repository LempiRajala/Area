import React, { useCallback, useMemo } from "react";
import { Graphics } from '@pixi/react';
import { Graphics as NativeGraphics } from "@pixi/graphics";
import { cellToWorld, drawArea } from "./utils";
import { cellSize, selectorAlpha } from "./const";
import { Point } from "./types";

export default function DynamicArea({
  topLeft, bottomRight, color
}:{
  topLeft: Point, bottomRight: Point,
  color: number
}) {
  const width  = useMemo(() => bottomRight.x - topLeft.x, [bottomRight, topLeft]);
  const height = useMemo(() => bottomRight.y - topLeft.y, [bottomRight, topLeft]);

  const draw = useCallback((g: NativeGraphics) => {
    g.clear();
    g.alpha = selectorAlpha;
    g.beginFill(color);
    drawArea(g, 0, 0, width, height);
    g.endFill();
  }, [width, height, color]);

  const [x, y] = cellToWorld(topLeft.x, topLeft.y, cellSize);
  return (
    <Graphics x={x} y={y} draw={draw}></Graphics>
  )
}