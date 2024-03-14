import React from "react";
import { Sprite, Text } from '@pixi/react';
import { Painted } from "./types";
import { getAreaTexture } from "./textures";
import { areaTextStyle, cellSize, firstPlayerColor, secondPlayerColor } from "./const";

export default function Area({
  painted
}: {
  painted: Painted
}) {
  const { x1, y1, x2, y2, user} = painted;
  const width  = x2 - x1;
  const height = y2 - y1;
  const color = user === 0 ? firstPlayerColor : secondPlayerColor;

  // const draw = useCallback((g: NativeGraphics) => {
  //   g.clear();
  //   g.beginFill(color);
  //   drawArea(g, x1, y1, x2, y2);
  //   g.endFill();
  // }, [painted]);

  const x1Scaled = x1 * cellSize;
  const y1Scaled = y1 * cellSize;
  const widthScaled  = (width  + 1) * cellSize;
  const heightScaled = (height + 1) * cellSize;

  const texture = getAreaTexture(color, widthScaled, heightScaled);
  return (
    <>
      <Sprite
        x={x1Scaled}
        y={y1Scaled}
        width={widthScaled}
        height={heightScaled}
        texture={texture}/>
      {/* <Graphics draw={draw}/> */}
      <Text
        scale={0.125}
        x={x1Scaled + 0.5 * (widthScaled - cellSize)}
        // + 0.15 для выравнивания текста
        y={y1Scaled + 0.5 * (heightScaled - cellSize) + 0.15 * cellSize}
        text={`${width + 1}/${height + 1}`}
        style={areaTextStyle}/>
    </>
  )
}