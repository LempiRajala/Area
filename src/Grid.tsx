import React, { useCallback } from "react";
import { Graphics as NativeGraphics } from "@pixi/graphics";
import { Graphics } from '@pixi/react';
import { lineWidth } from "./const";

const halfLineWidth = lineWidth * 0.5;
const thinLine = lineWidth * 0.25;
const thickLine = lineWidth * 0.75;

export default function Grid({
  width, height, color, cellWidth
}: {
  width: number, height: number,
  cellWidth: number, color: number
}) {
  const draw = useCallback((g: NativeGraphics) => {
    g.clear();

    g.lineStyle(thinLine, color);
    for(let y = 0; y <= height; y++) {
      if(y % 5 !== 0) {
        g.moveTo(-halfLineWidth, y * cellWidth);
        g.lineTo(width * cellWidth + halfLineWidth, y * cellWidth);
      }
    }

    for(let x = 0; x <= width; x++) {
      if(x % 5 !== 0) {
        g.moveTo(x * cellWidth, 0);
        g.lineTo(x * cellWidth, height * cellWidth);
      }
    }
    
    g.lineStyle(thickLine, color);
    for(let y = 0; y <= height; y+=5) {
      g.moveTo(-halfLineWidth, y * cellWidth);
      g.lineTo(width * cellWidth + halfLineWidth, y * cellWidth);
    }

    for(let x = 0; x <= width; x+=5) {
      g.moveTo(x * cellWidth, 0);
      g.lineTo(x * cellWidth, height * cellWidth);
    }

    g.endFill();
  }, [width, height, color, cellWidth]);
  
  return (
    <Graphics draw={draw}/>
  )
}