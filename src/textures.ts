import { Texture } from "@pixi/core";
import { create2DContext, hexToRGB, hexToRGBA } from "./utils";
import { cellSize, possibleFrames, selectorAlpha } from "./const";

const createTextureRectWithBorders = (
  color: number, width: number, height: number
) => {
  const ctx = create2DContext(width, height);
  ctx.fillStyle = hexToRGBA(color, 0.15);
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = hexToRGB(color);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.stroke();
  return Texture.from(ctx.canvas);
}

const createSurroundedTexture = (color: number, side: number) => {
  const ctx = create2DContext(side, side);
  // ctx.filter = 'blur(1px)';
  ctx.fillStyle = hexToRGBA(color, 0.15);
  ctx.fillRect(0, 0, side, side);
  ctx.strokeStyle = hexToRGB(color);
  ctx.lineWidth = side * 0.04;
  ctx.beginPath();
  const halfSide = side * 0.5;
  ctx.moveTo(side, 0);
  ctx.lineTo(0, side);
  ctx.moveTo(halfSide, 0);
  ctx.lineTo(0, halfSide);
  ctx.moveTo(side, halfSide);
  ctx.lineTo(halfSide, side);
  ctx.stroke();
  return Texture.from(ctx.canvas);
}

export const createAlphaSquareTexture = (color: number, alpha: number, side: number) => {
  const ctx = create2DContext(side, side);
  ctx.fillStyle = hexToRGBA(color, alpha);
  ctx.fillRect(0, 0, side, side);
  return Texture.from(ctx.canvas);
}

const areaTextures: Record<string, Texture> = {};
export const getAreaTexture = (
  color: number, width: number, height: number
) => {
  const key = [color, width, height].join('_');
  if(!areaTextures[key]) {
    areaTextures[key] = createTextureRectWithBorders(color, width, height);
  }

  return areaTextures[key];
}

const surroundedTextures: Record<string, Texture> = {};
export const getSurroundedTexture = (color: number, side: number) => {
  if(!surroundedTextures[color]) {
    surroundedTextures[color] = createSurroundedTexture(color, side);
  }

  return surroundedTextures[color];
}

const possibleTexturesPack: Record<string, Array<Texture>> = {};
export const getPossibleTexturesPack = (color: number, side: number) => {
  const key = [color, side].join('_');
  if(!possibleTexturesPack[key]) {
    const pack: Array<Texture> = [];
    for(let i = 0; i !== Math.floor(possibleFrames * 0.5); i++) {
      const alpha = selectorAlpha * (i / possibleFrames);
      pack.push(createAlphaSquareTexture(color, alpha, cellSize));
    }

    possibleTexturesPack[key] = pack.concat(pack.slice().reverse());
  }

  return possibleTexturesPack[key];
}