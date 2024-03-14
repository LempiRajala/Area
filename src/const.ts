import { GameOptions, UserOptions } from "./types";
import { TextStyle } from '@pixi/text'

export const maxScale = 10;
export const zoomFactor = 1.2;
export const minScale = 1;
export const initialScale = 1;
export const cellSize = 10;
export const lineWidth = 1;
export const rollTime = 1000;
export const maxDiceValue = 6; // 5 для кода ибо с нуля
export const maxGameFieldSide = 100;

export const selectorColor = 0xffffff;
export const selectorAlpha = 0.25;
export const possibleFrames = 60;
export const possibleAnimationSpeed = 1;
// export const possibleColor = 0xff90ff;
export const firstPlayerColor = 0xFF2016;
// export const firstPlayerColor = 0x3cb371;
export const secondPlayerColor = 0x27B05F;
// export const secondPlayerColor = 0xee82ee;

export const emptyPointMarker = 255;
export const collectorMarker = 254;

export const areaTextStyle = new TextStyle({
  // align: 'center',
  // fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
  fontSize: 50,
  // fontWeight: '400',
  fill: '#000',
  stroke: 'rgba(255,255,255,0.25)',
  strokeThickness: 1,
  letterSpacing: 2,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 3,
  dropShadowAngle: Math.PI / 4,
  dropShadowDistance: 3,
  // wordWrap: true,
  // wordWrapWidth: 440,
})

export const leftButton = 0;
export const rightButton = 2;

export const defaultGameOptions: GameOptions = {
  width: 15,
  height: 15,
  autoFill: true
}

export const defaultUserOptions: UserOptions = {
  fps: true
}

const playerNumber = (p: number) => p === 0 ? 'first' : 'second';
export const endReasons = {
  equalArea: () => 'the game ended in a draw',
  areaLarger: (player: number) => (
    'the area of the ' + playerNumber(0) +
    ' player is larger than the ' + playerNumber(player === 0 ? 1 : 0)),
  isSurrounded: (player: number) => (
    `the ${ playerNumber(player) } player is surrounded`),
  gaveUp: (player: number) => `the ${playerNumber(player)} player gave up`,
  choseDraw: () => 'the players agreed to a draw'
};