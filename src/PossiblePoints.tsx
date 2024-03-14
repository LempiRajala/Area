import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatedSprite, AppContext, Graphics, PixiComponent, SimpleMesh, useTick } from '@pixi/react';
import { Graphics as NativeGraphics } from "@pixi/graphics";
// import { MeshMaterial, Mesh } from '@pixi/mesh'
import { cellToWorld, drawSquare, minmax } from "./utils";
import { cellSize, possibleAnimationSpeed, possibleFrames, selectorAlpha } from "./const";
import { Point } from "./types";
import { createAlphaSquareTexture, getPossibleTexturesPack } from "./textures";
import { createPossibleGeometry, createPossibleShader } from "./shaders";

// const PossibleMesh = PixiComponent('PossibleMesh', {
//   create({ alpha, color, x, y }) {
//     const shader = createPossibleShader(
//       createAlphaSquareTexture(
//         color, 1, cellSize));
//     const geo = createPossibleGeometry(cellSize);
//     const mesh = new Mesh(geo, shader);
//     mesh.position.set(x, y);
//     mesh.shader.uniforms.alpha = alpha;

//     // let alpha = 0;
//     // let alphaDirection = +1;
//     // const timeForFrame = 1e3 / possibleFrames;
//     // const alphaChangeForFrame = selectorAlpha / possibleFrames;

//     //@ts-ignore
//     // this.interval = setInterval(() => {
//     //   alpha += alphaDirection * alphaChangeForFrame;

//     //   if(alpha > selectorAlpha || alpha < 0) {
//     //     alpha = minmax(0, alpha, selectorAlpha);
//     //     alphaDirection *= -1;
//     //   }

//     //   console.log(alpha);
//     //   if(mesh?.shader?.uniforms) {
//     //     mesh.shader.uniforms.alpha = alpha;
//     //   }
//     // }, timeForFrame);

//     return mesh;
//   },
//   // willUnmount() {
//     //@ts-ignore
//     // clearInterval(this.interval);
//   // },
//   applyProps(instance, oldProps, newProps) {
//     // ...
//     instance.shader.uniforms.alpha = newProps.alpha;
//     instance.position.set(...cellToWorld(newProps.x, newProps.y, cellSize));
//   }
// });

export default function Possible({
  points, color
}: {
  points: Array<Point>, color: number
}) {
  // const app = useContext(AppContext);
  // const [alpha, setAlpha] = useState(0);
  // const [alphaDirection, setAlphaDirection] = useState(1);

  // const alphaChangeForFrame = selectorAlpha / possibleFrames;

  // const handler = useCallback((delta: number) => {
  //   setAlpha(alpha => {
  //     const a = alpha + alphaDirection * alphaChangeForFrame * delta;
  //     if(a > selectorAlpha) {
  //       setAlphaDirection(-1);
  //       return selectorAlpha;
  //     } else if(a < 0) {
  //       setAlphaDirection(+1);
  //       return 0;
  //     } else {
  //       return a;
  //     }
  //   });
  // }, [alphaDirection]);

  // useEffect(() => {
  //   if(app) {
  //     app.ticker.add(handler);
  //     return () => void app.ticker.remove(handler);
  //   }
  // }, [app, handler]);

  // const draw = useCallback((g: NativeGraphics) => {
  //   g.clear();
  //   g.alpha = alpha;
  //   g.beginFill(color);
  //   points.forEach(p => drawSquare(g, p.x, p.y));
  //   g.endFill();
  // }, [color, alpha]);

  const draw = useCallback((g: NativeGraphics) => {
    g.clear();
    g.alpha = selectorAlpha;
    g.beginFill(color);
    points.forEach(p => drawSquare(g, p.x, p.y));
    g.endFill();
  }, [points, color]);

  return <Graphics draw={draw}/>

  // const pack = useMemo(() => getPossibleTexturesPack(color, cellSize), [color]);

  // return (
  //   <>
  //   {
  //     points.map(p => (
  //       <AnimatedSprite
  //         key={`${p.x}_${p.y}`} 
  //         x={p.x * cellSize}
  //         y={p.y * cellSize}
  //         textures={pack}
  //         isPlaying={true}
  //         initialFrame={0}
  //         animationSpeed={possibleAnimationSpeed}/>
  //     ))
  //   }
  //   </>
  // );

  // return (
  //   <>
  //   {
  //     points.map(({ x, y }, i) => (
  //       <PossibleMesh key={i} alpha={alpha} color={color} x={x} y={y}/>
  //     ))
  //   }
  //   </>
  // )
}