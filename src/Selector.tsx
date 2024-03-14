import React, { useCallback } from "react";
import { Graphics } from '@pixi/react';
import { Graphics as NativeGraphics } from "@pixi/graphics";
import { cellToWorld, drawSquare } from "./utils";
import { cellSize, selectorAlpha, selectorColor } from "./const";
import { Point } from "./types";

export default function Selector({
  mouseCell, width, height
}: {
  mouseCell?: Point | null,
  width: number | null, height: number | null
}) {
  const draw = useCallback((g: NativeGraphics) => {
    g.clear();
    if(!mouseCell) {
      return;
    }

    g.alpha = selectorAlpha;
    g.beginFill(selectorColor);
    drawSquare(g, 0, 0);
    g.endFill();
  }, [width, height]);

  if(!mouseCell) {
    return null;
  } else {
    const [x, y] = cellToWorld(mouseCell.x, mouseCell.y, cellSize);
    return <Graphics x={x} y={y} draw={draw}/>
  }
}